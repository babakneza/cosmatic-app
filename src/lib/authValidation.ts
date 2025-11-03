/**
 * @fileOverview Authentication Storage Validation Utilities
 * 
 * Core utilities for validating and debugging authentication state
 * stored in browser localStorage. Includes:
 * - Auth storage integrity checks
 * - Corrupted state detection and recovery
 * - Storage functionality testing
 * - Debug utilities for troubleshooting auth issues
 * 
 * @module lib/authValidation
 * @requires @/store/auth - Zustand auth store for state management
 * 
 * @remarks
 * Called during app initialization to ensure auth state is valid.
 * Automatically clears corrupted auth data to prevent inconsistent state.
 */

import { useAuth } from '@/store/auth';

/**
 * Validate authentication storage integrity
 * 
 * Performs comprehensive validation of auth-store data in localStorage:
 * - Checks if data exists and is parseable JSON
 * - Verifies token presence and validity
 * - Ensures authentication state consistency
 * - Auto-clears corrupted data
 * 
 * Should be called on app startup and after sensitive operations.
 * 
 * @returns {boolean} True if auth storage is valid and consistent, false otherwise
 * 
 * @example
 * ```typescript
 * // On app startup (e.g., in useEffect)
 * useEffect(() => {
 *   const isValid = validateAuthStorage();
 *   if (!isValid) {
 *     console.warn('Auth storage was corrupted and cleared');
 *   }
 * }, []);
 * 
 * // Check before accessing auth data
 * if (validateAuthStorage()) {
 *   const user = useAuth.getState().user;
 * }
 * ```
 * 
 * @remarks
 * - Returns false for server-side execution (typeof window === 'undefined')
 * - Automatically logs out if corrupted state detected
 * - Clears localStorage if data is corrupted
 * - Safe to call multiple times
 * - Catches and handles all JSON parse errors
 * 
 * Validation checks:
 * - Data exists and is not empty/null
 * - Data is valid JSON (not "[object Object]" string)
 * - Tokens are present and are strings
 * - Authentication state matches token presence
 * 
 * @see testStorageWrite - To verify localStorage is functional
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
 * Debug authentication state
 * 
 * (Deprecated) Debug helper function - currently intentionally empty.
 * Kept for backward compatibility. Use console.log with useAuth.getState()
 * directly for debugging auth state.
 * 
 * @deprecated Use useAuth.getState() directly for debugging
 * 
 * @example
 * ```typescript
 * // Instead of this:
 * debugAuthState();
 * 
 * // Use this:
 * const authState = useAuth.getState();
 * console.log('Auth state:', {
 *   isAuthenticated: authState.is_authenticated,
 *   hasTokens: !!authState.access_token,
 *   user: authState.user
 * });
 * ```
 * 
 * @remarks
 * This function is preserved for backward compatibility but no longer
 * performs any operations. Direct access to auth store is recommended.
 */
export const debugAuthState = () => {
    // Debug function - intentionally empty for cleanup
};

/**
 * Test localStorage functionality
 * 
 * Verifies that browser localStorage is accessible and working correctly.
 * Useful for detecting permission issues or browser incognito mode.
 * Performs a write-read-delete cycle with test data.
 * 
 * @returns {boolean} True if localStorage is fully functional, false if any operation fails
 * 
 * @example
 * ```typescript
 * // Check if storage is available before using auth
 * if (!testStorageWrite()) {
 *   console.error('localStorage not available - auth may not persist');
 *   // Handle private/incognito mode
 * }
 * 
 * // On app startup
 * useEffect(() => {
 *   if (!testStorageWrite()) {
 *     showToast('Warning: Authentication will not persist in this session');
 *   }
 * }, []);
 * ```
 * 
 * @remarks
 * - Returns false for server-side execution (typeof window === 'undefined')
 * - Returns false in browser incognito/private modes where storage is restricted
 * - Catches quota exceeded errors (storage full)
 * - Catches permission denied errors (user privacy settings)
 * - Uses test key '__auth_test_key__' that is cleaned up after test
 * - Silently fails and returns false (no console errors)
 * 
 * Reasons for failure:
 * - Running on server (window undefined)
 * - Browser in private/incognito mode
 * - Storage quota exceeded
 * - User has disabled storage permissions
 * - Storage API not available (very old browsers)
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