import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';

interface UseProtectedRouteOptions {
    locale: string;
    redirectTo?: string;
}

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute({
    locale,
    redirectTo = `/${locale}/auth/login`,
}: UseProtectedRouteOptions) {
    const router = useRouter();
    const { is_authenticated, is_loading } = useAuth();

    useEffect(() => {
        if (!is_loading && !is_authenticated) {
            router.push(redirectTo);
        }
    }, [is_authenticated, is_loading, router, redirectTo]);

    return {
        is_loading,
        is_authenticated,
    };
}

export default useProtectedRoute;