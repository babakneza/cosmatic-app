import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, authentication, staticToken, readMe } from '@directus/sdk';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refresh_token } = body;

        if (!refresh_token) {
            return NextResponse.json(
                { error: 'refresh_token is required' },
                { status: 400 }
            );
        }

        console.log('🔄 Refreshing token');

        // Method 1: Try using authentication composable refresh (if SDK supports it)
        try {
            console.log('🔑 Attempting refresh with authentication composable...');

            // Create a client with the refresh token as static token
            // and try to use refresh mechanism
            const client = createDirectus(DIRECTUS_URL)
                .with(staticToken(refresh_token))
                .with(rest());

            // Try to refresh the token via the auth endpoint
            // This sends the refresh token to Directus which returns new tokens
            const refreshResult = await axios.post(
                `${DIRECTUS_URL}/auth/refresh`,
                { refresh_token: refresh_token },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Token refreshed successfully');

            const responseData = refreshResult.data.data || refreshResult.data;
            const { access_token, refresh_token: newRefreshToken, expires } = responseData;

            // ⏰ IMPORTANT: Use actual expires value from Directus
            // The actual token TTL is set on the Directus server side
            // Client-side multiplying doesn't extend the real token
            const actualExpires = expires || 3600;

            console.log('🔍 Refresh result data:', {
                hasAccessToken: !!access_token,
                accessTokenLength: access_token?.length || 0,
                hasRefreshToken: !!newRefreshToken,
                refreshTokenLength: newRefreshToken?.length || 0,
                expires: actualExpires,
            });

            if (!access_token) {
                throw new Error('No access token returned from refresh');
            }

            // Fetch user data using the new access token
            let user = null;
            try {
                const userClient = createDirectus(DIRECTUS_URL)
                    .with(staticToken(access_token))
                    .with(rest());

                user = await userClient.request(readMe());
                console.log('✅ User data fetched after refresh:', user?.id);
            } catch (userError: any) {
                console.warn('⚠️ Failed to fetch user data during token refresh:', userError.message);
                // Don't fail the refresh if we can't fetch user data
            }

            return NextResponse.json(
                {
                    success: true,
                    data: {
                        access_token,
                        refresh_token: newRefreshToken,
                        expires: actualExpires,
                        user
                    }
                },
                { status: 200 }
            );

        } catch (refreshError: any) {
            console.error('❌ Refresh attempt failed:', refreshError.message);

            // Check if it's an authentication error
            if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
                return NextResponse.json(
                    { error: 'Invalid or expired refresh token' },
                    { status: 401 }
                );
            }

            const errorMessage = refreshError.response?.data?.error ||
                refreshError.errors?.[0]?.message ||
                refreshError.message ||
                'Token refresh failed';

            console.error('Token refresh error details:', {
                message: errorMessage,
                status: refreshError.response?.status || refreshError.status
            });

            return NextResponse.json(
                { error: errorMessage },
                { status: refreshError.response?.status || refreshError.status || 500 }
            );
        }

    } catch (error: any) {
        console.error('❌ Token refresh endpoint error:', error);

        return NextResponse.json(
            { error: error.message || 'Token refresh failed' },
            { status: 500 }
        );
    }
}