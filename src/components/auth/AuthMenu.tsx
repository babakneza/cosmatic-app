'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    User,
    LogOut,
    Settings,
    ShoppingBag,
    MapPin,
    ChevronDown,
    LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { cn, getDirection, isRTL } from '@/lib/utils';
import type { Locale } from '@/types';

interface AuthMenuProps {
    className?: string;
    variant?: 'desktop' | 'mobile';
}

/**
 * AuthMenu Component
 * 
 * Displays authentication-related menu items:
 * - Shows Login/Register when not authenticated
 * - Shows user profile dropdown when authenticated
 * - Includes links to account, orders, addresses, settings
 * - Logout functionality
 * 
 * Features:
 * - RTL/LTR support
 * - Smooth animations
 * - Responsive (desktop dropdown / mobile links)
 * - Full localization
 * 
 * Usage:
 * ```tsx
 * <AuthMenu variant="desktop" />
 * <AuthMenu variant="mobile" />
 * ```
 */
export default function AuthMenu({ className, variant = 'desktop' }: AuthMenuProps) {
    const params = useParams();
    const locale = params?.locale as Locale;
    const t = useTranslations();
    const rtl = isRTL(locale);
    const direction = getDirection(locale);
    const { user, is_authenticated, logout, customer_profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    // Desktop dropdown menu
    if (variant === 'desktop') {
        return (
            <div className={cn('relative', className)}>
                {!is_authenticated ? (
                    // Not authenticated - show Login/Register buttons
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={`/${locale}/auth/login`}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
                            >
                                {t('auth.login')}
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={`/${locale}/auth/register`}
                                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                            >
                                {t('auth.register')}
                            </Link>
                        </motion.div>
                    </div>
                ) : (
                    // Authenticated - show user menu dropdown
                    <div className="relative">
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-medium">
                                {(customer_profile?.first_name || user?.first_name)?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[100px]">
                                {customer_profile?.first_name || user?.first_name || 'User'}
                            </span>
                            <ChevronDown
                                className={cn(
                                    'w-4 h-4 transition-transform duration-300',
                                    isOpen && 'rotate-180'
                                )}
                            />
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        'absolute top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 z-50',
                                        rtl ? 'right-0' : 'left-0'
                                    )}
                                    dir={direction}
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-neutral-200">
                                        <p className="text-sm font-semibold text-neutral-900">
                                            {customer_profile?.first_name || user?.first_name} {customer_profile?.last_name || user?.last_name}
                                        </p>
                                        <p className="text-xs text-neutral-500 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <nav className="py-2">
                                        <Link
                                            href={`/${locale}/account`}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            {t('auth.my_account')}
                                        </Link>

                                        <Link
                                            href={`/${locale}/account/orders`}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            {t('auth.my_orders')}
                                        </Link>

                                        <Link
                                            href={`/${locale}/account/addresses`}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <MapPin className="w-4 h-4" />
                                            {t('auth.my_addresses')}
                                        </Link>

                                        <Link
                                            href={`/${locale}/account/settings`}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            {t('auth.settings')}
                                        </Link>
                                    </nav>

                                    {/* Logout Button */}
                                    <div className="border-t border-neutral-200 px-4 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {t('auth.logout')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Overlay to close menu */}
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 z-40"
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Mobile menu items
    return (
        <div className={cn('space-y-1', className)}>
            {!is_authenticated ? (
                <>
                    <Link
                        href={`/${locale}/auth/login`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        {t('auth.login')}
                    </Link>
                    <Link
                        href={`/${locale}/auth/register`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <User className="w-4 h-4" />
                        {t('auth.register')}
                    </Link>
                </>
            ) : (
                <>
                    <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-semibold text-neutral-900">
                            {customer_profile?.first_name || user?.first_name} {customer_profile?.last_name || user?.last_name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                            {user?.email}
                        </p>
                    </div>

                    <Link
                        href={`/${locale}/account`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <User className="w-4 h-4" />
                        {t('auth.my_account')}
                    </Link>

                    <Link
                        href={`/${locale}/account/orders`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {t('auth.my_orders')}
                    </Link>

                    <Link
                        href={`/${locale}/account/addresses`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        {t('auth.my_addresses')}
                    </Link>

                    <Link
                        href={`/${locale}/account/settings`}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary rounded-lg transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        {t('auth.settings')}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border-t border-neutral-200 mt-2 pt-3"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('auth.logout')}
                    </button>
                </>
            )}
        </div>
    );
}