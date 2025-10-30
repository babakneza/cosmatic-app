'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createCustomerAddress, updateCustomerAddress, getCustomerAddresses, getCustomerAddress } from '@/lib/api/customers';
import { getCountries } from '@/lib/api/countries';
import { CustomerAddress, Country } from '@/types/collections';
import { ArrowLeft } from 'lucide-react';

interface AddressFormProps {
    customerId: string | number;
    accessToken: string;
    locale: string;
    addressId?: string;
}

export default function AddressForm({ customerId, accessToken, locale, addressId }: AddressFormProps) {
    const t = useTranslations();
    const router = useRouter();
    const [loading, setLoading] = useState(!!addressId);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(true);

    const [formData, setFormData] = useState<{
        type: 'shipping' | 'billing' | 'both';
        first_name: string;
        last_name: string;
        company: string;
        address_line_1: string;
        address_line_2: string;
        city: string;
        state: string;
        postal_code: string;
        country: string | number;
        is_default: boolean;
    }>({
        type: 'shipping',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '', // Will store country ID
        is_default: false,
    });

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setCountriesLoading(true);
                const data = await getCountries();
                setCountries(data);
            } catch (err: any) {
                console.error('Failed to fetch countries:', err);
            } finally {
                setCountriesLoading(false);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        if (addressId) {
            const fetchAddress = async () => {
                try {
                    setLoading(true);
                    console.log('[AddressForm] Fetching address with ID:', {
                        addressId,
                        addressIdType: typeof addressId,
                        customerId,
                        customerIdType: typeof customerId,
                    });

                    // Try the direct endpoint first (more efficient)
                    let address = await getCustomerAddress(addressId, accessToken);

                    // If not found, fall back to fetching all addresses and filtering
                    if (!address) {
                        console.log('[AddressForm] Direct fetch failed, falling back to fetch all addresses');
                        const addresses = await getCustomerAddresses(String(customerId), accessToken);
                        console.log('[AddressForm] Fetched addresses:', addresses.map(a => ({ id: a.id, type: typeof a.id })));

                        // Handle both string and numeric ID comparisons
                        address = addresses.find(a => String(a.id) === String(addressId)) || null;
                    }

                    if (address) {
                        console.log('[AddressForm] Found address:', address.id);

                        // Extract country ID if countries is an object (or check address.country as fallback)
                        const countryValue = typeof address.countries === 'object' && address.countries
                            ? address.countries.id
                            : (typeof address.country === 'object' && address.country
                                ? address.country.id
                                : (address.countries || address.country || ''));

                        setFormData({
                            type: address.type || 'shipping',
                            first_name: address.first_name || '',
                            last_name: address.last_name || '',
                            company: address.company || '',
                            address_line_1: address.address_line_1 || '',
                            address_line_2: address.address_line_2 || '',
                            city: address.city || '',
                            state: address.state || '',
                            postal_code: address.postal_code || '',
                            country: String(countryValue ?? ''),
                            is_default: address.is_default || false,
                        });
                    } else {
                        console.warn('[AddressForm] Address not found with ID:', addressId);
                        setError('Address not found');
                    }
                } catch (err: any) {
                    console.error('Failed to fetch address:', err);
                    setError('Failed to load address: ' + (err.message || 'Unknown error'));
                } finally {
                    setLoading(false);
                }
            };
            fetchAddress();
        }
    }, [addressId, customerId, accessToken]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.first_name.trim()) {
            setError('First name is required');
            return;
        }
        if (!formData.last_name.trim()) {
            setError('Last name is required');
            return;
        }
        if (!formData.address_line_1.trim()) {
            setError('Street address is required');
            return;
        }
        if (!formData.city.trim()) {
            setError('City is required');
            return;
        }
        if (!formData.postal_code.trim()) {
            setError('Postal code is required');
            return;
        }
        if (!formData.country || (typeof formData.country === 'string' && !formData.country.trim())) {
            setError('Country is required');
            return;
        }

        try {
            setSubmitting(true);

            const addressPayload = {
                ...formData,
                type: formData.type as 'shipping' | 'billing' | 'both',
            };

            if (addressId) {
                // Update existing address
                await updateCustomerAddress(addressId, accessToken, addressPayload);
            } else {
                // Create new address
                await createCustomerAddress(String(customerId), accessToken, addressPayload);
            }

            // Redirect back to addresses page
            router.push(`/${locale}/account/addresses`);
        } catch (err: any) {
            console.error('Failed to save address:', err);
            console.error('Error response:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });

            // Try to extract the most useful error message
            const errorMsg =
                err.response?.data?.error ||
                err.message ||
                'Failed to save address';

            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gold hover:text-amber-600 mb-6 transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Addresses
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {addressId ? 'Edit Address' : 'Add New Address'}
            </h2>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Address Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Type
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                        <option value="both">Shipping & Billing</option>
                    </select>
                </div>

                {/* First Name and Last Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="John"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                {/* Company */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company (Optional)
                    </label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="Company name"
                    />
                </div>

                {/* Address Line 1 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                    </label>
                    <input
                        type="text"
                        name="address_line_1"
                        value={formData.address_line_1}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="123 Main Street"
                    />
                </div>

                {/* Address Line 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apartment, suite, etc. (Optional)
                    </label>
                    <input
                        type="text"
                        name="address_line_2"
                        value={formData.address_line_2}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        placeholder="Apt 2B"
                    />
                </div>

                {/* City and State Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="Muscat"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State (Optional)
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="State/Province"
                        />
                    </div>
                </div>

                {/* Postal Code and Country Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code *
                        </label>
                        <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                            placeholder="12345"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                        </label>
                        {countriesLoading ? (
                            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                                <span>Loading countries...</span>
                            </div>
                        ) : (
                            <select
                                name="country"
                                value={String(formData.country)}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                            >
                                <option value="">Select a country</option>
                                {countries.map((country) => (
                                    <option key={country.id} value={String(country.id)}>
                                        {country.countries}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Default Address */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                        className="w-4 h-4 text-gold rounded focus:ring-2 focus:ring-gold"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                        Set as default address
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gold hover:bg-amber-600 disabled:opacity-50 text-gray-900 font-medium rounded-lg transition shadow-md hover:shadow-lg"
                    >
                        {submitting ? 'Saving...' : 'Save Address'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}