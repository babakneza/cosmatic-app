'use client';

import { Product, Locale } from '@/types';
import { LuxuryProductCard } from './LuxuryProductCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LuxuryProductGridProps {
    products: Product[];
    locale: Locale;
    columns?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
    };
    gap?: 'none' | 'small' | 'medium' | 'large';
    variant?: 'default' | 'compact' | 'featured';
    className?: string;
}

export function LuxuryProductGrid({
    products,
    locale,
    columns = { mobile: 2, tablet: 3, desktop: 3 },
    gap = 'medium',
    variant = 'default',
    className,
}: LuxuryProductGridProps) {
    // Define gap classes
    const gapClasses = {
        none: 'gap-0',
        small: 'gap-3',
        medium: 'gap-6',
        large: 'gap-8',
    };

    // Define grid column classes
    const getColumnClasses = () => {
        const { mobile = 2, tablet = 3, desktop = 3 } = columns;

        return cn(
            'grid',
            mobile === 1 && 'grid-cols-1',
            mobile === 2 && 'grid-cols-2',
            mobile === 3 && 'grid-cols-3',
            tablet === 2 && 'sm:grid-cols-2',
            tablet === 3 && 'sm:grid-cols-3',
            tablet === 4 && 'sm:grid-cols-4',
            desktop === 3 && 'lg:grid-cols-3',
            desktop === 4 && 'lg:grid-cols-4',
            desktop === 5 && 'lg:grid-cols-5',
            desktop === 6 && 'lg:grid-cols-6',
            gapClasses[gap]
        );
    };

    // Container animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            className={cn(getColumnClasses(), className)}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {products.map((product, index) => (
                <LuxuryProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    variant={variant}
                    index={index}
                />
            ))}
        </motion.div>
    );
}