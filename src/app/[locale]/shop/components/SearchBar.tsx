'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

import { Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface SearchBarProps {
    initialQuery?: string;
    locale: Locale;
}

export default function SearchBar({ initialQuery = '', locale }: SearchBarProps) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const [query, setQuery] = useState(initialQuery);

    // Update query when initialQuery changes (e.g., when filters are cleared)
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams(searchParams.toString());

        if (query.trim()) {
            params.set('search', query.trim());
        } else {
            params.delete('search');
        }

        // Reset to page 1 when searching
        params.set('page', '1');

        router.push(`${pathname}?${params.toString()}`);
    };

    // Clear search
    const clearSearch = () => {
        setQuery('');

        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        params.set('page', '1');

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="w-full">
            <div className={cn(
                "relative flex items-center",
                fontFamily
            )}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className={cn(
                        "w-full px-4 py-2 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        rtl && "text-right pl-12 pr-4"
                    )}
                />

                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className={cn(
                            "absolute text-neutral-400 hover:text-neutral-700",
                            rtl ? "left-3" : "right-10"
                        )}
                    >
                        <X size={18} />
                    </button>
                )}

                <button
                    type="submit"
                    className={cn(
                        "absolute text-neutral-500 hover:text-primary",
                        rtl ? "left-10" : "right-3"
                    )}
                >
                    <Search size={20} />
                </button>
            </div>
        </form>
    );
}