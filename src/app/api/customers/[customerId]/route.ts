import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, updateItem, readItem, staticToken } from '@directus/sdk';

/**
 * GET /api/customers/[customerId]
 * Get a specific customer by ID
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await context.params;

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
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

        // Fetch the customer
        const customer = await client.request(readItem('customers', customerId));

        console.log('[Customers API] Fetched customer:', customerId);

        return NextResponse.json(
            { data: customer },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Customers API] Failed to fetch customer:', error.message);

        if (error.response?.status === 404) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        if (error.response?.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/customers/[customerId]
 * Update customer profile (including default addresses)
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await context.params;

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
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

        const body = await request.json();

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

        // Update the customer
        const updatedCustomer = await client.request(
            updateItem('customers', customerId, body)
        );

        console.log('[Customers API] Updated customer:', customerId);

        return NextResponse.json(
            { data: updatedCustomer },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Customers API] Failed to update customer:', error.message);

        if (error.response?.status === 404) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        if (error.response?.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied' },
                { status: 403 }
            );
        }

        if (error.response?.status === 400) {
            return NextResponse.json(
                { error: error.response?.data?.errors?.[0]?.message || 'Invalid request data' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}