import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, updateMe, staticToken, readMe, updateUser } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
const ADMIN_TOKEN = process.env.DIRECTUS_API_TOKEN;

export async function PATCH(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid Authorization header' },
                { status: 401 }
            );
        }

        const user_token = authHeader.slice(7); // Remove 'Bearer ' prefix

        // Parse request body
        const body = await request.json();
        const { first_name, last_name } = body;

        // Validate input
        if (!first_name && !last_name) {
            return NextResponse.json(
                { error: 'At least first_name or last_name is required' },
                { status: 400 }
            );
        }

        // Validate that they're not empty strings
        if ((first_name !== undefined && first_name.toString().trim() === '') ||
            (last_name !== undefined && last_name.toString().trim() === '')) {
            return NextResponse.json(
                { error: 'first_name and last_name cannot be empty' },
                { status: 400 }
            );
        }

        console.log('👤 Updating user profile...');
        console.log('User token preview:', user_token.substring(0, 10) + '...');

        // Prepare update data - only include fields that are provided
        const updateData: any = {};
        if (first_name !== undefined) {
            updateData.first_name = first_name.toString().trim();
        }
        if (last_name !== undefined) {
            updateData.last_name = last_name.toString().trim();
        }

        let updatedUser: any = null;
        let updateError: any = null;

        // Step 1: Try with user token first
        console.log('🔄 Attempt 1: Trying with user token...');
        try {
            const userClient = createDirectus(DIRECTUS_URL)
                .with(staticToken(user_token))
                .with(rest());

            updatedUser = await userClient.request(updateMe(updateData));
            console.log('✅ User profile updated with user token');
        } catch (userTokenError: any) {
            console.warn('⚠️ User token update failed:', userTokenError.message);
            updateError = userTokenError;

            // Step 2: If user token fails, get user ID and use admin token with direct update
            if (ADMIN_TOKEN && (userTokenError.status === 403 || userTokenError.message?.includes('permission'))) {
                console.log('🔄 Attempt 2: Trying with admin token to get user ID and update directly...');
                try {
                    // Get current user info with user token to find their ID
                    const userInfoClient = createDirectus(DIRECTUS_URL)
                        .with(staticToken(user_token))
                        .with(rest());

                    const currentUser = await userInfoClient.request(readMe());
                    const userId = currentUser?.id;

                    if (!userId) {
                        throw new Error('Could not determine user ID');
                    }

                    console.log(`📝 Found user ID: ${userId}`);

                    // Now update using admin token with direct collection update
                    const adminClient = createDirectus(DIRECTUS_URL)
                        .with(staticToken(ADMIN_TOKEN))
                        .with(rest());

                    // Use updateUser to update the specific user record directly
                    const updateResponse = await adminClient.request(
                        updateUser(userId, updateData)
                    );

                    updatedUser = updateResponse;
                    console.log('✅ User profile updated with admin token');
                } catch (adminTokenError: any) {
                    console.error('❌ Admin token update also failed:', adminTokenError.message);
                    throw adminTokenError;
                }
            } else {
                throw updateError;
            }
        }

        console.log('✅ User profile updated successfully');

        return NextResponse.json(
            {
                success: true,
                data: updatedUser
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('❌ Error updating user profile:', error);

        // Handle Directus errors
        if (error.status === 401 || error.status === 403) {
            const errorMsg = error.errors?.[0]?.message || error.message || 'Permission denied or token expired';
            return NextResponse.json(
                { error: errorMsg },
                { status: 401 }
            );
        }

        if (error.status === 400) {
            const errorMessage = error.errors?.[0]?.message || 'Invalid request data';
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            );
        }

        const errorMessage = error.errors?.[0]?.message || error.message || 'Failed to update profile';
        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}