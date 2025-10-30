/**
 * Wishlist API
 * Handles customer wishlists
 */

import axios from 'axios';
import { WishlistItem } from '@/types/collections';
import { Product } from '@/types';

/**
 * Add product to wishlist
 */
export async function addToWishlist(
    customerId: string,
    productId: string,
    accessToken: string
): Promise<WishlistItem> {
    try {
        const response = await axios.post(
            '/api/wishlist',
            {
                customer: customerId,
                product: productId,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Wishlist] Added product to wishlist:', productId);
        return response.data.data;
    } catch (error: any) {
        console.error('[Wishlist] Failed to add to wishlist:', error.message);
        throw error;
    }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(
    wishlistItemId: string,
    accessToken: string
): Promise<void> {
    try {
        await axios.delete(
            `/api/wishlist/${wishlistItemId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('[Wishlist] Removed item from wishlist');
    } catch (error: any) {
        console.error('[Wishlist] Failed to remove from wishlist:', error.message);
        throw error;
    }
}

/**
 * Check if product is in wishlist
 */
export async function isProductInWishlist(
    customerId: string,
    productId: string,
    accessToken: string
): Promise<boolean> {
    try {
        const response = await axios.get(
            `/api/wishlist/check?customer=${customerId}&product=${productId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data?.exists || false;
    } catch (error: any) {
        console.error('[Wishlist] Failed to check wishlist:', error.message);
        return false;
    }
}

/**
 * Get customer's wishlist
 */
export async function getWishlist(
    customerId: string,
    accessToken: string,
    filters?: {
        limit?: number;
        offset?: number;
    }
): Promise<{ items: (WishlistItem & { product?: Product })[]; total: number }> {
    try {
        const params = new URLSearchParams();

        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        if (filters?.offset) {
            params.append('offset', String(filters.offset));
        }

        const response = await axios.get(
            `/api/customers/${customerId}/wishlist?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return {
            items: response.data.data || [],
            total: response.data.meta?.total_count || 0,
        };
    } catch (error: any) {
        console.error('[Wishlist] Failed to fetch wishlist:', error.message);
        throw error;
    }
}

/**
 * Get wishlist count
 */
export async function getWishlistCount(
    customerId: string,
    accessToken: string
): Promise<number> {
    try {
        const response = await axios.get(
            `/api/customers/${customerId}/wishlist/count`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.data?.count || 0;
    } catch (error: any) {
        console.error('[Wishlist] Failed to fetch wishlist count:', error.message);
        throw error;
    }
}

/**
 * Clear entire wishlist
 */
export async function clearWishlist(
    customerId: string,
    accessToken: string
): Promise<void> {
    try {
        await axios.delete(
            `/api/customers/${customerId}/wishlist`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('[Wishlist] Cleared wishlist');
    } catch (error: any) {
        console.error('[Wishlist] Failed to clear wishlist:', error.message);
        throw error;
    }
}

/**
 * Move wishlist item to cart
 */
export async function moveWishlistToCart(
    wishlistItemId: string,
    quantity: number,
    accessToken: string
): Promise<{ success: boolean }> {
    try {
        const response = await axios.post(
            `/api/wishlist/${wishlistItemId}/to-cart`,
            { quantity },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Wishlist] Moved item to cart');
        return response.data.data;
    } catch (error: any) {
        console.error('[Wishlist] Failed to move to cart:', error.message);
        throw error;
    }
}