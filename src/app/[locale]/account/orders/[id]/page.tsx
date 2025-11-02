'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import OrderDetails from '@/components/account/OrderDetails';
import { ArrowLeft } from 'lucide-react';

interface OrderDetailPageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function OrderDetailPage({ params: paramsPromise }: OrderDetailPageProps) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const t = useTranslations();
    const { user, is_authenticated, access_token } = useAuth();
    const [isHydrated, setIsHydrated] = React.useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !is_authenticated) {
            router.push(`/${params.locale}/auth/login`);
        }
    }, [isHydrated, is_authenticated, params, router]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!is_authenticated || !user || !access_token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Navigation */}
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href={`/${params.locale}/account/orders`}
                        className="inline-flex items-center gap-2 text-gold hover:text-amber-600 transition font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t('orders.back_to_all_orders')}
                    </Link>
                    <div className="text-sm text-gray-500">
                        {t('orders.order_details_title')}
                    </div>
                </div>

                {/* Order Details */}
                {params.id && (
                    <OrderDetails
                        orderId={params.id}
                        accessToken={access_token}
                    />
                )}

                {/* Footer Actions */}
                <div className="mt-12 border-t pt-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <Link
                            href={`/${params.locale}/account/orders`}
                            className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition w-full sm:w-auto text-center"
                        >
                            ← {t('orders.back_to_orders')}
                        </Link>
                        <Link
                            href={`/${params.locale}/shop`}
                            className="px-8 py-3 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-lg transition shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
                            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}
                        >
                            {t('orders.continue_shopping')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}