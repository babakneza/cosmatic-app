import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';
import { createDirectusClient, DirectusSchema, processDirectusImage, extractImageId, getAssetUrl } from './directus-config';
import { processProductGallery } from './gallery-utils';
import { directusClient, directusQuery } from './directus-legacy';

export { directusClient, directusQuery, processProductGallery };

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
 * Fetch all products using Directus SDK
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

function processProductImages(product: any, baseUrl: string): any {
    const processedProduct = { ...product };
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || process.env.DIRECTUS_API_TOKEN;

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

export async function getFeaturedProducts(limit: number = 8) {
    return getProducts({ limit, sort: '-created_at' });
}

export async function searchProducts(query: string, limit: number = 10) {
    return getProducts({ search: query, limit });
}

export async function getProductsByCategory(categorySlug: string, limit: number = 12, offset: number = 0) {
    return getProducts({ category: categorySlug, limit, offset });
}

export { processDirectusImage, extractImageId, getAssetUrl };
