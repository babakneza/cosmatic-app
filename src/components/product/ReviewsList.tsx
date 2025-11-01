'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, ThumbsUp } from 'lucide-react';
import { cn, isRTL } from '@/lib/utils';
import { getProductReviews, markReviewHelpful } from '@/lib/api/reviews';
import { ProductReview } from '@/types/collections';
import { useAuth } from '@/store/auth';
import { Locale } from '@/types';

interface ReviewsListProps {
    productId: string;
    locale: Locale;
    refreshTrigger?: number;
    onReviewCountChange?: (count: number) => void;
}

export default function ReviewsList({ productId, locale, refreshTrigger, onReviewCountChange }: ReviewsListProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const { access_token, customer_id } = useAuth();

    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProductReviews(productId, {
                    status: 'published',
                    limit: 50,
                });
                console.log('[ReviewsList] Fetched reviews:', response.data);
                setReviews(response.data || []);
                if (onReviewCountChange) {
                    onReviewCountChange((response.data || []).length);
                }
            } catch (err: any) {
                console.error('[ReviewsList] Failed to fetch reviews:', err);
                setError('Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId, refreshTrigger, onReviewCountChange]);

    const isReviewHelpfulByCustomer = (review: ProductReview): boolean => {
        if (!customer_id || !review.is_helpful) {
            return false;
        }
        const customers = review.is_helpful.customers as string[] | undefined;
        return customers ? customers.includes(customer_id) : false;
    };

    const handleHelpful = async (reviewId: string) => {
        if (!access_token || !customer_id) {
            return;
        }

        try {
            const review = reviews.find(r => r.id === reviewId);
            const isCurrentlyHelpful = isReviewHelpfulByCustomer(review!);
            const newHelpfulState = !isCurrentlyHelpful;

            await markReviewHelpful(reviewId, access_token, newHelpfulState, customer_id);

            // Update local state
            setReviews(reviews.map(r =>
                r.id === reviewId
                    ? {
                        ...r,
                        is_helpful: {
                            customers: newHelpfulState
                                ? [...(r.is_helpful?.customers || []), customer_id]
                                : (r.is_helpful?.customers || []).filter((id: string) => id !== customer_id),
                            count: newHelpfulState
                                ? (r.is_helpful?.count || 0) + 1
                                : Math.max(0, (r.is_helpful?.count || 0) - 1),
                        },
                    }
                    : r
            ));
        } catch (err: any) {
            console.error('[ReviewsList] Failed to mark review as helpful:', err);
        }
    };

    const getCustomerName = (customer: any): string => {
        if (!customer) return 'Anonymous';
        if (typeof customer === 'string') return 'Anonymous';
        if (typeof customer === 'object' && customer.user) {
            const firstName = customer.user.first_name || '';
            const lastName = customer.user.last_name || '';
            const name = `${firstName} ${lastName}`.trim();
            return name || customer.user.email || 'Anonymous';
        }
        return 'Anonymous';
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={cn(
                    i < rating ? "fill-primary text-primary" : "text-neutral-300"
                )}
            />
        ));
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-neutral-100 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                {error}
            </div>
        );
    }

    const filteredReviews = reviews.filter(review => {
        if (!customer_id) return true;
        const reviewCustomerId = typeof review.customer === 'string' 
            ? review.customer 
            : review.customer?.id;
        return reviewCustomerId !== customer_id;
    });

    if (reviews.length === 0) {
        return (
            <div className={cn(
                "bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center",
                rtl && "text-right"
            )}>
                <p className="text-neutral-600 text-lg">
                    {t('product.no_reviews')}
                </p>
            </div>
        );
    }

    if (filteredReviews.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {filteredReviews.map((review) => (
                <div
                    key={review.id}
                    className={cn(
                        "border-b border-neutral-200 pb-6 last:border-b-0",
                        rtl && "text-right"
                    )}
                >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                        <div>
                            <div className="flex gap-1 mb-2">
                                {getRatingStars(review.rating || 0)}
                            </div>
                            <h4 className="font-semibold text-neutral-900">
                                {review.title || 'Review'}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-xs text-neutral-600 mt-1">
                                <span>{getCustomerName(review.customer)}</span>
                                {review.created_at && (
                                    <span>{formatDate(review.created_at)}</span>
                                )}
                                {review.verified_purchase && (
                                    <span className="text-green-600 font-medium">
                                        ✓ {t('product.verified_purchase')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {review.comment && (
                        <p className="text-neutral-700 mb-4 leading-relaxed">
                            {review.comment}
                        </p>
                    )}

                    {access_token && customer_id && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleHelpful(review.id)}
                                className={cn(
                                    "flex items-center gap-2 text-sm font-medium transition-colors",
                                    isReviewHelpfulByCustomer(review)
                                        ? "text-primary"
                                        : "text-neutral-600 hover:text-primary"
                                )}
                            >
                                <ThumbsUp
                                    size={16}
                                    className={isReviewHelpfulByCustomer(review) ? 'fill-primary' : ''}
                                />
                                {t('product.helpful')}
                            </button>
                            {review.is_helpful && review.is_helpful.count > 0 && (
                                <span className="text-xs text-neutral-500">
                                    ({review.is_helpful.count})
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
