/**
 * API Utilities - Shared helper functions for API operations
 */

import { logger } from '@/lib/logger';
import {
    DirectusError,
    createErrorFromResponse,
    ApiError
} from './errors';
import { API_CONFIG } from '@/lib/config/constants';
import type { DirectusResponse, FetchOptions, RatingData } from './types';

/**
 * Get API token from environment
 */
export function getApiToken(): string {
    return (
        process.env.DIRECTUS_API_TOKEN ||
        process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN ||
        ''
    );
}

/**
 * Get Directus base URL
 */
export function getDirectusUrl(): string {
    return API_CONFIG.DIRECTUS_URL;
}

/**
 * Build image URL from file ID with access token
 */
export function buildAssetUrl(
    fileId: string | null | undefined,
    baseUrl: string = getDirectusUrl()
): string | null {
    if (!fileId) return null;

    const url = new URL(`${baseUrl}/assets/${fileId}`);
    const token = getApiToken();

    if (token) {
        url.searchParams.append('access_token', token);
    }

    return url.toString();
}

/**
 * Extract image ID from various formats
 */
export function extractImageId(
    image: string | { id: string } | null | undefined
): string | null {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image && typeof image === 'object' && 'id' in image) {
        return image.id;
    }
    return null;
}

/**
 * Make authenticated fetch request with retries
 */
export async function fetchWithRetry(
    options: FetchOptions,
    attempt: number = 1
): Promise<Response> {
    const maxRetries = options.retries ?? API_CONFIG.MAX_RETRIES;

    try {
        logger.logRequest(options.method || 'GET', options.url, options.headers);

        const startTime = Date.now();
        const response = await fetch(options.url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const duration = Date.now() - startTime;
        logger.logResponse(
            options.method || 'GET',
            options.url,
            response.status,
            duration
        );

        return response;
    } catch (error) {
        logger.logApiError(options.method || 'GET', options.url, error);

        if (attempt < maxRetries) {
            const delay = Math.min(
                API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1),
                API_CONFIG.MAX_RETRY_DELAY
            );

            logger.warn(
                `Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`,
                { url: options.url }
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchWithRetry(options, attempt + 1);
        }

        throw new DirectusError(
            `Network request failed after ${maxRetries} retries`,
            undefined,
            error
        );
    }
}

/**
 * Parse Directus API response
 */
export async function parseDirectusResponse<T>(
    response: Response
): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        throw new DirectusError(
            `Invalid response type: ${contentType}`,
            response.status
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw createErrorFromResponse(response.status, response.statusText, data);
    }

    return data;
}

/**
 * Make Directus API request
 */
export async function directusRequest<T>(
    endpoint: string,
    options: Partial<FetchOptions> = {}
): Promise<T> {
    const url = new URL(endpoint, getDirectusUrl());
    const token = getApiToken();

    const fetchOptions: FetchOptions = {
        ...options,
        url: url.toString(),
        headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    };

    const response = await fetchWithRetry(fetchOptions);
    return parseDirectusResponse<T>(response);
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(
    reviews: any[] | undefined
): RatingData {
    if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0 };
    }

    const totalRating = reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
    );
    const average = Math.round((totalRating / reviews.length) * 10) / 10;

    return { average, count: reviews.length };
}

/**
 * Process product images - convert file IDs to URLs
 */
export function processProductImages(
    product: any,
    baseUrl: string = getDirectusUrl()
): any {
    const processedProduct = { ...product };

    // Process main image
    if (product.main_image) {
        const imageId = extractImageId(product.main_image);
        if (imageId) {
            processedProduct.mainImageUrl = buildAssetUrl(imageId, baseUrl);
        }
    }

    // Process legacy image field
    if (product.image) {
        const imageId = extractImageId(product.image);
        if (imageId) {
            processedProduct.image = buildAssetUrl(imageId, baseUrl);
        }
    }

    // Process images array
    if (product.images && Array.isArray(product.images)) {
        processedProduct.images = product.images
            .map((img: any) => {
                const imageId = extractImageId(img);
                return imageId ? buildAssetUrl(imageId, baseUrl) : null;
            })
            .filter(Boolean);
    }

    // Process image gallery
    if (product.image_gallery && Array.isArray(product.image_gallery)) {
        processedProduct.processedImages = product.image_gallery
            .map((item: any) => {
                const fileId =
                    item.directus_files_id ||
                    (typeof item === 'string' ? item : item.id);
                const url = buildAssetUrl(fileId, baseUrl);
                return url ? { id: fileId, url } : null;
            })
            .filter(Boolean);
    }

    return processedProduct;
}

/**
 * Build URL search parameters from filter object
 */
export function buildSearchParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
        } else if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
        } else {
            searchParams.append(key, String(value));
        }
    });

    return searchParams;
}

/**
 * Build Directus filter object from product filters
 */
export function buildProductFilter(filters: any = {}): Record<string, any> {
    const filter: Record<string, any> = {};

    // Category filter
    if (filters.category) {
        filter.category = {
            slug: {
                _in: Array.isArray(filters.category)
                    ? filters.category
                    : [filters.category]
            }
        };
    }

    // Price range filter
    if (filters.min_price !== undefined || filters.max_price !== undefined) {
        const priceFilter: Record<string, any> = {};
        if (filters.min_price !== undefined) {
            priceFilter._gte = filters.min_price;
        }
        if (filters.max_price !== undefined) {
            priceFilter._lte = filters.max_price;
        }
        filter.price = priceFilter;
    }

    return filter;
}

/**
 * Handle 403 errors with fallback to public access
 */
export async function fetchWithPublicFallback<T>(
    url: string,
    options: { headers: Record<string, string> }
): Promise<T> {
    try {
        logger.debug('Attempting authenticated request', { url });
        const response = await fetch(url, {
            method: 'GET',
            headers: options.headers
        });

        if (response.ok) {
            return parseDirectusResponse<T>(response);
        }

        if (response.status === 403) {
            logger.warn('Authenticated request failed with 403, trying public access');
            const publicResponse = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (publicResponse.ok) {
                return parseDirectusResponse<T>(publicResponse);
            }

            throw createErrorFromResponse(
                publicResponse.status,
                publicResponse.statusText
            );
        }

        throw createErrorFromResponse(
            response.status,
            response.statusText
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new DirectusError('Failed to fetch data', undefined, error);
    }
}