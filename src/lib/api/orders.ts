/**
 * @fileOverview Orders API Module
 * 
 * Comprehensive order management for the BuyJan e-commerce platform including:
 * - Order creation with automatic order number generation
 * - Order retrieval and status management
 * - Order item management
 * - Address formatting and validation
 * - Payment tracking
 * 
 * Features:
 * - Automatic generation of unique order numbers (ORD-YYYYMMDD-XXXXXX)
 * - Order status tracking (pending, processing, shipped, delivered, cancelled)
 * - Payment status monitoring (pending, completed, failed)
 * - Support for multiple addresses (shipping and billing)
 * - Tax and shipping calculation integration
 * - Discount/coupon application tracking
 * 
 * @module lib/api/orders
 * @requires axios - HTTP client for API calls
 * @requires @/types/collections - Type definitions for Order, OrderItem, etc.
 * 
 * @example
 * // Create a new order
 * import { createOrder, formatAddressAsJSON } from '@/lib/api/orders';
 * 
 * const orderData = {
 *   customer_email: 'customer@example.com',
 *   shipping_address: formatAddressAsJSON(shippingAddress),
 *   billing_address: formatAddressAsJSON(billingAddress),
 *   items: [
 *     {
 *       product: 'prod-123',
 *       product_name: 'Rose Perfume',
 *       quantity: 2,
 *       unit_price: 45.00,
 *       line_total: 90.00
 *     }
 *   ],
 *   subtotal: 90.00,
 *   tax_rate: 0.05,
 *   tax_amount: 4.50,
 *   shipping_cost: 5.00,
 *   total: 99.50,
 *   payment_method: 'paypal'
 * };
 * 
 * const order = await createOrder(customerId, accessToken, orderData);
 */

import axios from 'axios';
import { Order, OrderItem, OrderStatus, OrderFilters, CustomerAddress } from '@/types/collections';
import { Address } from '@/types';
import { COUNTRY_NAMES_BY_ID } from '@/lib/api/countries';

/**
 * Format address as JSON object for Directus
 * Accepts either CustomerAddress (Directus format) or Address (checkout format)
 * Returns snapshot matching Directus schema
 * 
 * @param address - Address object to format
 * @param addressType - Type of address ('shipping' or 'billing'). Defaults to 'shipping'
 */
export function formatAddressAsJSON(address: Address | CustomerAddress, addressType: 'shipping' | 'billing' = 'shipping'): Record<string, any> {
    // Check if it's a CustomerAddress from Directus
    const isCustomerAddress = 'first_name' in address && 'last_name' in address;

    if (isCustomerAddress) {
        const ca = address as CustomerAddress;
        const countryId = typeof ca.countries === 'object' && ca.countries !== null && 'id' in ca.countries
            ? ca.countries.id
            : ca.countries;

        const json: Record<string, any> = {
            id: ca.id,
            first_name: ca.first_name,
            last_name: ca.last_name,
            address_line_1: ca.address_line_1,
            city: ca.city,
            postal_code: ca.postal_code,
            type: ca.type || addressType,
            countries: countryId,
        };

        // Add country names if country ID is available
        if (countryId) {
            const countryData = COUNTRY_NAMES_BY_ID[countryId];
            if (countryData) {
                json.country_name = countryData.en;
                json.country_name_ar = countryData.ar;
            }
        }

        if (ca.company) json.company = ca.company;
        if (ca.address_line_2) json.address_line_2 = ca.address_line_2;
        if (ca.state) json.state = ca.state;
        if (ca.phone_number) json.phone_number = ca.phone_number;
        if (ca.is_default !== undefined) json.is_default = ca.is_default;
        if (ca.customer) json.customer = ca.customer;
        if (ca.created_at) json.created_at = ca.created_at;
        if (ca.updated_at) json.updated_at = ca.updated_at;

        return json;
    }

    // Address from checkout form - convert to Directus CustomerAddress format
    const a = address as Address;

    // Parse full_name into first_name and last_name
    const fullName = (a.full_name || '').trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const json: Record<string, any> = {
        first_name: firstName,
        last_name: lastName,
        address_line_1: a.street_address || '',
        city: a.wilayat || '',
        state: a.governorate || '',
        postal_code: a.postal_code || '',
        type: addressType,
    };

    // Add optional fields if present
    if (a.phone) json.phone_number = a.phone;
    if (a.building) json.address_line_2 = a.building;
    if (a.country_id) {
        json.countries = a.country_id;
        // Add country name alongside the ID
        const countryData = COUNTRY_NAMES_BY_ID[a.country_id];
        if (countryData) {
            json.country_name = countryData.en;
            json.country_name_ar = countryData.ar;
        }
    }

    return json;
}

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
        // Get the base URL for API calls
        // In development, always use localhost:3000 for server-side calls
        // In production, use NEXT_PUBLIC_SITE_URL
        const isDevelopment = process.env.NODE_ENV === 'development';
        let baseUrl: string;

        if (isDevelopment) {
            baseUrl = 'http://localhost:3000';
            console.log('[Orders] Using development server-side URL:', baseUrl);
        } else {
            baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            if (baseUrl === 'http://localhost:3000' && !process.env.NEXT_PUBLIC_SITE_URL) {
                console.warn('[Orders] No NEXT_PUBLIC_SITE_URL configured in production, using fallback');
            } else {
                console.log('[Orders] Using production URL:', baseUrl);
            }
        }

        // Construct absolute URL
        const url = `${baseUrl}/api/orders`;
        console.log('[Orders] Creating order at:', url);

        const response = await axios.post(
            url,
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
        console.error('[Orders] Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
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