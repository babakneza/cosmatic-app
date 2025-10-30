'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Search, Menu, X, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const t = useTranslations();
    const direction = getDirection(locale);
    const rtl = isRTL(locale);
    const { items } = useCartStore();
    const { is_authenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

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
                            className="flex items-center gap-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Search */}
                            <motion.button
                                className="h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10"
                                onClick={() => setSearchOpen(!searchOpen)}
                                aria-label="Search"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Search className="h-5 w-5" />
                            </motion.button>

                            {/* Shop Bag */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={`/${locale}/shop`}
                                    className="h-11 w-11 flex items-center justify-center rounded-full text-neutral-700 hover:text-neutral-900 transition-all duration-300 hover:shadow-md hover:shadow-black/10"
                                    aria-label="Shop"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                </Link>
                            </motion.div>

                            {/* Cart */}
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

                            {/* Separator Line */}
                            <div className="h-8 w-px bg-neutral-200 mx-2 sm:mx-3"></div>

                            {/* Language Switcher - Always visible */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                            >
                                <LanguageSwitcher />
                            </motion.div>

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
                            {/* Navigation Items */}
                            <nav className="flex flex-col space-y-2 mb-4 pb-4 border-b border-neutral-200">
                                {navItems.map((item) => (
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

                            {/* Auth Menu Items */}
                            <AuthMenu
                                variant="mobile"
                                className="px-0"
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </header>
    );
}