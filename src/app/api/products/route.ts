import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/api/directus';
import { Locale } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const locale = (searchParams.get('locale') || 'en') as Locale;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const sort = searchParams.get('sort') || 'name';

        // Get filter parameters
        const category = searchParams.get('category');
        const brand = searchParams.get('brand');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const inStock = searchParams.get('inStock');

        // Build filter object
        const filter: Record<string, any> = {};

        if (category) {
            filter.category = { _eq: category };
        }

        if (brand) {
            filter.brand = { _eq: brand };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price._gte = parseFloat(minPrice);
            if (maxPrice) filter.price._lte = parseFloat(maxPrice);
        }

        if (inStock === 'true') {
            filter.in_stock = { _eq: true };
        }

        console.log(`[API] Fetching products with params:`, {
            page,
            limit,
            sort,
            filter,
            locale
        });

        // Fetch products using our Directus client
        const products = await getProducts({
            page,
            limit,
            sort,
            filter,
            locale
        });

        console.log(`[API] Found ${products.length} products`);

        // Return the products
        return NextResponse.json(products);
    } catch (error) {
        console.error('[API] Error fetching products:', error);

        // Create a structured error response
        const errorResponse = {
            error: 'Failed to fetch products',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            // Only include stack trace in development
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        };

        return NextResponse.json(errorResponse, { status: 500 });
    }
}