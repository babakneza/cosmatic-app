'use client';

import { useSWRFetch } from './useSWRFetch';
import type { SWRConfiguration } from 'swr';

export interface Product {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    description?: string;
    description_ar?: string;
    price: number;
    image?: string;
    category?: string;
    brand?: string;
    rating?: number;
    review_count?: number;
}

export interface ProductsResponse {
    data: Product[];
    meta?: {
        total_count?: number;
        filter_count?: number;
    };
}

/**
 * Hook to fetch all products with optional filters
 *
 * @param filters - Query filters (search, category, price range, etc.)
 * @param config - SWR configuration
 * @returns Product list with loading and error states
 *
 * @example
 * const { data, isLoading, error } = useSWRProducts({
 *   search: 'lipstick',
 *   category: 'makeup',
 *   maxPrice: 50
 * });
 */
export function useSWRProducts(
    filters?: Record<string, any>,
    config?: SWRConfiguration
) {
    const queryParams = filters
        ? new URLSearchParams(
            Object.entries(filters).reduce(
                (acc, [key, value]) => {
                    if (value !== null && value !== undefined) {
                        acc[key] = String(value);
                    }
                    return acc;
                },
                {} as Record<string, string>
            )
        ).toString()
        : '';

    const url = queryParams ? `/api/products?${queryParams}` : '/api/products';

    return useSWRFetch<ProductsResponse>(url, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        ...config,
    });
}

/**
 * Hook to fetch a single product by ID or slug
 *
 * @param idOrSlug - Product ID or slug
 * @param config - SWR configuration
 * @returns Single product with loading and error states
 *
 * @example
 * const { data: product, isLoading } = useSWRProduct('classic-red-lipstick');
 */
export function useSWRProduct(
    idOrSlug?: string,
    config?: SWRConfiguration
) {
    const url = idOrSlug ? `/api/products/${idOrSlug}` : null;

    return useSWRFetch<{ data: Product }>(url, {
        revalidateOnFocus: false,
        ...config,
    });
}

/**
 * Hook to fetch featured/recommended products
 *
 * @param limit - Number of products to fetch
 * @param config - SWR configuration
 * @returns Featured products list
 *
 * @example
 * const { data, isLoading } = useSWRFeaturedProducts(10);
 */
export function useSWRFeaturedProducts(
    limit: number = 8,
    config?: SWRConfiguration
) {
    return useSWRFetch<ProductsResponse>(
        `/api/products?featured=true&limit=${limit}`,
        {
            revalidateOnFocus: false,
            ...config,
        }
    );
}

/**
 * Hook to fetch products by category
 *
 * @param categorySlug - Category slug
 * @param limit - Number of products to fetch
 * @param config - SWR configuration
 * @returns Products in category
 *
 * @example
 * const { data, isLoading } = useSWRProductsByCategory('skincare', 20);
 */
export function useSWRProductsByCategory(
    categorySlug?: string,
    limit: number = 20,
    config?: SWRConfiguration
) {
    const url = categorySlug
        ? `/api/categories/${categorySlug}/products?limit=${limit}`
        : null;

    return useSWRFetch<ProductsResponse>(url, {
        revalidateOnFocus: false,
        ...config,
    });
}

/**
 * Hook to search products
 *
 * @param query - Search query string
 * @param config - SWR configuration
 * @returns Search results
 *
 * @example
 * const { data, isLoading } = useSWRSearchProducts('foundation');
 */
export function useSWRSearchProducts(
    query?: string,
    config?: SWRConfiguration
) {
    const url =
        query && query.trim()
            ? `/api/products/search?q=${encodeURIComponent(query)}`
            : null;

    return useSWRFetch<ProductsResponse>(url, {
        revalidateOnFocus: false,
        dedupingInterval: 60000, // Cache for 1 minute
        ...config,
    });
}

/**
 * Hook to fetch related products
 *
 * @param productId - Product ID
 * @param limit - Number of related products
 * @param config - SWR configuration
 * @returns Related products list
 *
 * @example
 * const { data, isLoading } = useSWRRelatedProducts('prod-123', 6);
 */
export function useSWRRelatedProducts(
    productId?: string,
    limit: number = 6,
    config?: SWRConfiguration
) {
    const url = productId
        ? `/api/products/${productId}/related?limit=${limit}`
        : null;

    return useSWRFetch<ProductsResponse>(url, {
        revalidateOnFocus: false,
        ...config,
    });
}

export default {
    useSWRProducts,
    useSWRProduct,
    useSWRFeaturedProducts,
    useSWRProductsByCategory,
    useSWRSearchProducts,
    useSWRRelatedProducts,
};