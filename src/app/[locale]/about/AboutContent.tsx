'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutContent() {
    const t = useTranslations('about');
    const tCommon = useTranslations('common');
    const params = useParams();
    const locale = params.locale as string;
    const isArabic = locale === 'ar';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        },
    };

    const values = [
        {
            icon: '✨',
            title: t('quality_title'),
            description: t('quality_description'),
        },
        {
            icon: '🛡️',
            title: t('authenticity_title'),
            description: t('authenticity_description'),
        },
        {
            icon: '💎',
            title: t('customer_focus_title'),
            description: t('customer_focus_description'),
        },
        {
            icon: '🚀',
            title: t('innovation_title'),
            description: t('innovation_description'),
        },
    ];

    const benefits = [
        {
            icon: '✓',
            title: t('guaranteed_authentic'),
            description: t('guaranteed_authentic_desc'),
        },
        {
            icon: '⚡',
            title: t('fast_delivery'),
            description: t('fast_delivery_desc'),
        },
        {
            icon: '↩️',
            title: t('easy_returns'),
            description: t('easy_returns_desc'),
        },
        {
            icon: '💬',
            title: t('customer_support'),
            description: t('customer_support_desc'),
        },
        {
            icon: '🔒',
            title: t('secure_shopping'),
            description: t('secure_shopping_desc'),
        },
    ];

    const missionPoints = t.raw('mission_points') as string[];

    return (
        <div className="min-h-screen bg-white">
            <motion.section
                className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 via-white to-yellow-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {t('hero_title')}
                    </motion.h1>
                    <motion.p
                        className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {t('hero_subtitle')}
                    </motion.p>
                    <motion.div
                        className="w-24 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 mx-auto"
                        initial={{ width: 0 }}
                        animate={{ width: 96 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    />
                </div>
            </motion.section>

            <motion.section
                className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div variants={itemVariants}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-lg transform -rotate-1 blur-sm opacity-75" />
                            <div className="relative bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-8 border border-yellow-200">
                                <p className="text-gray-700 leading-relaxed mb-4 text-base">
                                    {t('our_story_description')}
                                </p>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {t('our_story_details')}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                            {t('our_story_title')}
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <span className="text-2xl text-yellow-500 flex-shrink-0">💎</span>
                                <p className="text-gray-600 pt-1">
                                    Premium products from global brands curated just for you
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-2xl text-yellow-500 flex-shrink-0">🌍</span>
                                <p className="text-gray-600 pt-1">
                                    Bringing international beauty standards to Oman
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-2xl text-yellow-500 flex-shrink-0">💚</span>
                                <p className="text-gray-600 pt-1">
                                    Committed to quality, authenticity, and customer satisfaction
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" variants={itemVariants}>
                            {t('mission_title')}
                        </motion.h2>
                        <motion.p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8" variants={itemVariants}>
                            {t('mission_description')}
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-lg shadow-lg p-8 md:p-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <ul className="space-y-4">
                            {missionPoints.map((point: string, index: number) => (
                                <motion.li
                                    key={index}
                                    className="flex gap-4 items-start group"
                                    variants={itemVariants}
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-700 pt-1 text-base">{point}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            <motion.section
                className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center" variants={itemVariants}>
                    {t('values_title')}
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            className="group bg-white rounded-lg border-2 border-gray-100 p-6 hover:border-yellow-400 hover:shadow-lg transition-all duration-300"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {value.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" variants={itemVariants}>
                            {t('why_choose_title')}
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg p-6 text-center hover:shadow-xl transition-all duration-300 group"
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight">{benefit.title}</h3>
                                <p className="text-gray-600 text-xs leading-relaxed">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <motion.section
                className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" variants={itemVariants}>
                    {t('team_title')}
                </motion.h2>
                <motion.p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8" variants={itemVariants}>
                    {t('team_description')}
                </motion.p>
                <motion.div variants={itemVariants}>
                    <Link
                        href={`/${locale}/contact`}
                        className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                        {tCommon('contact')}
                    </Link>
                </motion.div>
            </motion.section>
        </div>
    );
}
