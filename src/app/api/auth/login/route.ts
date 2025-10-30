import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, authentication, readMe } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        console.log(`🔐 Login attempt for: ${email}`);

        // Create Directus client with authentication() composable for automatic token management
        const client = createDirectus(DIRECTUS_URL)
            .with(authentication('json', {
                credentials: 'include', // Include cookies if needed
                autoRefresh: true, // Enable automatic token refresh
            }))
            .with(rest());

        console.log('🔑 Attempting login with authentication composable...');

        // Login via Directus SDK with authentication composable
        // Must pass credentials as an object when using authentication composable
        const loginResult = await client.login({
            email,
            password
        });

        console.log('✅ Login successful with authentication composable');
        console.log('🔍 loginResult keys:', Object.keys(loginResult));
        console.log('🔍 loginResult data:', {
            hasAccessToken: !!loginResult.access_token,
            accessTokenLength: loginResult.access_token?.length || 0,
            hasRefreshToken: !!loginResult.refresh_token,
            refreshTokenLength: loginResult.refresh_token?.length || 0,
            hasExpires: !!loginResult.expires,
            expires: loginResult.expires,
            allKeys: Object.keys(loginResult || {}).join(', ')
        });

        const { access_token, refresh_token, expires } = loginResult;

        if (!access_token) {
            throw new Error('No access token returned from Directus');
        }

        // ⏰ IMPORTANT: DO NOT multiply expires here - it doesn't actually extend the Directus token
        // The actual token TTL is set on the Directus server side
        // We'll handle short tokens with more frequent refreshes instead
        // Just use the expires value as-is for accurate client-side tracking
        const actualExpires = expires || 3600;

        // Fetch user data using the client which now has auth tokens
        let user = null;
        try {
            user = await client.request(readMe());
            console.log('✅ User data fetched:', user?.id);
        } catch (userError: any) {
            console.warn('⚠️ Failed to fetch user data during login:', userError.message);
            // Don't fail the login if we can't fetch user data - user can be fetched later
        }

        console.log('📤 Returning login response with:', {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token,
            expires: actualExpires,
            hasUser: !!user
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    access_token,
                    refresh_token: refresh_token || null,
                    expires: actualExpires,
                    user
                }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('❌ Login error:', error);

        // Handle Directus errors
        if (error.status === 401 || error.status === 403 || error.message?.includes('Invalid credentials')) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const errorMessage = error.errors?.[0]?.message || error.message || 'Login failed';
        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}