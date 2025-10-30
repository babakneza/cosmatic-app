'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ProductRatingProps {
    rating?: number;
    count?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ProductRating({
    rating = 0,
    count = 0,
    interactive = false,
    onRatingChange,
    size = 'md',
    className = '',
}: ProductRatingProps) {
    const [hoverRating, setHoverRating] = React.useState(0);
    const displayRating = interactive ? hoverRating || rating : rating;
    const roundedRating = Math.round(displayRating * 2) / 2; // Support 0.5 increments

    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= Math.floor(roundedRating);
                    const isHalf = star === Math.ceil(roundedRating) && roundedRating % 1 !== 0;

                    return (
                        <div
                            key={star}
                            className={`relative ${interactive ? 'cursor-pointer' : ''}`}
                            onMouseEnter={() => interactive && setHoverRating(star)}
                            onMouseLeave={() => interactive && setHoverRating(0)}
                            onClick={() => interactive && onRatingChange?.(star)}
                        >
                            {/* Background star */}
                            <Star
                                className={`${sizeClasses[size]} text-neutral-300`}
                            />

                            {/* Filled star */}
                            <div
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{
                                    width: isHalf ? '50%' : isFilled ? '100%' : '0%',
                                }}
                            >
                                <Star
                                    className={`${sizeClasses[size]} fill-accent text-accent`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rating text */}
            {rating > 0 && (
                <div className="flex items-center gap-1">
                    <span className={`${textSizes[size]} font-semibold text-neutral-900`}>
                        {roundedRating.toFixed(1)}
                    </span>
                    {count > 0 && (
                        <span className={`${textSizes[size]} text-neutral-500`}>
                            ({count})
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}