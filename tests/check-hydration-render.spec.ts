import { test, expect } from '@playwright/test';

test.describe('Check Hydration Rendering', () => {
    test('capture debug page screenshot and HTML', async ({ page }) => {
        console.log('🔍 Taking screenshot of debug page...');

        // Pre-populate localStorage
        await page.addInitScript(() => {
            const mockAuthData = {
                state: {
                    user: {
                        id: 'screenshot-user',
                        email: 'screenshot@test.com',
                        first_name: 'Screenshot',
                        last_name: 'Test',
                        created_at: '2025-10-27T17:06:01.391Z'
                    },
                    access_token: 'screenshot-token-xyz',
                    refresh_token: 'screenshot-refresh-xyz',
                    is_authenticated: true,
                    remember_me: false,
                    customer_id: 'cust-screenshot',
                    token_expires_at: Date.now() + (24 * 60 * 60 * 1000),
                    _hasHydrated: true
                },
                version: 1
            };
            localStorage.setItem('auth-store', JSON.stringify(mockAuthData));
        });

        // Navigate to debug page
        await page.goto('/en/debug');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2500); // Wait for hydration

        // Capture screenshot
        await page.screenshot({ path: 'debug-page-screenshot.png', fullPage: true });
        console.log('✅ Screenshot saved to debug-page-screenshot.png');

        // Get full HTML
        const html = await page.content();
        console.log('📄 Page HTML length:', html.length);
        console.log('📄 Contains "Authenticated: ✅ YES":', html.includes('Authenticated: ✅ YES'));
        console.log('📄 Contains "Hydrated: ✅ YES":', html.includes('Hydrated: ✅ YES'));
        console.log('📄 Contains "screenshot@test.com":', html.includes('screenshot@test.com'));

        // Get console messages
        const logs: string[] = [];
        page.on('console', msg => {
            logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        });

        await page.waitForTimeout(1000);

        console.log('\n📋 Console messages captured:');
        logs.slice(-20).forEach(log => console.log('  ' + log));

        // Check page visibility
        const authStatus = await page.locator('[data-testid="auth-status-authenticated"]').isVisible({ timeout: 1000 }).catch(() => false);
        console.log('✅ Auth status element visible:', authStatus);

        // Get actual rendered text
        const bodyText = await page.locator('body').textContent();
        console.log('\n📄 First 500 chars of body text:');
        console.log(bodyText?.substring(0, 500));
    });
});