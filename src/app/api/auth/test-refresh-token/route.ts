import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, authentication } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

/**
 * Test endpoint to verify that Directus returns refresh_token
 * This helps diagnose if the authentication composable is working correctly
 * 
 * TEST CREDENTIALS (update with actual test user):
 * POST /api/auth/test-refresh-token
 * {
 *   "email": "test@example.com",
 *   "password": "testPassword123!"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({
                error: 'Email and password are required',
                testing: true
            }, { status: 400 });
        }

        console.log('🧪 Testing refresh token generation with authentication composable');

        // Test 1: Try with authentication() composable (NEW APPROACH)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: Using authentication() composable');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            const authClient = createDirectus(DIRECTUS_URL)
                .with(authentication('json', {
                    credentials: 'include',
                    autoRefresh: true,
                }))
                .with(rest());

            // Must pass credentials as an object when using authentication composable
            const authLoginResult = await authClient.login({
                email,
                password
            });

            console.log('✅ Auth composable login result:');
            console.log('   Keys:', Object.keys(authLoginResult));
            console.log('   Has access_token:', !!authLoginResult.access_token);
            console.log('   Has refresh_token:', !!authLoginResult.refresh_token);
            console.log('   Access token length:', authLoginResult.access_token?.length || 0);
            console.log('   Refresh token length:', authLoginResult.refresh_token?.length || 0);
            console.log('   Expires:', authLoginResult.expires);

            // Test 2: Try with custom storage for debugging
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('TEST 2: Checking client state after login');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Try to access client state
            const state = (authClient as any).state;
            if (state) {
                console.log('✅ Client state available:');
                console.log('   Has access_token in state:', !!state.access_token);
                console.log('   Has refresh_token in state:', !!state.refresh_token);
                console.log('   State keys:', Object.keys(state));
            }

            return NextResponse.json({
                success: true,
                testing: true,
                test1_authentication_composable: {
                    success: true,
                    keys: Object.keys(authLoginResult),
                    has_access_token: !!authLoginResult.access_token,
                    has_refresh_token: !!authLoginResult.refresh_token,
                    access_token_length: authLoginResult.access_token?.length || 0,
                    refresh_token_length: authLoginResult.refresh_token?.length || 0,
                    expires: authLoginResult.expires,
                    full_response: {
                        access_token: authLoginResult.access_token ? `${authLoginResult.access_token.substring(0, 20)}...` : null,
                        refresh_token: authLoginResult.refresh_token ? `${authLoginResult.refresh_token.substring(0, 20)}...` : null,
                        expires: authLoginResult.expires,
                    }
                },
                message: 'Authentication composable test completed. Check logs for details.'
            }, { status: 200 });

        } catch (authError: any) {
            console.error('❌ Authentication composable error:', authError);
            return NextResponse.json({
                success: false,
                testing: true,
                error: authError.message,
                errorType: authError.constructor.name,
                details: {
                    message: authError.message,
                    status: authError.status,
                }
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('❌ Test endpoint error:', error);
        return NextResponse.json({
            success: false,
            testing: true,
            error: error.message,
            errorType: error.constructor.name
        }, { status: 500 });
    }
}