'use client';

/**
 * @fileOverview Optimized Image Component
 * 
 * Wraps Next.js Image with project-specific optimizations:
 * - Automatic format negotiation (WebP/AVIF with JPEG/PNG fallbacks)
 * - Responsive sizing for mobile/tablet/desktop
 * - Built-in blur loading effect
 * - Performance monitoring and statistics
 * - Directus CDN integration
 * - Fallback to placeholder on error
 * 
 * @module components/ui/OptimizedImage
 * @requires next/image
 * @requires @/lib/imageOptimization
 * 
 * @example
 * // Basic usage
 * import OptimizedImage from '@/components/ui/OptimizedImage';
 * 
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.name}
 *   width={400}
 *   height={500}
 * />
 * 
 * // With responsive sizing
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.name}
 *   sizes="(max-width: 640px) 100vw, 50vw"
 *   preset="product-grid"
 *   objectFit="cover"
 * />
 */

import React, { useState, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';
import {
    getOptimizedImageUrl,
    getBlurPlaceholder,
    getResponsiveImageConfig,
    trackImageOptimization,
    type ImageOptimizationOptions
} from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';

interface OptimizedImageProps
    extends Omit<ImageProps, 'src' | 'alt' | 'onLoad'> {
    /** Image source - URL or Directus asset ID */
    src?: string | null;
    /** Alternative text */
    alt: string;
    /** Image optimization options */
    optimizationOptions?: ImageOptimizationOptions;
    /** Preset configuration name (product-grid, product-detail, etc) */
    preset?: keyof typeof PRESETS;
    /** Enable blur placeholder loading effect */
    enableBlur?: boolean;
    /** Show fallback on error */
    showFallback?: boolean;
    /** Callback on successful load */
    onImageLoad?: (width: number, height: number) => void;
    /** Callback on load error */
    onImageError?: (error: Error) => void;
    /** CSS class for wrapper div */
    containerClassName?: string;
    /** Whether to show loading skeleton */
    skeleton?: boolean;
}

const PRESETS = {
    'product-grid': {
        width: 400,
        height: 400,
        quality: 'medium' as const,
        sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    },
    'product-detail': {
        width: 800,
        height: 1000,
        quality: 'high' as const,
        sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw'
    },
    'category-banner': {
        width: 1200,
        height: 400,
        quality: 'high' as const,
        sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
    },
    'thumbnail': {
        width: 200,
        height: 200,
        quality: 'low' as const,
        sizes: '(max-width: 640px) 100px, 150px'
    },
    'wishlist-item': {
        width: 150,
        height: 150,
        quality: 'low' as const,
        sizes: '(max-width: 640px) 100px, 150px'
    },
    'cart-item': {
        width: 100,
        height: 100,
        quality: 'low' as const,
        sizes: '80px'
    },
    'instagram-card': {
        width: 300,
        height: 300,
        quality: 'medium' as const,
        sizes: '(max-width: 640px) 100vw, 300px'
    }
} as const;

/**
 * OptimizedImage Component
 * 
 * Provides automatic image optimization for BuyJan e-commerce.
 * Handles Directus CDN integration, responsive sizing, and fallbacks.
 * 
 * @component
 * @example
 * ```tsx
 * // Product grid thumbnail
 * <OptimizedImage
 *   src={product.featured_image}
 *   alt={product.name}
 *   preset="product-grid"
 *   fill
 *   className="object-cover"
 * />
 * 
 * // With error handling
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.name}
 *   width={400}
 *   height={500}
 *   enableBlur
 *   onImageError={(error) => console.error('Image failed:', error)}
 * />
 * ```
 */
const OptimizedImage = React.forwardRef<
    HTMLImageElement,
    OptimizedImageProps
>(
    (
        {
            src,
            alt,
            width,
            height,
            className,
            containerClassName,
            preset,
            optimizationOptions,
            enableBlur = true,
            showFallback = true,
            onImageLoad,
            onImageError,
            skeleton = false,
            ...props
        },
        ref
    ) => {
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<Error | null>(null);

        // Get preset configuration if specified
        const presetConfig = preset ? PRESETS[preset] : undefined;
        const finalWidth = width || presetConfig?.width || 400;
        const finalHeight = height || presetConfig?.height || 400;
        const finalSizes = props.sizes || presetConfig?.sizes;
        const finalQuality = optimizationOptions?.quality || presetConfig?.quality;

        // Generate optimized image URL
        const optimizedSrc =
            src && src !== ''
                ? getOptimizedImageUrl(src, {
                    width: finalWidth as number,
                    height: finalHeight as number,
                    quality: finalQuality,
                    ...optimizationOptions
                })
                : '/images/placeholder-product.jpg';

        // Generate blur placeholder
        const blurSrc =
            enableBlur && src && src !== ''
                ? getBlurPlaceholder(src, {
                    width: 10,
                    height: 10,
                    quality: 'low'
                })
                : undefined;

        const handleLoadingComplete = useCallback(
            (result: any) => {
                setIsLoading(false);

                // Track optimization
                if (src && src !== '') {
                    trackImageOptimization(
                        (finalWidth as number) * (finalHeight as number) * 3, // Estimate original
                        (finalWidth as number) * (finalHeight as number) * 1, // Estimate optimized
                        optimizationOptions?.format || 'auto'
                    );
                }

                onImageLoad?.(finalWidth as number, finalHeight as number);
                props.onLoadingComplete?.(result);
            },
            [finalWidth, finalHeight, src, optimizationOptions, onImageLoad, props]
        );

        const handleError = useCallback(
            (error: any) => {
                setIsLoading(false);

                const err =
                    error instanceof Error
                        ? error
                        : new Error('Image failed to load');

                setError(err);
                onImageError?.(err);

                // Call original error handler if provided
                if (props.onError) {
                    props.onError(error);
                }
            },
            [onImageError, props]
        );

        // Render error state with fallback
        if (error && showFallback) {
            return (
                <div
                    className={cn(
                        'bg-neutral-100 flex items-center justify-center rounded',
                        containerClassName,
                        className
                    )}
                    style={{
                        width: finalWidth,
                        height: finalHeight
                    }}
                >
                    <span className="text-xs text-neutral-400">
                        {alt || 'Image unavailable'}
                    </span>
                </div>
            );
        }

        // Render loading skeleton if enabled
        if (skeleton && isLoading) {
            return (
                <div
                    className={cn(
                        'bg-neutral-100 animate-pulse rounded',
                        containerClassName,
                        className
                    )}
                    style={{
                        width: finalWidth,
                        height: finalHeight
                    }}
                />
            );
        }

        return (
            <div
                className={containerClassName}
                style={{
                    position: 'relative',
                    display: props.fill ? 'block' : 'inline-block',
                    width: props.fill ? '100%' : finalWidth,
                    height: props.fill ? '100%' : finalHeight
                }}
            >
                <Image
                    ref={ref}
                    src={optimizedSrc}
                    alt={alt}
                    width={props.fill ? undefined : (finalWidth as number)}
                    height={props.fill ? undefined : (finalHeight as number)}
                    sizes={finalSizes}
                    placeholder={blurSrc ? 'blur' : 'empty'}
                    blurDataURL={blurSrc}
                    className={cn('transition-opacity duration-300', className, {
                        'opacity-0': isLoading,
                        'opacity-100': !isLoading
                    })}
                    onLoadingComplete={handleLoadingComplete}
                    onError={handleError}
                    priority={props.priority || false}
                    {...props}
                />
            </div>
        );
    }
);

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;