'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
    products: Product[];
    variant?: 'grid' | 'list';
    columns?: number;
    onAddToCart?: (product: Product) => void;
    onAddToWishlist?: (product: Product) => void;
    isLoading?: boolean;
}

export default function ProductGrid({
    products,
    variant = 'grid',
    columns = 4,
    onAddToCart,
    onAddToWishlist,
    isLoading = false,
}: ProductGridProps) {
    if (isLoading) {
        return (
            <div className={`grid gap-3 sm:gap-4 ${variant === 'grid' ? `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns}` : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-neutral-200 rounded-lg aspect-square animate-pulse" />
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-neutral-500 text-center">No products found</p>
            </div>
        );
    }

    const containerClass =
        variant === 'grid'
            ? `grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns}`
            : 'flex flex-col gap-3';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    return (
        <motion.div
            className={containerClass}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    variant={variant}
                    onAddToCart={onAddToCart}
                    onAddToWishlist={onAddToWishlist}
                />
            ))}
        </motion.div>
    );
}