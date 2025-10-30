'use client';

import React from 'react';
import { formatOMR, formatNumber } from '@/lib/currency';
import type { Locale } from '@/types';

interface PriceProps {
    amount: number;
    locale?: Locale;
    showSymbol?: boolean;
    showCurrency?: boolean;
    className?: string;
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    weight?: 'normal' | 'semibold' | 'bold';
    strikethrough?: boolean;
}

/**
 * Price Component
 * 
 * Ensures all prices are displayed with:
 * - English font (Inter) regardless of locale
 * - English digits (0-9) regardless of locale
 * - Proper formatting with 3 decimal places for OMR
 * 
 * This component should be used for all price displays throughout the application
 * to ensure consistent formatting across all pages and languages.
 */
export default function Price({
    amount,
    locale = 'en',
    showSymbol = true,
    showCurrency = false,
    className = '',
    size = 'base',
    weight = 'normal',
    strikethrough = false,
}: PriceProps) {
    // Format the price using formatOMR which handles English numerals
    const formattedPrice = formatOMR(amount, locale, { showSymbol, showCurrency });

    // Size classes
    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
    };

    // Weight classes
    const weightClasses = {
        normal: 'font-normal',
        semibold: 'font-semibold',
        bold: 'font-bold',
    };

    // Combine all classes
    const allClasses = `
        ${sizeClasses[size]} 
        ${weightClasses[weight]} 
        ${strikethrough ? 'line-through' : ''} 
        ${className}
    `.trim();

    return (
        <span
            className={allClasses}
            style={{
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                direction: 'ltr', // Always LTR for prices
            }}
        >
            {formattedPrice}
        </span>
    );
}