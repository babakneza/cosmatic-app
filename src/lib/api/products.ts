import { getDirectusClient } from './directus';
import { readItems, readItem } from '@directus/sdk';
import { processDirectusImage } from './directus-config';
import { Product, ProductFilters, SortOption, Pagination, ReviewStats, ProductReview } from '@/types';

/**
 * Fetch review statistics for a product
 */
async function getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
        const client = await getDirectusClient();
        const reviews = await (client as any).request((readItems as any)('product_reviews', {
            filter: { product: { _eq: productId } },
            fields: ['id', 'rating']
        }));

        if (!reviews || reviews.length === 0) {
            return { average_rating: 0, review_count: 0 };
        }

        const totalRating = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
        const averageRating = totalRating / reviews.length;

        return {
            average_rating: Math.round(averageRating * 10) / 10,
            review_count: reviews.length
        };
    } catch (error) {
        console.warn('[Products] Error fetching review stats for product', productId, ':', error instanceof Error ? error.message : String(error));
        return { average_rating: 0, review_count: 0 };
    }
}

/**
 * Fetch reviews for a product
 */
async function getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
        const client = await getDirectusClient();
        const reviews = await (client as any).request((readItems as any)('product_reviews', {
            filter: { product: { _eq: productId } },
            fields: ['id', 'rating', 'title', 'comment', 'is_helpful', 'customer'],
            sort: ['-rating']
        })) as ProductReview[];

        return reviews || [];
    } catch (error) {
        console.warn('[Products] Error fetching reviews for product', productId, ':', error instanceof Error ? error.message : String(error));
        return [];
    }
}

/**
 * Fetch review statistics for multiple products
 */
async function getMultipleProductsReviewStats(productIds: string[]): Promise<Record<string, ReviewStats>> {
    const stats: Record<string, ReviewStats> = {};

    for (const productId of productIds) {
        stats[productId] = await getProductReviewStats(productId);
    }

    return stats;
}

/**
 * Fetch products with filters and pagination using Directus SDK
 */
export async function getProducts(
    filters?: ProductFilters,
    sort?: SortOption,
    pagination?: Pagination
) {
    try {
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        const options: Record<string, any> = {
            fields: [
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
                'main_image',
                'images.*',
                'category.id',
                'category.name',
                'category.name_ar',
                'category.slug',
                'brand.id',
                'brand.name',
                'brand.name_ar',
                'brand.slug',
            ],
        };

        // Apply filters
        if (filters) {
            const filterObj: Record<string, any> = {};

            if (filters.category) {
                filterObj['category.slug'] = { _eq: filters.category };
            }

            if (filters.brand) {
                filterObj['brand.slug'] = { _eq: filters.brand };
            }

            if (filters.min_price !== undefined) {
                filterObj.price = { _gte: filters.min_price };
            }

            if (filters.max_price !== undefined) {
                filterObj.price = { ...filterObj.price, _lte: filters.max_price };
            }

            if (filters.in_stock !== undefined) {
                if (filters.in_stock === true) {
                    filterObj._or = [
                        { in_stock: { _eq: true } },
                        { in_stock: { _gt: 0 } }
                    ];
                } else {
                    filterObj._or = [
                        { in_stock: { _eq: false } },
                        { in_stock: { _eq: 0 } },
                        { in_stock: { _null: true } }
                    ];
                }
            }

            if (filters.search) {
                filterObj._or = [
                    { name: { _contains: filters.search } },
                    { name_ar: { _contains: filters.search } },
                    { description: { _contains: filters.search } },
                    { description_ar: { _contains: filters.search } },
                ];
            }

            if (Object.keys(filterObj).length > 0) {
                options.filter = filterObj;
            }
        }

        // Apply sorting
        if (sort) {
            switch (sort) {
                case 'newest':
                    // Sorting by newest unavailable (date_created permission not available)
                    // Defaulting to price high to low
                    options.sort = ['-price'];
                    break;
                case 'price_low_high':
                    options.sort = ['price'];
                    break;
                case 'price_high_low':
                    options.sort = ['-price'];
                    break;
                case 'name_a_z':
                    options.sort = ['name'];
                    break;
                case 'name_z_a':
                    options.sort = ['-name'];
                    break;
                case 'rating':
                    // Rating sort will be handled client-side after fetching review stats
                    // Default to name A-Z for server-side
                    options.sort = ['name'];
                    break;
            }
        }

        // Apply pagination
        if (pagination) {
            options.limit = pagination.limit;
            options.offset = (pagination.page - 1) * pagination.limit;
        }

        console.log('[Products] Fetching products from Directus with options:', JSON.stringify(options, null, 2));

        const response = await (client as any).request((readItems as any)('products', options));

        console.log('[Products] Received', response?.length || 0, 'products from Directus');

        // Process images for all products
        const processedProducts = (response || []).map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            return {
                ...product,
                mainImageUrl,
                image: mainImageUrl
            };
        });

        return {
            data: processedProducts,
            meta: {
                total_count: processedProducts.length,
                filter_count: processedProducts.length
            }
        };
    } catch (error) {
        console.error('[Products] Error fetching products:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
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
 * Fetch single product by ID or slug using Directus SDK
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
            'ingredients',
            'ingredients_ar',
            'how_to_use',
            'how_to_use_ar',
            'main_image',
            'images.*',
            'category.id',
            'category.name',
            'category.name_ar',
            'category.slug',
            'brand.id',
            'brand.name',
            'brand.name_ar',
            'brand.slug',
            'brand.logo',
        ];

        console.log('[Products] Fetching product:', idOrSlug);

        // Try by ID first
        try {
            const product = await (client as any).request((readItem as any)('products', idOrSlug, { fields }));
            console.log('[Products] Found product by ID:', product?.id);

            // Process image
            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    product.mainImageUrl = processedImage.url;
                }
            } else {
                product.mainImageUrl = '/images/placeholder-product.jpg';
            }
            product.image = product.mainImageUrl;

            // Fetch review stats and list
            const reviewStats = await getProductReviewStats(product.id);
            const reviews = await getProductReviews(product.id);
            product.reviewStats = reviewStats;
            product.reviews = reviews;

            return { data: product };
        } catch (idError) {
            console.log('[Products] Could not find by ID, trying by slug:', idOrSlug);

            // Try by slug
            const products = await (client as any).request((readItems as any)('products', {
                filter: { slug: { _eq: idOrSlug } },
                fields,
                limit: 1
            }));

            if (products && products.length > 0) {
                const product = products[0];
                console.log('[Products] Found product by slug:', product?.id);

                // Process image
                if (product.main_image) {
                    const processedImage = processDirectusImage(directusUrl, product.main_image);
                    if (processedImage) {
                        product.mainImageUrl = processedImage.url;
                    }
                } else {
                    product.mainImageUrl = '/images/placeholder-product.jpg';
                }
                product.image = product.mainImageUrl;

                // Fetch review stats and list
                const reviewStats = await getProductReviewStats(product.id);
                const reviews = await getProductReviews(product.id);
                product.reviewStats = reviewStats;
                product.reviews = reviews;

                return { data: product };
            }

            throw new Error(`Product not found: ${idOrSlug}`);
        }
    } catch (error) {
        console.error('[Products] Error fetching product:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        throw error;
    }
}

/**
 * Fetch featured products using Directus SDK
 */
export async function getFeaturedProducts(limit: number = 8) {
    try {
        console.log('[Products] Fetching featured products');
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        const response = await (client as any).request((readItems as any)('products', {
            limit,
            filter: {
                is_featured: { _eq: true }
            },
            fields: [
                'id',
                'name',
                'name_ar',
                'slug',
                'description',
                'description_ar',
                'price',
                'sale_price',
                'main_image',
                'category.id',
                'category.name',
                'category.slug',
                'brand.id',
                'brand.name',
                'brand.slug',
                'image_gallery',
                'in_stock',
                'is_featured'
            ]
        }));

        console.log('[Products] Featured products received:', response?.length || 0);

        // Process images for consistency with API routes
        const processedProducts = (response || []).map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            return {
                ...product,
                mainImageUrl,
                image: mainImageUrl
            };
        });

        return processedProducts;
    } catch (error) {
        console.error('[Products] Error fetching featured products:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        return [];
    }
}

/**
 * Fetch new arrivals using Directus SDK
 */
export async function getNewArrivals(limit: number = 8) {
    try {
        console.log('[Products] Fetching new arrivals');
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const today = new Date().toISOString();

        const fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'price',
            'sale_price',
            'main_image',
            'category.id',
            'category.name',
            'category.slug',
            'brand.id',
            'brand.name',
            'brand.slug',
            'image_gallery',
            'is_new_arrival',
            'new_until'
        ];

        // Try to find new arrivals by is_new_arrival flag or new_until date
        let response = await (client as any).request((readItems as any)('products', {
            limit,
            filter: {
                _or: [
                    { is_new_arrival: { _eq: true } },
                    { new_until: { _gte: today } }
                ]
            },
            fields
        }));

        let products = response;

        // If no products found, fall back to all products (no restricted sort fields available)
        if (!products || products.length === 0) {
            console.log('[Products] No new arrivals found by flag, falling back to all products');
            products = await (client as any).request((readItems as any)('products', {
                limit,
                fields
            }));
        }

        console.log('[Products] New arrivals received:', products?.length || 0);

        // Process images
        const processedProducts = (products || []).map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            return {
                ...product,
                mainImageUrl,
                image: mainImageUrl
            };
        });

        return processedProducts;
    } catch (error) {
        console.error('[Products] Error fetching new arrivals:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        return [];
    }
}

/**
 * Fetch best sellers using Directus SDK (sorted by review rating and count)
 */
export async function getBestSellers(limit: number = 8) {
    try {
        console.log('[Products] Fetching best sellers');
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        // Fetch more products than needed to ensure we have enough after filtering by reviews
        const fetchLimit = Math.max(limit * 2, 20);

        // Fetch products
        const response = await (client as any).request((readItems as any)('products', {
            limit: fetchLimit,
            fields: [
                'id',
                'name',
                'name_ar',
                'slug',
                'description',
                'description_ar',
                'price',
                'sale_price',
                'main_image',
                'category.id',
                'category.name',
                'category.slug',
                'brand.id',
                'brand.name',
                'brand.slug',
                'image_gallery',
                'in_stock'
            ]
        }));

        console.log('[Products] Best sellers candidates received:', response?.length || 0);

        // Fetch review stats for all products
        const reviewStats = await getMultipleProductsReviewStats((response || []).map((p: any) => p.id));

        // Sort by average rating (primary) and review count (secondary)
        const sortedProducts = (response || []).sort((a: any, b: any) => {
            const statsA = reviewStats[a.id] || { average_rating: 0, review_count: 0 };
            const statsB = reviewStats[b.id] || { average_rating: 0, review_count: 0 };

            // Primary sort: average rating (descending)
            if (statsA.average_rating !== statsB.average_rating) {
                return statsB.average_rating - statsA.average_rating;
            }

            // Secondary sort: review count (descending)
            return statsB.review_count - statsA.review_count;
        }).slice(0, limit);

        console.log('[Products] Best sellers after sorting by reviews:', sortedProducts?.length || 0);

        // Process images and attach review stats
        const processedProducts = (sortedProducts || []).map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            return {
                ...product,
                mainImageUrl,
                image: mainImageUrl,
                reviewStats: reviewStats[product.id]
            };
        });

        return processedProducts;
    } catch (error) {
        console.error('[Products] Error fetching best sellers:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        return [];
    }
}

/**
 * Fetch related products using Directus SDK (sorted by review rating)
 */
export async function getRelatedProducts(productId: string, limit: number = 4) {
    try {
        const product = await getProduct(productId);

        if (!product.data) {
            return { data: [] };
        }

        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        // Fetch more products to ensure we have enough after filtering
        const fetchLimit = Math.max(limit * 3, 12);

        const response = await (client as any).request((readItems as any)('products', {
            fields: [
                'id',
                'name',
                'name_ar',
                'slug',
                'price',
                'sale_price',
                'currency',
                'main_image',
                'images.*',
                'in_stock',
            ],
            filter: {
                id: { _neq: productId },
                _or: [
                    { in_stock: { _eq: true } },
                    { in_stock: { _gt: 0 } }
                ]
            },
            limit: fetchLimit,
        }));

        // Fetch review stats for all products
        const reviewStats = await getMultipleProductsReviewStats((response || []).map((p: any) => p.id));

        // Sort by average rating (descending)
        const sortedProducts = (response || []).sort((a: any, b: any) => {
            const statsA = reviewStats[a.id] || { average_rating: 0, review_count: 0 };
            const statsB = reviewStats[b.id] || { average_rating: 0, review_count: 0 };

            // Primary sort: average rating (descending)
            if (statsA.average_rating !== statsB.average_rating) {
                return statsB.average_rating - statsA.average_rating;
            }

            // Secondary sort: review count (descending)
            return statsB.review_count - statsA.review_count;
        }).slice(0, limit);

        // Process images and attach review stats
        const processedProducts = (sortedProducts || []).map((prod: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (prod.main_image) {
                const processedImage = processDirectusImage(directusUrl, prod.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            return {
                ...prod,
                mainImageUrl,
                image: mainImageUrl,
                reviewStats: reviewStats[prod.id]
            };
        });

        return { data: processedProducts };
    } catch (error) {
        console.error('[Products] Error fetching related products:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        return { data: [] };
    }
}

/**
 * Search products using Directus SDK
 */
export async function searchProducts(query: string, limit: number = 10) {
    try {
        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        const response = await (client as any).request((readItems as any)('products', {
            fields: [
                'id',
                'name',
                'name_ar',
                'slug',
                'price',
                'sale_price',
                'currency',
                'main_image',
                'images.*',
            ],
            filter: {
                _and: [
                    {
                        _or: [
                            { name: { _contains: query } },
                            { name_ar: { _contains: query } },
                            { description: { _contains: query } },
                            { description_ar: { _contains: query } },
                        ]
                    },
                    {
                        _or: [
                            { in_stock: { _eq: true } },
                            { in_stock: { _gt: 0 } }
                        ]
                    }
                ]
            },
            limit,
        }));

        // Process images
        const processedProducts = (response || []).map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            return {
                ...product,
                mainImageUrl,
                image: mainImageUrl
            };
        });

        return { data: processedProducts };
    } catch (error) {
        console.error('[Products] Error searching products:', error instanceof Error ? error.message : JSON.stringify(error));
        if (error instanceof Error && error.stack) {
            console.error('[Products] Stack trace:', error.stack);
        }
        return { data: [] };
    }
}
