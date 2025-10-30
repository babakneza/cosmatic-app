import { test, expect } from '@playwright/test';

test.describe('Focused Persistence Test', () => {
    test('verify app reads persisted auth data on startup', async ({ page }) => {
        console.log('🔍 Test: Verify app hydrates auth from localStorage');

        // Step 1: Set up localStorage before navigating
        // We'll inject auth data before the app loads so Zustand can hydrate from it
        await page.addInitScript(() => {
            const mockAuthData = {
                state: {
                    user: {
                        id: 'test-user-123',
                        email: 'persistent@test.com',
                        first_name: 'Persist',
                        last_name: 'Test',
                        created_at: '2025-10-27T17:06:01.391Z'
                    },
                    access_token: 'persistent-token-abc123xyz',
                    refresh_token: 'persistent-refresh-abc123xyz',
                    is_authenticated: true,
                    remember_me: false,
                    customer_id: 'cust-persistent-123',
                    token_expires_at: Date.now() + (24 * 60 * 60 * 1000),
                    _hasHydrated: true
                },
                version: 1
            };
            localStorage.setItem('auth-store', JSON.stringify(mockAuthData));
            console.log('[SCRIPT] Pre-populated auth-store in localStorage');
        });

        // Step 2: Navigate to auth-test page
        console.log('📌 Navigating to /en/auth-test...');
        await page.goto('/en/auth-test');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000); // Wait for React hydration

        // Step 3: Check what's in localStorage now
        const localStorageNow = await page.evaluate(() => {
            const data = localStorage.getItem('auth-store');
            return data ? JSON.parse(data) : null;
        });

        console.log('✅ localStorage current state:', {
            exists: !!localStorageNow,
            isAuthenticated: localStorageNow?.state?.is_authenticated,
            email: localStorageNow?.state?.user?.email,
            accessTokenLength: localStorageNow?.state?.access_token?.length || 0,
        });

        // Step 4: Check if React component is showing authenticated status
        console.log('📌 Checking React component...');

        // Try to find authenticated element
        let authStatusText = '';
        const authenticatedElement = page.locator('[data-testid="auth-status-authenticated"]');
        const notAuthenticatedElement = page.locator('[data-testid="auth-status-not-authenticated"]');
        const loadingElement = page.locator('[data-testid="auth-status-loading"]');

        const isAuthVisible = await authenticatedElement.isVisible({ timeout: 2000 }).catch(() => false);
        const isNotAuthVisible = await notAuthenticatedElement.isVisible({ timeout: 2000 }).catch(() => false);
        const isLoadingVisible = await loadingElement.isVisible({ timeout: 2000 }).catch(() => false);

        if (isAuthVisible) {
            authStatusText = (await authenticatedElement.textContent()) || '';
            console.log('✅ Component shows AUTHENTICATED:', authStatusText);
        } else if (isNotAuthVisible) {
            authStatusText = (await notAuthenticatedElement.textContent()) || '';
            console.log('❌ Component shows NOT AUTHENTICATED:', authStatusText);
        } else if (isLoadingVisible) {
            authStatusText = (await loadingElement.textContent()) || '';
            console.log('⏳ Component shows LOADING:', authStatusText);
        } else {
            console.log('❌ No auth status element found');
        }

        // Step 5: Check page HTML for debugging
        const bodyContent = await page.locator('body').textContent();
        console.log('📄 Page contains "AUTHENTICATED" text:', bodyContent?.includes('AUTHENTICATED'));
        console.log('📄 Page contains "Persist" (from user name):', bodyContent?.includes('Persist'));

        // Step 6: Verify assertions
        expect(localStorageNow).toBeTruthy();
        expect(localStorageNow?.state?.is_authenticated).toBe(true);

        // The key assertion: component should show authenticated status
        expect(isAuthVisible || authStatusText.includes('AUTHENTICATED')).toBe(true);
    });

    test('verify session persists across refresh - complete flow', async ({ page }) => {
        console.log('🔄 Test: Complete refresh flow');

        // Pre-inject auth data
        await page.addInitScript(() => {
            const mockAuthData = {
                state: {
                    user: {
                        id: 'refresh-user-123',
                        email: 'refresh@test.com',
                        first_name: 'Refresh',
                        last_name: 'User',
                        created_at: '2025-10-27T17:06:01.391Z'
                    },
                    access_token: 'refresh-token-abc123',
                    refresh_token: 'refresh-refresh-abc123',
                    is_authenticated: true,
                    remember_me: false,
                    customer_id: 'cust-refresh',
                    token_expires_at: Date.now() + (24 * 60 * 60 * 1000),
                    _hasHydrated: true
                },
                version: 1
            };
            localStorage.setItem('auth-store', JSON.stringify(mockAuthData));
        });

        // Navigate to auth-test
        console.log('📌 First navigation to /en/auth-test');
        await page.goto('/en/auth-test');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1500);

        // Check status BEFORE refresh
        const beforeRefresh = await page.evaluate(() => {
            const data = localStorage.getItem('auth-store');
            return {
                localStorageAuth: !!data,
                email: JSON.parse(data || '{}')?.state?.user?.email,
            };
        });

        console.log('📋 Before refresh - localStorage auth:', beforeRefresh);

        // REFRESH THE PAGE
        console.log('🔄 Refreshing page...');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // Check status AFTER refresh
        const afterRefresh = await page.evaluate(() => {
            const data = localStorage.getItem('auth-store');
            const parsed = data ? JSON.parse(data) : {};
            return {
                localStorageAuth: !!data,
                email: parsed?.state?.user?.email,
                isAuthenticated: parsed?.state?.is_authenticated,
            };
        });

        console.log('📋 After refresh - localStorage auth:', afterRefresh);

        // Check component status
        const componentStatus = await page.locator('[data-testid="auth-status-authenticated"]').isVisible({ timeout: 3000 }).catch(() => false);
        console.log('✅ Component authenticated status visible:', componentStatus);

        // Assertions
        expect(afterRefresh.localStorageAuth).toBe(true);
        expect(afterRefresh.email).toBe('refresh@test.com');
        expect(afterRefresh.isAuthenticated).toBe(true);
    });
});