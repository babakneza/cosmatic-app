'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Search, Menu, X, ShoppingCart, Globe, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { cn, getDirection, isRTL } from '@/lib/utils';
import LanguageSwitcher from '@/components/localization/LanguageSwitcher';
import { EnhancedSearchBar } from '@/components/search';
import AuthMenu from '@/components/auth/AuthMenu';
import type { Locale } from '@/types';

export default function Header() {
    const params = useParams();
    const locale = params?.locale as Locale;
    const pathname = usePathname();
    const t = useTranslations();
    const direction = getDirection(locale);
    const rtl = isRTL(locale);
    const { items } = useCartStore();
    const { is_authenticated, user, customer_profile } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

    const nextLocale: Locale = locale === 'en' ? 'ar' : 'en';
    const getLocalizedPath = () => {
        return pathname.replace(`/${locale}`, `/${nextLocale}`);
    };

    const navItems = [
        { label: t('nav.home'), href: `/${locale}` },
        { label: t('nav.shop'), href: `/${locale}/shop` },
        { label: t('nav.about'), href: `/${locale}/about` },
        { label: t('nav.contact'), href: `/${locale}/contact` },
    ];

    return (
        <header className="relative bg-gradient-to-r from-white via-neutral-50 to-white border-b border-primary/10 sticky top-0 z-50">
            {/* Decorative top line */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <div className="container mx-auto px-4">
                <div className="py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            className="flex-shrink-0"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link href={`/${locale}`} className="flex items-center group">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <span className="relative text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                        BuyJan
                                    </span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <motion.nav
                            className="hidden lg:flex items-center space-x-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="relative px-4 py-2 text-neutral-700 font-medium text-sm tracking-wide group overflow-hidden"
                                    >
                                        <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">
                                            {item.label}
                                        </span>
                                        <motion.span
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent"
                                            initial={{ scaleX: 0, transformOrigin: 'left' }}
                                            whileHover={{ scaleX: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.nav>

                        {/* Desktop Auth Menu */}
                        <motion.div
                            className="hidden lg:flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <AuthMenu variant="desktop" />
                        </motion.div>

                        {/* Icons & Switcher */}
                        <motion.div
                            className="flex items-center gap-2 sm:gap-4 lg:gap-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Search - Hidden on small mobile, visible on tablet+ */}
                            <motion.button
                                className="hidden sm:flex h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10"
                                onClick={() => setSearchOpen(!searchOpen)}
                                aria-label="Search"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Search className="h-5 w-5" />
                            </motion.button>

                            {/* Shop Bag - Hidden on mobile */}
                            <motion.div className="hidden lg:block" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={`/${locale}/shop`}
                                    className="h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10"
                                    aria-label="Shop"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                </Link>
                            </motion.div>

                            {/* Cart - Always visible */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={`/${locale}/cart`}
                                    className="h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10 relative"
                                    aria-label="Cart"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItemsCount > 0 && (
                                        <motion.span
                                            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md border border-white"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        >
                                            {cartItemsCount}
                                        </motion.span>
                                    )}
                                </Link>
                            </motion.div>

                            {/* Separator Line - Hidden on mobile */}
                            <div className="hidden lg:block h-8 w-px bg-neutral-200 mx-2 sm:mx-3"></div>

                            {/* Language Switcher - Desktop only */}
                            <motion.div
                                className="hidden lg:block"
                                whileHover={{ scale: 1.05 }}
                            >
                                <LanguageSwitcher />
                            </motion.div>

                            {/* Language Toggle - Mobile only */}
                            <motion.div
                                className="lg:hidden"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href={getLocalizedPath()}
                                    className="h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-primary transition-all duration-300 hover:shadow-md hover:shadow-black/10"
                                    aria-label={`Switch to ${nextLocale === 'ar' ? 'Arabic' : 'English'}`}
                                >
                                    <Globe className="h-5 w-5" />
                                </Link>
                            </motion.div>

                            {/* Mobile User Menu */}
                            <div className="lg:hidden relative">
                                <motion.button
                                    onClick={() => setMobileUserMenuOpen(!mobileUserMenuOpen)}
                                    className="h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10 relative"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="User menu"
                                >
                                    {is_authenticated ? (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-medium text-sm">
                                            {(customer_profile?.first_name || user?.first_name)?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </motion.button>

                                {/* Mobile User Menu Dropdown */}
                                <AnimatePresence>
                                    {mobileUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                'fixed top-16 max-h-96 overflow-y-auto w-56 bg-white rounded-xl shadow-xl border border-neutral-200 z-50',
                                                rtl ? 'right-4' : 'left-4'
                                            )}
                                            dir={direction}
                                        >
                                            <AuthMenu
                                                variant="mobile"
                                                className="px-0"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Overlay to close menu */}
                                {mobileUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setMobileUserMenuOpen(false)}
                                        className="fixed inset-0 z-40"
                                        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                    />
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <motion.button
                                className="lg:hidden h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Search Bar - Shown when search is open */}
                    {searchOpen && (
                        <motion.div
                            className="mt-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <EnhancedSearchBar
                                locale={locale}
                                variant="header"
                            />
                        </motion.div>
                    )}

                    {/* Mobile Menu - Shown when menu is open */}
                    {mobileMenuOpen && (
                        <motion.div
                            className="lg:hidden mt-4 py-4 border-t border-primary/10"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Navigation Items - Only About and Contact */}
                            <nav className="flex flex-col space-y-2 mb-4 pb-4 border-b border-neutral-200">
                                {navItems.filter(item => item.href.includes('/about') || item.href.includes('/contact')).map((item) => (
                                    <motion.div
                                        key={item.href}
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className="block px-4 py-2 text-neutral-700 hover:text-primary font-medium rounded-lg hover:bg-primary/5 transition-all duration-300"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Sort options slot for shop page - injected by children */}
                            <div id="mobile-sort-menu"></div>
                        </motion.div>
                    )}
                </div>
            </div>
        </header>
    );
}