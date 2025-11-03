/**
 * @fileOverview Customers API Module
 * 
 * Comprehensive customer profile and address management for the BuyJan e-commerce platform including:
 * - Customer profile creation (auto-created on user login/registration)
 * - Customer profile retrieval and updates
 * - Customer address management (add, update, delete)
 * - Default shipping and billing address configuration
 * - Loyalty points tracking
 * - Customer data enrichment (phone, DOB, etc.)
 * 
 * Features:
 * - Automatic customer profile creation linked to Directus user
 * - Support for multiple shipping/billing addresses
 * - Default address selection for quick checkout
 * - Phone number and date of birth tracking
 * - Loyalty points management
 * - Address type classification (home, office, etc.)
 * - Full address history retention
 * - Timezone-aware timestamps
 * 
 * @module lib/api/customers
 * @requires axios - HTTP client for API calls
 * @requires @/types/collections - Type definitions for Customer, CustomerAddress
 * 
 * @example
 * // Create customer profile after user registration
 * import { createCustomerProfile } from '@/lib/api/customers';
 * 
 * const customer = await createCustomerProfile(
 *   userId,
 *   accessToken,
 *   {
 *     phone: '9689123456',
 *     date_of_birth: '1990-01-15'
 *   }
 * );
 * 
 * // Create customer address
 * const address = await createCustomerAddress(
 *   customerId,
 *   accessToken,
 *   {
 *     first_name: 'Ahmed',
 *     last_name: 'Al Balushi',
 *     address_line_1: 'Building 123',
 *     city: 'Muscat',
 *     postal_code: '113',
 *     countries: 'OM',
 *     type: 'home'
 *   }
 * );
 * 
 * // Set as default shipping address
 * await setDefaultShippingAddress(customerId, addressId, accessToken);
 */

import axios from 'axios';
import { Customer, CustomerAddress } from '@/types/collections';

/**
 * Create a new customer record for a logged-in user
 * Called automatically after user registration/login
 */
export async function createCustomerProfile(
    userId: string,
    accessToken: string,
    data?: Partial<Customer>
): Promise<Customer> {
    try {
        const response = await axios.post(
            '/api/customers',
            {
                user: userId,
                phone: data?.phone,
                date_of_birth: data?.date_of_birth,
                loyalty_points: 0,
                ...data,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Customers] Created customer profile:', response.data.data);
        return response.data.data;
    } catch (error: any) {
        console.error('[Customers] Failed to create customer profile:', error.message);
        console.error('[Customers] Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
        });
        throw error;
    }
}

/**
 * Get customer profile by user ID
 */
export async function getCustomerProfile(
    userId: string,
    accessToken: string
): Promise<Customer | null> {
    try {
        const response = await axios.get(
            `/api/customers/by-user/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.data.data) {
            console.log('[Customers] Customer profile data is null/undefined for user:', userId);
            return null;
        }

        console.log('[Customers] Successfully fetched customer profile for user:', userId);
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log('[Customers] Customer profile not found (404) for user:', userId);
            return null;
        }
        console.error('[Customers] Failed to fetch customer profile:', error.message);
        console.error('[Customers] Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
        });
        throw error;
    }
}

/**
 * Get customer profile by customer ID
 */
export async function getCustomerProfileById(
    customerId: string,
    accessToken: string
): Promise<Customer | null> {
    try {
        const response = await axios.get(
            `/api/customers/${customerId}`,
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
            console.log('[Customers] Customer profile not found for customer ID:', customerId);
            return null;
        }
        console.error('[Customers] Failed to fetch customer profile by ID:', error.message);
        throw error;
    }
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
    customerId: string,
    accessToken: string,
    updates: Partial<Customer>
): Promise<Customer> {
    try {
        const response = await axios.patch(
            `/api/customers/${customerId}`,
            updates,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Customers] Updated customer profile');
        return response.data.data;
    } catch (error: any) {
        console.error('[Customers] Failed to update customer profile:', error.message);
        throw error;
    }
}

/**
 * Add loyalty points to customer
 */
export async function addLoyaltyPoints(
    customerId: string,
    points: number,
    accessToken: string
): Promise<Customer> {
    try {
        const response = await axios.post(
            `/api/customers/${customerId}/loyalty-points`,
            { points },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Customers] Failed to add loyalty points:', error.message);
        throw error;
    }
}

// ============================================================================
// CUSTOMER ADDRESSES
// ============================================================================

/**
 * Create a new address for a customer
 */
export async function createCustomerAddress(
    customerId: string,
    accessToken: string,
    address: Partial<CustomerAddress>
): Promise<CustomerAddress> {
    try {
        const response = await axios.post(
            `/api/customers/${customerId}/addresses`,
            {
                customer: customerId,
                ...address,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Addresses] Created customer address');
        return response.data.data;
    } catch (error: any) {
        console.error('[Addresses] Failed to create address:', error.message);
        console.error('[Addresses] Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
            errorMessage: error.response?.data?.error,
        });

        // Enhance the error message with API response details
        const apiErrorMsg = error.response?.data?.error;
        if (apiErrorMsg) {
            const enhancedError = new Error(apiErrorMsg) as any;
            enhancedError.response = error.response;
            throw enhancedError;
        }

        throw error;
    }
}

/**
 * Get all addresses for a customer
 */
export async function getCustomerAddresses(
    customerId: string,
    accessToken: string
): Promise<CustomerAddress[]> {
    try {
        const response = await axios.get(
            `/api/customers/${customerId}/addresses`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data || [];
    } catch (error: any) {
        console.error('[Addresses] Failed to fetch customer addresses:', error.message);
        throw error;
    }
}

/**
 * Get a single address by ID
 */
export async function getCustomerAddress(
    addressId: string,
    accessToken: string
): Promise<CustomerAddress | null> {
    try {
        const response = await axios.get(
            `/api/addresses/${addressId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data || null;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log('[Addresses] Address not found:', addressId);
            return null;
        }
        console.error('[Addresses] Failed to fetch address:', error.message);
        throw error;
    }
}

/**
 * Update a customer address
 */
export async function updateCustomerAddress(
    addressId: string,
    accessToken: string,
    updates: Partial<CustomerAddress>
): Promise<CustomerAddress> {
    try {
        const response = await axios.patch(
            `/api/addresses/${addressId}`,
            updates,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Addresses] Updated customer address');
        return response.data.data;
    } catch (error: any) {
        console.error('[Addresses] Failed to update address:', error.message);
        throw error;
    }
}

/**
 * Delete a customer address
 */
export async function deleteCustomerAddress(
    addressId: string,
    accessToken: string
): Promise<void> {
    try {
        await axios.delete(
            `/api/addresses/${addressId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('[Addresses] Deleted customer address');
    } catch (error: any) {
        console.error('[Addresses] Failed to delete address:', error.message);
        throw error;
    }
}

/**
 * Set default shipping address
 */
export async function setDefaultShippingAddress(
    customerId: string,
    addressId: string,
    accessToken: string
): Promise<Customer> {
    try {
        const response = await axios.patch(
            `/api/customers/${customerId}`,
            { default_shipping: addressId },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Addresses] Failed to set default shipping address:', error.message);
        throw error;
    }
}

/**
 * Set default billing address
 */
export async function setDefaultBillingAddress(
    customerId: string,
    addressId: string,
    accessToken: string
): Promise<Customer> {
    try {
        const response = await axios.patch(
            `/api/customers/${customerId}`,
            { default_billing: addressId },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Addresses] Failed to set default billing address:', error.message);
        throw error;
    }
}