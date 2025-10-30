'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
    onQuickView: (e: React.MouseEvent) => void;
    onAddToCart?: (e: React.MouseEvent) => void;
    onFavoriteToggle: (e: React.MouseEvent) => void;
    isInStock?: boolean;
    isAddingToCart?: boolean;
    isFavorite?: boolean;
    className?: string;
}

export function QuickActions({
    onQuickView,
    onAddToCart,
    onFavoriteToggle,
    isInStock = true,
    isAddingToCart = false,
    isFavorite = false,
    className
}: QuickActionsProps) {
    // Button animation variants
    const buttonVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        },
        hover: {
            scale: 1.1,
            transition: {
                duration: 0.2
            }
        },
        tap: {
            scale: 0.95
        }
    };

    // Container animation variants with staggered children
    const containerVariants = {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            className={cn(
                "flex items-center justify-center gap-4",
                className
            )}
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Quick View Button */}
            <motion.button
                onClick={onQuickView}
                className="magnetic-button flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg transition-all hover:bg-primary hover:text-white backdrop-blur-sm"
                aria-label="Quick view"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <Eye size={18} />
            </motion.button>

            {/* Add to Cart Button - Only show if in stock */}
            {isInStock && onAddToCart && (
                <motion.button
                    onClick={onAddToCart}
                    disabled={isAddingToCart}
                    className={cn(
                        'magnetic-button flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg transition-all hover:bg-primary hover:text-white backdrop-blur-sm',
                        isAddingToCart && 'animate-pulse bg-primary text-white'
                    )}
                    aria-label="Add to cart"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <ShoppingCart size={18} />
                </motion.button>
            )}

            {/* Wishlist Button */}
            <motion.button
                onClick={onFavoriteToggle}
                className={cn(
                    'magnetic-button flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg transition-all backdrop-blur-sm',
                    isFavorite ? 'bg-accent text-white' : 'hover:bg-accent hover:text-white'
                )}
                aria-label="Add to wishlist"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <Heart size={18} className={isFavorite ? 'fill-white' : ''} />
            </motion.button>
        </motion.div>
    );
}