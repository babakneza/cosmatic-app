import { readItems } from '@directus/sdk';
import { getDirectusClient } from './directus';
import { ShippingMethod } from '@/types/collections';

/**
 * Client-side wrapper to call the /api/shipping route
 * This ensures shipping methods are fetched server-side to avoid CORS issues
 * @param countryId - Country ID from the countries collection
 * @param cartValue - Optional cart value in OMR (defaults to 0 if not provided)
 */
export async function fetchShippingMethodsViaAPI(
    countryId: string | number,
    cartValue: number = 0
): Promise<ShippingMethod[]> {
    try {
        console.log('[Shipping Client] Fetching methods via API route for countryId:', countryId, 'cartValue:', cartValue);

        const response = await fetch(`/api/shipping?countryId=${countryId}&cartValue=${cartValue}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || 'Failed to fetch shipping methods');
        }

        const data = await response.json();
        console.log('[Shipping Client] Successfully fetched', data.data.length, 'methods via API route');

        return data.data || [];
    } catch (error) {
        console.error('[Shipping Client] Error fetching methods via API:', error);
        throw error;
    }
}

/**
 * Fetch all active shipping methods from Directus
 * Includes expanded available_countries Many-to-Many relation to get real country IDs
 */
export async function getAllShippingMethods(): Promise<ShippingMethod[]> {
    try {
        const client = await getDirectusClient();
        console.log('[Shipping API] Fetching all active shipping methods from Directus...');

        const methods = await (client as any).request(
            (readItems as any)('shipping', {
                filter: {
                    is_active: { _eq: true }
                },
                sort: ['sort_order'],
                fields: [
                    'id',
                    'name',
                    'name_ar',
                    'type',
                    'cost',
                    'available_countries.countries_id.*',
                    'is_active',
                    'sort_order',
                    'min_value',
                    'max_value',
                    'additional_cost',
                    'estimated_days_min',
                    'estimated_days_max',
                    'free_shipping_threshold'
                ]
            })
        );

        console.log(`[Shipping API] Successfully fetched ${methods.length} shipping methods`);
        if (methods.length > 0) {
            console.log('[Shipping API] Methods:', methods.map((m: any) => ({ id: m.id, name: m.name, is_active: m.is_active })));
        }

        return methods as ShippingMethod[];
    } catch (error) {
        console.error('[Shipping API] Error fetching shipping methods:', error);
        if (error instanceof Error) {
            console.error('[Shipping API] Error message:', error.message);
            console.error('[Shipping API] Error stack:', error.stack);
        }
        return [];
    }
}

/**
 * Get available shipping methods for a specific country
 * IMPORTANT: This function checks if it's running on the client side and uses the API route if so
 * This avoids CORS issues with direct Directus SDK calls from the browser
 * @param countryId - Country ID from the countries collection
 * @param cartValue - Optional cart value in OMR (defaults to 0 if not provided)
 */
export async function getShippingMethods(countryId: string | number, cartValue: number = 0): Promise<ShippingMethod[]> {
    // Check if we're on the client side (browser environment)
    if (typeof window !== 'undefined') {
        // Client side: use API route to avoid CORS issues
        return fetchShippingMethodsViaAPI(countryId, cartValue);
    }
    // Server side: use the SDK directly
    return getAvailableShippingMethods(countryId, cartValue);
}

/**
 * Get available shipping methods based on country ID and cart value
 * @param countryId - Country ID from the countries collection (or fallback country name for backward compatibility)
 * @param cartValue - Total cart value in OMR
 */
export async function getAvailableShippingMethods(
    countryId: string | number = 'Oman',
    cartValue: number = 0
): Promise<ShippingMethod[]> {
    try {
        const allMethods = await getAllShippingMethods();

        console.log('[Shipping API] Fetching methods for countryId:', countryId, 'cartValue:', cartValue);
        console.log('[Shipping API] Total methods found:', allMethods.length);

        if (allMethods.length === 0) {
            console.warn('[Shipping API] No active shipping methods found in Directus');
        }

        const availableMethods = allMethods.filter((method) => {
            // Check if country is available
            // available_countries is a Many-to-Many relation with junction table
            // Structure: [{ id: junction_id, countries_id: { id: 7, name: 'Oman', ... } }, ...]
            const countriesArray = Array.isArray(method.available_countries)
                ? method.available_countries
                : [];

            // Convert to string for comparison to handle both string and number IDs
            const countryIdStr = String(countryId);

            // Extract real country IDs from the nested structure
            // For Many-to-Many relations, we need to access countries_id.id
            const realCountryIds = countriesArray.map((item) => {
                // If it's a nested object with countries_id property (expanded M2M relation)
                if (typeof item === 'object' && item !== null && 'countries_id' in item) {
                    const countryObj = item.countries_id;
                    if (typeof countryObj === 'object' && countryObj !== null && 'id' in countryObj) {
                        return String(countryObj.id);
                    }
                }
                // Fallback for direct ID or old format
                if (typeof item === 'object' && item !== null && 'id' in item) {
                    return String(item.id);
                }
                return String(item);
            });

            const isCountryAvailable = realCountryIds.includes(countryIdStr);

            if (!isCountryAvailable) {
                console.log(`[Shipping API] Method "${method.name}" skipped: country ID "${countryId}" not in available_countries.`,
                    `Real country IDs found:`, realCountryIds, `Raw available_countries:`, countriesArray);
                return false;
            }

            // Check cart value constraints
            if (method.min_value && cartValue < method.min_value) {
                console.log(`[Shipping API] Method "${method.name}" skipped: cart value ${cartValue} < min ${method.min_value}`);
                return false;
            }

            if (method.max_value && cartValue > method.max_value) {
                console.log(`[Shipping API] Method "${method.name}" skipped: cart value ${cartValue} > max ${method.max_value}`);
                return false;
            }

            return true;
        });

        console.log('[Shipping API] Available methods after filtering:', availableMethods.length);
        availableMethods.forEach(m => {
            console.log(`  - ${m.name} (ID: ${m.id}, Cost: ${m.cost} OMR, Available Countries: ${JSON.stringify(m.available_countries)})`);
        });

        return availableMethods;
    } catch (error) {
        console.error('[Shipping API] Error getting available shipping methods:', error);
        return [];
    }
}

/**
 * Calculate shipping cost with considerations for cart value and free shipping threshold
 * @param shippingMethodId - ID of the selected shipping method
 * @param cartValue - Total cart value in OMR
 */
export async function calculateShippingCost(
    shippingMethodId: string,
    cartValue: number = 0
): Promise<number> {
    try {
        const allMethods = await getAllShippingMethods();
        const method = allMethods.find((m) => m.id === shippingMethodId);

        if (!method) {
            console.warn(`[Shipping API] Shipping method not found: ${shippingMethodId}`);
            return 0;
        }

        // Check if free shipping threshold is met
        if (method.free_shipping_threshold && cartValue >= method.free_shipping_threshold) {
            return 0; // Free shipping
        }

        // Calculate cost with additional charges if applicable
        let totalCost = method.cost;

        if (method.additional_cost && method.max_value && cartValue > method.max_value) {
            totalCost += method.additional_cost;
        }

        return totalCost;
    } catch (error) {
        console.error('[Shipping API] Error calculating shipping cost:', error);
        return 0;
    }
}

/**
 * Get a single shipping method by ID
 * Includes expanded available_countries Many-to-Many relation to get real country IDs
 * @param methodId - ID of the shipping method
 */
export async function getShippingMethod(methodId: string): Promise<ShippingMethod | null> {
    try {
        const client = await getDirectusClient();
        const method = await (client as any).request(
            (readItems as any)('shipping', {
                filter: { id: { _eq: methodId } },
                fields: [
                    'id',
                    'name',
                    'name_ar',
                    'type',
                    'cost',
                    'available_countries.countries_id.*',
                    'is_active',
                    'sort_order',
                    'min_value',
                    'max_value',
                    'additional_cost',
                    'estimated_days_min',
                    'estimated_days_max',
                    'free_shipping_threshold'
                ]
            })
        );

        return method[0] || null;
    } catch (error) {
        console.error('[Shipping API] Error fetching shipping method:', error);
        return null;
    }
}

/**
 * Get estimated delivery days as a formatted string
 * @param method - Shipping method object
 * @param locale - Language locale ('ar' or 'en')
 */
export function getEstimatedDeliveryText(method: ShippingMethod, locale: string = 'en'): string {
    if (!method.estimated_days_min || !method.estimated_days_max) {
        return locale === 'ar' ? 'توصيل معياري' : 'Standard delivery';
    }

    if (method.estimated_days_min === method.estimated_days_max) {
        const day = method.estimated_days_min;
        return locale === 'ar'
            ? `${day} ${day === 1 ? 'يوم' : 'أيام'} عمل`
            : `${day} ${day === 1 ? 'business day' : 'business days'}`;
    }

    return locale === 'ar'
        ? `${method.estimated_days_min}-${method.estimated_days_max} أيام عمل`
        : `${method.estimated_days_min}-${method.estimated_days_max} business days`;
}