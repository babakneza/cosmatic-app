import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface CreateOrderRequest {
    customer: string;
    customer_email: string;
    status: string;
    payment_status: string;
    shipping_address: Record<string, any>;
    billing_address: Record<string, any>;
    items: Array<{
        product: string;
        product_name: string;
        quantity: number;
        unit_price: number;
        line_total: number;
    }>;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount?: number;
    total: number;
    payment_method: string;
    payment_intent_id?: string;
}

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-RANDOM (e.g., ORD-20240115-ABC123)
 */
function generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${dateStr}-${randomStr}`;
}

/**
 * POST /api/orders
 * Create a new order in Directus
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateOrderRequest;

        // Get authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Order must contain at least one item' },
                { status: 400 }
            );
        }

        if (!body.customer) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            );
        }

        if (!body.shipping_address) {
            return NextResponse.json(
                { error: 'Shipping address is required' },
                { status: 400 }
            );
        }

        if (!body.billing_address) {
            return NextResponse.json(
                { error: 'Billing address is required' },
                { status: 400 }
            );
        }

        if (!body.payment_method) {
            return NextResponse.json(
                { error: 'Payment method is required' },
                { status: 400 }
            );
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
        if (!directusUrl) {
            console.error('[Orders API] NEXT_PUBLIC_DIRECTUS_URL is not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        try {
            // Generate order number and tracking number
            const orderNumber = generateOrderNumber();
            const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            // Create order in Directus
            // Note: Directus will auto-generate 'created_at' and 'updated_at' timestamps
            const orderPayload = {
                order_number: orderNumber,
                customer: body.customer,
                customer_email: body.customer_email,
                status: body.status || 'pending',
                payment_status: body.payment_status || 'pending',
                shipping_address: body.shipping_address,
                billing_address: body.billing_address,
                subtotal: body.subtotal,
                tax_rate: body.tax_rate || 0,
                tax_amount: body.tax_amount || 0,
                shipping_cost: body.shipping_cost,
                discount_amount: body.discount_amount || 0,
                total: body.total,
                payment_method: body.payment_method,
                tracking_number: trackingNumber,
                ...(body.payment_intent_id && { payment_intent_id: body.payment_intent_id }),
            };

            console.log('[Orders API] Creating order in Directus with customer:', body.customer);
            console.log('[Orders API] Order number:', orderNumber);
            console.log('[Orders API] Tracking number:', trackingNumber);
            console.log('[Orders API] Shipping address JSON:', JSON.stringify(body.shipping_address, null, 2));
            console.log('[Orders API] Billing address JSON:', JSON.stringify(body.billing_address, null, 2));

            // Create order in Directus
            const orderResponse = await axios.post(
                `${directusUrl}/items/orders`,
                orderPayload,
                {
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const createdOrder = orderResponse.data.data;
            console.log('[Orders API] Order created successfully in Directus:', createdOrder.id);

            // Create order items in Directus
            if (body.items && body.items.length > 0) {
                console.log('[Orders API] Creating order items...');
                for (const item of body.items) {
                    try {
                        await axios.post(
                            `${directusUrl}/items/order_items`,
                            {
                                order: createdOrder.id,  // ✅ FIXED: Changed from orders_id to order
                                product: item.product,
                                product_name: item.product_name,
                                quantity: item.quantity,
                                unit_price: item.unit_price,
                                line_total: item.line_total,
                            },
                            {
                                headers: {
                                    'Authorization': authHeader,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        console.log(`[Orders API] Order item created: product=${item.product}, qty=${item.quantity}`);
                    } catch (itemError: any) {
                        console.error('[Orders API] Failed to create order item:', itemError.response?.data);
                        throw itemError;
                    }
                }
                console.log('[Orders API] All order items created successfully');
            }

            return NextResponse.json(
                {
                    success: true,
                    data: createdOrder,
                    message: 'Order created successfully',
                },
                { status: 201 }
            );
        } catch (directusError: any) {
            const status = directusError.response?.status;
            const errorData = directusError.response?.data;

            console.error('[Orders API] Directus error:', status, errorData);

            // ⏰ Handle 401 token expired errors specifically
            if (status === 401) {
                const errorMessage = errorData?.errors?.[0]?.message || errorData?.error || 'Token expired';

                if (errorMessage.toLowerCase().includes('token expired') || errorMessage.toLowerCase().includes('unauthorized')) {
                    console.error('[Orders API] Token expired error detected, sending 401 with login signal');
                    return NextResponse.json(
                        {
                            error: 'Token expired',
                            code: 'TOKEN_EXPIRED',
                            requiresRelogin: true,
                            message: 'Your session has expired. Please login again to continue.'
                        },
                        { status: 401 }
                    );
                }
            }

            // Return specific error message if available
            const errorMessage = errorData?.errors?.[0]?.message ||
                directusError.message ||
                'Failed to create order in Directus';

            return NextResponse.json(
                { error: errorMessage },
                { status: status || 500 }
            );
        }
    } catch (error: any) {
        console.error('[Orders API] Request parsing error:', error.message);
        return NextResponse.json(
            { error: 'Invalid request format' },
            { status: 400 }
        );
    }
}

/**
 * GET /api/orders?orderId=xxx
 * Get order details from Directus
 */
export async function GET(request: NextRequest) {
    try {
        const orderId = request.nextUrl.searchParams.get('orderId');
        const authHeader = request.headers.get('Authorization');

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
        if (!directusUrl) {
            console.error('[Orders API] NEXT_PUBLIC_DIRECTUS_URL is not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        try {
            // Fetch order from Directus
            const orderResponse = await axios.get(
                `${directusUrl}/items/orders/${orderId}`,
                {
                    headers: {
                        ...(authHeader && { 'Authorization': authHeader }),
                    },
                }
            );

            const order = orderResponse.data.data;

            return NextResponse.json(
                {
                    success: true,
                    data: order,
                },
                { status: 200 }
            );
        } catch (directusError: any) {
            if (directusError.response?.status === 404) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            console.error('[Orders API] Directus error:', directusError.response?.status, directusError.response?.data);
            throw directusError;
        }
    } catch (error: any) {
        console.error('[Orders API] Order fetch error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}