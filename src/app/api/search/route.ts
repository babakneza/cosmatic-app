import { NextRequest, NextResponse } from 'next/server';
import { getDirectusClient } from '@/lib/api/directus';
import { readItems } from '@directus/sdk';
import { processDirectusImage } from '@/lib/api/directus-config';

export interface SearchResponse {
    id: string;
    name: string;
    type: 'product' | 'category';
    slug: string;
    image?: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.trim();
        const type = searchParams.get('type') || 'all'; // 'all', 'products', 'categories'

        if (!query || query.length < 2) {
            console.log('[Search API] Query too short:', query);
            return NextResponse.json([]);
        }

        console.log('[Search API] Searching for:', query, 'type:', type);

        const client = await getDirectusClient();
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const results: SearchResponse[] = [];

        try {
            // Search products
            if (type === 'all' || type === 'products') {
                console.log('[Search API] Searching products for:', query);
                try {
                    const products = await (client as any).request(
                        (readItems as any)('products', {
                            filter: {
                                _or: [
                                    { name: { _contains: query } },
                                    { name_ar: { _contains: query } },
                                    { description: { _contains: query } },
                                    { description_ar: { _contains: query } },
                                    { slug: { _contains: query } },
                                ]
                            },
                            fields: ['id', 'name', 'name_ar', 'slug', 'main_image'],
                            limit: 5,
                        })
                    ) as any[];

                    console.log('[Search API] Found', products?.length || 0, 'products');

                    (products || []).forEach(product => {
                        results.push({
                            id: product.id,
                            name: product.name || product.name_ar,
                            type: 'product',
                            slug: product.slug,
                            image: product.main_image ? processDirectusImage(directusUrl, product.main_image)?.url : undefined,
                        });
                    });
                } catch (productError) {
                    console.error('[Search API] Error searching products:', productError);
                }
            }

            // Search categories
            if (type === 'all' || type === 'categories') {
                console.log('[Search API] Searching categories for:', query);
                try {
                    const categories = await (client as any).request(
                        (readItems as any)('categiries', {
                            filter: {
                                _or: [
                                    { name: { _contains: query } },
                                    { name_ar: { _contains: query } },
                                    { description: { _contains: query } },
                                    { description_ar: { _contains: query } },
                                    { slug: { _contains: query } },
                                ]
                            },
                            fields: ['id', 'name', 'name_ar', 'slug', 'image'],
                            limit: 3,
                        } as any)
                    ) as any[];

                    console.log('[Search API] Found', categories?.length || 0, 'categories');

                    (categories || []).forEach(category => {
                        results.push({
                            id: category.id,
                            name: category.name || category.name_ar,
                            type: 'category',
                            slug: category.slug,
                            image: category.image ? processDirectusImage(directusUrl, category.image)?.url : undefined,
                        });
                    });
                } catch (categoryError) {
                    console.error('[Search API] Error searching categories:', categoryError);
                }
            }

            console.log('[Search API] Returning', results.length, 'total results');
        } catch (searchError) {
            console.error('[Search API] Error performing search:', searchError);
            // Return empty results on search error instead of crashing
            return NextResponse.json([]);
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('[Search API] Fatal error:', error);

        const errorResponse = {
            error: 'Failed to search',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(errorResponse, { status: 500 });
    }
}