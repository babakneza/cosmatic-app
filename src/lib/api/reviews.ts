/**
 * Product Reviews API
 * Handles product reviews and ratings
 */

import axios from 'axios';
import { ProductReview, ReviewStatus } from '@/types/collections';

/**
 * Create a new product review
 */
export async function createReview(
    customerId: string,
    productId: string,
    accessToken: string,
    reviewData: {
        rating: number;
        title?: string;
        comment?: string;
    }
): Promise<ProductReview> {
    try {
        const response = await axios.post(
            '/api/reviews',
            {
                customer: customerId,
                product: productId,
                status: 'draft',
                ...reviewData,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Reviews] Created review for product:', productId);
        return response.data.data;
    } catch (error: any) {
        console.error('[Reviews] Failed to create review:', error.message);
        throw error;
    }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
    productId: string,
    filters?: {
        status?: ReviewStatus;
        limit?: number;
        offset?: number;
    }
): Promise<{ data: ProductReview[]; total: number }> {
    try {
        const params = new URLSearchParams();
        params.append('product', productId);

        if (filters?.status) {
            params.append('status', filters.status);
        }
        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        if (filters?.offset) {
            params.append('offset', String(filters.offset));
        }

        const response = await axios.get(
            `/api/reviews?${params.toString()}`
        );

        return {
            data: response.data.data || [],
            total: response.data.meta?.total_count || 0,
        };
    } catch (error: any) {
        console.error('[Reviews] Failed to fetch product reviews:', error.message);
        throw error;
    }
}

/**
 * Get customer's reviews
 */
export async function getCustomerReviews(
    customerId: string,
    accessToken: string,
    filters?: {
        limit?: number;
        offset?: number;
    }
): Promise<{ data: ProductReview[]; total: number }> {
    try {
        const params = new URLSearchParams();
        params.append('customer', customerId);

        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        if (filters?.offset) {
            params.append('offset', String(filters.offset));
        }

        const response = await axios.get(
            `/api/reviews?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        return {
            data: response.data.data || [],
            total: response.data.meta?.total_count || 0,
        };
    } catch (error: any) {
        console.error('[Reviews] Failed to fetch customer reviews:', error.message);
        throw error;
    }
}

/**
 * Get customer's review for a specific product
 */
export async function getCustomerReviewForProduct(
    customerId: string,
    productId: string,
    accessToken: string
): Promise<ProductReview | null> {
    try {
        const params = new URLSearchParams();
        params.append('customer', customerId);
        params.append('product', productId);

        const response = await axios.get(
            `/api/reviews?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const reviews = response.data.data || [];
        return reviews.length > 0 ? reviews[0] : null;
    } catch (error: any) {
        console.error('[Reviews] Failed to fetch customer review:', error.message);
        return null;
    }
}

/**
 * Update a review
 */
export async function updateReview(
    reviewId: string,
    accessToken: string,
    updates: Partial<ProductReview>
): Promise<ProductReview> {
    try {
        const response = await axios.patch(
            `/api/reviews/${reviewId}`,
            updates,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('[Reviews] Updated review:', reviewId);
        return response.data.data;
    } catch (error: any) {
        console.error('[Reviews] Failed to update review:', error.message);
        throw error;
    }
}

/**
 * Delete a review
 */
export async function deleteReview(
    reviewId: string,
    accessToken: string
): Promise<void> {
    try {
        await axios.delete(
            `/api/reviews/${reviewId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        console.log('[Reviews] Deleted review:', reviewId);
    } catch (error: any) {
        console.error('[Reviews] Failed to delete review:', error.message);
        throw error;
    }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(
    reviewId: string,
    accessToken: string,
    helpful: boolean,
    customerId: string
): Promise<ProductReview> {
    try {
        const response = await axios.post(
            `/api/reviews/${reviewId}/helpful`,
            { helpful, customerId },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Reviews] Failed to mark review as helpful:', error.message);
        throw error;
    }
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(productId: string): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}> {
    try {
        const response = await axios.get(
            `/api/products/${productId}/review-stats`
        );

        return response.data.data;
    } catch (error: any) {
        console.error('[Reviews] Failed to fetch review statistics:', error.message);
        throw error;
    }
}
