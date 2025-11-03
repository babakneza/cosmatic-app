/**
 * API Endpoint: POST /api/payments/paypal/capture-order
 * 
 * Captures a PayPal order that has been approved by the customer.
 * Creates the order in Directus and sets payment status to completed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal/capture-order';
import { PayPalError } from '@/lib/paypal/errors';
import { isPayPalConfigured } from '@/lib/paypal/config';
import { createRateLimiters } from '@/lib/rateLimit';
import { createOrder, formatAddressAsJSON } from '@/lib/api/orders';
import { Address } from '@/types';

// Create rate limiters
const limiters = createRateLimiters();

/**
 * POST /api/payments/paypal/capture-order
 * 
 * Captures an approved PayPal order and creates order in database.
 * 
 * Request Body:
 * {
 *   orderID: string (PayPal order ID),
 *   customerId: string,
 *   cartItems: Array,
 *   totals: { subtotal, tax, shipping, total },
 *   customer_email: string,
 *   shipping_address: Address,
 *   billing_address: Address,
 *   accessToken: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   transactionId: string,
 *   orderData: Order
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
        if (!body.orderID || typeof body.orderID !== 'string') {
            return NextResponse.json(
                { error: 'PayPal order ID is required' },
                { status: 400 }
            );
        }

        // Validate customerId - allow 'anonymous' for guest checkout
        if (!body.customerId || typeof body.customerId !== 'string') {
            console.error('[API] Invalid customerId received:', {
                customerId: body.customerId,
                type: typeof body.customerId
            });
            return NextResponse.json(
                { error: 'Customer ID is required. Please make sure you are logged in.' },
                { status: 400 }
            );
        }

        // Warn if using anonymous checkout
        if (body.customerId === 'anonymous') {
            console.warn('[API] Processing payment for anonymous/guest customer:', body.customer_email);
        }

        if (!body.accessToken || typeof body.accessToken !== 'string') {
            console.error('[API] Missing access token for payment capture');
            return NextResponse.json(
                { error: 'Authentication required. Please log in to complete your purchase.' },
                { status: 401 }
            );
        }

        // Guest/anonymous checkout is not allowed - user must be logged in
        if (body.customerId === 'anonymous') {
            console.error('[API] Attempted guest checkout - not allowed. Customer must be logged in.');
            return NextResponse.json(
                { error: 'You must be logged in to complete your purchase. Please log in and try again.' },
                { status: 401 }
            );
        }

        if (!body.cartItems || !Array.isArray(body.cartItems)) {
            return NextResponse.json(
                { error: 'Cart items are required' },
                { status: 400 }
            );
        }

        if (!body.totals || typeof body.totals !== 'object') {
            return NextResponse.json(
                { error: 'Order totals are required' },
                { status: 400 }
            );
        }

        if (!body.customer_email) {
            return NextResponse.json(
                { error: 'Customer email is required' },
                { status: 400 }
            );
        }

        // Capture the PayPal order
        console.log('[API] Capturing PayPal order:', body.orderID);
        const captureResult = await capturePayPalOrder(body.orderID);

        if (!captureResult.success) {
            throw new PayPalError(
                'Capture result was not successful',
                'API_ERROR' as any,
                'Payment capture failed'
            );
        }

        const { transactionDetails } = captureResult;

        // Prepare order items for Directus
        const orderItems = body.cartItems.map((item: any) => ({
            product: item.product?.id || item.product_id || item.id,
            product_name: item.product?.name || item.name || 'Product',
            quantity: item.quantity || 1,
            unit_price: item.product?.price || parseFloat(item.unit_price) || 0,
            line_total: (item.product?.price || parseFloat(item.unit_price) || 0) * (item.quantity || 1),
        }));

        // Format addresses for Directus
        const shippingAddress = formatAddressAsJSON(body.shipping_address as Address, 'shipping');
        const billingAddress = formatAddressAsJSON(body.billing_address as Address, 'billing');

        // Create order in Directus
        console.log('[API] Creating order in Directus with PayPal payment');
        const directusOrder = await createOrder(
            body.customerId,
            body.accessToken,
            {
                customer_email: body.customer_email,
                shipping_address: shippingAddress,
                billing_address: billingAddress,
                items: orderItems,
                subtotal: parseFloat(body.totals.subtotal) || 0,
                tax_rate: 0.05, // Default tax rate
                tax_amount: parseFloat(body.totals.tax) || 0,
                shipping_cost: parseFloat(body.totals.shipping) || 0,
                discount_amount: 0,
                total: parseFloat(body.totals.total) || 0,
                payment_method: 'paypal',
                payment_intent_id: transactionDetails.transactionId,
            }
        );

        console.log('[API] Order created successfully in Directus:', directusOrder.order_number);

        return NextResponse.json({
            success: true,
            transactionId: transactionDetails.transactionId,
            orderData: directusOrder,
            message: 'Payment captured and order created successfully',
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

        // Handle authorization errors
        if (error.response?.status === 401) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in again.' },
                { status: 401 }
            );
        }

        // Handle unexpected errors
        console.error('[API] Unexpected error capturing PayPal order:', error.message);

        return NextResponse.json(
            { error: 'Failed to process payment. Please try again.' },
            { status: 500 }
        );
    }
}