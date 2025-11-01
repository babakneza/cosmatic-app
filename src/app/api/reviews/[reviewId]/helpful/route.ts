import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
const API_TOKEN = process.env.DIRECTUS_API_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) {
    try {
        const { reviewId } = await params;
        const { helpful, customerId } = await request.json();

        if (!API_TOKEN) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No API token configured' },
                { status: 401 }
            );
        }

        if (!customerId) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Customer ID is required' },
                { status: 400 }
            );
        }

        console.log('[Reviews API] Marking review as helpful:', reviewId, helpful, 'by customer:', customerId);

        // First, fetch the current review to get its is_helpful data
        const getResponse = await axios.get(
            `${DIRECTUS_URL}/items/product_reviews/${reviewId}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                },
            }
        );

        const currentReview = getResponse.data.data;
        const currentIsHelpful = currentReview?.is_helpful || {};
        
        // Get or initialize the customers array
        const customers = currentIsHelpful.customers ? [...currentIsHelpful.customers] : [];
        
        if (helpful === true) {
            // Add customer to list if not already there
            if (!customers.includes(customerId)) {
                customers.push(customerId);
            }
        } else {
            // Remove customer from list
            const index = customers.indexOf(customerId);
            if (index > -1) {
                customers.splice(index, 1);
            }
        }

        const updatePayload = {
            is_helpful: {
                customers: customers,
                count: customers.length,
            },
        };

        const response = await axios.patch(
            `${DIRECTUS_URL}/items/product_reviews/${reviewId}`,
            updatePayload,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const updatedReview = response.data.data;
        if (!updatedReview) {
            throw new Error('No review data returned from API');
        }

        console.log('[Reviews API] Successfully marked review as helpful:', reviewId);

        return NextResponse.json({ data: updatedReview });
    } catch (error: any) {
        console.error('[Reviews API] Error marking review as helpful:', error.message);
        if (error.response?.data) {
            console.error('[Reviews API] Response data:', error.response.data);
        }
        return NextResponse.json(
            {
                error: 'Failed to mark review as helpful',
                message: error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}
