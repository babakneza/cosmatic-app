import type { AuthenticationClient, RestClient } from '@directus/sdk';
import { createDirectus, rest, staticToken } from '@directus/sdk';

// Define your schema types for TypeScript support
export interface DirectusSchema {
    products: any;
    categories: any;
    categiries: any;
    brands: any;
    countries: any;
    shipping: any;
    shipping_methods: any;
    customers: any;
    orders: any;
    order_items: any;
    product_reviews: any;
    wishlist: any;
    coupons: any;
    states: any;
    [key: string]: any;
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
        onError: (error: unknown) => {
            if (onError) onError(error);
        }
    };

    // Only add fetch if it's provided
    if (customFetch) {
        (restConfig as any).fetch = customFetch;
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
        return null;
    }

    // Fix for direct file URLs - if the assetId is already a full URL, return it directly
    if (assetId.startsWith('http')) {
        return assetId;
    }

    // Validate that the assetId looks like a UUID (contains hyphens)
    // If it's a numeric ID, it's likely incorrect
    if (!assetId.includes('-') && !isNaN(Number(assetId))) {
        return null;
    }

    // Use the assets endpoint with the UUID
    const url = new URL(`${baseUrl}/assets/${assetId}`);

    // Add access token for authentication
    const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || process.env.DIRECTUS_API_TOKEN;
    if (directusToken) {
        url.searchParams.append('access_token', directusToken);
    }

    // Add image transformation parameters
    if (options?.width) url.searchParams.append('width', options.width.toString());
    if (options?.height) url.searchParams.append('height', options.height.toString());
    if (options?.quality) url.searchParams.append('quality', options.quality.toString());
    if (options?.format) url.searchParams.append('format', options.format);
    if (options?.fit) url.searchParams.append('fit', options.fit);

    return url.toString();
}

/**
 * Extract image ID from various Directus image formats
 * Prioritizes finding UUID strings (containing hyphens) which are the correct format for assets
 */
export function extractImageId(image: any): string | null {
    if (!image) return null;

    if (typeof image === 'string') {
        if (image.includes('-')) {
            return image;
        }
        if (!isNaN(Number(image))) {
            return null;
        }
        return image;
    }

    if (typeof image === 'object') {
        if (image.directus_files_id) {
            const fileId = typeof image.directus_files_id === 'string' ?
                image.directus_files_id : String(image.directus_files_id);

            if (fileId.includes('-')) {
                return fileId;
            }

            if (typeof image.directus_files_id === 'object' && image.directus_files_id.id) {
                const nestedId = typeof image.directus_files_id.id === 'string' ?
                    image.directus_files_id.id : String(image.directus_files_id.id);

                if (nestedId.includes('-')) {
                    return nestedId;
                }
            }
        }

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

        if (image.file_id && typeof image.file_id === 'string' && image.file_id.includes('-')) {
            return image.file_id;
        }

        if (image.id && typeof image.id === 'string' && image.id.includes('-')) {
            return image.id;
        }

        if (image.filename_disk && image.id && typeof image.id === 'string' && image.id.includes('-')) {
            return image.id;
        }

        if (image.item && typeof image.item === 'object') {
            return extractImageId(image.item);
        }

        for (const key in image) {
            const value = image[key];
            if (typeof value === 'string' && value.includes('-') &&
                (key.toLowerCase().includes('id') || key.toLowerCase().includes('file'))) {
                return value;
            }
        }
    }

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
    const imageId = extractImageId(image);

    if (!imageId) {
        return null;
    }

    const url = getAssetUrl(baseUrl, imageId, options);

    if (!url) {
        return null;
    }

    return {
        id: typeof imageId === 'string' ? imageId : String(imageId),
        url
    };
}