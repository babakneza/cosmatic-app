'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Filter } from 'lucide-react';

import { SortOption, Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface SortDropdownProps {
    currentSort?: SortOption;
    onSortChange: (sort: SortOption) => void;
    locale: Locale;
    variant?: 'full' | 'compact';
    onFilterClick?: () => void;
}

export default function SortDropdown({
    currentSort,
    onSortChange,
    locale,
    variant = 'full',
    onFilterClick
}: SortDropdownProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [isOpen, setIsOpen] = useState(false);

    // Sort options - Show only main options
    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'newest', label: t('shop.sort_newest') },
        { value: 'name_a_z', label: t('shop.sort_name_a_z') },
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

    // Compact variant for mobile (just buttons with filter icon)
    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2 py-2 px-3">
                {onFilterClick && (
                    <button
                        onClick={onFilterClick}
                        className="flex items-center justify-center h-8 w-8 flex-shrink-0 hover:bg-neutral-100 rounded transition-colors"
                        aria-label="Filter"
                        title={t('shop.filter')}
                    >
                        <Filter size={18} className="text-neutral-700" />
                    </button>
                )}
                <div className="flex flex-wrap gap-1.5 flex-1">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSortSelect(option.value)}
                            className={cn(
                                "px-2.5 py-1 text-xs rounded-full transition-all font-medium whitespace-nowrap",
                                currentSort === option.value
                                    ? "bg-primary text-white"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                                fontFamily
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Full variant (dropdown)
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-neutral-200 shadow-sm text-sm",
                    fontFamily
                )}
            >
                <span>{getCurrentSortLabel()}</span>
                <ChevronDown size={16} className={cn(
                    "transition-transform",
                    isOpen && "transform rotate-180"
                )} />
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
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