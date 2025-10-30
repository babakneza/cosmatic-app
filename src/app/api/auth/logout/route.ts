import { NextRequest, NextResponse } from 'next/server';
import { createDirectus, rest, staticToken, logout } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refresh_token } = body;

        console.log('🚪 Logout request');

        if (refresh_token) {
            try {
                // Create Directus client
                const client = createDirectus(DIRECTUS_URL)
                    .with(staticToken(refresh_token))
                    .with(rest());

                // Logout via Directus SDK
                await client.request(logout());

                console.log('✅ Logout successful');
                return NextResponse.json(
                    { success: true, message: 'Logged out successfully' },
                    { status: 200 }
                );
            } catch (error: any) {
                console.warn('⚠️ Server logout failed (non-fatal):', error.message);
                // Continue with client-side logout
            }
        }

        // Even if Directus logout fails, clear client-side
        console.log('✅ Logout complete (client-side)');
        return NextResponse.json(
            { success: true, message: 'Logged out successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Don't fail logout - always succeed for client-side cleanup
        return NextResponse.json(
            { success: true, message: 'Logged out successfully' },
            { status: 200 }
        );
    }
}