'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Locale } from '@/types';

export default function LanguageSwitcher() {
    const params = useParams();
    const pathname = usePathname();
    const currentLocale = (params?.locale as Locale) || 'en';

    const nextLocale: Locale = currentLocale === 'en' ? 'ar' : 'en';

    // Replace the current locale with the next locale in the pathname
    const getLocalizedPath = () => {
        return pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    };

    const languages = [
        { code: 'en' as Locale, label: 'English', short: 'En' },
        { code: 'ar' as Locale, label: 'العربية', short: 'ع' },
    ];

    return (
        <Link href={getLocalizedPath()}>
            <motion.div
                className="relative inline-flex items-center gap-1 px-1 py-1 bg-white border border-neutral-200 rounded-full cursor-pointer shadow-sm overflow-hidden"
                whileHover={{
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                {/* Animated background circle for active language */}
                <motion.div
                    className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/8 to-primary/5 pointer-events-none"
                    animate={{
                        x: currentLocale === 'ar' ? 'calc(100% - 2px)' : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 35,
                        mass: 1.2,
                    }}
                />

                {/* Language buttons */}
                <div className="relative flex items-center gap-0.5 z-10">
                    {languages.map((lang) => (
                        <motion.div
                            key={lang.code}
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.button
                                className="relative w-9 h-8 flex items-center justify-center rounded-full font-semibold text-sm transition-colors"
                                animate={{
                                    color: currentLocale === lang.code
                                        ? 'rgb(212, 175, 55)'
                                        : 'rgb(115, 115, 115)',
                                    backgroundColor: currentLocale === lang.code
                                        ? 'rgba(212, 175, 55, 0.1)'
                                        : 'transparent',
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeOut',
                                }}
                                disabled
                                style={{ pointerEvents: 'none' }}
                            >
                                {/* Shimmer effect on active */}
                                {currentLocale === lang.code && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                                        animate={{ opacity: [0, 0.3, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}

                                <motion.span
                                    animate={{
                                        scale: currentLocale === lang.code ? 1 : 0.9,
                                        opacity: currentLocale === lang.code ? 1 : 0.6,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="relative z-10"
                                >
                                    {lang.short}
                                </motion.span>
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </Link>
    );
}