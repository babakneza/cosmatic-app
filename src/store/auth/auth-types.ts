/**
 * Auth Store Types
 * Type definitions for authentication state and actions
 */

import type {
    AuthUser,
    LoginCredentials,
    RegisterCredentials,
    PasswordRecoveryRequest,
    PasswordResetCredentials,
    AuthError
} from '@/types/auth';
import type { Customer } from '@/types/collections';

/**
 * Auth store state
 */
export interface AuthState {
    // Authentication data
    user: AuthUser | null;
    access_token: string | null;
    refresh_token: string | null;
    is_authenticated: boolean;

    // Loading and error states
    is_loading: boolean;
    error: AuthError | Error | string | null;

    // User preferences
    remember_me: boolean;

    // Token management
    token_expires_at: number | null;

    // Customer profile
    customer_id: string | null;
    customer_profile: Customer | null;

    // UI state
    redirectUrl: string | null;

    // Hydration tracking
    _hasHydrated: boolean;
}

/**
 * Auth store actions/methods
 */
export interface AuthStoreActions {
    // Authentication actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokenIfNeeded: () => Promise<void>;

    // Token management
    setUser: (user: AuthUser | null) => void;
    setTokens: (access_token: string, refresh_token: string) => void;
    clearAuth: () => void;
    isTokenExpired: () => boolean;

    // User management
    getCurrentUser: () => Promise<void>;
    updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
    fetchCustomerProfile: () => Promise<void>;

    // Password management
    requestPasswordRecovery: (data: PasswordRecoveryRequest) => Promise<void>;
    resetPassword: (data: PasswordResetCredentials) => Promise<void>;

    // Email verification
    verifyEmail: (token: string) => Promise<void>;

    // Error handling
    setError: (error: AuthError | Error | string) => void;
    clearError: () => void;

    // Navigation
    setRedirectUrl: (url: string | null) => void;
}

/**
 * Combined Auth Store type
 */
export type AuthStore = AuthState & AuthStoreActions;

/**
 * Login response from auth API
 */
export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    expires: number;
    user?: AuthUser;
}

/**
 * Register response from auth API
 */
export interface RegisterResponse {
    access_token: string;
    refresh_token?: string;
    expires: number;
    user?: AuthUser;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
    access_token: string;
    refresh_token?: string;
    expires: number;
    user?: AuthUser;
}