'use client';

import React from 'react';
import Price from '@/components/ui/Price';
import { isRTL } from '@/lib/utils';
import { useParams } from 'next/navigation';
import type { Locale } from '@/types';

interface PriceDisplayProps {
    price: number;
    salePrice?: number;
    size?: 'sm' | 'md' | 'lg';
    showDiscount?: boolean;
    className?: string;
}

export default function PriceDisplay({
    price,
    salePrice,
    size = 'md',
    showDiscount = true,
    className = '',
}: PriceDisplayProps) {
    const params = useParams();
    const locale = (params?.locale as Locale) || 'en';
    const rtl = isRTL(locale);

    const displayPrice = salePrice || price;
    const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

    const sizeMap = {
        sm: 'sm' as const,
        md: 'lg' as const,
        lg: '2xl' as const,
    };

    return (
        <div className={`flex items-center ${rtl ? 'flex-row-reverse' : 'flex-row'} gap-2 ${className}`}>
            {/* Display Price - Always English font and digits */}
            <Price
                amount={displayPrice}
                locale={locale}
                size={sizeMap[size]}
                weight="bold"
                className="text-primary"
            />

            {/* Original Price (if on sale) */}
            {salePrice && (
                <Price
                    amount={price}
                    locale={locale}
                    size={size === 'sm' ? 'xs' : 'sm'}
                    strikethrough
                    className="text-neutral-400"
                />
            )}

            {/* Discount Badge */}
            {salePrice && showDiscount && discount > 0 && (
                <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                    -{discount}%
                </span>
            )}
        </div>
    );
}