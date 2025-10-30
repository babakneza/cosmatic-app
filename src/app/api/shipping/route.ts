import { NextResponse, NextRequest } from 'next/server';
import { getAvailableShippingMethods, calculateShippingCost } from '@/lib/api/shipping';
import { ShippingMethod } from '@/types/collections';

/**
 * GET /api/shipping
 * 
 * Fetches available shipping methods for a given country and cart value
 * 
 * Query Parameters:
 * - countryId: Country ID from the countries collection (required)
 * - cartValue: Cart subtotal in OMR (optional, default: 0)
 * 
 * Returns:
 * - Array of available shipping methods with calculated costs
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const countryId = searchParams.get('countryId');
        const cartValueStr = searchParams.get('cartValue');

        console.log('[Shipping API Route] Received request with countryId:', countryId, 'cartValue:', cartValueStr);

        if (!countryId) {
            console.error('[Shipping API Route] Missing required parameter: countryId');
            return NextResponse.json(
                { error: 'Missing required parameter: countryId' },
                { status: 400 }
            );
        }

        // Parse cart value, default to 0
        const cartValue = cartValueStr ? parseFloat(cartValueStr) : 0;

        if (isNaN(cartValue)) {
            console.error('[Shipping API Route] Invalid cartValue:', cartValueStr);
            return NextResponse.json(
                { error: 'Invalid cartValue parameter' },
                { status: 400 }
            );
        }

        console.log('[Shipping API Route] Fetching methods for countryId:', countryId, 'cartValue:', cartValue);

        // Get available shipping methods based on country and cart value
        const methods = await getAvailableShippingMethods(countryId, cartValue);

        console.log('[Shipping API Route] Found', methods.length, 'available methods');

        // Calculate shipping cost for each method and normalize type field
        const methodsWithCosts = await Promise.all(
            methods.map(async (method) => {
                try {
                    const cost = await calculateShippingCost(method.id, cartValue);
                    // Ensure type has a default value if it's empty
                    const normalizedType = method.type && method.type.trim() ? method.type : 'standard';
                    return {
                        ...method,
                        type: normalizedType,
                        cost: cost
                    };
                } catch (error) {
                    console.error(`[Shipping API Route] Error calculating cost for method ${method.id}:`, error);
                    // Normalize type even if cost calculation fails
                    const normalizedType = method.type && method.type.trim() ? method.type : 'standard';
                    return {
                        ...method,
                        type: normalizedType
                    };
                }
            })
        );

        console.log('[Shipping API Route] Returning', methodsWithCosts.length, 'methods with costs');

        return NextResponse.json({
            data: methodsWithCosts,
            count: methodsWithCosts.length
        });
    } catch (error: any) {
        console.error('[Shipping API Route] Error fetching shipping methods:', error.message);

        // Log detailed error information
        if (error.errors) {
            console.error('[Shipping API Route] Detailed errors:', error.errors);
        }
        if (error.response?.status === 403) {
            console.error('[Shipping API Route] PERMISSION DENIED - Check Directus access control for "shipping" collection');
        }

        // Return error response
        return NextResponse.json(
            {
                error: 'Failed to fetch shipping methods',
                details: error.message
            },
            { status: 500 }
        );
    }
}