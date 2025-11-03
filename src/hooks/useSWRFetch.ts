'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { createScopedLogger } from '@/lib/logger';

const logger = createScopedLogger('useSWRFetch');

/**
 * Generic SWR fetcher with error handling
 */
export const swrFetcher = async (url: string): Promise<any> => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error: any = new Error(
                `SWR Fetcher failed: ${response.status} ${response.statusText}`
            );
            error.status = response.status;
            error.info = await response.json().catch(() => ({}));
            throw error;
        }

        return response.json();
    } catch (error) {
        logger.error('SWR fetch error', error);
        throw error;
    }
};

/**
 * Configuration for SWR hooks
 */
export const defaultSWRConfig: SWRConfiguration = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    compare: (a, b) => {
        // Custom comparison to avoid unnecessary re-renders
        return JSON.stringify(a) === JSON.stringify(b);
    },
};

/**
 * Generic SWR hook for any API endpoint
 */
export function useSWRFetch<T = any>(
    url: string | null,
    config?: SWRConfiguration
) {
    const finalConfig = { ...defaultSWRConfig, ...config };

    const { data, error, isLoading, mutate } = useSWR<T, Error>(
        url,
        url ? swrFetcher : null,
        finalConfig
    );

    return {
        data,
        error,
        isLoading,
        isValidating: isLoading,
        mutate,
    };
}

/**
 * Hook for paginated data fetching
 */
export function useSWRPaginated<T = any>(
    baseUrl: string | null,
    options?: {
        pageSize?: number;
        config?: SWRConfiguration;
    }
) {
    const pageSize = options?.pageSize || 20;
    const [page, setPage] = usePageState(1);

    const url =
        baseUrl && page
            ? `${baseUrl}?limit=${pageSize}&offset=${(page - 1) * pageSize}`
            : null;

    const { data, error, isLoading, mutate } = useSWRFetch<T>(
        url,
        options?.config
    );

    return {
        data,
        error,
        isLoading,
        page,
        setPage,
        pageSize,
        mutate,
    };
}

/**
 * Hook for data that should be immediately available or null
 */
export function useSWRIfAvailable<T = any>(
    url: string | null,
    config?: SWRConfiguration
) {
    const { data, error, isLoading, mutate } = useSWRFetch<T>(url, {
        ...config,
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        data: data || null,
        error,
        isLoading,
        mutate,
    };
}

/**
 * Simple page state management helper
 */
function usePageState(initial: number) {
    const [page, setPage] = (require('react') as typeof import('react')).useState(
        initial
    );
    return [page, setPage] as const;
}

export default useSWRFetch;