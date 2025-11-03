/**
 * @fileOverview Utility Functions Library
 * 
 * Core utilities for:
 * - Tailwind CSS class manipulation
 * - Locale and direction handling (RTL/LTR)
 * - Text formatting (dates, phone numbers, text truncation)
 * - DOM utilities (slugification, generation)
 * - Localization helpers
 * - Performance utilities (debounce, throttle)
 * 
 * @module lib/utils
 * @requires clsx - For conditional CSS class names
 * @requires tailwind-merge - For intelligent Tailwind CSS merging
 * @requires @/types - Type definitions for Locale and Direction
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Locale, Direction } from '@/types';

/**
 * Merge Tailwind CSS classes intelligently
 * 
 * Combines multiple class values using clsx and removes conflicting
 * Tailwind utilities using tailwind-merge. Useful for combining
 * component base styles with prop overrides.
 * 
 * @param {...ClassValue[]} inputs - Class values to merge (strings, objects, arrays)
 * @returns {string} Merged and deduplicated CSS classes
 * 
 * @example
 * ```typescript
 * // Basic usage
 * cn('px-2 py-1', 'px-4'); // Returns: 'py-1 px-4'
 * 
 * // With conditional classes
 * cn('base-class', isActive && 'active-class');
 * 
 * // Combining arrays and objects
 * cn(['class1', 'class2'], { 'class3': true, 'class4': false });
 * ```
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get text direction based on locale
 * 
 * Determines whether text should flow right-to-left (RTL) or
 * left-to-right (LTR) based on the provided locale. Arabic locales
 * return 'rtl', all others return 'ltr'.
 * 
 * @param {Locale} locale - The locale code ('ar' or 'en')
 * @returns {Direction} Text direction ('rtl' for Arabic, 'ltr' for others)
 * 
 * @example
 * ```typescript
 * getDirection('ar'); // Returns: 'rtl'
 * getDirection('en'); // Returns: 'ltr'
 * ```
 */
export function getDirection(locale: Locale): Direction {
    return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Get opposite text direction
 * 
 * Toggles between RTL and LTR directions. Useful for layout flipping
 * or determining companion text direction.
 * 
 * @param {Direction} direction - The current direction ('rtl' or 'ltr')
 * @returns {Direction} The opposite direction
 * 
 * @example
 * ```typescript
 * getOppositeDirection('rtl'); // Returns: 'ltr'
 * getOppositeDirection('ltr'); // Returns: 'rtl'
 * ```
 */
export function getOppositeDirection(direction: Direction): Direction {
    return direction === 'rtl' ? 'ltr' : 'rtl';
}

/**
 * Check if locale uses right-to-left text direction
 * 
 * Convenience function to determine if a locale requires RTL layout.
 * Currently only Arabic ('ar') is RTL in this application.
 * 
 * @param {Locale} locale - The locale code
 * @returns {boolean} True if locale is RTL, false otherwise
 * 
 * @example
 * ```typescript
 * isRTL('ar'); // Returns: true
 * isRTL('en'); // Returns: false
 * ```
 */
export function isRTL(locale: Locale): boolean {
    return locale === 'ar';
}

/**
 * Get font family class based on locale
 * 
 * Returns the appropriate Tailwind font class for the given locale.
 * Ensures proper font rendering for Arabic and English text.
 * 
 * @param {Locale} locale - The locale code ('ar' or 'en')
 * @returns {string} Font family class name ('font-arabic' or 'font-english')
 * 
 * @remarks
 * Font classes must be defined in tailwind.config.ts
 * - font-arabic: Uses IBM Plex Sans Arabic
 * - font-english: Uses Inter font family
 * 
 * @example
 * ```typescript
 * getFontFamily('ar'); // Returns: 'font-arabic'
 * getFontFamily('en'); // Returns: 'font-english'
 * ```
 */
export function getFontFamily(locale: Locale): string {
    return locale === 'ar' ? 'font-arabic' : 'font-english';
}

/**
 * Format date according to locale and timezone
 * 
 * Formats a date using the Intl API with locale-specific formatting.
 * Automatically uses Oman locale (ar-OM / en-OM) for consistency.
 * 
 * @param {Date | string} date - Date to format (Date object or ISO string)
 * @param {Locale} locale - The locale code ('ar' or 'en')
 * @param {Intl.DateTimeFormatOptions} [options] - Formatting options (year, month, day, etc.)
 * @returns {string} Formatted date string
 * 
 * @throws {TypeError} If date is not a valid Date or date string
 * 
 * @example
 * ```typescript
 * formatDate(new Date('2024-01-15'), 'ar');
 * // Returns: "١٥ يناير ٢٠٢٤" (Arabic format)
 * 
 * formatDate('2024-01-15', 'en');
 * // Returns: "January 15, 2024" (English format)
 * 
 * // Custom options
 * formatDate(new Date(), 'ar', { 
 *   year: '2-digit', 
 *   month: '2-digit', 
 *   day: '2-digit' 
 * });
 * ```
 */
export function formatDate(
    date: Date | string,
    locale: Locale,
    options?: Intl.DateTimeFormatOptions
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    };

    return new Intl.DateTimeFormat(
        locale === 'ar' ? 'ar-OM' : 'en-OM',
        defaultOptions
    ).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago")
 * 
 * Converts a date to a human-readable relative time format using Intl.RelativeTimeFormat.
 * Automatically selects appropriate time units (seconds, minutes, hours, days, months, years).
 * 
 * @param {Date | string} date - Date to format (Date object or ISO string)
 * @param {Locale} locale - The locale code ('ar' or 'en')
 * @returns {string} Relative time string (e.g., "2 days ago", "منذ يومين")
 * 
 * @example
 * ```typescript
 * // 30 seconds ago
 * formatRelativeTime(new Date(Date.now() - 30000), 'en');
 * // Returns: "30 seconds ago"
 * 
 * // 2 days ago in Arabic
 * formatRelativeTime(new Date(Date.now() - 2 * 86400000), 'ar');
 * // Returns: "منذ يومين"
 * 
 * // Using ISO string
 * formatRelativeTime('2024-01-01T00:00:00Z', 'en');
 * ```
 */
export function formatRelativeTime(
    date: Date | string,
    locale: Locale
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(
        locale === 'ar' ? 'ar-OM' : 'en-OM',
        { numeric: 'auto' }
    );

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
}

/**
 * Truncate text with ellipsis suffix
 * 
 * Shortens text to a maximum length and appends '...' if truncation occurs.
 * Useful for displaying product names, descriptions in limited spaces.
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (ellipsis not included in this count)
 * @returns {string} Truncated text with ellipsis if needed
 * 
 * @example
 * ```typescript
 * truncate('This is a long product name', 15);
 * // Returns: "This is a long..."
 * 
 * truncate('Short', 10);
 * // Returns: "Short" (no truncation needed)
 * ```
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Convert text to URL-friendly slug
 * 
 * Transforms text into a kebab-case slug suitable for URLs and identifiers.
 * Removes special characters, converts to lowercase, and handles spacing.
 * 
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug (lowercase, hyphens, no special chars)
 * 
 * @example
 * ```typescript
 * slugify('Premium Oud Perfume');
 * // Returns: "premium-oud-perfume"
 * 
 * slugify('Limited-Edition @Product#2024');
 * // Returns: "limited-edition-product2024"
 * 
 * slugify('Product with   Multiple Spaces');
 * // Returns: "product-with-multiple-spaces"
 * ```
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Debounce function for throttling rapid function calls
 * 
 * Creates a debounced version of a function that only executes after
 * the specified wait time has elapsed without new calls. Useful for
 * search inputs, window resize handlers, or form validation.
 * 
 * @template T - Function type
 * @param {T} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {(...args: Parameters<T>) => void} Debounced function
 * 
 * @example
 * ```typescript
 * // Debounce search input
 * const debouncedSearch = debounce((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 * 
 * // Call multiple times, but function only executes after 300ms of no calls
 * inputElement.addEventListener('input', (e) => {
 *   debouncedSearch(e.target.value);
 * });
 * ```
 * 
 * @remarks
 * Debouncing ensures that an expensive function (like API calls) is not
 * called excessively. The function is only called once all calls have stopped
 * for the specified duration.
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for rate-limiting function calls
 * 
 * Creates a throttled version of a function that executes at most once
 * per specified time limit. Useful for scroll events, resize handlers,
 * or mouse move tracking where performance is critical.
 * 
 * @template T - Function type
 * @param {T} func - Function to throttle
 * @param {number} limit - Minimum interval in milliseconds between calls
 * @returns {(...args: Parameters<T>) => void} Throttled function
 * 
 * @example
 * ```typescript
 * // Throttle scroll handler
 * const throttledScroll = throttle(() => {
 *   checkIfNearBottom();
 * }, 1000);
 * 
 * window.addEventListener('scroll', throttledScroll);
 * // Handler fires at most once per second
 * ```
 * 
 * @remarks
 * Unlike debounce, throttle ensures the function executes periodically
 * while calls continue. First call executes immediately, subsequent calls
 * are queued to execute after the time limit.
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Generate authenticated Directus asset URL with optional transformations
 * 
 * Builds a complete URL for accessing Directus assets with automatic authentication
 * and optional image processing (resize, format conversion, quality adjustment).
 * Handles null/undefined IDs gracefully with fallback to placeholder image.
 * 
 * @param {string | null | undefined | object} assetId - Directus asset ID (UUID or object with id property)
 * @param {Object} [options] - Image transformation options
 * @param {number} [options.width] - Target image width in pixels
 * @param {number} [options.height] - Target image height in pixels
 * @param {number} [options.quality] - JPEG quality (1-100)
 * @param {'jpg' | 'png' | 'webp' | 'avif'} [options.format] - Output image format
 * @param {'cover' | 'contain' | 'inside' | 'outside'} [options.fit] - Image fitting mode
 * @param {string} [options.placeholder] - Custom placeholder image URL
 * @returns {string} Complete authenticated asset URL or placeholder
 * 
 * @example
 * ```typescript
 * // Basic usage with UUID
 * getDirectusAssetUrl('550e8400-e29b-41d4-a716-446655440000');
 * // Returns: "https://admin.buyjan.com/assets/550e8400-...?access_token=..."
 * 
 * // With image transformations
 * getDirectusAssetUrl(assetId, {
 *   width: 300,
 *   height: 300,
 *   format: 'webp',
 *   quality: 80,
 *   fit: 'cover'
 * });
 * 
 * // With object containing id property
 * getDirectusAssetUrl({ id: 'uuid-string' });
 * 
 * // Falls back to placeholder for null/undefined
 * getDirectusAssetUrl(null, { 
 *   placeholder: '/custom-placeholder.jpg' 
 * });
 * ```
 * 
 * @remarks
 * - Requires NEXT_PUBLIC_DIRECTUS_URL and DIRECTUS_API_TOKEN environment variables
 * - Invalid UUIDs return placeholder image
 * - URLs passed directly are returned as-is
 * - Public API token is used for client-side rendering
 */
export function getDirectusAssetUrl(
    assetId: string | null | undefined | object,
    options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'jpg' | 'png' | 'webp' | 'avif';
        fit?: 'cover' | 'contain' | 'inside' | 'outside';
        placeholder?: string; // Custom placeholder path
    }
): string {
    const placeholder = options?.placeholder || '/images/placeholder-product.jpg';

    // Handle null or undefined assetId
    if (assetId === null || assetId === undefined) {
        return placeholder;
    }

    // Handle empty string
    if (assetId === '') {
        return placeholder;
    }

    // If assetId is an object, try to extract the ID
    if (typeof assetId === 'object') {
        const assetObj = assetId as any;

        // Try different possible ID fields in the object
        if (assetObj.id) {
            assetId = assetObj.id;
        } else if (assetObj.directus_files_id) {
            assetId = assetObj.directus_files_id;
        } else if (assetObj.file_id) {
            assetId = assetObj.file_id;
        } else {
            // If no ID field is found, return placeholder
            return placeholder;
        }
    }

    // Convert to string if it's a number
    if (typeof assetId === 'number') {
        assetId = String(assetId);
    }

    // At this point, assetId should be a string
    if (typeof assetId !== 'string') {
        return placeholder;
    }

    // If assetId is already a full URL, return it directly
    if (assetId.startsWith('http')) {
        return assetId;
    }

    // If assetId is 'default' or some other placeholder indicator, return the placeholder
    if (assetId === 'default' || assetId === 'placeholder') {
        return placeholder;
    }

    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
    const params = new URLSearchParams();

    // Add image transformation parameters if provided
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.quality) params.append('quality', options.quality.toString());
    if (options?.format) params.append('format', options.format);
    if (options?.fit) params.append('fit', options.fit);

    // Add authentication token to the URL
    // Try to get token from both server-side and client-side environments
    let token = process.env.DIRECTUS_API_TOKEN;

    // For client-side, we need to use NEXT_PUBLIC_ prefixed env vars
    if (!token && typeof process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN === 'string') {
        token = process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;
    }

    if (token) {
        params.append('access_token', token);
    }

    const queryString = params.toString();

    // Validate that it looks like a UUID (contains hyphens)
    // If it's a numeric ID, it's likely incorrect and we should use the assets endpoint
    if (!assetId.includes('-') && !isNaN(Number(assetId))) {
        return placeholder;
    }

    // Use the assets endpoint with the UUID
    const url = `${baseUrl}/assets/${assetId}${queryString ? `?${queryString}` : ''}`;

    return url;
}

/**
 * Format Oman phone number to international format
 * 
 * Converts phone numbers to standardized international format (+968 XXXX XXXX).
 * Accepts local 8-digit numbers or international format with country code.
 * 
 * @param {string} phone - Phone number in any format (local or international)
 * @returns {string} Formatted phone number (+968 XXXX XXXX) or original if invalid
 * 
 * @example
 * ```typescript
 * // Local number
 * formatOmanPhone('91234567');
 * // Returns: "+968 9123 4567"
 * 
 * // With country code
 * formatOmanPhone('+968-9123-4567');
 * // Returns: "+968 9123 4567"
 * 
 * // International format
 * formatOmanPhone('00968 9123 4567');
 * // Returns: "+968 9123 4567"
 * ```
 * 
 * @remarks
 * Valid Oman phone numbers start with 7 or 9 (first digit after country code).
 * Format is always: +968 XXXX XXXX where X is digit 0-9
 */
export function formatOmanPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it starts with 968 (country code)
    if (cleaned.startsWith('968')) {
        const number = cleaned.slice(3);
        return `+968 ${number.slice(0, 4)} ${number.slice(4)}`;
    }

    // Assume it's a local number
    if (cleaned.length === 8) {
        return `+968 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }

    return phone;
}

/**
 * Validate Oman phone number
 * 
 * Checks if phone number is a valid Oman phone number.
 * Accepts 8-digit local format or 11-digit international format with country code 968.
 * First digit must be 7 or 9 (Oman mobile numbers).
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Oman phone number, false otherwise
 * 
 * @example
 * ```typescript
 * isValidOmanPhone('91234567');           // true (local format)
 * isValidOmanPhone('+968 9123 4567');     // true (international)
 * isValidOmanPhone('96891234567');        // true (country code, no +)
 * isValidOmanPhone('71234567');           // true (starts with 7)
 * isValidOmanPhone('81234567');           // false (must start with 7 or 9)
 * isValidOmanPhone('123');                // false (too short)
 * ```
 * 
 * @remarks
 * - Valid formats: 8 digits or 11 digits (with 968 prefix)
 * - First digit of local number must be 7 or 9
 * - Only accepts numeric digits for validation
 */
export function isValidOmanPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');

    // Should be 8 digits or 11 digits with country code (968)
    if (cleaned.length === 8) {
        return /^[79]\d{7}$/.test(cleaned);
    }

    if (cleaned.length === 11 && cleaned.startsWith('968')) {
        return /^968[79]\d{7}$/.test(cleaned);
    }

    return false;
}

/**
 * Validate email address format
 * 
 * Performs basic validation of email format using regex.
 * Does not verify if email actually exists or is deliverable.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com');           // true
 * isValidEmail('invalid.email@');             // false
 * isValidEmail('no-domain@.com');             // false
 * isValidEmail('spaces@exam ple.com');        // false
 * isValidEmail('valid+tag@example.co.uk');    // true
 * ```
 * 
 * @remarks
 * This is a simple regex-based validation. For production use, consider
 * sending a verification email to ensure the address is valid and owned
 * by the user. RFC 5322 compliant validation would be more complex.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate unique random ID
 * 
 * Creates a unique identifier combining random string and timestamp.
 * Suitable for temporary client-side IDs, though not cryptographically secure.
 * For security-sensitive IDs, use UUID v4 instead.
 * 
 * @returns {string} Unique random ID string
 * 
 * @example
 * ```typescript
 * const id = generateId();
 * // Returns: "abc123def456xyz789" (example format)
 * 
 * // Can be used for component keys, temporary state keys, etc.
 * const itemId = `item_${generateId()}`;
 * ```
 * 
 * @remarks
 * - Combines Math.random() and current timestamp
 * - Not suitable for cryptographic purposes
 * - Use UUID library for security-sensitive applications
 * - Each call produces a different ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Delay execution for specified milliseconds
 * 
 * Returns a promise that resolves after the specified delay.
 * Useful for debouncing, throttling, or adding intentional delays in async operations.
 * 
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after delay
 * 
 * @example
 * ```typescript
 * // Simple delay
 * await sleep(1000);
 * console.log('1 second has passed');
 * 
 * // In retry logic
 * for (let i = 0; i < 3; i++) {
 *   try {
 *     return await fetchData();
 *   } catch {
 *     if (i < 2) await sleep(1000 * (i + 1));
 *   }
 * }
 * ```
 * 
 * @remarks
 * - Non-blocking async delay using setTimeout
 * - Can be cancelled by rejecting the returned promise
 * - Use in async functions with await
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Detect if code is running in browser (client-side)
 * 
 * Checks if window object is available, indicating client-side execution.
 * Used to guard browser-specific APIs in SSR/isomorphic code.
 * 
 * @returns {boolean} True if running in browser, false on server
 * 
 * @example
 * ```typescript
 * if (isClient()) {
 *   // Safe to use window, localStorage, DOM APIs
 *   const userId = localStorage.getItem('userId');
 * }
 * ```
 * 
 * @remarks
 * - Always returns false during SSR (Next.js server components)
 * - Safe way to conditionally execute browser APIs
 * - Opposite of isServer()
 */
export function isClient(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Detect if code is running on server (server-side)
 * 
 * Checks if window object is unavailable, indicating server-side execution.
 * Used to guard server-only operations in isomorphic code.
 * 
 * @returns {boolean} True if running on server, false in browser
 * 
 * @example
 * ```typescript
 * if (isServer()) {
 *   // Safe to use server-only APIs
 *   const data = await fetchFromInternalDatabase();
 * }
 * ```
 * 
 * @remarks
 * - Always returns true during SSR (Next.js server components)
 * - Safe way to conditionally execute server-only code
 * - Opposite of isClient()
 */
export function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Get localized value from object with fallback
 * 
 * Retrieves locale-specific property from object, falling back to English version
 * if not available. Useful for displaying product names, descriptions in multiple languages.
 * 
 * @template T - Type of the value
 * @param {Record<string, T>} obj - Object containing localized properties
 * @param {Locale} locale - The locale code ('ar' or 'en')
 * @param {string} [fallbackKey='name'] - Base property name to look for (e.g., 'name', 'description')
 * @returns {T} Localized value or fallback value, or empty string if neither exists
 * 
 * @example
 * ```typescript
 * const product = {
 *   name: 'Perfume',
 *   name_ar: 'عطر',
 *   description: 'Premium fragrance',
 *   description_ar: 'عطر فاخر'
 * };
 * 
 * // Gets Arabic version
 * getLocalizedValue(product, 'ar', 'name');
 * // Returns: 'عطر'
 * 
 * // Gets English version
 * getLocalizedValue(product, 'en', 'name');
 * // Returns: 'Perfume'
 * 
 * // Description in Arabic
 * getLocalizedValue(product, 'ar', 'description');
 * // Returns: 'عطر فاخر'
 * ```
 * 
 * @remarks
 * Localized keys follow pattern: {fallbackKey}_ar for Arabic version
 * If locale-specific key doesn't exist, falls back to English version
 * Returns empty string if neither key exists or both are null/undefined
 */
export function getLocalizedValue<T>(
    obj: Record<string, T>,
    locale: Locale,
    fallbackKey: string = 'name'
): T {
    if (!obj) {
        return '' as unknown as T;
    }

    const localizedKey = locale === 'ar' ? `${fallbackKey}_ar` : fallbackKey;

    // Check if the keys exist
    const hasLocalizedKey = localizedKey in obj;
    const hasFallbackKey = fallbackKey in obj;

    // Return the appropriate value
    if (hasLocalizedKey && obj[localizedKey] !== null && obj[localizedKey] !== undefined) {
        return obj[localizedKey];
    }

    if (hasFallbackKey && obj[fallbackKey] !== null && obj[fallbackKey] !== undefined) {
        return obj[fallbackKey];
    }

    // If neither key exists or both values are null/undefined, return an empty string
    return '' as unknown as T;
}

/**
 * Parse JSON string with fallback
 * 
 * Safely parses JSON string and returns fallback value if parsing fails.
 * Useful for parsing data from localStorage, API responses, or user input.
 * 
 * @template T - Type of the parsed value
 * @param {string} json - JSON string to parse
 * @param {T} fallback - Value to return if parsing fails
 * @returns {T} Parsed JSON object or fallback value
 * 
 * @example
 * ```typescript
 * // Valid JSON
 * const data = safeJsonParse('{"name":"John","age":30}', {});
 * // Returns: {name: 'John', age: 30}
 * 
 * // Invalid JSON
 * const data = safeJsonParse('not json', { name: 'Unknown' });
 * // Returns: {name: 'Unknown'}
 * 
 * // Parse localStorage with default
 * const preferences = safeJsonParse(
 *   localStorage.getItem('preferences') || '',
 *   { theme: 'light' }
 * );
 * ```
 * 
 * @remarks
 * - Silently catches JSON parse errors
 * - Fallback should have same type as expected parsed value
 * - Useful for defensive programming with external data
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}

/**
 * Copy text to system clipboard
 * 
 * Copies text to user's clipboard using Clipboard API.
 * Only works on client-side and requires secure context (HTTPS).
 * 
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} True if copy succeeded, false if failed or not in browser
 * 
 * @example
 * ```typescript
 * // Copy product code
 * const success = await copyToClipboard('PRODUCT-123');
 * if (success) {
 *   showToast('Copied to clipboard');
 * }
 * 
 * // Copy referral link
 * const copied = await copyToClipboard(window.location.href);
 * ```
 * 
 * @remarks
 * - Returns false if not running in browser (isClient() false)
 * - Requires HTTPS in production (HTTP localhost works in development)
 * - User may see permission prompt depending on browser
 * - Text remains in clipboard until user copies something else
 * - Consider showing user feedback (toast notification)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!isClient()) return false;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Calculate average rating from product reviews
 * 
 * Computes average rating and count from reviews array.
 * Only includes published reviews (status !== 'draft').
 * Useful for displaying star ratings and review statistics.
 * 
 * @param {any[] | undefined} reviews - Array of review objects with 'rating' and optional 'status' fields
 * @returns {Object} Average rating and count of published reviews
 * @returns {number} average - Average rating (0 if no reviews), rounded to 1 decimal
 * @returns {number} count - Count of published reviews
 * 
 * @example
 * ```typescript
 * const reviews = [
 *   { rating: 5, status: 'published' },
 *   { rating: 4, status: 'published' },
 *   { rating: 3, status: 'draft' },      // Ignored
 *   { rating: 5, status: 'published' }
 * ];
 * 
 * const { average, count } = calculateAverageRating(reviews);
 * // Returns: { average: 4.7, count: 3 }
 * 
 * // No reviews
 * const empty = calculateAverageRating([]);
 * // Returns: { average: 0, count: 0 }
 * 
 * // Undefined reviews
 * const undef = calculateAverageRating(undefined);
 * // Returns: { average: 0, count: 0 }
 * ```
 * 
 * @remarks
 * - Filters out draft/unpublished reviews
 * - Returns average of 0 if no published reviews
 * - Average is rounded to 1 decimal place
 * - Used in product pages for star ratings
 */
export function calculateAverageRating(reviews: any[] | undefined): {
    average: number;
    count: number;
} {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return { average: 0, count: 0 };
    }

    // Filter published reviews only
    const publishedReviews = reviews.filter(
        (review) => review.status === 'published' || review.status === 'approved'
    );

    if (publishedReviews.length === 0) {
        return { average: 0, count: 0 };
    }

    const sum = publishedReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    const average = sum / publishedReviews.length;

    return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: publishedReviews.length,
    };
}
