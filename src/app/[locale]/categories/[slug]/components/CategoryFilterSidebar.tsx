'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

import { Brand, Locale, ProductFilters } from '@/types';
import { cn, getFontFamily, getLocalizedValue } from '@/lib/utils';

interface CategoryFilterSidebarProps {
    brands: Brand[];
    filters: ProductFilters;
    locale: Locale;
}

export default function CategoryFilterSidebar({
    brands,
    filters,
    locale,
}: CategoryFilterSidebarProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fontFamily = getFontFamily(locale);

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        brand: true,
        price: true,
    });

    const [localMinPrice, setLocalMinPrice] = useState(filters.min_price || 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.max_price || 500);

    // Helper function to convert string or array to array
    const toArray = (value: string | string[] | undefined): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : value.split(',');
    };

    // Get selected brands from filters
    const selectedBrands = useMemo(() => toArray(filters.brand), [filters.brand]);

    // Toggle section expansion
    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    // Handle brand filter change
    const handleBrandChange = useCallback((brandSlug: string, checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());

        if (checked) {
            // Add brand to filter
            if (selectedBrands.length === 0) {
                params.set('brand', brandSlug);
            } else {
                params.set('brand', [...selectedBrands, brandSlug].join(','));
            }
        } else {
            // Remove brand from filter
            const updatedBrands = selectedBrands.filter(b => b !== brandSlug);
            if (updatedBrands.length === 0) {
                params.delete('brand');
            } else {
                params.set('brand', updatedBrands.join(','));
            }
        }

        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    }, [selectedBrands, searchParams, router, pathname]);

    // Handle price filter change
    const handlePriceChange = useCallback((type: 'min' | 'max', value: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (type === 'min') {
            setLocalMinPrice(value);
            if (value > 0) {
                params.set('min_price', value.toString());
            } else {
                params.delete('min_price');
            }
        } else {
            setLocalMaxPrice(value);
            if (value < 500) {
                params.set('max_price', value.toString());
            } else {
                params.delete('max_price');
            }
        }

        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    return (
        <div className="space-y-4">
            {/* Brands Filter */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('brand')}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors",
                        fontFamily
                    )}
                >
                    <span className="font-semibold text-neutral-800">
                        {t('shop.brands')}
                    </span>
                    <ChevronDown
                        size={18}
                        className={cn(
                            "text-neutral-600 transition-transform",
                            expandedSections.brand && "rotate-180"
                        )}
                    />
                </button>

                {expandedSections.brand && (
                    <div className="px-4 py-3 border-t border-neutral-100 space-y-3 max-h-80 overflow-y-auto">
                        {brands.length > 0 ? (
                            brands.map(brand => (
                                <label
                                    key={brand.id}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand.slug)}
                                        onChange={(e) => handleBrandChange(brand.slug, e.target.checked)}
                                        className="w-4 h-4 rounded border-neutral-300 text-primary cursor-pointer"
                                    />
                                    <span className={cn(
                                        "text-sm text-neutral-700 group-hover:text-primary transition-colors",
                                        fontFamily
                                    )}>
                                        {getLocalizedValue({ name: brand.name, name_ar: brand.name_ar }, locale)}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-neutral-500">{t('shop.no_brands_available')}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('price')}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors",
                        fontFamily
                    )}
                >
                    <span className="font-semibold text-neutral-800">
                        {t('shop.price_range')}
                    </span>
                    <ChevronDown
                        size={18}
                        className={cn(
                            "text-neutral-600 transition-transform",
                            expandedSections.price && "rotate-180"
                        )}
                    />
                </button>

                {expandedSections.price && (
                    <div className="px-4 py-3 border-t border-neutral-100 space-y-4">
                        {/* Min Price */}
                        <div>
                            <label className={cn(
                                "text-xs font-semibold text-neutral-600 block mb-2",
                                fontFamily
                            )}>
                                {t('shop.min_price')}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="500"
                                value={localMinPrice}
                                onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="mt-2 text-sm text-neutral-600">
                                {localMinPrice} OMR
                            </div>
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className={cn(
                                "text-xs font-semibold text-neutral-600 block mb-2",
                                fontFamily
                            )}>
                                {t('shop.max_price')}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="500"
                                value={localMaxPrice}
                                onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="mt-2 text-sm text-neutral-600">
                                {localMaxPrice} OMR
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}