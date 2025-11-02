'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function PrivacyContent() {
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
                        Privacy Policy
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Learn how we protect and handle your personal information
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            BuyJan ("we", "us", "our", or "Company") operates the www.buyjan.com website (the "Service").
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We collect several different types of information for various purposes to provide and improve our Service to you.
                        </p>
                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Types of Data Collected:</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Personal identification information (name, email address, phone number, etc.)</li>
                            <li>Billing and shipping address information</li>
                            <li>Order history and transaction information</li>
                            <li>Device information and browsing data</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            BuyJan uses the collected data for various purposes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>To provide and maintain our Service</li>
                            <li>To process your transactions and send related information</li>
                            <li>To send you marketing and promotional communications</li>
                            <li>To monitor and analyze trends, usage, and activities related to our Service</li>
                            <li>To improve, personalize, and expand our Service</li>
                            <li>To detect, prevent, and address technical and security issues</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Data</h2>
                        <p className="text-gray-700 leading-relaxed">
                            The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Service Providers</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We may employ third party companies and individuals to facilitate our Service ("Service Providers"), provide the Service on our behalf, perform Service-related services or assist us in analyzing how our Service is used.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy, please contact us at:
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
