'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import OrdersList from '@/components/account/OrdersList';
import { ShoppingCart } from 'lucide-react';

interface OrdersPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function OrdersPage({ params: paramsPromise }: OrdersPageProps) {
    const router = useRouter();
    const t = useTranslations();
    const { user, is_authenticated, access_token, is_loading, customer_id } = useAuth();
    const [isHydrated, setIsHydrated] = React.useState(false);
    const [locale, setLocale] = React.useState<string>('');

    // Debug logging
    useEffect(() => {
        console.log('[OrdersPage] Auth state:', {
            isHydrated,
            is_authenticated,
            hasUser: !!user,
            userId: user?.id,
            hasCustomerId: !!customer_id,
            customerId: customer_id,
            hasAccessToken: !!access_token,
            isLoading: is_loading
        });
    }, [isHydrated, is_authenticated, user, access_token, is_loading, customer_id]);

    // Extract locale from params promise
    useEffect(() => {
        paramsPromise.then((params) => {
            setLocale(params.locale);
        });
    }, [paramsPromise]);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !is_authenticated && locale) {
            router.push(`/${locale}/auth/login`);
        }
    }, [isHydrated, is_authenticated, locale, router]);

    if (!isHydrated || is_loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!is_authenticated || !user?.id || !customer_id || !access_token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error: Please log in to view your orders</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-10 hidden md:block">
                    <div className="bg-gradient-to-r from-gold/10 to-amber-100/10 border border-gold/20 rounded-lg p-8 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                                <ShoppingCart className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-gray-900">{t('orders.my_orders')}</h1>
                                <p className="text-gray-600 mt-1">{t('orders.track_and_manage')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-blue-800">
                                <strong>{t('orders.tracking_information')}:</strong> {t('orders.help_message')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {locale && customer_id && (
                    <OrdersList
                        customerId={customer_id}
                        accessToken={access_token}
                        locale={locale}
                    />
                )}
            </div>
        </div>
    );
}