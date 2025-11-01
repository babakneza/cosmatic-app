import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
const API_TOKEN = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

interface CreateReviewRequest {
    customer: string;
    product: string;
    rating: number;
    title?: string;
    comment?: string;
    status?: 'draft' | 'published' | 'archived';
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateReviewRequest;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader && !API_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No authentication token provided' },
                { status: 401 }
            );
        }

        const token = authHeader ? authHeader.replace('Bearer ', '') : API_TOKEN;

        const createPayload = {
            customer: body.customer,
            product: body.product,
            rating: body.rating,
            title: body.title || '',
            comment: body.comment || '',
            status: body.status || 'draft',
            is_helpful: {},
        };

        console.log('[Reviews API] Creating review with payload:', {
            customer: body.customer,
            product: body.product,
            rating: body.rating,
            status: body.status || 'draft',
        });

        const response = await axios.post(
            `${DIRECTUS_URL}/items/product_reviews`,
            createPayload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const createdReview = response.data.data;
        if (!createdReview) {
            throw new Error('No review data returned from API');
        }

        console.log('[Reviews API] Successfully created review:', createdReview.id);

        return NextResponse.json(
            { data: createdReview },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('[Reviews API] Error creating review:', error.message);
        if (error.response?.data) {
            console.error('[Reviews API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to create review',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product');
        const status = searchParams.get('status') || 'published';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing product ID' },
                { status: 400 }
            );
        }

        console.log('[Reviews API] Fetching reviews for product:', productId);

        const filterParams = {
            filter: JSON.stringify({
                product: { id: { _eq: productId } },
                status: { _eq: status },
            }),
            limit,
            offset,
            fields: ['id', 'product', 'customer.id', 'customer.user.id', 'customer.user.first_name', 'customer.user.last_name', 'customer.user.email', 'rating', 'title', 'comment', 'status', 'is_helpful', 'verified_purchase', 'created_at', 'updated_at'],
        };

        const response = await axios.get(
            `${DIRECTUS_URL}/items/product_reviews`,
            {
                params: filterParams,
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                },
            }
        );

        const reviews = response.data.data || [];
        const total = response.data.meta?.total_count || 0;

        console.log('[Reviews API] Successfully fetched reviews:', {
            count: reviews.length,
            total,
            firstReview: reviews[0],
        });

        return NextResponse.json({ data: reviews, meta: { total_count: total } });
    } catch (error: any) {
        console.error('[Reviews API] Error fetching reviews:', error.message);
        if (error.response?.data) {
            console.error('[Reviews API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to fetch reviews',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}
