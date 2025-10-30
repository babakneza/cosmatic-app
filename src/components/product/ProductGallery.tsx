'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: string[];
    productName: string;
    className?: string;
}

export default function ProductGallery({
    images,
    productName,
    className
}: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);

    // Use placeholder if no images are provided
    const hasImages = images && images.length > 0;

    // Reset current index when images change
    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    // Navigation functions
    const nextImage = () => {
        if (!hasImages) return;
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (!hasImages) return;
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    // Get current image URL with fallback
    const getCurrentImageUrl = () => {
        if (!hasImages) return '/images/placeholder-product.jpg';
        return images[currentIndex] || '/images/placeholder-product.jpg';
    };

    // Handle image load events
    const handleImageLoad = () => {
        setLoading(false);
        setError(null);
    };

    const handleImageError = () => {
        setLoading(false);
        setError('Failed to load image');
    };

    // Toggle fullscreen view
    const toggleFullscreen = () => {
        setShowFullscreen(prev => !prev);
    };

    return (
        <div className={cn('relative w-full', className)}>
            {/* Main Gallery Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800"></div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-neutral-500">
                            <p>{error}</p>
                            <p className="text-sm">Using placeholder image</p>
                        </div>
                    </div>
                )}

                <Image
                    src={getCurrentImageUrl()}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority={currentIndex === 0}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />

                {/* Zoom button */}
                <button
                    onClick={toggleFullscreen}
                    className="absolute bottom-4 right-4 rounded-full bg-white/80 p-2 text-neutral-800 shadow-md hover:bg-white"
                    aria-label="Zoom image"
                >
                    <ZoomIn size={20} />
                </button>
            </div>

            {/* Navigation Arrows - Only show if we have multiple images */}
            {hasImages && images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md hover:bg-white transition-all"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md hover:bg-white transition-all"
                        aria-label="Next image"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Thumbnail Navigation - Only show if we have multiple images */}
            {hasImages && images.length > 1 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={`thumb-${index}`}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2",
                                currentIndex === index
                                    ? "border-neutral-800"
                                    : "border-transparent hover:border-neutral-300"
                            )}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={image}
                                alt={`${productName} - Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                                onError={(e) => {
                                    // Fallback to placeholder if thumbnail fails to load
                                    e.currentTarget.src = '/images/placeholder-product.jpg';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen View */}
            {showFullscreen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                    <button
                        onClick={toggleFullscreen}
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        aria-label="Close fullscreen"
                    >
                        <span className="text-2xl">×</span>
                    </button>

                    <div className="relative h-[80vh] w-[80vw]">
                        <Image
                            src={getCurrentImageUrl()}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.jpg';
                            }}
                        />
                    </div>

                    {hasImages && images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                aria-label="Next image"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}