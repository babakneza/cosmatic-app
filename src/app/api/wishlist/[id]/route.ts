import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
const API_TOKEN = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader && !API_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token provided' },
                { status: 401 }
            );
        }

        const token = authHeader ? authHeader.replace('Bearer ', '') : API_TOKEN;

        if (!id) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Wishlist item ID is required' },
                { status: 400 }
            );
        }

        console.log('[Wishlist API] Deleting wishlist item:', id);

        await axios.delete(
            `${DIRECTUS_URL}/items/wishlist/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        console.log('[Wishlist API] Successfully deleted wishlist item:', id);

        return NextResponse.json(
            { success: true, message: 'Item removed from wishlist' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Wishlist API] Error deleting wishlist item:', error.message);
        if (error.response?.data) {
            console.error('[Wishlist API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to remove from wishlist',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Wishlist item ID is required' },
                { status: 400 }
            );
        }

        console.log('[Wishlist API] Fetching wishlist item:', id);

        const response = await axios.get(
            `${DIRECTUS_URL}/items/wishlist/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                },
            }
        );

        const item = response.data.data;

        console.log('[Wishlist API] Successfully fetched wishlist item:', id);

        return NextResponse.json({ data: item });
    } catch (error: any) {
        console.error('[Wishlist API] Error fetching wishlist item:', error.message);
        if (error.response?.data) {
            console.error('[Wishlist API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to fetch wishlist item',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}
