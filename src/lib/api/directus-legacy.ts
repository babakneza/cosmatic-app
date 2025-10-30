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

            console.log(`[DirectusLegacy] Making request to ${url} with params:`, JSON.stringify(params, null, 2));

            try {
                const response = await axios.get(url, {
                    params,
                    headers,
                });
                console.log(`[DirectusLegacy] Response from ${collection}:`,
                    JSON.stringify({
                        status: response.status,
                        dataLength: response.data?.data?.length || 0,
                        meta: response.data?.meta
                    }, null, 2)
                );
                return response.data;
            } catch (error: any) {
                // If we get a 403 error, try again without authentication
                if (error.response && error.response.status === 403) {
                    console.warn(`[DirectusLegacy] Authentication failed for ${collection}, trying public access`);

                    try {
                        // Retry without authentication headers
                        const publicResponse = await axios.get(url, {
                            params,
                        });
                        console.log(`[DirectusLegacy] Public response from ${collection}:`,
                            JSON.stringify({
                                status: publicResponse.status,
                                dataLength: publicResponse.data?.data?.length || 0,
                                meta: publicResponse.data?.meta
                            }, null, 2)
                        );
                        return publicResponse.data;
                    } catch (publicError: any) {
                        console.error(`[DirectusLegacy] Public access also failed for ${collection}:`,
                            JSON.stringify({
                                status: publicError.response?.status,
                                statusText: publicError.response?.statusText,
                                message: publicError.message
                            }, null, 2)
                        );
                        // Return empty data instead of throwing
                        return { data: [] };
                    }
                }

                // If it's not a 403 error, rethrow
                console.error(`[DirectusLegacy] Error response for ${collection}:`,
                    JSON.stringify({
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data
                    }, null, 2)
                );
                throw error;
            }
        } catch (error: any) {
            console.error(`[DirectusLegacy] Error fetching from ${collection}:`, error);
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
                // If we get a 403 error, try again without authentication
                if (error.response && error.response.status === 403) {
                    console.warn(`[DirectusLegacy] Authentication failed for ${collection}/${id}, trying public access`);

                    // Retry without authentication headers
                    const publicResponse = await axios.get(url, {
                        params,
                    });
                    return publicResponse.data;
                }

                // If it's not a 403 error, rethrow
                throw error;
            }
        } catch (error: any) {
            console.error(`[DirectusLegacy] Error fetching ${collection} with ID ${id}:`, error);
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