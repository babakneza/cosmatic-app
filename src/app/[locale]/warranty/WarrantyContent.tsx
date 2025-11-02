'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function WarrantyContent() {
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

    const warrantyTypes = [
        {
            title: 'Manufacturer Warranty',
            duration: 'Varies by Product',
            coverage: 'Defects in materials and workmanship',
            description: 'Most beauty and cosmetic products come with manufacturer warranties. The duration and coverage depend on the brand and product type.',
            icon: '🏭',
        },
        {
            title: 'BuyJan Authenticity Guarantee',
            duration: 'Lifetime',
            coverage: '100% authentic products',
            description: 'We guarantee that all products sold on BuyJan are 100% authentic. If a product is found to be counterfeit, we will provide a full refund or replacement.',
            icon: '✓',
        },
        {
            title: 'Defective Product Guarantee',
            duration: '30 Days',
            coverage: 'Manufacturing defects',
            description: 'If you receive a defective product due to manufacturing issues, we will replace it or refund your money within 30 days of purchase.',
            icon: '🔧',
        },
    ];

    const whatsCovered = [
        'Manufacturing defects in product quality',
        'Defective packaging or sealing',
        'Products that arrived damaged due to manufacturing',
        'Products that fail to function as advertised',
        'Expired or compromised product formulations',
        'Missing or incorrect items in orders',
    ];

    const whatIsNotCovered = [
        'Product expiration after purchase (if stored improperly)',
        'Allergic reactions or skin sensitivities',
        'Misuse or improper application of products',
        'Products purchased from unauthorized sellers',
        'Expired products (check expiration date before use)',
        'Damage caused by improper storage or handling',
        'Natural discoloration or separation in products',
        'Results or effectiveness claims not guaranteed',
    ];

    const claimProcess = [
        {
            step: 1,
            title: 'Report the Issue',
            description: 'Contact our customer service within 14 days of discovering the issue with photos/videos of the defect.',
            icon: '📞',
        },
        {
            step: 2,
            title: 'Provide Evidence',
            description: 'Send clear photos or videos showing the defect or damage. Include your order number and proof of purchase.',
            icon: '📸',
        },
        {
            step: 3,
            title: 'Assessment',
            description: 'Our team reviews your claim and verifies the issue. This typically takes 2-3 business days.',
            icon: '🔍',
        },
        {
            step: 4,
            title: 'Resolution',
            description: 'We will provide a replacement, refund, or store credit based on the warranty terms and situation.',
            icon: '✅',
        },
    ];

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
                        Warranty & Guarantees
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Your protection and satisfaction guaranteed
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
                    {/* Warranty Overview */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8 border-l-4 border-gold">
                        <div className="flex items-start gap-3 mb-4">
                            <Shield className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                            <h2 className="text-2xl font-bold text-gray-900">Our Warranty Commitment</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            At BuyJan, we stand behind the quality of our products. We offer comprehensive warranties and guarantees to ensure you receive authentic, high-quality beauty and cosmetic products. Our warranty protection applies to all purchases made directly from BuyJan.
                        </p>
                    </motion.div>

                    {/* Warranty Types */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Warranty Types</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {warrantyTypes.map((warranty, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-gold hover:shadow-md transition-shadow"
                                >
                                    <div className="text-4xl mb-4">{warranty.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {warranty.title}
                                    </h3>
                                    <div className="space-y-2 mb-4 pb-4 border-b border-neutral-200">
                                        <div>
                                            <p className="text-xs text-gray-600 uppercase font-semibold">Duration</p>
                                            <p className="font-semibold text-gold">{warranty.duration}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 uppercase font-semibold">Coverage</p>
                                            <p className="text-sm text-gray-900">{warranty.coverage}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        {warranty.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* What's Covered */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <div className="flex items-start gap-3 mb-6">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <h2 className="text-2xl font-bold text-gray-900">What's Covered</h2>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Our warranties cover the following situations:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {whatsCovered.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* What's Not Covered */}
                    <motion.div variants={itemVariants} className="bg-orange-50 rounded-lg shadow-sm p-8 mb-8 border border-orange-200">
                        <div className="flex items-start gap-3 mb-6">
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                            <h2 className="text-2xl font-bold text-gray-900">What's NOT Covered</h2>
                        </div>
                        <p className="text-gray-700 mb-4">
                            The following situations are not covered by our warranties:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {whatIsNotCovered.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-orange-600 font-bold mt-0.5">✕</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Manufacturer Warranties */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manufacturer Warranties</h2>
                        <p className="text-gray-700 mb-6">
                            Most beauty and cosmetic brands provide their own manufacturer warranties. These warranties cover defects in materials and workmanship. Examples include:
                        </p>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-4 rounded-lg border border-neutral-200">
                                <h3 className="font-semibold text-gray-900 mb-1">Premium Skincare Brands</h3>
                                <p className="text-gray-700 text-sm">Often provide 1-year warranties on high-end products against manufacturing defects.</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-neutral-200">
                                <h3 className="font-semibold text-gray-900 mb-1">Luxury Makeup & Fragrances</h3>
                                <p className="text-gray-700 text-sm">May include limited warranties on specific product types. Check product packaging for details.</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-neutral-200">
                                <h3 className="font-semibold text-gray-900 mb-1">Haircare Products</h3>
                                <p className="text-gray-700 text-sm">Premium brands often warrant their products against defects in formulation and packaging.</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-6">
                            <strong>Note:</strong> Specific warranty details vary by brand. Check the product packaging or consult the manufacturer's website for complete warranty information.
                        </p>
                    </motion.div>

                    {/* Warranty Claim Process */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">How to File a Warranty Claim</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {claimProcess.map((item) => (
                                <motion.div
                                    key={item.step}
                                    variants={itemVariants}
                                    className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-gold text-center"
                                >
                                    <div className="text-3xl mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        Step {item.step}
                                    </h3>
                                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                                        {item.title}
                                    </h4>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Important Information */}
                    <motion.div variants={itemVariants} className="bg-blue-50 rounded-lg shadow-sm p-8 mb-8 border border-blue-200">
                        <div className="flex items-start gap-3 mb-4">
                            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <h2 className="text-2xl font-bold text-gray-900">Important Information</h2>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li>
                                <strong>Timely Reporting:</strong> Report warranty issues within 14 days of discovering the defect for best results.
                            </li>
                            <li>
                                <strong>Proof of Purchase:</strong> Keep your order confirmation email or receipt as proof of purchase from BuyJan.
                            </li>
                            <li>
                                <strong>Product Authenticity:</strong> Warranties only apply to products purchased directly from BuyJan. Third-party purchases are not covered.
                            </li>
                            <li>
                                <strong>Documentation:</strong> Provide clear photos or videos showing the defect or issue.
                            </li>
                            <li>
                                <strong>Expiration Dates:</strong> Always check expiration dates before use. Products past their expiration date are not covered by warranty.
                            </li>
                        </ul>
                    </motion.div>

                    {/* Product Care Tips */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Care Tips</h2>
                        <p className="text-gray-700 mb-4">
                            To maximize product lifespan and maintain warranty coverage:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Store products in cool, dry places away from direct sunlight</li>
                            <li>Keep products in original packaging when possible</li>
                            <li>Do not expose products to extreme temperatures</li>
                            <li>Always check expiration dates before use</li>
                            <li>Follow product usage instructions carefully</li>
                            <li>Keep receipts and order confirmations as proof of purchase</li>
                            <li>Do not mix products with unauthorized additives</li>
                            <li>Report issues promptly within the warranty period</li>
                        </ul>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-green-50 rounded-lg p-8 border border-green-200 text-center"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            File a Warranty Claim
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Have a product issue? Our warranty team is ready to help you get a replacement or refund.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:warranty@buyjan.com"
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                File a Claim
                            </a>
                            <a
                                href="tel:+96824681234"
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                            >
                                Call Warranty Support
                            </a>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
