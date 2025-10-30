'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter } from 'lucide-react';

import { Product, Category, Locale } from '@/types';
import { cn, isRTL, getFontFamily, getLocalizedValue } from '@/lib/utils';
import { EnhancedSearchBar } from '@/components/search';
import { LuxuryProductGrid } from '@/components/luxury';

interface SearchContentProps {
    query: string;
    products: Product[];
    categories: Category[];
    locale: Locale;
    totalResults: number;
}

export default function SearchContent({
    query,
    products,
    categories,
    locale,
    totalResults,
}: SearchContentProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'relevant' | 'newest' | 'price_low' | 'price_high' | 'name'>('relevant');

    // Filter products by selected category
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        if (selectedCategory) {
            filtered = filtered.filter(product =>
                product.category?.slug === selectedCategory
            );
        }

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price_low':
                    return (a.price || 0) - (b.price || 0);
                case 'price_high':
                    return (b.price || 0) - (a.price || 0);
                case 'name':
                    const nameA = getLocalizedValue({ name: a.name || '', name_ar: a.name_ar || '' }, locale).toLowerCase();
                    const nameB = getLocalizedValue({ name: b.name || '', name_ar: b.name_ar || '' }, locale).toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'relevant':
                default:
                    // If products are already sorted by relevance from API, keep order
                    return 0;
            }
        });

        return filtered;
    }, [products, selectedCategory, sortBy, locale]);

    // Highlight search query in text
    const highlightQuery = (text: string) => {
        if (!query || query.length < 2) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark className="bg-yellow-200">$1</mark>');
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Search Header */}
            <div className={cn(
                "bg-white border-b border-neutral-200",
                "px-4 md:px-8 py-8 md:py-12"
            )}>
                <div className="max-w-6xl mx-auto">
                    {/* Search bar */}
                    <div className="mb-8">
                        <EnhancedSearchBar
                            initialQuery={query}
                            locale={locale}
                            variant="header"
                        />
                    </div>

                    {/* Results header */}
                    <div className={cn(
                        fontFamily,
                        rtl ? "text-right" : "text-left"
                    )}>
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                            {t('search.title')}
                        </h1>
                        <p className="text-neutral-600">
                            {query ? (
                                <>
                                    {t('search.found')} <span className="font-semibold">{filteredProducts.length}</span> {t('search.results_for')} "<span className="font-semibold">{query}</span>"
                                </>
                            ) : (
                                t('search.enter_search')
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* No results state */}
                {query && filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 bg-neutral-100 rounded-full mb-4">
                            <Search size={48} className="text-neutral-400" />
                        </div>
                        <h2 className={cn(
                            "text-2xl font-bold text-neutral-900 mb-2",
                            fontFamily
                        )}>
                            {t('search.no_results')}
                        </h2>
                        <p className={cn(
                            "text-neutral-600 mb-6 max-w-md mx-auto",
                            fontFamily
                        )}>
                            {t('search.no_results_description')}
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-neutral-600">
                            <p>• {t('search.try_different_keywords')}</p>
                            <p>• {t('search.check_spelling')}</p>
                            <p>• {t('search.try_more_general_keywords')}</p>
                        </div>
                    </div>
                )}

                {/* Results with filters */}
                {query && filteredProducts.length > 0 && (
                    <div className={cn(
                        "grid grid-cols-1 lg:grid-cols-4 gap-8",
                        rtl && "lg:grid-cols-4 lg:flex-row-reverse"
                    )}>
                        {/* Filters Sidebar */}
                        <div className={cn(
                            "lg:col-span-1",
                            rtl && "lg:order-last"
                        )}>
                            <div className={cn(
                                "bg-white rounded-lg border border-neutral-200 p-6",
                                fontFamily
                            )}>
                                <h3 className={cn(
                                    "text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2",
                                    rtl && "flex-row-reverse"
                                )}>
                                    <Filter size={20} />
                                    {t('search.filter')}
                                </h3>

                                {/* Category Filter */}
                                {categories.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                            {t('shop.category')}
                                        </h4>
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={cn(
                                                "w-full px-3 py-2 rounded text-sm transition-colors",
                                                !selectedCategory
                                                    ? "bg-primary text-white"
                                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                            )}
                                        >
                                            {t('search.all_categories')}
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category.slug)}
                                                className={cn(
                                                    "w-full px-3 py-2 rounded text-sm transition-colors text-left",
                                                    rtl && "text-right",
                                                    selectedCategory === category.slug
                                                        ? "bg-primary text-white"
                                                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                                )}
                                            >
                                                {getLocalizedValue({ name: category.name, name_ar: category.name_ar }, locale)}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Sort */}
                                <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3">
                                    <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                        {t('search.sort')}
                                    </h4>
                                    {(['relevant', 'price_low', 'price_high', 'name'] as const).map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSortBy(option)}
                                            className={cn(
                                                "w-full px-3 py-2 rounded text-sm transition-colors text-left",
                                                rtl && "text-right",
                                                sortBy === option
                                                    ? "bg-primary text-white"
                                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                            )}
                                        >
                                            {t(`search.sort_${option}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            <div className={cn(
                                "mb-6 flex items-center justify-between",
                                rtl && "flex-row-reverse"
                            )}>
                                <p className={cn(
                                    "text-sm text-neutral-600",
                                    fontFamily
                                )}>
                                    {t('search.showing')} <span className="font-semibold">{filteredProducts.length}</span> {t('search.results')}
                                </p>
                            </div>

                            <LuxuryProductGrid
                                products={filteredProducts}
                                locale={locale}
                            />
                        </div>
                    </div>
                )}

                {/* Empty state when no query */}
                {!query && (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 bg-neutral-100 rounded-full mb-4">
                            <Search size={48} className="text-neutral-400" />
                        </div>
                        <h2 className={cn(
                            "text-2xl font-bold text-neutral-900 mb-2",
                            fontFamily
                        )}>
                            {t('search.start_searching')}
                        </h2>
                        <p className={cn(
                            "text-neutral-600",
                            fontFamily
                        )}>
                            {t('search.use_search_bar')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}