/**
 * PayPal Client SDK Loader
 * 
 * Dynamically loads the PayPal Buttons SDK script.
 * Handles SDK initialization, configuration, and error management.
 */

/**
 * Type definition for PayPal window object
 */
declare global {
    interface Window {
        paypal?: any;
    }
}

/**
 * PayPal SDK configuration
 */
interface PayPalSDKConfig {
    clientId: string;
    currency: string;
    locale: string;
    intent: 'capture' | 'authorize';
}

/**
 * Load PayPal SDK dynamically
 * 
 * @param config - SDK configuration
 * @returns Promise that resolves when SDK is loaded
 * @throws Error if SDK fails to load
 * 
 * @example
 * await loadPayPalSDK({
 *   clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
 *   currency: 'OMR',
 *   locale: 'en_US',
 *   intent: 'capture'
 * });
 * 
 * // PayPal is now available as window.paypal
 * const buttons = window.paypal.Buttons({ ... });
 */
export async function loadPayPalSDK(config: PayPalSDKConfig): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if PayPal SDK is already loaded
        if (window.paypal) {
            console.log('[PayPal SDK] SDK already loaded');
            resolve();
            return;
        }

        // Build SDK URL with parameters
        const params = new URLSearchParams({
            'client-id': config.clientId,
            'currency': config.currency,
            'locale': config.locale,
            'intent': config.intent,
            'components': 'buttons',
            'disable-funding': 'card,credit,giropay,ideal,sepa,sofort',
        });

        const sdkUrl = `https://www.paypal.com/sdk/js?${params.toString()}`;

        // Create script tag
        const script = document.createElement('script');
        script.src = sdkUrl;
        script.async = true;
        script.onload = () => {
            if (window.paypal) {
                console.log('[PayPal SDK] SDK loaded successfully');
                resolve();
            } else {
                reject(new Error('PayPal SDK loaded but window.paypal is not available'));
            }
        };

        script.onerror = () => {
            reject(new Error('Failed to load PayPal SDK'));
        };

        document.head.appendChild(script);
    });
}

/**
 * Check if PayPal SDK is available
 */
export function isPayPalSDKAvailable(): boolean {
    return !!window.paypal?.Buttons;
}

/**
 * Get PayPal SDK status
 */
export function getPayPalSDKStatus(): 'not-loaded' | 'loading' | 'loaded' | 'error' {
    if (!window.paypal) {
        return 'not-loaded';
    }

    if (typeof window.paypal?.Buttons === 'function') {
        return 'loaded';
    }

    return 'loading';
}