/**
 * API Endpoint: POST /api/payments/paypal/create-order
 * 
 * Creates a PayPal order for the checkout process.
 * Validates order totals and customer data before creating the order.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder, CreatePayPalOrderRequest } from '@/lib/paypal/create-order';
import { PayPalError } from '@/lib/paypal/errors';
import { isPayPalConfigured } from '@/lib/paypal/config';
import { createRateLimiters } from '@/lib/rateLimit';

// Create rate limiters
const limiters = createRateLimiters();

/**
 * POST /api/payments/paypal/create-order
 * 
 * Creates a PayPal order based on cart data.
 * 
 * Request Body:
 * {
 *   items: Array<{ product_id, name, quantity, unit_price }>,
 *   totals: { subtotal, tax, shipping, total },
 *   customer_email: string,
 *   shipping_address: Address,
 *   billing_address: Address
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   orderID: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Check if PayPal is configured
        if (!isPayPalConfigured()) {
            console.error('[API] PayPal is not properly configured');
            return NextResponse.json(
                { error: 'Payment system is not available. Please try again later.' },
                { status: 503 }
            );
        }

        // Apply rate limiting - checkout limiter is strict (1 req/sec)
        const clientKey = request.headers.get('x-forwarded-for') || 'anonymous';
        if (!limiters.checkout.isAllowed(clientKey)) {
            return NextResponse.json(
                { error: 'Too many payment requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse request body
        const body = await request.json();

        // Validate required fields
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Order must contain at least one item' },
                { status: 400 }
            );
        }

        if (!body.totals || typeof body.totals !== 'object') {
            return NextResponse.json(
                { error: 'Order totals are required' },
                { status: 400 }
            );
        }

        if (!body.customer_email || typeof body.customer_email !== 'string') {
            return NextResponse.json(
                { error: 'Customer email is required' },
                { status: 400 }
            );
        }

        if (!body.shipping_address || typeof body.shipping_address !== 'object') {
            return NextResponse.json(
                { error: 'Shipping address is required' },
                { status: 400 }
            );
        }

        if (!body.billing_address || typeof body.billing_address !== 'object') {
            return NextResponse.json(
                { error: 'Billing address is required' },
                { status: 400 }
            );
        }

        // Validate totals have required fields
        const totalsObj = body.totals as Record<string, any>;
        const subtotal = typeof totalsObj.subtotal === 'string' ? parseFloat(totalsObj.subtotal) : totalsObj.subtotal;
        const tax = typeof totalsObj.tax === 'string' ? parseFloat(totalsObj.tax) : totalsObj.tax;
        const shipping = typeof totalsObj.shipping === 'string' ? parseFloat(totalsObj.shipping) : totalsObj.shipping;
        const total = typeof totalsObj.total === 'string' ? parseFloat(totalsObj.total) : totalsObj.total;

        if (typeof subtotal !== 'number' || typeof tax !== 'number' ||
            typeof shipping !== 'number' || typeof total !== 'number') {
            return NextResponse.json(
                { error: 'Invalid totals provided' },
                { status: 400 }
            );
        }

        // Validate total is positive
        if (total <= 0) {
            return NextResponse.json(
                { error: 'Order total must be greater than zero' },
                { status: 400 }
            );
        }

        // Format amounts to OMR currency (3 decimal places)
        const formattedSubtotal: string = subtotal.toFixed(3);
        const formattedTax: string = tax.toFixed(3);
        const formattedShipping: string = shipping.toFixed(3);
        const formattedTotal: string = total.toFixed(3);

        // Prepare PayPal order request
        const paypalOrderRequest: CreatePayPalOrderRequest = {
            items: body.items.map((item: any) => ({
                product_id: item.product_id || item.id || 'unknown',
                name: item.name || 'Product',
                quantity: Math.max(1, parseInt(item.quantity) || 1),
                unit_price: parseFloat(item.unit_price) || 0,
            })),
            totals: {
                subtotal: formattedSubtotal,
                tax: formattedTax,
                shipping: formattedShipping,
                total: formattedTotal,
            },
            customer_email: body.customer_email.toLowerCase().trim(),
            shipping_address: {
                full_name: body.shipping_address.full_name || '',
                phone: body.shipping_address.phone || '',
                email: body.customer_email,
                street_address: body.shipping_address.street_address || '',
                wilayat: body.shipping_address.wilayat || '',
                governorate: body.shipping_address.governorate || '',
                postal_code: body.shipping_address.postal_code,
                building: body.shipping_address.building,
                floor: body.shipping_address.floor,
                apartment: body.shipping_address.apartment,
                additional_info: body.shipping_address.additional_info,
            },
            billing_address: {
                full_name: body.billing_address.full_name || '',
                phone: body.billing_address.phone || '',
                email: body.customer_email,
                street_address: body.billing_address.street_address || '',
                wilayat: body.billing_address.wilayat || '',
                governorate: body.billing_address.governorate || '',
                postal_code: body.billing_address.postal_code,
                building: body.billing_address.building,
                floor: body.billing_address.floor,
                apartment: body.billing_address.apartment,
                additional_info: body.billing_address.additional_info,
            },
        };

        // Create PayPal order
        console.log('[API] Creating PayPal order for customer:', body.customer_email);
        const result = await createPayPalOrder(paypalOrderRequest);

        console.log('[API] PayPal order created successfully:', result.orderID);

        return NextResponse.json({
            success: true,
            orderID: result.orderID,
        });
    } catch (error: any) {
        // Handle PayPal errors
        if (error instanceof PayPalError) {
            console.error('[API] PayPal error:', error.toJSON());

            return NextResponse.json(
                {
                    error: error.userMessage,
                    errorType: error.errorType,
                },
                { status: 400 }
            );
        }

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            );
        }

        // Handle unexpected errors
        console.error('[API] Unexpected error creating PayPal order:', error.message);

        return NextResponse.json(
            { error: 'Failed to create payment order. Please try again.' },
            { status: 500 }
        );
    }
}