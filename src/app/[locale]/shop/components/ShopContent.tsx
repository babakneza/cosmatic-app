'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

import { Product, Category, Brand, Locale, ProductFilters, SortOption } from '@/types';
import { LuxuryProductGrid } from '@/components/luxury';
import { cn, isRTL, getFontFamily, getLocalizedValue } from '@/lib/utils';
import Pagination from './Pagination';
import FilterSidebar from './FilterSidebar';
import SortDropdown from './SortDropdown';
import SearchBar from './SearchBar';
import Breadcrumb from './Breadcrumb';

interface ShopContentProps {
    products: Product[];
    categories: Category[];
    brands: Brand[];
    filters: ProductFilters;
    sort?: SortOption;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
    };
    locale: Locale;
}

export default function ShopContent({
    products,
    categories,
    brands,
    filters,
    sort,
    pagination,
    locale
}: ShopContentProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Helper function to convert string or array to array
    const toArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : value.split(',');
    };

    // Calculate active filters for display
    useEffect(() => {
        const newActiveFilters: string[] = [];

        // Handle categories (can be string or array)
        const categoryValues = toArray(filters.category);
        if (categoryValues.length > 0) {
            categoryValues.forEach(categorySlug => {
                const categoryName = categories.find(c => c.slug === categorySlug)?.name || categorySlug;
                newActiveFilters.push(`${t('shop.category')}: ${categoryName}`);
            });
        }

        // Handle brands (can be string or array)
        const brandValues = toArray(filters.brand);
        if (brandValues.length > 0) {
            brandValues.forEach(brandSlug => {
                const brandName = brands.find(b => b.slug === brandSlug)?.name || brandSlug;
                newActiveFilters.push(`${t('shop.brand')}: ${brandName}`);
            });
        }

        if (filters.min_price !== undefined) {
            newActiveFilters.push(`${t('shop.min_price')}: ${filters.min_price} OMR`);
        }

        if (filters.max_price !== undefined) {
            newActiveFilters.push(`${t('shop.max_price')}: ${filters.max_price} OMR`);
        }

        if (filters.search) {
            newActiveFilters.push(`${t('shop.search')}: ${filters.search}`);
        }

        setActiveFilters(newActiveFilters);
    }, [filters, categories, brands, t]);

    // Handle filter removal with optimized performance
    const removeFilter = useCallback((filterIndex: number) => {
        const params = new URLSearchParams(searchParams.toString());
        const filter = activeFilters[filterIndex];

        // Extract the filter value from the display text
        const filterValue = filter.split(': ')[1];

        if (filter.startsWith(t('shop.category'))) {
            // Find the category slug from the name - use memoization to avoid repeated lookups
            const categorySlug = categories.find(c =>
                getLocalizedValue({ name: c.name, name_ar: c.name_ar || c.name }, locale) === filterValue
            )?.slug;

            if (categorySlug) {
                // Get current categories
                const currentCategories = toArray(filters.category);
                // Remove the category
                const updatedCategories = currentCategories.filter(c => c !== categorySlug);

                if (updatedCategories.length === 0) {
                    params.delete('category');
                } else {
                    params.set('category', updatedCategories.join(','));
                }
            }
        }
        else if (filter.startsWith(t('shop.brand'))) {
            // Find the brand slug from the name
            const brandSlug = brands.find(b =>
                getLocalizedValue({ name: b.name, name_ar: b.name_ar || b.name }, locale) === filterValue
            )?.slug;

            if (brandSlug) {
                // Get current brands
                const currentBrands = toArray(filters.brand);
                // Remove the brand
                const updatedBrands = currentBrands.filter(b => b !== brandSlug);

                if (updatedBrands.length === 0) {
                    params.delete('brand');
                } else {
                    params.set('brand', updatedBrands.join(','));
                }
            }
        }
        else if (filter.startsWith(t('shop.min_price'))) {
            params.delete('min_price');
        }
        else if (filter.startsWith(t('shop.max_price'))) {
            params.delete('max_price');
        }
        else if (filter.startsWith(t('shop.search'))) {
            params.delete('search');
        }

        // Reset to page 1 when removing filters
        params.set('page', '1');

        // Use replace instead of push to avoid adding to history stack
        router.replace(`${pathname}?${params.toString()}`);
    }, [activeFilters, categories, brands, filters, searchParams, router, pathname, t, locale]);

    // Clear all filters with optimized performance
    const clearAllFilters = useCallback(() => {
        const params = new URLSearchParams();

        // Preserve sort parameter if it exists
        if (sort) {
            params.set('sort', sort);
        }

        // Reset to page 1
        params.set('page', '1');

        // Use replace instead of push to avoid adding to history stack
        router.replace(`${pathname}?${params.toString()}`);
    }, [sort, router, pathname]);

    // Handle sort change with optimized performance
    const handleSortChange = useCallback((newSort: SortOption) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', newSort);
        // Use replace instead of push to avoid adding to history stack
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    // Handle page change with optimized performance
    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        // Use replace instead of push to avoid adding to history stack
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-primary-50 to-background-gold py-8 px-4">
                <div className="container mx-auto">
                    <h1 className={cn(
                        "text-3xl md:text-4xl font-bold text-neutral-800 mb-2",
                        fontFamily
                    )}>
                        {t('shop.premium_cosmetics')}
                    </h1>
                    <p className={cn(
                        "text-neutral-600",
                        fontFamily
                    )}>
                        {t('shop.discover_products')}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Filter Sidebar */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSidebar
                            categories={categories}
                            brands={brands}
                            filters={filters}
                            locale={locale}
                        />
                    </div>

                    {/* Product Grid and Controls */}
                    <div className="flex-1">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <SearchBar
                                initialQuery={filters.search || ''}
                                locale={locale}
                            />
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 lg:hidden">
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-neutral-200 shadow-sm"
                            >
                                <Filter size={18} />
                                <span>{t('shop.filter')}</span>
                            </button>

                            <SortDropdown
                                currentSort={sort}
                                onSortChange={handleSortChange}
                                locale={locale}
                            />
                        </div>

                        {/* Desktop Sort Controls */}
                        <div className="hidden lg:flex items-center justify-between mb-6">
                            <div className="text-neutral-600">
                                {pagination.totalProducts > 0 ? (
                                    <span>
                                        {t('shop.showing')} {(pagination.currentPage - 1) * 12 + 1}-
                                        {Math.min(pagination.currentPage * 12, pagination.totalProducts)} {t('shop.of')} {pagination.totalProducts} {t('shop.products')}
                                    </span>
                                ) : (
                                    <span>{t('shop.no_products')}</span>
                                )}
                            </div>

                            <SortDropdown
                                currentSort={sort}
                                onSortChange={handleSortChange}
                                locale={locale}
                            />
                        </div>

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="mb-6 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-neutral-500">{t('shop.active_filters')}:</span>

                                {activeFilters.map((filter, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-neutral-200 text-sm"
                                    >
                                        <span>{filter}</span>
                                        <button
                                            onClick={() => removeFilter(index)}
                                            className="text-neutral-400 hover:text-neutral-700"
                                            aria-label={`Remove filter ${filter}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-primary hover:text-primary-600 underline"
                                >
                                    {t('shop.clear_all')}
                                </button>
                            </div>
                        )}

                        {/* Products */}
                        {products.length > 0 ? (
                            <LuxuryProductGrid
                                products={products}
                                locale={locale}
                                columns={{ mobile: 2, tablet: 3, desktop: 3 }}
                                gap="medium"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="text-5xl text-neutral-300 mb-4">
                                    <SlidersHorizontal size={64} />
                                </div>
                                <h3 className="text-xl font-medium text-neutral-700 mb-2">
                                    {t('shop.no_products_found')}
                                </h3>
                                <p className="text-neutral-500 mb-6 max-w-md">
                                    {t('shop.try_adjusting_filters')}
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    {t('shop.clear_filters')}
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                    locale={locale}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sidebar */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/50 lg:hidden">
                    <div className={cn(
                        "fixed inset-y-0 w-80 max-w-[80vw] bg-white shadow-xl transition-transform duration-300 ease-in-out",
                        rtl ? "right-0" : "left-0"
                    )}>
                        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                            <h3 className={cn("font-medium text-lg", fontFamily)}>
                                {t('shop.filter_products')}
                            </h3>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="text-neutral-500 hover:text-neutral-700"
                                aria-label="Close filter sidebar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
                            <FilterSidebar
                                categories={categories}
                                brands={brands}
                                filters={filters}
                                locale={locale}
                                isMobile={true}
                                onClose={() => setIsMobileFilterOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}