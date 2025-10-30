'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { AlertCircle, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

interface ChangePasswordPageProps {
    params: Promise<{ locale: string }>;
}

export default function ChangePasswordPage({ params: paramsPromise }: ChangePasswordPageProps) {
    const t = useTranslations();
    const router = useRouter();
    const { user, is_authenticated } = useAuth();
    const [locale, setLocale] = React.useState('en');
    const [isLoading, setIsLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [formError, setFormError] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isHydrated, setIsHydrated] = React.useState(false);

    const [formData, setFormData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    React.useEffect(() => {
        const getParams = async () => {
            const params = await paramsPromise;
            setLocale(params.locale);
        };
        getParams();
    }, [paramsPromise]);

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (isHydrated && !is_authenticated) {
            router.push(`/${locale}/auth/login`);
        }
    }, [isHydrated, is_authenticated, locale, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setFormError('');
    };

    const validateForm = (): boolean => {
        if (!formData.currentPassword) {
            setFormError(t('account.current_password_required'));
            return false;
        }

        if (!formData.newPassword || formData.newPassword.length < 8) {
            setFormError(t('auth.password_too_short'));
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setFormError(t('auth.passwords_do_not_match'));
            return false;
        }

        if (formData.currentPassword === formData.newPassword) {
            setFormError(t('account.new_password_same_as_current'));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement change password API call
            console.log('Changing password:', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${locale}/account`);
            }, 2000);
        } catch (err: any) {
            setFormError(err.message || t('auth.submission_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (!is_authenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('account.password_changed_success')}
                    </h1>
                    <p className="text-gray-600">
                        {t('account.password_changed_success_message')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push(`/${locale}/account`)}
                    className="flex items-center gap-2 text-gold hover:text-amber-600 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('account.change_password')}
                    </h1>
                    <p className="text-gray-600">
                        {t('account.change_password_description')}
                    </p>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Error Message */}
                    {formError && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-600">{formError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Current Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('account.current_password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={isLoading}
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

                        {/* New Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('account.new_password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('account.confirm_new_password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={isLoading}
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

                        {/* Password Requirements */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                            <p className="font-medium mb-2">{t('account.password_requirements')}:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{t('account.password_min_length')}</li>
                                <li>{t('account.password_different_current')}</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gold text-gray-900 font-medium rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                            {t('account.change_password')}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    {t('account.password_security_note')}
                </p>
            </div>
        </div>
    );
}