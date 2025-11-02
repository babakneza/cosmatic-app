'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { getCustomerProfile } from '@/lib/api/customers';
import { LogOut, User, Mail, Phone, MapPin, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Customer } from '@/types/collections';

interface AccountPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function AccountPage({ params }: AccountPageProps) {
    const resolvedParams = React.use(params);
    const t = useTranslations();
    const router = useRouter();
    const { user, logout, is_authenticated, updateProfile, access_token, customer_profile: storeCustomerProfile } = useAuth();
    const [isHydrated, setIsHydrated] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [customerProfile, setCustomerProfile] = React.useState<Customer | null>(storeCustomerProfile);
    const [editedData, setEditedData] = React.useState({
        first_name: storeCustomerProfile?.first_name || user?.first_name || '',
        last_name: storeCustomerProfile?.last_name || user?.last_name || '',
    });

    // Mark as hydrated after first client render
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sync customer profile from auth store
    useEffect(() => {
        if (storeCustomerProfile) {
            setCustomerProfile(storeCustomerProfile);
            setEditedData({
                first_name: storeCustomerProfile.first_name || user?.first_name || '',
                last_name: storeCustomerProfile.last_name || user?.last_name || '',
            });
        }
    }, [storeCustomerProfile, user]);

    // Fetch customer profile if not available in store
    useEffect(() => {
        const fetchCustomerProfile = async () => {
            if (user?.id && access_token && !storeCustomerProfile) {
                try {
                    const customer = await getCustomerProfile(user.id, access_token);
                    if (customer) {
                        setCustomerProfile(customer);
                        // Update edited data with customer profile if available
                        setEditedData({
                            first_name: customer.first_name || user.first_name || '',
                            last_name: customer.last_name || user.last_name || '',
                        });
                    }
                } catch (error: any) {
                    console.error('Failed to fetch customer profile:', error);
                    // Fallback to user data
                    setEditedData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                    });
                }
            }
        };

        fetchCustomerProfile();
    }, [user?.id, access_token, storeCustomerProfile]);

    // Update edited data when user changes
    useEffect(() => {
        if (user && !customerProfile) {
            setEditedData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
            });
        }
    }, [user, customerProfile]);

    // Redirect to login if not authenticated (only after hydration)
    useEffect(() => {
        if (isHydrated && !is_authenticated) {
            router.push(`/${resolvedParams.locale}/auth/login`);
        }
    }, [isHydrated, is_authenticated, resolvedParams.locale, router]);

    // Auto-dismiss messages after 4 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleLogout = () => {
        logout();
        router.push(`/${resolvedParams.locale}`);
    };

    const handleSaveProfile = async () => {
        try {
            // Validate input
            if (!editedData.first_name.trim() || !editedData.last_name.trim()) {
                setMessage({
                    type: 'error',
                    text: t('auth.first_name') + ' ' + t('common.and') + ' ' + t('auth.last_name') + ' ' + t('common.are_required'),
                });
                return;
            }

            setIsSaving(true);

            // Call the updateProfile function from auth store
            await updateProfile({
                first_name: editedData.first_name.trim(),
                last_name: editedData.last_name.trim(),
            });

            // Refresh customer profile after successful update
            if (user?.id && access_token) {
                try {
                    const customer = await getCustomerProfile(user.id, access_token);
                    if (customer) {
                        setCustomerProfile(customer);
                    }
                } catch (error: any) {
                    console.error('Failed to refresh customer profile:', error);
                }
            }

            setMessage({
                type: 'success',
                text: t('auth.profile_updated_success'),
            });
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            setMessage({
                type: 'error',
                text: error?.message || t('auth.error_updating_profile'),
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading state while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    // Still loading auth data
    if (!is_authenticated || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-b-4 border-gold">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {customerProfile?.first_name || user.first_name} {customerProfile?.last_name || user.last_name}
                                </h1>
                                <p className="text-gray-600">{t('account.account_page')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('account.logout')}
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Account Details */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gold" />
                                {t('account.profile_information')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('auth.first_name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={editedData.first_name}
                                        onChange={(e) => setEditedData(prev => ({ ...prev, first_name: e.target.value }))}
                                        disabled={!isEditing}
                                        className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('auth.last_name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={editedData.last_name}
                                        onChange={(e) => setEditedData(prev => ({ ...prev, last_name: e.target.value }))}
                                        disabled={!isEditing}
                                        className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {t('auth.email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="mt-1 w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
                                </div>
                                {/* Edit Profile Button */}
                                <div className="pt-4 border-t border-gray-200">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition"
                                        >
                                            {t('account.edit_profile')}
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition"
                                            >
                                                {isSaving ? t('common.saving') : t('account.save_profile')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditedData({
                                                        first_name: user?.first_name || '',
                                                        last_name: user?.last_name || '',
                                                    });
                                                }}
                                                disabled={isSaving}
                                                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 text-gray-900 font-medium rounded-lg transition"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Status */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">{t('account.account_status')}</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">{t('account.status')}:</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        {t('account.active')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">{t('account.email_verified')}:</span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {user.email_verified ? t('account.yes') : t('account.no')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-200">
                            <h3 className="font-bold text-blue-900 mb-2">{t('account.need_help')}</h3>
                            <p className="text-sm text-blue-800 mb-4">
                                {t('account.contact_support')}
                            </p>
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm">
                                {t('account.contact_us')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}