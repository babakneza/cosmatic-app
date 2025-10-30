import { createDirectus, rest, readItems, readItem, staticToken } from '@directus/sdk';
import { createDirectusClient, DirectusSchema, processDirectusImage, extractImageId, getAssetUrl } from './directus-config';
import { processProductGallery } from './gallery-utils';
// Import legacy client for backward compatibility
import { directusClient, directusQuery } from './directus-legacy';

// Export legacy client for backward compatibility
export { directusClient, directusQuery, processProductGallery };

/**
 * Directus SDK Client
 * 
 * This function creates and returns an authenticated Directus SDK client
 * compatible with Directus SDK v20.1.0.
 */
export async function getDirectusClient() {
    try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

        console.log('[Directus] Creating client with URL:', directusUrl);
        console.log('[Directus] Token available:', Boolean(directusToken));

        // Create the client with proper error handling
        const client = createDirectusClient({
            url: directusUrl,
            token: directusToken,
            onError: (error: any) => {
                console.error('[Directus] API Error:', error);
                // Log detailed error information for debugging
                if (error.errors && Array.isArray(error.errors)) {
                    error.errors.forEach((err: any, index: number) => {
                        console.error(`[Directus] Error ${index + 1}:`, err);
                    });
                }
            }
        });

        // Verify the client works
        try {
            const testResult = await (client as any).request((readItems as any)('products', { limit: 1, fields: ['id'] }));
            console.log('[Directus] Authentication successful, found', testResult.length, 'products');
            return client;
        } catch (error: any) {
            console.warn('[Directus] Primary authentication method failed, trying fallback method');

            // Check if it's a 403 error (Forbidden)
            if (error?.response?.status === 403) {
                console.warn('[Directus] Authentication failed with 403 Forbidden - token may be expired');
            }

            // Try fallback with access_token parameter
            try {
                const fallbackClient = createDirectus<DirectusSchema>(directusUrl)
                    .with(rest()) as any;

                const fallbackResult = await (fallbackClient as any).request((readItems as any)('products', { limit: 1, fields: ['id'] }));
                console.log('[Directus] Fallback authentication successful, found', fallbackResult.length, 'products');
                return fallbackClient;
            } catch (fallbackError: any) {
                console.error('[Directus] All authentication methods failed');
                console.error('[Directus] Last error:', fallbackError);

                // Fall back to unauthenticated client as last resort
                console.log('[Directus] Falling back to unauthenticated client');
                const publicClient = createDirectus<DirectusSchema>(directusUrl).with(rest());

                // Test the public client
                try {
                    const publicResult = await (publicClient as any).request((readItems as any)('products', { limit: 1, fields: ['id'] }));
                    console.log('[Directus] Public access successful, found', publicResult.length, 'products');
                } catch (publicError: any) {
                    console.error('[Directus] Even public access failed:', publicError);
                }

                return publicClient;
            }
        }
    } catch (error: any) {
        console.error('[Directus] Error creating client:', error);
        throw error;
    }
}

/**
 * Get a product by slug
 * 
 * This function fetches a product by slug using the Directus SDK.
 */
export async function getProductBySlug(slug: string, locale: string = 'en') {
    try {
        console.log(`[Directus] Fetching product with slug: ${slug}, locale: ${locale}`);

        const directus = await getDirectusClient();
        if (!directus) {
            throw new Error('Failed to initialize Directus client');
        }

        const products = await (directus as any).request(
            (readItems as any)('products', {
                filter: {
                    slug: { _eq: slug }
                    // Removed status filter due to permission issues
                },
                fields: [
                    'id',
                    'name',
                    // 'name_ar', // Removed due to permission issues
                    'slug',
                    'description',
                    // 'description_ar', // Removed due to permission issues
                    'price',
                    'sale_price',
                    'sku',
                    // 'in_stock', // Removed due to permission issues
                    // 'status', // Removed due to permission issues
                    // 'rating', // Removed due to permission issues
                    // 'reviews_count', // Removed due to permission issues
                    'main_image.*',
                    'brand.id',
                    'brand.name',
                    // 'brand.name_ar', // Removed due to permission issues
                    'category.id',
                    'category.name',
                    // 'category.name_ar', // Removed due to permission issues
                    'images.id',
                    'images.directus_files_id',
                    'images.is_primary',
                    'ingredients',
                    // 'ingredients_ar', // Removed due to permission issues
                    'how_to_use0',
                    // 'how_to_use_ar', // Removed due to permission issues
                    'is_new_arrival',
                    'new_until',
                    'cost_price',
                    'excerpt',
                    // 'stock', // Removed due to permission issues
                    'image_gallery.*'
                ],
                limit: 1
            } as any)
        );

        if (!products || products.length === 0) {
            console.log(`[Directus] No product found with slug: ${slug}`);
            return null;
        }

        // Process the product data
        const product = products[0];
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

        console.log('[Directus] Raw product data:', JSON.stringify(product, null, 2));

        // Log specific fields for debugging
        console.log('[Directus] Product fields check:', {
            id: product.id ? 'Present' : 'Missing',
            name: product.name ? 'Present' : 'Missing',
            price: product.price ? 'Present' : 'Missing',
            main_image: product.main_image ? 'Present' : 'Missing',
            main_image_type: product.main_image ? typeof product.main_image : 'N/A',
            images: product.images ? `Array with ${product.images.length} items` : 'Missing',
            categories: product.categories ? `Array with ${product.categories.length} items` : 'Missing',
            brand: product.brand ? 'Present' : 'Missing'
        });

        // Process main image
        let mainImageUrl = '/images/placeholder-product.jpg';
        if (product.main_image) {
            console.log('[Directus] Processing main image:', JSON.stringify(product.main_image));

            // Use the extractImageId function to get the UUID
            const mainImageId = extractImageId(product.main_image);
            console.log('[Directus] Extracted main image ID:', mainImageId);

            if (mainImageId) {
                // Validate that it looks like a UUID (contains hyphens)
                if (mainImageId.includes('-')) {
                    // Add access token for authentication
                    const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;
                    mainImageUrl = directusToken
                        ? `${directusUrl}/assets/${mainImageId}?access_token=${directusToken}`
                        : `${directusUrl}/assets/${mainImageId}`;

                    console.log('[Directus] Main image URL with access token generated');
                } else {
                    console.error('[Directus] Invalid main image ID format - not a UUID:', mainImageId);
                }
            } else {
                console.log('[Directus] Could not extract main image ID from:', JSON.stringify(product.main_image));
            }
        }

        // Process gallery images using the dedicated gallery utility
        // This will extract the UUID strings from image_gallery and create proper asset URLs
        const processedImages = processProductGallery(product, directusUrl);

        // If no images were found in image_gallery, try the images field as fallback
        if (processedImages.length === 0 && product.images) {
            console.log('[Directus] No images in image_gallery, trying images field');
            console.log('[Directus] Images type:', typeof product.images);
            console.log('[Directus] Is array:', Array.isArray(product.images));
            console.log('[Directus] Raw images:', product.images);

            // Special case: if images is an object with a data property that's an array
            let imagesArray;

            if (typeof product.images === 'object' &&
                product.images.data &&
                Array.isArray(product.images.data)) {
                console.log('[Directus] Found images.data array');
                imagesArray = product.images.data;
            } else if (Array.isArray(product.images)) {
                imagesArray = product.images;
            } else {
                // Convert to array if it's not already
                imagesArray = [product.images];
            }

            console.log('[Directus] Processing images, count:', imagesArray.length);
            console.log('[Directus] Images data:', JSON.stringify(imagesArray));

            for (const image of imagesArray) {
                console.log('[Directus] Processing image:', JSON.stringify(image));

                // Special case: if the item has a directus_files property
                let imageToProcess = image;
                if (image && typeof image === 'object' && image.directus_files) {
                    console.log('[Directus] Found directus_files in image');
                    imageToProcess = image.directus_files;
                }

                // Use the extractImageId function to get the ID
                const imageId = extractImageId(imageToProcess);
                console.log('[Directus] Extracted image ID:', imageId);

                if (imageId) {
                    // Make sure imageId is a string
                    const imageIdStr = typeof imageId === 'string' ? imageId : String(imageId);
                    let imageUrl = getAssetUrl(directusUrl, imageIdStr);

                    // Add token if available
                    if (imageUrl && directusToken) {
                        imageUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}access_token=${directusToken}`;
                    }

                    if (imageUrl) {
                        console.log('[Directus] Processed image URL:', imageUrl);

                        processedImages.push({
                            id: String(imageId),
                            url: imageUrl
                        });
                    } else {
                        console.log('[Directus] Failed to generate URL for image ID:', imageId);
                    }
                } else {
                    console.log('[Directus] Could not extract image ID from:', JSON.stringify(imageToProcess));
                }
            }
        }

        // If no processed images were found, try to use the main image
        if (processedImages.length === 0 && mainImageUrl !== '/images/placeholder-product.jpg') {
            console.log('[Directus] No additional images found, using main image as fallback');
            processedImages.push({
                id: 'main',
                url: mainImageUrl
            });
        }

        // Always include the main image in the processed images if it's not already there
        // This ensures we always have at least one image
        if (mainImageUrl !== '/images/placeholder-product.jpg') {
            const mainImageExists = processedImages.some(img => img.url === mainImageUrl);

            if (!mainImageExists) {
                console.log('[Directus] Adding main image to processed images');
                processedImages.unshift({
                    id: 'main',
                    url: mainImageUrl
                });
            }
        }

        // Process category
        let processedCategory = null;

        // Handle category as a numeric ID or as an object
        if (product.category) {
            console.log('[Directus] Processing category:', product.category);

            if (typeof product.category === 'number' || typeof product.category === 'string') {
                // If category is just an ID, create a minimal category object
                processedCategory = {
                    id: String(product.category),
                    name: `Category ${product.category}`,
                    slug: `category-${product.category}`
                };
                console.log('[Directus] Created minimal category from ID:', processedCategory);
            } else if (typeof product.category === 'object') {
                // If it's already an object, use it
                processedCategory = {
                    id: String(product.category.id || ''),
                    name: product.category.name || '',
                    slug: product.category.slug || ''
                };
                console.log('[Directus] Using existing category object:', processedCategory);
            }
        }

        // Create a properly structured product object that matches the Product type
        const processedProduct = {
            // Basic product information
            id: product.id || '',
            name: product.name || '',
            name_ar: product.name_ar || product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            description_ar: product.description_ar || product.description || '',

            // Price information
            price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
            sale_price: product.sale_price ? (typeof product.sale_price === 'number' ? product.sale_price : parseFloat(product.sale_price)) : undefined,
            currency: 'OMR',

            // Stock information
            sku: product.sku || '',
            stock: product.stock || 0,
            in_stock: product.in_stock !== undefined ? product.in_stock : true,

            // Status and metadata
            status: product.status || 'published',
            rating: product.rating || 0,
            reviews_count: product.reviews_count || 0,
            created_at: product.created_at || new Date().toISOString(),
            updated_at: product.updated_at || new Date().toISOString(),

            // Images - set both mainImageUrl and image for consistency
            mainImageUrl: mainImageUrl,
            image: mainImageUrl,  // Also set 'image' field for Product type compatibility
            processedImages: processedImages,
            images: processedImages.length > 0 ? processedImages : (product.images || []),

            // Original image fields for reference
            main_image: product.main_image || null,
            image_gallery: product.image_gallery || [],

            // Relations
            brand: product.brand || null,
            category: processedCategory,

            // Additional product fields
            ingredients: product.ingredients || '',
            ingredients_ar: product.ingredients_ar || product.ingredients || '',
            how_to_use: product.how_to_use || '',
            how_to_use0: product.how_to_use0 || '',
            how_to_use_ar: product.how_to_use_ar || '',
            is_new_arrival: product.is_new_arrival || false,
            new_until: product.new_until || null,
            cost_price: product.cost_price || null,
            excerpt: product.excerpt || null,

            // Additional fields from the original product
            ...product
        };

        // Log the final processed product
        console.log('[Directus] Final processed product structure:', {
            id: processedProduct.id,
            name: processedProduct.name,
            price: processedProduct.price,
            mainImageUrl: processedProduct.mainImageUrl ? 'Present' : 'Missing',
            images: processedProduct.images.length,
            processedImages: processedProduct.processedImages.length,
            category: processedProduct.category ? 'Present' : 'Missing'
        });

        console.log('[Directus] Processed product data ready with images:',
            processedProduct.mainImageUrl,
            processedProduct.processedImages.length);

        return processedProduct;
    } catch (error) {
        console.error('[Directus] Error fetching product by slug:', error);
        throw error;
    }
}

/**
 * Get all products with pagination
 */
export async function getProducts(options: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
    locale?: string;
} = {}) {
    try {
        const { page = 1, limit = 10, sort = 'name', filter = {}, locale = 'en' } = options;

        const directus = await getDirectusClient();
        if (!directus) {
            throw new Error('Failed to initialize Directus client');
        }

        // Use the provided filter without adding status filter due to permission issues
        const finalFilter = {
            ...filter
            // Removed status filter due to permission issues
        };

        const products = await (directus as any).request(
            (readItems as any)('products', {
                filter: finalFilter,
                fields: [
                    'id',
                    'name',
                    // 'name_ar', // Removed due to permission issues
                    'slug',
                    'price',
                    'sale_price',
                    // 'in_stock', // Removed due to permission issues
                    // 'status', // Removed due to permission issues
                    'main_image.*',
                    'category.id',
                    'category.name',
                    'brand.id',
                    'brand.name'
                ],
                sort: [sort],
                limit,
                offset: (page - 1) * limit
            })
        );

        // Process images for all products
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const directusToken = process.env.DIRECTUS_API_TOKEN;

        const processedProducts = products.map((product: any) => {
            let mainImageUrl = '/images/placeholder-product.jpg';
            if (product.main_image) {
                const processedMainImage = processDirectusImage(directusUrl, product.main_image, { token: directusToken });
                if (processedMainImage) {
                    mainImageUrl = processedMainImage.url;
                }
            }

            return {
                ...product,
                mainImageUrl,
                // Also set 'image' field for consistency with Product type
                image: mainImageUrl,
                // Ensure in_stock field exists (default to true if not provided)
                in_stock: product.in_stock !== undefined ? product.in_stock : true
            };
        });

        return processedProducts;
    } catch (error) {
        console.error('[Directus] Error fetching products:', error);
        throw error;
    }
}

/**
 * Common Directus collections
 */
export const COLLECTIONS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categiries', // This is intentionally spelled this way in Directus
    BRANDS: 'brands',
    ORDERS: 'orders',
    USERS: 'users',
    REVIEWS: 'reviews',
    ADDRESSES: 'addresses',
} as const;
