'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Category, Locale } from '@/types';
import { cn, isRTL, getFontFamily, getLocalizedValue } from '@/lib/utils';

interface CategoryShowcaseProps {
    categories: Category[];
    locale: Locale;
    title?: string;
    limit?: number;
}

export default function CategoryShowcase({
    categories,
    locale,
    title,
    limit = 6,
}: CategoryShowcaseProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    // Limit categories
    const displayCategories = categories.slice(0, limit);

    // Get category image URL
    const getCategoryImageUrl = (category: Category) => {
        if (category.image) {
            return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${category.image}`;
        }
        return null;
    };

    return (
        <section className="py-8 md:py-12 lg:py-16 bg-neutral-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <h2 className={cn(
                        "text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-2 sm:mb-3",
                        fontFamily
                    )}>
                        {title || t('common.categories')}
                    </h2>
                    <p className={cn(
                        "text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto",
                        fontFamily
                    )}>
                        {t('shop.discover_products')}
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {displayCategories.map(category => {
                        const imageUrl = getCategoryImageUrl(category);

                        return (
                            <Link
                                key={category.id}
                                href={`/${locale}/categories/${category.slug}`}
                                className="group overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image Container */}
                                <div className="relative h-40 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={getLocalizedValue({ name: category.name || '', name_ar: category.name_ar || '' }, locale) || 'Category'}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-5xl text-primary-200 mb-2">✨</div>
                                                <p className="text-neutral-400">{t('product.no_image')}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Content */}
                                <div className="p-3 sm:p-5 md:p-6">
                                    <h3 className={cn(
                                        "text-sm sm:text-lg md:text-xl font-bold text-neutral-900 mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2",
                                        fontFamily
                                    )}>
                                        {getLocalizedValue({ name: category.name, name_ar: category.name_ar }, locale)}
                                    </h3>

                                    {category.description && (
                                        <p className={cn(
                                            "text-xs sm:text-sm text-neutral-600 line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-4 hidden sm:block",
                                            fontFamily
                                        )}>
                                            {getLocalizedValue({ name: category.description, name_ar: category.description_ar }, locale)}
                                        </p>
                                    )}

                                    {/* CTA */}
                                    <div className="flex items-center gap-1 sm:gap-2 text-primary font-medium text-xs sm:text-sm group-hover:gap-3 transition-all">
                                        <span>{t('common.view_all')}</span>
                                        <ArrowRight
                                            size={14}
                                            className={cn(
                                                "transition-transform",
                                                rtl && "rotate-180"
                                            )}
                                        />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* View All Categories Link */}
                {categories.length > limit && (
                    <div className="mt-6 sm:mt-8 lg:mt-12 text-center">
                        <Link
                            href={`/${locale}/shop`}
                            className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-primary-600 text-white font-medium text-sm sm:text-base rounded-lg transition-colors"
                        >
                            {t('common.view_all')}
                            <ArrowRight
                                size={16}
                                className={cn(
                                    rtl && "rotate-180"
                                )}
                            />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}