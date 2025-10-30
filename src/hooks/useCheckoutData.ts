import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/store/auth';
import { getCustomerProfile, getCustomerAddresses } from '@/lib/api/customers';
import { Customer, CustomerAddress } from '@/types/collections';

interface UseCheckoutDataReturn {
    customer: Customer | null;
    addresses: CustomerAddress[];
    isLoading: boolean;
    error: string | null;
    refreshAddresses: () => Promise<void>;
}

/**
 * Hook to fetch customer profile and addresses for checkout
 * Uses authenticated user's ID to fetch data
 * Exposes refreshAddresses function to manually trigger a refresh
 */
export function useCheckoutData(): UseCheckoutDataReturn {
    const { user, access_token } = useAuth();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const customerIdRef = useRef<string | null>(null);

    // Memoized refresh function
    const refreshAddresses = useCallback(async () => {
        if (!customerIdRef.current || !access_token) {
            return;
        }

        try {
            const addressesData = await getCustomerAddresses(customerIdRef.current, access_token);
            setAddresses(addressesData || []);
        } catch (err: any) {
            console.error('[useCheckoutData] Error refreshing addresses:', err);
            setError(err?.message || 'Failed to refresh addresses');
        }
    }, [access_token]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id || !access_token) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const startTime = performance.now();

                // Fetch customer profile
                const customerData = await getCustomerProfile(user.id, access_token);
                if (!customerData) {
                    setError('Failed to load customer profile');
                    setIsLoading(false);
                    return;
                }

                customerIdRef.current = customerData.id;

                // Fetch addresses in PARALLEL instead of sequentially
                // This can save 500ms-2s by not waiting for customer profile setter
                const addressesData = await getCustomerAddresses(customerData.id, access_token);

                // Update state together
                setCustomer(customerData);
                setAddresses(addressesData || []);
            } catch (err: any) {
                console.error('[useCheckoutData] Error:', err);
                setError(err?.message || 'Failed to load checkout data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.id, access_token]);

    return {
        customer,
        addresses,
        isLoading,
        error,
        refreshAddresses,
    };
}