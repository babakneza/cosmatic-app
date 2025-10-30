'use client';

import { useTranslations } from 'next-intl';
import Price from '@/components/ui/Price';
import { formatOMR } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/types';

interface CartSummaryProps {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    itemCount: number;
    isLoading?: boolean;
    locale: string;
    onContinueShopping?: () => void;
    onCheckout?: () => void;
}

export default function CartSummary({
    subtotal,
    shipping,
    tax,
    total,
    itemCount,
    isLoading = false,
    locale,
    onContinueShopping,
    onCheckout,
}: CartSummaryProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    return (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            {/* Order Summary Title */}
            <h3 className={`text-lg font-bold text-gray-900 mb-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('cart.order_summary')}
            </h3>

            {/* Summary Lines */}
            <div className={`space-y-3 mb-4 pb-4 border-b border-gray-200 ${isArabic ? 'text-right' : 'text-left'}`}>
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <Price
                        amount={subtotal}
                        locale={locale as Locale}
                        size="base"
                        weight="semibold"
                        className="text-gray-900"
                    />
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('cart.shipping')}</span>
                    {shipping === 0 ? (
                        <span className="font-semibold text-gray-600">--</span>
                    ) : (
                        <Price
                            amount={shipping}
                            locale={locale as Locale}
                            size="base"
                            weight="semibold"
                            className="text-gray-900"
                        />
                    )}
                </div>

                {/* Tax (usually 0 for Oman) */}
                {tax > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('cart.tax')}</span>
                        <Price
                            amount={tax}
                            locale={locale as Locale}
                            size="base"
                            weight="semibold"
                            className="text-gray-900"
                        />
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-3 border-2 border-blue-500">
                <span className="font-bold text-lg text-gray-900">{t('cart.total')}</span>
                <Price
                    amount={total}
                    locale={locale as Locale}
                    size="2xl"
                    weight="bold"
                    className="text-blue-600"
                />
            </div>

            {/* Item Count Info */}
            <p className={`text-sm text-gray-600 mb-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('cart.items_in_cart', { count: itemCount })}
            </p>

            {/* Shipping Notice */}
            {shipping === 0 && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className={`text-sm text-amber-800 ${isArabic ? 'text-right' : 'text-left'}`}>
                        {t('cart.shipping_calculated_message')}
                    </p>
                </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
                <Button
                    onClick={onCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 font-semibold"
                    disabled={isLoading}
                >
                    {t('cart.checkout')}
                </Button>
                <Button
                    onClick={onContinueShopping}
                    variant="outline"
                    className="w-full py-6 font-semibold"
                    disabled={isLoading}
                >
                    {t('cart.continue_shopping')}
                </Button>
            </div>

            {/* Free Shipping Threshold */}
            {subtotal < 10 && subtotal > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className={`text-sm text-blue-800 ${isArabic ? 'text-right' : 'text-left'}`}>
                        {t('cart.free_shipping_threshold', {
                            amount: formatOMR(10 - subtotal, locale as Locale),
                        })}
                    </p>
                </div>
            )}
        </div>
    );
}