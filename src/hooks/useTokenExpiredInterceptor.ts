import { useEffect } from 'react';
import axios from 'axios';
import { useLoginModal } from '@/store/modal';
import { useAuth } from '@/store/auth';
import { useCheckoutStore } from '@/store/checkout';

/**
 * Hook to setup axios interceptor for handling 401 token expired errors
 * Shows login modal instead of displaying error
 * IMPORTANT: Preserves checkout state when token expires
 * 
 * Usage: Call this hook in your root layout or main app component
 */
export function useTokenExpiredInterceptor() {
    const { openLoginModal } = useLoginModal();
    const { logout } = useAuth();
    const checkoutState = useCheckoutStore();

    useEffect(() => {
        // Create a response interceptor to handle 401 errors
        const interceptor = axios.interceptors.response.use(
            (response) => response, // Pass through successful responses
            async (error) => {
                const status = error.response?.status;
                const data = error.response?.data;
                const config = error.config;

                // Handle 401 Unauthorized errors
                if (status === 401) {
                    // Don't show modal for read-only API calls (GET requests to confirmation page data)
                    // Only show for write operations that require valid authentication
                    const method = config?.method?.toUpperCase();
                    const url = config?.url || '';

                    // Skip modal for confirmation page data fetches
                    if (method === 'GET' && url.includes('/api/orders')) {
                        return Promise.reject(error);
                    }

                    const errorMessage = data?.error || data?.message || 'Unauthorized';

                    // Check if it's specifically a token expiration error (be more specific)
                    if (
                        errorMessage.toLowerCase().includes('token expired') ||
                        data?.code === 'TOKEN_EXPIRED' ||
                        data?.requiresRelogin
                    ) {

                        // Open the login modal
                        openLoginModal();

                        // CRITICAL FIX: Clear auth but PRESERVE checkout state
                        // Use a custom logout that doesn't reset checkout
                        const { access_token, refresh_token, is_authenticated, ...authState } = {
                            access_token: null,
                            refresh_token: null,
                            is_authenticated: false,
                            user: null,
                            customer_id: null,
                            customer_profile: null,
                            token_expires_at: null,
                            is_loading: false,
                            error: null,
                            remember_me: false,
                        };

                        // Perform logout without affecting checkout state
                        await logout();

                        // Return a custom error that won't be shown to user
                        // Silent rejection - no popup notification needed, login modal handles everything
                        return Promise.reject({
                            type: 'TOKEN_EXPIRED',
                            handled: true,
                            _silent: true,
                            message: 'Token expired - handled silently by interceptor'
                        });
                    }
                }

                // For other 401 errors, reject normally
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [openLoginModal, logout, checkoutState.step]);
}