import { directusClient, directusQuery, COLLECTIONS, getDirectusClient } from './directus';
import { readItems } from '@directus/sdk';
import { Category } from '@/types';

function processCategoryImage(category: any, baseUrl: string): any {
    const processedCategory = { ...category };
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || process.env.DIRECTUS_API_TOKEN;

    if (category.image) {
        const imageId = typeof category.image === 'string' ? category.image : category.image.id;
        if (imageId) {
            const url = new URL(`${baseUrl}/assets/${imageId}`);
            if (publicToken) {
                url.searchParams.append('access_token', publicToken);
            }
            processedCategory.image = url.toString();
        }
    }

    return processedCategory;
}

/**
 * Fetch all categories
 */
export async function getCategories() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        
        // Use the new SDK client
        const directus = await getDirectusClient();
        const categories = await (directus as any).request(
            (readItems as any)(COLLECTIONS.CATEGORIES, {
                fields: ['id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'image', 'icon', 'parent'],
                limit: -1 // Get all categories
            } as any)
        );

        return (categories || []).map((cat: any) => processCategoryImage(cat, baseUrl));
    } catch (error) {
        console.error('[Categories] Error fetching categories with SDK:', error);

        // Try with the legacy client as fallback
        try {
            const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
            const response = await directusClient.get(COLLECTIONS.CATEGORIES, {
                fields: 'id,name,name_ar,slug,description,description_ar,image,icon,parent',
                limit: -1, // Get all categories
            });

            return (response.data || []).map((cat: any) => processCategoryImage(cat, baseUrl));
        } catch (fallbackError) {
            console.error('[Categories] Fallback also failed:', fallbackError);
            return [];
        }
    }
}

/**
 * Fetch featured categories
 */
export async function getFeaturedCategories(limit: number = 6) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        
        // Use the new SDK client
        const directus = await getDirectusClient();
        const categories = await (directus as any).request(
            (readItems as any)(COLLECTIONS.CATEGORIES, {
                fields: ['id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'image', 'icon', 'parent'],
                limit: limit
            } as any)
        );

        // If no categories are returned, use fallback data
        if (!categories || categories.length === 0) {
            return getFallbackCategories();
        }

        return (categories || []).map((cat: any) => processCategoryImage(cat, baseUrl));
    } catch (error) {
        console.error('[Categories] Error fetching featured categories with SDK:', error);

        // Try with the legacy client as fallback
        try {
            const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
            const response = await directusClient.get(COLLECTIONS.CATEGORIES, {
                fields: 'id,name,name_ar,slug,description,description_ar,image,icon,parent',
                limit: limit,
            });

            if (response.data && response.data.length > 0) {
                return (response.data || []).map((cat: any) => processCategoryImage(cat, baseUrl));
            }
        } catch (fallbackError) {
            console.error('[Categories] Fallback also failed:', fallbackError);
        }

        // Return fallback categories in case of error
        return getFallbackCategories();
    }
}

/**
 * Fallback categories for development and testing
 */
export function getFallbackCategories() {
    return [
        {
            id: 1,
            name: 'Intimate Care',
            slug: 'intimate_care',
            description: 'Premium intimate care products',
            image: null,
            parent: null,
            icon: 'eco'
        },
        {
            id: 2,
            name: 'Skin Brightening & Whitening',
            slug: 'skin_brightening',
            description: 'Luxury skin brightening products',
            image: null,
            parent: null,
            icon: 'opacity'
        },
        {
            id: 3,
            name: 'Acne & Sun Protection',
            slug: 'acne_sun_protection',
            description: 'Premium acne and sun protection products',
            image: null,
            parent: null,
            icon: 'sunny'
        },
        {
            id: 4,
            name: 'Hair & Body Care',
            slug: 'hair_body_care',
            description: 'Luxury hair and body care products',
            image: null,
            parent: null,
            icon: 'spa'
        }
    ];
}

/**
 * Fetch single category by slug
 */
export async function getCategoryBySlug(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const response = await directusClient.get(COLLECTIONS.CATEGORIES, {
            fields: 'id,name,name_ar,slug,description,description_ar,image,icon,parent',
            filter: { slug: { _eq: slug } },
            limit: 1,
        });

        if (response.data && response.data.length > 0) {
            return processCategoryImage(response.data[0], baseUrl);
        }

        return null;
    } catch (error) {
        console.error(`Error fetching category with slug ${slug}:`, error);
        return null;
    }
}