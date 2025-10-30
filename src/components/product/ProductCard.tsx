'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Price from '@/components/ui/Price';
import { isRTL } from '@/lib/utils';
import type { Locale } from '@/types';
import type { Product } from '@/types';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onAddToWishlist?: (product: Product) => void;
    variant?: 'grid' | 'list';
}

export default function ProductCard({
    product,
    onAddToCart,
    onAddToWishlist,
    variant = 'grid',
}: ProductCardProps) {
    const t = useTranslations();
    const params = useParams();
    const locale = (params?.locale as Locale) || 'en';
    const rtl = isRTL(locale);

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const productName = (locale === 'ar' ? product.name_ar || product.name : product.name)?.trim?.() || '';
    const displayPrice = product.sale_price || product.price;
    const saleDiscount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : null;

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        onAddToWishlist?.(product);
    };

    if (variant === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow"
                dir={rtl ? 'rtl' : 'ltr'}
            >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                        src={product.image || '/images/placeholder-product.jpg'}
                        alt={productName}
                        fill
                        className="object-cover rounded-md"
                    />
                    {saleDiscount && (
                        <Badge variant="sale" className="absolute top-2 left-2">
                            -{saleDiscount}%
                        </Badge>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <Link href={`/${locale}/products/${product.slug}`}>
                            <h3 className="text-sm font-semibold text-neutral-900 hover:text-primary transition-colors line-clamp-2">
                                {productName}
                            </h3>
                        </Link>
                        <p className="text-xs text-neutral-600 mt-1 line-clamp-1">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Price
                                amount={displayPrice}
                                locale={locale}
                                size="lg"
                                weight="bold"
                                className="text-primary"
                            />
                            {product.sale_price && (
                                <Price
                                    amount={product.price}
                                    locale={locale}
                                    size="sm"
                                    strikethrough
                                    className="text-neutral-400"
                                />
                            )}
                        </div>
                        <Button
                            size="sm"
                            icon={<ShoppingCart className="w-4 h-4" />}
                            onClick={() => onAddToCart?.(product)}
                        >
                            {t('common.addToCart')}
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid variant (default)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg sm:hover:shadow-xl transition-shadow h-full flex flex-col"
            dir={rtl ? 'rtl' : 'ltr'}
        >
            {/* Image Container - Responsive aspect ratio */}
            <Link href={`/${locale}/products/${product.slug}`} className="flex-shrink-0">
                <div className="relative w-full aspect-square sm:aspect-square overflow-hidden bg-neutral-100">
                    <Image
                        src={product.image || '/images/placeholder-product.jpg'}
                        alt={productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Badges */}
                    <div className={`absolute top-1.5 sm:top-3 ${rtl ? 'left-1.5 sm:left-3' : 'right-1.5 sm:right-3'} flex flex-col gap-1 sm:gap-2`}>
                        {saleDiscount && (
                            <Badge variant="sale" className="animate-pulse text-xs sm:text-sm">
                                -{saleDiscount}%
                            </Badge>
                        )}
                        {product.is_new && (
                            <Badge variant="new" className="text-xs sm:text-sm">
                                {t('product.new')}
                            </Badge>
                        )}
                        {!product.in_stock && (
                            <Badge variant="outOfStock" className="text-xs sm:text-sm">
                                {t('product.outOfStock')}
                            </Badge>
                        )}
                    </div>

                    {/* Hover Overlay with Actions - Desktop only */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="hidden sm:flex absolute inset-0 bg-black/40 items-center justify-center gap-2 sm:gap-3"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                            className="bg-white/90 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            title={t('common.addToCart')}
                        >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="bg-white/90 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
                            title={t('common.quickView')}
                        >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="bg-white/90 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleWishlist();
                            }}
                            title={t('common.addToWishlist')}
                        >
                            <Heart
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-accent text-accent' : 'text-neutral-400'}`}
                            />
                        </Button>
                    </motion.div>
                </div>
            </Link>

            {/* Product Info - Compact on mobile */}
            <div className="p-2 sm:p-4 flex-1 flex flex-col">
                <Link href={`/${locale}/products/${product.slug}`}>
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-primary transition-colors line-clamp-2 mb-1 sm:mb-2">
                        {productName}
                    </h3>
                </Link>

                {/* Rating (if available) - Hidden on mobile for space */}
                {product.rating && (
                    <div className="hidden sm:flex items-center gap-1 mb-2">
                        <div className="flex text-accent text-xs">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.round(product.rating || 0) ? 'text-accent' : 'text-neutral-300'}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-xs text-neutral-500">
                            ({product.rating_count || 0})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 mt-auto">
                    <Price
                        amount={displayPrice}
                        locale={locale}
                        size="lg"
                        weight="bold"
                        className="text-primary"
                    />
                    {product.sale_price && (
                        <Price
                            amount={product.price}
                            locale={locale}
                            size="xs"
                            strikethrough
                            className="text-neutral-400"
                        />
                    )}
                </div>

                {/* Add to Cart Button - Compact on mobile */}
                <Button
                    className="w-full text-xs sm:text-sm h-8 sm:h-9"
                    icon={<ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />}
                    size="sm"
                    disabled={!product.in_stock}
                    onClick={() => onAddToCart?.(product)}
                >
                    {product.in_stock ? t('common.addToCart') : t('common.unavailable')}
                </Button>
            </div>

            {/* Wishlist Button (Corner) - Mobile only */}
            <motion.button
                className={`sm:hidden absolute ${rtl ? 'left-1.5' : 'right-1.5'} top-1.5 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg transition-all`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlist();
                }}
                title={t('common.addToWishlist')}
            >
                <Heart
                    className={`w-4 h-4 ${isWishlisted ? 'fill-accent text-accent' : 'text-neutral-400'}`}
                />
            </motion.button>
        </motion.div>
    );
}