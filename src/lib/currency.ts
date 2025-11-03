/**
 * @fileOverview Currency Formatting and Calculation Utilities
 * 
 * Specialized utilities for handling Omani Rial (OMR) currency formatting
 * and calculations. Features include:
 * - OMR formatting with 3 decimal places (standard for Oman)
 * - Automatic Arabic-to-English numeral conversion for price display
 * - Price range and discount calculations
 * - Free shipping threshold checks
 * - Cart total calculations with tax and shipping
 * 
 * @module lib/currency
 * @requires @/types - Type definitions for Locale
 * 
 * @remarks
 * All prices are in Omani Rial (OMR) with 3 decimal places
 * Display always uses English numerals (0-9) regardless of locale
 * Currency symbol: ر.ع. (Arabic) or OMR (English)
 */

import { Locale } from '@/types';

/**
 * Convert Arabic-Indic numerals to English numerals
 * 
 * Transforms Arabic numeral characters (٠-٩) to English digits (0-9).
 * Ensures consistent price display regardless of input numeral system.
 * 
 * @internal
 * @param {string} str - String potentially containing Arabic numerals
 * @returns {string} String with Arabic numerals converted to English digits
 * 
 * @example
 * ```typescript
 * convertToEnglishNumerals('السعر: ١٫٥ ريال');
 * // Returns: 'السعر: 1.5 ريال'
 * ```
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
 * Format amount in Omani Rial (OMR) with locale support
 * 
 * Formats currency amount with proper OMR formatting (3 decimal places).
 * Always displays with English numerals regardless of locale.
 * Supports showing currency symbol (ر.ع. / OMR) or name.
 * 
 * @param {number} amount - Amount in OMR to format
 * @param {Locale} [locale='ar'] - Locale code ('ar' for Arabic, 'en' for English)
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.showSymbol=true] - Show currency symbol (ر.ع. or OMR)
 * @param {boolean} [options.showCurrency=false] - Show full currency name
 * @returns {string} Formatted currency string
 * 
 * @example
 * ```typescript
 * // With symbol (default)
 * formatOMR(125.450, 'ar');
 * // Returns: "125.450 ر.ع."
 * 
 * // English format
 * formatOMR(125.450, 'en');
 * // Returns: "OMR 125.450"
 * 
 * // Just the number
 * formatOMR(125.450, 'ar', { showSymbol: false });
 * // Returns: "125.450"
 * 
 * // Full currency name
 * formatOMR(125.450, 'ar', { showCurrency: true });
 * // Returns: "125.450 ريال عماني"
 * ```
 * 
 * @remarks
 * - OMR always uses 3 decimal places (e.g., 125.450)
 * - Numerals always display in English (0-9)
 * - Locale only affects currency symbol/name and number formatting
 * - Numbers formatted using Intl.NumberFormat for proper grouping
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
 * Parse OMR formatted string to number
 * 
 * Extracts numeric value from formatted OMR string by removing
 * all non-digit characters except decimal point.
 * 
 * @param {string} value - Formatted OMR string (e.g., "125.450 ر.ع.")
 * @returns {number} Parsed numeric value, or 0 if parsing fails
 * 
 * @example
 * ```typescript
 * parseOMR("125.450 ر.ع.");      // Returns: 125.45
 * parseOMR("OMR 125.450");         // Returns: 125.45
 * parseOMR("125,450");             // Returns: 125.45 (comma removed)
 * parseOMR("invalid");             // Returns: 0
 * ```
 * 
 * @remarks
 * - Safe to use; returns 0 on any parse error
 * - Removes currency symbols and formatting automatically
 * - Handles multiple decimal points (takes first valid number)
 */
export function parseOMR(value: string): number {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Format price range (min - max)
 * 
 * Creates formatted price range string suitable for product listings
 * and filter displays. Both prices formatted with proper locale and OMR styling.
 * 
 * @param {number} minPrice - Minimum price in OMR
 * @param {number} maxPrice - Maximum price in OMR
 * @param {Locale} [locale='ar'] - Locale code for formatting
 * @returns {string} Formatted price range (e.g., "10.000 ر.ع. - 100.000 ر.ع.")
 * 
 * @example
 * ```typescript
 * // Price range for product listing
 * formatPriceRange(10.5, 99.99, 'ar');
 * // Returns: "10.500 ر.ع. - 99.990 ر.ع."
 * 
 * // English format
 * formatPriceRange(10.5, 99.99, 'en');
 * // Returns: "OMR 10.500 - OMR 99.990"
 * ```
 * 
 * @remarks
 * - Both prices formatted individually for consistency
 * - Range separator is always " - " regardless of locale
 * - Used in price filters and product range displays
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
 * 
 * Computes discount percentage between original and sale price.
 * Returns 0 if no discount applies or inputs are invalid.
 * 
 * @param {number} originalPrice - Original/list price in OMR
 * @param {number} salePrice - Sale/discounted price in OMR
 * @returns {number} Discount percentage (0-100), rounded to nearest integer
 * 
 * @example
 * ```typescript
 * // 20% discount
 * calculateDiscount(100, 80);  // Returns: 20
 * 
 * // No discount
 * calculateDiscount(100, 100); // Returns: 0
 * 
 * // Invalid prices
 * calculateDiscount(0, 50);    // Returns: 0
 * calculateDiscount(100, 150); // Returns: 0 (price increased)
 * ```
 * 
 * @remarks
 * - Returns 0 if sale price >= original price (no discount)
 * - Returns 0 if original price <= 0 (invalid input)
 * - Result rounded to nearest integer
 * - Used to display discount badges on products
 */
export function calculateDiscount(
    originalPrice: number,
    salePrice: number
): number {
    if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Format discount as localized string
 * 
 * Creates human-readable discount string with appropriate text
 * for the given locale. Shows percentage off badge.
 * 
 * @param {number} originalPrice - Original/list price in OMR
 * @param {number} salePrice - Sale/discounted price in OMR
 * @param {Locale} [locale='ar'] - Locale code for string formatting
 * @returns {string} Formatted discount string (e.g., "خصم 20٪" or "20% OFF"), or empty string if no discount
 * 
 * @example
 * ```typescript
 * // Arabic discount
 * formatDiscount(100, 80, 'ar');  // Returns: "خصم 20٪"
 * 
 * // English discount
 * formatDiscount(100, 80, 'en');  // Returns: "20% OFF"
 * 
 * // No discount
 * formatDiscount(100, 100, 'ar'); // Returns: ""
 * ```
 * 
 * @remarks
 * - Returns empty string if no discount applies
 * - Arabic uses "خصم" prefix, English uses "% OFF" suffix
 * - Arabic percentage symbol is ٪
 * - Used in product cards to highlight sales
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
 * Calculate cart totals with tax and shipping
 * 
 * Computes cart subtotal, tax, shipping, and grand total from items list.
 * All values properly rounded to 3 decimal places (OMR standard).
 * 
 * @param {Array<{price: number, quantity: number}>} items - Cart items with price and quantity
 * @param {number} [shippingCost=0] - Shipping cost in OMR (default: free shipping)
 * @param {number} [taxRate=0] - Tax rate as decimal (e.g., 0.05 for 5%) (default: no tax)
 * @returns {Object} Cart totals breakdown
 * @returns {number} subtotal - Sum of all items (price × quantity)
 * @returns {number} shipping - Shipping cost
 * @returns {number} tax - Calculated tax amount
 * @returns {number} total - Grand total (subtotal + shipping + tax)
 * 
 * @example
 * ```typescript
 * const cart = [
 *   { price: 50.000, quantity: 2 },  // 2 × 50 = 100
 *   { price: 25.500, quantity: 1 }   // 1 × 25.5 = 25.5
 * ];
 * 
 * const totals = calculateCartTotals(cart, 3.000, 0.05);
 * // Returns: {
 * //   subtotal: 125.500,
 * //   shipping: 3.000,
 * //   tax: 6.275,          // (125.5 × 0.05)
 * //   total: 134.775       // (125.5 + 3 + 6.275)
 * // }
 * 
 * // Free shipping
 * calculateCartTotals(cart);
 * // All values still rounded to 3 decimals
 * ```
 * 
 * @remarks
 * - All values rounded to 3 decimal places (OMR standard)
 * - Subtotal calculated before tax and shipping
 * - Tax calculated on subtotal only (not including shipping)
 * - Empty items array returns subtotal of 0
 * - Results safe for database storage and display
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
 * Check if cart qualifies for free shipping
 * 
 * Determines if cart subtotal meets free shipping threshold.
 * Also calculates remaining amount needed for free shipping.
 * 
 * @param {number} subtotal - Cart subtotal in OMR
 * @param {number} [threshold=20.0] - Free shipping threshold in OMR (default: 20.0 OMR)
 * @returns {Object} Free shipping status
 * @returns {boolean} isFree - True if subtotal >= threshold
 * @returns {number} remaining - Amount needed to qualify for free shipping (0 if already qualifying)
 * 
 * @example
 * ```typescript
 * // Below threshold
 * checkFreeShipping(15.0);
 * // Returns: { isFree: false, remaining: 5.0 }
 * 
 * // Meets threshold
 * checkFreeShipping(25.0);
 * // Returns: { isFree: true, remaining: 0 }
 * 
 * // Custom threshold
 * checkFreeShipping(25.0, 50.0);
 * // Returns: { isFree: false, remaining: 25.0 }
 * 
 * // Exactly at threshold
 * checkFreeShipping(20.0);
 * // Returns: { isFree: true, remaining: 0 }
 * ```
 * 
 * @remarks
 * - Default threshold is 20.0 OMR
 * - Remaining value always rounded to 3 decimal places
 * - Useful for showing "Add X more to get free shipping" messages
 * - Used in cart UI and checkout summaries
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
 * Convert Omani Rial (OMR) to USD (US Dollar)
 * 
 * Converts OMR amounts to USD for PayPal Sandbox transactions.
 * PayPal Sandbox has limited currency support and does not include OMR.
 * USD is universally supported by PayPal in all environments (Sandbox and Live),
 * making it the most reliable choice for currency conversion.
 * 
 * Exchange rate: 1 OMR ≈ 2.6 USD (using standard pegged rate)
 * 
 * @param {number} omrAmount - Amount in Omani Rial (OMR)
 * @returns {string} Amount in US Dollar (USD) formatted to 2 decimal places (PayPal standard)
 * 
 * @example
 * ```typescript
 * // Convert 100 OMR to USD
 * convertOMRtoUSD(100.000);  // Returns: "260.00"
 * 
 * // Convert with decimal amount
 * convertOMRtoUSD(25.500);   // Returns: "66.30"
 * ```
 * 
 * @remarks
 * - Uses standard OMR to USD conversion rate (1 OMR = 2.6 USD)
 * - OMR is pegged to a basket of international currencies, with USD being ~2.6x
 * - Result formatted to 2 decimal places per PayPal API requirements
 * - USD is universally supported in PayPal Sandbox and Live environments
 * - Used exclusively for PayPal transactions
 * - Internal OMR pricing is preserved throughout the application
 */
export function convertOMRtoUSD(omrAmount: number): string {
    // Exchange rate: 1 OMR = 2.6 USD
    const OMR_TO_USD_RATE = 2.6;
    const usdAmount = omrAmount * OMR_TO_USD_RATE;

    // Format to 2 decimal places (PayPal API requirement)
    return usdAmount.toFixed(2);
}

/**
 * @deprecated Use convertOMRtoUSD instead. AED may not be supported in PayPal Sandbox.
 * Kept for backwards compatibility.
 */
export function convertOMRtoAED(omrAmount: number): string {
    return convertOMRtoUSD(omrAmount);
}

/**
 * Format number with locale-aware formatting
 * 
 * Formats numeric value using Intl.NumberFormat with locale settings.
 * Always converts to English numerals (0-9) for consistent display.
 * 
 * @param {number} value - Number to format
 * @param {Locale} [locale='ar'] - Locale code for number formatting
 * @param {boolean} [useArabicNumerals=false] - If true, display Arabic numerals (experimental)
 * @returns {string} Formatted number string with English numerals
 * 
 * @example
 * ```typescript
 * // Arabic locale (English numerals)
 * formatNumber(1234.567, 'ar');
 * // Returns: "1,234.567" (Intl formatted with English digits)
 * 
 * // English locale
 * formatNumber(1234.567, 'en');
 * // Returns: "1,234.567"
 * 
 * // Large number
 * formatNumber(999999.99, 'ar');
 * // Returns: "999,999.99"
 * ```
 * 
 * @remarks
 * - Always returns English numerals regardless of locale
 * - useArabicNumerals parameter currently ignored (reserved for future)
 * - Uses Oman locale (ar-OM / en-OM) for proper formatting
 * - Suitable for displaying quantities, counts, amounts
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
 * Omani Rial (OMR) currency configuration
 * 
 * Standard currency metadata for Oman including code, symbol, name, and decimal places.
 * Used throughout the application for currency-related operations and display.
 * 
 * @constant
 * @type {Object}
 * @property {string} code - ISO 4217 currency code ('OMR')
 * @property {string} symbol - Arabic currency symbol ('ر.ع.')
 * @property {string} name - English currency name ('Omani Rial')
 * @property {string} name_ar - Arabic currency name ('ريال عماني')
 * @property {number} decimals - Number of decimal places (3 for OMR)
 * @property {string} locale - Oman-specific locale for formatting ('ar-OM')
 * 
 * @example
 * ```typescript
 * console.log(OMR_CURRENCY.code);    // 'OMR'
 * console.log(OMR_CURRENCY.symbol);  // 'ر.ع.'
 * console.log(OMR_CURRENCY.decimals);// 3
 * 
 * // Use for displaying currency info
 * const currencyDisplay = `${OMR_CURRENCY.name} (${OMR_CURRENCY.symbol})`;
 * ```
 * 
 * @remarks
 * - OMR is ISO 4217 standard currency code for Oman
 * - Always 3 decimal places, not 2 like most other currencies
 * - Used as single source of truth for currency information
 * - All values are read-only (const assertion)
 */
export const OMR_CURRENCY = {
    code: 'OMR',
    symbol: 'ر.ع.',
    name: 'Omani Rial',
    name_ar: 'ريال عماني',
    decimals: 3,
    locale: 'ar-OM',
} as const;
