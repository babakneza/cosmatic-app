import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, createItem, readItems, staticToken } from '@directus/sdk';

/**
 * POST /api/customers
 * Create a new customer profile for a logged-in user
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Missing authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { error: 'Invalid authorization header' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { user, phone, date_of_birth, loyalty_points = 0 } = body;

        if (!user) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const adminToken = process.env.DIRECTUS_API_TOKEN;

        if (!adminToken) {
            console.error('[Customers API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token (for backend operations)
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Create the customer record in Directus
        const newCustomer = await client.request(
            createItem('customers', {
                user,
                phone,
                date_of_birth,
                loyalty_points,
            })
        );

        console.log('[Customers API] Created customer profile:', newCustomer?.id);

        return NextResponse.json(
            { data: newCustomer },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('[Customers API] Failed to create customer profile:', error.message);

        // Check for permission errors
        if (error.response?.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied: Cannot create customer profile' },
                { status: 403 }
            );
        }

        // Check for validation errors
        if (error.response?.status === 400) {
            return NextResponse.json(
                { error: error.response?.data?.errors?.[0]?.message || 'Invalid request data' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create customer profile' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/customers
 * Get all customers (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Missing authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { error: 'Invalid authorization header' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const adminToken = process.env.DIRECTUS_API_TOKEN;

        if (!adminToken) {
            console.error('[Customers API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token (for backend operations)
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Fetch customers from Directus
        const customers = await client.request(
            readItems('customers', {
                limit,
                offset,
                sort: ['-created_at']
            })
        );

        console.log('[Customers API] Fetched customers, count:', customers?.length || 0);

        return NextResponse.json(
            {
                data: customers || [],
                meta: {
                    total_count: customers?.length || 0,
                    limit,
                    offset
                }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Customers API] Failed to fetch customers:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}