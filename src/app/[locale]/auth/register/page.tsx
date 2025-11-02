'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import AuthForm from '@/components/auth/AuthForm';

interface RegisterPageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Register Page
 */
export default function RegisterPage({ params: paramsPromise }: RegisterPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations();
    const { register, is_loading, error, is_authenticated, setRedirectUrl } = useAuth();
    const [locale, setLocale] = React.useState('en');

    React.useEffect(() => {
        const getParams = async () => {
            const params = await paramsPromise;
            setLocale(params.locale);
        };
        getParams();
    }, [paramsPromise]);

    React.useEffect(() => {
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
            setRedirectUrl(redirectUrl);
        }
    }, [searchParams, setRedirectUrl]);

    // Redirect authenticated users to account page or redirect URL
    React.useEffect(() => {
        if (is_authenticated && locale) {
            router.push(`/${locale}/account`);
        }
    }, [is_authenticated, locale, router]);

    const handleRegister = async (credentials: any) => {
        await register({
            email: credentials.email,
            password: credentials.password,
            password_confirm: credentials.password_confirm,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                        {t('auth.register')}
                    </h1>
                    <p className="text-gray-600">
                        {t('auth.dont_have_account')}
                    </p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <AuthForm
                        type="register"
                        locale={locale}
                        onSubmit={handleRegister}
                    />
                </div>
            </div>
        </div>
    );
}