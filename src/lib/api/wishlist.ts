/**
 * Wishlist API
 * Handles customer wishlists with Directus collection
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
            `/api/wishlist?customer=${customerId}&product=${productId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return (response.data.data && response.data.data.length > 0) || false;
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
): Promise<{ items: WishlistItem[]; total: number }> {
    try {
        const params = new URLSearchParams();
        params.append('customer', customerId);

        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        if (filters?.offset) {
            params.append('offset', String(filters.offset));
        }

        const response = await axios.get(
            `/api/wishlist?${params.toString()}`,
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
 * Get wishlist count for a customer
 */
export async function getWishlistCount(
    customerId: string,
    accessToken: string
): Promise<number> {
    try {
        const response = await axios.get(
            `/api/wishlist?customer=${customerId}&limit=1`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.meta?.total_count || 0;
    } catch (error: any) {
        console.error('[Wishlist] Failed to fetch wishlist count:', error.message);
        return 0;
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
        const wishlistResponse = await getWishlist(customerId, accessToken, { limit: 1000 });
        
        await Promise.all(
            wishlistResponse.items.map(item => 
                removeFromWishlist(item.id, accessToken)
            )
        );

        console.log('[Wishlist] Cleared wishlist');
    } catch (error: any) {
        console.error('[Wishlist] Failed to clear wishlist:', error.message);
        throw error;
    }
}