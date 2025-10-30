'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, X, SlidersHorizontal } from 'lucide-react';

import { Product, Category, Brand, Locale, ProductFilters, SortOption } from '@/types';
import { LuxuryProductGrid } from '@/components/luxury';
import { cn, isRTL, getFontFamily, getLocalizedValue } from '@/lib/utils';
import { getAssetUrl } from '@/lib/api/directus-config';
import CategoryFilterSidebar from './CategoryFilterSidebar';
import SortDropdown from '../../../shop/components/SortDropdown';
import SearchBar from '../../../shop/components/SearchBar';
import Pagination from '../../../shop/components/Pagination';

interface CategoryContentProps {
    category: Category;
    products: Product[];
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

export default function CategoryContent({
    category,
    products,
    brands,
    filters,
    sort,
    pagination,
    locale,
}: CategoryContentProps) {
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

        // Handle brands
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
    }, [filters, brands, t]);

    // Handle filter removal
    const removeFilter = useCallback((filterIndex: number) => {
        const params = new URLSearchParams(searchParams.toString());
        const filter = activeFilters[filterIndex];
        const filterValue = filter.split(': ')[1];

        if (filter.startsWith(t('shop.brand'))) {
            const brandSlug = brands.find(b =>
                getLocalizedValue({ name: b.name, name_ar: b.name_ar || b.name }, locale) === filterValue
            )?.slug;

            if (brandSlug) {
                const currentBrands = toArray(filters.brand);
                const updatedBrands = currentBrands.filter(b => b !== brandSlug);

                if (updatedBrands.length === 0) {
                    params.delete('brand');
                } else {
                    params.set('brand', updatedBrands.join(','));
                }
            }
        } else if (filter.startsWith(t('shop.min_price'))) {
            params.delete('min_price');
        } else if (filter.startsWith(t('shop.max_price'))) {
            params.delete('max_price');
        } else if (filter.startsWith(t('shop.search'))) {
            params.delete('search');
        }

        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    }, [activeFilters, brands, filters, searchParams, router, pathname, t, locale]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        const params = new URLSearchParams();

        if (sort) {
            params.set('sort', sort);
        }

        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    }, [sort, router, pathname]);

    // Handle sort change
    const handleSortChange = useCallback((newSort: SortOption) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', newSort);
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    // Handle page change
    const handlePageChange = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    // Get category image URL with access token
    const categoryImageUrl = category.image
        ? getAssetUrl(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com', category.image)
        : null;

    // Verify image accessibility
    useEffect(() => {
        if (categoryImageUrl) {
            console.log('[CategoryContent] Loading category image:', categoryImageUrl);
            // Preload image to verify it's accessible
            const img = new Image();
            img.onload = () => console.log('[CategoryContent] Category image loaded successfully');
            img.onerror = () => console.warn('[CategoryContent] Category image failed to load');
            img.src = categoryImageUrl;
        }
    }, [categoryImageUrl]);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Category Hero Section - Animated Glass Morphism */}
            <div className={cn(
                "category-hero relative min-h-screen md:min-h-[600px] overflow-hidden",
                "bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"
            )}>
                {/* Background Image with Sophisticated Overlay */}
                {categoryImageUrl && (
                    <>
                        {/* Main Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url('${categoryImageUrl}')`,
                                backgroundAttachment: 'fixed',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />

                        {/* Gradient Overlay - Reduced opacity for better image visibility */}
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/50 to-neutral-900/60" />

                        {/* Gold Accent Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-background-gold/3 via-transparent to-primary-900/10" />
                    </>
                )}

                {/* Fallback gradient if no image */}
                {!categoryImageUrl && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-neutral-900 to-secondary-900" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                    </>
                )}

                {/* Decorative Elements - Luxury accents */}
                <div className="absolute top-10 right-20 w-1 h-32 bg-gradient-to-b from-background-gold via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-20 left-10 w-1 h-24 bg-gradient-to-b from-background-gold via-transparent to-transparent opacity-50" />

                {/* Corner Decorative Lines */}
                <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-background-gold via-background-gold to-transparent opacity-30" />
                <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-background-gold via-background-gold to-transparent opacity-30" />

                {/* Hero Content Container */}
                <div className="relative h-full w-full flex flex-col justify-between px-4 md:px-8 py-12 md:py-20 lg:py-24">

                    {/* Top Section: Category Label with Decorative Lines */}
                    <div className="flex justify-center animate-hero-label">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-background-gold opacity-60 animate-hero-line" />
                            <span className={cn(
                                "text-xs md:text-sm font-semibold tracking-widest uppercase",
                                "text-background-gold opacity-90",
                                fontFamily
                            )}
                                style={{
                                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                                }}>
                                {t('shop.category')}
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-background-gold opacity-60 animate-hero-line" />
                        </div>
                    </div>

                    {/* Bottom Section: Flex Layout (Desktop: side-by-side, Mobile: stacked) */}
                    <div className={cn(
                        "flex flex-col md:flex-row items-end justify-between gap-8 md:gap-6 lg:gap-12",
                        rtl && "md:flex-row-reverse"
                    )}>

                        {/* Left: Title & Description */}
                        <div className={cn(
                            "animate-hero-content flex-1 text-center",
                            rtl ? "md:text-right" : "md:text-left"
                        )}>
                            <h1 className={cn(
                                "text-5xl md:text-6xl lg:text-7xl font-bold mb-6",
                                "text-white",
                                "tracking-tight leading-tight text-center",
                                rtl ? "md:text-right" : "md:text-left",
                                fontFamily
                            )}
                                style={{
                                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 2px 10px rgba(0, 0, 0, 0.5)'
                                }}>
                                {getLocalizedValue({ name: category.name, name_ar: category.name_ar }, locale)}
                            </h1>

                            {/* Description */}
                            {category.description && (
                                <p className={cn(
                                    "text-base md:text-lg text-neutral-200 max-w-2xl",
                                    "leading-relaxed opacity-95",
                                    fontFamily,
                                    rtl ? "md:text-right" : "md:text-left"
                                )}
                                    style={{
                                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)'
                                    }}>
                                    {getLocalizedValue({ name: category.description, name_ar: category.description_ar }, locale)}
                                </p>
                            )}
                        </div>

                        {/* Right: Glass Morphism Product Count Box */}
                        <div className="animate-hero-glass w-full md:w-auto flex-shrink-0">
                            <div className={cn(
                                "relative",
                                "bg-white/10 backdrop-blur-xl",
                                "border border-white/20",
                                "rounded-2xl lg:rounded-3xl",
                                "px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10",
                                "text-center",
                                "shadow-xl",
                                "hover:bg-white/15 transition-colors duration-300"
                            )}
                                style={{
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                }}>

                                {/* Decorative Glow Background */}
                                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-background-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Content */}
                                <div className="relative">
                                    <div className={cn(
                                        "text-4xl md:text-5xl lg:text-6xl font-bold",
                                        "text-white mb-2",
                                        fontFamily
                                    )}
                                        style={{
                                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                                        }}>
                                        {pagination.totalProducts}
                                    </div>
                                    <div className={cn(
                                        "text-xs md:text-sm lg:text-base font-semibold",
                                        "text-white/80 tracking-widest uppercase",
                                        fontFamily
                                    )}
                                        style={{
                                            textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
                                        }}>
                                        {t('shop.products')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-60">
                        <svg className="w-6 h-6 text-background-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Filter Sidebar */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <CategoryFilterSidebar
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
                            <>
                                <LuxuryProductGrid
                                    products={products}
                                    locale={locale}
                                    columns={{ mobile: 2, tablet: 3, desktop: 3 }}
                                    gap="medium"
                                />

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-12">
                                        <Pagination
                                            currentPage={pagination.currentPage}
                                            totalPages={pagination.totalPages}
                                            onPageChange={handlePageChange}
                                            locale={locale}
                                        />
                                    </div>
                                )}
                            </>
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
                                    {t('shop.clear_all')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />

                    {/* Drawer */}
                    <div className={cn(
                        "absolute inset-y-0 w-80 max-w-[90%] bg-white shadow-lg overflow-y-auto",
                        rtl ? "left-0" : "right-0"
                    )}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={cn("text-lg font-bold", fontFamily)}>
                                    {t('shop.filter')}
                                </h2>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <CategoryFilterSidebar
                                brands={brands}
                                filters={filters}
                                locale={locale}
                            />

                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full mt-6 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {t('shop.apply_filters')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}