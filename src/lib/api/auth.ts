import axios, { AxiosInstance } from 'axios';
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    AuthUser,
    PasswordRecoveryRequest,
    PasswordResetCredentials,
    AuthError,
} from '@/types/auth';

/**
 * Auth API Client
 * Handles all authentication operations via custom Next.js API routes
 * which proxy to Directus with secure server-side token handling
 */
class AuthClient {
    private api: AxiosInstance;
    private directusUrl: string;

    constructor() {
        this.directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';

        // Create axios instance for auth requests via Next.js API routes
        this.api = axios.create({
            baseURL: '/api/auth',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await this.api.post('/login', {
                email: credentials.email,
                password: credentials.password,
            });

            if (!response.data || !response.data.data) {
                throw {
                    message: 'Invalid response from server',
                    code: 'INVALID_RESPONSE',
                };
            }

            const data = response.data.data;
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires: data.expires,
                user: data.user ? this.formatUser(data.user) : {
                    email: credentials.email,
                    first_name: '',
                    last_name: '',
                    id: '',
                    created_at: new Date().toISOString(),
                },
            };
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Register a new user
     */
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            // Validate passwords match
            if (credentials.password !== credentials.password_confirm) {
                throw {
                    message: 'Passwords do not match',
                    code: 'PASSWORD_MISMATCH',
                    field: 'password_confirm',
                };
            }

            const response = await this.api.post('/register', {
                email: credentials.email,
                password: credentials.password,
                password_confirm: credentials.password_confirm,
                first_name: credentials.first_name,
                last_name: credentials.last_name,
            });

            if (!response.data) {
                throw {
                    message: 'Invalid response from server',
                    code: 'INVALID_RESPONSE',
                };
            }

            // Handle our custom API response format
            if (response.data.data?.access_token) {
                const data = response.data.data;
                return {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires: data.expires,
                    user: data.user ? this.formatUser(data.user) : {
                        email: credentials.email,
                        first_name: credentials.first_name,
                        last_name: credentials.last_name,
                        id: '',
                        created_at: new Date().toISOString(),
                    },
                };
            }

            // User created but not auto-logged in
            throw {
                message: 'Registration successful. Please login with your credentials.',
                code: 'REQUIRES_LOGIN',
            };
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const response = await this.api.post('/refresh', {
                refresh_token: refreshToken,
                mode: 'json',
            });

            if (!response.data || !response.data.data) {
                throw {
                    message: 'Failed to refresh token',
                    code: 'REFRESH_FAILED',
                };
            }

            const data = response.data.data;
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires: data.expires,
                user: this.formatUser(data.user),
            };
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(accessToken: string): Promise<AuthUser> {
        try {
            const response = await this.api.get('/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.data || !response.data.data) {
                throw {
                    message: 'Failed to fetch user profile',
                    code: 'FETCH_PROFILE_FAILED',
                };
            }

            return this.formatUser(response.data.data);
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Request password recovery
     */
    async requestPasswordRecovery(data: PasswordRecoveryRequest): Promise<void> {
        try {
            await this.api.post('/password/request', {
                email: data.email,
                reset_url: `${process.env.NEXT_PUBLIC_SITE_URL}/[locale]/auth/reset-password`, // Dynamic locale will be handled client-side
            });
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(data: PasswordResetCredentials): Promise<void> {
        try {
            if (data.password !== data.password_confirm) {
                throw {
                    message: 'Passwords do not match',
                    code: 'PASSWORD_MISMATCH',
                    field: 'password_confirm',
                };
            }

            await this.api.post('/password/reset', {
                token: data.token,
                password: data.password,
            });
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout and invalidate tokens
     */
    async logout(refreshToken: string): Promise<void> {
        try {
            await this.api.post('/logout', {
                refresh_token: refreshToken,
            });
        } catch (error: any) {
            // Logout is considered successful even if the server request fails
            // since we'll clear tokens client-side anyway
        }
    }

    /**
     * Update user profile via /api/auth/me
     */
    async updateProfile(
        accessToken: string,
        updates: Partial<{
            first_name: string;
            last_name: string;
            phone: string;
            avatar: string;
        }>
    ): Promise<AuthUser> {
        try {
            const response = await this.api.patch('/me', updates, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.data || !response.data.data) {
                throw {
                    message: 'Failed to update profile',
                    code: 'UPDATE_FAILED',
                };
            }

            return this.formatUser(response.data.data);
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Update user profile in Directus via /api/users/update-profile
     * This is an alternative to updateProfile that uses a dedicated endpoint
     */
    async updateUserProfile(
        accessToken: string,
        updates: Partial<{
            first_name: string;
            last_name: string;
        }>
    ): Promise<AuthUser> {
        try {
            const response = await axios.patch(
                '/api/users/update-profile',
                updates,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data || !response.data.data) {
                throw {
                    message: 'Failed to update profile',
                    code: 'UPDATE_FAILED',
                };
            }

            return this.formatUser(response.data.data);
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Verify email token
     */
    async verifyEmail(token: string): Promise<void> {
        try {
            await this.api.post('/email/verify', {
                token,
            });
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Format user response from Directus
     */
    private formatUser(data: any): AuthUser {
        return {
            id: data.id,
            email: data.email,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone,
            avatar: data.avatar,
            created_at: data.date_created || new Date().toISOString(),
        };
    }

    /**
     * Handle API errors
     */
    private handleError(error: any): AuthError {
        if (error.message && error.code) {
            // Already formatted error
            return error;
        }

        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 400) {
                const message = data?.error || data?.errors?.[0]?.message || 'Invalid request';

                // Provide better error message for password format
                if (message.includes('password') && message.toLowerCase().includes('format')) {
                    return {
                        message: 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters',
                        code: 'INVALID_PASSWORD_FORMAT',
                    };
                }

                return {
                    message,
                    code: 'INVALID_REQUEST',
                };
            }

            if (status === 401) {
                return {
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS',
                };
            }

            if (status === 403) {
                return {
                    message: 'Access forbidden',
                    code: 'FORBIDDEN',
                };
            }

            if (status === 404) {
                return {
                    message: 'User not found',
                    code: 'NOT_FOUND',
                };
            }

            if (status === 409) {
                return {
                    message: 'Email already registered',
                    code: 'EMAIL_EXISTS',
                };
            }

            if (status === 429) {
                return {
                    message: 'Too many login attempts. Please try again later.',
                    code: 'RATE_LIMITED',
                };
            }

            if (status === 500) {
                return {
                    message: 'Server error. Please try again later.',
                    code: 'SERVER_ERROR',
                };
            }

            return {
                message: data?.error || error.message || 'An error occurred',
                code: 'API_ERROR',
            };
        }

        return {
            message: error.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
        };
    }
}

// Export singleton instance
export const authClient = new AuthClient();
export default authClient;