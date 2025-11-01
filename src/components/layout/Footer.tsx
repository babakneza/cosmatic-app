'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, getDirection, isRTL } from '@/lib/utils';
import type { Locale } from '@/types';

export default function Footer() {
    const params = useParams();
    const locale = params?.locale as Locale;
    const t = useTranslations();
    const rtl = isRTL(locale);
    const direction = getDirection(locale);

    const currentYear = new Date().getFullYear();

    // Quick Links
    const quickLinks = [
        { label: t('nav.shop'), href: `/${locale}/shop` },
        { label: t('nav.about'), href: `/${locale}/about` },
        { label: t('nav.contact'), href: `/${locale}/contact` },
        { label: t('footer.track_order'), href: `/${locale}/track` },
    ];

    // Support Links
    const supportLinks = [
        { label: t('footer.faq'), href: `/${locale}/faq` },
        { label: t('footer.returns'), href: `/${locale}/returns` },
        { label: t('footer.shipping'), href: `/${locale}/shipping` },
        { label: t('footer.warranty'), href: `/${locale}/warranty` },
    ];

    // Legal Links
    const legalLinks = [
        { label: t('footer.privacy'), href: `/${locale}/privacy` },
        { label: t('footer.terms'), href: `/${locale}/terms` },
        { label: t('footer.cookies'), href: `/${locale}/cookies` },
    ];

    // Social Links
    const socialLinks = [
        {
            icon: Instagram,
            href: 'https://instagram.com',
            label: 'Instagram',
            color: 'text-pink-600 hover:text-pink-700',
        },
        {
            icon: Facebook,
            href: 'https://facebook.com',
            label: 'Facebook',
            color: 'text-blue-600 hover:text-blue-700',
        },
        {
            icon: Twitter,
            href: 'https://twitter.com',
            label: 'Twitter',
            color: 'text-blue-400 hover:text-blue-500',
        },
    ];

    // Payment Methods
    const paymentMethods = [
        { name: 'Visa', icon: '💳' },
        { name: 'Mastercard', icon: '💳' },
        { name: 'Bank Muscat', icon: '🏦' },
        { name: 'OmanNet', icon: '💵' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <footer className="bg-gradient-to-b from-neutral-50 via-white to-neutral-50 border-t border-primary/10">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Brand Section */}
                    <motion.div
                        variants={itemVariants}
                        className={cn('col-span-2 md:col-span-1 lg:col-span-1', rtl && 'text-right')}
                    >
                        <Link href={`/${locale}`} className="inline-block mb-2 md:mb-3 lg:mb-4">
                            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                BuyJan
                            </span>
                        </Link>
                        <p className="text-xs md:text-sm text-neutral-600 mb-3 md:mb-4 leading-relaxed">
                            {t('footer.brand_description')}
                        </p>
                        <div className="flex items-center gap-2 md:gap-3" dir={direction}>
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            'p-1.5 md:p-2 rounded-full hover:bg-primary/10 transition-all duration-300',
                                            social.color
                                        )}
                                        aria-label={social.label}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon className="h-4 md:h-5 w-4 md:w-5" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        variants={itemVariants}
                        className={cn('col-span-1', rtl && 'text-right')}
                    >
                        <h3 className="text-xs md:text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 md:mb-3">
                            {t('footer.quick_links')}
                        </h3>
                        <ul className="space-y-1.5 md:space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-xs md:text-sm text-neutral-600 hover:text-primary transition-colors duration-300"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support */}
                    <motion.div
                        variants={itemVariants}
                        className={cn('col-span-1', rtl && 'text-right')}
                    >
                        <h3 className="text-xs md:text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 md:mb-3">
                            {t('footer.support')}
                        </h3>
                        <ul className="space-y-1.5 md:space-y-2">
                            {supportLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-xs md:text-sm text-neutral-600 hover:text-primary transition-colors duration-300"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        variants={itemVariants}
                        className={cn('col-span-2 md:col-span-1 lg:col-span-1', rtl && 'text-right')}
                    >
                        <h3 className="text-xs md:text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 md:mb-3">
                            {t('footer.contact')}
                        </h3>
                        <ul className="space-y-1.5 md:space-y-2">
                            <li className="flex items-start gap-2 md:gap-3" dir={direction}>
                                <Phone className={cn('h-3 md:h-4 w-3 md:w-4 text-primary mt-0.5 flex-shrink-0', rtl && 'order-2')} />
                                <a
                                    href="tel:+96824111111"
                                    className="text-xs md:text-sm text-neutral-600 hover:text-primary transition-colors duration-300"
                                >
                                    +968 2411 1111
                                </a>
                            </li>
                            <li className="flex items-start gap-2 md:gap-3" dir={direction}>
                                <Mail className={cn('h-3 md:h-4 w-3 md:w-4 text-primary mt-0.5 flex-shrink-0', rtl && 'order-2')} />
                                <a
                                    href="mailto:hello@buyjan.com"
                                    className="text-xs md:text-sm text-neutral-600 hover:text-primary transition-colors duration-300"
                                >
                                    hello@buyjan.com
                                </a>
                            </li>
                            <li className="flex items-start gap-2 md:gap-3" dir={direction}>
                                <MapPin className={cn('h-3 md:h-4 w-3 md:w-4 text-primary mt-0.5 flex-shrink-0', rtl && 'order-2')} />
                                <span className="text-xs md:text-sm text-neutral-600">
                                    {locale === 'ar'
                                        ? 'مسقط، سلطنة عمان'
                                        : 'Muscat, Sultanate of Oman'}
                                </span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Newsletter */}
                    <motion.div
                        variants={itemVariants}
                        className={cn('col-span-2 md:col-span-3 lg:col-span-1', rtl && 'text-right')}
                    >
                        <h3 className="text-xs md:text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 md:mb-3">
                            {t('footer.newsletter')}
                        </h3>
                        <p className="text-xs text-neutral-600 mb-2 md:mb-3">
                            {t('footer.newsletter_description')}
                        </p>
                        <div className="flex flex-col md:flex-row gap-2" dir={direction}>
                            <input
                                type="email"
                                placeholder={t('footer.email_placeholder')}
                                className="flex-1 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-primary/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                            />
                            <motion.button
                                className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-primary to-accent text-white text-xs md:text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('common.subscribe')}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-6 md:my-8"></div>

                {/* Payment Methods & Legal */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Payment Methods */}
                    <motion.div variants={itemVariants} className={cn(rtl && 'text-right')}>
                        <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide mb-2 md:mb-3">
                            {t('footer.payment_methods')}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 md:gap-2" dir={direction}>
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.name}
                                    className="px-2 md:px-3 py-1 md:py-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20 flex items-center gap-1.5 md:gap-2"
                                >
                                    <span className="text-base md:text-lg">{method.icon}</span>
                                    <span className="text-xs font-medium text-neutral-700">
                                        {method.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Legal Links */}
                    <motion.div
                        variants={itemVariants}
                        className={cn('flex flex-wrap gap-2 md:gap-4', rtl ? 'justify-end' : 'justify-start')}
                    >
                        {legalLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs text-neutral-600 hover:text-primary transition-colors duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Bottom Footer */}
                <motion.div
                    className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-primary/10"
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className={cn(
                        'flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 text-xs text-neutral-600',
                        rtl && 'md:flex-row-reverse'
                    )}>
                        <p>
                            © {currentYear} BuyJan. {t('footer.rights_reserved')}
                        </p>
                        <div className="flex items-center gap-1">
                            {t('footer.made_with')}
                            <Heart className="h-3 w-3 text-red-600 mx-0.5 inline" />
                            {t('footer.for_oman')}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Bottom Line */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </footer>
    );
}