import axios from 'axios';
import { COLLECTIONS } from './directus';

/**
 * Legacy Directus client using Axios
 * This is used as a fallback for the new SDK client
 */
class DirectusClient {
    private baseUrl: string;
    private token: string | null;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.buyjan.com';
        this.token = process.env.DIRECTUS_API_TOKEN || null;
    }

    /**
     * Get items from a collection
     */
    async get(collection: string, params: Record<string, any> = {}) {
        try {
            const url = `${this.baseUrl}/items/${collection}`;
            const headers: Record<string, string> = {};

            // First try with token authentication
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            try {
                const response = await axios.get(url, {
                    params,
                    headers,
                });
                return response.data;
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    try {
                        const publicResponse = await axios.get(url, {
                            params,
                        });
                        return publicResponse.data;
                    } catch (publicError: unknown) {
                        return { data: [] };
                    }
                }

                throw error;
            }
        } catch (error: unknown) {
            return { data: [] };
        }
    }

    /**
     * Get a single item by ID
     */
    async getById(collection: string, id: string, params: Record<string, any> = {}) {
        try {
            const url = `${this.baseUrl}/items/${collection}/${id}`;
            const headers: Record<string, string> = {};

            // First try with token authentication
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            try {
                const response = await axios.get(url, {
                    params,
                    headers,
                });
                return response.data;
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    const publicResponse = await axios.get(url, {
                        params,
                    });
                    return publicResponse.data;
                }

                throw error;
            }
        } catch (error: unknown) {
            throw error;
        }
    }
}

/**
 * Query builder for Directus API
 */
class DirectusQuery {
    /**
     * Build fields parameter
     */
    fields(fields: string[]): string {
        return fields.join(',');
    }

    /**
     * Build sort parameter
     */
    sort(field: string, direction: 'asc' | 'desc'): string {
        return direction === 'asc' ? field : `-${field}`;
    }

    /**
     * Build pagination parameters
     */
    pagination(page: number, limit: number): { page: number; limit: number } {
        return { page, limit };
    }
}

// Export singleton instances
export const directusClient = new DirectusClient();
export const directusQuery = new DirectusQuery();