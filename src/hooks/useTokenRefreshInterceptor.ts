'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/store/auth';

/**
 * Hook to setup axios request interceptor for automatic token refresh
 * Refreshes token BEFORE making write operations (POST, PATCH, DELETE, PUT)
 * to ensure the token is always fresh for critical operations
 * 
 * This is separate from the response interceptor which handles 401 errors
 */
export function useTokenRefreshInterceptor() {
    const { refreshTokenIfNeeded, isTokenExpired } = useAuth();

    useEffect(() => {
        // Create a request interceptor to refresh token before write operations
        const interceptor = axios.interceptors.request.use(
            async (config) => {
                try {
                    const method = config.method?.toUpperCase();

                    // Only refresh before write operations
                    const isWriteOperation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method || '');

                    if (isWriteOperation) {
                        // Check if token is close to expiration
                        // The refreshTokenIfNeeded function will only refresh if needed
                        const { isTokenExpired: checkExpired } = useAuth.getState();

                        if (checkExpired()) {
                            await refreshTokenIfNeeded();
                        }

                        // Update the authorization header with the current token if present
                        const { access_token } = useAuth.getState();
                        if (access_token && !config.headers.Authorization) {
                            config.headers.Authorization = `Bearer ${access_token}`;
                        }
                    }
                } catch (error) {
                    // Error during token refresh - let it proceed and handle in response interceptor
                    // Don't fail the request - let it proceed and handle any auth errors in response interceptor
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [refreshTokenIfNeeded, isTokenExpired]);
}