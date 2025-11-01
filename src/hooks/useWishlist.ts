import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import {
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
    getWishlist,
    getWishlistCount,
} from '@/lib/api/wishlist';
import { WishlistItem } from '@/types/collections';

interface UseWishlistOptions {
    autoLoad?: boolean;
}

export function useWishlist(options: UseWishlistOptions = { autoLoad: true }) {
    const { customer_id, access_token, is_authenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

    const fetchWishlist = useCallback(async () => {
        if (!customer_id || !access_token) return;

        try {
            setIsLoading(true);
            setError(null);

            const result = await getWishlist(customer_id, access_token, { limit: 100 });
            setWishlistItems(result.items);
            setWishlistCount(result.total);

            const productIds = new Set(result.items.map(item => 
                typeof item.product === 'string' ? item.product : item.product?.id
            ).filter(Boolean));
            setWishlisted(productIds);
        } catch (err: any) {
            console.error('[useWishlist] Failed to fetch wishlist:', err);
            setError(err.message || 'Failed to load wishlist');
        } finally {
            setIsLoading(false);
        }
    }, [customer_id, access_token]);

    useEffect(() => {
        if (options.autoLoad && is_authenticated && customer_id && access_token) {
            fetchWishlist();
        }
    }, [is_authenticated, customer_id, access_token, options.autoLoad, fetchWishlist]);

    const addToWishlistHandler = useCallback(async (productId: string) => {
        if (!customer_id || !access_token) {
            setError('Not authenticated');
            return false;
        }

        try {
            setError(null);
            const item = await addToWishlist(customer_id, productId, access_token);
            
            setWishlistItems(prev => [...prev, item]);
            setWishlisted(prev => new Set(prev).add(productId));
            setWishlistCount(prev => prev + 1);

            return true;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to add to wishlist';
            setError(errorMsg);
            console.error('[useWishlist] Failed to add to wishlist:', err);
            return false;
        }
    }, [customer_id, access_token]);

    const removeFromWishlistHandler = useCallback(async (productId: string) => {
        if (!customer_id || !access_token) {
            setError('Not authenticated');
            return false;
        }

        try {
            setError(null);
            const itemToRemove = wishlistItems.find(item => {
                const itemProductId = typeof item.product === 'string' ? item.product : item.product?.id;
                return itemProductId === productId;
            });

            if (!itemToRemove) {
                return false;
            }

            await removeFromWishlist(itemToRemove.id, access_token);

            setWishlistItems(prev => prev.filter(item => {
                const itemProductId = typeof item.product === 'string' ? item.product : item.product?.id;
                return itemProductId !== productId;
            }));
            
            setWishlisted(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
            
            setWishlistCount(prev => Math.max(0, prev - 1));

            return true;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to remove from wishlist';
            setError(errorMsg);
            console.error('[useWishlist] Failed to remove from wishlist:', err);
            return false;
        }
    }, [customer_id, access_token, wishlistItems]);

    const toggleWishlist = useCallback(async (productId: string) => {
        const isWishlisted = wishlisted.has(productId);
        
        if (isWishlisted) {
            return removeFromWishlistHandler(productId);
        } else {
            return addToWishlistHandler(productId);
        }
    }, [wishlisted, addToWishlistHandler, removeFromWishlistHandler]);

    const isProductWishlisted = useCallback((productId: string) => {
        return wishlisted.has(productId);
    }, [wishlisted]);

    return {
        wishlistItems,
        wishlistCount,
        isLoading,
        error,
        wishlisted,
        isAuthenticated: is_authenticated,
        addToWishlist: addToWishlistHandler,
        removeFromWishlist: removeFromWishlistHandler,
        toggleWishlist,
        isProductWishlisted,
        refetch: fetchWishlist,
        clearError: () => setError(null),
    };
}
