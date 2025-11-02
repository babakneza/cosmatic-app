'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Price from '@/components/ui/Price';
import { isRTL } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import type { Locale } from '@/types';
import type { Product } from '@/types';

interface InstagramProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onAddToWishlist?: (product: Product) => void;
}

export default function InstagramProductCard({
    product,
    onAddToCart,
    onAddToWishlist,
}: InstagramProductCardProps) {
    const t = useTranslations();
    const params = useParams();
    const locale = (params?.locale as Locale) || 'en';
    const rtl = isRTL(locale);

    const { isProductWishlisted, toggleWishlist } = useWishlist();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const touchStartXRef = useRef<number>(0);
    const galleryContainerRef = useRef<HTMLDivElement>(null);

    const isLiked = isProductWishlisted(product.id);

    const productName = (locale === 'ar' ? product.name_ar || product.name : product.name)?.trim?.() || '';
    const displayPrice = product.sale_price || product.price;
    const saleDiscount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : null;

    // Get product images - same logic as ProductGallery component
    const images = (
        (product as any).processedImages && Array.isArray((product as any).processedImages) && (product as any).processedImages.length > 0
            ? (product as any).processedImages.map((img: any) => img.url)
            : product.images && Array.isArray(product.images) && product.images.length > 0
                ? product.images.map((img: any) => typeof img === 'string' ? img : img.url)
                : [(product as any).mainImageUrl || product.image || '/images/placeholder-product.jpg']
    );

    const currentImage = images[currentImageIndex];

    // Debug logging - log product data and images
    React.useEffect(() => {
        console.log(`[InstagramProductCard] Rendering product:`, {
            productName,
            imagesCount: images.length,
            processedImages: (product as any).processedImages,
            images: product.images,
            mainImageUrl: (product as any).mainImageUrl,
            productImage: product.image
        });
    }, [productName, images.length, product]);

    // Handle swipe for image navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (images.length <= 1) {
            return;
        }

        if (!e.changedTouches?.[0]) {
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartXRef.current - touchEndX;
        const minSwipeDistance = 50;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) {
                // Swipe left - next image
                if (currentImageIndex < images.length - 1) {
                    setCurrentImageIndex(currentImageIndex + 1);
                }
            } else {
                // Swipe right - previous image
                if (currentImageIndex > 0) {
                    setCurrentImageIndex(currentImageIndex - 1);
                }
            }
        }
    };

    const handleLike = async () => {
        setShowHeartAnimation(true);
        await toggleWishlist(product.id);
        setTimeout(() => setShowHeartAnimation(false), 600);
        onAddToWishlist?.(product);
    };

    const handleShare = () => {
        setShowShareMenu(!showShareMenu);
        // Share functionality - copy to clipboard or native share
        const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/products/${product.slug}`;
        if (navigator.share) {
            navigator.share({
                title: productName,
                text: `Check out this amazing product: ${productName}`,
                url: shareUrl,
            }).catch(() => { });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl);
        }
    };

    const navigateImage = (direction: 'next' | 'prev') => {
        if (direction === 'next' && currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else if (direction === 'prev' && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const handleImageContainerClick = () => {
        // Navigate to product detail page when image is clicked
        window.location.href = `/${locale}/products/${product.slug}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
            dir={rtl ? 'rtl' : 'ltr'}
        >
            {/* Image Carousel Container */}
            <div
                className="relative w-full aspect-square bg-neutral-100 overflow-hidden cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleImageContainerClick}
            >
                {/* Images */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={currentImage}
                            alt={`${productName} - Image ${currentImageIndex + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                            priority={currentImageIndex === 0}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Badges - Top Right */}
                <div className={`absolute top-2 sm:top-3 ${rtl ? 'left-2 sm:left-3' : 'right-2 sm:right-3'} flex flex-col gap-1.5 z-10`}>
                    {saleDiscount && (
                        <Badge variant="sale" className="text-xs font-bold px-2 py-1">
                            -{saleDiscount}%
                        </Badge>
                    )}
                    {product.is_new && (
                        <Badge variant="new" className="text-xs px-2 py-1">
                            {t('product.new')}
                        </Badge>
                    )}
                </div>

                {/* Double-tap Heart Animation */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Heart
                                className="w-24 h-24 fill-white text-white drop-shadow-lg"
                                strokeWidth={1}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Navigation - Desktop/Tablet only */}
                {images.length > 1 && (
                    <>
                        {/* Left Arrow */}
                        <button
                            className={`hidden sm:flex absolute top-1/2 ${rtl ? 'right-2' : 'left-2'} transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition-all`}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('prev');
                            }}
                            disabled={currentImageIndex === 0}
                        >
                            <ChevronLeft size={20} className="text-neutral-700" />
                        </button>

                        {/* Right Arrow */}
                        <button
                            className={`hidden sm:flex absolute top-1/2 ${rtl ? 'left-2' : 'right-2'} transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition-all`}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('next');
                            }}
                            disabled={currentImageIndex === images.length - 1}
                        >
                            <ChevronRight size={20} className="text-neutral-700" />
                        </button>
                    </>
                )}

                {/* Image Indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
                        {images.map((_: string, index: number) => (
                            <motion.div
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 w-1.5'
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Like Button - Bottom Right Corner */}
                <motion.button
                    className={`absolute bottom-2 sm:bottom-3 ${rtl ? 'left-2 sm:left-3' : 'right-2 sm:right-3'} z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md hover:shadow-lg transition-all`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike();
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Heart
                        size={18}
                        className={`transition-all ${isLiked ? 'fill-accent text-accent' : 'text-neutral-400'
                            }`}
                    />
                </motion.button>

                {/* Out of Stock Overlay */}
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
                        <div className="bg-white/95 px-4 py-2 rounded-lg">
                            <p className="text-sm font-semibold text-neutral-900">
                                {t('product.outOfStock')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation - Show if multiple images */}
            {images.length > 1 && (
                <div className="px-2 sm:px-3 py-1.5 border-t border-neutral-100 flex gap-1 overflow-x-auto scrollbar-hide">
                    {images.map((image: string, index: number) => (
                        <motion.button
                            key={`thumb-${index}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                            }}
                            className={`relative h-10 w-10 flex-shrink-0 rounded overflow-hidden transition-all ${currentImageIndex === index
                                ? 'ring-2 ring-primary'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Product Info Section - Instagram Style */}
            <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1">
                {/* Product Name with Rating on Right */}
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/${locale}/products/${product.slug}`} className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-neutral-900 hover:text-primary transition-colors line-clamp-2">
                            {productName}
                        </h3>
                    </Link>

                    {/* Product Rating Section - Right Side */}
                    {product.rating !== null && product.rating !== undefined && product.rating > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => {
                                    const rating = product.rating || 0;
                                    const isFull = i < Math.floor(rating);
                                    const isHalf = i === Math.floor(rating) && rating % 1 >= 0.5;

                                    return (
                                        <span
                                            key={i}
                                            className={`text-xs ${isFull || isHalf ? 'text-accent' : 'text-neutral-300'
                                                }`}
                                        >
                                            ★
                                        </span>
                                    );
                                })}
                            </div>
                            <span className="text-xs font-semibold text-neutral-900">
                                {product.rating?.toFixed(1)}
                            </span>

                            {/* Review Count */}
                            {product.rating_count !== null && product.rating_count !== undefined && (
                                <div className="text-xs text-neutral-600">
                                    ({product.rating_count})
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-1.5">
                    <Price
                        amount={displayPrice}
                        locale={locale}
                        size="sm"
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

                {/* Quick Actions - Add to Cart and Share */}
                <div className="flex gap-2 mt-1">
                    <Button
                        className="flex-1 text-xs h-8 rounded-md font-medium"
                        icon={<ShoppingCart className="w-3 h-3" />}
                        size="sm"
                        disabled={!product.in_stock}
                        onClick={() => onAddToCart?.(product)}
                    >
                        {t('common.addToCart')}
                    </Button>

                    {/* Share Button */}
                    <motion.button
                        className="h-8 px-2 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                        onClick={() => handleShare()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={t('common.share') || 'Share'}
                    >
                        <Share2 className="w-3.5 h-3.5 text-neutral-700" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
