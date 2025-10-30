'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

import { Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';
import { SearchSuggestion } from '@/lib/api/search';
import SearchSuggestions from './SearchSuggestions';

interface EnhancedSearchBarProps {
    initialQuery?: string;
    locale: Locale;
    variant?: 'default' | 'header' | 'compact';
}

export default function EnhancedSearchBar({
    initialQuery = '',
    locale,
    variant = 'default'
}: EnhancedSearchBarProps) {
    const t = useTranslations();
    const router = useRouter();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);

    // Update query when initialQuery changes
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (query.trim()) {
            router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
            setIsFocused(false);
        }
    };

    // Clear search
    const clearSearch = () => {
        setQuery('');
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion | string) => {
        // The navigation is handled in SearchSuggestions component
    };

    // Variants
    const inputClasses = {
        default: "w-full px-4 py-3 pr-12 border-2 border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        header: "w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        compact: "w-full px-3 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
    };

    const containerClasses = {
        default: "w-full max-w-md",
        header: "w-full max-w-xs",
        compact: "w-full"
    };

    return (
        <form onSubmit={handleSearch} className={cn("relative", containerClasses[variant])}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={t('search.placeholder')}
                    className={cn(
                        inputClasses[variant],
                        rtl && "text-right pl-4 pr-12",
                        fontFamily
                    )}
                />

                {/* Clear button */}
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors",
                            rtl ? "left-3" : "right-10"
                        )}
                    >
                        <X size={variant === 'compact' ? 16 : 18} />
                    </button>
                )}

                {/* Search button */}
                <button
                    type="submit"
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary transition-colors",
                        rtl ? "left-10" : "right-3"
                    )}
                    aria-label={t('search.search')}
                >
                    <Search size={variant === 'compact' ? 18 : 20} />
                </button>
            </div>

            {/* Suggestions dropdown */}
            {isFocused && (
                <SearchSuggestions
                    query={query}
                    locale={locale}
                    onSelect={handleSuggestionSelect}
                />
            )}
        </form>
    );
}