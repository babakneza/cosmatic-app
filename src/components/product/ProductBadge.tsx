'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

type BadgeType = 'new' | 'sale' | 'featured' | 'outOfStock' | 'limitedEdition' | 'bestseller';

interface ProductBadgeProps {
    type: BadgeType;
    discount?: number;
    className?: string;
}

export default function ProductBadge({
    type,
    discount,
    className = '',
}: ProductBadgeProps) {
    const t = useTranslations();

    const badgeConfig: Record<BadgeType, { variant: any; label: string }> = {
        new: {
            variant: 'new',
            label: t('product.new'),
        },
        sale: {
            variant: 'sale',
            label: discount ? `-${discount}%` : t('product.sale'),
        },
        featured: {
            variant: 'featured',
            label: t('product.featured'),
        },
        outOfStock: {
            variant: 'outOfStock',
            label: t('product.outOfStock'),
        },
        limitedEdition: {
            variant: 'accent',
            label: t('product.limitedEdition'),
        },
        bestseller: {
            variant: 'gold',
            label: t('product.bestseller'),
        },
    };

    const config = badgeConfig[type];

    return (
        <Badge variant={config.variant} className={`animate-pulse ${className}`}>
            {config.label}
        </Badge>
    );
}