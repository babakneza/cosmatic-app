'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    locale: Locale;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    locale
}: PaginationProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const rangeStart = Math.max(2, currentPage - 1);
        const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

        // Add ellipsis if needed before range
        if (rangeStart > 2) {
            pages.push('...');
        }

        // Add pages in range
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        // Add ellipsis if needed after range
        if (rangeEnd < totalPages - 1) {
            pages.push('...');
        }

        // Always show last page if more than 1 page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    // Handle previous page
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    // Handle next page
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // If only one page, don't show pagination
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={cn(
            "flex items-center justify-center gap-1",
            fontFamily
        )}>
            {/* Previous Button */}
            <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md border",
                    currentPage === 1
                        ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
                    rtl && "transform rotate-180"
                )}
                aria-label={t('shop.previous_page')}
            >
                <ChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-md border",
                            currentPage === page
                                ? "bg-primary text-white border-primary"
                                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                        )}
                    >
                        {page}
                    </button>
                ) : (
                    <span
                        key={index}
                        className="flex items-center justify-center w-10 h-10 text-neutral-500"
                    >
                        {page}
                    </span>
                )
            ))}

            {/* Next Button */}
            <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md border",
                    currentPage === totalPages
                        ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
                    rtl && "transform rotate-180"
                )}
                aria-label={t('shop.next_page')}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}