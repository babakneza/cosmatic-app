'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Home,
    Heart,
    ShoppingBag,
    User,
    LogOut,
    LogIn,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, getDirection, isRTL } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/store/auth';
import type { Locale } from '@/types';

interface MobileBottomNavProps {
    className?: string;
}

/**
 * MobileBottomNav Component
 * 
 * Bottom navigation bar for mobile devices providing quick access to:
 * - Home
 * - Categories
 * - Wishlist
 * - Shopping Cart (with count badge)
 * - User Account/Auth
 * 
 * Features:
 * - RTL/LTR support
 * - Active indicator
 * - Cart item count badge
 * - Smooth animations
 * - Full localization
 * 
 * Usage:
 * ```tsx
 * <MobileBottomNav showCategories={true} />
 * ```
 */
export default function MobileBottomNav({
    className,
}: MobileBottomNavProps) {
    const params = useParams();
    const pathname = usePathname();
    const locale = params?.locale as Locale;
    const t = useTranslations();
    const rtl = isRTL(locale);
    const direction = getDirection(locale);

    const { items } = useCartStore();
    const { is_authenticated, user } = useAuth();

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

    const isActive = (href: string): boolean => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    const navItems = [
        {
            icon: Home,
            label: t('nav.home'),
            href: `/${locale}`,
            id: 'home',
        },
        {
            icon: ShoppingBag,
            label: t('nav.shop'),
            href: `/${locale}/shop`,
            id: 'shop',
        },
        {
            icon: Heart,
            label: t('nav.wishlist'),
            href: `/${locale}/account/wishlist`,
            id: 'wishlist',
        },
        {
            icon: ShoppingBag,
            label: t('nav.cart'),
            href: `/${locale}/cart`,
            id: 'cart',
            badge: cartItemsCount > 0 ? cartItemsCount : undefined,
        },
        {
            icon: is_authenticated ? User : LogIn,
            label: is_authenticated ? t('auth.my_account') : t('auth.login'),
            href: is_authenticated ? `/${locale}/account` : `/${locale}/auth/login`,
            id: 'account',
        },
    ];

    const renderNavItem = (
        item: (typeof navItems)[0],
        index: number
    ) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        const commonClasses = cn(
            'w-full relative flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200',
            active
                ? 'text-primary bg-primary/5'
                : 'text-neutral-600 hover:text-primary hover:bg-neutral-100'
        );

        const content = (
            <>
                <div className="relative">
                    <Icon className="w-5 h-5" />

                    {/* Badge for cart count */}
                    {item.badge && (
                        <motion.div
                            className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            {item.badge > 9 ? '9+' : item.badge}
                        </motion.div>
                    )}
                </div>

                {/* Label */}
                <span className="text-xs font-medium mt-1 text-center truncate">
                    {item.label}
                </span>

                {/* Active indicator */}
                {active && (
                    <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                        layoutId="activeIndicator"
                        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                )}
            </>
        );

        return (
            <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex-1"
            >
                <Link
                    href={item.href}
                    className={commonClasses}
                    aria-current={active ? 'page' : undefined}
                >
                    {content}
                </Link>
            </motion.div>
        );
    };

    return (
        <>
            {/* Bottom Navigation Bar - Only visible on mobile */}
            <motion.nav
                className={cn(
                    'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg md:hidden z-40',
                    className
                )}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
                dir={direction}
            >
                <div className="flex items-center justify-between h-20 px-1">
                    {navItems.map((item, index) => renderNavItem(item, index))}
                </div>
            </motion.nav>

            {/* Spacer for bottom nav - prevents content from being hidden */}
            <div className="h-20 md:h-0" />
        </>
    );
}