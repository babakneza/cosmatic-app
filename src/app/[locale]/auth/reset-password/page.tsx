'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/store/auth';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface ResetPasswordPageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Reset Password Page
 */
export default function ResetPasswordPage({ params: paramsPromise }: ResetPasswordPageProps) {
    const t = useTranslations();
    const { resetPassword, is_loading, error } = useAuth();
    const searchParams = useSearchParams();
    const [locale, setLocale] = React.useState('en');
    const [success, setSuccess] = React.useState(false);
    const [formError, setFormError] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const token = searchParams.get('token');

    const [formData, setFormData] = React.useState({
        password: '',
        passwordConfirm: '',
    });

    React.useEffect(() => {
        const getParams = async () => {
            const params = await paramsPromise;
            setLocale(params.locale);
        };
        getParams();
    }, [paramsPromise]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setFormError('');
    };

    const validateForm = (): boolean => {
        if (!formData.password || formData.password.length < 8) {
            setFormError(t('auth.password_too_short'));
            return false;
        }

        if (formData.password !== formData.passwordConfirm) {
            setFormError(t('auth.passwords_do_not_match'));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
            setFormError('Invalid reset token');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            await resetPassword({
                token,
                password: formData.password,
                password_confirm: formData.passwordConfirm,
            });
            setSuccess(true);
        } catch (err: any) {
            setFormError(err.message || t('auth.submission_failed'));
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
                    <p className="text-gray-600 mb-6">
                        The password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <a
                        href={`/${locale}/auth/forgot-password`}
                        className="inline-block px-6 py-2 bg-gold text-white rounded-lg hover:bg-amber-600 transition"
                    >
                        Request New Link
                    </a>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('auth.password_reset_success')}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your password has been successfully reset. You can now login with your new password.
                    </p>
                    <a
                        href={`/${locale}/auth/login`}
                        className="inline-block px-6 py-2 bg-gold text-white rounded-lg hover:bg-amber-600 transition"
                    >
                        {t('auth.login')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-600">
                        Enter your new password below
                    </p>
                </div>

                {/* Reset Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Error Message */}
                    {(formError || error) && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-600">{formError || error?.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={is_loading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.confirm_password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={is_loading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={is_loading}
                            className="w-full py-2 bg-gold text-white font-medium rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {is_loading && <Loader className="w-4 h-4 animate-spin" />}
                            Reset Password
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    <a href={`/${locale}/auth/login`} className="text-gold hover:underline">
                        {t('auth.back_to_login')}
                    </a>
                </p>
            </div>
        </div>
    );
}