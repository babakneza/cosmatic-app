'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ShimmerLoaderProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    rounded?: boolean;
    variant?: 'card' | 'image' | 'text' | 'button';
}

export function ShimmerLoader({
    className,
    width = '100%',
    height = '100%',
    rounded = false,
    variant = 'card'
}: ShimmerLoaderProps) {
    // Define shimmer animation
    const shimmerVariants = {
        initial: {
            backgroundPosition: '-500px 0',
        },
        animate: {
            backgroundPosition: '500px 0',
            transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: "linear",
            },
        },
    };

    // Define variant-specific styles
    const variantStyles = {
        card: 'w-full h-full rounded-lg',
        image: 'aspect-square rounded-lg',
        text: 'h-4 rounded-full',
        button: 'h-10 rounded-full'
    };

    return (
        <motion.div
            className={cn(
                'overflow-hidden bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:1000px_100%]',
                rounded && 'rounded-full',
                variantStyles[variant],
                className
            )}
            style={{
                width,
                height
            }}
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
        />
    );
}