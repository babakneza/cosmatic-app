// Authentication types
import type { Customer } from './collections';

export interface AuthUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar?: string;
    email_verified?: boolean;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember_me?: boolean;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    expires: number;
    user?: AuthUser;
}

export interface PasswordRecoveryRequest {
    email: string;
}

export interface PasswordResetCredentials {
    token: string;
    password: string;
    password_confirm: string;
}

export interface AuthError {
    message: string;
    code?: string;
    field?: string;
}

export interface AuthState {
    user: AuthUser | null;
    access_token: string | null;
    refresh_token: string | null;
    is_authenticated: boolean;
    is_loading: boolean;
    error: AuthError | null;
    remember_me: boolean;
    customer_id: string | null;
    customer_profile: Customer | null;
    token_expires_at: number | null;
    _hasHydrated?: boolean;
    redirectUrl: string | null;
}