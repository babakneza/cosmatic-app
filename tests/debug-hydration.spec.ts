import { test, expect } from '@playwright/test';

test.describe('Debug Hydration Issue', () => {
    test('check debug page to see store state', async ({ page }) => {
        console.log('🔍 Checking debug page for store state...');

        // Pre-populate localStorage with auth data
        await page.addInitScript(() => {
            const mockAuthData = {
                state: {
                    user: {
                        id: 'debug-user-123',
                        email: 'debug@test.com',
                        first_name: 'Debug',
                        last_name: 'User',
                        created_at: '2025-10-27T17:06:01.391Z'
                    },
                    access_token: 'debug-token-abc123',
                    refresh_token: 'debug-refresh-abc123',
                    is_authenticated: true,
                    remember_me: false,
                    customer_id: 'cust-debug',
                    token_expires_at: Date.now() + (24 * 60 * 60 * 1000),
                    _hasHydrated: true
                },
                version: 1
            };
            localStorage.setItem('auth-store', JSON.stringify(mockAuthData));
            console.log('[SCRIPT] Pre-populated auth-store');
        });

        // Navigate to debug page
        console.log('📌 Navigating to /en/debug...');
        await page.goto('/en/debug');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        // Capture all console messages
        const messages: string[] = [];
        page.on('console', msg => {
            messages.push(`[${msg.type()}] ${msg.text()}`);
            console.log(`[${msg.type()}] ${msg.text()}`);
        });

        // Get the debug info from the page
        const pageContent = await page.locator('body').textContent();
        console.log('📄 Page content length:', pageContent?.length || 0);

        // Check for status indicators
        const hasHydratedYes = pageContent?.includes('Hydrated: ✅ YES');
        const hasAuthYes = pageContent?.includes('Authenticated: ✅ YES');
        const hasTokenYes = pageContent?.includes('Has Access Token: ✅ YES');

        console.log('📊 Status Indicators:');
        console.log('  - Hydrated YES:', hasHydratedYes);
        console.log('  - Authenticated YES:', hasAuthYes);
        console.log('  - Has Token YES:', hasTokenYes);

        // Try to extract the debug JSON
        const debugJson = await page.evaluate(() => {
            // Try to find the JSON in the page
            const preElements = document.querySelectorAll('pre');
            const jsons = Array.from(preElements).map(el => {
                try {
                    return JSON.parse(el.textContent || '{}');
                } catch {
                    return null;
                }
            });
            return jsons;
        });

        console.log('📋 Debug JSON found:', debugJson);

        // Check the store state specifically
        const storeState = await page.evaluate(() => {
            const stored = localStorage.getItem('auth-store');
            return {
                localStorageExists: !!stored,
                storedData: stored ? JSON.parse(stored) : null,
            };
        });

        console.log('💾 localStorage state:', storeState);

        // Verify expectations
        expect(storeState.localStorageExists).toBe(true);
        expect(storeState.storedData?.state?.is_authenticated).toBe(true);
    });
});