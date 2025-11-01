'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle, Users, Send } from 'lucide-react';
import { cn, getDirection, isRTL } from '@/lib/utils';
import type { Locale } from '@/types';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
}

export default function ContactContent() {
    const t = useTranslations('contact');
    const tCommon = useTranslations('common');
    const params = useParams();
    const locale = params.locale as Locale;
    const isArabic = locale === 'ar';
    const direction = getDirection(locale);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('required_field');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('required_field');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = tCommon('validation.invalid_email');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('required_field');
        }

        if (!formData.subject.trim()) {
            newErrors.subject = t('required_field');
        }

        if (!formData.message.trim()) {
            newErrors.message = t('required_field');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                });
                setTimeout(() => setSubmitStatus('idle'), 5000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactMethods = [
        {
            icon: Phone,
            title: t('phone'),
            details: '+968 2411 1111',
            link: 'tel:+96824111111',
        },
        {
            icon: Mail,
            title: t('email'),
            details: 'hello@buyjan.com',
            link: 'mailto:hello@buyjan.com',
        },
        {
            icon: MapPin,
            title: t('address'),
            details: isArabic ? 'مسقط، سلطنة عمان' : 'Muscat, Sultanate of Oman',
            link: '#',
        },
    ];

    const supportChannels = [
        {
            icon: '💬',
            title: t('live_chat'),
            description: t('live_chat_desc'),
        },
        {
            icon: '📱',
            title: t('social_media'),
            description: t('social_media_desc'),
        },
        {
            icon: '❓',
            title: t('faq_link'),
            description: t('faq_desc'),
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-16">
                    {/* Contact Information */}
                    <motion.div
                        className="lg:col-span-1"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" variants={itemVariants}>
                            {t('contact_info_title')}
                        </motion.h2>
                        <motion.p className="text-gray-600 mb-8" variants={itemVariants}>
                            {t('contact_info_description')}
                        </motion.p>

                        {/* Contact Methods */}
                        <div className="space-y-6 mb-12">
                            {contactMethods.map((method, index) => {
                                const Icon = method.icon;
                                return (
                                    <motion.a
                                        key={index}
                                        href={method.link}
                                        className="group block p-4 rounded-lg border-2 border-gray-100 hover:border-yellow-400 hover:shadow-lg transition-all duration-300"
                                        variants={itemVariants}
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="flex items-start gap-4" dir={direction}>
                                            <div className="flex-shrink-0">
                                                <Icon className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{method.title}</p>
                                                <p className="text-gray-600 text-sm mt-1">{method.details}</p>
                                            </div>
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>

                        {/* Office Hours */}
                        <motion.div
                            className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <h3 className="font-semibold text-gray-900">{t('office_hours')}</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p>{t('monday_friday')}</p>
                                <p>{t('saturday')}</p>
                                <p>{t('sunday')}</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        className="lg:col-span-2"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg border-2 border-gray-100 p-6 md:p-8 shadow-lg"
                            variants={itemVariants}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {t('contact_form_title')}
                            </h2>
                            <p className="text-gray-600 mb-8">{t('contact_form_description')}</p>

                            {submitStatus === 'success' && (
                                <motion.div
                                    className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-green-700 text-sm font-medium">{t('message_sent_success')}</p>
                                </motion.div>
                            )}

                            {submitStatus === 'error' && (
                                <motion.div
                                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-red-700 text-sm font-medium">{t('message_sent_error')}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5" dir={direction}>
                                {/* Full Name */}
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        {t('full_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder={t('full_name_placeholder')}
                                        className={cn(
                                            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50',
                                            errors.fullName
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-yellow-400'
                                        )}
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
                                    )}
                                </motion.div>

                                {/* Email */}
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        {t('email_address')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('email_address_placeholder')}
                                        className={cn(
                                            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50',
                                            errors.email
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-yellow-400'
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                                    )}
                                </motion.div>

                                {/* Phone */}
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        {t('phone_number')}
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder={t('phone_number_placeholder')}
                                        className={cn(
                                            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50',
                                            errors.phone
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-yellow-400'
                                        )}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                                    )}
                                </motion.div>

                                {/* Subject */}
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        {t('subject')}
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className={cn(
                                            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50',
                                            errors.subject
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-yellow-400'
                                        )}
                                    >
                                        <option value="">{t('subject_placeholder')}</option>
                                        <option value="customer_support">{t('customer_support')}</option>
                                        <option value="shipping_returns">{t('shipping_returns')}</option>
                                        <option value="product_inquiries">{t('product_inquiries')}</option>
                                        <option value="feedback">{t('feedback')}</option>
                                        <option value="partnerships">{t('partnerships')}</option>
                                        <option value="other">{t('other')}</option>
                                    </select>
                                    {errors.subject && (
                                        <p className="text-red-600 text-xs mt-1">{errors.subject}</p>
                                    )}
                                </motion.div>

                                {/* Message */}
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        {t('message')}
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder={t('message_placeholder')}
                                        rows={5}
                                        className={cn(
                                            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none',
                                            errors.message
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-yellow-400'
                                        )}
                                    />
                                    {errors.message && (
                                        <p className="text-red-600 text-xs mt-1">{errors.message}</p>
                                    )}
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div variants={itemVariants}>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                />
                                                {t('sending')}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                {t('send_message')}
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </form>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Support Channels */}
                <motion.section
                    className="mt-20"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div className="text-center mb-12" variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {t('support_channels')}
                        </h2>
                        <p className="text-gray-600 text-lg">
                            {t('response_time_desc')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {supportChannels.map((channel, index) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border-2 border-yellow-200 text-center group hover:shadow-lg transition-all duration-300"
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                                    {channel.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{channel.title}</h3>
                                <p className="text-gray-600 text-sm">{channel.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
