import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/customers/[customerId]/orders
 * Get all orders for a specific customer
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await context.params;

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const status = searchParams.get('status');

        // Get authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Missing authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');

        // Build filter query parameter
        let filterQuery = `{"customer":{"_eq":"${customerId}"}}`;

        if (status) {
            filterQuery = `{"_and":[{"customer":{"_eq":"${customerId}"}},{"status":{"_eq":"${status}"}}]}`;
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        // Build the URL for Directus API
        const url = new URL(`${directusUrl}/items/orders`);
        url.searchParams.append('fields', '*');
        url.searchParams.append('filter', filterQuery);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());
        url.searchParams.append('sort', '-date_created');

        // Fetch from Directus API using admin token
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${process.env.DIRECTUS_API_TOKEN}`,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to fetch orders' }));
            throw new Error(JSON.stringify(error));
        }

        const data = await response.json();
        const orders = data.data || [];
        const orderIds = orders.map((o: any) => o.id);

        // Fetch order items for all orders
        let orderItems: any[] = [];
        if (orderIds.length > 0) {
            const itemsUrl = new URL(`${directusUrl}/items/order_items`);
            itemsUrl.searchParams.append('fields', '*');
            itemsUrl.searchParams.append('filter', `{"order":{"_in":[${orderIds.map((id: string) => `"${id}"`).join(',')}]}}`);
            
            try {
                const itemsResponse = await fetch(itemsUrl.toString(), {
                    headers: {
                        'Authorization': `Bearer ${process.env.DIRECTUS_API_TOKEN}`,
                    },
                });
                
                if (itemsResponse.ok) {
                    const itemsData = await itemsResponse.json();
                    orderItems = itemsData.data || [];
                    console.log('[Orders API] Fetched order items:', orderItems.length);
                }
            } catch (e) {
                console.error('[Orders API] Failed to fetch order items:', e);
            }
        }

        // Transform data to map Directus field names to Order type expectations
        const transformedOrders = orders.map((order: any) => ({
            ...order,
            // Map Directus system fields to expected field names
            created_at: order.date_created,
            // Attach order items - handle both string IDs and expanded objects
            items: orderItems.filter((item: any) => {
                const itemOrderId = typeof item.order === 'object' && item.order !== null ? item.order.id : item.order;
                return itemOrderId === order.id;
            }),
        }));

        return NextResponse.json(
            {
                data: transformedOrders,
                meta: {
                    total_count: data.meta?.total_count || 0,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Orders API] Failed to fetch customer orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
