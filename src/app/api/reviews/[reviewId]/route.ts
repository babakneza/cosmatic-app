import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
const API_TOKEN = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        const { reviewId } = await params;
        const body = await request.json();
        const authHeader = request.headers.get('Authorization');

        if (!authHeader && !API_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token provided' },
                { status: 401 }
            );
        }

        const token = authHeader ? authHeader.replace('Bearer ', '') : API_TOKEN;

        console.log('[Reviews API] Updating review:', reviewId);

        const response = await axios.patch(
            `${DIRECTUS_URL}/items/product_reviews/${reviewId}`,
            body,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const updatedReview = response.data.data;
        if (!updatedReview) {
            throw new Error('No review data returned from API');
        }

        console.log('[Reviews API] Successfully updated review:', reviewId);

        return NextResponse.json({ data: updatedReview });
    } catch (error: any) {
        console.error('[Reviews API] Error updating review:', error.message);
        if (error.response?.data) {
            console.error('[Reviews API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to update review',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        const { reviewId } = await params;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader && !API_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token provided' },
                { status: 401 }
            );
        }

        const token = authHeader ? authHeader.replace('Bearer ', '') : API_TOKEN;

        console.log('[Reviews API] Deleting review:', reviewId);

        const response = await axios.delete(
            `${DIRECTUS_URL}/items/product_reviews/${reviewId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        console.log('[Reviews API] Successfully deleted review:', reviewId);

        return NextResponse.json({ data: { success: true } });
    } catch (error: any) {
        console.error('[Reviews API] Error deleting review:', error.message);
        if (error.response?.data) {
            console.error('[Reviews API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to delete review',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}
