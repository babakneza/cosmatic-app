'use client';

import { useSWRFetch } from './useSWRFetch';
import type { SWRConfiguration } from 'swr';

export interface Category {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    description?: string;
    description_ar?: string;
    image?: string;
    parent_id?: string;
    product_count?: number;
}

export interface CategoriesResponse {
    data: Category[];
    meta?: {
        total_count?: number;
    };
}

/**
 * Hook to fetch all product categories
 *
 * @param config - SWR configuration
 * @returns Categories list with loading and error states
 *
 * @example
 * const { data, isLoading, error } = useSWRCategories();
 */
export function useSWRCategories(config?: SWRConfiguration) {
    return useSWRFetch<CategoriesResponse>('/api/categories', {
        revalidateOnFocus: false,
        // Cache categories for longer since they change infrequently
        dedupingInterval: 300000, // 5 minutes
        ...config,
    });
}

/**
 * Hook to fetch a single category with its products
 *
 * @param slug - Category slug
 * @param config - SWR configuration
 * @returns Category with products
 *
 * @example
 * const { data, isLoading } = useSWRCategory('skincare');
 */
export function useSWRCategory(
    slug?: string,
    config?: SWRConfiguration
) {
    const url = slug ? `/api/categories/${slug}` : null;

    return useSWRFetch<{ data: Category }>(url, {
        revalidateOnFocus: false,
        ...config,
    });
}

/**
 * Hook to fetch category tree (hierarchical categories)
 *
 * @param config - SWR configuration
 * @returns Hierarchical categories
 *
 * @example
 * const { data, isLoading } = useSWRCategoryTree();
 */
export function useSWRCategoryTree(config?: SWRConfiguration) {
    return useSWRFetch<{ data: Category[] }>('/api/categories/tree', {
        revalidateOnFocus: false,
        dedupingInterval: 300000, // Cache for longer
        ...config,
    });
}

/**
 * Hook to fetch parent categories only
 *
 * @param config - SWR configuration
 * @returns Parent categories
 *
 * @example
 * const { data, isLoading } = useSWRParentCategories();
 */
export function useSWRParentCategories(config?: SWRConfiguration) {
    return useSWRFetch<CategoriesResponse>(
        '/api/categories?parent_id=null',
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000,
            ...config,
        }
    );
}

export default {
    useSWRCategories,
    useSWRCategory,
    useSWRCategoryTree,
    useSWRParentCategories,
};