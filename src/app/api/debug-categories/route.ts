import { NextResponse } from 'next/server';
import { directusClient, COLLECTIONS } from '@/lib/api/directus';

export async function GET() {
    try {
        console.log(`Debugging categories API call to collection: ${COLLECTIONS.CATEGORIES}`);

        // Get all categories with the correct fields
        const allResponse = await directusClient.get(COLLECTIONS.CATEGORIES, {
            fields: 'id,name,slug,description,image,icon,parent',
            limit: 100,
        });

        // Get a subset of categories for testing
        const limitedResponse = await directusClient.get(COLLECTIONS.CATEGORIES, {
            fields: 'id,name,slug,description,image,icon,parent',
            limit: 6,
        });

        // Return both results for comparison
        return NextResponse.json({
            success: true,
            collection: COLLECTIONS.CATEGORIES,
            allCategories: {
                count: allResponse.data ? allResponse.data.length : 0,
                data: allResponse.data || []
            },
            limitedCategories: {
                count: limitedResponse.data ? limitedResponse.data.length : 0,
                data: limitedResponse.data || []
            }
        });
    } catch (error) {
        console.error('Error debugging categories:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch categories',
            collection: COLLECTIONS.CATEGORIES,
            errorDetails: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}