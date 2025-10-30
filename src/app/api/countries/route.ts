import { NextResponse } from 'next/server';
import { getDirectusClient } from '@/lib/api/directus';
import { readItems } from '@directus/sdk';

export interface Country {
    id: string | number;
    countries: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * GET /api/countries
 * 
 * Fetches all countries from Directus
 * 
 * Returns:
 * - Array of countries sorted by name
 */
export async function GET() {
    try {
        console.log('[Countries API] Fetching countries...');

        const client = await getDirectusClient();

        const countries = await (client as any).request(
            (readItems as any)('countries', {
                fields: ['*'],
                limit: -1, // Fetch all
            })
        ) as Country[];

        console.log('[Countries API] Found', countries?.length || 0, 'countries');
        if (countries && countries.length > 0) {
            console.log('[Countries API] Sample country:', countries[0]);
        }

        return NextResponse.json({
            data: countries || []
        });
    } catch (error: any) {
        console.error('[Countries API] Error fetching countries:', error.message);

        // Log more detailed error info
        if (error.errors) {
            console.error('[Countries API] Detailed errors:', error.errors);
        }
        if (error.response?.status === 403) {
            console.error('[Countries API] PERMISSION DENIED - Check Directus access control for "countries" collection');
        }

        // Return empty array on error to prevent UI breakage
        return NextResponse.json({
            data: []
        });
    }
}