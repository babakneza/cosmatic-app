'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth';
import AddressForm from '@/components/account/AddressForm';
import { ArrowLeft } from 'lucide-react';

interface AddAddressPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function AddAddressPage({ params: paramsPromise }: AddAddressPageProps) {
    const params = React.use(paramsPromise);
    const t = useTranslations();
    const router = useRouter();
    const { user, is_authenticated, access_token, customer_id } = useAuth();
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
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!is_authenticated || !user || !access_token || customer_id === null || customer_id === undefined) {
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
            <div className="max-w-2xl mx-auto">
                {/* Navigation */}
                <Link
                    href={`/${params.locale}/account/addresses`}
                    className="inline-flex items-center gap-2 text-gold hover:text-amber-600 mb-8 transition font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Addresses
                </Link>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gold/10 to-amber-50 border-b border-gold/20 px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Address</h1>
                        <p className="text-gray-600">Fill in your delivery address details below</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <AddressForm
                            customerId={customer_id!}
                            accessToken={access_token}
                            locale={params.locale}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}