'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { useCheckoutStore } from '@/store/checkout';
import Price from '@/components/ui/Price';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getOrder } from '@/lib/api/orders';
import { Locale } from '@/types';
import { Order, Customer } from '@/types/collections';
import axios from 'axios';

interface ConfirmationPageContentProps {
    locale: Locale;
    orderId: string;
    orderNumber: string;
}

export default function ConfirmationPageContent({
    locale,
    orderId,
    orderNumber,
}: ConfirmationPageContentProps) {
    const router = useRouter();
    const t = useTranslations();
    const isArabic = locale === 'ar';
    const { access_token, user } = useAuth();

    // State management
    const [order, setOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get checkout data
    const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
    const shippingMethod = useCheckoutStore((state) => state.shippingMethod);
    const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
    const orderDetails = useCheckoutStore((state) => state.orderDetails);

    // Fetch order details
    useEffect(() => {
        const fetchOrderData = async () => {
            if (!orderId) {
                setError('Missing order information');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                console.log('[Confirmation] Fetching order:', orderId);

                // Try to fetch order details if we have a token
                if (access_token) {
                    try {
                        const orderData = await getOrder(orderId, access_token);
                        setOrder(orderData);

                        // Fetch customer details if order has customer_id
                        if (orderData.customer) {
                            try {
                                const customerResponse = await axios.get(
                                    `/api/customers/${orderData.customer}`,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${access_token}`,
                                        },
                                    }
                                );
                                setCustomer(customerResponse.data.data);
                            } catch (err) {
                                console.log('[Confirmation] Customer fetch optional, continuing...');
                            }
                        }
                    } catch (err: any) {
                        // If 401 or fetch fails, use cached order details from checkout store
                        if (orderDetails) {
                            console.log('[Confirmation] Using cached order details from checkout store');
                            setOrder({
                                id: parseInt(orderId),
                                order_number: orderNumber,
                                ...orderDetails
                            } as any);
                        } else {
                            console.error('[Confirmation] Error fetching order:', err);
                            setError('Unable to load order details. Please refresh the page.');
                        }
                    }
                } else if (orderDetails) {
                    // Use cached order details if no token
                    console.log('[Confirmation] Using cached order details from checkout store (no token)');
                    setOrder({
                        id: parseInt(orderId),
                        order_number: orderNumber,
                        ...orderDetails
                    } as any);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderData();
    }, [orderId, orderNumber, access_token, orderDetails]);

    // Format date helper
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return new Date().toLocaleDateString(isArabic ? 'ar-OM' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const date = new Date(dateString);
        return date.toLocaleDateString(isArabic ? 'ar-OM' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate estimated delivery days based on shipping method
    const getEstimatedDelivery = () => {
        if (!shippingMethod) return 'N/A';

        const today = new Date();
        let days = 0;

        switch (shippingMethod.id) {
            case 'standard':
                days = 5;
                break;
            case 'express':
                days = 2;
                break;
            case 'overnight':
                days = 1;
                break;
            default:
                days = 5;
        }

        const deliveryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        return deliveryDate.toLocaleDateString(isArabic ? 'ar-OM' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const shippingMethodName = shippingMethod?.name || t('checkout.shipping_method_standard');
    const paymentMethodName = paymentMethod?.name || 'Unknown';
    const customerLastName = customer?.user?.last_name || 'Valued Customer';

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
                    <p className="text-gray-600 text-lg">{t('checkout.loading_order_details') || 'Loading your order confirmation...'}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 rounded-lg p-8 border-2 border-red-200 text-center">
                <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Order</h2>
                <p className="text-red-700 mb-6">{error}</p>
                <Link href={`/${locale}`}>
                    <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                        Return to Home
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className={`space-y-8 ${isArabic ? 'text-right' : 'text-left'}`}>
            {/* Premium Success Header */}
            <div className="bg-gradient-to-br from-[#D4AF37] via-[#E8C547] to-[#C19B1A] rounded-2xl p-8 md:p-12 shadow-xl">
                <div className="text-center space-y-6">
                    {/* Animated Success Icon */}
                    <div className="flex justify-center mb-2">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <svg className="w-10 h-10 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                            Thank You, {customerLastName}!
                        </h1>
                        <p className="text-lg md:text-xl text-white/95 font-light">
                            Your order has been successfully submitted
                        </p>
                    </div>

                    {/* Personalized Message */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 md:p-8 space-y-4 text-white/90 border border-white/30">
                        <p className="text-lg leading-relaxed">
                            We're delighted that you've chosen BuyJan for your premium cosmetics. Your order confirmation has been received and we're now preparing it for shipment.
                        </p>
                        <p className="text-lg leading-relaxed">
                            Our team will carefully process your purchase and ensure it reaches you in perfect condition. You'll receive regular updates on your order status via email.
                        </p>
                    </div>
                </div>
            </div>

            {/* Premium Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Number & Status */}
                <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-[#D4AF37]">
                            <svg className="w-6 h-6 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 000 2h12a1 1 0 100-2h-1a1 1 0 000-2 2 2 0 00-2 2v1a1 1 0 100 2v1a1 1 0 100-2V5zm0 5a1 1 0 000 2h6a1 1 0 000-2H4zm0 3a1 1 0 000 2h2a1 1 0 100-2H4z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Order Number</h3>
                        </div>
                        <p className="text-3xl font-mono font-bold text-[#D4AF37] break-all">{order?.order_number || orderNumber}</p>
                        <div className="pt-4 border-t border-gray-200">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Confirmed
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Date */}
                <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-[#D4AF37]">
                            <svg className="w-6 h-6 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Order Date</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDate(order?.created_at)}</p>
                        <p className="text-sm text-gray-600 pt-2">
                            {isArabic ? 'تاريخ تقديم طلبك' : 'Your order submission date'}
                        </p>
                    </div>
                </div>

                {/* Tracking Information */}
                <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-[#D4AF37]">
                            <svg className="w-6 h-6 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Tracking</h3>
                        </div>
                        {order?.tracking_number ? (
                            <>
                                <p className="text-2xl font-mono font-bold text-[#D4AF37] break-all">{order.tracking_number}</p>
                                <p className="text-sm text-gray-600 pt-2">
                                    {isArabic ? 'رقم تتبع الشحنة' : 'Tracking number provided'}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600 font-semibold">Coming Soon</p>
                                <p className="text-sm text-gray-600 pt-2">
                                    {isArabic ? 'سيتم تحديثك عند إرسال الطلب' : "You'll receive tracking info once shipped"}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Shipping & Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#D4AF37]">
                        <svg className="w-6 h-6 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                    </div>
                    {shippingAddress ? (
                        <div className="space-y-3 text-gray-700">
                            <p className="font-bold text-lg">{shippingAddress.full_name}</p>
                            <p className="text-gray-600">{shippingAddress.street_address}</p>
                            {(shippingAddress.building || shippingAddress.floor || shippingAddress.apartment) && (
                                <p className="text-gray-600">
                                    {[
                                        shippingAddress.building && `Bld: ${shippingAddress.building}`,
                                        shippingAddress.floor && `Floor: ${shippingAddress.floor}`,
                                        shippingAddress.apartment && `Apt: ${shippingAddress.apartment}`,
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            )}
                            <p className="text-gray-600">
                                {shippingAddress.wilayat || 'Wilayat'}, {shippingAddress.governorate || 'Governorate'}
                            </p>
                            <p className="font-semibold text-[#D4AF37] mt-4">{shippingAddress.phone}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No address information available</p>
                    )}
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#D4AF37]">
                        <svg className="w-6 h-6 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-semibold">Selected Payment Method</p>
                            <p className="text-2xl font-bold text-gray-900">{paymentMethodName}</p>
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-bold text-blue-900">🔒 Payment Security</p>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                All payments are securely processed and encrypted. Your payment information is never shared with third parties.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Summary - Premium Card */}
            {orderDetails && (
                <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <svg className="w-8 h-8 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                            <path d="M16 16a2 2 0 11-4 0 2 2 0 014 0zM4 12a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Order Summary
                    </h2>
                    <div className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                        <div className={`flex justify-between items-center pb-4 border-b-2 border-gray-200 ${isArabic ? 'flex-row-reverse' : ''}`}>
                            <span className="text-gray-700 font-semibold">Subtotal</span>
                            <Price amount={orderDetails.subtotal} locale={locale} className="font-bold text-lg" />
                        </div>
                        <div className={`flex justify-between items-center pb-4 border-b-2 border-gray-200 ${isArabic ? 'flex-row-reverse' : ''}`}>
                            <span className="text-gray-700 font-semibold">Shipping</span>
                            <Price amount={orderDetails.shipping} locale={locale} className="font-bold text-lg" />
                        </div>
                        {orderDetails.tax > 0 && (
                            <div className={`flex justify-between items-center pb-4 border-b-2 border-gray-200 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                <span className="text-gray-700 font-semibold">Tax</span>
                                <Price amount={orderDetails.tax} locale={locale} className="font-bold text-lg" />
                            </div>
                        )}
                        <div className={`flex justify-between items-center pt-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
                            <span className="text-2xl font-bold text-gray-900">Total Amount</span>
                            <div className="text-3xl font-bold text-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C19B1A] bg-clip-text text-transparent">
                                <Price amount={orderDetails.total} locale={locale} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* What Happens Next - Premium Section */}
            <div className="bg-gradient-to-r from-[#006400] to-[#004d00] rounded-xl p-8 md:p-10 shadow-xl text-white">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    What Happens Next?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold">1</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Confirmation Sent</h3>
                        <p className="text-white/90 text-sm">
                            A detailed confirmation email will be sent to your registered email address with all order details.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold">2</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Order Processing</h3>
                        <p className="text-white/90 text-sm">
                            Our team will carefully prepare and quality check your order before shipping.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold">3</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Track Your Order</h3>
                        <p className="text-white/90 text-sm">
                            You'll receive tracking information so you can monitor your shipment every step of the way.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Premium Style */}
            <div className={`flex flex-col md:flex-row gap-4 ${isArabic ? 'md:flex-row-reverse' : ''}`}>
                <Link href={`/${locale}`} className="flex-1">
                    <button className="w-full px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#C19B1A] text-white font-bold rounded-lg hover:shadow-xl transition-all text-lg hover:-translate-y-1">
                        Continue Shopping
                    </button>
                </Link>
                <Link href={`/${locale}/account/orders`} className="flex-1">
                    <button className="w-full px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 font-bold rounded-lg hover:shadow-xl transition-all text-lg hover:-translate-y-1">
                        View My Orders
                    </button>
                </Link>
            </div>

            {/* Professional Footer Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Need Assistance?
                        </h3>
                        <p className="text-gray-700 mb-2">
                            Our customer support team is here to help you 24/7.
                        </p>
                        <p className="text-[#D4AF37] font-bold">
                            📧 support@buyjan.com
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Fast Delivery
                        </h3>
                        <p className="text-gray-700">
                            We ship to all regions in Oman with express and standard options available.
                        </p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
                    <p>Order ID: <span className="font-mono font-bold text-gray-900">{order?.order_number || orderNumber}</span></p>
                    <p className="mt-2 text-xs">
                        Thank you for shopping with BuyJan. We look forward to serving you again!
                    </p>
                </div>
            </div>
        </div>
    );
}