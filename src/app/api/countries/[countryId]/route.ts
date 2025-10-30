import { NextResponse } from 'next/server';
import { getDirectusClient } from '@/lib/api/directus';
import { readItem } from '@directus/sdk';

export interface Country {
    id: string | number;
    countries: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * GET /api/countries/[countryId]
 * 
 * Fetches a single country by ID from Directus
 * 
 * Returns:
 * - Country object with id and countries (name) field
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ countryId: string }> }
) {
    try {
        const { countryId } = await params;

        console.log('[Countries ID API] Fetching country:', countryId);

        if (!countryId) {
            return NextResponse.json(
                { error: 'Country ID is required' },
                { status: 400 }
            );
        }

        const client = await getDirectusClient();

        const country = await (client as any).request(
            (readItem as any)('countries', countryId, {
                fields: ['*'],
            })
        ) as Country;

        console.log('[Countries ID API] Found country:', country);

        if (!country) {
            return NextResponse.json(
                { error: 'Country not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            data: country
        });
    } catch (error: any) {
        console.error('[Countries ID API] Error fetching country:', error.message);

        // Log more detailed error info
        if (error.errors) {
            console.error('[Countries ID API] Detailed errors:', error.errors);
        }
        if (error.response?.status === 403) {
            console.error('[Countries ID API] PERMISSION DENIED - Check Directus access control for "countries" collection');
        }

        return NextResponse.json(
            { error: 'Failed to fetch country' },
            { status: 500 }
        );
    }
}