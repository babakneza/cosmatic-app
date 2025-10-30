/**
 * Orders API
 * Handles order creation, retrieval, and management
 */

import axios from 'axios';
import { Order, OrderItem, OrderStatus, OrderFilters } from '@/types/collections';

/**
 * Create a new order
 * 
 * This function creates a new order with the following auto-generated fields:
 * - order_number: Unique identifier (format: ORD-YYYYMMDD-XXXXXX)
 * - tracking_number: Initial tracking number (format: TRK-timestamp-XXXXXX)
 * - date_created: Current timestamp in ISO format
 * 
 * The returned Order object will include these fields
 */
export async function createOrder(
    customerId: string,
    accessToken: string,
    orderData: {
        customer_email: string;
        shipping_address: Record<string, any>;
        billing_address: Record<string, any>;
        items: Array<{
            product: string;
            product_name: string;
            quantity: number;
            unit_price: number;
            line_total: number;
            variation?: string;
            variation_name?: string;
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
): Promise<Order> {
    try {
        const response = await axios.post(
            '/api/orders',
            {
                customer: customerId,
                status: 'pending',
                payment_status: 'pending',
                ...orderData,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const order = response.data.data;
        console.log('[Orders] Created order:', order.id);
        console.log('[Orders] Order number:', order.order_number);
        return order;
    } catch (error: any) {
        console.error('[Orders] Failed to create order:', error.message);
        throw error;
    }
}

/**
 * Get order by ID
 */
export async function getOrder(
    orderId: string,
    accessToken: string
): Promise<Order> {
    try {
        const response = await axios.get(
            `/api/orders/${orderId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Orders] Failed to fetch order:', error.message);
        throw error;
    }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(
    orderNumber: string,
    accessToken: string
): Promise<Order | null> {
    try {
        const response = await axios.get(
            `/api/orders/by-number/${orderNumber}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.data.data) {
            return null;
        }

        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log('[Orders] Order not found:', orderNumber);
            return null;
        }
        console.error('[Orders] Failed to fetch order by number:', error.message);
        throw error;
    }
}

/**
 * Get all orders for a customer
 */
export async function getCustomerOrders(
    customerId: string,
    accessToken: string,
    filters?: {
        status?: OrderStatus;
        limit?: number;
        offset?: number;
    }
): Promise<{ data: Order[]; total: number }> {
    try {
        // Validate required parameters
        if (!customerId) {
            throw new Error('customerId is required');
        }
        if (!accessToken) {
            throw new Error('accessToken is required');
        }

        const params = new URLSearchParams();

        if (filters?.status) {
            params.append('status', filters.status);
        }
        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        if (filters?.offset) {
            params.append('offset', String(filters.offset));
        }

        const url = `/api/customers/${customerId}/orders?${params.toString()}`;
        console.log('[Orders] Fetching from URL:', url);

        const response = await axios.get(
            url,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('[Orders] Successfully fetched orders:', response.data.data?.length || 0);
        return {
            data: response.data.data || [],
            total: response.data.meta?.total_count || 0,
        };
    } catch (error: any) {
        // Log detailed error information
        console.error('[Orders] Failed to fetch customer orders');
        console.error('[Orders] Error message:', error.message);
        console.error('[Orders] Error type:', error.constructor.name);
        console.error('[Orders] Axios status:', error.response?.status);
        console.error('[Orders] Axios error data:', JSON.stringify(error.response?.data));
        console.error('[Orders] Full error:', error);

        throw error;
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    accessToken: string
): Promise<Order> {
    try {
        const response = await axios.patch(
            `/api/orders/${orderId}`,
            { status },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Orders] Updated order status to:', status);
        return response.data.data;
    } catch (error: any) {
        console.error('[Orders] Failed to update order status:', error.message);
        throw error;
    }
}

/**
 * Update payment status
 */
export async function updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded',
    accessToken: string,
    paymentIntentId?: string
): Promise<Order> {
    try {
        const updateData: any = { payment_status: paymentStatus };

        if (paymentIntentId) {
            updateData.payment_intent_id = paymentIntentId;
        }

        const response = await axios.patch(
            `/api/orders/${orderId}`,
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Orders] Updated order payment status to:', paymentStatus);
        return response.data.data;
    } catch (error: any) {
        console.error('[Orders] Failed to update payment status:', error.message);
        throw error;
    }
}

/**
 * Add tracking number to order
 */
export async function updateOrderTracking(
    orderId: string,
    trackingNumber: string,
    accessToken: string
): Promise<Order> {
    try {
        const response = await axios.patch(
            `/api/orders/${orderId}`,
            { tracking_number: trackingNumber },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Orders] Added tracking number:', trackingNumber);
        return response.data.data;
    } catch (error: any) {
        console.error('[Orders] Failed to update tracking number:', error.message);
        throw error;
    }
}

/**
 * Get order items
 */
export async function getOrderItems(
    orderId: string,
    accessToken: string
): Promise<OrderItem[]> {
    try {
        const response = await axios.get(
            `/api/orders/${orderId}/items`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data || [];
    } catch (error: any) {
        console.error('[Orders] Failed to fetch order items:', error.message);
        throw error;
    }
}

/**
 * Cancel an order
 */
export async function cancelOrder(
    orderId: string,
    reason?: string,
    accessToken?: string
): Promise<Order> {
    try {
        const response = await axios.patch(
            `/api/orders/${orderId}/cancel`,
            { reason },
            {
                headers: {
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Orders] Cancelled order:', orderId);
        return response.data.data;
    } catch (error: any) {
        console.error('[Orders] Failed to cancel order:', error.message);
        throw error;
    }
}

/**
 * Get order statistics for a customer
 */
export async function getCustomerOrderStats(
    customerId: string,
    accessToken: string
): Promise<{
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    last_order_date?: string;
}> {
    try {
        const response = await axios.get(
            `/api/customers/${customerId}/order-stats`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Orders] Failed to fetch order statistics:', error.message);
        throw error;
    }
}