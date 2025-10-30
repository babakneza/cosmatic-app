import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, registerUser, authentication, readMe } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, first_name, last_name, password_confirm } = body;

        // Validate input
        if (!email || !password || !first_name) {
            return NextResponse.json(
                { error: 'Email, password, and first_name are required' },
                { status: 400 }
            );
        }

        // Validate password match
        if (password !== password_confirm) {
            return NextResponse.json(
                { error: 'Passwords do not match' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        console.log(`📝 Registering user: ${email}`);

        // Create Directus client for registration
        const registrationClient = createDirectus(DIRECTUS_URL).with(rest());

        // Register user using Directus SDK
        const registrationResult = await registrationClient.request(
            registerUser(email, password, {
                first_name,
                last_name
            })
        );

        console.log('✅ User registered successfully');

        // Try to login immediately (may fail if email verification is required)
        let loginResult = null;
        let tokens = null;
        let fullUser = null;

        try {
            console.log('🔐 Attempting to login user:', email);

            // Create a new client with authentication composable for login
            const loginClient = createDirectus(DIRECTUS_URL)
                .with(authentication('json', {
                    credentials: 'include',
                    autoRefresh: true,
                }))
                .with(rest());

            // Login via Directus SDK with authentication composable
            // Must pass credentials as an object when using authentication composable
            loginResult = await loginClient.login({
                email,
                password
            });
            console.log('✅ Login successful with authentication composable, tokens issued');
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

            // ⏰ EXTENDED TOKEN EXPIRATION: Multiply by 5 for longer session duration
            // Default: ~3600 seconds (1 hour) → Extended: ~18000 seconds (5 hours)
            const extendedExpires = expires ? Math.ceil(expires * 5) : 18000;
            tokens = { access_token, refresh_token, expires: extendedExpires };

            // Fetch full user data with the authenticated client
            try {
                fullUser = await loginClient.request(readMe());
                console.log('✅ User data fetched:', fullUser?.id);
            } catch (userError: any) {
                console.warn('⚠️ Failed to fetch user data after registration:', userError.message);
                // Use the basic user data we have
            }
        } catch (loginError) {
            console.log('⚠️  Auto-login after registration failed:', (loginError as any).message);
            console.log('   User may need to verify email or login separately');
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    ...(tokens && {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        expires: tokens.expires
                    }),
                    user: fullUser || {
                        email,
                        first_name,
                        last_name: last_name || ''
                    },
                    requires_verification: !tokens
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('❌ Registration error:', error);

        // Handle specific Directus errors
        if (error.errors && Array.isArray(error.errors)) {
            const errorMessage = error.errors[0]?.message || 'Registration failed';

            // Check if user already exists
            if (errorMessage.includes('unique') || errorMessage.includes('already exists')) {
                return NextResponse.json(
                    { error: 'Email already registered' },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Internal server error during registration' },
            { status: 500 }
        );
    }
}