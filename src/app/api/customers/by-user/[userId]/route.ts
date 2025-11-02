import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';

/**
 * GET /api/customers/by-user/[userId]
 * Get customer profile by user ID
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
    const adminToken = process.env.DIRECTUS_API_TOKEN;

    try {
        const { userId } = await context.params;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

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

        // Query customers filtered by user ID
        const customers = await client.request(
            readItems('customers', {
                filter: {
                    user: { _eq: userId }
                },
                limit: 1
            })
        );

        if (!customers || customers.length === 0) {
            console.log('[Customers API] Customer profile not found for user:', userId);
            return NextResponse.json(
                { data: null },
                { status: 404 }
            );
        }

        console.log('[Customers API] Fetched customer profile for user:', userId);

        return NextResponse.json(
            { data: customers[0] },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Customers API] Failed to fetch customer by user ID:', error.message);
        console.error('[Customers API] Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            hasToken: !!adminToken
        });

        // Check for permission errors
        if (error.response?.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied: Cannot access customer data' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch customer profile', details: error.message },
            { status: 500 }
        );
    }
}