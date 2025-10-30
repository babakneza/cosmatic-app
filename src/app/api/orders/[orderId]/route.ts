import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders/[orderId]
 * Get a specific order by ID
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;

        // Get authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Missing authorization header' },
                { status: 401 }
            );
        }

        // Extract token from Bearer scheme
        const token = authHeader.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { error: 'Invalid authorization header' },
                { status: 401 }
            );
        }

        // Build Directus URL
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const adminToken = process.env.DIRECTUS_API_TOKEN;

        if (!adminToken) {
            console.error('[Orders API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        const url = new URL(`${directusUrl}/items/orders/${orderId}`);
        // Request all fields (let Directus filter based on permissions)
        // Specific field list causes permission errors with some tokens
        // url.searchParams.append('fields', [...].join(','));

        // Fetch order from Directus using admin token
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid or expired token' },
                { status: 401 }
            );
        }

        if (response.status === 404) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to fetch order' }));
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();

        // Transform data to map Directus field names to Order type expectations
        const order = data.data || data;
        const transformedOrder = {
            ...order,
            // Map Directus system fields to expected field names
            created_at: order.date_created || order.created_at,
            updated_at: order.date_updated || order.updated_at,
        };

        return NextResponse.json(
            {
                data: transformedOrder
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Orders API] Failed to fetch order:', error);

        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}