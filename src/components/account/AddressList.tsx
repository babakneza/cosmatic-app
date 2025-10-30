'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
    getCustomerAddresses,
    deleteCustomerAddress,
    setDefaultShippingAddress,
    setDefaultBillingAddress,
    getCustomerProfileById,
} from '@/lib/api/customers';
import { getCountries } from '@/lib/api/countries';
import { CustomerAddress, Customer } from '@/types/collections';
import {
    MapPin,
    Edit,
    Trash2,
    CheckCircle,
    Star,
    Building2,
    Phone,
    Mail,
    AlertCircle,
} from 'lucide-react';

interface AddressListProps {
    customerId: string;
    accessToken: string;
    locale: string;
}

interface AddressWithMeta extends CustomerAddress {
    isDefaultShipping?: boolean;
    isDefaultBilling?: boolean;
}

export default function AddressList({
    customerId,
    accessToken,
    locale,
}: AddressListProps) {
    const t = useTranslations();
    const [addresses, setAddresses] = useState<AddressWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
    const [settingDefault, setSettingDefault] = useState<Record<string, boolean>>({});
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [countryNames, setCountryNames] = useState<Record<string | number, string>>({});

    // Function to fetch all country names and cache them
    const loadCountryNames = async () => {
        try {
            console.log('[AddressList] Fetching all countries...');
            const countries = await getCountries();

            // Build a map of country IDs to country names
            const countryMap: Record<string | number, string> = {};
            countries.forEach((country: any) => {
                if (country.id && country.countries) {
                    countryMap[country.id] = country.countries;
                    console.log(`[AddressList] Cached country: ${country.id} = ${country.countries}`);
                }
            });

            setCountryNames(countryMap);
            console.log('[AddressList] Country cache loaded:', countryMap);
        } catch (err: any) {
            console.error('[AddressList] Failed to fetch countries:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('[AddressList] Attempting to fetch addresses with customerId:', {
                    value: customerId,
                    type: typeof customerId,
                    isNaN: isNaN(Number(customerId)),
                    hasAccessToken: !!accessToken
                });

                // Load all country names first
                await loadCountryNames();

                // Fetch customer profile
                const customerData = await getCustomerProfileById(customerId, accessToken);
                setCustomer(customerData);

                // Fetch addresses
                const result = await getCustomerAddresses(customerId, accessToken);
                const addressesWithMeta = result.map((addr) => ({
                    ...addr,
                    isDefaultShipping:
                        customerData?.default_shipping ===
                        (typeof customerData?.default_shipping === 'string'
                            ? addr.id
                            : customerData?.default_shipping?.id),
                    isDefaultBilling:
                        customerData?.default_billing ===
                        (typeof customerData?.default_billing === 'string'
                            ? addr.id
                            : customerData?.default_billing?.id),
                }));
                setAddresses(addressesWithMeta);
            } catch (err: any) {
                console.error('Failed to fetch addresses:', err);
                setError(err.message || 'Failed to load addresses');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [customerId, accessToken]);

    const handleDelete = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            setDeleteLoading((prev) => ({ ...prev, [addressId]: true }));
            await deleteCustomerAddress(addressId, accessToken);
            setAddresses(addresses.filter((addr) => addr.id !== addressId));
        } catch (err: any) {
            console.error('Failed to delete address:', err);
            alert('Failed to delete address');
        } finally {
            setDeleteLoading((prev) => ({ ...prev, [addressId]: false }));
        }
    };

    const handleSetDefaultShipping = async (addressId: string) => {
        try {
            setSettingDefault((prev) => ({ ...prev, [`ship-${addressId}`]: true }));
            await setDefaultShippingAddress(customerId, addressId, accessToken);
            setAddresses(
                addresses.map((addr) => ({
                    ...addr,
                    isDefaultShipping: addr.id === addressId,
                }))
            );
        } catch (err: any) {
            console.error('Failed to set default shipping address:', err);
            alert('Failed to set default shipping address');
        } finally {
            setSettingDefault((prev) => ({ ...prev, [`ship-${addressId}`]: false }));
        }
    };

    const handleSetDefaultBilling = async (addressId: string) => {
        try {
            setSettingDefault((prev) => ({ ...prev, [`bill-${addressId}`]: true }));
            await setDefaultBillingAddress(customerId, addressId, accessToken);
            setAddresses(
                addresses.map((addr) => ({
                    ...addr,
                    isDefaultBilling: addr.id === addressId,
                }))
            );
        } catch (err: any) {
            console.error('Failed to set default billing address:', err);
            alert('Failed to set default billing address');
        } finally {
            setSettingDefault((prev) => ({ ...prev, [`bill-${addressId}`]: false }));
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse h-40 rounded-xl"
                    ></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error Loading Addresses</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {addresses.length === 0 ? (
                <div className="text-center py-16 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Addresses Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create your first address to enable faster checkout and delivery.
                    </p>
                    <Link
                        href={`/${locale}/account/addresses/add`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg"
                    >
                        <span>+</span>
                        Add Your First Address
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group"
                        >
                            {/* Card Header with Default Badges */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {address.first_name} {address.last_name}
                                        </h3>
                                        {address.city && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {address.city}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {address.isDefaultShipping && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            <Star className="w-3 h-3 fill-current" />
                                            Shipping
                                        </span>
                                    )}
                                    {address.isDefaultBilling && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                            <Star className="w-3 h-3 fill-current" />
                                            Billing
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Address Details */}
                            <div className="px-6 py-5 space-y-3">
                                {/* Street Address */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                                    <p className="text-gray-900 font-medium">{address.address_line_1}</p>
                                    {address.address_line_2 && (
                                        <p className="text-sm text-gray-600">
                                            {address.address_line_2}
                                        </p>
                                    )}
                                    {address.company && (
                                        <p className="text-sm text-gray-600">
                                            {address.company}
                                        </p>
                                    )}
                                </div>

                                {/* Location Details */}
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">
                                            City
                                        </p>
                                        <p className="text-gray-900 font-medium">{address.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">State</p>
                                        <p className="text-gray-900 font-medium">{address.state || '-'}</p>
                                    </div>
                                </div>

                                {/* Postal Code and Country */}
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">
                                            Postal Code
                                        </p>
                                        <p className="text-gray-900 font-medium">{address.postal_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
                                        <p className="text-gray-900 font-medium">
                                            {(() => {
                                                const countryValue = address.countries || address.country;

                                                // If it's an expanded object with 'countries' property
                                                if (typeof countryValue === 'object' && countryValue !== null && 'countries' in countryValue) {
                                                    const countryObj = countryValue as any;
                                                    return countryObj.countries;
                                                }

                                                // If it's a number or string number, look up the country name
                                                if (typeof countryValue === 'number' || (typeof countryValue === 'string' && /^\d+$/.test(countryValue))) {
                                                    const countryId = countryValue;
                                                    const countryName = countryNames[countryId];
                                                    if (countryName) {
                                                        return countryName;
                                                    }
                                                }

                                                // Fallback to the raw value
                                                return String(countryValue) || '-';
                                            })()}
                                        </p>
                                    </div>
                                </div>

                                {/* Address Type */}
                                <div className="pt-2">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                                    <p className="text-gray-900 font-medium capitalize">{address.type}</p>
                                </div>
                            </div>

                            {/* Set As Default Section */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
                                <button
                                    onClick={() => handleSetDefaultShipping(address.id)}
                                    disabled={settingDefault[`ship-${address.id}`]}
                                    className={`w-full px-4 py-2 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2 ${address.isDefaultShipping
                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {address.isDefaultShipping && (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    {settingDefault[`ship-${address.id}`]
                                        ? 'Setting...'
                                        : address.isDefaultShipping
                                            ? 'Default Shipping Address'
                                            : 'Set as Shipping Address'}
                                </button>

                                <button
                                    onClick={() => handleSetDefaultBilling(address.id)}
                                    disabled={settingDefault[`bill-${address.id}`]}
                                    className={`w-full px-4 py-2 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2 ${address.isDefaultBilling
                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {address.isDefaultBilling && (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    {settingDefault[`bill-${address.id}`]
                                        ? 'Setting...'
                                        : address.isDefaultBilling
                                            ? 'Default Billing Address'
                                            : 'Set as Billing Address'}
                                </button>
                            </div>

                            {/* Actions Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-white">
                                <Link
                                    href={`/${locale}/account/addresses/${address.id}/edit`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    disabled={deleteLoading[address.id]}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}