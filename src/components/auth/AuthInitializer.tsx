'use client';

import { useEffect } from 'react';
import { validateAuthStorage, debugAuthState } from '@/lib/authValidation';

/**
 * AuthInitializer Component
 * Runs validation on app load to ensure auth state is properly persisted
 * Should be placed high in the component tree (ideally in root layout)
 */
export const AuthInitializer = () => {
    useEffect(() => {
        // Validate auth storage
        const isValid = validateAuthStorage();

        // Additional debug on development
        if (process.env.NODE_ENV === 'development') {
            debugAuthState();
        }
    }, []);

    // This component doesn't render anything
    return null;
};

export default AuthInitializer;