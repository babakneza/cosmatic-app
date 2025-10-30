'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Address, ShippingMethod } from '@/types';
import { getShippingMethods } from '@/lib/api/shipping';
import { formatOMR } from '@/lib/currency';

interface ShippingMethodSelectorProps {
    address: Address;
    locale: string;
    selectedMethod?: ShippingMethod;
    onSelect: (method: ShippingMethod, cost: number) => void;
    onContinue: () => void;
    isLoading?: boolean;
    cartSubtotal?: number;
}

export default function ShippingMethodSelector({
    address,
    locale,
    selectedMethod,
    onSelect,
    onContinue,
    isLoading = false,
    cartSubtotal = 0,
}: ShippingMethodSelectorProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [isLoadingMethods, setIsLoadingMethods] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<ShippingMethod | null>(selectedMethod || null);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                setIsLoadingMethods(true);
                setError(null);

                // Get country ID from address (default to Oman - ID 7)
                // Prioritize country_id, fallback to country (for backward compatibility)
                const countryId = address.country_id || 7;

                // Fetch shipping methods for the country with cart value
                const shippingMethods = await getShippingMethods(String(countryId), cartSubtotal);
                setMethods(shippingMethods as any as ShippingMethod[]);

                // If we have a selected method, keep it selected
                if (selectedMethod && shippingMethods.some((m) => m.id === selectedMethod.id)) {
                    setSelected(selectedMethod);
                    // Ensure parent store is updated with the selected method
                    onSelect(selectedMethod, selectedMethod.cost || 0);
                } else if (shippingMethods.length > 0) {
                    const firstMethod = shippingMethods[0] as any as ShippingMethod;
                    setSelected(firstMethod);
                    // CRITICAL: Call onSelect to update parent's store with the auto-selected method
                    onSelect(firstMethod, firstMethod.cost || 0);
                }
            } catch (err: any) {
                console.error('[ShippingMethodSelector] Error fetching methods:', err);
                setError(err?.message || t('errors.failed_to_load_shipping_methods'));
            } finally {
                setIsLoadingMethods(false);
            }
        };

        fetchMethods();
    }, [address.country_id, cartSubtotal, t]);

    const handleSelect = (method: ShippingMethod) => {
        setSelected(method);
        onSelect(method, method.cost || 0);
    };

    const handleContinue = () => {
        if (selected) {
            onContinue();
        }
    };

    if (isLoadingMethods) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className={`ml-3 text-gray-700 ${isArabic ? 'mr-3 ml-0' : ''}`}>
                    {t('checkout.loading_shipping_methods')}
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (methods.length === 0) {
        return (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <p className="text-yellow-700">{t('checkout.no_shipping_methods_available')}</p>
            </div>
        );
    }

    return (
        <div className={isArabic ? 'text-right' : 'text-left'}>
            {/* Shipping methods list */}
            <div className="space-y-3 mb-6">
                {methods.map((method) => (
                    <label
                        key={method.id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${selected?.id === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        <input
                            type="radio"
                            name="shipping_method"
                            value={method.id}
                            checked={selected?.id === method.id}
                            onChange={() => handleSelect(method)}
                            className="w-4 h-4 text-blue-600 mt-1"
                        />

                        <div className={`ml-4 flex-1 ${isArabic ? 'mr-4 ml-0' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                        {isArabic ? method.name_ar || method.name : method.name}
                                    </p>

                                    {/* Method type/description */}
                                    <div className="mt-1 space-y-1">
                                        {method.type && method.type.trim() && ['standard', 'express', 'overnight'].includes(method.type.toLowerCase()) && (
                                            <p className="text-xs text-gray-500 capitalize">
                                                {t(`shipping.type_${method.type.toLowerCase()}`, { defaultValue: method.type })} {method.type === 'express' && '⚡' || method.type === 'overnight' && '🚀'}
                                            </p>
                                        )}
                                        {method.description || method.description_ar ? (
                                            <p className="text-sm text-gray-600">
                                                {isArabic
                                                    ? method.description_ar || method.description
                                                    : method.description}
                                            </p>
                                        ) : null}

                                        {/* Delivery Time */}
                                        {method.estimated_days_min || method.estimated_days ? (
                                            <p className="text-xs text-gray-500">
                                                {method.estimated_days_min && method.estimated_days_max
                                                    ? `${t('checkout.delivery')}: ${method.estimated_days_min}-${method.estimated_days_max} ${t(
                                                        'common.days'
                                                    )}`
                                                    : method.estimated_days}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className={`ml-4 text-right font-bold text-lg text-blue-600 ${isArabic ? 'ml-0 mr-4 text-left' : ''
                                    }`}>
                                    {formatOMR(method.cost || 0, locale as any)}
                                </div>
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            {/* Continue Button */}
            <button
                onClick={handleContinue}
                disabled={!selected || isLoading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
                {isLoading ? t('common.loading') : t('checkout.continue')}
            </button>
        </div>
    );
}