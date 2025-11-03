/**
 * Refactored Products API
 * Consolidated and simplified product fetching with shared utilities
 * To replace existing directus.ts and products.ts
 */

import {
    fetchWithRetry,
    parseDirectusResponse,
    buildProductFilter,
    buildSearchParams,
    calculateAverageRating,
    processProductImages,
    fetchWithPublicFallback,
    getDirectusUrl,
    getApiToken
} from './api-utils';
import { DirectusError, NotFoundError } from './errors';
import { logger, createScopedLogger } from '@/lib/logger';
import { PRODUCT_DETAIL_FIELDS, PRODUCT_LIST_FIELDS, API_CONFIG, PAGINATION_CONFIG } from '@/lib/config/constants';
import type { DirectusResponse, ProductFilters } from './types';

const scopedLogger = createScopedLogger('ProductsAPI');

/**
 * Interface for products response
 */
interface ProductsResponse {
    data: any[];
    meta: {
        total_count: number;
        filter_count: number;
    };
}

/**
 * Fetch multiple products with filters, sorting, and pagination
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
        scopedLogger.debug('Fetching products', { filters });

        const directusUrl = getDirectusUrl();
        const token = getApiToken();

        const limit = filters.limit || PAGINATION_CONFIG.DEFAULT_LIMIT;
        const offset = filters.offset || PAGINATION_CONFIG.DEFAULT_OFFSET;

        // Build query parameters
        const queryParams: Record<string, any> = {
            fields: PRODUCT_LIST_FIELDS.join(','),
            limit,
            offset
        };

        // Add search if provided
        if (filters.search) {
            queryParams.search = filters.search;
        }

        // Add sort if provided
        if (filters.sort) {
            queryParams.sort = filters.sort;
        }

        // Build filter object
        const filterObj = buildProductFilter(filters);
        if (Object.keys(filterObj).length > 0) {
            queryParams.filter = filterObj;
        }

        // Build URL
        const url = new URL(`${directusUrl}/items/products`);
        const searchParams = buildSearchParams(queryParams);
        url.search = searchParams.toString();

        scopedLogger.debug('API Request', {
            url: url.toString(),
            method: 'GET'
        });

        // Make request
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new DirectusError(
                `Failed to fetch products: ${response.statusText}`,
                response.status
            );
        }

        const result: DirectusResponse<any> = await parseDirectusResponse(response);

        // Process products
        const products = (result.data || []).map((product) => {
            // Calculate rating from reviews
            if (product.product_reviews) {
                const ratingData = calculateAverageRating(product.product_reviews);
                product.rating = ratingData.average;
                product.rating_count = ratingData.count;
            }

            // Process images
            return processProductImages(product, directusUrl);
        });

        scopedLogger.debug('Products fetched successfully', {
            count: products.length,
            total: result.meta?.total_count
        });

        return {
            data: products,
            meta: {
                total_count: result.meta?.total_count || 0,
                filter_count: result.meta?.filter_count || 0
            }
        };
    } catch (error) {
        scopedLogger.error('Failed to fetch products', error);

        // Return empty result on error instead of throwing
        // This maintains backwards compatibility
        return {
            data: [],
            meta: {
                total_count: 0,
                filter_count: 0
            }
        };
    }
}

/**
 * Fetch single product by ID or slug
 * Tries authenticated request first, falls back to public access on 403
 */
export async function getProduct(idOrSlug: string): Promise<{ data: any }> {
    try {
        scopedLogger.debug('Fetching product', { idOrSlug });

        if (!idOrSlug) {
            throw new NotFoundError('Product ID or slug is required');
        }

        const directusUrl = getDirectusUrl();
        const token = getApiToken();

        // Determine filter type
        const isUUID = idOrSlug.includes('-') && idOrSlug.length > 20;
        const isNumericId = /^\d+$/.test(idOrSlug);
        const filterKey = isUUID || isNumericId ? 'id' : 'slug';

        const filter = {
            [filterKey]: { _eq: idOrSlug }
        };

        // Build URL
        const url = new URL(`${directusUrl}/items/products`);
        url.searchParams.append('filter', JSON.stringify(filter));
        url.searchParams.append('fields', PRODUCT_DETAIL_FIELDS.join(','));

        scopedLogger.debug('API Request', {
            url: url.toString(),
            filterKey,
            value: idOrSlug
        });

        // Try authenticated request first, fall back to public
        const result: DirectusResponse<any> = await fetchWithPublicFallback(
            url.toString(),
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const products = result.data || [];

        if (products.length === 0) {
            throw new NotFoundError(
                `Product not found: ${idOrSlug}`
            );
        }

        const product = products[0];

        // Calculate rating from reviews
        if (product.product_reviews) {
            const ratingData = calculateAverageRating(product.product_reviews);
            product.rating = ratingData.average;
            product.rating_count = ratingData.count;
        }

        // Process images
        const processedProduct = processProductImages(product, directusUrl);

        scopedLogger.debug('Product fetched successfully', {
            id: product.id,
            slug: product.slug
        });

        return { data: processedProduct };
    } catch (error) {
        scopedLogger.error('Failed to fetch product', error);
        throw error;
    }
}

/**
 * Fetch product review statistics
 */
export async function getProductReviewStats(productId: string) {
    try {
        scopedLogger.debug('Fetching review stats', { productId });

        const directusUrl = getDirectusUrl();
        const token = getApiToken();

        const url = new URL(`${directusUrl}/items/product_reviews`);
        url.searchParams.append(
            'filter',
            JSON.stringify({ product: { _eq: productId } })
        );
        url.searchParams.append('fields', 'id,rating');

        const response = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            scopedLogger.warn('Failed to fetch review stats', {
                status: response.status
            });
            return { average_rating: 0, review_count: 0 };
        }

        const result: DirectusResponse<any> = await parseDirectusResponse(response);
        const reviews = result.data || [];

        if (reviews.length === 0) {
            return { average_rating: 0, review_count: 0 };
        }

        const totalRating = reviews.reduce(
            (sum, review) => sum + (review.rating || 0),
            0
        );
        const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

        scopedLogger.debug('Review stats calculated', {
            average: averageRating,
            count: reviews.length
        });

        return {
            average_rating: averageRating,
            review_count: reviews.length
        };
    } catch (error) {
        scopedLogger.error('Error fetching review stats', error);
        return { average_rating: 0, review_count: 0 };
    }
}

/**
 * Fetch product reviews
 */
export async function getProductReviews(productId: string) {
    try {
        scopedLogger.debug('Fetching reviews', { productId });

        const directusUrl = getDirectusUrl();
        const token = getApiToken();

        const url = new URL(`${directusUrl}/items/product_reviews`);
        url.searchParams.append(
            'filter',
            JSON.stringify({ product: { _eq: productId } })
        );
        url.searchParams.append(
            'fields',
            'id,rating,title,comment,is_helpful,customer,created_at'
        );
        url.searchParams.append('sort', '-rating');

        const response = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            scopedLogger.warn('Failed to fetch reviews', {
                status: response.status
            });
            return [];
        }

        const result: DirectusResponse<any> = await parseDirectusResponse(response);

        scopedLogger.debug('Reviews fetched successfully', {
            count: result.data?.length || 0
        });

        return result.data || [];
    } catch (error) {
        scopedLogger.error('Error fetching reviews', error);
        return [];
    }
}

/**
 * Search products
 */
export async function searchProducts(query: string, limit: number = 10) {
    try {
        scopedLogger.debug('Searching products', { query, limit });

        return getProducts({
            search: query,
            limit,
            offset: 0
        });
    } catch (error) {
        scopedLogger.error('Error searching products', error);
        return {
            data: [],
            meta: { total_count: 0, filter_count: 0 }
        };
    }
}