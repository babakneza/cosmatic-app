import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, readItem, updateItem, deleteItem, staticToken } from '@directus/sdk';

/**
 * GET /api/addresses/[addressId]
 * Get a specific address by ID
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await context.params;

        if (!addressId || addressId === 'NaN' || addressId === 'undefined') {
            console.error('[Address API] Invalid address ID received:', addressId);
            return NextResponse.json(
                { error: 'Address ID is required' },
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
            console.error('[Address API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token (for backend operations)
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Convert addressId to number for database lookup
        const addressIdNum = Number(addressId);

        if (isNaN(addressIdNum)) {
            console.error('[Address API] Invalid address ID (not a number):', addressId);
            return NextResponse.json(
                { error: 'Invalid address ID format' },
                { status: 400 }
            );
        }

        console.log('[Address API GET] Fetching address with ID:', addressIdNum);

        // Get the specific address by ID with expanded country relationship
        const address = await client.request(
            readItem('customer_addresses', addressIdNum, {
                deep: { countries: {} }  // Expand countries relationship with all fields
            })
        );

        if (!address) {
            console.error('[Address API] Address not found:', addressIdNum);
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        console.log('[Address API] Successfully fetched address:', addressIdNum);

        return NextResponse.json(
            { data: address },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Address API] Failed to fetch address:', error.message);

        // Check for 404 - address not found
        if (error.response?.status === 404 || error.status === 404) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        // Check for permission errors
        if (error.response?.status === 403 || error.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied: Cannot access address data' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch address' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/addresses/[addressId]
 * Update a specific address
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await context.params;

        if (!addressId || addressId === 'NaN' || addressId === 'undefined') {
            console.error('[Address API] Invalid address ID received:', addressId);
            return NextResponse.json(
                { error: 'Address ID is required' },
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

        // Parse the request body
        const updates = await request.json();

        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No updates provided' },
                { status: 400 }
            );
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const adminToken = process.env.DIRECTUS_API_TOKEN;

        if (!adminToken) {
            console.error('[Address API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Convert addressId to number
        const addressIdNum = Number(addressId);

        if (isNaN(addressIdNum)) {
            console.error('[Address API] Invalid address ID (not a number):', addressId);
            return NextResponse.json(
                { error: 'Invalid address ID format' },
                { status: 400 }
            );
        }

        console.log('[Address API PATCH] Updating address with ID:', addressIdNum, 'Updates:', updates);

        // Prepare updates - convert country to number and rename to 'countries' if it's a string
        const preparedUpdates = { ...updates };

        // Handle country field mapping and conversion
        if (preparedUpdates.country !== undefined) {
            const countryValue = preparedUpdates.country;
            if (countryValue && typeof countryValue === 'string') {
                const countryNum = Number(countryValue);
                if (!isNaN(countryNum)) {
                    preparedUpdates.countries = countryNum;
                    delete preparedUpdates.country; // Remove the 'country' field, use 'countries' instead
                    console.log('[Address API PATCH] Converted country to number and mapped to countries field:', countryNum);
                }
            } else if (countryValue && typeof countryValue === 'number') {
                preparedUpdates.countries = countryValue;
                delete preparedUpdates.country;
                console.log('[Address API PATCH] Mapped country number to countries field:', countryValue);
            }
        }

        // Update the address and return with expanded country relationship
        const updatedAddress = await client.request(
            updateItem('customer_addresses', addressIdNum, {
                ...preparedUpdates,
                _meta: 'true' // Request metadata in response
            })
        );

        // Fetch the updated address with expanded country to return complete data
        const addressWithCountry = await client.request(
            readItem('customer_addresses', addressIdNum, {
                deep: { countries: {} }  // Expand countries relationship with all fields
            })
        );

        console.log('[Address API PATCH] Successfully updated address:', addressIdNum);

        return NextResponse.json(
            { data: addressWithCountry },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Address API PATCH] Failed to update address:', error.message);

        // Check for 404 - address not found
        if (error.response?.status === 404 || error.status === 404) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        // Check for permission errors
        if (error.response?.status === 403 || error.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied: Cannot update address' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update address' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/addresses/[addressId]
 * Delete a specific address
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await context.params;

        if (!addressId || addressId === 'NaN' || addressId === 'undefined') {
            console.error('[Address API] Invalid address ID received:', addressId);
            return NextResponse.json(
                { error: 'Address ID is required' },
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
            console.error('[Address API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Convert addressId to number
        const addressIdNum = Number(addressId);

        if (isNaN(addressIdNum)) {
            console.error('[Address API] Invalid address ID (not a number):', addressId);
            return NextResponse.json(
                { error: 'Invalid address ID format' },
                { status: 400 }
            );
        }

        console.log('[Address API DELETE] Deleting address with ID:', addressIdNum);

        // Delete the address
        await client.request(
            deleteItem('customer_addresses', addressIdNum)
        );

        console.log('[Address API DELETE] Successfully deleted address:', addressIdNum);

        return NextResponse.json(
            { message: 'Address deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Address API DELETE] Failed to delete address:', error.message);

        // Check for 404 - address not found
        if (error.response?.status === 404 || error.status === 404) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        // Check for permission errors
        if (error.response?.status === 403 || error.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied: Cannot delete address' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete address' },
            { status: 500 }
        );
    }
}