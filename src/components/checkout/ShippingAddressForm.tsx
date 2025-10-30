'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Address } from '@/types';
import { Customer, CustomerAddress, Country } from '@/types/collections';
import { OMAN_GOVERNORATES } from '@/types';
import { Edit2, CheckCircle, Save } from 'lucide-react';
import { getCountries } from '@/lib/api/countries';
import { updateCustomerAddress, createCustomerAddress } from '@/lib/api/customers';
import { getStatesByCountry } from '@/lib/api/states';

interface DirectusAddress {
    id?: string;
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    phone_number: string;
    countries?: string | number | Country;
    customer?: string;
}

interface ShippingAddressFormProps {
    initialAddress?: Address;
    savedAddresses: CustomerAddress[];
    customer: Customer | null;
    userEmail?: string;
    locale: string;
    onSubmit: (address: Address) => void;
    isLoading?: boolean;
    accessToken?: string;
    onAddressUpdated?: () => void;
}

export default function ShippingAddressForm({
    initialAddress,
    savedAddresses,
    customer,
    userEmail,
    locale,
    onSubmit,
    isLoading = false,
    accessToken,
    onAddressUpdated,
}: ShippingAddressFormProps) {
    const t = useTranslations();
    const isArabic = locale === 'ar';

    const [useExisting, setUseExisting] = useState(!!initialAddress && savedAddresses.length > 0);
    const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddress?.id || '');
    const [isEditingSelected, setIsEditingSelected] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [availableStates, setAvailableStates] = useState<any[]>([]);

    const [formData, setFormData] = useState<DirectusAddress>({
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        phone_number: customer?.phone || '',
        countries: undefined,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load countries from API
    useEffect(() => {
        const loadCountries = async () => {
            setIsLoadingCountries(true);
            try {
                const data = await getCountries();
                setCountries(data);
                // Set default country to Oman if available, otherwise use first country
                const oman = data.find(c => c.id === 1 || c.id === 7 || c.countries?.toLowerCase().includes('oman'));
                if (oman) {
                    setFormData((prev) => ({
                        ...prev,
                        countries: oman.id,
                    }));
                } else if (data.length > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        countries: data[0].id,
                    }));
                }
            } catch (error) {
                console.error('Failed to load countries:', error);
            } finally {
                setIsLoadingCountries(false);
            }
        };

        loadCountries();
    }, []);

    // Update available states when country changes
    useEffect(() => {
        // Extract country ID if it's a Country object
        const countryIdForStates = typeof formData.countries === 'object' && formData.countries !== null && 'id' in formData.countries
            ? formData.countries.id
            : formData.countries;
        const states = getStatesByCountry(countryIdForStates as string | number | undefined);
        setAvailableStates(states);

        // Reset state field if current state is not available in new country
        if (states.length > 0 && !states.find(s => s.value === formData.state)) {
            setFormData((prev) => ({
                ...prev,
                state: '',
            }));
        }
    }, [formData.countries]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = t('errors.required_field');
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = t('errors.required_field');
        }
        if (!formData.phone_number.trim()) {
            newErrors.phone_number = t('errors.required_field');
        }
        if (!formData.address_line_1.trim()) {
            newErrors.address_line_1 = t('errors.required_field');
        }
        if (!formData.state) {
            newErrors.state = t('errors.required_field');
        }
        if (!formData.city.trim()) {
            newErrors.city = t('errors.required_field');
        }
        if (!formData.postal_code.trim()) {
            newErrors.postal_code = t('errors.required_field');
        }
        if (!formData.countries) {
            newErrors.countries = t('errors.required_field');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Helper function to get country name by ID
    const getCountryName = (countryId?: string | number | Country): string => {
        if (!countryId) {
            return '';
        }

        // If it's a Country object, use its id
        if (typeof countryId === 'object' && countryId !== null && 'id' in countryId) {
            const country = countries.find(c => c.id === countryId.id || c.id.toString() === countryId.id?.toString());
            return country?.countries || '';
        }

        // Otherwise treat it as an ID
        const country = countries.find(c => c.id === countryId || c.id.toString() === countryId?.toString());
        return country?.countries || '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (useExisting && selectedAddressId && !isEditingSelected) {
            const selectedAddress = savedAddresses.find((addr) => String(addr.id) === String(selectedAddressId));
            if (selectedAddress) {
                // Extract country ID if it's an object
                const countryId = typeof selectedAddress.countries === 'object' && selectedAddress.countries !== null && 'id' in selectedAddress.countries
                    ? selectedAddress.countries.id
                    : selectedAddress.countries;

                // Convert CustomerAddress to Address format for submission
                const addressToSubmit: Address = {
                    id: String(selectedAddress.id || ''),
                    full_name: `${selectedAddress.first_name || ''} ${selectedAddress.last_name || ''}`,
                    phone: selectedAddress.phone_number || '',
                    email: userEmail || '',
                    governorate: selectedAddress.state || '',
                    wilayat: selectedAddress.city || '',
                    street_address: selectedAddress.address_line_1 || '',
                    building: selectedAddress.address_line_2 || '',
                    postal_code: selectedAddress.postal_code || '',
                    country_id: countryId as string | number | undefined,
                    country_name: getCountryName(selectedAddress.countries),
                    country: getCountryName(selectedAddress.countries),
                };
                onSubmit(addressToSubmit);
            }
            return;
        }

        if (!validateForm()) {
            return;
        }

        // Extract country ID if it's an object
        const countryId = typeof formData.countries === 'object' && formData.countries !== null && 'id' in formData.countries
            ? formData.countries.id
            : formData.countries;

        // Convert DirectusAddress to Address format for submission
        const addressToSubmit: Address = {
            id: formData.id || '',
            full_name: `${formData.first_name} ${formData.last_name}`,
            phone: formData.phone_number || '',
            email: userEmail || '',
            governorate: formData.state || '',
            wilayat: formData.city || '',
            street_address: formData.address_line_1 || '',
            building: formData.address_line_2 || '',
            postal_code: formData.postal_code || '',
            country_id: countryId as string | number | undefined,
            country_name: getCountryName(formData.countries),
            country: getCountryName(formData.countries),
        };
        onSubmit(addressToSubmit);
    };

    const handleInputChange = (field: keyof DirectusAddress, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const selectedAddress = savedAddresses.find((addr) => String(addr.id) === String(selectedAddressId));

    // Debug logging for address selection
    useEffect(() => {
        console.log('[ShippingAddressForm] Debug:', {
            selectedAddressId,
            selectedAddress: selectedAddress ? 'Found' : 'Not found',
            savedAddressesCount: savedAddresses.length,
            useExisting,
            isEditingSelected,
            shouldRenderPreview: !!selectedAddressId && !!selectedAddress && !isEditingSelected,
        });
    }, [selectedAddressId, selectedAddress, savedAddresses.length, useExisting, isEditingSelected]);

    // Handle loading selected address for editing
    const handleEditSelected = () => {
        if (selectedAddress) {
            setFormData({
                id: selectedAddress.id,
                first_name: selectedAddress.first_name || '',
                last_name: selectedAddress.last_name || '',
                company: selectedAddress.company || '',
                address_line_1: selectedAddress.address_line_1 || '',
                address_line_2: selectedAddress.address_line_2 || '',
                city: selectedAddress.city || '',
                state: selectedAddress.state || '',
                postal_code: selectedAddress.postal_code || '',
                phone_number: selectedAddress.phone_number || '',
                countries: selectedAddress.countries || 'OM',
            });
            setIsEditingSelected(true);
            setSaveMessage(null);
        }
    };

    // Handle saving edited address
    const handleSaveEditedAddress = async () => {
        if (!validateForm()) {
            return;
        }

        if (!accessToken || !formData.id) {
            setSaveMessage({ type: 'error', text: t('errors.something_went_wrong') });
            return;
        }

        setIsSavingAddress(true);
        try {
            await updateCustomerAddress(String(formData.id), accessToken, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                company: formData.company || undefined,
                address_line_1: formData.address_line_1,
                address_line_2: formData.address_line_2 || undefined,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                phone_number: formData.phone_number,
                countries: formData.countries,
            });

            setSaveMessage({ type: 'success', text: t('common.changes_saved_successfully') });

            // Exit edit mode after successful save and refresh addresses
            setTimeout(async () => {
                // Trigger refresh of addresses if callback provided - wait for it to complete
                if (onAddressUpdated) {
                    try {
                        await onAddressUpdated();
                    } catch (refreshError) {
                        console.error('[ShippingAddressForm] Error refreshing addresses:', refreshError);
                    }
                }
                // Exit edit mode after refresh completes
                setIsEditingSelected(false);
                setSaveMessage(null);
            }, 1500);
        } catch (error: any) {
            console.error('[ShippingAddressForm] Failed to save address:', error);
            setSaveMessage({
                type: 'error',
                text: error.message || t('errors.failed_to_save_address'),
            });
        } finally {
            setIsSavingAddress(false);
        }
    };

    // Handle saving new address for customer account
    const handleSaveNewAddress = async () => {
        if (!validateForm()) {
            return;
        }

        if (!accessToken || !customer?.id) {
            setSaveMessage({ type: 'error', text: t('errors.something_went_wrong') });
            return;
        }

        setIsSavingNewAddress(true);
        try {
            await createCustomerAddress(customer.id, accessToken, {
                customer: customer.id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                company: formData.company || undefined,
                address_line_1: formData.address_line_1,
                address_line_2: formData.address_line_2 || undefined,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                phone_number: formData.phone_number,
                countries: formData.countries,
                type: 'shipping',
            });

            setSaveMessage({ type: 'success', text: t('common.address_saved_successfully') });

            // Refresh addresses after successful save
            setTimeout(async () => {
                if (onAddressUpdated) {
                    try {
                        await onAddressUpdated();
                    } catch (refreshError) {
                        console.error('[ShippingAddressForm] Error refreshing addresses:', refreshError);
                    }
                }
                // Clear form after saving
                setFormData({
                    first_name: '',
                    last_name: '',
                    company: '',
                    address_line_1: '',
                    address_line_2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    phone_number: customer?.phone || '',
                    countries: formData.countries,
                });
                setSaveMessage(null);
                setUseExisting(true);
            }, 1500);
        } catch (error: any) {
            console.error('[ShippingAddressForm] Failed to save new address:', error);
            setSaveMessage({
                type: 'error',
                text: error.message || t('errors.failed_to_save_address'),
            });
        } finally {
            setIsSavingNewAddress(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={isArabic ? 'text-right' : 'text-left'}>
            {/* Use Existing Address Option */}
            {savedAddresses.length > 0 && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            checked={useExisting}
                            onChange={() => {
                                setUseExisting(true);
                                setIsEditingSelected(false);
                            }}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className={`ml-2 font-semibold text-gray-700 ${isArabic ? 'mr-2 ml-0' : ''}`}>
                            {t('checkout.use_saved_address')}
                        </span>
                    </label>

                    {useExisting && (
                        <div className={`mt-4 space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                            {/* Address Selector */}
                            <select
                                value={selectedAddressId}
                                onChange={(e) => {
                                    setSelectedAddressId(e.target.value);
                                    setIsEditingSelected(false);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                disabled={isEditingSelected}
                            >
                                <option value="">-- {t('checkout.select_address')} --</option>
                                {savedAddresses.map((addr) => (
                                    <option key={String(addr.id)} value={String(addr.id)}>
                                        {addr.first_name} {addr.last_name} - {addr.city}
                                    </option>
                                ))}
                            </select>

                            {/* Address Preview */}
                            {selectedAddressId && selectedAddress && !isEditingSelected && (
                                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                    <div className="space-y-2 mb-4">
                                        <p className="font-semibold text-gray-900">
                                            {selectedAddress.first_name} {selectedAddress.last_name}
                                        </p>
                                        {selectedAddress.company && (
                                            <p className="text-gray-600 text-sm">{selectedAddress.company}</p>
                                        )}
                                        <p className="text-gray-600 text-sm">{selectedAddress.address_line_1}</p>
                                        {selectedAddress.address_line_2 && (
                                            <p className="text-gray-600 text-sm">{selectedAddress.address_line_2}</p>
                                        )}
                                        <p className="text-gray-600 text-sm">
                                            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                                        </p>
                                        {selectedAddress.countries && (
                                            <p className="text-blue-700 text-sm font-medium">
                                                {getCountryName(selectedAddress.countries)}
                                            </p>
                                        )}
                                        <p className="text-gray-600 text-sm">{selectedAddress.phone_number}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleEditSelected}
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        {t('common.edit')}
                                    </button>
                                </div>
                            )}

                            {/* Edit Mode for Selected Address - Show warning message */}
                            {isEditingSelected && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">{t('checkout.editing_address')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* New Address Option / Edit Mode */}
            <div className="p-4 border border-gray-200 rounded-lg">
                {savedAddresses.length > 0 && !isEditingSelected && (
                    <label className="flex items-center cursor-pointer mb-4">
                        <input
                            type="radio"
                            checked={!useExisting}
                            onChange={() => setUseExisting(false)}
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className={`ml-2 font-semibold text-gray-700 ${isArabic ? 'mr-2 ml-0' : ''}`}>
                            {t('checkout.enter_new_address')}
                        </span>
                    </label>
                )}

                {(!useExisting || savedAddresses.length === 0 || isEditingSelected) && (
                    <div className="space-y-4">
                        {isEditingSelected && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">{t('checkout.editing_address')}</p>
                            </div>
                        )}

                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('checkout.first_name')} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.first_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder={t('checkout.first_name')}
                                    disabled={isLoading}
                                />
                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('checkout.last_name')} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.last_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder={t('checkout.last_name')}
                                    disabled={isLoading}
                                />
                                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Phone & Company */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('checkout.phone')} *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.phone_number ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="+968"
                                    disabled={isLoading}
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('checkout.company')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => handleInputChange('company', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    placeholder={t('checkout.company')}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('checkout.address_line_1')} *
                            </label>
                            <input
                                type="text"
                                value={formData.address_line_1}
                                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.address_line_1 ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder={t('checkout.street_address')}
                                disabled={isLoading}
                            />
                            {errors.address_line_1 && <p className="text-red-500 text-xs mt-1">{errors.address_line_1}</p>}
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('checkout.address_line_2')}
                            </label>
                            <input
                                type="text"
                                value={formData.address_line_2}
                                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                placeholder={t('checkout.address_line_2_placeholder')}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Country - First in the location fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('checkout.country')} *
                                <span className="text-xs text-gray-500 ml-1">(affects shipping)</span>
                            </label>
                            <select
                                value={(typeof formData.countries === 'object' && formData.countries !== null && 'id' in formData.countries
                                    ? formData.countries.id
                                    : formData.countries) || ''}
                                onChange={(e) => handleInputChange('countries', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.countries ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={isLoading || isLoadingCountries}
                            >
                                <option value="">-- {t('checkout.select_country')} --</option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.id}>
                                        {country.countries}
                                    </option>
                                ))}
                            </select>
                            {errors.countries && <p className="text-red-500 text-xs mt-1">{errors.countries}</p>}
                        </div>

                        {/* State & City */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('checkout.governorate')} *
                                </label>
                                <select
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isLoading || availableStates.length === 0}
                                >
                                    <option value="">-- {t('checkout.select_governorate')} --</option>
                                    {availableStates.map((state) => (
                                        <option key={state.value} value={state.value}>
                                            {isArabic ? state.label_ar : state.label_en}
                                        </option>
                                    ))}
                                </select>
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('checkout.city')} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder={t('checkout.wilayat')}
                                    disabled={isLoading}
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('checkout.postal_code')} *
                            </label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.postal_code ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="100"
                                disabled={isLoading}
                            />
                            {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons Section */}
            <div className="mt-8 space-y-4">
                {/* Save Message */}
                {saveMessage && (isEditingSelected || (!useExisting && !isEditingSelected)) && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {saveMessage.type === 'success' && (
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${saveMessage.type === 'success'
                            ? 'text-green-800'
                            : 'text-red-800'
                            }`}>
                            {saveMessage.text}
                        </p>
                    </div>
                )}

                {/* Save/Cancel Buttons - Show when editing selected address */}
                {isEditingSelected ? (
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSaveEditedAddress}
                            disabled={isSavingAddress}
                            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                        >
                            {isSavingAddress ? t('common.saving') : t('common.save_changes')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditingSelected(false);
                                setSaveMessage(null);
                            }}
                            disabled={isSavingAddress}
                            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                ) : !useExisting && customer ? (
                    /* New Address Buttons */
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSaveNewAddress}
                            disabled={isSavingNewAddress}
                            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            {isSavingNewAddress ? t('common.saving') : t('checkout.save_address_to_account')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                        >
                            {isLoading ? t('common.loading') : t('checkout.continue')}
                        </button>
                    </div>
                ) : (
                    /* Regular Submit Button */
                    <button
                        type="submit"
                        disabled={isLoading || (useExisting && !selectedAddressId)}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                    >
                        {isLoading ? t('common.loading') : t('checkout.continue')}
                    </button>
                )}
            </div>
        </form>
    );
}