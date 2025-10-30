'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getWishlist, removeFromWishlist } from '@/lib/api/wishlist';
import { getProduct } from '@/lib/api/products';
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
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { formatOMR } from '@/lib/currency';
import { useCartStore } from '@/store/cart';

interface WishlistViewProps {
    customerId: string;
    accessToken: string;
    locale: string;
}

interface WishlistItemWithProduct extends WishlistItem {
    productData?: Product;
}

type FilterType = 'all' | 'premium' | 'trending';

export default function WishlistView({ customerId, accessToken, locale }: WishlistViewProps) {
    const t = useTranslations();
    const { addItem } = useCartStore();
    const [items, setItems] = useState<WishlistItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sharedId, setSharedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await getWishlist(customerId, accessToken, { limit: 100 });

                // Fetch product details for each wishlist item
                const itemsWithProducts = await Promise.all(
                    result.items.map(async (item) => {
                        try {
                            const product = await getProduct(item.product as string);
                            return { ...item, productData: product };
                        } catch (err) {
                            console.error('Failed to fetch product:', err);
                            return item;
                        }
                    })
                );

                setItems(itemsWithProducts as WishlistItemWithProduct[]);
            } catch (err: any) {
                console.error('Failed to fetch wishlist:', err);
                setError(err.message || 'Failed to load wishlist');
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [customerId, accessToken]);

    const handleRemove = async (itemId: string) => {
        try {
            await removeFromWishlist(itemId, accessToken);
            setItems(items.filter((item) => item.id !== itemId));
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
                handleRemove(item.id);
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
        if (filter === 'trending') return Math.random() > 0.5; // Placeholder logic
        return true;
    });

    if (loading) {
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

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error Loading Wishlist</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
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
        <div className="space-y-6">
            {/* Wishlist Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium mb-1">Total Items</p>
                            <p className="text-3xl font-bold text-blue-900">{items.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium mb-1">Total Value</p>
                            <p className="text-3xl font-bold text-purple-900">
                                {formatOMR(totalValue, locale as any)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-rose-600 font-medium mb-1">Avg Price</p>
                            <p className="text-3xl font-bold text-rose-900">
                                {formatOMR(totalValue / items.length, locale as any)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-rose-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'premium', 'trending'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full font-medium transition ${filter === f
                            ? 'bg-gold text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all'
                            ? `All Items (${items.length})`
                            : f === 'premium'
                                ? `Premium (${items.filter((item) => item.productData?.price && item.productData.price > 100).length})`
                                : `Trending (${Math.floor(items.length / 2)})`}
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
                                    {product && product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
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
                                    {product && (
                                        <>
                                            <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:line-clamp-none">
                                                {product.name}
                                            </h3>
                                            {product.description && (
                                                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                                    {product.description}
                                                </p>
                                            )}
                                            <div className="mb-3">
                                                <p className="text-lg font-bold text-gold">
                                                    {formatOMR(product.price, locale as any)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Added {dateAdded}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-2 mt-auto">
                                        {product && (
                                            <Link
                                                href={`/${locale}/products/${product.slug}`}
                                                className="block w-full px-3 py-2 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg transition font-medium text-sm text-center"
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
                                                <Share2 className="w-3 h-3" />
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
                                                <Copy className="w-3 h-3" />
                                                {copiedId === item.id ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemove(item.id)}
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