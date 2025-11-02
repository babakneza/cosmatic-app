'use client';

import React, { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';

interface AuthFormProps {
    type: 'login' | 'register' | 'password-recovery';
    locale: string;
    onSubmit?: (data: any) => Promise<void>;
}

/**
 * Base Auth Form Component
 * Reusable form for login, register, and password recovery
 */
export function AuthForm({ type, locale, onSubmit }: AuthFormProps) {
    const t = useTranslations();
    const router = useRouter();
    const { redirectUrl, setRedirectUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        firstName: '',
        lastName: '',
    });
    const [emailError, setEmailError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');

        // Real-time email validation
        if (name === 'email' && value) {
            if (!validateEmail(value)) {
                setEmailError(t('auth.invalid_email'));
            } else {
                setEmailError('');
            }
        } else if (name === 'email' && !value) {
            setEmailError('');
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        if (!formData.email || !validateEmail(formData.email)) {
            setError(t('auth.invalid_email'));
            return false;
        }

        if (type !== 'password-recovery') {
            if (!formData.password || formData.password.length < 8) {
                setError('Password must be at least 8 characters with numbers, uppercase, lowercase, and special characters');
                return false;
            }

            if (type === 'register') {
                if (!formData.firstName || !formData.lastName) {
                    setError(t('auth.name_required'));
                    return false;
                }

                if (formData.password !== formData.passwordConfirm) {
                    setError(t('auth.passwords_do_not_match'));
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Prevent submission if email error exists
        if (emailError) {
            setError(emailError);
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (onSubmit) {
                await onSubmit({
                    email: formData.email,
                    password: formData.password,
                    password_confirm: formData.passwordConfirm,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    remember_me: rememberMe,
                });
            }

            // Redirect based on form type
            if (type === 'login') {
                if (redirectUrl) {
                    const url = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
                    router.push(url);
                    setRedirectUrl(null);
                } else {
                    router.push(`/${locale}/account`);
                }
            } else if (type === 'register') {
                if (redirectUrl) {
                    const url = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
                    router.push(url);
                    setRedirectUrl(null);
                } else {
                    router.push(`/${locale}/account`);
                }
            } else if (type === 'password-recovery') {
                router.push(`/${locale}/auth/recovery-sent`);
            }
        } catch (err: any) {
            setError(err.message || t('auth.submission_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.email')}
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        disabled={isLoading}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition disabled:bg-gray-100 ${emailError
                                ? 'border-red-500 focus:ring-red-500'
                                : formData.email && !emailError
                                    ? 'border-green-500 focus:ring-green-500'
                                    : 'border-gray-300 focus:ring-gold'
                            }`}
                        required
                    />
                </div>
                {emailError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {emailError}
                    </p>
                )}
                {formData.email && !emailError && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                        ✓ {t('auth.email')} valid
                    </p>
                )}
            </div>

            {/* Password Field (for login and register) */}
            {type !== 'password-recovery' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auth.password')}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field (for register) */}
                    {type === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.confirm_password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Name Fields (for register) */}
            {type === 'register' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.first_name')}
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder={t('auth.first_name')}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.last_name')}
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder={t('auth.last_name')}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition disabled:bg-gray-100"
                                required
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Remember Me (for login) */}
            {type === 'login' && (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold cursor-pointer disabled:opacity-50"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer">
                        {t('auth.remember_me')}
                    </label>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {type === 'login' && t('auth.login')}
                {type === 'register' && t('auth.register')}
                {type === 'password-recovery' && t('auth.send_recovery_link')}
            </button>

            {/* Links */}
            <div className="text-center text-sm">
                {type === 'login' && (
                    <>
                        <p className="text-gray-600 mb-2">
                            {t('auth.dont_have_account')}{' '}
                            <Link href={`/${locale}/auth/register`} className="text-gold hover:underline font-medium">
                                {t('auth.register_here')}
                            </Link>
                        </p>
                        <Link href={`/${locale}/auth/forgot-password`} className="text-gold hover:underline">
                            {t('auth.forgot_password')}
                        </Link>
                    </>
                )}
                {type === 'register' && (
                    <p className="text-gray-600">
                        {t('auth.already_have_account')}{' '}
                        <Link href={`/${locale}/auth/login`} className="text-gold hover:underline font-medium">
                            {t('auth.login_here')}
                        </Link>
                    </p>
                )}
                {type === 'password-recovery' && (
                    <Link href={`/${locale}/auth/login`} className="text-gold hover:underline">
                        {t('auth.back_to_login')}
                    </Link>
                )}
            </div>
        </form>
    );
}

export default AuthForm;