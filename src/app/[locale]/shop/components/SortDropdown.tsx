'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

import { SortOption, Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface SortDropdownProps {
    currentSort?: SortOption;
    onSortChange: (sort: SortOption) => void;
    locale: Locale;
}

export default function SortDropdown({
    currentSort,
    onSortChange,
    locale
}: SortDropdownProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [isOpen, setIsOpen] = useState(false);

    // Sort options
    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'newest', label: t('shop.sort_newest') },
        { value: 'price_low_high', label: t('shop.sort_price_low_high') },
        { value: 'price_high_low', label: t('shop.sort_price_high_low') },
        { value: 'name_a_z', label: t('shop.sort_name_a_z') },
        { value: 'name_z_a', label: t('shop.sort_name_z_a') },
        { value: 'rating', label: t('shop.sort_rating') },
    ];

    // Get current sort label
    const getCurrentSortLabel = () => {
        if (!currentSort) return t('shop.sort_newest');
        return sortOptions.find(option => option.value === currentSort)?.label || t('shop.sort_newest');
    };

    // Handle sort selection
    const handleSortSelect = (sort: SortOption) => {
        onSortChange(sort);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-neutral-200 shadow-sm",
                    fontFamily
                )}
            >
                <span>{t('shop.sort_by')}: {getCurrentSortLabel()}</span>
                <ChevronDown size={16} className={cn(
                    "transition-transform",
                    isOpen && "transform rotate-180"
                )} />
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute z-10 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
                    rtl ? "right-0" : "left-0"
                )}>
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortSelect(option.value)}
                                className={cn(
                                    "block w-full text-left px-4 py-2 text-sm",
                                    currentSort === option.value
                                        ? "bg-primary-50 text-primary font-medium"
                                        : "text-neutral-700 hover:bg-neutral-100",
                                    fontFamily
                                )}
                                role="menuitem"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}