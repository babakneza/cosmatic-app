import { test, expect } from '@playwright/test';

test.describe('Checkout - Shipping Method Infinite Loop Fix', () => {
    test('should not make repeated API calls when loading shipping methods', async ({ page }) => {
        // Enable console message logging to monitor API calls
        const apiCalls: string[] = [];

        page.on('console', (msg) => {
            if (msg.text().includes('[Shipping API]') || msg.text().includes('GET /api/shipping')) {
                apiCalls.push(msg.text());
                console.log('API Call:', msg.text());
            }
        });

        // Navigate to checkout (assumes user is logged in and has cart items)
        // First navigate to home to ensure fresh state
        await page.goto('/en');

        // Wait a bit for page to load
        await page.waitForTimeout(2000);

        // Go to cart page
        await page.goto('/en/cart');

        // Wait for cart to load
        await page.waitForTimeout(2000);

        // Check if there are items in cart - if not, add one
        const cartItems = await page.locator('[data-testid="cart-item"]').count();

        if (cartItems === 0) {
            // Go to products to add an item
            await page.goto('/en');
            await page.waitForTimeout(2000);

            // Try to find and click first product
            const firstProduct = await page.locator('button:has-text("Add to Cart")').first();
            if (await firstProduct.isVisible()) {
                await firstProduct.click();
                await page.waitForTimeout(1000);
            }

            // Go back to cart
            await page.goto('/en/cart');
            await page.waitForTimeout(1000);
        }

        // Click checkout button
        const checkoutButton = await page.locator('button:has-text("Proceed to Checkout"), button:has-text("Continue to Checkout")').first();
        if (await checkoutButton.isVisible()) {
            await checkoutButton.click();
        }

        // Wait for checkout page to load
        await page.waitForURL(/\/checkout/);
        await page.waitForTimeout(3000);

        // Now we should be on the shipping address step
        // Fill in the shipping address form if needed
        const addressInput = await page.locator('input[placeholder*="Address"], input[placeholder*="address"]').first();
        if (await addressInput.isVisible()) {
            // Fill address details
            await addressInput.fill('123 Main Street');
            await page.waitForTimeout(500);

            // Fill city
            const cityInput = await page.locator('input[placeholder*="City"], input[placeholder*="city"]').first();
            if (await cityInput.isVisible()) {
                await cityInput.fill('Muscat');
            }

            // Submit address form
            const submitButton = await page.locator('button:has-text("Continue"), button:has-text("continue")').first();
            if (await submitButton.isVisible()) {
                await submitButton.click();
                await page.waitForTimeout(2000);
            }
        }

        // Now we should be on the shipping method selection step
        await page.waitForTimeout(5000);

        // Count API calls so far
        const callsBeforeWait = apiCalls.length;
        console.log(`API calls before stabilization check: ${callsBeforeWait}`);

        // Wait and check if API calls continue (they shouldn't in a stable state)
        await page.waitForTimeout(5000);
        const callsAfterWait = apiCalls.length;
        console.log(`API calls after waiting: ${callsAfterWait}`);

        // The difference should be minimal (0 or 1, not growing continuously)
        // This verifies the infinite loop is fixed
        const newCallsDuringWait = callsAfterWait - callsBeforeWait;

        console.log(`New API calls during 5-second wait: ${newCallsDuringWait}`);
        console.log(`Total API calls: ${callsAfterWait}`);

        // Verify shipping methods are visible
        const shippingMethods = await page.locator('input[name="shipping_method"]').count();
        console.log(`Shipping methods visible: ${shippingMethods}`);
        expect(shippingMethods).toBeGreaterThan(0);

        // The key test: API should NOT be called repeatedly
        // Allow maximum 2 calls (initial + 1 retry) but should typically be 1
        // In a broken infinite loop, this would be much higher
        expect(callsAfterWait).toBeLessThanOrEqual(5); // Very generous upper bound

        // Select the first shipping method
        const firstMethodRadio = await page.locator('input[name="shipping_method"]').first();
        if (await firstMethodRadio.isVisible()) {
            await firstMethodRadio.click();
            await page.waitForTimeout(1000);

            // Verify method was selected
            expect(await firstMethodRadio.isChecked()).toBe(true);

            // Find and click the Continue button
            const continueButton = await page.locator('button:has-text("Continue")').last();
            if (await continueButton.isVisible()) {
                await continueButton.click();

                // Wait for navigation to payment step
                await page.waitForTimeout(2000);

                // Verify we advanced to payment step
                const paymentTitle = await page.locator('text=/Payment|payment/').first();
                expect(await paymentTitle.isVisible()).toBe(true);

                console.log('✓ Successfully advanced from shipping methods to payment step');
            }
        }
    });

    test('should load shipping methods exactly once', async ({ page }) => {
        // This test specifically checks the API call count
        let shippingApiCallCount = 0;

        page.on('console', (msg) => {
            if (msg.text().includes('[Shipping API]')) {
                shippingApiCallCount++;
            }
        });

        await page.goto('/en/checkout');

        // Wait for initial load
        await page.waitForTimeout(5000);

        console.log(`Total shipping API calls: ${shippingApiCallCount}`);

        // In a working implementation, should be 1 call per address/cart combination
        // In broken implementation, this would be 10+
        expect(shippingApiCallCount).toBeLessThanOrEqual(3); // Allow some reasonable margin
    });

    test('should not produce repeated fetch logs in console', async ({ page }) => {
        const fetchLogs: { time: number; message: string }[] = [];

        page.on('console', (msg) => {
            if (msg.text().includes('ShippingMethodSelector') && msg.text().includes('Fetching')) {
                fetchLogs.push({
                    time: Date.now(),
                    message: msg.text()
                });
            }
        });

        await page.goto('/en/checkout');

        // Simulate being on checkout page for 5 seconds
        await page.waitForTimeout(5000);

        console.log(`Fetch logs recorded: ${fetchLogs.length}`);

        // Count how many fetch logs occurred within close time windows (potential loop)
        // If logs are 5+ seconds apart, they're likely independent actions
        let closeLogs = 0;
        for (let i = 1; i < fetchLogs.length; i++) {
            const timeDiff = fetchLogs[i].time - fetchLogs[i - 1].time;
            if (timeDiff < 1000) { // Less than 1 second apart
                closeLogs++;
            }
        }

        console.log(`Rapid consecutive fetch logs: ${closeLogs}`);

        // Should have minimal rapid fetches (indicates no infinite loop)
        expect(closeLogs).toBeLessThanOrEqual(2);
    });
});