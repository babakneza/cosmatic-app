import { getDirectusClient } from './directus';
import { readItems, readItem } from '@directus/sdk';
import { processDirectusImage } from './directus-config';
import { calculateAverageRating } from '@/lib/utils';
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
                'image_gallery.*',
                'category.id',
                'category.name',
                'category.name_ar',
                'category.slug',
                'brand.id',
                'brand.name',
                'brand.name_ar',
                'brand.slug',
                // Include reviews to calculate ratings
                'product_reviews.id',
                'product_reviews.rating',
                'product_reviews.status',
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

        // Debug: Log raw product data to see what we're getting
        if (response && response.length > 0) {
            console.log('[Products] First product raw data:', JSON.stringify({
                id: response[0].id,
                name: response[0].name,
                images: response[0].images,
                main_image: response[0].main_image,
            }, null, 2));
        }

        // Process images for all products and calculate ratings
        const processedProducts = (response || []).map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';

            if (product.main_image) {
                const processedImage = processDirectusImage(directusUrl, product.main_image);
                if (processedImage) {
                    mainImageUrl = processedImage.url;
                }
            }

            // Process images array and image_gallery - combine into single array with main_image first
            let processedImages: any[] = [];
            
            // Start with main_image
            if (mainImageUrl && mainImageUrl !== '/images/placeholder-product.jpg') {
                processedImages.push({
                    id: 'main_image',
                    url: mainImageUrl
                });
            }
            
            // Add image_gallery images
            if (product.image_gallery && Array.isArray(product.image_gallery) && product.image_gallery.length > 0) {
                console.log('[Products] (getProducts) Processing', product.image_gallery.length, 'gallery images for product', product.id);
                const galleryImages = product.image_gallery
                    .map((img: any) => {
                        const processed = processDirectusImage(directusUrl, img);
                        return processed ? { id: processed.id, url: processed.url } : null;
                    })
                    .filter((img: any) => img !== null);
                processedImages.push(...galleryImages);
                console.log('[Products] (getProducts) Processed', galleryImages.length, 'gallery images successfully');
            }
            
            // Fallback to legacy images field if no image_gallery
            if (processedImages.length === 0 && product.images && Array.isArray(product.images) && product.images.length > 0) {
                console.log('[Products] (getProducts) Processing', product.images.length, 'legacy images for product', product.id);
                processedImages = product.images
                    .map((img: any) => {
                        const processed = processDirectusImage(directusUrl, img);
                        return processed ? { id: processed.id, url: processed.url } : null;
                    })
                    .filter((img: any) => img !== null);
                console.log('[Products] (getProducts) Processed', processedImages.length, 'legacy images successfully');
            }
            
            if (processedImages.length === 0) {
                console.log('[Products] (getProducts) No images to process for product', product.id);
            }

            // Calculate average rating from product_reviews
            const ratingData = calculateAverageRating(product.product_reviews);

            return {
                ...product,
                mainImageUrl,
                image: mainImageUrl,
                processedImages: processedImages.length > 0 ? processedImages : undefined,
                // Ensure images array is in the correct format
                images: processedImages.length > 0 ? processedImages : product.images || [],
                rating: ratingData.average,
                rating_count: ratingData.count,
            };
        });

        // Fetch review stats for products that don't have ratings
        // This provides a fallback if rating/rating_count fields aren't populated in Directus
        const productsNeedingRatings = processedProducts.filter(
            (p: any) => !p.rating && !p.rating_count
        );

        if (productsNeedingRatings.length > 0 && productsNeedingRatings.length <= 20) {
            // Only fetch review stats if there's a reasonable number of products
            console.log('[Products] Fetching review stats for', productsNeedingRatings.length, 'products');
            const reviewStats = await getMultipleProductsReviewStats(
                productsNeedingRatings.map((p: any) => p.id)
            );

            // Merge review stats back into products
            processedProducts.forEach((product: any) => {
                if (reviewStats[product.id]) {
                    product.rating = reviewStats[product.id].average_rating;
                    product.rating_count = reviewStats[product.id].review_count;
                }
            });
        }

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
            'image_gallery.*',
            'category.id',
            'category.name',
            'category.name_ar',
            'category.slug',
            'brand.id',
            'brand.name',
            'brand.name_ar',
            'brand.slug',
            'brand.logo',
            // Include reviews to calculate ratings
            'product_reviews.id',
            'product_reviews.rating',
            'product_reviews.status',
        ];

        console.log('[Products] Fetching product:', idOrSlug);

        // Determine if it's a UUID or numeric ID
        const isUUID = idOrSlug.includes('-') && idOrSlug.length > 20;
        const isNumericId = /^\d+$/.test(idOrSlug);

        let product = null;

        // Try by ID first (if it looks like an ID)
        if (isUUID || isNumericId) {
            try {
                product = await (client as any).request((readItem as any)('products', idOrSlug, { fields }));
                console.log('[Products] Found product by ID:', product?.id);
            } catch (idError) {
                console.log('[Products] Could not find by ID, trying by slug:', idOrSlug);
            }
        }

        // If not found by ID, try by slug
        if (!product) {
            console.log('[Products] Trying to fetch product by slug:', idOrSlug);
            const products = await (client as any).request((readItems as any)('products', {
                filter: { slug: { _eq: idOrSlug } },
                fields,
                limit: 1
            }));

            if (products && products.length > 0) {
                product = products[0];
                console.log('[Products] Found product by slug:', product?.id);
            } else {
                throw new Error(`Product not found: ${idOrSlug}`);
            }
        }

        if (!product) {
            throw new Error(`Product not found: ${idOrSlug}`);
        }

        console.log('[Products] Product raw data:', JSON.stringify({
            id: product.id,
            name: product.name,
            images: product.images,
            main_image: product.main_image,
        }, null, 2));

        // Process main image
        let mainImageUrl = '/images/placeholder-product.jpg';
        if (product.main_image) {
            const processedImage = processDirectusImage(directusUrl, product.main_image);
            if (processedImage) {
                mainImageUrl = processedImage.url;
            }
        }
        product.mainImageUrl = mainImageUrl;
        product.image = mainImageUrl;

        // Process images array and image_gallery - combine into single array with main_image first
        let processedImages: any[] = [];
        
        // Start with main_image
        if (mainImageUrl && mainImageUrl !== '/images/placeholder-product.jpg') {
            processedImages.push({
                id: 'main_image',
                url: mainImageUrl
            });
        }
        
        // Add image_gallery images
        if (product.image_gallery && Array.isArray(product.image_gallery) && product.image_gallery.length > 0) {
            console.log('[Products] Processing', product.image_gallery.length, 'gallery images for product', product.id);
            const galleryImages = product.image_gallery
                .map((img: any) => {
                    const processed = processDirectusImage(directusUrl, img);
                    return processed ? { id: processed.id, url: processed.url } : null;
                })
                .filter((img: any) => img !== null);
            processedImages.push(...galleryImages);
            console.log('[Products] Processed', galleryImages.length, 'gallery images successfully');
        }
        
        // Fallback to legacy images field if no image_gallery
        if (processedImages.length === 0 && product.images && Array.isArray(product.images) && product.images.length > 0) {
            console.log('[Products] Processing', product.images.length, 'legacy images for product', product.id);
            processedImages = product.images
                .map((img: any) => {
                    const processed = processDirectusImage(directusUrl, img);
                    return processed ? { id: processed.id, url: processed.url } : null;
                })
                .filter((img: any) => img !== null);
            console.log('[Products] Processed', processedImages.length, 'legacy images successfully');
        }
        
        if (processedImages.length === 0) {
            console.log('[Products] No images to process for product', product.id);
        }
        
        product.processedImages = processedImages.length > 0 ? processedImages : undefined;
        product.images = processedImages.length > 0 ? processedImages : product.images || [];

        // Calculate rating from product_reviews and fetch full review list
        const ratingData = calculateAverageRating(product.product_reviews);
        product.rating = ratingData.average;
        product.rating_count = ratingData.count;

        const reviews = await getProductReviews(product.id);
        product.reviews = reviews;

        return { data: product };
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
