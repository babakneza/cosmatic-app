'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { Locale } from '@/types';
import { cn, isRTL, getFontFamily } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href: string;
    isActive?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    locale: Locale;
}

export default function Breadcrumb({ items, locale }: BreadcrumbProps) {
    const t = useTranslations();
    const rtl = isRTL(locale);
    const fontFamily = getFontFamily(locale);

    const ChevronIcon = rtl ? ChevronLeft : ChevronRight;

    return (
        <nav aria-label="Breadcrumb" className={cn("mb-4", fontFamily)}>
            <ol className={cn(
                "flex flex-wrap items-center text-sm text-neutral-500",
                rtl && "flex-row-reverse"
            )}>
                <li className="flex items-center">
                    <Link
                        href={`/${locale}`}
                        className="hover:text-primary transition-colors"
                    >
                        {t('common.home')}
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <span className="mx-2 text-neutral-400">
                            <ChevronIcon size={14} />
                        </span>

                        {item.isActive ? (
                            <span className="font-medium text-neutral-800">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}