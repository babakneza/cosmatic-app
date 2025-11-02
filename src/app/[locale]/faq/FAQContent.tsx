'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export default function FAQContent() {
    const t = useTranslations();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const faqs: FAQItem[] = [
        {
            id: '1',
            question: 'How can I place an order?',
            answer: 'Simply browse our collection, select the products you like, add them to your cart, and proceed to checkout. Enter your shipping and payment information, and confirm your order. You will receive an order confirmation email with tracking details.',
        },
        {
            id: '2',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and secure online payment gateways. All transactions are encrypted and secure. We currently do not accept cash on delivery.',
        },
        {
            id: '3',
            question: 'Is it safe to shop on BuyJan?',
            answer: 'Yes, BuyJan uses industry-standard SSL encryption to protect your personal and financial information. All data is securely stored and we never share your information with unauthorized third parties. We are committed to maintaining your privacy.',
        },
        {
            id: '4',
            question: 'How long does shipping take?',
            answer: 'Standard shipping within Oman typically takes 2-5 business days. Express delivery options are available for 1-2 day delivery. Delivery times may vary during peak seasons or holidays. You will receive tracking information once your order ships.',
        },
        {
            id: '5',
            question: 'Do you ship internationally?',
            answer: 'Currently, we offer shipping within the Sultanate of Oman only. International shipping may be available in the future. Please check back or contact us for updates.',
        },
        {
            id: '6',
            question: 'What is your return policy?',
            answer: 'We accept returns within 30 days of purchase. Products must be unused, in original condition, and in original packaging. Simply contact our customer service with your order number, and we will arrange a return. Refunds are processed within 7-10 business days after inspection.',
        },
        {
            id: '7',
            question: 'Can I cancel or modify my order?',
            answer: 'If your order has not yet shipped, we can cancel or modify it. Please contact customer service immediately with your order number. Once an order has been dispatched, you will need to return it according to our return policy.',
        },
        {
            id: '8',
            question: 'How can I track my order?',
            answer: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package in real-time on the shipping carrier\'s website. You can also check your order status in your BuyJan account under "My Orders".',
        },
        {
            id: '9',
            question: 'Are all products authentic?',
            answer: 'Yes, BuyJan only sells 100% authentic products sourced directly from authorized distributors and brand representatives. We guarantee the authenticity of all items sold on our platform. If you have concerns about a product\'s authenticity, please contact us immediately.',
        },
        {
            id: '10',
            question: 'How do I know if a product is suitable for my skin type?',
            answer: 'Each product listing includes detailed information about skin types it is suitable for. Most products are labeled for specific skin concerns (oily, dry, sensitive, combination, etc.). We also provide ingredient lists so you can check for any potential allergens. When in doubt, consult with a dermatologist or contact our customer service.',
        },
        {
            id: '11',
            question: 'Can I purchase as a gift?',
            answer: 'Absolutely! We offer gift wrapping options for an additional fee. You can also add a personalized gift message during checkout. A separate invoice can be included or omitted if requested.',
        },
        {
            id: '12',
            question: 'Do you offer discounts or promotions?',
            answer: 'Yes, we regularly offer discounts, seasonal sales, and promotional codes. Subscribe to our newsletter to stay updated on the latest offers. We also have a loyalty program where you can earn points on every purchase.',
        },
        {
            id: '13',
            question: 'What should I do if I received a damaged product?',
            answer: 'If you receive a damaged or defective product, contact us within 24 hours with photos of the damage. We will arrange a replacement or refund immediately at no cost to you. Your satisfaction is our priority.',
        },
        {
            id: '14',
            question: 'How do I create an account?',
            answer: 'Click on "Sign Up" in the top navigation menu, enter your email and create a password, then verify your email address. You can also sign up using your social media accounts for a quicker process. Creating an account allows you to save addresses, track orders, and access your order history.',
        },
        {
            id: '15',
            question: 'What if I forgot my password?',
            answer: 'Click "Forgot Password" on the login page and enter your email address. You will receive a password reset link. Follow the instructions in the email to create a new password. The link expires after 24 hours for security purposes.',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
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
                        Frequently Asked Questions
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Find answers to common questions about our products and services
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
                    {/* FAQs List */}
                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <motion.div
                                key={faq.id}
                                variants={itemVariants}
                                className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200"
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                                        {faq.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-shrink-0"
                                    >
                                        <ChevronDown className="w-5 h-5 text-gold" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {expandedId === faq.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-neutral-200 overflow-hidden"
                                        >
                                            <div className="px-6 py-4 bg-gray-50">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200 text-center"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Didn't find what you're looking for?
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Our customer support team is here to help. Get in touch with us anytime!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:support@buyjan.com"
                                className="px-6 py-3 bg-gold hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Email Us
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
