import { directusClient, directusQuery, COLLECTIONS, getDirectusClient } from './directus';
import { readItems } from '@directus/sdk';
import { Brand } from '@/types';

function processBrandImage(brand: any, baseUrl: string): any {
    const processedBrand = { ...brand };
    const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN || process.env.DIRECTUS_API_TOKEN;

    if (brand.logo) {
        const imageId = typeof brand.logo === 'string' ? brand.logo : brand.logo.id;
        if (imageId) {
            const url = new URL(`${baseUrl}/assets/${imageId}`);
            if (publicToken) {
                url.searchParams.append('access_token', publicToken);
            }
            processedBrand.logo = url.toString();
        }
    }

    return processedBrand;
}

/**
 * Fetch all brands
 */
export async function getBrands() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        console.log('[Brands] Fetching all brands using SDK');

        // Use the new SDK client
        const directus = await getDirectusClient();
        const brands = await (directus as any).request(
            (readItems as any)(COLLECTIONS.BRANDS, {
                fields: ['id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'logo'],
                limit: -1 // Get all brands
            } as any)
        );

        console.log(`[Brands] Found ${brands.length} brands`);
        return { data: (brands || []).map((brand: any) => processBrandImage(brand, baseUrl)) };
    } catch (error) {
        console.error('[Brands] Error fetching brands with SDK:', error);

        // Try with the legacy client as fallback
        try {
            const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
            console.log('[Brands] Trying legacy client as fallback');
            const response = await directusClient.get(COLLECTIONS.BRANDS, {
                fields: 'id,name,name_ar,slug,description,description_ar,logo',
                limit: -1, // Get all brands
            });

            return { data: (response.data || []).map((brand: any) => processBrandImage(brand, baseUrl)) };
        } catch (fallbackError) {
            console.error('[Brands] Fallback also failed:', fallbackError);
            console.log('[Brands] Using fallback brands data');
            return { data: getFallbackBrands() };
        }
    }
}

/**
 * Fetch featured brands
 */
export async function getFeaturedBrands(limit: number = 6) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        console.log(`[Brands] Fetching featured brands (limit: ${limit}) using SDK`);

        // Use the new SDK client
        const directus = await getDirectusClient();
        const brands = await (directus as any).request(
            (readItems as any)(COLLECTIONS.BRANDS, {
                fields: ['id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'logo'],
                limit: limit
            } as any)
        );

        console.log(`[Brands] Found ${brands.length} brands with SDK`);

        // If no brands are returned, use fallback data
        if (!brands || brands.length === 0) {
            console.log('[Brands] No brands found with SDK, using fallback data');
            return { data: getFallbackBrands() };
        }

        return { data: (brands || []).map((brand: any) => processBrandImage(brand, baseUrl)) };
    } catch (error) {
        console.error('[Brands] Error fetching featured brands with SDK:', error);

        // Try with the legacy client as fallback
        try {
            const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
            console.log('[Brands] Trying legacy client as fallback');
            const response = await directusClient.get(COLLECTIONS.BRANDS, {
                fields: 'id,name,name_ar,slug,description,description_ar,logo',
                limit: limit,
            });

            if (response.data && response.data.length > 0) {
                console.log(`[Brands] Found ${response.data.length} brands with legacy client`);
                return { data: (response.data || []).map((brand: any) => processBrandImage(brand, baseUrl)) };
            }
        } catch (fallbackError) {
            console.error('[Brands] Fallback also failed:', fallbackError);
        }

        // Return fallback brands in case of error
        console.log('[Brands] All methods failed, returning fallback brands');
        return { data: getFallbackBrands() };
    }
}

/**
 * Fallback brands for development and testing
 */
export function getFallbackBrands() {
    return [
        {
            id: 1,
            name: 'Dermacol',
            name_ar: 'ديرماكول',
            slug: 'dermacol',
            description: 'Premium cosmetics brand from Europe',
            description_ar: 'علامة مستحضرات التجميل الفاخرة من أوروبا',
            logo: null
        },
        {
            id: 2,
            name: 'Bioderma',
            name_ar: 'بيوديرما',
            slug: 'bioderma',
            description: 'Dermatological skincare products',
            description_ar: 'منتجات العناية بالبشرة الجلدية',
            logo: null
        },
        {
            id: 3,
            name: 'La Roche-Posay',
            name_ar: 'لاروش بوزيه',
            slug: 'la-roche-posay',
            description: 'Dermatologist recommended skincare',
            description_ar: 'العناية بالبشرة الموصى بها من قبل أطباء الجلدية',
            logo: null
        },
        {
            id: 4,
            name: 'Vichy',
            name_ar: 'فيشي',
            slug: 'vichy',
            description: 'Mineral-infused skincare products',
            description_ar: 'منتجات العناية بالبشرة المشبعة بالمعادن',
            logo: null
        }
    ];
}

/**
 * Fetch single brand by slug
 */
export async function getBrandBySlug(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const response = await directusClient.get(COLLECTIONS.BRANDS, {
            fields: 'id,name,name_ar,slug,description,description_ar,logo',
            filter: { slug: { _eq: slug } },
            limit: 1,
        });

        if (response.data && response.data.length > 0) {
            return processBrandImage(response.data[0], baseUrl);
        }

        return null;
    } catch (error) {
        console.error(`Error fetching brand with slug ${slug}:`, error);
        return null;
    }
}