'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getOrder } from '@/lib/api/orders';
import { Order } from '@/types/collections';
import { Package, MapPin, CreditCard, Truck, Download, Copy, Phone, Mail, MessageSquare, RotateCcw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatOMR } from '@/lib/currency';

interface OrderDetailsProps {
    orderId: string;
    accessToken: string;
}

export default function OrderDetails({ orderId, accessToken }: OrderDetailsProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedTracking, setCopiedTracking] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await getOrder(orderId, accessToken);
                setOrder(result);
            } catch (err: any) {
                console.error('Failed to fetch order:', err);
                setError(err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, accessToken]);

    const handleCopyTracking = (trackingNumber: string) => {
        navigator.clipboard.writeText(trackingNumber);
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 animate-pulse h-20 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">{t('common.error')}</p>
                    <p className="text-sm mt-1">{error || 'Order not found'}</p>
                </div>
            </div>
        );
    }

    const getStatusTimeline = () => {
        const statuses: Array<{ status: string; label: string; description: string }> = [
            { status: 'pending', label: 'Order Placed', description: 'We received your order' },
            { status: 'confirmed', label: 'Confirmed', description: 'Payment confirmed' },
            { status: 'processing', label: 'Processing', description: 'Preparing for shipment' },
            { status: 'shipped', label: 'Shipped', description: 'On its way to you' },
            { status: 'delivered', label: 'Delivered', description: 'Order delivered' },
        ];

        const currentIndex = statuses.findIndex(s => s.status === order.status);
        return statuses.map((s, idx) => ({
            ...s,
            active: idx <= currentIndex,
            current: idx === currentIndex,
        }));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
            case 'confirmed':
                return <CheckCircle className="w-6 h-6" />;
            case 'shipped':
                return <Truck className="w-6 h-6" />;
            case 'processing':
                return <Package className="w-6 h-6" />;
            case 'pending':
            default:
                return <Clock className="w-6 h-6" />;
        }
    };

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
            processing: { bg: 'bg-purple-100', text: 'text-purple-800' },
            shipped: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
            refunded: { bg: 'bg-gray-100', text: 'text-gray-800' },
        };
        return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    };

    const timeline = getStatusTimeline();
    const statusColor = getStatusBadgeColor(order.status);

    return (
        <div className="space-y-6">
            {/* Order Header with Action Buttons */}
            <div className="bg-gradient-to-r from-gold/5 to-amber-50 rounded-lg border border-gold/20 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`${statusColor.bg} ${statusColor.text} px-3 py-1 rounded-full text-sm font-semibold capitalize`}>
                                {order.status}
                            </div>
                            {order.payment_status === 'completed' && (
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    ✓ Paid
                                </div>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                            Order #{order.order_number}
                        </h2>
                        <p className="text-gray-600">
                            Placed on {new Date(order.created_at || '').toLocaleDateString()} at {new Date(order.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                        <p className="text-4xl font-bold text-gold mb-4">
                            {formatOMR(order.total, locale as 'ar' | 'en')}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium text-sm">
                                <Download className="w-4 h-4" />
                                Invoice
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium text-sm">
                                <RotateCcw className="w-4 h-4" />
                                Reorder
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gold" />
                    Order Status Timeline
                </h3>
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gradient-to-b from-gold to-gray-200"></div>

                    {/* Timeline Items */}
                    <div className="space-y-8">
                        {timeline.map((item, idx) => (
                            <div key={item.status} className="relative">
                                {/* Dot */}
                                <div className={`absolute left-0 top-1 w-11 h-11 rounded-full flex items-center justify-center border-4 ${item.active
                                    ? item.current
                                        ? 'bg-gold border-gold text-white'
                                        : 'bg-green-500 border-green-500 text-white'
                                    : 'bg-gray-200 border-gray-300 text-gray-400'
                                    }`}>
                                    {item.active && getStatusIcon(item.status)}
                                    {!item.active && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                                </div>

                                {/* Content */}
                                <div className="ml-20">
                                    <h4 className={`font-bold mb-1 ${item.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {item.label}
                                    </h4>
                                    <p className={`text-sm ${item.active ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {item.description}
                                    </p>
                                    {item.current && item.status !== 'delivered' && (
                                        <div className="mt-2 inline-block px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">
                                            Current Status
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gold" />
                    Order Items ({order.items?.length || 0})
                </h3>
                <div className="space-y-2">
                    {order.items && order.items.length > 0 ? (
                        <>
                            {/* Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 px-4 text-sm font-semibold text-gray-600">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>

                            {/* Items */}
                            {order.items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-gray-100 last:border-0 px-4 hover:bg-gray-50 rounded transition">
                                    <div className="md:col-span-6 flex flex-col justify-center">
                                        <p className="font-semibold text-gray-900 text-sm md:text-base">{item.product_name}</p>
                                        {item.variation_name && (
                                            <p className="text-xs md:text-sm text-gray-600 mt-1">Variant: {item.variation_name}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                                        <span className="text-gray-600 text-sm md:hidden">Qty:</span>
                                        <span className="font-medium text-gray-900">×{item.quantity}</span>
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                                        <span className="text-gray-600 text-sm md:hidden">Price:</span>
                                        <span className="text-gray-700 text-sm">{formatOMR(item.unit_price, locale as 'ar' | 'en')}</span>
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                                        <span className="text-gray-600 text-sm md:hidden">Total:</span>
                                        <span className="font-bold text-gold">{formatOMR(item.line_total, locale as 'ar' | 'en')}</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="text-gray-600 py-4">No items in this order</p>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gold" />
                        Order Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <p className="text-gray-600">Subtotal</p>
                            <p className="font-semibold text-gray-900">{formatOMR(order.subtotal, locale as 'ar' | 'en')}</p>
                        </div>
                        {order.shipping_cost > 0 && (
                            <div className="flex justify-between text-sm">
                                <p className="text-gray-600">Shipping</p>
                                <p className="font-semibold text-gray-900">{formatOMR(order.shipping_cost, locale as 'ar' | 'en')}</p>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <p className="text-gray-600">Tax ({(order.tax_rate * 100).toFixed(1)}%)</p>
                            <p className="font-semibold text-gray-900">{formatOMR(order.tax_amount, locale as 'ar' | 'en')}</p>
                        </div>
                        {order.discount_amount && order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <p>Discount</p>
                                <p className="font-semibold">-{formatOMR(order.discount_amount, locale as 'ar' | 'en')}</p>
                            </div>
                        )}
                        <div className="border-t pt-3 flex justify-between">
                            <p className="font-bold text-gray-900">Total</p>
                            <p className="text-xl font-bold text-gold">{formatOMR(order.total, locale as 'ar' | 'en')}</p>
                        </div>
                    </div>
                </div>

                {/* Tracking Information */}
                {order.tracking_number && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-gold" />
                            Tracking Information
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">Tracking Number</p>
                                <div className="flex items-center gap-2 mb-3">
                                    <p className="font-mono font-bold text-lg text-gray-900">{order.tracking_number}</p>
                                    <button
                                        onClick={() => handleCopyTracking(order.tracking_number!)}
                                        className="p-2 hover:bg-blue-100 rounded transition text-gray-600"
                                        title="Copy tracking number"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                {copiedTracking && (
                                    <p className="text-xs text-green-600">✓ Copied to clipboard</p>
                                )}
                            </div>
                            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                                Track Your Shipment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Shipping & Billing Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-gold" />
                        Shipping Address
                    </h3>
                    {order.shipping_address && (
                        <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-900">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                            {order.shipping_address.company && (
                                <p className="text-gray-600">{order.shipping_address.company}</p>
                            )}
                            <p>{order.shipping_address.address_line_1}</p>
                            {order.shipping_address.address_line_2 && (
                                <p>{order.shipping_address.address_line_2}</p>
                            )}
                            <p>{order.shipping_address.city}{order.shipping_address.state ? ', ' + order.shipping_address.state : ''}</p>
                            <p>{order.shipping_address.postal_code} {order.shipping_address.country}</p>
                        </div>
                    )}
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gold" />
                        Billing Address
                    </h3>
                    {order.billing_address && (
                        <div className="space-y-3">
                            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-900">{order.billing_address.first_name} {order.billing_address.last_name}</p>
                                {order.billing_address.company && (
                                    <p className="text-gray-600">{order.billing_address.company}</p>
                                )}
                                <p>{order.billing_address.address_line_1}</p>
                                {order.billing_address.address_line_2 && (
                                    <p>{order.billing_address.address_line_2}</p>
                                )}
                                <p>{order.billing_address.city}{order.billing_address.state ? ', ' + order.billing_address.state : ''}</p>
                                <p>{order.billing_address.postal_code} {order.billing_address.country}</p>
                            </div>
                            <div className="border-t pt-3">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Payment Method</p>
                                <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-gold" />
                                    {order.payment_method}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Notes & Support */}
            <div className="bg-gradient-to-r from-gold/5 to-amber-50 rounded-lg border border-gold/20 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gold" />
                    Need Help?
                </h3>
                <p className="text-gray-600 mb-6">
                    If you have any questions about your order or need assistance, don't hesitate to reach out to our customer support team.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition font-medium text-gray-700">
                        <Mail className="w-5 h-5 text-gold" />
                        <span>Email Support</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition font-medium text-gray-700">
                        <Phone className="w-5 h-5 text-gold" />
                        <span>Call Us</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition font-medium text-gray-700">
                        <MessageSquare className="w-5 h-5 text-gold" />
                        <span>Live Chat</span>
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            {order.status === 'delivered' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Satisfied with Your Order?</h3>
                    <p className="text-gray-600 mb-4">Help us improve by sharing your experience with the products you purchased.</p>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                        Leave a Review
                    </button>
                </div>
            )}
        </div>
    );
}