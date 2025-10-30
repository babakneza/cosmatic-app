import { test, expect, type Page } from '@playwright/test';

const TEST_USER = {
    email: 'testme@testme.com',
    password: 'Bb7887055@Tt'
};

test.describe('Debug Auth Test', () => {
    test('debug auth flow', async ({ page }) => {
        console.log('Starting debug test...');

        // Navigate to login page
        await page.goto('/en/auth/login');
        console.log('Navigated to login page');

        await page.waitForLoadState('networkidle');
        console.log('Page loaded');

        // Take a screenshot to see what we're working with
        await page.screenshot({ path: 'debug-login-page.png' });

        // Check if forms exist
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="password"]');
        const submitButton = page.locator('button[type="submit"]');

        console.log('Email input exists:', await emailInput.count());
        console.log('Password input exists:', await passwordInput.count());
        console.log('Submit button exists:', await submitButton.count());

        if (await emailInput.count() === 0) {
            console.log('Email input not found, checking alternatives...');
            const allInputs = await page.locator('input').all();
            for (let i = 0; i < allInputs.length; i++) {
                const type = await allInputs[i].getAttribute('type');
                const name = await allInputs[i].getAttribute('name');
                console.log(`Input ${i}: type=${type}, name=${name}`);
            }
        }

        // Mock successful login
        await page.route('**/auth/login', (route) => {
            console.log('Login API call intercepted');
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: {
                        access_token: 'debug-access-token',
                        refresh_token: 'debug-refresh-token',
                        expires: Date.now() + 900000,
                        user: {
                            id: '1',
                            email: TEST_USER.email,
                            first_name: 'Test',
                            last_name: 'User'
                        }
                    }
                })
            });
        });

        // Try to fill form if inputs exist
        if (await emailInput.count() > 0) {
            await emailInput.fill(TEST_USER.email);
            await passwordInput.fill(TEST_USER.password);
            console.log('Form filled');

            await submitButton.click();
            console.log('Submit button clicked');

            // Wait and check for any navigation or state changes
            await page.waitForTimeout(3000);

            // Check localStorage
            const authData = await page.evaluate(() => {
                const authStore = localStorage.getItem('auth-store');
                console.log('localStorage auth-store length:', authStore?.length || 0);
                if (authStore) {
                    try {
                        const parsed = JSON.parse(authStore);
                        console.log('Parsed auth store:', {
                            hasState: !!parsed.state,
                            hasAccessToken: !!parsed.state?.access_token,
                            hasRefreshToken: !!parsed.state?.refresh_token,
                            isAuthenticated: parsed.state?.is_authenticated,
                            version: parsed.version
                        });
                        return parsed;
                    } catch (e) {
                        console.error('Failed to parse auth store:', e);
                        return null;
                    }
                }
                return null;
            });

            console.log('Auth data from localStorage:', authData);

            // Navigate to test page to see state
            await page.goto('/en/auth-test');
            await page.waitForLoadState('networkidle');

            await page.screenshot({ path: 'debug-auth-test-page.png' });

            // Check what's displayed using the test IDs
            const authenticatedElement = page.locator('[data-testid="auth-status-authenticated"]');
            const notAuthenticatedElement = page.locator('[data-testid="auth-status-not-authenticated"]');
            const loadingElement = page.locator('[data-testid="auth-status-loading"]');

            const isAuthenticatedVisible = await authenticatedElement.isVisible();
            const isNotAuthenticatedVisible = await notAuthenticatedElement.isVisible();
            const isLoadingVisible = await loadingElement.isVisible();

            console.log('Auth status check:');
            console.log('- Authenticated element visible:', isAuthenticatedVisible);
            console.log('- Not authenticated element visible:', isNotAuthenticatedVisible);
            console.log('- Loading element visible:', isLoadingVisible);

            if (isLoadingVisible) {
                console.log('- Loading text:', await loadingElement.textContent());

                // Wait for hydration to complete
                await page.waitForTimeout(2000);

                // Check again after hydration
                const isAuthenticatedVisibleAfter = await authenticatedElement.isVisible();
                const isNotAuthenticatedVisibleAfter = await notAuthenticatedElement.isVisible();
                const isLoadingVisibleAfter = await loadingElement.isVisible();

                console.log('After hydration wait:');
                console.log('- Authenticated element visible:', isAuthenticatedVisibleAfter);
                console.log('- Not authenticated element visible:', isNotAuthenticatedVisibleAfter);
                console.log('- Loading element visible:', isLoadingVisibleAfter);
            }

            if (isAuthenticatedVisible) {
                const authText = await authenticatedElement.textContent();
                console.log('- Authenticated text:', authText);
            }

            if (isNotAuthenticatedVisible) {
                const notAuthText = await notAuthenticatedElement.textContent();
                console.log('- Not authenticated text:', notAuthText);
            }
        }
    });
});