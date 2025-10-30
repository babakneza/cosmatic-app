'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Category, Brand, Locale, ProductFilters } from '@/types';
import { cn, isRTL, getFontFamily, getLocalizedValue, debounce } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterSidebarProps {
    categories: Category[];
    brands: Brand[];
    filters: ProductFilters;
    locale: Locale;
    isMobile?: boolean;
    onClose?: () => void;
}

export default function FilterSidebar({
    categories,
    brands,
    filters,
    locale,
    isMobile = false,
    onClose
}: FilterSidebarProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    // Convert string or array to array helper
    const toArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : value.split(',');
    };

    // Initialize local state from URL params
    const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(
        toArray(filters.category)
    );
    const [localSelectedBrands, setLocalSelectedBrands] = useState<string[]>(
        toArray(filters.brand)
    );

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: true,
        price: true
    });

    const [priceRange, setPriceRange] = useState({
        min: filters.min_price?.toString() || '',
        max: filters.max_price?.toString() || ''
    });

    // Update URL with debounced function to avoid excessive navigation
    const updateUrlWithDebounce = useCallback(
        debounce((categoryParams: string[], brandParams: string[]) => {
            const params = new URLSearchParams(searchParams.toString());

            // Update category parameter
            if (categoryParams.length === 0) {
                params.delete('category');
            } else {
                params.set('category', categoryParams.join(','));
            }

            // Update brand parameter
            if (brandParams.length === 0) {
                params.delete('brand');
            } else {
                params.set('brand', brandParams.join(','));
            }

            // Reset to page 1 when changing filters
            params.set('page', '1');

            // Use replace instead of push to avoid adding to history stack
            router.replace(`${pathname}?${params.toString()}`);
        }, 300),
        [router, pathname, searchParams]
    );

    // Sync local state with URL params when they change externally
    useEffect(() => {
        const urlCategories = toArray(filters.category);
        const urlBrands = toArray(filters.brand);

        // Only update if different to avoid loops
        if (JSON.stringify(urlCategories) !== JSON.stringify(localSelectedCategories)) {
            setLocalSelectedCategories(urlCategories);
        }

        if (JSON.stringify(urlBrands) !== JSON.stringify(localSelectedBrands)) {
            setLocalSelectedBrands(urlBrands);
        }
    }, [filters.category, filters.brand]);

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Check if a value is selected - use local state for immediate feedback
    const isSelected = useCallback((key: string, value: string): boolean => {
        const selected = key === 'category' ? localSelectedCategories : localSelectedBrands;
        return selected.includes(value);
    }, [localSelectedCategories, localSelectedBrands]);

    // Toggle a filter value (add or remove) - update local state immediately
    const toggleFilter = useCallback((key: string, value: string) => {
        if (key === 'category') {
            setLocalSelectedCategories(prev => {
                const newCategories = [...prev];
                const index = newCategories.indexOf(value);

                if (index === -1) {
                    newCategories.push(value);
                } else {
                    newCategories.splice(index, 1);
                }

                // Update URL with debounce
                updateUrlWithDebounce(newCategories, localSelectedBrands);
                return newCategories;
            });
        } else if (key === 'brand') {
            setLocalSelectedBrands(prev => {
                const newBrands = [...prev];
                const index = newBrands.indexOf(value);

                if (index === -1) {
                    newBrands.push(value);
                } else {
                    newBrands.splice(index, 1);
                }

                // Update URL with debounce
                updateUrlWithDebounce(localSelectedCategories, newBrands);
                return newBrands;
            });
        }
    }, [localSelectedCategories, localSelectedBrands, updateUrlWithDebounce]);

    // Apply price range
    const applyPriceRange = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (priceRange.min) {
            params.set('min_price', priceRange.min);
        } else {
            params.delete('min_price');
        }

        if (priceRange.max) {
            params.set('max_price', priceRange.max);
        } else {
            params.delete('max_price');
        }

        // Reset to page 1 when changing filters
        params.set('page', '1');

        router.replace(`${pathname}?${params.toString()}`);

        // Close mobile sidebar if applicable
        if (isMobile && onClose) {
            onClose();
        }
    }, [priceRange, searchParams, router, pathname, isMobile, onClose]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        // Clear local state immediately
        setLocalSelectedCategories([]);
        setLocalSelectedBrands([]);
        setPriceRange({ min: '', max: '' });

        const params = new URLSearchParams();

        // Preserve sort parameter if it exists
        const sort = searchParams.get('sort');
        if (sort) {
            params.set('sort', sort);
        }

        // Reset to page 1
        params.set('page', '1');

        router.replace(`${pathname}?${params.toString()}`);

        // Close mobile sidebar if applicable
        if (isMobile && onClose) {
            onClose();
        }
    }, [searchParams, router, pathname, isMobile, onClose]);

    // Memoize the rendered categories and brands to prevent unnecessary re-renders
    const renderedCategories = useMemo(() => {
        return categories.map(category => (
            <div key={category.id} className="flex items-center">
                <Checkbox
                    id={`category-${category.id}`}
                    checked={isSelected('category', category.slug)}
                    onCheckedChange={() => {
                        toggleFilter('category', category.slug);
                    }}
                    className="mr-2"
                />
                <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm text-neutral-700 cursor-pointer flex justify-between w-full"
                >
                    <span>{getLocalizedValue(
                        { name: category.name, name_ar: category.name_ar || category.name },
                        locale
                    )}</span>
                    {isSelected('category', category.slug) && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            ✓
                        </span>
                    )}
                </label>
            </div>
        ));
    }, [categories, isSelected, toggleFilter, locale]);

    const renderedBrands = useMemo(() => {
        return brands.map(brand => (
            <div key={brand.id} className="flex items-center">
                <Checkbox
                    id={`brand-${brand.id}`}
                    checked={isSelected('brand', brand.slug)}
                    onCheckedChange={() => {
                        toggleFilter('brand', brand.slug);
                    }}
                    className="mr-2"
                />
                <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm text-neutral-700 cursor-pointer flex justify-between w-full"
                >
                    <span>{getLocalizedValue(
                        { name: brand.name, name_ar: brand.name_ar || brand.name },
                        locale
                    )}</span>
                    {isSelected('brand', brand.slug) && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            ✓
                        </span>
                    )}
                </label>
            </div>
        ));
    }, [brands, isSelected, toggleFilter, locale]);

    return (
        <div className={cn("bg-white rounded-lg shadow-sm border border-neutral-200 p-4", fontFamily)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg text-neutral-800">
                    {t('shop.filters')}
                </h3>

                <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary hover:text-primary-600 underline"
                >
                    {t('shop.clear_all')}
                </button>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full text-left mb-3"
                >
                    <h4 className="font-medium text-neutral-800">
                        {t('shop.categories')}
                    </h4>
                    {expandedSections.categories ? (
                        <ChevronUp size={18} className="text-neutral-500" />
                    ) : (
                        <ChevronDown size={18} className="text-neutral-500" />
                    )}
                </button>

                {expandedSections.categories && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {renderedCategories}
                    </div>
                )}
            </div>

            {/* Brands Filter */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('brands')}
                    className="flex items-center justify-between w-full text-left mb-3"
                >
                    <h4 className="font-medium text-neutral-800">
                        {t('shop.brands')}
                    </h4>
                    {expandedSections.brands ? (
                        <ChevronUp size={18} className="text-neutral-500" />
                    ) : (
                        <ChevronDown size={18} className="text-neutral-500" />
                    )}
                </button>

                {expandedSections.brands && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {renderedBrands}
                    </div>
                )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left mb-3"
                >
                    <h4 className="font-medium text-neutral-800">
                        {t('shop.price_range')}
                    </h4>
                    {expandedSections.price ? (
                        <ChevronUp size={18} className="text-neutral-500" />
                    ) : (
                        <ChevronDown size={18} className="text-neutral-500" />
                    )}
                </button>

                {expandedSections.price && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <label htmlFor="min-price" className="text-xs text-neutral-500 mb-1 block">
                                    {t('shop.min_price')}
                                </label>
                                <input
                                    id="min-price"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex-1">
                                <label htmlFor="max-price" className="text-xs text-neutral-500 mb-1 block">
                                    {t('shop.max_price')}
                                </label>
                                <input
                                    id="max-price"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <button
                            onClick={applyPriceRange}
                            className="w-full bg-primary hover:bg-primary-600 text-white py-2 rounded-md text-sm transition-colors"
                        >
                            {t('shop.apply')}
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Apply Button */}
            {isMobile && (
                <button
                    onClick={onClose}
                    className="w-full bg-primary hover:bg-primary-600 text-white py-3 rounded-md font-medium transition-colors mt-4"
                >
                    {t('shop.apply_filters')}
                </button>
            )}
        </div>
    );
}