'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import AuthForm from '@/components/auth/AuthForm';

interface LoginPageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Login Page
 */
export default function LoginPage({ params: paramsPromise }: LoginPageProps) {
    const router = useRouter();
    const t = useTranslations();
    const { login, is_loading, error, is_authenticated } = useAuth();
    const [locale, setLocale] = React.useState('en');

    React.useEffect(() => {
        const getParams = async () => {
            const params = await paramsPromise;
            setLocale(params.locale);
        };
        getParams();
    }, [paramsPromise]);

    // Redirect authenticated users to account page
    React.useEffect(() => {
        if (is_authenticated && locale) {
            router.push(`/${locale}/account`);
        }
    }, [is_authenticated, locale, router]);

    const handleLogin = async (credentials: any) => {
        await login({
            email: credentials.email,
            password: credentials.password,
            remember_me: credentials.remember_me,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('auth.login')}
                    </h1>
                    <p className="text-gray-600">
                        {t('common.welcome')}
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <AuthForm
                        type="login"
                        locale={locale}
                        onSubmit={handleLogin}
                    />
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    {t('auth.dont_have_account')}{' '}
                    <a href={`/${locale}/auth/register`} className="text-gold hover:underline font-medium">
                        {t('auth.register_here')}
                    </a>
                </p>
            </div>
        </div>
    );
}