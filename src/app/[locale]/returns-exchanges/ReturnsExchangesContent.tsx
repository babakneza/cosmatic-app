'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Truck } from 'lucide-react';

export default function ReturnsExchangesContent() {
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

    const steps = [
        {
            number: 1,
            title: 'Contact Us',
            description: 'Initiate a return or exchange request within 30 days of purchase by contacting our customer service team via email or phone.',
            icon: '📞',
        },
        {
            number: 2,
            title: 'Get Return Authorization',
            description: 'Our team will review your request and provide you with a Return Authorization (RA) number and return shipping instructions.',
            icon: '✓',
        },
        {
            number: 3,
            title: 'Ship the Item',
            description: 'Carefully pack the item in its original packaging and ship it to the return address provided with your RA number clearly marked.',
            icon: '📦',
        },
        {
            number: 4,
            title: 'Inspection & Processing',
            description: 'We inspect the returned item to verify its condition and eligibility. This typically takes 3-5 business days.',
            icon: '🔍',
        },
        {
            number: 5,
            title: 'Refund or Exchange',
            description: 'Once approved, we process your refund or ship your exchange item. Refunds are issued to the original payment method.',
            icon: '💰',
        },
    ];

    const conditions = [
        {
            title: 'Unused & Unopened',
            description: 'Products must be completely unused, unopened, and in original sealed packaging.',
            icon: '📦',
        },
        {
            title: 'Original Condition',
            description: 'Items must not show any signs of use, damage, or wear. All labels and seals must be intact.',
            icon: '✨',
        },
        {
            title: 'Original Packaging',
            description: 'All original boxes, inserts, documentation, and protective materials must be included.',
            icon: '📄',
        },
        {
            title: 'With Proof of Purchase',
            description: 'Original order confirmation email or receipt must be provided with the return request.',
            icon: '💳',
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
                        Returns & Exchanges
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Easy and hassle-free returns within 30 days of purchase
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
                    {/* Return Policy Overview */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8 border-l-4 border-gold">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Return Policy</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            At BuyJan, we want you to be completely satisfied with your purchase. We offer a 30-day return window from the date of purchase for items that meet our return conditions. If you're not happy with your purchase for any reason, we make returns easy and straightforward.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-blue-800 font-semibold">
                                ✓ 30-Day Return Window | ✓ Free Return Shipping Label | ✓ Full Refund Guaranteed
                            </p>
                        </div>
                    </motion.div>

                    {/* Return Process Steps */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return or Exchange</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.number}
                                    variants={itemVariants}
                                    className="bg-white rounded-lg shadow-sm p-6 text-center border-t-4 border-gold hover:shadow-md transition-shadow"
                                >
                                    <div className="text-4xl mb-3">{step.icon}</div>
                                    <h3 className="font-bold text-gray-900 mb-2 text-sm">
                                        Step {step.number}
                                    </h3>
                                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                                        {step.title}
                                    </h4>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Return Conditions */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Conditions</h2>
                        <p className="text-gray-700 mb-6">
                            To ensure a smooth return process and maintain our high standards, returned items must meet the following conditions:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {conditions.map((condition, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-gray-50 rounded-lg p-4 border border-neutral-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0">{condition.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {condition.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {condition.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Non-Returnable Items */}
                    <motion.div variants={itemVariants} className="bg-orange-50 rounded-lg shadow-sm p-8 mb-8 border border-orange-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Returnable Items</h2>
                                <p className="text-gray-700 mb-4">
                                    The following items cannot be returned or exchanged:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Items marked as "Final Sale"</li>
                                    <li>Used, opened, or tested products</li>
                                    <li>Products with damaged or missing original packaging</li>
                                    <li>Items purchased more than 30 days ago</li>
                                    <li>Gift cards and digital products</li>
                                    <li>Clearance or liquidation items</li>
                                    <li>Products without original proof of purchase</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Exchange Process */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchange Process</h2>
                        <p className="text-gray-700 mb-4">
                            If you'd like to exchange your item for a different size, color, or product:
                        </p>
                        <ol className="list-decimal list-inside space-y-3 text-gray-700">
                            <li>Contact our customer service team with your order number and the item you want to exchange</li>
                            <li>Confirm the new product, size, and color you'd like</li>
                            <li>Receive return authorization and shipping instructions</li>
                            <li>Ship the original item back to us</li>
                            <li>Once received and inspected, we'll ship your new item immediately</li>
                        </ol>
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">
                                <strong>✓ No additional shipping cost</strong> if exchanging for an item of equal or lower value. Price differences will be refunded or charged accordingly.
                            </p>
                        </div>
                    </motion.div>

                    {/* Refund Timeline */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <div className="flex items-start gap-3 mb-6">
                            <Clock className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Refund Timeline</h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 pb-4 border-b border-neutral-200">
                                <div className="w-24 flex-shrink-0">
                                    <p className="font-semibold text-gold">Day 1-3</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Receive Package</p>
                                    <p className="text-gray-600 text-sm">Your returned item arrives at our warehouse</p>
                                </div>
                            </div>
                            <div className="flex gap-4 pb-4 border-b border-neutral-200">
                                <div className="w-24 flex-shrink-0">
                                    <p className="font-semibold text-gold">Day 4-5</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Inspection</p>
                                    <p className="text-gray-600 text-sm">We inspect the item to verify return eligibility</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-24 flex-shrink-0">
                                    <p className="font-semibold text-gold">Day 6-10</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Refund Issued</p>
                                    <p className="text-gray-600 text-sm">Refund is processed to your original payment method (5-7 business days to appear)</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Special Circumstances */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Damaged or Defective Items</h2>
                        <p className="text-gray-700 mb-4">
                            If you receive a damaged, defective, or incorrect item, we will replace it or refund you immediately at no cost:
                        </p>
                        <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
                            <li>Contact us within 24 hours of receiving your order</li>
                            <li>Provide clear photos or videos of the damage/defect</li>
                            <li>We will authorize a replacement or full refund immediately</li>
                            <li>No return shipping is required for damaged items</li>
                        </ol>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 font-semibold">
                                Important: Report damage within 24 hours to ensure quick resolution
                            </p>
                        </div>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-blue-50 rounded-lg p-8 border border-blue-200 text-center"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Need Help with a Return?
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Our customer support team is ready to assist you with your return or exchange.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:returns@buyjan.com"
                                className="px-6 py-3 bg-gold hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Email Returns Support
                            </a>
                            <a
                                href="tel:+96824681234"
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                            >
                                Call Customer Service
                            </a>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
