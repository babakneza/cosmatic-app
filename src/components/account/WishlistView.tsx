'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { WishlistItem } from '@/types/collections';
import { Product } from '@/types';
import {
    Heart,
    ShoppingCart,
    X,
    ArrowRight,
    Share2,
    Copy,
    AlertCircle,
    Package,
    TrendingUp,
} from 'lucide-react';
import { formatOMR } from '@/lib/currency';
import { useCartStore } from '@/store/cart';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistViewProps {
    locale: string;
}

interface WishlistItemWithProduct extends WishlistItem {
    productData?: Product;
}

type FilterType = 'all' | 'premium' | 'trending';

export default function WishlistView({ locale }: WishlistViewProps) {
    const t = useTranslations();
    const { addItem } = useCartStore();
    const { wishlistItems, wishlistCount, isLoading: wishlistLoading, error: wishlistError, removeFromWishlist } = useWishlist();
    const [items, setItems] = useState<WishlistItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sharedId, setSharedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        console.log('[WishlistView] items state changed:', { itemsCount: items.length, items: items.map(i => ({ id: i.id, hasProduct: !!i.productData })) });
    }, [items]);

    useEffect(() => {
        console.log('[WishlistView] useEffect triggered. wishlistItems:', wishlistItems.length, 'wishlistLoading:', wishlistLoading);
        
        try {
            setLoading(wishlistLoading);
            setError(null);

            console.log('[WishlistView] Processing wishlist items:', {
                totalItems: wishlistItems.length,
                items: wishlistItems.map(item => ({
                    id: item.id,
                    product: item.product,
                    productType: typeof item.product
                }))
            });

            const validItems = wishlistItems.filter(item => {
                const productId = typeof item.product === 'object' ? item.product?.id : item.product;
                if (!productId) {
                    console.warn('[WishlistView] Skipping wishlist item without product ID:', JSON.stringify(item));
                    return false;
                }
                console.log('[WishlistView] Valid item found with productId:', productId);
                return true;
            });

            console.log('[WishlistView] After filtering - valid items:', validItems.length);

            if (validItems.length === 0) {
                console.warn('[WishlistView] No valid items after filtering. Setting items to empty array.');
                setItems([]);
                return;
            }

            const itemsWithProducts = validItems.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null;
                if (product) {
                    console.log(`[WishlistView] Using expanded product data for ID: ${product.id}`);
                    return { ...item, productData: product as Product };
                } else {
                    console.warn('[WishlistView] Product not expanded in wishlist item:', item);
                    return item;
                }
            });

            console.log('[WishlistView] Setting items with products. Count:', itemsWithProducts.length);
            setItems(itemsWithProducts as WishlistItemWithProduct[]);

            if (wishlistError) {
                console.log('[WishlistView] Setting error:', wishlistError);
                setError(wishlistError);
            }
        } catch (err: any) {
            console.error('Failed to process wishlist items:', err);
            setError(err.message || 'Failed to load wishlist');
        }
    }, [wishlistItems, wishlistLoading, wishlistError]);

    const handleRemove = async (productId: string, itemId: string) => {
        try {
            await removeFromWishlist(productId);
        } catch (err: any) {
            console.error('Failed to remove item:', err);
            alert('Failed to remove item from wishlist');
        }
    };

    const handleAddToCart = (item: WishlistItemWithProduct) => {
        if (item.productData) {
            setLoadingItems((prev) => ({ ...prev, [item.id]: true }));
            try {
                addItem(item.productData, 1);
                const productId = typeof item.product === 'object' ? item.product?.id : item.product;
                if (productId) {
                    handleRemove(productId, item.id);
                }
            } finally {
                setLoadingItems((prev) => ({ ...prev, [item.id]: false }));
            }
        }
    };

    const handleShare = (item: WishlistItemWithProduct) => {
        const product = item.productData;
        if (product) {
            const url = `${window.location.origin}/${locale}/products/${product.slug}`;
            const text = `Check out ${product.name} on BuyJan!`;

            if (navigator.share) {
                navigator.share({ title: product.name, text, url });
            } else {
                // Fallback: Show share options
                setSharedId(item.id);
                setTimeout(() => setSharedId(null), 2000);
            }
        }
    };

    const handleCopyLink = (item: WishlistItemWithProduct) => {
        const product = item.productData;
        if (product) {
            const url = `${window.location.origin}/${locale}/products/${product.slug}`;
            navigator.clipboard.writeText(url);
            setCopiedId(item.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const totalValue =
        items.reduce((sum, item) => sum + (item.productData?.price || 0), 0) || 0;

    const filteredItems = items.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'premium' && item.productData?.price) return item.productData.price > 100;
        if (filter === 'trending') return Math.random() > 0.5;
        return true;
    });

    if (loading || wishlistLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse h-40 rounded-xl"
                    ></div>
                ))}
            </div>
        );
    }

    if (error || wishlistError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error Loading Wishlist</h3>
                    <p className="text-red-700">{error || wishlistError}</p>
                </div>
            </div>
        );
    }

    if (items.length === 0 && wishlistItems.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="w-20 h-20 bg-rose-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start saving your favorite beauty products! Items you love will appear here for easy access.
                </p>
                <Link
                    href={`/${locale}/shop`}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Explore Products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Wishlist Header Stats */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg md:rounded-xl p-3 md:p-4">
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm text-blue-600 font-medium mb-0.5 md:mb-1">Total Items</p>
                            <p className="text-2xl md:text-3xl font-bold text-blue-900">{wishlistCount}</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg md:rounded-xl p-3 md:p-4">
                    <p className="text-xs md:text-sm text-purple-600 font-medium mb-1 md:mb-2">Total Value</p>
                    <p className="text-lg md:text-3xl font-bold text-purple-900 break-words">
                        {formatOMR(totalValue, locale as any)}
                    </p>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1 md:gap-2 overflow-x-auto sm:flex-wrap">
                {(['all', 'premium', 'trending'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2 md:px-4 py-1 md:py-2 rounded-full font-medium text-xs md:text-sm transition whitespace-nowrap ${filter === f
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all'
                            ? `All (${wishlistCount})`
                            : f === 'premium'
                                ? `Premium (${items.filter((item) => item.productData?.price && item.productData.price > 100).length})`
                                : `Trending (${Math.floor(wishlistCount / 2)})`}
                    </button>
                ))}
            </div>

            {/* Wishlist Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">No items match your filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredItems.map((item) => {
                        const product = item.productData;
                        const dateAdded = new Date(
                            item.date_added || item.created_at || ''
                        ).toLocaleDateString();

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group flex flex-col"
                            >
                                {/* Product Image Container */}
                                <div className="relative h-56 bg-gray-100 overflow-hidden">
                                    {product && (product.images && product.images.length > 0 && product.images[0]?.url) ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : product?.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <Package className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Heart Badge */}
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full p-2 shadow-md">
                                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 p-4 flex flex-col">
                                    {product ? (
                                        <>
                                            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-3 line-clamp-2 hover:line-clamp-none">
                                                {product.name}
                                            </h3>
                                            <div className="mb-3">
                                                <p className="text-lg sm:text-xl font-bold text-gold">
                                                    {formatOMR(product.price, locale as any)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Added {dateAdded}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-100 animate-pulse h-20 rounded mb-3"></div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-2 mt-auto">
                                        {product && (
                                            <Link
                                                href={`/${locale}/products/${product.slug}`}
                                                className="block w-full px-3 py-2 bg-gradient-to-r from-primary via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white rounded-lg transition font-medium text-sm text-center"
                                            >
                                                View Product
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={loadingItems[item.id] || !product}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Add to Cart
                                        </button>

                                        {/* Secondary Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleShare(item)}
                                                title="Share this item"
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition text-sm border border-blue-200"
                                            >
                                                <Share2 className="w-4 h-4 sm:w-3 sm:h-3" />
                                                Share
                                            </button>
                                            <button
                                                onClick={() => handleCopyLink(item)}
                                                title="Copy link"
                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 font-medium rounded-lg transition text-sm border ${copiedId === item.id
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}
                                            >
                                                <Copy className="w-4 h-4 sm:w-3 sm:h-3" />
                                                {copiedId === item.id ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const productId = typeof item.product === 'object' ? item.product?.id : item.product;
                                                if (productId) {
                                                    handleRemove(productId, item.id);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition text-sm border border-red-200"
                                        >
                                            <X className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-700">
                    💡 <span className="font-medium">Tip:</span> You can share your wishlist with friends or
                    save the links to your favorites!
                </p>
            </div>
        </div>
    );
}
