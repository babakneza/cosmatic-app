/**
 * PayPal Order Creation Service
 * 
 * Creates PayPal orders with proper validation and error handling.
 * Supports OMR currency internally (3 decimal places).
 * Converts to USD for PayPal Sandbox transactions (USD is universally supported).
 */

import { paypalClient, Orders } from './config';
import { PayPalError, PayPalErrorType } from './errors';
import { convertOMRtoUSD } from '@/lib/currency';

/**
 * Item breakdown for PayPal order
 */
export interface OrderItem {
    product_id: string;
    name: string;
    quantity: number;
    unit_price: number; // In OMR with 3 decimal places
}

/**
 * Order totals
 */
export interface OrderTotals {
    subtotal: string | number; // In OMR (as string with 3 decimal places or number)
    tax: string | number; // In OMR
    shipping: string | number; // In OMR
    total: string | number; // In OMR
}

/**
 * Address data
 */
export interface OrderAddress {
    full_name: string;
    phone: string;
    email: string;
    street_address: string;
    wilayat: string;
    governorate: string;
    postal_code?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    additional_info?: string;
}

/**
 * Request to create PayPal order
 */
export interface CreatePayPalOrderRequest {
    items: OrderItem[];
    totals: OrderTotals;
    customer_email: string;
    shipping_address: OrderAddress;
    billing_address: OrderAddress;
}

/**
 * Response from PayPal order creation
 */
export interface CreatePayPalOrderResponse {
    orderID: string;
    status: string;
}

/**
 * Validate and format amount for PayPal API (2 decimal places max)
 * Note: While OMR supports 3 decimal places in real-world usage,
 * PayPal's API only accepts 2 decimal places for all currencies
 */
function formatOMRAmount(amount: number | string): string {
    // PayPal API requires maximum 2 decimal places
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
}

/**
 * Validate order totals to prevent tampering
 */
function validateOrderTotals(items: OrderItem[], totals: OrderTotals): boolean {
    // Convert string totals to numbers
    const subtotalNum = typeof totals.subtotal === 'string' ? parseFloat(totals.subtotal) : totals.subtotal;
    const taxNum = typeof totals.tax === 'string' ? parseFloat(totals.tax) : totals.tax;
    const shippingNum = typeof totals.shipping === 'string' ? parseFloat(totals.shipping) : totals.shipping;
    const totalNum = typeof totals.total === 'string' ? parseFloat(totals.total) : totals.total;

    // Calculate subtotal from items
    const calculatedSubtotal = items.reduce(
        (sum, item) => sum + (item.unit_price * item.quantity),
        0
    );

    // Allow small floating-point differences (0.001 OMR)
    const subtotalDiff = Math.abs(calculatedSubtotal - subtotalNum);
    if (subtotalDiff > 0.001) {
        console.error('[PayPal] Subtotal mismatch:', {
            calculated: calculatedSubtotal,
            provided: subtotalNum,
            difference: subtotalDiff,
        });
        return false;
    }

    // Validate total = subtotal + tax + shipping
    const calculatedTotal = subtotalNum + taxNum + shippingNum;
    const totalDiff = Math.abs(calculatedTotal - totalNum);
    if (totalDiff > 0.001) {
        console.error('[PayPal] Total mismatch:', {
            calculated: calculatedTotal,
            provided: totalNum,
            difference: totalDiff,
        });
        return false;
    }

    // Validate all amounts are positive
    if (subtotalNum < 0 || taxNum < 0 || shippingNum < 0) {
        console.error('[PayPal] Negative amounts not allowed');
        return false;
    }

    return true;
}

/**
 * Create a PayPal order
 * 
 * @param request - Order creation request with items, totals, and customer info
 * @returns PayPal order creation response with orderID
 * @throws PayPalError if order creation fails
 * 
 * @example
 * const order = await createPayPalOrder({
 *   items: [{ product_id: '1', name: 'Perfume', quantity: 2, unit_price: 45.000 }],
 *   totals: { subtotal: 90.000, tax: 4.500, shipping: 5.000, total: 99.500 },
 *   customer_email: 'customer@example.com',
 *   shipping_address: { ... },
 *   billing_address: { ... }
 * });
 */
export async function createPayPalOrder(
    request: CreatePayPalOrderRequest
): Promise<CreatePayPalOrderResponse> {
    try {
        // Validate totals server-side
        if (!validateOrderTotals(request.items, request.totals)) {
            throw new PayPalError(
                'Order totals validation failed',
                PayPalErrorType.VALIDATION_ERROR,
                'The order totals do not match the items. Please refresh and try again.'
            );
        }

        // Validate items are present
        if (!request.items || request.items.length === 0) {
            throw new PayPalError(
                'No items in order',
                PayPalErrorType.VALIDATION_ERROR,
                'Your order must contain at least one item.'
            );
        }

        // Build PayPal request
        const createOrderRequest = new Orders.OrdersCreateRequest();
        createOrderRequest.prefer('return=representation');

        // Prepare items for PayPal (convert OMR to USD for PayPal Sandbox compatibility)
        const paypalItems = request.items.map((item) => ({
            name: item.name.substring(0, 127), // PayPal limit
            description: `Product: ${item.product_id}`,
            sku: item.product_id,
            unit_amount: {
                currency_code: 'USD', // PayPal Sandbox supports USD universally
                value: convertOMRtoUSD(item.unit_price),
            },
            quantity: item.quantity.toString(),
            category: 'PHYSICAL_GOODS',
        }));

        createOrderRequest.body = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: 'default',
                    description: 'BuyJan Premium Cosmetics Order',
                    custom_id: request.customer_email,
                    payer: {
                        name: {
                            given_name: request.shipping_address.full_name.split(' ')[0] || 'Customer',
                            surname: request.shipping_address.full_name.split(' ').slice(1).join(' ') || '',
                        },
                        email_address: request.customer_email,
                        phone: {
                            phone_number: {
                                national_number: request.shipping_address.phone,
                            },
                        },
                    },
                    shipping: {
                        name: {
                            full_name: request.shipping_address.full_name,
                        },
                        address: {
                            address_line_1: request.shipping_address.street_address,
                            address_line_2: request.shipping_address.building || undefined,
                            admin_area_2: request.shipping_address.wilayat,
                            admin_area_1: request.shipping_address.governorate,
                            postal_code: request.shipping_address.postal_code,
                            country_code: 'OM',
                        },
                    },
                    amount: {
                        currency_code: 'USD', // PayPal Sandbox supports USD universally
                        value: convertOMRtoUSD(request.totals.total as number),
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: convertOMRtoUSD(request.totals.subtotal as number),
                            },
                            shipping: {
                                currency_code: 'USD',
                                value: convertOMRtoUSD(request.totals.shipping as number),
                            },
                            tax_total: {
                                currency_code: 'USD',
                                value: convertOMRtoUSD(request.totals.tax as number),
                            },
                        },
                    },
                    items: paypalItems,
                },
            ],
            application_context: {
                brand_name: 'BuyJan',
                locale: 'en-US',
                landing_page: 'LOGIN',
                shipping_preference: 'SET_PROVIDED_ADDRESS',
                user_action: 'PAY_NOW',
                return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
            },
        };

        // Create order with PayPal (amounts converted from OMR to USD)
        const totalInOMR = typeof request.totals.total === 'string' ? parseFloat(request.totals.total) : request.totals.total;
        const totalInUSD = convertOMRtoUSD(totalInOMR);
        console.log('[PayPal] Creating order:', {
            totalOMR: formatOMRAmount(totalInOMR),
            totalUSD: `${totalInUSD} USD`,
            note: 'Currency converted from OMR to USD for PayPal Sandbox compatibility (USD universally supported)'
        });
        const response = await paypalClient.execute(createOrderRequest as any);

        if (response.statusCode !== 201) {
            throw new PayPalError(
                'PayPal order creation returned non-201 status',
                PayPalErrorType.API_ERROR,
                'Failed to create PayPal order. Please try again.',
                { statusCode: response.statusCode }
            );
        }

        const orderData = response.result as any;

        if (!orderData?.id) {
            throw new PayPalError(
                'No order ID in PayPal response',
                PayPalErrorType.API_ERROR,
                'PayPal order creation failed. Please try again.',
                { response: orderData }
            );
        }

        console.log('[PayPal] Order created successfully:', orderData.id);

        return {
            orderID: orderData.id,
            status: orderData.status || 'CREATED',
        };
    } catch (error: any) {
        // Handle PayPalError
        if (error instanceof PayPalError) {
            throw error;
        }

        // Log unknown errors
        console.error('[PayPal] Unexpected error creating order:', {
            message: error.message,
            statusCode: error.statusCode,
            body: error.body,
        });

        throw new PayPalError(
            error.message || 'Unknown error',
            PayPalErrorType.API_ERROR,
            'Unable to create PayPal order. Please try again later.',
            { originalError: error }
        );
    }
}