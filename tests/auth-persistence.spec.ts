import { test, expect } from '@playwright/test';

test.describe('Auth Persistence - Session Survives Page Refresh', () => {
    test('login session should persist after page refresh', async ({ page }) => {
        // Navigate to login page
        await page.goto('/en/auth/login');
        await page.waitForLoadState('networkidle');

        // Intercept the login API call to verify it's made
        await page.route('**/api/auth/login', async (route) => {
            await route.continue();
        });

        // Mock the login API response
        await page.route('**/api/auth/login', async (route) => {
            await route.abort('blockedbyexception');
        }, { times: 0 }); // Allow original request

        // Fill in login form
        const emailInput = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first();
        const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
        const submitButton = page.locator('button[type="submit"]').first();

        if (await emailInput.isVisible()) {
            await emailInput.fill('testme@testme.com');
        }
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('Test@1234');
        }

        // Intercept login response
        const loginPromise = page.waitForResponse(
            response => response.url().includes('login') && response.status() === 200
        );

        if (await submitButton.isVisible()) {
            await submitButton.click();
        }

        try {
            await loginPromise;
        } catch (e) {
            console.log('Login response not received as expected');
        }

        // Wait for navigation to complete
        await page.waitForTimeout(2000);

        // Check localStorage for auth data BEFORE refresh
        const localStorageBeforeRefresh = await page.evaluate(() => {
            const authData = localStorage.getItem('auth-store');
            return authData ? JSON.parse(authData) : null;
        });

        console.log('Auth data in localStorage BEFORE refresh:', {
            exists: !!localStorageBeforeRefresh,
            hasState: !!localStorageBeforeRefresh?.state,
            hasAccessToken: !!localStorageBeforeRefresh?.state?.access_token,
            isAuthenticated: localStorageBeforeRefresh?.state?.is_authenticated,
            _hasHydrated: localStorageBeforeRefresh?.state?._hasHydrated,
        });

        // **KEY TEST**: Refresh the page
        console.log('🔄 Refreshing page...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Check localStorage AFTER refresh
        const localStorageAfterRefresh = await page.evaluate(() => {
            const authData = localStorage.getItem('auth-store');
            return authData ? JSON.parse(authData) : null;
        });

        console.log('Auth data in localStorage AFTER refresh:', {
            exists: !!localStorageAfterRefresh,
            hasState: !!localStorageAfterRefresh?.state,
            hasAccessToken: !!localStorageAfterRefresh?.state?.access_token,
            isAuthenticated: localStorageAfterRefresh?.state?.is_authenticated,
            _hasHydrated: localStorageAfterRefresh?.state?._hasHydrated,
        });

        // Navigate to auth test page to check app state
        await page.goto('/en/auth-test');
        await page.waitForTimeout(1000);

        // Check the page content for authentication status
        const authStatusElement = page.locator('[data-testid="auth-status-authenticated"], [data-testid="auth-status-not-authenticated"]');

        if (await authStatusElement.isVisible()) {
            const statusText = await authStatusElement.textContent();
            console.log('Auth status on page after refresh:', statusText);
        }

        // Get the actual store state via JS evaluation
        const appState = await page.evaluate(() => {
            const useAuth = (window as any).__zustand_auth_store;
            if (useAuth) {
                const state = useAuth.getState?.();
                return {
                    is_authenticated: state?.is_authenticated,
                    hasAccessToken: !!state?.access_token,
                    user: state?.user?.email,
                    _hasHydrated: state?._hasHydrated,
                };
            }
            return { error: 'Store not accessible' };
        });

        console.log('App state after refresh:', appState);

        // VERIFY: User should still be authenticated after refresh
        expect(localStorageAfterRefresh).toBeTruthy();
        expect(localStorageAfterRefresh?.state?.access_token).toBeTruthy();
        expect(localStorageAfterRefresh?.state?.is_authenticated).toBe(true);
    });
});