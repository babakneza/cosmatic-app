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
        <div className="space-y-3">
            {addresses.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Addresses Yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Create your first address to enable faster checkout.
                    </p>
                    <Link
                        href={`/${locale}/account/addresses/add`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg text-sm"
                    >
                        <span>+</span>
                        Add Address
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                        >
                            {/* Card Header - Compact */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900 text-base">
                                    {address.first_name} {address.last_name}
                                </h3>
                                {address.city && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        <Building2 className="w-3 h-3 inline mr-1" />
                                        {address.city}
                                    </p>
                                )}
                            </div>

                            {/* Address Details - Minimal */}
                            <div className="px-4 py-3 space-y-2">
                                <div>
                                    <p className="text-xs font-medium text-gray-900">{address.address_line_1}</p>
                                    {address.address_line_2 && (
                                        <p className="text-xs text-gray-600">{address.address_line_2}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p className="text-gray-500">City</p>
                                        <p className="text-gray-900 font-medium">{address.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Postal</p>
                                        <p className="text-gray-900 font-medium">{address.postal_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Type Boxes - Horizontal Layout */}
                            <div className="px-4 py-2 border-t border-gray-200 grid grid-cols-3 gap-2">
                                {/* Shipping Box */}
                                <button
                                    onClick={() => handleSetDefaultShipping(address.id)}
                                    disabled={settingDefault[`ship-${address.id}`]}
                                    className={`px-2 py-2 rounded-lg transition text-center text-xs ${
                                        address.isDefaultShipping
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                    }`}
                                    title="Set as Shipping Address"
                                >
                                    <div className="font-bold text-xs">📦</div>
                                    <div className="font-semibold leading-tight">Shipping</div>
                                    <div className="text-xs opacity-90 leading-tight">Delivery</div>
                                </button>

                                {/* Billing Box */}
                                <button
                                    onClick={() => handleSetDefaultBilling(address.id)}
                                    disabled={settingDefault[`bill-${address.id}`]}
                                    className={`px-2 py-2 rounded-lg transition text-center text-xs ${
                                        address.isDefaultBilling
                                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                    }`}
                                    title="Set as Billing Address"
                                >
                                    <div className="font-bold text-xs">💳</div>
                                    <div className="font-semibold leading-tight">Billing</div>
                                    <div className="text-xs opacity-90 leading-tight">Invoice</div>
                                </button>

                                {/* Default Box */}
                                <div
                                    className={`px-2 py-2 rounded-lg text-center text-xs ${
                                        (address.isDefaultShipping || address.isDefaultBilling)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                                    }`}
                                >
                                    <div className="font-bold text-xs">✓</div>
                                    <div className="font-semibold leading-tight">Default</div>
                                    <div className="text-xs opacity-90 leading-tight">Primary</div>
                                </div>
                            </div>

                            {/* Actions Footer - Compact */}
                            <div className="px-4 py-2 border-t border-gray-200 flex gap-2 bg-white">
                                <Link
                                    href={`/${locale}/account/addresses/${address.id}/edit`}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-xs transition"
                                >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    disabled={deleteLoading[address.id]}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-3 h-3" />
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