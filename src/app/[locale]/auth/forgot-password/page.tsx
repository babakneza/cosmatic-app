'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import AuthForm from '@/components/auth/AuthForm';

interface ForgotPasswordPageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Forgot Password Page
 */
export default function ForgotPasswordPage({ params: paramsPromise }: ForgotPasswordPageProps) {
    const t = useTranslations();
    const { requestPasswordRecovery, is_loading, error } = useAuth();
    const [locale, setLocale] = React.useState('en');

    React.useEffect(() => {
        const getParams = async () => {
            const params = await paramsPromise;
            setLocale(params.locale);
        };
        getParams();
    }, [paramsPromise]);

    const handleRequestRecovery = async (credentials: any) => {
        await requestPasswordRecovery({
            email: credentials.email,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('auth.forgot_password')}
                    </h1>
                    <p className="text-gray-600">
                        {t('validation.required')}
                    </p>
                </div>

                {/* Recovery Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <p className="text-sm text-gray-600 mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <AuthForm
                        type="password-recovery"
                        locale={locale}
                        onSubmit={handleRequestRecovery}
                    />
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    <a href={`/${locale}/auth/login`} className="text-gold hover:underline font-medium">
                        {t('auth.back_to_login')}
                    </a>
                </p>
            </div>
        </div>
    );
}