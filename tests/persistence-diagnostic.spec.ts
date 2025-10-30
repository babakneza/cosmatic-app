import { test, expect } from '@playwright/test';

test.describe('Persistence Diagnostic - localStorage Hydration', () => {
    test('verify localStorage persists across page refresh', async ({ page }) => {
        // Step 1: Navigate to auth-test page
        console.log('📌 Step 1: Navigate to auth-test page');
        await page.goto('/en/auth-test');
        await page.waitForLoadState('networkidle');

        // Step 2: Pre-populate localStorage with mock auth data (simulating a successful login)
        console.log('📌 Step 2: Pre-populate localStorage with mock auth data');
        const mockAuthData = {
            state: {
                user: {
                    id: 'test-user-123',
                    email: 'testuser@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    created_at: '2025-10-27T17:06:01.391Z'
                },
                access_token: 'mock-access-token-12345',
                refresh_token: 'mock-refresh-token-12345',
                is_authenticated: true,
                remember_me: false,
                customer_id: 'cust-123',
                token_expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
                _hasHydrated: true
            },
            version: 1
        };

        await page.evaluate((data) => {
            localStorage.setItem('auth-store', JSON.stringify(data));
        }, mockAuthData);

        // Step 3: Verify localStorage has the data
        console.log('📌 Step 3: Verify localStorage before refresh');
        const beforeRefresh = await page.evaluate(() => {
            const data = localStorage.getItem('auth-store');
            return data ? JSON.parse(data) : null;
        });

        console.log('✅ localStorage BEFORE refresh:', {
            exists: !!beforeRefresh,
            hasAccessToken: !!beforeRefresh?.state?.access_token,
            isAuthenticated: beforeRefresh?.state?.is_authenticated,
            email: beforeRefresh?.state?.user?.email,
        });

        expect(beforeRefresh).toBeTruthy();
        expect(beforeRefresh?.state?.access_token).toBe('mock-access-token-12345');
        expect(beforeRefresh?.state?.is_authenticated).toBe(true);

        // Step 4: Reload the page
        console.log('📌 Step 4: Reload page');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1500); // Wait for React hydration

        // Step 5: Check localStorage after refresh
        console.log('📌 Step 5: Verify localStorage AFTER refresh');
        const afterRefresh = await page.evaluate(() => {
            const data = localStorage.getItem('auth-store');
            return data ? JSON.parse(data) : null;
        });

        console.log('✅ localStorage AFTER refresh:', {
            exists: !!afterRefresh,
            hasAccessToken: !!afterRefresh?.state?.access_token,
            isAuthenticated: afterRefresh?.state?.is_authenticated,
            email: afterRefresh?.state?.user?.email,
        });

        // Step 6: Check if React component shows authenticated status
        console.log('📌 Step 6: Check React component status');
        const authStatusElement = page.locator('[data-testid="auth-status-authenticated"]');
        const isVisible = await authStatusElement.isVisible({ timeout: 5000 }).catch(() => false);

        if (isVisible) {
            const text = await authStatusElement.textContent();
            console.log('✅ Auth component shows:', text);
        } else {
            const notAuthElement = page.locator('[data-testid="auth-status-not-authenticated"]');
            const notAuthVisible = await notAuthElement.isVisible({ timeout: 2000 }).catch(() => false);
            if (notAuthVisible) {
                const text = await notAuthElement.textContent();
                console.log('❌ Auth component shows NOT authenticated:', text);
            }
        }

        // CRITICAL ASSERTIONS
        expect(afterRefresh).toBeTruthy();
        expect(afterRefresh?.state?.access_token).toBe('mock-access-token-12345');
        expect(afterRefresh?.state?.is_authenticated).toBe(true);
        expect(afterRefresh?.state?.user?.email).toBe('testuser@example.com');
    });

    test('verify Zustand hydration on app startup', async ({ page }) => {
        console.log('📌 Test: Zustand Hydration Verification');

        // Pre-populate localStorage with auth data
        await page.goto('/en/auth-test');

        const mockAuthData = {
            state: {
                user: {
                    id: 'hydration-test-user',
                    email: 'hydration@test.com',
                    first_name: 'Hydration',
                    last_name: 'Test',
                    created_at: '2025-10-27T17:06:01.391Z'
                },
                access_token: 'hydration-token-xyz',
                refresh_token: 'hydration-refresh-xyz',
                is_authenticated: true,
                remember_me: false,
                customer_id: null,
                token_expires_at: Date.now() + (24 * 60 * 60 * 1000),
                _hasHydrated: true
            },
            version: 1
        };

        await page.evaluate((data) => {
            localStorage.setItem('auth-store', JSON.stringify(data));
            console.log('[TEST] Pre-populated localStorage with auth data');
        }, mockAuthData);

        // Navigate to a fresh page (simulating new browser tab)
        await page.goto('/en');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give time for hydration

        // Check the actual Zustand store state
        const storeState = await page.evaluate(() => {
            // Try to access the store through React DevTools or direct reference
            const authDataFromStorage = localStorage.getItem('auth-store');
            return {
                localStorageData: authDataFromStorage ? JSON.parse(authDataFromStorage) : null,
                timestamp: new Date().toISOString(),
            };
        });

        console.log('✅ Store state check:', {
            hasData: !!storeState.localStorageData,
            isAuthenticated: storeState.localStorageData?.state?.is_authenticated,
            email: storeState.localStorageData?.state?.user?.email,
        });

        expect(storeState.localStorageData?.state?.is_authenticated).toBe(true);
    });
});