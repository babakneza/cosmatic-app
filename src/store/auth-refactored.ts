/**
 * Refactored Auth Store (Modularized)
 * To replace the existing src/store/auth.ts with better organization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authClient from '@/lib/api/auth';
import {
    createCustomerProfile,
    getCustomerProfile,
    updateCustomerProfile
} from '@/lib/api/customers';
import { createScopedLogger } from '@/lib/logger';
import {
    calculateTokenExpiration,
    isTokenExpired,
    clearTokenRefreshTimer,
    scheduleTokenRefresh,
    TOKEN_REFRESH_BUFFER_MS
} from './auth/token-manager';
import type {
    AuthStore,
    AuthState,
    AuthStoreActions
} from './auth/auth-types';
import type {
    AuthUser,
    LoginCredentials,
    RegisterCredentials,
    PasswordRecoveryRequest,
    PasswordResetCredentials,
    AuthError
} from '@/types/auth';
import type { Customer } from '@/types/collections';

const logger = createScopedLogger('AuthStore');

/**
 * Create the auth store with modularized structure
 */
export const useAuth = create<AuthStore>()(
    persist(
        (set, get) => ({
            // ============================================
            // INITIAL STATE
            // ============================================
            user: null,
            access_token: null,
            refresh_token: null,
            is_authenticated: false,
            is_loading: false,
            error: null,
            remember_me: false,
            customer_id: null,
            customer_profile: null,
            token_expires_at: null,
            _hasHydrated: false,
            redirectUrl: null,

            // ============================================
            // TOKEN MANAGEMENT ACTIONS
            // ============================================

            /**
             * Check if current token is expired
             */
            isTokenExpired: (): boolean => {
                const { token_expires_at } = get();
                return isTokenExpired(token_expires_at, TOKEN_REFRESH_BUFFER_MS);
            },

            /**
             * Set tokens directly
             */
            setTokens: (access_token: string, refresh_token: string): void => {
                set({
                    access_token,
                    refresh_token,
                    is_authenticated: true
                });
            },

            /**
             * Set user
             */
            setUser: (user: AuthUser | null): void => {
                set({ user });
            },

            /**
             * Clear all auth data
             */
            clearAuth: (): void => {
                set({
                    user: null,
                    access_token: null,
                    refresh_token: null,
                    is_authenticated: false,
                    remember_me: false,
                    customer_id: null,
                    customer_profile: null,
                    token_expires_at: null,
                    error: null,
                    is_loading: false
                });
                clearTokenRefreshTimer();
            },

            // ============================================
            // ERROR HANDLING
            // ============================================

            /**
             * Set error state
             */
            setError: (error: AuthError | Error | string): void => {
                logger.error('Auth error set', error);
                const normalizedError = error instanceof Error ? error.message : error;
                set({ error: normalizedError });
            },

            /**
             * Clear error state
             */
            clearError: (): void => {
                set({ error: null });
            },

            // ============================================
            // AUTHENTICATION ACTIONS
            // ============================================

            /**
             * Login with email and password
             */
            login: async (credentials: LoginCredentials): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    logger.debug('Login started', { email: credentials.email });

                    const response = await authClient.login(credentials);

                    if (!response.access_token) {
                        throw new Error('No access token in login response');
                    }

                    const expiresAt = calculateTokenExpiration(response.expires);

                    const authData = {
                        user: response.user || null,
                        access_token: response.access_token,
                        refresh_token: response.refresh_token || null,
                        is_authenticated: true,
                        remember_me: credentials.remember_me || false,
                        token_expires_at: expiresAt,
                        is_loading: false
                    };

                    set(authData);
                    logger.info('Login successful', { userId: response.user?.id });

                    // Auto-create or verify customer profile
                    if (response.user?.id && response.access_token) {
                        try {
                            let customer = await getCustomerProfile(
                                response.user.id,
                                response.access_token
                            );

                            if (!customer) {
                                customer = await createCustomerProfile(
                                    response.user.id,
                                    response.access_token
                                );
                            }

                            if (customer?.id) {
                                set({
                                    customer_id: customer.id,
                                    customer_profile: customer
                                });
                                logger.debug('Customer profile created/verified', {
                                    customerId: customer.id
                                });
                            }
                        } catch (error) {
                            logger.warn('Failed to create customer profile', error);
                            // Non-critical, continue
                        }
                    }

                    // Schedule token refresh
                    scheduleTokenRefresh(response.expires, () => {
                        get().refreshTokenIfNeeded();
                    });
                } catch (error) {
                    logger.error('Login failed', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({
                        error: normalizedError,
                        is_loading: false
                    });
                    throw error;
                }
            },

            /**
             * Register new user
             */
            register: async (
                credentials: RegisterCredentials
            ): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    logger.debug('Registration started', { email: credentials.email });

                    const response = await authClient.register(credentials);

                    const expiresAt = calculateTokenExpiration(response.expires);

                    const authData = {
                        user: response.user || null,
                        access_token: response.access_token,
                        refresh_token: response.refresh_token || null,
                        is_authenticated: true,
                        token_expires_at: expiresAt,
                        is_loading: false
                    };

                    set(authData);
                    logger.info('Registration successful', { userId: response.user?.id });

                    // Auto-create customer profile for new registration
                    if (response.user?.id && response.access_token) {
                        try {
                            const customer = await createCustomerProfile(
                                response.user.id,
                                response.access_token,
                                {
                                    phone: credentials.phone || undefined
                                }
                            );

                            if (customer?.id) {
                                set({
                                    customer_id: customer.id,
                                    customer_profile: customer
                                });
                                logger.debug('Customer profile created', {
                                    customerId: customer.id
                                });
                            }
                        } catch (error) {
                            logger.warn('Failed to create customer profile', error);
                            // Non-critical, continue
                        }
                    }

                    // Schedule token refresh
                    scheduleTokenRefresh(response.expires, () => {
                        get().refreshTokenIfNeeded();
                    });
                } catch (error) {
                    logger.error('Registration failed', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({
                        error: normalizedError,
                        is_loading: false
                    });
                    throw error;
                }
            },

            /**
             * Logout current user
             */
            logout: async (): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    const { refresh_token } = get();

                    if (refresh_token) {
                        try {
                            await authClient.logout(refresh_token);
                            logger.debug('Logout API called');
                        } catch (error) {
                            logger.warn('Logout API failed', error);
                            // Continue to clear local state even if API fails
                        }
                    }

                    // Clear all auth data
                    set({
                        user: null,
                        access_token: null,
                        refresh_token: null,
                        is_authenticated: false,
                        remember_me: false,
                        is_loading: false,
                        customer_id: null,
                        customer_profile: null,
                        token_expires_at: null
                    });

                    clearTokenRefreshTimer();
                    logger.info('Logout completed');
                } catch (error) {
                    logger.error('Logout error', error);
                    // Force clear even on error
                    set({
                        user: null,
                        access_token: null,
                        refresh_token: null,
                        is_authenticated: false,
                        is_loading: false,
                        customer_id: null,
                        customer_profile: null,
                        token_expires_at: null
                    });
                    clearTokenRefreshTimer();
                }
            },

            /**
             * Refresh token if needed
             */
            refreshTokenIfNeeded: async (): Promise<void> => {
                try {
                    const { refresh_token, isTokenExpired: isExpired } = get();

                    if (!refresh_token || !isExpired()) {
                        return;
                    }

                    logger.debug('Attempting token refresh');

                    const response = await authClient.refreshToken(refresh_token);
                    const newExpiresAt = calculateTokenExpiration(response.expires);

                    set({
                        access_token: response.access_token,
                        refresh_token: response.refresh_token,
                        user: response.user || get().user,
                        token_expires_at: newExpiresAt
                    });

                    logger.info('Token refreshed successfully');

                    // Schedule next refresh
                    scheduleTokenRefresh(response.expires, () => {
                        get().refreshTokenIfNeeded();
                    });
                } catch (error) {
                    logger.error('Token refresh failed', error);
                    // Logout on refresh failure
                    await get().logout();
                }
            },

            // ============================================
            // USER MANAGEMENT ACTIONS
            // ============================================

            /**
             * Get current user info from API
             */
            getCurrentUser: async (): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    const { access_token } = get();

                    if (!access_token) {
                        throw new Error('No access token available');
                    }

                    logger.debug('Fetching current user');
                    const user = await authClient.getCurrentUser(access_token);
                    set({ user, is_loading: false });
                    logger.info('Current user fetched', { userId: user?.id });
                } catch (error) {
                    logger.error('Failed to fetch current user', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({ error: normalizedError, is_loading: false });
                    throw error;
                }
            },

            /**
             * Fetch and store customer profile
             */
            fetchCustomerProfile: async (): Promise<void> => {
                try {
                    const { user, access_token } = get();

                    if (!user?.id || !access_token) {
                        logger.warn('Cannot fetch customer profile: missing user or token');
                        return;
                    }

                    logger.debug('Fetching customer profile', { userId: user.id });
                    const customer = await getCustomerProfile(user.id, access_token);

                    if (customer?.id) {
                        set({ customer_id: customer.id, customer_profile: customer });
                        logger.info('Customer profile fetched', { customerId: customer.id });
                    }
                } catch (error) {
                    logger.warn('Failed to fetch customer profile', error);
                    // Non-critical, don't throw
                }
            },

            /**
             * Update user profile
             */
            updateProfile: async (
                updates: Partial<AuthUser>
            ): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    const { access_token, customer_id, customer_profile, user } = get();

                    if (!access_token) {
                        throw new Error('No access token available');
                    }

                    logger.debug('Updating user profile', { updates: Object.keys(updates) });

                    // Update Directus user
                    const response = await fetch('/api/users/update-profile', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${access_token}`
                        },
                        body: JSON.stringify({
                            first_name: updates.first_name,
                            last_name: updates.last_name
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(
                            errorData.error || 'Failed to update Directus user profile'
                        );
                    }

                    const userData = await response.json();

                    // Update user in store
                    if (userData.data) {
                        set({
                            user: {
                                ...user,
                                first_name: userData.data.first_name || updates.first_name,
                                last_name: userData.data.last_name || updates.last_name
                            } as AuthUser
                        });
                    }

                    // Update customer profile if exists
                    if (customer_id) {
                        const currentToken = get().access_token;
                        if (!currentToken) {
                            throw new Error('No access token available');
                        }

                        const updatedCustomer = await updateCustomerProfile(
                            customer_id,
                            currentToken,
                            {
                                first_name: updates.first_name,
                                last_name: updates.last_name
                            }
                        );

                        set({
                            customer_profile: {
                                ...customer_profile,
                                ...updatedCustomer
                            }
                        });
                    }

                    set({ is_loading: false });
                    logger.info('User profile updated');
                } catch (error) {
                    logger.error('Failed to update profile', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({ error: normalizedError, is_loading: false });
                    throw error;
                }
            },

            // ============================================
            // PASSWORD & EMAIL ACTIONS
            // ============================================

            /**
             * Request password recovery
             */
            requestPasswordRecovery: async (
                data: PasswordRecoveryRequest
            ): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    logger.debug('Requesting password recovery', { email: data.email });
                    await authClient.requestPasswordRecovery(data);
                    set({ is_loading: false });
                    logger.info('Password recovery email sent');
                } catch (error) {
                    logger.error('Password recovery request failed', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({ error: normalizedError, is_loading: false });
                    throw error;
                }
            },

            /**
             * Reset password with recovery token
             */
            resetPassword: async (
                data: PasswordResetCredentials
            ): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    logger.debug('Resetting password');
                    await authClient.resetPassword(data);
                    set({ is_loading: false });
                    logger.info('Password reset successful');
                } catch (error) {
                    logger.error('Password reset failed', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({ error: normalizedError, is_loading: false });
                    throw error;
                }
            },

            /**
             * Verify email address
             */
            verifyEmail: async (token: string): Promise<void> => {
                set({ is_loading: true, error: null });

                try {
                    logger.debug('Verifying email');
                    await authClient.verifyEmail(token);
                    set({ is_loading: false });
                    logger.info('Email verified');
                } catch (error) {
                    logger.error('Email verification failed', error);
                    const normalizedError = error instanceof Error ? error.message : String(error);
                    set({ error: normalizedError, is_loading: false });
                    throw error;
                }
            },

            // ============================================
            // UI STATE ACTIONS
            // ============================================

            /**
             * Set redirect URL for post-auth navigation
             */
            setRedirectUrl: (url: string | null): void => {
                set({ redirectUrl: url });
            }
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                user: state.user,
                access_token: state.access_token,
                refresh_token: state.refresh_token,
                is_authenticated: state.is_authenticated,
                remember_me: state.remember_me,
                customer_id: state.customer_id,
                customer_profile: state.customer_profile,
                token_expires_at: state.token_expires_at,
                _hasHydrated: true
            })
        }
    )
);

export default useAuth;