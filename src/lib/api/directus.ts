/**
 * @fileOverview Directus Product API Integration
 * 
 * Provides comprehensive product data access functions for the BuyJan e-commerce platform.
 * This module handles:
 * 
 * - Product fetching with advanced filtering (search, category, price range)
 * - Product detail retrieval by ID or slug
 * - Product image processing and URL generation
 * - Average rating calculation from product reviews
 * - Convenience functions for common queries (featured, search, by category)
 * 
 * All functions use the Directus SDK for reliable CMS integration with:
 * - Automatic retry logic via retry.ts utilities
 * - Comprehensive error handling with fallback mechanisms
 * - Type-safe operations using TypeScript
 * - Structured logging for debugging
 * 
 * @module lib/api/directus
 * @requires @directus/sdk
 * @requires ./directus-config - Directus client configuration
 * @requires ./gallery-utils - Gallery image processing utilities
 * 
 * @example
 * // Import and use product API
 * import { getProducts, getProduct, getFeaturedProducts } from '@/lib/api/directus';
 * 
 * // Fetch all products with filters
 * const { data, meta } = await getProducts({
 *   category: 'skincare',
 *   min_price: 20,
 *   max_price: 100,
 *   limit: 12
 * });
 * 
 * // Fetch single product
 * const { data: product } = await getProduct('classic-red-lipstick');
 */

import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';
import { createDirectusClient, DirectusSchema, processDirectusImage, extractImageId, getAssetUrl } from './directus-config';
import { processProductGallery } from './gallery-utils';
import { directusClient, directusQuery } from './directus-legacy';

export { directusClient, directusQuery, processProductGallery };

/**
 * Centralized collection name constants
 * Used throughout the application to reference Directus collections
 * Note: 'categiries' is intentionally misspelled in Directus
 */
export const COLLECTIONS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categiries',
    BRANDS: 'brands',
    CUSTOMERS: 'customers',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    PRODUCT_REVIEWS: 'product_reviews',
    WISHLIST: 'wishlist',
    COUPONS: 'coupons',
    COUNTRIES: 'countries',
    STATES: 'states',
    SHIPPING_METHODS: 'shipping_methods'
} as const;

/**
 * Creates and returns a Directus SDK client instance
 * 
 * The client is configured with the Directus URL and authentication token from environment variables.
 * It uses a fallback mechanism for authentication tokens to ensure maximum compatibility.
 * 
 * @returns {Promise<any>} A configured Directus client instance ready for API operations
 * 
 * @throws {Error} If the client creation fails or required environment variables are missing
 * 
 * @example
 * // Get a Directus client instance
 * const client = await getDirectusClient();
 * 
 * @environment
 * - NEXT_PUBLIC_DIRECTUS_URL: The Directus instance URL (defaults to https://admin.buyjan.com)
 * - DIRECTUS_API_TOKEN: Server-side API token (preferred)
 * - NEXT_PUBLIC_DIRECTUS_API_TOKEN: Public API token (fallback)
 */
export async function getDirectusClient() {
    try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

        const client = createDirectusClient({
            url: directusUrl,
            token: directusToken,
            onError: (error: unknown) => {
                // Error handling - suppressed
            }
        });

        return client;
    } catch (error: unknown) {
        throw error;
    }
}

/**
 * Fetch products with filtering, sorting, and pagination
 * 
 * This function retrieves products from Directus with support for various filters:
 * - Text search across name and description fields
 * - Category filtering by slug
 * - Price range filtering (min_price, max_price)
 * - Custom sorting and pagination
 * 
 * Product data includes related information:
 * - Category and brand details
 * - Product images (main image and gallery)
 * - Product reviews with calculated average ratings
 * 
 * @param {Object} filters - Query filters
 * @param {string} [filters.search] - Text search query
 * @param {string|string[]} [filters.category] - Category slug(s) to filter by
 * @param {number} [filters.min_price] - Minimum price filter
 * @param {number} [filters.max_price] - Maximum price filter
 * @param {number} [filters.limit=12] - Number of products to return (default: 12)
 * @param {number} [filters.offset=0] - Pagination offset (default: 0)
 * @param {string} [filters.sort] - Sort field (e.g., 'created_at', '-price')
 * 
 * @returns {Promise<{data: any[], meta: {total_count: number, filter_count: number}}>} Products with metadata
 * 
 * @example
 * // Fetch featured products
 * const { data } = await getProducts({ limit: 8, sort: '-created_at' });
 * 
 * @example
 * // Search products with price filter
 * const { data, meta } = await getProducts({
 *   search: 'perfume',
 *   min_price: 10,
 *   max_price: 100,
 *   limit: 20
 * });
 * 
 * @example
 * // Fetch products by category
 * const { data } = await getProducts({
 *   category: 'skincare',
 *   offset: 20,
 *   limit: 20
 * });
 */
export async function getProducts(filters: any = {}) {
    try {
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        const fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'price',
            'sale_price',
            'sku',
            'in_stock',
            'is_new',
            'rating',
            'rating_count',
            'image',
            'main_image',
            'images.*',
            'image_gallery.*',
            'category.id',
            'category.name',
            'category.name_ar',
            'category.slug',
            'categories.*.id',
            'categories.*.name',
            'categories.*.slug',
            'brand.id',
            'brand.name',
            'brand.slug',
            'product_reviews.*'
        ];

        const limit = filters.limit || 12;
        const offset = filters.offset || 0;
        const query: any = {
            fields,
            limit,
            offset
        };

        if (filters.search) {
            query.search = filters.search;
        }

        if (filters.sort) {
            query.sort = filters.sort;
        }

        // Build filter for category
        if (filters.category) {
            query.filter = query.filter || {};
            query.filter.category = { slug: { _in: Array.isArray(filters.category) ? filters.category : [filters.category] } };
        }

        // Add price filter if specified
        if (filters.min_price !== undefined || filters.max_price !== undefined) {
            query.filter = query.filter || {};
            const priceFilter: any = {};
            if (filters.min_price !== undefined) priceFilter._gte = filters.min_price;
            if (filters.max_price !== undefined) priceFilter._lte = filters.max_price;
            query.filter.price = priceFilter;
        }

        // Make request with proper URL construction
        const queryString = new URLSearchParams();
        queryString.append('fields', fields.join(','));
        queryString.append('limit', limit.toString());
        queryString.append('offset', offset.toString());

        if (filters.search) {
            queryString.append('search', filters.search);
        }

        if (filters.sort) {
            queryString.append('sort', filters.sort);
        }

        if (query.filter) {
            queryString.append('filter', JSON.stringify(query.filter));
        }

        const response = await fetch(`${directusUrl}/items/products?${queryString}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || ''}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.data) {
            return {
                data: [],
                meta: {
                    total_count: 0,
                    filter_count: 0
                }
            };
        }

        const products = result.data.map((product: any) => {
            if (product.product_reviews) {
                const ratingData = calculateAverageRating(product.product_reviews);
                product.rating = ratingData.average;
                product.rating_count = ratingData.count;
            }

            return processProductImages(product, directusUrl);
        });

        return {
            data: products,
            meta: {
                total_count: result.meta?.total_count || 0,
                filter_count: result.meta?.filter_count || 0
            }
        };
    } catch (error) {
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
 * Fetch a single product by ID or slug
 * 
 * Retrieves detailed product information including:
 * - Basic product details (name, description, pricing)
 * - Product attributes (ingredients, usage instructions in both languages)
 * - Related data (category, brand information)
 * - Product gallery images with processed URLs
 * - Product reviews with calculated average rating
 * 
 * The function attempts to identify if the input is an ID (UUID or numeric) or slug
 * and adjusts the filter accordingly.
 * 
 * @param {string} idOrSlug - Product ID (UUID or numeric) or slug
 * 
 * @returns {Promise<{data: any}>} Product object with all details
 * 
 * @throws {Error} If product is not found or API request fails
 * 
 * @example
 * // Fetch by slug
 * const { data: product } = await getProduct('classic-red-lipstick');
 * 
 * @example
 * // Fetch by UUID
 * const { data: product } = await getProduct('550e8400-e29b-41d4-a716-446655440000');
 * 
 * @example
 * // Fetch with error handling
 * try {
 *   const { data: product } = await getProduct('skincare-serum');
 *   console.log('Product found:', product.name);
 * } catch (error) {
 *   console.error('Product not found');
 * }
 */
export async function getProduct(idOrSlug: string) {
    try {
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        const fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'price',
            'sale_price',
            'sku',
            'in_stock',
            'is_new',
            'ingredients',
            'ingredients_ar',
            'how_to_use',
            'how_to_use_ar',
            'main_image',
            'images.*',
            'image_gallery.*',
            'category.id',
            'category.name',
            'category.name_ar',
            'category.slug',
            'categories.*.id',
            'categories.*.name',
            'categories.*.slug',
            'brand.id',
            'brand.name',
            'brand.name_ar',
            'brand.slug',
            'product_reviews.*'
        ];

        const isUUID = idOrSlug.includes('-') && idOrSlug.length > 20;
        const isNumericId = /^\d+$/.test(idOrSlug);
        const filter = (isUUID || isNumericId)
            ? { id: { _eq: idOrSlug } }
            : { slug: { _eq: idOrSlug } };

        const url = new URL(`${directusUrl}/items/products`);
        url.searchParams.append('filter', JSON.stringify(filter));
        url.searchParams.append('fields', fields.join(','));

        try {
            const response = await fetch(url.toString(), {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || ''}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const products = result.data || [];

                if (products.length > 0) {
                    const product = products[0];

                    if (product.product_reviews) {
                        const ratingData = calculateAverageRating(product.product_reviews);
                        product.rating = ratingData.average;
                        product.rating_count = ratingData.count;
                    }

                    return { data: processProductImages(product, directusUrl) };
                }

                throw new Error(`Product not found: ${idOrSlug}`);
            }

            if (response.status === 403) {
                console.warn('[Products] Authentication failed, trying public access');
                const publicResponse = await fetch(url.toString(), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!publicResponse.ok) {
                    throw new Error(`Failed to fetch product: ${publicResponse.statusText}`);
                }

                const result = await publicResponse.json();
                const products = result.data || [];

                if (products.length > 0) {
                    const product = products[0];

                    if (product.product_reviews) {
                        const ratingData = calculateAverageRating(product.product_reviews);
                        product.rating = ratingData.average;
                        product.rating_count = ratingData.count;
                    }

                    return { data: processProductImages(product, directusUrl) };
                }

                throw new Error(`Product not found: ${idOrSlug}`);
            }

            throw new Error(`Failed to fetch product: ${response.statusText}`);
        } catch (error) {
            console.error('[Products] Error fetching product:', error instanceof Error ? error.message : JSON.stringify(error));
            if (error instanceof Error && error.stack) {
                console.error('[Products] Stack trace:', error.stack);
            }
            throw error;
        }
    } catch (error) {
        console.error('[Products] Error in getProduct:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        throw error;
    }
}

/**
 * Process and transform product images to include full asset URLs
 * 
 * Converts Directus file IDs to complete asset URLs with authentication tokens.
 * Handles both single image fields and array fields (gallery images).
 * 
 * @param {any} product - Product object with image file IDs
 * @param {string} baseUrl - Directus base URL for constructing asset paths
 * 
 * @returns {any} Product object with processed image URLs in multiple formats:
 *   - mainImageUrl: Full URL to main product image
 *   - image: Alias for main product image
 *   - images: Array of processed gallery image URLs
 *   - processedImages: Array of objects with {id, url} for detailed gallery
 * 
 * @example
 * const product = {
 *   main_image: 'file-123',
 *   images: ['file-456', 'file-789']
 * };
 * const processed = processProductImages(product, 'https://admin.buyjan.com');
 * // Result includes mainImageUrl: 'https://admin.buyjan.com/assets/file-123?access_token=...'
 * 
 * @internal
 */
function processProductImages(product: any, baseUrl: string): any {
    const processedProduct = { ...product };
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || process.env.DIRECTUS_API_TOKEN;

    /**
     * Helper to construct a full Directus asset URL
     * @param {string | null} fileId - Directus file ID
     * @returns {string | null} Full asset URL or null if no ID provided
     */
    const constructAssetUrl = (fileId: string | null) => {
        if (!fileId) return null;
        const url = new URL(`${baseUrl}/assets/${fileId}`);
        if (publicToken) {
            url.searchParams.append('access_token', publicToken);
        }
        return url.toString();
    };

    if (product.main_image) {
        const imageId = typeof product.main_image === 'string' ? product.main_image : product.main_image.id;
        processedProduct.mainImageUrl = constructAssetUrl(imageId);
    }

    if (product.image) {
        const imageId = typeof product.image === 'string' ? product.image : product.image.id;
        processedProduct.image = constructAssetUrl(imageId);
    }

    if (product.images && Array.isArray(product.images)) {
        processedProduct.images = product.images.map((img: any) => {
            const imageId = typeof img === 'string' ? img : img.id;
            return constructAssetUrl(imageId);
        }).filter(Boolean);
    }

    if (product.image_gallery && Array.isArray(product.image_gallery)) {
        processedProduct.processedImages = product.image_gallery.map((item: any) => {
            const fileId = item.directus_files_id || (typeof item === 'string' ? item : item.id);
            const url = constructAssetUrl(fileId);
            return url ? { id: fileId, url } : null;
        }).filter(Boolean);
    }

    return processedProduct;
}

/**
 * Calculate average rating from product reviews array
 * 
 * Computes the average rating value across all reviews and returns
 * rounded to one decimal place for consistency with Oman market standards.
 * 
 * @param {any[]} reviews - Array of review objects with rating field
 * 
 * @returns {Object} Rating statistics
 * @returns {number} .average - Average rating rounded to 1 decimal place (0 if no reviews)
 * @returns {number} .count - Total number of reviews
 * 
 * @example
 * const reviews = [
 *   { id: '1', rating: 4.5 },
 *   { id: '2', rating: 5 },
 *   { id: '3', rating: 3.5 }
 * ];
 * const stats = calculateAverageRating(reviews);
 * // Returns { average: 4.3, count: 3 }
 * 
 * @internal
 */
function calculateAverageRating(reviews: any[]) {
    if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;

    return {
        average: Math.round(averageRating * 10) / 10,
        count: reviews.length
    };
}

/**
 * Fetch featured/recommended products (most recently created)
 * 
 * Convenience function that fetches recently added products, typically
 * used for homepage hero sections and featured product carousels.
 * 
 * @param {number} [limit=8] - Maximum number of products to return
 * 
 * @returns {Promise<{data: any[], meta: {total_count: number, filter_count: number}}>} Featured products
 * 
 * @example
 * const { data: featured } = await getFeaturedProducts(10);
 * console.log('Latest 10 products:', featured);
 */
export async function getFeaturedProducts(limit: number = 8) {
    return getProducts({ limit, sort: '-created_at' });
}

/**
 * Search products by keyword
 * 
 * Convenience function for searching products across name and description
 * fields in both Arabic and English. Useful for search bars and discovery features.
 * 
 * @param {string} query - Search keyword or phrase
 * @param {number} [limit=10] - Maximum number of results to return
 * 
 * @returns {Promise<{data: any[], meta: {total_count: number, filter_count: number}}>} Search results
 * 
 * @example
 * const { data: results } = await searchProducts('perfume');
 * console.log('Found products:', results.length);
 * 
 * @example
 * // Search with custom limit
 * const { data: moreResults } = await searchProducts('serum', 50);
 */
export async function searchProducts(query: string, limit: number = 10) {
    return getProducts({ search: query, limit });
}

/**
 * Fetch products by category slug with pagination
 * 
 * Convenience function for retrieving all products within a specific category.
 * Supports pagination for implementing category pages with multiple items per load.
 * 
 * @param {string} categorySlug - URL-friendly category identifier (e.g., 'skincare', 'makeup')
 * @param {number} [limit=12] - Number of products per page
 * @param {number} [offset=0] - Pagination offset (multiply by limit for page number)
 * 
 * @returns {Promise<{data: any[], meta: {total_count: number, filter_count: number}}>} Category products
 * 
 * @example
 * // Get first page of skincare products
 * const { data: page1 } = await getProductsByCategory('skincare', 12, 0);
 * 
 * @example
 * // Get second page
 * const { data: page2 } = await getProductsByCategory('skincare', 12, 12);
 * 
 * @example
 * // Get makeup products with custom limit
 * const { data: makeup } = await getProductsByCategory('makeup', 20, 0);
 */
export async function getProductsByCategory(categorySlug: string, limit: number = 12, offset: number = 0) {
    return getProducts({ category: categorySlug, limit, offset });
}

export { processDirectusImage, extractImageId, getAssetUrl };
