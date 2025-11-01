'use client';

import { useState } from 'react';
import { Locale } from '@/types';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

interface ReviewsTabProps {
    productId: string;
    locale: Locale;
    onReviewCountChange?: (count: number) => void;
}

export default function ReviewsTab({ productId, locale, onReviewCountChange }: ReviewsTabProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleReviewSubmitted = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleReviewCountChange = (count: number) => {
        if (onReviewCountChange) {
            onReviewCountChange(count);
        }
    };

    return (
        <div className="space-y-8">
            <ReviewForm
                productId={productId}
                locale={locale}
                onReviewSubmitted={handleReviewSubmitted}
            />
            <ReviewsList
                productId={productId}
                locale={locale}
                refreshTrigger={refreshTrigger}
                onReviewCountChange={handleReviewCountChange}
            />
        </div>
    );
}
