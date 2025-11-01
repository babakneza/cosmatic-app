'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Star, Edit2 } from 'lucide-react';
import { cn, isRTL } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { createReview, getCustomerReviewForProduct, updateReview } from '@/lib/api/reviews';
import { Locale } from '@/types';
import { ProductReview } from '@/types/collections';

interface ReviewFormProps {
    productId: string;
    locale: Locale;
    onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, locale, onReviewSubmitted }: ReviewFormProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const { user, access_token, customer_id } = useAuth();

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [existingReview, setExistingReview] = useState<ProductReview | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCheckingReview, setIsCheckingReview] = useState(true);

    useEffect(() => {
        const checkExistingReview = async () => {
            if (!user || !customer_id || !access_token) {
                setIsCheckingReview(false);
                return;
            }

            try {
                const review = await getCustomerReviewForProduct(customer_id, productId, access_token);
                if (review) {
                    setExistingReview(review);
                    setRating(review.rating || 0);
                    setTitle(review.title || '');
                    setComment(review.comment || '');
                }
            } catch (error) {
                console.error('[ReviewForm] Failed to check existing review:', error);
            } finally {
                setIsCheckingReview(false);
            }
        };

        checkExistingReview();
    }, [user, customer_id, access_token, productId]);

    if (!user) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const loginUrl = `/${locale}/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        
        return (
            <div className={cn(
                "bg-neutral-50 rounded-lg p-6 mb-8 border border-neutral-200",
                rtl ? "text-right" : "text-left"
            )}>
                <p className="text-neutral-700 mb-4">{t('product.login_to_review')}</p>
                <a
                    href={loginUrl}
                    className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                    {t('header.login')}
                </a>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rating) {
            setMessage({ type: 'error', text: 'Please select a rating' });
            return;
        }

        if (!title.trim()) {
            setMessage({ type: 'error', text: 'Please enter a review title' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            if (!customer_id) {
                throw new Error('Customer profile not found. Please try again.');
            }

            if (existingReview && isEditing) {
                await updateReview(existingReview.id, access_token!, {
                    rating,
                    title,
                    comment,
                });
                setMessage({ type: 'success', text: t('product.review_updated') });
                setIsEditing(false);
            } else {
                await createReview(customer_id, productId, access_token!, {
                    rating,
                    title,
                    comment,
                });
                setMessage({ type: 'success', text: t('product.review_submitted') });
            }

            if (onReviewSubmitted) {
                setTimeout(() => {
                    onReviewSubmitted();
                }, 1500);
            }
        } catch (error: any) {
            console.error('[ReviewForm] Failed to submit review:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('product.review_error'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingReview) {
        return (
            <div className="bg-neutral-100 rounded-lg p-6 mb-8 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
            </div>
        );
    }

    if (existingReview && !isEditing) {
        return (
            <div className={cn(
                "bg-neutral-50 rounded-lg p-6 mb-8 border border-neutral-200",
                rtl ? "text-right" : "text-left"
            )}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            {existingReview.title}
                        </h3>
                        <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={cn(
                                        i < (existingReview.rating || 0)
                                            ? "fill-primary text-primary"
                                            : "text-neutral-300"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                    >
                        <Edit2 size={16} />
                        {t('common.edit')}
                    </button>
                </div>
                {existingReview.comment && (
                    <p className="text-neutral-700">
                        {existingReview.comment}
                    </p>
                )}
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "bg-neutral-50 rounded-lg p-6 mb-8 space-y-6 border border-neutral-200",
                rtl && "text-right"
            )}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        {existingReview ? t('product.edit_review') : t('product.write_a_review')}
                    </h3>
                    <p className="text-sm text-neutral-600">
                        {t('product.share_your_thoughts')}
                    </p>
                </div>
                {existingReview && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false);
                            setRating(existingReview.rating || 0);
                            setTitle(existingReview.title || '');
                            setComment(existingReview.comment || '');
                            setMessage(null);
                        }}
                        className="text-neutral-600 hover:text-neutral-900 font-medium"
                    >
                        {t('common.cancel')}
                    </button>
                )}
            </div>

            {message && (
                <div
                    className={cn(
                        "p-4 rounded-md text-sm font-medium",
                        message.type === 'success'
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    )}
                >
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                    {t('product.your_rating')}
                </label>
                <div className="flex gap-2" dir={rtl ? 'rtl' : 'ltr'}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={32}
                                className={cn(
                                    "transition-colors",
                                    (hoveredRating || rating) >= star
                                        ? "fill-primary text-primary"
                                        : "text-neutral-300"
                                )}
                            />
                        </button>
                    ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                    {rating > 0 && `${rating} ${rating === 1 ? t('product.star') : t('product.stars')} ${t('product.rating_out_of_5')}`}
                </p>
            </div>

            <div>
                <label htmlFor="review-title" className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('product.review_title')}
                </label>
                <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('product.review_title_placeholder')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('product.review_comment')}
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('product.review_comment_placeholder')}
                    rows={5}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    disabled={isSubmitting}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                    "w-full py-2 px-4 rounded-md font-medium transition-colors",
                    isSubmitting
                        ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-600"
                )}
            >
                {isSubmitting ? t('product.submitting_review') : (existingReview ? t('product.update_review') : t('product.submit_review'))}
            </button>
        </form>
    );
}
