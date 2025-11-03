'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PaymentMethod } from '@/types';

interface PaymentMethodSelectorProps {
    selectedMethod?: PaymentMethod;
    onSelect: (method: PaymentMethod) => void;
    onSubmit: () => void;
    locale: string;
    isLoading?: boolean;
}

// Default payment methods available
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
        name_ar: 'باي بال',
        is_available: true,
    },
    {
        id: 'cash_on_delivery',
        type: 'cash_on_delivery',
        name: 'Cash on Delivery',
        name_ar: 'الدفع عند الاستلام',
        is_available: true,
    },
    {
        id: 'credit_card',
        type: 'credit_card',
        name: 'Credit Card',
        name_ar: 'بطاقة ائتمان',
        is_available: true,
    },
    {
        id: 'debit_card',
        type: 'debit_card',
        name: 'Debit Card',
        name_ar: 'بطاقة خصم',
        is_available: true,
    },
    {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: 'Bank Transfer',
        name_ar: 'تحويل بنكي',
        is_available: true,
    },
];

export default function PaymentMethodSelector({
    selectedMethod,
    onSelect,
    onSubmit,
    locale,
    isLoading = false,
}: PaymentMethodSelectorProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    const [selected, setSelected] = useState<PaymentMethod | null>(selectedMethod || null);

    // Initialize with first available method if none selected
    useEffect(() => {
        if (!selected && DEFAULT_PAYMENT_METHODS.length > 0) {
            const defaultMethod = DEFAULT_PAYMENT_METHODS[0];
            setSelected(defaultMethod);
            onSelect(defaultMethod);
        }
    }, []);

    const handleSelect = (method: PaymentMethod) => {
        setSelected(method);
        onSelect(method);
    };

    const getPaymentIcon = (type: string) => {
        switch (type) {
            case 'paypal':
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337c-.924.365-1.922.37-2.852.117-.922-.25-1.666-.714-2.133-1.371-.467-.657-.7-1.505-.632-2.54.034-.547.089-1.104.167-1.671.079-.572.167-1.149.267-1.732l.273-1.758c.101-.649.213-1.305.337-1.968.124-.663.251-1.328.382-1.995.131-.667.265-1.336.403-2.007.139-.671.281-1.344.428-2.02.146-.677.296-1.355.448-2.036.152-.681.307-1.364.463-2.047l.453-1.823c.158-.64.32-1.281.485-1.922.163-.638.328-1.276.495-1.912.167-.636.336-1.272.507-1.908.172-.636.346-1.272.521-1.908.176-.636.352-1.272.529-1.908.177-.636.355-1.272.535-1.908.179-.636.36-1.272.541-1.908.181-.636.364-1.272.548-1.908.185-.636.371-1.272.558-1.908.189-.637.378-1.273.568-1.908.191-.637.382-1.273.575-1.908.193-.637.387-1.273.582-1.909.196-.637.392-1.273.588-1.910.196-.636.393-1.272.591-1.908.197-.636.395-1.272.594-1.908.199-.636.398-1.272.598-1.908.2-.636.4-1.272.601-1.908.201-.636.402-1.272.604-1.908.202-.636.404-1.272.607-1.908.203-.636.407-1.272.611-1.908" />
                        <text x="0" y="18" fontSize="8" fill="currentColor">PayPal</text>
                    </svg>
                );
            case 'credit_card':
            case 'debit_card':
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2H3V4zm0 5v9a1 1 0 001 1h16a1 1 0 001-1v-9H3z" />
                    </svg>
                );
            case 'bank_transfer':
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6h1.5V7zm4 0h-1.5v6H16.5V7zm-8 0H7v6h1.5V7z" />
                    </svg>
                );
            case 'cash_on_delivery':
            default:
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                );
        }
    };

    return (
        <div className={isArabic ? 'text-right' : 'text-left'}>
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {DEFAULT_PAYMENT_METHODS.filter((m) => m.is_available).map((method) => (
                    <label
                        key={method.id}
                        className={`flex items-start md:items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${selected?.id === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        <input
                            type="radio"
                            name="payment_method"
                            value={method.id}
                            checked={selected?.id === method.id}
                            onChange={() => handleSelect(method)}
                            className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                        />

                        <div className={`ml-3 md:ml-4 flex-1 flex items-start md:items-center gap-2 md:gap-3 ${isArabic ? 'mr-3 md:mr-4 ml-0' : ''}`}>
                            <div className="text-gray-600 flex-shrink-0">{getPaymentIcon(method.type)}</div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm md:text-base">
                                    {isArabic ? method.name_ar || method.name : method.name}
                                </p>
                                {method.type === 'cash_on_delivery' && (
                                    <p className="text-xs text-gray-500 mt-0.5 md:mt-1">{t('checkout.cod_description')}</p>
                                )}
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200 mb-4 md:mb-6">
                <div className="flex gap-2 md:gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                    <p className="text-xs md:text-sm text-blue-700">{t('checkout.secure_payment_notice')}</p>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                disabled={!selected || isLoading}
                className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm md:text-base transition-colors"
            >
                {isLoading ? t('common.loading') : t('checkout.review_order')}
            </button>
        </div>
    );
}