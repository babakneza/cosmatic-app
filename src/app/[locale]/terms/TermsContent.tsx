'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function TermsContent() {
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
                        Terms & Conditions
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Please read these terms carefully before using our service
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            By accessing and using the BuyJan website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. License to Use Website</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            BuyJan grants you a limited license to access and use the website for the purpose of shopping for beauty and cosmetic products. You agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Reproduce, duplicate, or copy content from the website</li>
                            <li>Sell, resell, or exploit the website or its content</li>
                            <li>Access the website through automated means</li>
                            <li>Circumvent any security or access control measures</li>
                            <li>Use the website for unlawful purposes</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Product Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We strive to provide accurate and detailed product information, including descriptions, images, and pricing. However:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>We do not guarantee the accuracy of all product information</li>
                            <li>Prices are subject to change without notice</li>
                            <li>We reserve the right to correct errors and update information</li>
                            <li>Product availability is subject to stock levels</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Purchase Terms</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            By placing an order on BuyJan, you represent that:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>You are 18 years of age or older</li>
                            <li>You are authorized to make the purchase</li>
                            <li>The information provided is accurate and current</li>
                            <li>You will pay all charges incurred with your order</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            We reserve the right to refuse or cancel any order at our sole discretion.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment and Billing</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            All prices are in Omani Rial (OMR) and include applicable taxes unless otherwise stated. By providing payment information, you authorize BuyJan to charge your account for the total purchase amount, including shipping and handling fees.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Shipping and Delivery</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We endeavor to ship orders promptly, but delivery times are estimates only. BuyJan is not responsible for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Delays caused by shipping carriers</li>
                            <li>Customs or import delays</li>
                            <li>Damage during transit by the carrier</li>
                            <li>Loss or theft after delivery confirmation</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Returns and Refunds</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We want you to be satisfied with your purchase. Our return policy allows:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Returns within 30 days of purchase</li>
                            <li>Products must be unused and in original condition</li>
                            <li>Original packaging and documentation must be included</li>
                            <li>Refunds are processed within 7-10 business days after inspection</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Items marked as final sale are not eligible for return or refund.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Warranty Disclaimer</h2>
                        <p className="text-gray-700 leading-relaxed">
                            The website and all products are provided on an "as-is" basis. BuyJan makes no warranties, expressed or implied, regarding the fitness of products for a particular purpose or the merchantability of any product. All warranty information for specific products should be obtained from the manufacturer.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed">
                            In no event shall BuyJan be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of the website or purchase of products, even if BuyJan has been advised of the possibility of such damages.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            BuyJan reserves the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following any changes constitutes your acceptance of the new terms.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These terms and conditions are governed by and construed in accordance with the laws of the Sultanate of Oman, and you irrevocably submit to the exclusive jurisdiction of the courts located in Muscat, Oman.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about these Terms & Conditions, please contact us at:
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Email:</strong> support@buyjan.com</p>
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
