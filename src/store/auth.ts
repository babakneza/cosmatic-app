import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, AuthState, LoginCredentials, RegisterCredentials, PasswordRecoveryRequest, PasswordResetCredentials } from '@/types/auth';
import authClient from '@/lib/api/auth';
import { createCustomerProfile, getCustomerProfile, updateCustomerProfile } from '@/lib/api/customers';

interface AuthStoreActions {
    // Auth actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokenIfNeeded: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
    setTokens: (access_token: string, refresh_token: string) => void;
    clearAuth: () => void;

    // User actions
    getCurrentUser: () => Promise<void>;
    updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
    fetchCustomerProfile: () => Promise<void>;

    // Password recovery
    requestPasswordRecovery: (data: PasswordRecoveryRequest) => Promise<void>;
    resetPassword: (data: PasswordResetCredentials) => Promise<void>;

    // Email verification
    verifyEmail: (token: string) => Promise<void>;

    // Helper methods
    isTokenExpired: () => boolean;
    setError: (error: any) => void;
    clearError: () => void;
    setRedirectUrl: (url: string | null) => void;
}

type AuthStore = AuthState & AuthStoreActions;

// Token expiration buffer (refresh 3 minutes before actual expiration)
// This gives us a safety margin to refresh tokens before they expire
// Increased from 2 minutes to 3 minutes to handle longer checkout flows
// NOTE: If your tokens expire faster than 3 minutes, you should:
// 1. Configure longer token expiration on your Directus server
// 2. Or reduce this buffer further (e.g., 30 * 1000 for 30 seconds)
const TOKEN_BUFFER_MS = 3 * 60 * 1000;



export const useAuth = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            access_token: null,
            refresh_token: null,
            is_authenticated: false,
            is_loading: false,
            error: null,
            remember_me: false,

            // DIAGNOSTIC: Log when store is first used
            _storeInitialized: false,
            customer_id: null,
            customer_profile: null,
            token_expires_at: null,
            _hasHydrated: false,
            redirectUrl: null,

            // Login
            login: async (credentials: LoginCredentials) => {
                set({ is_loading: true, error: null });
                try {
                    const response = await authClient.login(credentials);

                    // Validate that we at least have an access token
                    if (!response.access_token) {
                        throw new Error('No access token in login response');
                    }

                    // Calculate token expiration time (add expires seconds to current timestamp)
                    const expiresAt = Date.now() + (response.expires * 1000);

                    const authData = {
                        user: response.user || null,
                        access_token: response.access_token,
                        refresh_token: response.refresh_token || null,  // Directus may not provide this
                        is_authenticated: true,
                        remember_me: credentials.remember_me || false,
                        token_expires_at: expiresAt,
                        is_loading: false,
                    };

                    // ✅ Let Zustand's persist middleware handle localStorage
                    // The middleware will automatically call setItem with the properly wrapped format
                    set(authData);

                    // Auto-create or verify customer profile
                    if (response.user?.id && response.access_token) {
                        try {
                            // Try to get existing customer profile
                            let customer = await getCustomerProfile(response.user.id, response.access_token);

                            // If no customer profile exists, create one
                            if (!customer) {
                                customer = await createCustomerProfile(response.user.id, response.access_token);
                            }

                            // Store the customer ID and profile
                            if (customer?.id) {
                                set({ customer_id: customer.id, customer_profile: customer });
                            }
                        } catch (customerError: any) {
                            // Log the error for debugging
                            console.warn('[Auth] Customer profile operation failed:', {
                                message: customerError?.message,
                                status: customerError?.response?.status,
                                data: customerError?.response?.data,
                            });
                        }
                    }

                    // Schedule token refresh
                    scheduleTokenRefresh(response.expires, () => {
                        get().refreshTokenIfNeeded();
                    });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Register
            register: async (credentials: RegisterCredentials) => {
                set({ is_loading: true, error: null });
                try {
                    const response = await authClient.register(credentials);

                    // Calculate token expiration time (add expires seconds to current timestamp)
                    const expiresAt = Date.now() + (response.expires * 1000);

                    const authData = {
                        user: response.user || null,
                        access_token: response.access_token,
                        refresh_token: response.refresh_token || null,  // Directus may not provide this
                        is_authenticated: true,
                        token_expires_at: expiresAt,
                        is_loading: false,
                    };

                    // ✅ Let Zustand's persist middleware handle localStorage
                    // The middleware will automatically call setItem with the properly wrapped format
                    set(authData);

                    // Auto-create customer profile for new registration
                    if (response.user?.id && response.access_token) {
                        try {
                            const customer = await createCustomerProfile(
                                response.user.id,
                                response.access_token,
                                {
                                    phone: credentials.phone || undefined,
                                }
                            );

                            // Store the customer ID and profile
                            if (customer?.id) {
                                set({ customer_id: customer.id, customer_profile: customer });
                            }
                        } catch (customerError: any) {
                            // Log the error for debugging
                            console.warn('[Auth] Customer profile creation failed during registration:', {
                                message: customerError?.message,
                                status: customerError?.response?.status,
                                data: customerError?.response?.data,
                            });
                        }
                    }

                    // Schedule token refresh
                    scheduleTokenRefresh(response.expires, () => {
                        get().refreshTokenIfNeeded();
                    });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                set({ is_loading: true, error: null });
                try {
                    const { refresh_token } = get();

                    // Call logout API if we have a refresh token
                    if (refresh_token) {
                        await authClient.logout(refresh_token);
                    }

                    // Clear all auth data (but NOT checkout state - that's handled by checkout store)
                    set({
                        user: null,
                        access_token: null,
                        refresh_token: null,
                        is_authenticated: false,
                        remember_me: false,
                        is_loading: false,
                        customer_id: null,
                        customer_profile: null,
                        token_expires_at: null,
                    });

                    // Clear token refresh timer
                    clearTokenRefreshTimer();
                } catch (error: any) {
                    // Even if logout fails, clear local state
                    set({
                        user: null,
                        access_token: null,
                        refresh_token: null,
                        is_authenticated: false,
                        is_loading: false,
                        customer_id: null,
                        customer_profile: null,
                        token_expires_at: null,
                    });
                    clearTokenRefreshTimer();
                }
            },

            // Refresh token if needed
            refreshTokenIfNeeded: async () => {
                try {
                    const { refresh_token, isTokenExpired } = get();

                    // Only refresh if we have a token and it's expired
                    if (!refresh_token || !isTokenExpired()) {
                        return;
                    }

                    const response = await authClient.refreshToken(refresh_token);

                    // Calculate new token expiration time
                    const newExpiresAt = Date.now() + (response.expires * 1000);

                    // ✅ Update tokens - let Zustand persist middleware handle localStorage
                    set({
                        access_token: response.access_token,
                        refresh_token: response.refresh_token,
                        user: response.user || get().user,
                        token_expires_at: newExpiresAt,
                    });

                    // Schedule next refresh
                    scheduleTokenRefresh(response.expires, () => {
                        get().refreshTokenIfNeeded();
                    });
                } catch (error: any) {
                    // If refresh fails, logout the user
                    get().logout();
                }
            },

            // Set user
            setUser: (user: AuthUser | null) => {
                set({ user });
            },

            // Set tokens
            setTokens: (access_token: string, refresh_token: string) => {
                set({
                    access_token,
                    refresh_token,
                    is_authenticated: true,
                });
            },

            // Clear auth
            clearAuth: () => {
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
                    is_loading: false,
                });
                clearTokenRefreshTimer();
            },

            // Get current user
            getCurrentUser: async () => {
                set({ is_loading: true, error: null });
                try {
                    const { access_token } = get();

                    if (!access_token) {
                        throw new Error('No access token available');
                    }

                    const user = await authClient.getCurrentUser(access_token);
                    set({ user, is_loading: false });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Fetch customer profile and store customer ID
            fetchCustomerProfile: async () => {
                try {
                    const { user, access_token } = get();

                    if (!user?.id || !access_token) {
                        return;
                    }

                    const customer = await getCustomerProfile(user.id, access_token);
                    if (customer?.id) {
                        set({ customer_id: customer.id });
                    }
                } catch (error: any) {
                    // This is non-critical, don't throw
                }
            },

            // Update profile
            updateProfile: async (updates: Partial<AuthUser>) => {
                set({ is_loading: true, error: null });
                try {
                    const { access_token, customer_id, customer_profile, user, isTokenExpired } = get();

                    if (!access_token) {
                        throw new Error('No access token available');
                    }

                    // Helper function to attempt profile update with token
                    const attemptUpdateWithToken = async (token: string) => {
                        const response = await fetch('/api/users/update-profile', {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                first_name: updates.first_name,
                                last_name: updates.last_name,
                            }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            const error = new Error(errorData.error || 'Failed to update Directus user profile') as any;
                            error.status = response.status;
                            throw error;
                        }

                        return response.json();
                    };

                    // Step 1: Try to update with current token
                    let userData;
                    let refreshAttempted = false;

                    try {
                        userData = await attemptUpdateWithToken(access_token);
                    } catch (error: any) {
                        // If 401 (Unauthorized) and we haven't refreshed yet, try refreshing
                        if ((error.status === 401 || error.message?.includes('Token expired')) && !refreshAttempted) {
                            refreshAttempted = true;

                            try {
                                // Force a token refresh
                                await get().refreshTokenIfNeeded();

                                // Get the new token
                                const newToken = get().access_token;
                                if (!newToken) {
                                    throw new Error('Failed to refresh access token - session expired, please login again');
                                }

                                // Retry the update with the new token
                                userData = await attemptUpdateWithToken(newToken);
                            } catch (refreshError: any) {
                                console.error('❌ Token refresh failed:', refreshError.message);
                                throw new Error(`Session expired: ${refreshError.message}. Please login again.`);
                            }
                        } else {
                            // Some other error, or already tried refreshing
                            throw error;
                        }
                    }

                    // Update user in store with new first_name and last_name
                    if (userData.data) {
                        set({
                            user: {
                                ...user,
                                first_name: userData.data.first_name || updates.first_name,
                                last_name: userData.data.last_name || updates.last_name,
                            } as AuthUser,
                        });
                    }

                    // Step 2: Update customer profile (use working token from store)
                    if (customer_id) {
                        try {
                            // Get the token from store (could be refreshed token from retry)
                            const currentToken = get().access_token;
                            if (!currentToken) {
                                throw new Error('No access token available');
                            }
                            const updatedCustomer = await updateCustomerProfile(customer_id, currentToken, {
                                first_name: updates.first_name,
                                last_name: updates.last_name,
                            });

                            // Update customer profile in store
                            set({
                                customer_profile: {
                                    ...customer_profile,
                                    ...updatedCustomer,
                                },
                            });
                        } catch (customerError: any) {
                            throw customerError;
                        }
                    } else {
                        throw new Error('No customer profile found');
                    }

                    set({
                        is_loading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Request password recovery
            requestPasswordRecovery: async (data: PasswordRecoveryRequest) => {
                set({ is_loading: true, error: null });
                try {
                    await authClient.requestPasswordRecovery(data);
                    set({ is_loading: false });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Reset password
            resetPassword: async (data: PasswordResetCredentials) => {
                set({ is_loading: true, error: null });
                try {
                    await authClient.resetPassword(data);
                    set({ is_loading: false });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Verify email
            verifyEmail: async (token: string) => {
                set({ is_loading: true, error: null });
                try {
                    await authClient.verifyEmail(token);
                    set({ is_loading: false });
                } catch (error: any) {
                    set({
                        error: error,
                        is_loading: false,
                    });
                    throw error;
                }
            },

            // Check if token is expired
            isTokenExpired: () => {
                const state = get();

                // No access token = expired
                if (!state.access_token) {
                    return true;
                }

                // No expiration time = assume valid (fallback)
                if (!state.token_expires_at || typeof state.token_expires_at !== 'number') {
                    return false;
                }

                const now = Date.now();
                const timeUntilExpiry = state.token_expires_at - now;

                // Consider expired if less than TOKEN_BUFFER_MS remaining
                const isExpired = timeUntilExpiry <= TOKEN_BUFFER_MS;

                return isExpired;
            },

            // Set error
            setError: (error: any) => {
                set({ error });
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            },

            // Set redirect URL
            setRedirectUrl: (url: string | null) => {
                set({ redirectUrl: url });
            },
        }),
        {
            name: 'auth-store',
            version: 1, // ✅ CRITICAL: Version number for proper migration handling
            partialize: (state) => {
                const persisted = {
                    // Only persist certain fields
                    user: state.user,
                    access_token: state.access_token,
                    refresh_token: state.refresh_token,
                    is_authenticated: state.is_authenticated,
                    remember_me: state.remember_me,
                    customer_id: state.customer_id,
                    token_expires_at: state.token_expires_at,
                    _hasHydrated: true,
                };

                return persisted;
            },
            // ✅ FIXED STORAGE: Proper serialization/deserialization handling
            storage: {
                getItem: (key: string): any => {
                    // Always restore auth state from localStorage
                    if (typeof window === 'undefined') return null;

                    try {
                        const stored = localStorage.getItem(key);
                        if (stored) {
                            // Return raw string - let Zustand handle parsing
                            return stored;
                        }
                        return null;
                    } catch (error) {
                        return null;
                    }
                },
                setItem: (key: string, value: any) => {
                    // Always persist auth state to localStorage
                    if (typeof window === 'undefined') return;

                    try {
                        // ✅ CRITICAL FIX: Handle both string and object values properly
                        let stringValue: string;

                        if (typeof value === 'string') {
                            // Already a string - use directly
                            stringValue = value;
                        } else if (typeof value === 'object' && value !== null) {
                            // Object - serialize it
                            stringValue = JSON.stringify(value);
                        } else {
                            return;
                        }

                        // Store the string value
                        localStorage.setItem(key, stringValue);

                    } catch (error) {
                        // Silently fail
                    }
                },
                removeItem: (key: string) => {
                    if (typeof window === 'undefined') return;

                    try {
                        localStorage.removeItem(key);
                    } catch (error) {
                        // Silently fail
                    }
                },
            },
            // ✅ ENHANCED MIGRATION - Handle version changes and validate token integrity
            migrate: (persistedState: any, version: number) => {
                // If no state exists, let Zustand use the initial state
                if (!persistedState) {
                    return undefined; // Let Zustand use initial state
                }

                // Extract the actual state from the wrapper format (handle both wrapped and unwrapped)
                const stateData = persistedState.state || persistedState;

                // ✅ ENHANCED TOKEN VALIDATION
                let isValidAuth = false;

                // Check if we have the required tokens and they're strings
                if (stateData.access_token &&
                    typeof stateData.access_token === 'string' &&
                    stateData.access_token.length > 10) {

                    // Check token expiration if available
                    if (stateData.token_expires_at && typeof stateData.token_expires_at === 'number') {
                        const now = Date.now();
                        const timeUntilExpiry = stateData.token_expires_at - now;

                        if (timeUntilExpiry > 0) {
                            isValidAuth = true;
                        } else {
                            // Still allow if we have refresh token
                            isValidAuth = !!(stateData.refresh_token && stateData.refresh_token.length > 10);
                        }
                    } else {
                        // No expiration info, assume valid
                        isValidAuth = true;
                    }
                }

                // Return the extracted state with proper authentication status
                const migratedState = {
                    ...stateData,
                    // ✅ CRITICAL: Ensure authentication status matches token validity
                    is_authenticated: isValidAuth,
                    _hasHydrated: true,
                };

                return migratedState;
            },
            onRehydrateStorage: (rehydratedState) => {
                // Hydration and re-establish token refresh
                if (rehydratedState) {

                    // ✅ ENHANCED TOKEN VALIDATION AFTER REHYDRATION
                    const hasValidAccessToken = !!(rehydratedState.access_token &&
                        typeof rehydratedState.access_token === 'string' &&
                        rehydratedState.access_token.length > 10);

                    const hasValidRefreshToken = !!(rehydratedState.refresh_token &&
                        typeof rehydratedState.refresh_token === 'string' &&
                        rehydratedState.refresh_token.length > 10);

                    // Check for authentication inconsistencies
                    if (rehydratedState.is_authenticated && !hasValidAccessToken) {
                        // If we have a valid refresh token, keep authenticated for refresh attempt
                        if (!hasValidRefreshToken) {
                            // Clear authentication status in the store
                            const currentStore = useAuth.getState();
                            currentStore.clearAuth();
                        }
                    }

                    // ✅ TOKEN REFRESH TIMER SETUP
                    if (rehydratedState.is_authenticated && hasValidAccessToken) {
                        const now = Date.now();

                        // Check if we have token expiration info
                        if (rehydratedState.token_expires_at && typeof rehydratedState.token_expires_at === 'number') {
                            const timeUntilExpiry = rehydratedState.token_expires_at - now;

                            if (timeUntilExpiry <= 0) {
                                // Token expired - try to refresh immediately if we have refresh token
                                if (hasValidRefreshToken) {
                                    setTimeout(() => {
                                        const store = useAuth.getState();
                                        store.refreshTokenIfNeeded();
                                    }, 100); // Small delay to avoid blocking hydration
                                } else {
                                    const currentStore = useAuth.getState();
                                    currentStore.clearAuth();
                                }
                            } else {
                                // Schedule refresh TOKEN_BUFFER_MS before expiration
                                const refreshTime = Math.max(
                                    timeUntilExpiry - TOKEN_BUFFER_MS,
                                    1000 // At least 1 second
                                );
                                scheduleTokenRefresh(refreshTime / 1000, () => {
                                    const store = useAuth.getState();
                                    store.refreshTokenIfNeeded();
                                });
                            }
                        } else {
                            // Fallback to 2 days if we don't have expiration info
                            const TWO_DAYS_SECONDS = 2 * 24 * 60 * 60;
                            scheduleTokenRefresh(TWO_DAYS_SECONDS, () => {
                                const store = useAuth.getState();
                                store.refreshTokenIfNeeded();
                            });
                        }
                    }
                }
            },
        }
    )
);

// Token refresh timer (in-memory)
let tokenRefreshTimer: NodeJS.Timeout | null = null;

function scheduleTokenRefresh(expiresIn: number, callback: () => void) {
    // Clear existing timer
    clearTokenRefreshTimer();

    // Schedule refresh TOKEN_BUFFER_MS before expiration
    const refreshTime = Math.max(
        (expiresIn * 1000) - TOKEN_BUFFER_MS,
        1000 // At least 1 second
    );

    tokenRefreshTimer = setTimeout(callback, refreshTime);
}

function clearTokenRefreshTimer() {
    if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
    }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        clearTokenRefreshTimer();
    });
}

/**
 * CRITICAL FIX: Manual hydration from localStorage
 * This ensures the auth store loads persisted data on client initialization
 * This is needed because Zustand's persist middleware has timing issues with Next.js SSR
 */
if (typeof window !== 'undefined') {
    // Perform hydration immediately on module load
    const performManualHydration = () => {
        try {
            const stored = localStorage.getItem('auth-store');
            if (stored) {
                const parsed = JSON.parse(stored);
                const stateData = parsed.state || parsed;

                // ✅ CRITICAL: Manually set the store state from localStorage
                // This ensures hydration happens even if Zustand's persist middleware fails
                useAuth.setState({
                    user: stateData.user || null,
                    access_token: stateData.access_token || null,
                    refresh_token: stateData.refresh_token || null,
                    is_authenticated: stateData.is_authenticated === true,
                    remember_me: stateData.remember_me || false,
                    customer_id: stateData.customer_id || null,
                    token_expires_at: stateData.token_expires_at || null,
                    _hasHydrated: true,
                }, false); // Don't trigger subscriber update yet

            } else {
                // Mark as hydrated even if no stored data
                useAuth.setState({ _hasHydrated: true }, false);
            }
        } catch (error) {
            // Even if hydration fails, mark as hydrated to prevent indefinite loading
            useAuth.setState({ _hasHydrated: true }, false);
        }
    };

    // Run hydration immediately
    performManualHydration();

    // Also run after a microtask to catch any race conditions
    Promise.resolve().then(() => {
        const currentState = useAuth.getState();
        if (!currentState._hasHydrated) {
            performManualHydration();
        }
    });
}