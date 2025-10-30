'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getDirection, isRTL } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import type { Locale } from '@/types';

interface BreadcrumbItem {
    label: string;
    href: string;
    current?: boolean;
}

interface NavigationProps {
    breadcrumbs?: BreadcrumbItem[];
    showCategoryMenu?: boolean;
    className?: string;
}

/**
 * Navigation Component
 * 
 * Provides:
 * - RTL-aware breadcrumbs
 * - Category menu navigation
 * - Mobile hamburger menu
 * - Smooth animations
 * - Full localization support
 * 
 * Usage:
 * ```tsx
 * <Navigation 
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products', current: true }
 *   ]}
 *   showCategoryMenu={true}
 * />
 * ```
 */
export default function Navigation({
    breadcrumbs = [],
    showCategoryMenu = true,
    className,
}: NavigationProps) {
    const params = useParams();
    const pathname = usePathname();
    const locale = params?.locale as Locale;
    const t = useTranslations();
    const rtl = isRTL(locale);
    const direction = getDirection(locale);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { categories } = useCategories();

    const ChevronIcon = rtl ? ChevronLeft : ChevronRight;

    const renderBreadcrumbs = () => {
        if (breadcrumbs.length === 0) {
            return null;
        }

        return (
            <motion.nav
                className="flex items-center text-sm mb-4 overflow-x-auto pb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                dir={direction}
            >
                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.href}>
                        {index > 0 && (
                            <ChevronIcon className="w-4 h-4 text-neutral-400 mx-2 flex-shrink-0" />
                        )}
                        {item.current ? (
                            <span
                                className="text-neutral-600 font-medium truncate"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="text-primary hover:text-primary/80 transition-colors truncate hover:underline"
                            >
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                ))}
            </motion.nav>
        );
    };

    const renderCategoryMenu = () => {
        if (!showCategoryMenu || !categories || categories.length === 0) {
            return null;
        }

        return (
            <div className="border-b border-neutral-200 bg-neutral-50/50" dir={direction}>
                <div className="container mx-auto px-4">
                    {/* Desktop Category Menu */}
                    <motion.div
                        className="hidden md:flex items-center space-x-1 overflow-x-auto py-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        dir={direction}
                    >
                        <Link
                            href={`/${locale}/shop`}
                            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-lg transition-all duration-200"
                        >
                            {t('nav.all_products')}
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/${locale}/category/${category.slug}`}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-lg transition-all duration-200 whitespace-nowrap"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </motion.div>

                    {/* Mobile Category Menu Toggle */}
                    <div className="md:hidden flex items-center justify-between py-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex items-center space-x-2 text-neutral-700 hover:text-primary transition-colors"
                            aria-expanded={mobileMenuOpen}
                            aria-label={t('nav.categories_menu')}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                            <span className="text-sm font-medium">
                                {t('nav.categories')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Category Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="md:hidden bg-white border-t border-neutral-200 py-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            dir={direction}
                        >
                            <div className="container mx-auto px-4 space-y-1">
                                <Link
                                    href={`/${locale}/shop`}
                                    className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-lg transition-all duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t('nav.all_products')}
                                </Link>
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/${locale}/category/${category.slug}`}
                                        className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <nav className={cn('bg-white', className)}>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <div className="container mx-auto px-4 py-4">
                    {renderBreadcrumbs()}
                </div>
            )}

            {/* Category Menu */}
            {renderCategoryMenu()}
        </nav>
    );
}