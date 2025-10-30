import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, readItems, readItem, createItem, staticToken } from '@directus/sdk';

/**
 * GET /api/customers/[customerId]/addresses
 * Get all addresses for a specific customer
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await context.params;

        if (!customerId || customerId === 'NaN' || customerId === 'undefined') {
            console.error('[Addresses API] Invalid customer ID received:', customerId);
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
            console.error('[Addresses API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token (for backend operations)
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Validate that customerId is a valid value
        console.log('[Addresses API GET] Received customerId:', {
            value: customerId,
            type: typeof customerId,
            isNaN: isNaN(Number(customerId)),
            isValid: !isNaN(Number(customerId)) && customerId !== 'NaN'
        });

        // Convert customerId to number for comparison with database numeric ID
        const customerIdNum = Number(customerId);

        if (isNaN(customerIdNum)) {
            console.error('[Addresses API] Invalid customer ID (not a number):', customerId);
            return NextResponse.json(
                { error: 'Invalid customer ID format' },
                { status: 400 }
            );
        }

        console.log('[Addresses API GET] Querying with converted customerId:', {
            original: customerId,
            converted: customerIdNum,
            type: typeof customerIdNum,
        });

        // Query customer addresses filtered by customer ID with expanded country relationship
        const addresses = await client.request(
            readItems('customer_addresses', {
                filter: {
                    customer: { _eq: customerIdNum }
                },
                limit: -1,  // Fetch all addresses for this customer
                deep: { countries: {} }  // Expand countries relationship with all fields
            })
        );

        console.log('[Addresses API] Fetched addresses for customer:', customerIdNum, 'Count:', addresses?.length || 0);

        return NextResponse.json(
            { data: addresses || [] },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Addresses API] Failed to fetch customer addresses:', error.message);

        // Check for permission errors
        if (error.response?.status === 403) {
            return NextResponse.json(
                { error: 'Permission denied: Cannot access address data' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/customers/[customerId]/addresses
 * Create a new address for a customer
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ customerId: string }> }
) {
    let body: Record<string, any> = {};
    let addressPayload: Record<string, any> = {};

    try {
        const { customerId } = await context.params;

        if (!customerId || customerId === 'NaN' || customerId === 'undefined') {
            console.error('[Addresses API] Invalid customer ID received in POST:', customerId);
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

        body = await request.json();
        console.log('[Addresses API] Received request body:', body);
        console.log('[Addresses API] Customer ID:', customerId);

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        const adminToken = process.env.DIRECTUS_API_TOKEN;

        if (!adminToken) {
            console.error('[Addresses API] Missing DIRECTUS_API_TOKEN');
            return NextResponse.json(
                { error: 'Server misconfiguration' },
                { status: 500 }
            );
        }

        // Create Directus client with admin token (for backend operations)
        const client = createDirectus(directusUrl)
            .with(staticToken(adminToken))
            .with(rest());

        // Convert customerId to number and verify the customer record exists
        console.log('[Addresses API] Verifying customer exists with ID:', customerId);
        let customerRecordId: string | number;

        try {
            // Parse customerId as number
            const customerIdNum = Number(customerId);
            if (isNaN(customerIdNum)) {
                console.error('[Addresses API] Invalid customer ID (not a number):', customerId);
                return NextResponse.json(
                    { error: 'Invalid customer ID format' },
                    { status: 400 }
                );
            }

            // Verify the customer record exists with this ID
            const customerRecord = await client.request(
                readItems('customers', {
                    filter: { id: { _eq: customerIdNum } },
                    limit: 1,
                    fields: ['id']
                })
            );

            if (!customerRecord || customerRecord.length === 0) {
                console.error('[Addresses API] Customer record not found for ID:', customerIdNum);
                return NextResponse.json(
                    { error: 'Customer record not found. Please ensure you are logged in.' },
                    { status: 404 }
                );
            }

            customerRecordId = customerIdNum;
            console.log('[Addresses API] Customer verified. Customer record ID:', customerRecordId, 'Type:', typeof customerRecordId);
        } catch (verifyError: any) {
            console.error('[Addresses API] Failed to verify customer:', {
                customerId,
                message: verifyError.message,
            });
            // If we can't verify, fail the request
            return NextResponse.json(
                { error: 'Failed to verify customer. Please try again.' },
                { status: 500 }
            );
        }

        // Define valid address fields according to the schema
        const validFields = [
            'type', 'first_name', 'last_name', 'company', 'phone_number',
            'address_line_1', 'address_line_2', 'city', 'state',
            'postal_code', 'country', 'countries', 'is_default'
        ];

        // Filter body to only include valid fields
        const filteredBody: Record<string, any> = {};
        for (const field of validFields) {
            if (field in body) {
                filteredBody[field] = body[field];
            }
        }

        // Check for any unexpected fields
        const bodyFields = Object.keys(body);
        const unexpectedFields = bodyFields.filter(f => !validFields.includes(f) && f !== 'customer');
        if (unexpectedFields.length > 0) {
            console.warn('[Addresses API] Unexpected fields in request body:', unexpectedFields);
        }

        // Validate required fields (using 'countries' instead of 'country')
        const requiredFields = ['first_name', 'last_name', 'address_line_1', 'city', 'postal_code', 'countries'];
        const missingFields = requiredFields.filter(f => !filteredBody[f]);

        if (missingFields.length > 0) {
            console.error('[Addresses API] Missing required fields:', missingFields);
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Build the address object to send to Directus
        // Use the customer RECORD ID (numeric), not the user UUID
        addressPayload = {
            customer: customerRecordId,
            ...filteredBody,
        };

        console.log('[Addresses API] Filtered payload to send to Directus:', JSON.stringify(addressPayload));
        console.log('[Addresses API] Original body fields:', Object.keys(body));
        console.log('[Addresses API] Valid fields used:', Object.keys(filteredBody));

        // Create the address in Directus
        let newAddress;
        try {
            console.log('[Addresses API] Attempting to create item with payload:', JSON.stringify(addressPayload));
            console.log('[Addresses API] Country field type:', typeof addressPayload.country, 'Value:', addressPayload.country);

            // Convert country to number and map to 'countries' field
            if (addressPayload.country !== undefined) {
                const countryValue = addressPayload.country;
                if (countryValue && typeof countryValue === 'string') {
                    const countryNum = Number(countryValue);
                    if (!isNaN(countryNum)) {
                        addressPayload.countries = countryNum;
                        delete addressPayload.country; // Use 'countries' field instead of 'country'
                        console.log('[Addresses API] Converted country to number and mapped to countries field:', countryNum);
                    }
                } else if (countryValue && typeof countryValue === 'number') {
                    addressPayload.countries = countryValue;
                    delete addressPayload.country;
                    console.log('[Addresses API] Mapped country number to countries field:', countryValue);
                }
            }

            newAddress = await client.request(
                createItem('customer_addresses', addressPayload)
            );
            console.log('[Addresses API] Successfully created address:', newAddress?.id);
        } catch (directusError: any) {
            console.error('[Addresses API] Directus createItem failed:', {
                message: directusError.message,
                status: directusError.status,
                response_status: directusError.response?.status,
                response_data: directusError.response?.data,
                errors: directusError.errors,
                directusError: JSON.stringify(directusError),
            });
            throw directusError;
        }

        console.log('[Addresses API] Created customer address:', newAddress?.id);

        // Fetch the created address with expanded country relationship
        let addressWithCountry = newAddress;
        try {
            addressWithCountry = await client.request(
                readItem('customer_addresses', newAddress.id, {
                    deep: { countries: {} }  // Expand countries relationship with all fields
                })
            );
            console.log('[Addresses API] Fetched created address with expanded country:', addressWithCountry?.id);
        } catch (expandError: any) {
            console.error('[Addresses API] Failed to expand country on created address:', expandError.message);
            // Continue with the non-expanded address
        }

        return NextResponse.json(
            { data: addressWithCountry },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('[Addresses API] Failed to create address:', error.message);
        console.error('[Addresses API] Full error:', {
            message: error.message,
            status: error.status,
            response_status: error.response?.status,
            response_statusText: error.response?.statusText,
            response_data: error.response?.data,
            errors: error.errors,
            errors_array: error.response?.data?.errors,
            originalError: error.toString(),
        });
        console.error('[Addresses API] Error object keys:', Object.keys(error));
        console.error('[Addresses API] Request body was:', body);
        console.error('[Addresses API] Payload being sent to Directus:', addressPayload);

        // Extract Directus error message
        let directusErrorMsg = error.message;

        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            directusErrorMsg = error.response.data.errors.map((e: any) =>
                e.message || JSON.stringify(e)
            ).join('; ');
        } else if (error.response?.data?.error) {
            directusErrorMsg = error.response.data.error;
        } else if (error.response?.data?.message) {
            directusErrorMsg = error.response.data.message;
        } else if (error.errors) {
            directusErrorMsg = JSON.stringify(error.errors);
        }

        // Check for permission errors
        if (error.response?.status === 403 || error.status === 403) {
            console.error('[Addresses API] Permission denied');
            return NextResponse.json(
                { error: 'Permission denied: Cannot create address. Verify API token has CREATE permission on customer_addresses collection.' },
                { status: 403 }
            );
        }

        // Check for validation errors (foreign key constraint, missing required fields, etc.)
        if (error.response?.status === 400 || error.status === 400) {
            console.error('[Addresses API] Validation/constraint error');
            return NextResponse.json(
                { error: `Validation error: ${directusErrorMsg}. This might be due to: invalid customer ID, missing required fields, or database constraint violation.` },
                { status: 400 }
            );
        }

        // Check for 404 - might indicate collection doesn't exist
        if (error.response?.status === 404 || error.status === 404) {
            console.error('[Addresses API] Not found - collection might not exist');
            return NextResponse.json(
                { error: `Collection or resource not found. Verify 'customer_addresses' collection exists in Directus.` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: `Failed to create address: ${directusErrorMsg}` },
            { status: 500 }
        );
    }
}