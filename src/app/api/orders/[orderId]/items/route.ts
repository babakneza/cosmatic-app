import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders/[orderId]/items
 * Get order items for a specific order
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const adminToken = process.env.DIRECTUS_API_TOKEN;

        if (!adminToken) {
            console.error('[Orders API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Fetch order items for this order
        const url = new URL(`${directusUrl}/items/order_items`);
        url.searchParams.append('filter', JSON.stringify({ order: { _eq: orderId } }));

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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Orders API] Directus error fetching items:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fetch order items' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json(
            {
                data: data.data || []
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Orders API] Failed to fetch order items:', error);

        return NextResponse.json(
            { error: 'Failed to fetch order items' },
            { status: 500 }
        );
    }
}
