'use client';

import { useState, useEffect } from 'react';

export interface Category {
    id: string;
    name: string;
    name_ar: string;
    slug: string;
    description?: string;
    description_ar?: string;
    image?: string;
}

/**
 * useCategories Hook
 * 
 * Fetches and caches product categories from the API
 * 
 * Returns:
 * - categories: Array of category objects
 * - loading: Boolean indicating if data is loading
 * - error: Error object if fetch failed, null otherwise
 */
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/categories', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.statusText}`);
                }

                const data = await response.json();
                setCategories(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error('[useCategories] Error fetching categories:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}