import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, staticToken, readMe, updateMe } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid Authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        console.log('👤 Getting current user info');

        // Create Directus client with the provided token
        const client = createDirectus(DIRECTUS_URL)
            .with(staticToken(token))
            .with(rest());

        // Get current user using SDK
        const user = await client.request(readMe());

        console.log('✅ User info retrieved');

        return NextResponse.json(
            {
                success: true,
                data: {
                    user
                }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('❌ Get user error:', error);

        // Handle Directus errors
        if (error.status === 401 || error.status === 403) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const errorMessage = error.errors?.[0]?.message || error.message || 'Failed to get user information';
        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        console.log('🔄 PATCH /api/auth/me called');

        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization');
        console.log('🔍 Auth header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('⚠️  Missing or invalid Authorization header');
            return NextResponse.json(
                { error: 'Missing or invalid Authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log('✅ Token extracted, length:', token.length);

        // Get the update data from request body
        console.log('📖 Parsing request body...');
        let updateData;
        try {
            updateData = await request.json();
            console.log('✅ Request body parsed:', Object.keys(updateData));
        } catch (parseError: any) {
            console.error('❌ JSON parse error:', parseError.message);
            return NextResponse.json(
                { error: 'Invalid JSON in request body', details: parseError.message },
                { status: 400 }
            );
        }

        // Validate the update data (only allow safe fields)
        const allowedFields = ['first_name', 'last_name', 'phone', 'avatar'];
        const sanitizedData: any = {};

        for (const field of allowedFields) {
            if (field in updateData) {
                sanitizedData[field] = updateData[field];
            }
        }

        console.log('✅ Data sanitized, fields allowed:', Object.keys(sanitizedData));

        if (Object.keys(sanitizedData).length === 0) {
            console.warn('⚠️  No valid fields to update');
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        console.log('👤 Updating user profile:', Object.keys(sanitizedData));
        console.log('📝 Sanitized data:', sanitizedData);

        // Create Directus client with the provided token
        const client = createDirectus(DIRECTUS_URL)
            .with(staticToken(token))
            .with(rest());

        console.log('🔄 Calling updateMe with data:', sanitizedData);

        // Update user profile
        const updatedUser = await client.request(updateMe(sanitizedData));

        console.log('✅ User profile updated successfully');
        console.log('📊 Updated user data:', {
            id: updatedUser?.id,
            email: updatedUser?.email,
            first_name: updatedUser?.first_name,
            last_name: updatedUser?.last_name,
        });

        return NextResponse.json(
            {
                success: true,
                data: updatedUser
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('❌ Update user error caught in catch block');
        console.error('   Message:', error.message);
        console.error('   Status:', error.status);
        console.error('   Has errors array:', !!error.errors);
        if (error.errors) {
            console.error('   First error:', error.errors[0]);
        }
        console.error('   Stack:', error.stack?.substring(0, 500));

        // Handle Directus errors
        if (error.status === 401 || error.status === 403) {
            console.log('🔐 Returning 401 Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized', code: 'AUTH_ERROR' },
                { status: 401 }
            );
        }

        const errorMessage = error.errors?.[0]?.message || error.message || 'Failed to update profile';
        console.log(`📤 Returning ${error.status || 500} with message:`, errorMessage);

        return NextResponse.json(
            {
                error: errorMessage,
                details: error.errors || error.message,
                code: 'PROFILE_UPDATE_ERROR'
            },
            { status: error.status || 500 }
        );
    }
}