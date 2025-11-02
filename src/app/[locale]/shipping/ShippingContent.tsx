'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package } from 'lucide-react';

export default function ShippingContent() {
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

    const shippingOptions = [
        {
            name: 'Standard Shipping',
            delivery: '2-5 Business Days',
            cost: 'Free on orders over 50 OMR, 2 OMR otherwise',
            description: 'Standard delivery to your location in Oman. Tracking provided.',
            icon: '📦',
        },
        {
            name: 'Express Shipping',
            delivery: '1-2 Business Days',
            cost: '5 OMR',
            description: 'Fast delivery for time-sensitive orders. Available in Muscat area.',
            icon: '⚡',
        },
        {
            name: 'Next Day Delivery',
            delivery: 'Next Business Day',
            cost: '8 OMR',
            description: 'Available for orders placed before 12 PM in Muscat. Premium fast service.',
            icon: '🚀',
        },
    ];

    const deliveryRegions = [
        {
            region: 'Muscat (Capital)',
            delivery: '1-2 days (Standard: 2-3 days)',
            note: 'Fastest delivery to the main areas',
        },
        {
            region: 'Salalah & Dhofar Region',
            delivery: '3-5 days',
            note: 'Coastal regions',
        },
        {
            region: 'Sohar & Al Batinah',
            delivery: '2-4 days',
            note: 'Northern regions',
        },
        {
            region: 'Nizwa & Al Dakhliyah',
            delivery: '3-5 days',
            note: 'Interior regions',
        },
        {
            region: 'Sur & Ash Sharqiyah',
            delivery: '3-5 days',
            note: 'Eastern regions',
        },
    ];

    const shippingProcess = [
        {
            step: 1,
            title: 'Order Placed',
            description: 'Your order is confirmed and payment is processed',
            icon: '✓',
        },
        {
            step: 2,
            title: 'Preparing Package',
            description: 'Our team carefully prepares and packs your order (1-2 business days)',
            icon: '📦',
        },
        {
            step: 3,
            title: 'Shipped',
            description: 'Package is handed to our shipping partner. Tracking number sent to your email.',
            icon: '📮',
        },
        {
            step: 4,
            title: 'In Transit',
            description: 'Your package is on its way. You can track it in real-time.',
            icon: '🚚',
        },
        {
            step: 5,
            title: 'Delivered',
            description: 'Package arrives at your doorstep. Delivery confirmation sent.',
            icon: '🎉',
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
                        Shipping Information
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Fast and reliable shipping across Oman
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
                    {/* Shipping Options */}
                    <motion.div variants={itemVariants} className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Shipping Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {shippingOptions.map((option, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-gold hover:shadow-md transition-shadow"
                                >
                                    <div className="text-4xl mb-4">{option.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {option.name}
                                    </h3>
                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Delivery Time</p>
                                            <p className="font-semibold text-gold">{option.delivery}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Cost</p>
                                            <p className="font-semibold text-gray-900">{option.cost}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        {option.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Delivery Regions */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <div className="flex items-start gap-3 mb-6">
                            <MapPin className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                            <h2 className="text-3xl font-bold text-gray-900">Delivery Regions</h2>
                        </div>
                        <p className="text-gray-700 mb-6">
                            We deliver throughout the Sultanate of Oman. Here are typical delivery times by region:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deliveryRegions.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="bg-gray-50 rounded-lg p-4 border border-neutral-200"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-2">{item.region}</h3>
                                    <p className="text-gold font-semibold text-sm mb-1">{item.delivery}</p>
                                    <p className="text-gray-600 text-sm">{item.note}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Shipping Process */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Shipping Process</h2>
                        <div className="space-y-4">
                            {shippingProcess.map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    variants={itemVariants}
                                    className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gold flex items-start gap-4"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gold/10 text-2xl">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Step {item.step}: {item.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tracking */}
                    <motion.div variants={itemVariants} className="bg-blue-50 rounded-lg shadow-sm p-8 mb-8 border border-blue-200">
                        <div className="flex items-start gap-3 mb-4">
                            <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <h2 className="text-2xl font-bold text-gray-900">Track Your Order</h2>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Once your order ships, you'll receive a tracking number via email. You can use this number to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                            <li>Track your package in real-time on our website</li>
                            <li>Monitor the shipping carrier's updates</li>
                            <li>Get estimated delivery date and time</li>
                            <li>Receive delivery confirmation notifications</li>
                        </ul>
                        <a
                            href="#"
                            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Track My Order
                        </a>
                    </motion.div>

                    {/* Shipping Restrictions */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Restrictions</h2>
                        <p className="text-gray-700 mb-4">
                            Please note the following:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>We currently only ship within the Sultanate of Oman</li>
                            <li>Some products may have restrictions based on content or regulations</li>
                            <li>PO Box delivery is not available; a physical address is required</li>
                            <li>Shipping to remote areas may incur additional charges</li>
                            <li>Hazardous materials require special handling and may have shipping limitations</li>
                        </ul>
                    </motion.div>

                    {/* Shipping Policies */}
                    <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Policies</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
                                <p className="text-gray-700">
                                    Orders are processed within 1-2 business days. During weekends and public holidays, processing may take longer.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Carrier Responsibility</h3>
                                <p className="text-gray-700">
                                    Once handed to the shipping carrier, BuyJan is not responsible for delays caused by the carrier or customs issues. We recommend purchasing shipping insurance for high-value orders.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Delivery Confirmation</h3>
                                <p className="text-gray-700">
                                    Delivery confirmation is required. If a package cannot be delivered, it will be returned to us and you will be contacted.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Lost or Damaged Packages</h3>
                                <p className="text-gray-700">
                                    If your package is lost or damaged in transit, contact us immediately with tracking details and photos. We will work with the carrier to resolve the issue.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-green-50 rounded-lg p-8 border border-green-200 text-center"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Questions About Shipping?
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Our shipping team is here to help you with any questions or concerns.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:shipping@buyjan.com"
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Email Shipping Support
                            </a>
                            <a
                                href="tel:+96824681234"
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                            >
                                Call Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
