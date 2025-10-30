'use client';

import { useTranslations } from 'next-intl';
import { Address, ShippingMethod, PaymentMethod, Locale } from '@/types';
import { CartItem } from '@/types';
import { formatOMR } from '@/lib/currency';

interface OrderReviewProps {
    items: CartItem[];
    shippingAddress: Address;
    billingAddress?: Address;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    totals: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    locale: Locale;
    onEdit: (section: 'address' | 'shipping' | 'payment') => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function OrderReview({
    items,
    shippingAddress,
    billingAddress,
    shippingMethod,
    paymentMethod,
    totals,
    locale,
    onEdit,
    onConfirm,
    isLoading = false,
}: OrderReviewProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    return (
        <div className={isArabic ? 'text-right' : 'text-left'}>
            {/* Items Summary */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.order_items')}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0">
                            <div>
                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-600">
                                    {t('common.quantity')}: {item.quantity}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                    {formatOMR(
                                        (item.product.sale_price || item.product.price) * item.quantity,
                                        locale
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatOMR(item.product.sale_price || item.product.price, locale)} {t('common.each')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('checkout.shipping_address')}</h3>
                    <button
                        onClick={() => onEdit('address')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {t('common.edit')}
                    </button>
                </div>
                <div className="text-gray-700 space-y-1">
                    <p>{shippingAddress.full_name}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.email}</p>
                    <p>{shippingAddress.street_address}</p>
                    {shippingAddress.building && <p>{t('checkout.building')}: {shippingAddress.building}</p>}
                    {shippingAddress.floor && <p>{t('checkout.floor')}: {shippingAddress.floor}</p>}
                    {shippingAddress.apartment && <p>{t('checkout.apartment')}: {shippingAddress.apartment}</p>}
                    <p>
                        {shippingAddress.wilayat}, {shippingAddress.governorate}
                    </p>
                    <p>{shippingAddress.postal_code}</p>
                </div>
            </div>

            {/* Billing Address */}
            {billingAddress && shippingAddress.full_name !== billingAddress.full_name && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('checkout.billing_address')}</h3>
                    <div className="text-gray-700 space-y-1">
                        <p>{billingAddress.full_name}</p>
                        <p>{billingAddress.street_address}</p>
                        <p>
                            {billingAddress.wilayat}, {billingAddress.governorate}
                        </p>
                        <p>{billingAddress.postal_code}</p>
                    </div>
                </div>
            )}

            {/* Shipping Method */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('checkout.shipping_method')}</h3>
                    <button
                        onClick={() => onEdit('shipping')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {t('common.edit')}
                    </button>
                </div>
                <div className="text-gray-700">
                    <p className="font-medium">{isArabic ? shippingMethod.name_ar || shippingMethod.name : shippingMethod.name}</p>
                    {shippingMethod.estimated_days_min && shippingMethod.estimated_days_max && (
                        <p className="text-sm text-gray-600 mt-1">
                            {t('checkout.delivery')}: {shippingMethod.estimated_days_min}-{shippingMethod.estimated_days_max}{' '}
                            {t('common.days')}
                        </p>
                    )}
                    <p className="font-semibold text-blue-600 mt-2">{formatOMR(shippingMethod.cost || 0, locale)}</p>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('checkout.payment_method')}</h3>
                    <button
                        onClick={() => onEdit('payment')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {t('common.edit')}
                    </button>
                </div>
                <div className="text-gray-700">
                    <p className="font-medium">{isArabic ? paymentMethod.name_ar || paymentMethod.name : paymentMethod.name}</p>
                    {paymentMethod.type === 'cash_on_delivery' && (
                        <p className="text-sm text-gray-600 mt-1">{t('checkout.cod_description')}</p>
                    )}
                </div>
            </div>

            {/* Order Totals */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 mb-6">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-700">{t('checkout.subtotal')}</span>
                        <span className="font-medium text-gray-900">{formatOMR(totals.subtotal, locale)}</span>
                    </div>

                    {totals.shipping > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-700">{t('checkout.shipping')}</span>
                            <span className="font-medium text-gray-900">{formatOMR(totals.shipping, locale)}</span>
                        </div>
                    )}

                    {totals.tax > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-700">{t('checkout.tax')}</span>
                            <span className="font-medium text-gray-900">{formatOMR(totals.tax, locale)}</span>
                        </div>
                    )}

                    <div className="border-t border-blue-300 pt-3 flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">{t('checkout.total')}</span>
                        <span className="text-lg font-bold text-blue-600">{formatOMR(totals.total, locale)}</span>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors mb-3"
            >
                {isLoading ? t('common.loading') : t('checkout.confirm_order')}
            </button>

            {/* Terms Agreement */}
            <p className="text-xs text-gray-600 text-center">
                {t('checkout.by_clicking_confirm')}{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                    {t('checkout.terms_and_conditions')}
                </a>
            </p>
        </div>
    );
}