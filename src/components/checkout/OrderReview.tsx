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
            <div className="bg-white rounded-lg p-3 md:p-6 border border-gray-200 mb-3 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">{t('checkout.order_items')}</h3>
                <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between pb-2 md:pb-3 border-b border-gray-200 last:border-b-0">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm md:text-base truncate">{item.product.name}</p>
                                <p className="text-xs md:text-sm text-gray-600">
                                    {t('common.quantity')}: {item.quantity}
                                </p>
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                                <p className="font-semibold text-gray-900 text-sm md:text-base">
                                    {formatOMR(
                                        (item.product.sale_price || item.product.price) * item.quantity,
                                        locale
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatOMR(item.product.sale_price || item.product.price, locale)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-3 md:p-6 border border-gray-200 mb-3 md:mb-6">
                <div className="flex justify-between items-start md:items-center mb-3 md:mb-4 gap-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">{t('checkout.shipping_address')}</h3>
                    <button
                        onClick={() => onEdit('address')}
                        className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium flex-shrink-0"
                    >
                        {t('common.edit')}
                    </button>
                </div>
                <div className="text-gray-700 space-y-0.5 md:space-y-1 text-sm md:text-base">
                    <p>{shippingAddress.full_name}</p>
                    <p className="text-xs md:text-sm">{shippingAddress.phone}</p>
                    <p className="text-xs md:text-sm">{shippingAddress.email}</p>
                    <p>{shippingAddress.street_address}</p>
                    {shippingAddress.building && <p className="text-sm">{t('checkout.building')}: {shippingAddress.building}</p>}
                    {shippingAddress.floor && <p className="text-sm">{t('checkout.floor')}: {shippingAddress.floor}</p>}
                    {shippingAddress.apartment && <p className="text-sm">{t('checkout.apartment')}: {shippingAddress.apartment}</p>}
                    <p className="text-sm">
                        {shippingAddress.wilayat}, {shippingAddress.governorate}
                    </p>
                    <p className="text-sm">{shippingAddress.postal_code}</p>
                </div>
            </div>

            {/* Billing Address */}
            {billingAddress && shippingAddress.full_name !== billingAddress.full_name && (
                <div className="bg-white rounded-lg p-3 md:p-6 border border-gray-200 mb-3 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">{t('checkout.billing_address')}</h3>
                    <div className="text-gray-700 space-y-0.5 md:space-y-1 text-sm md:text-base">
                        <p>{billingAddress.full_name}</p>
                        <p>{billingAddress.street_address}</p>
                        <p className="text-sm">
                            {billingAddress.wilayat}, {billingAddress.governorate}
                        </p>
                        <p className="text-sm">{billingAddress.postal_code}</p>
                    </div>
                </div>
            )}

            {/* Shipping Method */}
            <div className="bg-white rounded-lg p-3 md:p-6 border border-gray-200 mb-3 md:mb-6">
                <div className="flex justify-between items-start md:items-center mb-3 md:mb-4 gap-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">{t('checkout.shipping_method')}</h3>
                    <button
                        onClick={() => onEdit('shipping')}
                        className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium flex-shrink-0"
                    >
                        {t('common.edit')}
                    </button>
                </div>
                <div className="text-gray-700 text-sm md:text-base">
                    <p className="font-medium">{isArabic ? shippingMethod.name_ar || shippingMethod.name : shippingMethod.name}</p>
                    {shippingMethod.estimated_days_min && shippingMethod.estimated_days_max && (
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                            {t('checkout.delivery')}: {shippingMethod.estimated_days_min}-{shippingMethod.estimated_days_max}{' '}
                            {t('common.days')}
                        </p>
                    )}
                    <p className="font-semibold text-blue-600 mt-1 md:mt-2">{formatOMR(shippingMethod.cost || 0, locale)}</p>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-3 md:p-6 border border-gray-200 mb-3 md:mb-6">
                <div className="flex justify-between items-start md:items-center mb-3 md:mb-4 gap-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">{t('checkout.payment_method')}</h3>
                    <button
                        onClick={() => onEdit('payment')}
                        className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium flex-shrink-0"
                    >
                        {t('common.edit')}
                    </button>
                </div>
                <div className="text-gray-700 text-sm md:text-base">
                    <p className="font-medium">{isArabic ? paymentMethod.name_ar || paymentMethod.name : paymentMethod.name}</p>
                    {paymentMethod.type === 'cash_on_delivery' && (
                        <p className="text-xs md:text-sm text-gray-600 mt-1">{t('checkout.cod_description')}</p>
                    )}
                </div>
            </div>

            {/* Order Totals */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 md:p-6 border border-blue-200 mb-3 md:mb-6">
                <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm md:text-base">
                        <span className="text-gray-700">{t('checkout.subtotal')}</span>
                        <span className="font-medium text-gray-900">{formatOMR(totals.subtotal, locale)}</span>
                    </div>

                    {totals.shipping > 0 && (
                        <div className="flex justify-between text-sm md:text-base">
                            <span className="text-gray-700">{t('checkout.shipping')}</span>
                            <span className="font-medium text-gray-900">{formatOMR(totals.shipping, locale)}</span>
                        </div>
                    )}

                    {totals.tax > 0 && (
                        <div className="flex justify-between text-sm md:text-base">
                            <span className="text-gray-700">{t('checkout.tax')}</span>
                            <span className="font-medium text-gray-900">{formatOMR(totals.tax, locale)}</span>
                        </div>
                    )}

                    <div className="border-t border-blue-300 pt-2 md:pt-3 flex justify-between">
                        <span className="text-base md:text-lg font-semibold text-gray-900">{t('checkout.total')}</span>
                        <span className="text-base md:text-lg font-bold text-blue-600">{formatOMR(totals.total, locale)}</span>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-base md:text-lg transition-colors mb-2 md:mb-3"
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