/**
 * Coupons API
 * Handles coupon management and validation
 */

import axios from 'axios';
import { Coupon } from '@/types/collections';

/**
 * Get coupon by code
 */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
    try {
        const response = await axios.get(`/api/coupons/by-code/${code}`);

        if (!response.data.data) {
            return null;
        }

        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log('[Coupons] Coupon not found:', code);
            return null;
        }
        console.error('[Coupons] Failed to fetch coupon:', error.message);
        throw error;
    }
}

/**
 * Validate coupon and calculate discount
 */
export async function validateCoupon(
    code: string,
    cartTotal: number
): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount_amount?: number;
    error?: string;
}> {
    try {
        const response = await axios.post(
            '/api/coupons/validate',
            {
                code,
                cart_total: cartTotal,
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Coupons] Failed to validate coupon:', error.message);

        if (error.response?.status === 400 || error.response?.status === 404) {
            return {
                valid: false,
                error: error.response?.data?.message || 'Invalid coupon code',
            };
        }

        throw error;
    }
}

/**
 * Apply coupon to order (server-side, used during checkout)
 */
export async function applyCouponToOrder(
    code: string,
    customerId: string,
    accessToken: string,
    cartTotal: number
): Promise<{
    coupon: Coupon;
    discount_amount: number;
}> {
    try {
        const response = await axios.post(
            '/api/coupons/apply',
            {
                code,
                customer_id: customerId,
                cart_total: cartTotal,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Coupons] Applied coupon:', code);
        return response.data.data;
    } catch (error: any) {
        console.error('[Coupons] Failed to apply coupon:', error.message);
        throw error;
    }
}

/**
 * Get available coupons (public)
 */
export async function getActiveCoupons(): Promise<Coupon[]> {
    try {
        const response = await axios.get('/api/coupons/active');

        return response.data.data || [];
    } catch (error: any) {
        console.error('[Coupons] Failed to fetch active coupons:', error.message);
        throw error;
    }
}

/**
 * Create coupon (admin only)
 */
export async function createCoupon(
    accessToken: string,
    couponData: Partial<Coupon>
): Promise<Coupon> {
    try {
        const response = await axios.post(
            '/api/coupons',
            couponData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Coupons] Created coupon:', couponData.code);
        return response.data.data;
    } catch (error: any) {
        console.error('[Coupons] Failed to create coupon:', error.message);
        throw error;
    }
}

/**
 * Update coupon (admin only)
 */
export async function updateCoupon(
    couponId: string,
    accessToken: string,
    updates: Partial<Coupon>
): Promise<Coupon> {
    try {
        const response = await axios.patch(
            `/api/coupons/${couponId}`,
            updates,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Coupons] Updated coupon:', couponId);
        return response.data.data;
    } catch (error: any) {
        console.error('[Coupons] Failed to update coupon:', error.message);
        throw error;
    }
}

/**
 * Delete coupon (admin only)
 */
export async function deleteCoupon(
    couponId: string,
    accessToken: string
): Promise<void> {
    try {
        await axios.delete(
            `/api/coupons/${couponId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('[Coupons] Deleted coupon:', couponId);
    } catch (error: any) {
        console.error('[Coupons] Failed to delete coupon:', error.message);
        throw error;
    }
}

/**
 * Get all coupons (admin only)
 */
export async function getAllCoupons(
    accessToken: string,
    filters?: {
        is_active?: boolean;
        limit?: number;
        offset?: number;
    }
): Promise<{ data: Coupon[]; total: number }> {
    try {
        const params = new URLSearchParams();

        if (filters?.is_active !== undefined) {
            params.append('is_active', String(filters.is_active));
        }
        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        if (filters?.offset) {
            params.append('offset', String(filters.offset));
        }

        const response = await axios.get(
            `/api/coupons?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return {
            data: response.data.data || [],
            total: response.data.meta?.total_count || 0,
        };
    } catch (error: any) {
        console.error('[Coupons] Failed to fetch coupons:', error.message);
        throw error;
    }
}

/**
 * Calculate discount amount based on coupon and cart total
 */
export function calculateDiscount(coupon: Coupon, cartTotal: number): number {
    if (coupon.minimum_cart_amount && cartTotal < coupon.minimum_cart_amount) {
        return 0; // Minimum cart amount not met
    }

    if (coupon.type === 'percentage') {
        return (cartTotal * coupon.value) / 100;
    } else {
        // Fixed amount
        return Math.min(coupon.value, cartTotal); // Can't discount more than cart total
    }
}

/**
 * Check if coupon is still valid (not expired, under usage limit)
 */
export function isCouponValid(coupon: Coupon): boolean {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom || now > validUntil) {
        return false; // Expired or not yet valid
    }

    if (coupon.max_users && coupon.used_count && coupon.used_count >= coupon.max_users) {
        return false; // Usage limit reached
    }

    return true;
}