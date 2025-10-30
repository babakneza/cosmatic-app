import { Locale } from '@/types';

/**
 * Convert Arabic-Indic numerals to English numerals
 * This ensures prices always display with English digits (0-9)
 */
function convertToEnglishNumerals(str: string): string {
    const arabicToEnglish: { [key: string]: string } = {
        '٠': '0',
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
    };
    return str.replace(/[٠-٩]/g, (digit) => arabicToEnglish[digit] || digit);
}

/**
 * Format amount in Omani Rial (OMR) with proper locale support
 * OMR uses 3 decimal places as standard
 * ALWAYS displays prices with English font and English digits (0-9)
 */
export function formatOMR(
    amount: number,
    locale: Locale = 'ar',
    options?: {
        showSymbol?: boolean;
        showCurrency?: boolean;
    }
): string {
    const { showSymbol = true, showCurrency = false } = options || {};

    // Format the number with 3 decimal places
    let formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-OM' : 'en-OM', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).format(amount);

    // IMPORTANT: Always convert to English numerals for price display
    formatted = convertToEnglishNumerals(formatted);

    // Add currency symbol or code based on locale
    if (locale === 'ar') {
        if (showSymbol) {
            return `${formatted} ر.ع.`;
        }
        if (showCurrency) {
            return `${formatted} ريال عماني`;
        }
        return formatted;
    } else {
        if (showSymbol) {
            return `OMR ${formatted}`;
        }
        if (showCurrency) {
            return `${formatted} Omani Rial`;
        }
        return formatted;
    }
}

/**
 * Parse OMR string to number
 */
export function parseOMR(value: string): number {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Format price range
 */
export function formatPriceRange(
    minPrice: number,
    maxPrice: number,
    locale: Locale = 'ar'
): string {
    const min = formatOMR(minPrice, locale);
    const max = formatOMR(maxPrice, locale);

    if (locale === 'ar') {
        return `${min} - ${max}`;
    }
    return `${min} - ${max}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
    originalPrice: number,
    salePrice: number
): number {
    if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Format discount percentage
 */
export function formatDiscount(
    originalPrice: number,
    salePrice: number,
    locale: Locale = 'ar'
): string {
    const discount = calculateDiscount(originalPrice, salePrice);
    if (discount === 0) return '';

    if (locale === 'ar') {
        return `خصم ${discount}٪`;
    }
    return `${discount}% OFF`;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
    items: Array<{ price: number; quantity: number }>,
    shippingCost: number = 0,
    taxRate: number = 0
): {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
} {
    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const tax = subtotal * taxRate;
    const total = subtotal + shippingCost + tax;

    return {
        subtotal: Number(subtotal.toFixed(3)),
        shipping: Number(shippingCost.toFixed(3)),
        tax: Number(tax.toFixed(3)),
        total: Number(total.toFixed(3)),
    };
}

/**
 * Check if free shipping threshold is met
 */
export function checkFreeShipping(
    subtotal: number,
    threshold: number = 20.0 // Free shipping over 20 OMR
): {
    isFree: boolean;
    remaining: number;
} {
    const isFree = subtotal >= threshold;
    const remaining = isFree ? 0 : threshold - subtotal;

    return {
        isFree,
        remaining: Number(remaining.toFixed(3)),
    };
}

/**
 * Format number with Arabic or English numerals
 */
export function formatNumber(
    value: number,
    locale: Locale = 'ar',
    useArabicNumerals: boolean = false
): string {
    const formatted = new Intl.NumberFormat(
        locale === 'ar' ? 'ar-OM' : 'en-OM'
    ).format(value);

    // Convert any Arabic numerals back to English (default behavior)
    // This ensures consistent English digit display across all locales
    return convertToEnglishNumerals(formatted);
}

/**
 * Currency configuration for Oman
 */
export const OMR_CURRENCY = {
    code: 'OMR',
    symbol: 'ر.ع.',
    name: 'Omani Rial',
    name_ar: 'ريال عماني',
    decimals: 3,
    locale: 'ar-OM',
} as const;
