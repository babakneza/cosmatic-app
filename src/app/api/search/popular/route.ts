import { NextResponse } from 'next/server';
import { getDirectusClient } from '@/lib/api/directus';
import { readItems } from '@directus/sdk';

export async function GET() {
    try {
        const client = await getDirectusClient();

        try {
            const categories = await (client as any).request(
                (readItems as any)('categiries', {
                    fields: ['name'],
                    limit: 6,
                })
            ) as any[];

            const results = (categories || []).map(cat => cat.name).filter(Boolean);
            return NextResponse.json(results);
        } catch (searchError) {
            console.error('[Popular Search API] Error fetching categories:', searchError);
            // Return empty array on error
            return NextResponse.json([]);
        }
    } catch (error) {
        console.error('[Popular Search API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}