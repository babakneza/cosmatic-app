import { getDirectusClient } from './directus';
import { readItems } from '@directus/sdk';
import { processDirectusImage } from './directus-config';
import { Product, Category } from '@/types';

export interface SearchSuggestion {
    id: string;
    name: string;
    type: 'product' | 'category';
    slug: string;
    image?: string;
}

/**
 * Search for products and categories by query
 */
export async function searchProducts(query: string, limit: number = 5): Promise<SearchSuggestion[]> {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const searchTerm = query.trim().toLowerCase();

        // Fetch products matching the search term
        const products = await (client as any).request((readItems as any)('products', {
            filter: {
                _or: [
                    { name: { _contains: searchTerm } },
                    { name_ar: { _contains: searchTerm } },
                    { description: { _contains: searchTerm } },
                    { description_ar: { _contains: searchTerm } },
                ]
            },
            fields: ['id', 'name', 'name_ar', 'slug', 'main_image'],
            limit: limit,
        })) as any[];

        const suggestions: SearchSuggestion[] = (products || []).map(product => ({
            id: product.id,
            name: product.name || product.name_ar,
            type: 'product',
            slug: product.slug,
            image: product.main_image ? processDirectusImage(directusUrl, product.main_image)?.url : undefined,
        }));

        return suggestions;
    } catch (error) {
        console.error('[Search] Error searching products:', error instanceof Error ? error.message : String(error));
        return [];
    }
}

/**
 * Search for categories by query
 */
export async function searchCategories(query: string, limit: number = 3): Promise<SearchSuggestion[]> {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const searchTerm = query.trim().toLowerCase();

        // Fetch categories matching the search term
        const categories = await (client as any).request((readItems as any)('categiries', {
            filter: {
                _or: [
                    { name: { _contains: searchTerm } },
                    { name_ar: { _contains: searchTerm } },
                ]
            },
            fields: ['id', 'name', 'name_ar', 'slug', 'image'],
            limit: limit,
        })) as any[];

        const suggestions: SearchSuggestion[] = (categories || []).map(category => ({
            id: category.id,
            name: category.name || category.name_ar,
            type: 'category',
            slug: category.slug,
            image: category.image ? processDirectusImage(directusUrl, category.image)?.url : undefined,
        }));

        return suggestions;
    } catch (error) {
        console.error('[Search] Error searching categories:', error instanceof Error ? error.message : String(error));
        return [];
    }
}

/**
 * Get popular searches
 */
export async function getPopularSearches(limit: number = 6): Promise<string[]> {
    try {
        // In a real application, this would track actual searches
        // For now, return trending category names
        const client = await getDirectusClient();

        const categories = await (client as any).request((readItems as any)('categiries', {
            fields: ['name'],
            limit: limit,
        })) as any[];

        return (categories || []).map(cat => cat.name).filter(Boolean);
    } catch (error) {
        console.error('[Search] Error getting popular searches:', error instanceof Error ? error.message : String(error));
        return [];
    }
}

/**
 * Combined search for products and categories
 */
export async function searchAll(query: string, productLimit: number = 5, categoryLimit: number = 3): Promise<SearchSuggestion[]> {
    try {
        const [products, categories] = await Promise.all([
            searchProducts(query, productLimit),
            searchCategories(query, categoryLimit),
        ]);

        // Combine and prioritize products over categories
        return [...products, ...categories];
    } catch (error) {
        console.error('[Search] Error in combined search:', error instanceof Error ? error.message : String(error));
        return [];
    }
}