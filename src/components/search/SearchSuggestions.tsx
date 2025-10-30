'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, Clock, TrendingUp, X } from 'lucide-react';

import { Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface SearchSuggestion {
    id: string;
    name: string;
    type: 'product' | 'category';
    slug: string;
    image?: string;
}

interface SearchSuggestionsProps {
    query: string;
    locale: Locale;
    onSelect?: (suggestion: SearchSuggestion | string) => void;
}

export default function SearchSuggestions({ query, locale, onSelect }: SearchSuggestionsProps) {
    const t = useTranslations();
    const router = useRouter();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularSearches, setPopularSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Load search history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('search_history');
        if (saved) {
            try {
                const history = JSON.parse(saved);
                setRecentSearches(history.slice(0, 5));
            } catch (e) {
                console.error('Error loading search history:', e);
            }
        }
    }, []);

    // Load popular searches from API
    useEffect(() => {
        fetch('/api/search/popular')
            .then(res => res.json())
            .then(data => setPopularSearches(data || []))
            .catch(err => {
                console.error('Error loading popular searches:', err);
            });
    }, []);

    // Fetch suggestions from API
    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        setShowSuggestions(true);

        const timer = setTimeout(() => {
            const searchUrl = `/api/search?q=${encodeURIComponent(query)}&type=all`;
            fetch(searchUrl)
                .then(res => res.json())
                .then(results => {
                    setSuggestions(results || []);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching suggestions:', err);
                    setSuggestions([]);
                    setIsLoading(false);
                });
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Save search to history
    const saveSearchHistory = useCallback((searchTerm: string) => {
        if (!searchTerm.trim()) return;

        const saved = localStorage.getItem('search_history');
        let history: string[] = [];

        try {
            if (saved) {
                history = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing search history:', e);
        }

        // Remove duplicate and add to front
        history = [searchTerm, ...history.filter(h => h !== searchTerm)].slice(0, 10);
        localStorage.setItem('search_history', JSON.stringify(history));
        setRecentSearches(history.slice(0, 5));
    }, []);

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        saveSearchHistory(suggestion.name);
        onSelect?.(suggestion);

        if (suggestion.type === 'product') {
            router.push(`/${locale}/products/${suggestion.slug}`);
        } else if (suggestion.type === 'category') {
            router.push(`/${locale}/categories/${suggestion.slug}`);
        }

        setShowSuggestions(false);
    };

    // Handle search term click (from history or popular)
    const handleSearchTermClick = (term: string) => {
        saveSearchHistory(term);
        onSelect?.(term);
        router.push(`/${locale}/search?q=${encodeURIComponent(term)}`);
        setShowSuggestions(false);
    };

    // Remove from history
    const removeFromHistory = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHistory = recentSearches.filter((_, i) => i !== index);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
        setRecentSearches(newHistory);
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!showSuggestions) return null;

    return (
        <div
            ref={suggestionsRef}
            className={cn(
                "absolute top-full mt-2 left-0 right-0 z-50",
                "bg-white border border-neutral-200 rounded-lg shadow-lg",
                "max-h-96 overflow-y-auto",
                fontFamily
            )}
        >
            {/* Search Results */}
            {query.trim().length >= 2 && (
                <>
                    {isLoading && (
                        <div className="px-4 py-8 text-center text-neutral-500">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        </div>
                    )}

                    {!isLoading && suggestions.length === 0 && (
                        <div className="px-4 py-6 text-center text-neutral-500 text-sm">
                            {t('search.no_results')}
                        </div>
                    )}

                    {!isLoading && suggestions.length > 0 && (
                        <div>
                            {suggestions.map((suggestion) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.id}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={cn(
                                        "w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0",
                                        "transition-colors duration-150 flex items-center gap-3",
                                        rtl && "flex-row-reverse"
                                    )}
                                >
                                    {suggestion.image && (
                                        <img
                                            src={suggestion.image}
                                            alt={suggestion.name}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    )}

                                    <div className={cn(
                                        "flex-1",
                                        rtl ? "text-right" : "text-left"
                                    )}>
                                        <div className="font-medium text-sm text-neutral-900">
                                            {suggestion.name}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {suggestion.type === 'product' ? t('search.product') : t('search.category')}
                                        </div>
                                    </div>

                                    <Search size={16} className="text-neutral-400 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Recent Searches */}
            {!query.trim() && recentSearches.length > 0 && (
                <div className="border-b border-neutral-200">
                    <div className={cn(
                        "px-4 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide flex items-center gap-2",
                        rtl && "flex-row-reverse"
                    )}>
                        <Clock size={14} />
                        {t('search.recent')}
                    </div>
                    {recentSearches.map((term, index) => (
                        <button
                            key={index}
                            onClick={() => handleSearchTermClick(term)}
                            className={cn(
                                "w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0",
                                "transition-colors duration-150 flex items-center justify-between",
                                rtl && "flex-row-reverse"
                            )}
                        >
                            <span>{term}</span>
                            <button
                                onClick={(e) => removeFromHistory(index, e)}
                                className="text-neutral-400 hover:text-neutral-600"
                            >
                                <X size={14} />
                            </button>
                        </button>
                    ))}
                </div>
            )}

            {/* Popular Searches */}
            {!query.trim() && popularSearches.length > 0 && (
                <div>
                    <div className={cn(
                        "px-4 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide flex items-center gap-2",
                        rtl && "flex-row-reverse"
                    )}>
                        <TrendingUp size={14} />
                        {t('search.trending')}
                    </div>
                    {popularSearches.map((term, index) => (
                        <button
                            key={index}
                            onClick={() => handleSearchTermClick(term)}
                            className={cn(
                                "w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0",
                                "transition-colors duration-150 text-left"
                            )}
                        >
                            {term}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}