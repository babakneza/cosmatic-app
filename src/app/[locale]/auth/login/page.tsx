'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const t = useTranslations();
    const { login, is_loading, error, is_authenticated, setRedirectUrl } = useAuth();
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

    // Redirect authenticated users to redirect URL or account page
    React.useEffect(() => {
        if (is_authenticated && locale) {
            const { redirectUrl } = useAuth.getState();
            if (redirectUrl) {
                router.push(redirectUrl);
                setRedirectUrl(null);
            } else {
                router.push(`/${locale}/account`);
            }
        }
    }, [is_authenticated, locale, router, setRedirectUrl]);

    const handleLogin = async (credentials: any) => {
        await login({
            email: credentials.email,
            password: credentials.password,
            remember_me: credentials.remember_me,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
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