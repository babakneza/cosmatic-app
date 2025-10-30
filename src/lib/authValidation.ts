import { useAuth } from '@/store/auth';

/**
 * Comprehensive auth storage validation
 * Should be called on app startup and periodically
 */
export const validateAuthStorage = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    try {

        // Get the stored data
        const stored = localStorage.getItem('auth-store');

        if (!stored) {
            return false;
        }

        // Parse the stored data
        let parsedAuth: any;
        try {
            // Check for corrupted data (e.g., "[object Object]")
            if (stored === '[object Object]' || stored === null || stored === 'null') {
                localStorage.removeItem('auth-store');
                useAuth.getState().logout();
                return false;
            }

            parsedAuth = JSON.parse(stored);
        } catch (parseError) {
            // Clear corrupted storage
            localStorage.removeItem('auth-store');
            useAuth.getState().logout();
            return false;
        }

        // Check for valid access token
        const hasValidAccessToken =
            parsedAuth.access_token &&
            parsedAuth.access_token !== 'null' &&
            parsedAuth.access_token !== null &&
            typeof parsedAuth.access_token === 'string' &&
            parsedAuth.access_token.length > 0;

        const hasValidRefreshToken =
            parsedAuth.refresh_token &&
            parsedAuth.refresh_token !== 'null' &&
            parsedAuth.refresh_token !== null &&
            typeof parsedAuth.refresh_token === 'string' &&
            parsedAuth.refresh_token.length > 0;

        const isAuthenticated = parsedAuth.is_authenticated === true;

        // If marked as authenticated but missing tokens
        if (isAuthenticated && !hasValidAccessToken) {
            // Clear this corrupted state
            useAuth.getState().logout();
            return false;
        }

        // If has tokens but not marked as authenticated
        if (!isAuthenticated && hasValidAccessToken) {
            // This is okay, the store will handle rehydration
            return true;
        }

        // If everything checks out
        if (hasValidAccessToken && hasValidRefreshToken && isAuthenticated) {
            return true;
        }

        // If not authenticated and no tokens, that's expected (logged out state)
        if (!isAuthenticated && !hasValidAccessToken) {
            return true;
        }

        useAuth.getState().logout();
        return false;
    } catch (error) {
        // Be safe and clear storage on unexpected errors
        try {
            localStorage.removeItem('auth-store');
            useAuth.getState().logout();
        } catch (clearError) {
            // Silent catch
        }
        return false;
    }
};

/**
 * Debug auth state - outputs detailed information about auth status
 * Useful for troubleshooting
 */
export const debugAuthState = () => {
    // Debug function - intentionally empty for cleanup
};

/**
 * Test storage functionality
 */
export const testStorageWrite = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    const testKey = '__auth_test_key__';
    const testData = { test: 'data', timestamp: Date.now() };
    const testValue = JSON.stringify(testData);

    try {
        // Write
        localStorage.setItem(testKey, testValue);

        // Read
        const readValue = localStorage.getItem(testKey);

        // Verify
        if (readValue !== testValue) {
            return false;
        }

        // Clean up
        localStorage.removeItem(testKey);

        return true;
    } catch (error) {
        return false;
    }
};