'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { Product, Locale } from '@/types';
import ProductGrid from './ProductGrid';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface ProductSectionProps {
    title: string;
    products: Product[];
    locale: Locale;
    viewAllLink?: string;
    className?: string;
}

export function ProductSection({
    title,
    products,
    locale,
    viewAllLink,
    className,
}: ProductSectionProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    // If no products, don't render the section
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className={cn('py-8', className)}>
            <div className="container">
                {/* Section Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2
                        className={cn(
                            'text-2xl font-bold text-neutral-900',
                            fontFamily
                        )}
                    >
                        {title}
                    </h2>

                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className={cn(
                                'flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-600',
                                fontFamily
                            )}
                        >
                            <span>{t('common.view_all')}</span>
                            {rtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </Link>
                    )}
                </div>

                {/* Products Grid */}
                <ProductGrid
                    products={products}
                    columns={4}
                    variant="grid"
                />
            </div>
        </section>
    );
}