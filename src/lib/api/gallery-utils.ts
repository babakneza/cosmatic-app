import { getAssetUrl, extractImageId } from './directus-config';

// Define TypeScript interfaces for the gallery data
export interface DirectusFile {
    id: number;
    products_id: number;
    directus_files_id: string;
}

export interface GalleryResponse {
    data: {
        image_gallery: DirectusFile[];
    };
}

/**
 * Extract gallery images from Directus API response
 * 
 * This function extracts image URLs from a Directus API response containing
 * image_gallery data. It handles various response formats and returns an array
 * of complete image URLs.
 * 
 * @param apiResponse The API response from Directus
 * @param baseUrl The base URL for the Directus instance
 * @param token Optional authentication token
 * @returns Array of image URLs
 */
export function extractGalleryImages(
    apiResponse: any,
    baseUrl: string = 'https://admin.buyjan.com'
): string[] {
    console.log('[Gallery] Extracting gallery images from API response');

    if (!apiResponse) {
        console.log('[Gallery] No API response provided');
        return [];
    }

    // Handle different response structures
    let galleryItems: any[] = [];

    // Case 1: Standard response format with data.image_gallery array
    if (apiResponse.data?.image_gallery && Array.isArray(apiResponse.data.image_gallery)) {
        console.log('[Gallery] Found standard image_gallery array');
        galleryItems = apiResponse.data.image_gallery;
    }
    // Case 2: Response with image_gallery at the root level
    else if (apiResponse.image_gallery && Array.isArray(apiResponse.image_gallery)) {
        console.log('[Gallery] Found image_gallery array at root level');
        galleryItems = apiResponse.image_gallery;
    }
    // Case 3: Response with image_gallery.data array
    else if (apiResponse.image_gallery?.data && Array.isArray(apiResponse.image_gallery.data)) {
        console.log('[Gallery] Found image_gallery.data array');
        galleryItems = apiResponse.image_gallery.data;
    }
    // Case 4: Response with data at the root level
    else if (apiResponse.data && !apiResponse.data.image_gallery) {
        console.log('[Gallery] No image_gallery found, checking data object');
        // Try to find any property that might contain gallery images
        for (const key in apiResponse.data) {
            if (Array.isArray(apiResponse.data[key]) &&
                apiResponse.data[key].length > 0 &&
                (apiResponse.data[key][0].directus_files_id ||
                    apiResponse.data[key][0].file_id)) {
                console.log(`[Gallery] Found potential gallery array in data.${key}`);
                galleryItems = apiResponse.data[key];
                break;
            }
        }
    }

    // If no gallery items found, return empty array
    if (galleryItems.length === 0) {
        console.log('[Gallery] No gallery items found in API response');
        return [];
    }

    console.log(`[Gallery] Processing ${galleryItems.length} gallery items`);

    // Extract image URLs from gallery items
    const imageUrls: string[] = [];

    for (const item of galleryItems) {
        console.log('[Gallery] Processing gallery item:', JSON.stringify(item));

        // Extract the directus_files_id from the item - this MUST be a UUID string
        let fileId: string | null = null;

        // Case 1: Item has directus_files_id property (most common case from the API)
        if (item.directus_files_id) {
            console.log('[Gallery] Found directus_files_id in item:', item.directus_files_id);
            // Ensure we're using the UUID string, not a numeric ID
            fileId = item.directus_files_id;

            // Validate that it looks like a UUID
            if (fileId && !fileId.includes('-') && !isNaN(Number(fileId))) {
                console.error('[Gallery] Invalid file ID format - numeric ID instead of UUID:', fileId);
                fileId = null;
            }
        }
        // Case 2: Item has directus_files property with id
        else if (item.directus_files && item.directus_files.id) {
            console.log('[Gallery] Found directus_files.id in item:', item.directus_files.id);
            fileId = item.directus_files.id;

            // Validate that it looks like a UUID
            if (fileId && !fileId.includes('-') && !isNaN(Number(fileId))) {
                console.error('[Gallery] Invalid file ID format - numeric ID instead of UUID:', fileId);
                fileId = null;
            }
        }
        // Case 3: Use the extractImageId utility for complex cases
        else {
            console.log('[Gallery] Using extractImageId utility for complex item');
            fileId = extractImageId(item);

            // Validate that it looks like a UUID
            if (fileId && !fileId.includes('-') && !isNaN(Number(fileId))) {
                console.error('[Gallery] Invalid file ID format - numeric ID instead of UUID:', fileId);
                fileId = null;
            }
        }

        if (fileId) {
            // Construct the full URL using the assets endpoint with the UUID and access token
            const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;
            const imageUrl = directusToken
                ? `${baseUrl}/assets/${fileId}?access_token=${directusToken}`
                : `${baseUrl}/assets/${fileId}`;

            console.log('[Gallery] Generated image URL with access token');
            imageUrls.push(imageUrl);
        } else {
            console.error('[Gallery] Could not extract valid UUID file ID from item:', JSON.stringify(item));
        }
    }

    console.log(`[Gallery] Extracted ${imageUrls.length} image URLs`);
    return imageUrls;
}

/**
 * Process gallery images for a product
 * 
 * This function processes the image_gallery field from a product object
 * and returns an array of processed image objects with IDs and URLs.
 * 
 * @param product The product object from the API
 * @param baseUrl The base URL for the Directus instance
 * @param token Optional authentication token
 * @returns Array of processed image objects
 */
export function processProductGallery(
    product: any,
    baseUrl: string = 'https://admin.buyjan.com'
): { id: string; url: string }[] {
    if (!product) return [];

    console.log('[Gallery] Processing product gallery');

    // Extract gallery items from the product
    let galleryItems: any[] = [];

    if (product.image_gallery) {
        console.log('[Gallery] Found image_gallery in product');

        if (Array.isArray(product.image_gallery)) {
            galleryItems = product.image_gallery;
        } else if (product.image_gallery.data && Array.isArray(product.image_gallery.data)) {
            galleryItems = product.image_gallery.data;
        } else {
            // Try to convert to array if it's not already
            galleryItems = [product.image_gallery];
        }
    }

    console.log(`[Gallery] Processing ${galleryItems.length} gallery items`);

    // Process each gallery item
    const processedImages: { id: string; url: string }[] = [];

    for (const item of galleryItems) {
        // Extract the file ID - must be a UUID string
        let fileId: string | null = null;

        // Case 1: Item has directus_files_id property (most common case)
        if (item.directus_files_id) {
            console.log('[Gallery] Found directus_files_id in item:', item.directus_files_id);
            fileId = item.directus_files_id;

            // Validate that it looks like a UUID
            if (fileId && !fileId.includes('-') && !isNaN(Number(fileId))) {
                console.error('[Gallery] Invalid file ID format - numeric ID instead of UUID:', fileId);
                fileId = null;
            }
        }
        // Case 2: Try to extract from other properties
        else {
            fileId = extractImageId(item);

            // Validate that it looks like a UUID
            if (fileId && !fileId.includes('-') && !isNaN(Number(fileId))) {
                console.error('[Gallery] Invalid file ID format - numeric ID instead of UUID:', fileId);
                fileId = null;
            }
        }

        if (fileId) {
            // Generate the image URL directly with the UUID and access token
            const directusToken = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;
            const imageUrl = directusToken
                ? `${baseUrl}/assets/${fileId}?access_token=${directusToken}`
                : `${baseUrl}/assets/${fileId}`;

            console.log('[Gallery] Generated image URL with access token');

            processedImages.push({
                id: fileId,
                url: imageUrl
            });
        }
    }

    console.log(`[Gallery] Processed ${processedImages.length} gallery images`);
    return processedImages;
}