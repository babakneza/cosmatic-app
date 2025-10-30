'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/store/auth';
import { useTokenExpiredInterceptor } from '@/hooks/useTokenExpiredInterceptor';
import { useTokenRefreshInterceptor } from '@/hooks/useTokenRefreshInterceptor';
import { TokenExpiredLoginModal } from './TokenExpiredLoginModal';

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Auth Provider
 * Initializes auth state from storage and handles token refresh
 * Also sets up global interceptors:
 * - Request interceptor: Refreshes token before write operations
 * - Response interceptor: Handles 401 token expired errors
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Setup axios interceptor for refreshing token before write operations
    useTokenRefreshInterceptor();

    // Setup axios interceptor for handling token expired errors
    useTokenExpiredInterceptor();

    // CRITICAL FIX: Ensure hydration happens and is detected
    useEffect(() => {
        let isSubscribed = true;

        const checkAndRestoreHydration = async () => {
            try {
                // Small delay to let Zustand persist middleware initialize
                await new Promise(resolve => setTimeout(resolve, 0));

                // Check if Zustand has already hydrated
                const currentState = useAuth.getState();

                // If already hydrated by persist middleware, great!
                if (currentState._hasHydrated) {
                    if (isSubscribed) setIsHydrated(true);
                    return;
                }

                // Otherwise, manually load from localStorage as fallback
                const stored = localStorage.getItem('auth-store');

                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        const stateData = parsed.state || parsed;

                        if (stateData.access_token && stateData.is_authenticated) {
                            // Restore the state
                            useAuth.setState({
                                user: stateData.user || null,
                                access_token: stateData.access_token || null,
                                refresh_token: stateData.refresh_token || null,
                                is_authenticated: stateData.is_authenticated === true,
                                remember_me: stateData.remember_me || false,
                                customer_id: stateData.customer_id || null,
                                token_expires_at: stateData.token_expires_at || null,
                                _hasHydrated: true,
                            });
                        }
                    } catch (parseError) {
                        // Silently fail on parse error
                    }
                }
            } catch (error) {
                // Silently fail on hydration check error
            }

            // Mark hydration as complete regardless
            if (isSubscribed) setIsHydrated(true);
        };

        checkAndRestoreHydration();

        return () => {
            isSubscribed = false;
        };
    }, []);

    // Initialize auth on app start (validate tokens, fetch user data)
    useEffect(() => {
        if (!isHydrated || hasInitialized) return;

        setHasInitialized(true);

        const initializeAuth = async () => {
            try {
                const { access_token, refresh_token, is_authenticated, user, customer_id, refreshTokenIfNeeded, getCurrentUser, fetchCustomerProfile } = useAuth.getState();

                // If we have tokens, ensure they're still valid
                if (access_token && refresh_token && is_authenticated) {
                    // Try to refresh tokens to ensure they're still valid
                    await refreshTokenIfNeeded();

                    // If user object is empty or missing ID, fetch complete user profile
                    if (!user?.id && access_token) {
                        try {
                            await getCurrentUser();
                        } catch (error) {
                            // Silently fail - user profile fetch is non-critical
                        }
                    }

                    // If customer ID is missing, fetch it
                    if (!customer_id && user?.id && access_token) {
                        try {
                            await fetchCustomerProfile();
                        } catch (error) {
                            // Silently fail - customer profile fetch is non-critical
                        }
                    }
                }
            } catch (error) {
                // Silently fail - if refresh fails, user will need to login again
            }
        };

        initializeAuth();
    }, [isHydrated, hasInitialized]);

    // Set up periodic token refresh (every 3 minutes for more aggressive token management)
    // This ensures we always have a fresh token and don't hit expiration edge cases
    useEffect(() => {
        if (!isHydrated) return;

        const refreshInterval = setInterval(
            async () => {
                try {
                    const { access_token, refresh_token, is_authenticated, refreshTokenIfNeeded, isTokenExpired } = useAuth.getState();
                    if (access_token && refresh_token && is_authenticated) {
                        // Always refresh if token is close to expiration (within 10 minute buffer)
                        if (isTokenExpired()) {
                            console.log('[AuthProvider] Token close to expiration, refreshing...');
                            await refreshTokenIfNeeded();
                        }
                    }
                } catch (error) {
                    console.warn('[AuthProvider] Error during periodic token refresh:', error);
                    // Silently fail - periodic token refresh is non-critical
                }
            },
            3 * 60 * 1000 // 3 minutes - more aggressive refresh
        );

        return () => {
            clearInterval(refreshInterval);
        };
    }, [isHydrated]);

    return (
        <>
            {children}
            <TokenExpiredLoginModal />
        </>
    );
}

export default AuthProvider;