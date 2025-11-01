'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Product, Locale } from '@/types';
import { cn, getDirection, isRTL, getFontFamily, getLocalizedValue } from '@/lib/utils';
import { formatOMR, calculateDiscount, formatDiscount } from '@/lib/currency';
import { useCartStore } from '@/store/cart';
import { getDirectusAssetUrl } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';

interface LuxuryProductCardProps {
    product: Product;
    locale: Locale;
    variant?: 'default' | 'compact' | 'featured';
    className?: string;
    index?: number;
}

export function LuxuryProductCard({
    product,
    locale,
    variant = 'default',
    className,
    index = 0
}: LuxuryProductCardProps) {
    const t = useTranslations();
    const router = useRouter();
    const direction = getDirection(locale);
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);
    const { addItem } = useCartStore();

    const [isHovered, setIsHovered] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const { isProductWishlisted, toggleWishlist } = useWishlist();
    const isFavorite = isProductWishlisted(product.id);

    // Get localized product name
    const productName = getLocalizedValue(
        { name: product.name, name_ar: product.name_ar || product.name },
        locale
    );

    // Helper function to get primary category
    const getPrimaryCategory = () => {
        // First check if we have categories array
        if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
            // Handle both object and string representations
            const firstCategory = product.categories[0];
            if (typeof firstCategory === 'string') {
                return { name: firstCategory, slug: firstCategory };
            }
            return firstCategory;
        }
        // Then check if we have a single category
        if (product.category) {
            // Handle both object and string representations
            if (typeof product.category === 'string') {
                return { name: product.category, slug: product.category };
            }

            // Handle case where category is an object
            if (typeof product.category === 'object' && product.category !== null) {
                // Direct access to name property
                if (product.category.name) {
                    return {
                        id: product.category.id || '',
                        name: product.category.name,
                        slug: product.category.slug || product.category.id?.toString() || ''
                    };
                } else if (product.category.id) {
                    return {
                        id: product.category.id,
                        name: '',
                        slug: product.category.id.toString()
                    };
                }
            }

            return product.category;
        }
        return null;
    };

    // Helper function to get brand info consistently
    const getBrandInfo = () => {
        if (!product.brand) return null;

        // Handle both object and string representations
        if (typeof product.brand === 'string') {
            return { name: product.brand, slug: product.brand };
        }

        // Handle case where brand is an object
        if (typeof product.brand === 'object' && product.brand !== null) {
            // Direct access to name property
            if (product.brand.name) {
                return {
                    id: product.brand.id || '',
                    name: product.brand.name,
                    slug: product.brand.slug || product.brand.id?.toString() || ''
                };
            } else if (product.brand.id) {
                return {
                    id: product.brand.id,
                    name: '',
                    slug: product.brand.id.toString()
                };
            }
        }

        return product.brand;
    };

    const primaryCategory = getPrimaryCategory();
    const brandInfo = getBrandInfo();

    // Handle different image data structures
    let primaryImage: any = null;
    let secondaryImage: any = null;

    // First check if we have pre-processed images from the API
    if (product.mainImageUrl) {
        primaryImage = {
            url: product.mainImageUrl,
            isPreProcessed: true
        };
    }
    // Then check for processedImages array
    else if (product.processedImages && Array.isArray(product.processedImages) && product.processedImages.length > 0) {
        // Find primary image or use the first one
        const primaryProcessedImage = product.processedImages.find(img => img.is_primary) || product.processedImages[0];
        primaryImage = {
            url: primaryProcessedImage.url,
            isPreProcessed: true
        };

        // Find a secondary image for hover effect if available
        if (product.processedImages.length > 1) {
            const secondaryProcessedImage = product.processedImages.find(img => !img.is_primary) || product.processedImages[1];
            secondaryImage = {
                url: secondaryProcessedImage.url,
                isPreProcessed: true
            };
        }
    }
    // Then try standard image fields
    else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Case 1: Array of image objects with is_primary flag
        primaryImage = product.images.find(img => img.is_primary) || product.images[0];

        // Find a secondary image for hover effect if available
        if (product.images.length > 1) {
            secondaryImage = product.images.find(img => !img.is_primary) || product.images[1];
        }
    } else if (product.mainImageUrl) {
        // Case 2: Direct mainImageUrl field
        primaryImage = {
            url: product.mainImageUrl
        };
    }

    // Handle image URL generation
    const getImageUrl = (image: any) => {
        // Check if we have any images
        if (!image) {
            return '/images/placeholder-product.jpg'; // Use placeholder
        }

        try {
            // If the image is already pre-processed (has a full URL), use it directly
            if (image.isPreProcessed && typeof image.url === 'string') {
                return image.url;
            }

            // Extract the asset ID
            let assetId: string | null = null;

            if (typeof image === 'string') {
                // Case 1: Direct string ID
                assetId = image;
            } else if (typeof image.url === 'string') {
                // Case 2: Object with url property as string
                assetId = image.url;
            } else if (image.id) {
                // Case 3: Object with id property
                assetId = image.id;
            } else if (image.directus_files_id) {
                // Case 4: Object with directus_files_id property
                assetId = image.directus_files_id;
            }

            if (!assetId) {
                return '/images/placeholder-product.jpg';
            }

            // Generate the asset URL
            const url = getDirectusAssetUrl(assetId, {
                width: 600,
                height: 600,
                format: 'webp',
                fit: 'cover',
                placeholder: '/images/placeholder-product.jpg'
            });

            return url;
        } catch (error) {
            return '/images/placeholder-product.jpg';
        }
    };

    const primaryImageUrl = getImageUrl(primaryImage);
    const secondaryImageUrl = secondaryImage ? getImageUrl(secondaryImage) : primaryImageUrl;

    // Calculate discount percentage if there's a sale price
    const hasDiscount = product.sale_price !== undefined && product.sale_price !== null &&
        product.price !== undefined && product.price !== null &&
        product.sale_price < product.price;
    const discountPercentage = hasDiscount && product.sale_price !== undefined && product.price !== undefined
        ? calculateDiscount(product.price, product.sale_price)
        : 0;

    // Handle add to cart
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAddingToCart || !product.in_stock) return;

        setIsAddingToCart(true);
        addItem(product, 1);

        // Reset state after animation
        setTimeout(() => {
            setIsAddingToCart(false);
        }, 1000);
    };

    // Handle quick view
    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/${locale}/products/${product.slug}`);
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(product.id);
    };

    // Magnetic effect for buttons
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;

        const buttons = cardRef.current.querySelectorAll('.magnetic-button');

        buttons.forEach((button) => {
            const rect = (button as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            (button as HTMLElement).style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;

        const buttons = cardRef.current.querySelectorAll('.magnetic-button');

        buttons.forEach((button) => {
            (button as HTMLElement).style.transform = 'translate(0, 0)';
        });

        setIsHovered(false);
    };

    // Staggered entrance animation
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: index * 0.1, // Stagger based on index
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <motion.div
            ref={cardRef}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-lg shadow-md transition-all duration-300',
                rtl ? 'font-arabic' : 'font-english',
                className
            )}
            dir={direction}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Brand and Category Badges */}
            <div className={cn(
                "absolute z-20 flex flex-col gap-2",
                rtl ? "top-3 right-3" : "top-3 left-3"
            )}>
                {/* Brand Badge - if available */}
                {brandInfo && (
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-neutral-100">
                        <p className="text-xs font-medium text-neutral-800">
                            {brandInfo.name || brandInfo.slug}
                        </p>
                    </div>
                )}

                {/* Category Badge - if available */}
                {primaryCategory && (
                    <div className="bg-neutral-800 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-neutral-700">
                        <p className="text-xs font-medium text-neutral-100">
                            {primaryCategory.name || primaryCategory.slug}
                        </p>
                    </div>
                )}
            </div>

            {/* Product Link Wrapper */}
            <Link href={`/${locale}/products/${product.slug}`} className="flex flex-col h-full">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
                    {/* Shimmer Loading Effect */}
                    {!isImageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 to-neutral-200 animate-pulse" />
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && product.sale_price !== undefined && (
                        <div className="absolute end-3 top-3 z-10 rounded-full bg-accent/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white shadow-md">
                            {formatDiscount(product.price, product.sale_price, locale)}
                        </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {!product.in_stock && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm">
                            <span className="rounded-md bg-neutral-900/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white shadow-lg">
                                {t('product.out_of_stock')}
                            </span>
                        </div>
                    )}

                    {/* Product Image */}
                    <div className="relative h-full w-full">
                        <Image
                            src={primaryImageUrl}
                            alt={productName}
                            width={600}
                            height={600}
                            className={cn(
                                'h-full w-full object-cover',
                                isImageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                            onLoad={() => setIsImageLoaded(true)}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                                setIsImageLoaded(true);
                            }}
                            priority={index < 4}
                        />

                        {/* Bottom Gradient Overlay for text readability */}
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-900/85 via-neutral-900/50 to-transparent" />

                        {/* Product Info Overlay */}
                        <motion.div
                            className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Product Name and Price Layout */}
                            <div className="flex items-end justify-between gap-3">
                                {/* Product Name */}
                                <motion.h3
                                    className={cn(
                                        'flex-1 line-clamp-2 text-base font-semibold text-white',
                                        rtl ? 'font-arabic' : 'font-english'
                                    )}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.35 }}
                                >
                                    {productName}
                                </motion.h3>

                                {/* Price */}
                                <motion.div
                                    className="flex flex-col items-end gap-1 whitespace-nowrap"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    {hasDiscount && product.sale_price !== undefined ? (
                                        <>
                                            <span className="text-base font-bold text-primary">
                                                {formatOMR(product.sale_price, locale)}
                                            </span>
                                            <span className="text-xs text-neutral-300 line-through">
                                                {formatOMR(product.price || 0, locale)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-base font-bold text-primary">
                                            {formatOMR(product.price || 0, locale)}
                                        </span>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions Overlay */}
                    <motion.div
                        className={cn(
                            'absolute inset-0 flex items-center justify-center gap-4 bg-neutral-900/30 backdrop-blur-sm opacity-0 transition-opacity duration-300',
                            isHovered && 'opacity-100'
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
                    >
                        {/* Quick View Button */}
                        <button
                            onClick={handleQuickView}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-800 shadow-lg transition-colors hover:bg-primary hover:text-white"
                            aria-label={t('product.view_product')}
                        >
                            <Eye size={20} />
                        </button>

                        {/* Add to Cart Button */}
                        {product.in_stock && (
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-800 shadow-lg transition-colors hover:bg-primary hover:text-white',
                                    isAddingToCart && 'bg-primary text-white'
                                )}
                                aria-label={t('common.add_to_cart')}
                            >
                                <ShoppingCart size={20} />
                            </button>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={handleFavoriteToggle}
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-800 shadow-lg transition-colors',
                                isFavorite
                                    ? 'bg-accent text-white'
                                    : 'hover:bg-accent hover:text-white'
                            )}
                            aria-label={t('product.add_to_wishlist')}
                        >
                            <Heart size={20} className={isFavorite ? 'fill-white' : ''} />
                        </button>
                    </motion.div>
                </div>


            </Link>
        </motion.div>
    );
}