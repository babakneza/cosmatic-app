'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function CookiesContent() {
    const t = useTranslations();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <motion.section
                className="bg-gradient-to-r from-gold/10 to-amber-100/10 py-12 px-4 sm:px-6 lg:px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Cookies Policy
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Understand how we use cookies to enhance your experience
                    </p>
                </div>
            </motion.section>

            {/* Content */}
            <motion.section
                className="py-12 px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Cookies are small data files that are placed on your device (computer, tablet, or mobile phone) when you visit our website. They are widely used to make websites work more efficiently and to provide information to the website owners.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            BuyJan uses the following types of cookies:
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Essential Cookies</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            These cookies are necessary for the website to function properly. They enable you to navigate the website and use its features, such as accessing secure areas, remembering your preferences, and completing transactions.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Performance Cookies</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            These cookies collect anonymous information about how visitors use our website, including the number of visitors, which pages are visited most often, and how visitors navigate the site. This information helps us improve website performance and user experience.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Functional Cookies</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            These cookies remember choices you make on our website, such as your language preference, selected currency, and items in your shopping cart. This allows us to provide a more personalized experience.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Marketing Cookies</h3>
                        <p className="text-gray-700 leading-relaxed">
                            These cookies track your online activity to display targeted advertisements based on your interests. They may be set by advertising partners and help measure the effectiveness of advertising campaigns.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Cookies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use cookies for the following purposes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>To authenticate users and provide secure access to the website</li>
                            <li>To remember user preferences and settings</li>
                            <li>To analyze website traffic and user behavior</li>
                            <li>To improve website functionality and user experience</li>
                            <li>To deliver personalized content and recommendations</li>
                            <li>To enable social media features and social sharing</li>
                            <li>To serve targeted advertisements and measure campaign effectiveness</li>
                            <li>To prevent fraud and ensure website security</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            In addition to our own cookies, we may allow third-party service providers to place cookies on your device. These include:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Analytics providers (e.g., Google Analytics) to track website performance</li>
                            <li>Advertising partners to deliver targeted ads</li>
                            <li>Payment processors to facilitate secure transactions</li>
                            <li>Social media platforms for integration and sharing features</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            These third parties have their own cookie policies and privacy practices. We recommend reviewing their policies for more information.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookie Duration</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Cookies can be categorized based on their duration:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li><strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser</li>
                            <li><strong>Persistent Cookies:</strong> These remain on your device for a set period (ranging from days to years) until they expire or are deleted</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Managing Cookies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You have control over cookies and can manage them through your browser settings:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Accept or reject cookies when you first visit our website</li>
                            <li>Configure your browser to decline cookies</li>
                            <li>Delete cookies from your device at any time</li>
                            <li>Disable cookies for specific websites</li>
                            <li>Use private or incognito browsing modes</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            <strong>Note:</strong> Disabling essential cookies may affect your ability to use certain features of our website, such as logging in or completing purchases.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookie Consent</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We require your explicit consent before placing non-essential cookies on your device. When you first visit our website, you will be presented with a cookie consent banner that allows you to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Accept all cookies</li>
                            <li>Reject non-essential cookies</li>
                            <li>Customize your cookie preferences</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We take appropriate measures to protect cookie data from unauthorized access, alteration, or disclosure. However, no transmission over the Internet is completely secure, and we cannot guarantee absolute security of cookie information.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Do Not Track</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Some browsers include a "Do Not Track" feature. Currently, there is no industry standard for recognizing Do Not Track signals. BuyJan currently does not respond to Do Not Track browser signals, but we provide you with options to control the collection and use of cookies as described in this policy.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Cookies Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Cookies Policy from time to time to reflect changes in technology, legal requirements, or our practices. We will notify you of significant changes by posting the updated policy on this page and updating the "effective date."
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have questions about our use of cookies or this Cookies Policy, please contact us at:
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Email:</strong> privacy@buyjan.com</p>
                            <p><strong>Address:</strong> Muscat, Sultanate of Oman</p>
                            <p><strong>Phone:</strong> +968 2468 1234</p>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <p className="text-blue-800 text-sm">
                            <strong>Last Updated:</strong> January 2025
                        </p>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
