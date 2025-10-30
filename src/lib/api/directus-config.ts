import { createDirectus, rest, staticToken, authentication } from '@directus/sdk';
import type { AuthenticationClient, RestClient } from '@directus/sdk';

// Define your schema types for TypeScript support
export interface DirectusSchema {
    products: {
        id: string;
        name: string;
        name_ar?: string;
        slug: string;
        description?: string;
        description_ar?: string;
        price: number;
        sale_price?: number;
        sku?: string;
        in_stock: boolean;
        status: 'published' | 'draft' | 'archived';
        rating?: number;
        reviews_count?: number;
        main_image?: any;
        brand?: any;
        categories?: any[];
        images?: any[];
    };
    categories: {
        id: string;
        name: string;
        name_ar?: string;
        slug: string;
        description?: string;
        description_ar?: string;
        parent?: string | null;
        image?: any;
    };
    categiries: {
        id: string;
        name: string;
        name_ar?: string;
        slug: string;
        description?: string;
        description_ar?: string;
        parent?: string | null;
        image?: any;
    };
    brands: {
        id: string;
        name: string;
        name_ar?: string;
        slug: string;
        logo?: any;
    };
    countries: {
        id: string | number;
        countries: string;
        created_at?: string;
        updated_at?: string;
    };
    shipping: {
        id: string;
        name: string;
        name_ar: string;
        type: 'standard' | 'express' | 'overnight' | string;
        cost: number;
        available_countries?: any[];
        is_active: boolean;
        sort_order: number;
        [key: string]: any;
    };
    customers: any;
    orders: any;
    order_items: any;
    product_reviews: any;
    wishlist: any;
    coupons: any;
}

// Configuration options for Directus client
export interface DirectusConfig {
    url: string;
    token?: string;
    fetch?: typeof fetch;
    onError?: (error: any) => void;
}

/**
 * Create a typed Directus client with proper error handling
 */
export function createDirectusClient(config: DirectusConfig): any {
    const { url, token, fetch: customFetch, onError } = config;

    // Create base client
    const client = createDirectus<DirectusSchema>(url);

    // Add REST transport
    const restConfig: any = {
        onError: (error: any) => {
            console.error('[Directus] API Error:', error);
            if (onError) onError(error);
        }
    };

    // Only add fetch if it's provided
    if (customFetch) {
        restConfig.fetch = customFetch;
    }

    const withRest = client.with(rest(restConfig));

    // Add authentication if token is provided
    if (token) {
        return withRest.with(staticToken(token));
    }

    return withRest;
}

/**
 * Get Directus asset URL with proper formatting
 */
export function getAssetUrl(
    baseUrl: string,
    assetId: string | null | undefined,
    options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'jpg' | 'png' | 'webp' | 'avif';
        fit?: 'cover' | 'contain' | 'inside' | 'outside';
    }
) {
    if (!assetId) return null;

    // Ensure assetId is a string and not an object
    if (typeof assetId === 'object') {
        console.error('[Directus] Invalid assetId type:', typeof assetId, JSON.stringify(assetId));
        return null;
    }

    // Fix for direct file URLs - if the assetId is already a full URL, return it directly
    if (assetId.startsWith('http')) {
        console.log('[Directus] Asset ID is already a URL, returning directly:', assetId);
        return assetId;
    }

    // Validate that the assetId looks like a UUID (contains hyphens)
    // If it's a numeric ID, it's likely incorrect
    if (!assetId.includes('-') && !isNaN(Number(assetId))) {
        console.error('[Directus] Invalid asset ID format - numeric ID instead of UUID:', assetId);
        return null;
    }

    // Use the assets endpoint with the UUID
    const url = new URL(`${baseUrl}/assets/${assetId}`);

    // Add access token for authentication
    const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;
    if (directusToken) {
        url.searchParams.append('access_token', directusToken);
        console.log('[Directus] Added access_token to asset URL');
    } else {
        console.warn('[Directus] No access token available for asset URL');
    }

    // Add image transformation parameters
    if (options?.width) url.searchParams.append('width', options.width.toString());
    if (options?.height) url.searchParams.append('height', options.height.toString());
    if (options?.quality) url.searchParams.append('quality', options.quality.toString());
    if (options?.format) url.searchParams.append('format', options.format);
    if (options?.fit) url.searchParams.append('fit', options.fit);

    console.log('[Directus] Generated asset URL:', url.toString());
    return url.toString();
}

/**
 * Extract image ID from various Directus image formats
 * Prioritizes finding UUID strings (containing hyphens) which are the correct format for assets
 */
export function extractImageId(image: any): string | null {
    if (!image) return null;

    console.log('[Directus] Extracting image ID from:', JSON.stringify(image));

    // Handle string ID
    if (typeof image === 'string') {
        // If it's already a UUID (contains hyphens), return it directly
        if (image.includes('-')) {
            return image;
        }
        // If it's a numeric ID, it's probably not what we want
        if (!isNaN(Number(image))) {
            console.error('[Directus] Numeric ID found instead of UUID:', image);
            return null;
        }
        return image;
    }

    // Handle object with ID
    if (typeof image === 'object') {
        // First priority: directus_files_id which is the correct field for UUIDs in junction tables
        if (image.directus_files_id) {
            const fileId = typeof image.directus_files_id === 'string' ?
                image.directus_files_id : String(image.directus_files_id);

            // Validate it looks like a UUID
            if (fileId.includes('-')) {
                return fileId;
            }

            // If it's a nested object, try to get the id from it
            if (typeof image.directus_files_id === 'object' && image.directus_files_id.id) {
                const nestedId = typeof image.directus_files_id.id === 'string' ?
                    image.directus_files_id.id : String(image.directus_files_id.id);

                if (nestedId.includes('-')) {
                    return nestedId;
                }
            }
        }

        // Second priority: directus_files object which might contain the file object
        if (image.directus_files) {
            if (typeof image.directus_files === 'string' && image.directus_files.includes('-')) {
                return image.directus_files;
            } else if (typeof image.directus_files === 'object' && image.directus_files) {
                if (image.directus_files.id && typeof image.directus_files.id === 'string' &&
                    image.directus_files.id.includes('-')) {
                    return image.directus_files.id;
                }
            }
        }

        // Third priority: file_id which might be used in some schemas
        if (image.file_id && typeof image.file_id === 'string' && image.file_id.includes('-')) {
            return image.file_id;
        }

        // Fourth priority: regular id field if it looks like a UUID
        if (image.id && typeof image.id === 'string' && image.id.includes('-')) {
            return image.id;
        }

        // Some Directus versions include the full file object
        if (image.filename_disk && image.id && typeof image.id === 'string' && image.id.includes('-')) {
            return image.id;
        }

        // Handle M2M junction tables that might have a different structure
        if (image.item && typeof image.item === 'object') {
            return extractImageId(image.item); // Recursive call for nested items
        }

        // Last resort: scan all properties for anything that looks like a UUID
        for (const key in image) {
            const value = image[key];
            if (typeof value === 'string' && value.includes('-') &&
                (key.toLowerCase().includes('id') || key.toLowerCase().includes('file'))) {
                console.log('[Directus] Found potential UUID field:', key, value);
                return value;
            }
        }
    }

    console.log('[Directus] Could not extract valid UUID image ID from:', JSON.stringify(image));
    return null;
}

/**
 * Process image data from Directus into a consistent format
 */
export function processDirectusImage(
    baseUrl: string,
    image: any,
    options?: {
        width?: number;
        height?: number;
        token?: string;
    }
): { id: string; url: string } | null {
    console.log('[Directus] Processing image:', JSON.stringify(image));

    const imageId = extractImageId(image);
    console.log('[Directus] Extracted image ID:', imageId);

    if (!imageId) {
        console.log('[Directus] No image ID could be extracted');
        return null;
    }

    const url = getAssetUrl(baseUrl, imageId, options);
    console.log('[Directus] Generated image URL:', url);

    if (!url) {
        console.log('[Directus] Failed to generate URL for image ID:', imageId);
        return null;
    }

    return {
        id: typeof imageId === 'string' ? imageId : String(imageId),
        url
    };
}