import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Locale, Direction } from '@/types';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get text direction based on locale
 */
export function getDirection(locale: Locale): Direction {
    return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Get opposite direction
 */
export function getOppositeDirection(direction: Direction): Direction {
    return direction === 'rtl' ? 'ltr' : 'rtl';
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
    return locale === 'ar';
}

/**
 * Get font family based on locale
 */
export function getFontFamily(locale: Locale): string {
    return locale === 'ar' ? 'font-arabic' : 'font-english';
}

/**
 * Format date based on locale
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
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Generate slug from text
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
 * Debounce function
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
 * Throttle function
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
 * Get Directus asset URL with authentication
 * 
 * This function generates a URL for a Directus asset with proper authentication
 * and optional image transformation parameters.
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
 * Format phone number for Oman (+968)
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
 * Validate email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if code is running on client side
 */
export function isClient(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Check if code is running on server side
 */
export function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Get localized value from object
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
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}

/**
 * Copy to clipboard
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
 * Calculate average rating from reviews array
 * Filters only published reviews
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
