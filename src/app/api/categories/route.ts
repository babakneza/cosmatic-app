import { NextResponse } from 'next/server';
import { getDirectusClient } from '@/lib/api/directus';
import { readItems } from '@directus/sdk';

export interface Category {
    id: string;
    name: string;
    name_ar: string;
    slug: string;
    description?: string;
    description_ar?: string;
    image?: string;
}

/**
 * GET /api/categories
 * 
 * Fetches all product categories from Directus
 * 
 * Returns:
 * - Array of categories sorted by name
 * - Includes both English and Arabic names for each category
 */
export async function GET() {
    try {
        console.log('[Categories API] Fetching categories...');

        const client = await getDirectusClient();

        const categories = await (client as any).request(
            (readItems as any)('categiries', {
                fields: [
                    'id',
                    'name',
                    'name_ar',
                    'slug',
                    'description',
                    'description_ar',
                    'image',
                ],
                sort: ['name'],
                limit: -1, // Fetch all
            })
        ) as Category[];

        console.log('[Categories API] Found', categories?.length || 0, 'categories');

        return NextResponse.json(categories || []);
    } catch (error) {
        console.error('[Categories API] Error fetching categories:', error);

        // Return empty array on error to prevent UI breakage
        return NextResponse.json([]);
    }
}