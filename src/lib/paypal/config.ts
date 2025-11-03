/**
 * PayPal SDK Configuration
 * 
 * Initializes the PayPal Checkout Server SDK with proper environment detection
 * and credentials validation.
 */

// Use require for CommonJS module to ensure proper resolution in Turbopack
// eslint-disable-next-line global-require
const paypalSdk = require('@paypal/checkout-server-sdk') as any;

const { SandboxEnvironment, LiveEnvironment, PayPalHttpClient } = paypalSdk.core as any;
const { OrdersCreateRequest, OrdersCaptureRequest, OrdersGetRequest } = paypalSdk.orders as any;

/**
 * Orders wrapper class for compatibility with the expected interface
 * The PayPal SDK doesn't export an Orders class, but the code expects:
 * new Orders.OrdersCreateRequest() and new Orders.OrdersCaptureRequest()
 */
class Orders {
    static OrdersCreateRequest = OrdersCreateRequest;
    static OrdersCaptureRequest = OrdersCaptureRequest;
    static OrdersGetRequest = OrdersGetRequest;
}

/**
 * Get current PayPal mode
 */
export function getPayPalMode(): 'sandbox' | 'live' {
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    return (mode === 'live' ? 'live' : 'sandbox') as 'sandbox' | 'live';
}

/**
 * Check if PayPal is properly configured
 */
export function isPayPalConfigured(): boolean {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    return !!(clientId && clientSecret);
}

/**
 * Get PayPal client credentials
 */
function getCredentials() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = getPayPalMode();

    if (!clientId || !clientSecret) {
        console.error('[PayPal Config] Missing PayPal credentials in environment variables');
        console.error('[PayPal Config] Required: NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET');
    }

    return { clientId, clientSecret, mode };
}

/**
 * Initialize PayPal environment based on mode
 */
function createEnvironment() {
    const { clientId, clientSecret, mode } = getCredentials();

    return mode === 'live'
        ? new LiveEnvironment(clientId || '', clientSecret || '')
        : new SandboxEnvironment(clientId || '', clientSecret || '');
}

/**
 * Initialize PayPal HTTP Client (lazy initialization)
 */
let paypalClientInstance: any = null;

function getPayPalClient(): any {
    if (!paypalClientInstance) {
        const environment = createEnvironment();
        paypalClientInstance = new PayPalHttpClient(environment);
    }
    return paypalClientInstance;
}

export const paypalClient = getPayPalClient();

/**
 * Export PayPal SDK classes for use in application
 */
export { Orders };