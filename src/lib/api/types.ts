/**
 * API Types and Interfaces
 * Central type definitions for API requests and responses
 */

/**
 * Product filter options
 */
export interface ProductFilters {
    category?: string | string[];
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: string;
    limit?: number;
    offset?: number;
}

/**
 * Directus API response structure
 */
export interface DirectusResponse<T> {
    data: T[];
    meta?: {
        total_count?: number;
        filter_count?: number;
        [key: string]: any;
    };
}

/**
 * Single item response
 */
export interface DirectusItemResponse<T> {
    data: T;
}

/**
 * Rating calculation result
 */
export interface RatingData {
    average: number;
    count: number;
}

/**
 * API Request configuration
 */
export interface FetchOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    retries?: number;
}

/**
 * API Error information
 */
export interface ApiErrorInfo {
    message: string;
    statusCode?: number;
    details?: unknown;
    code?: string;
}