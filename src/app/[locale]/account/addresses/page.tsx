'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth';
import AddressList from '@/components/account/AddressList';
import { MapPin, ArrowLeft } from 'lucide-react';

interface AddressesPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function AddressesPage({ params }: AddressesPageProps) {
    const { locale } = React.use(params);
    const t = useTranslations();
    const router = useRouter();
    const { user, is_authenticated, access_token, customer_id } = useAuth();
    const [isHydrated, setIsHydrated] = React.useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !is_authenticated) {
            router.push(`/${locale}/auth/login`);
        }
    }, [isHydrated, is_authenticated, locale, router]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    // Check authentication - use explicit null/undefined checks for customer_id (it could be 0)
    if (!is_authenticated || !user || !access_token || customer_id === null || customer_id === undefined) {
        console.log('[AddressesPage] Auth check failed:', {
            is_authenticated,
            hasUser: !!user,
            hasToken: !!access_token,
            customer_id,
            isHydrated
        });
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <Link
                        href={`/${locale}/account`}
                        className="inline-flex items-center gap-2 text-gold hover:text-amber-600 mb-6 transition font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t('account.back_to_account')}
                    </Link>

                    {/* Hero Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-8 mb-8">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-8 h-8 text-gray-900" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    My Addresses
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Manage your delivery and billing addresses
                                </p>
                            </div>
                            <Link
                                href={`/${locale}/account/addresses/add`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-gray-900 rounded-lg transition font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
                            >
                                <span>+</span>
                                Add New Address
                            </Link>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold">📦</span>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Shipping Address</p>
                                    <p className="text-xs text-blue-500">Primary delivery location</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-semibold">💳</span>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Billing Address</p>
                                    <p className="text-xs text-purple-500">For invoice and payments</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-semibold">✓</span>
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Default</p>
                                    <p className="text-xs text-green-500">Set as primary address</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Addresses List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <AddressList
                        customerId={customer_id}
                        accessToken={access_token}
                        locale={locale}
                    />
                </div>
            </div>
        </div>
    );
}