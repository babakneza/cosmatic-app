/**
 * Centralized Error Handling
 * Custom error classes and error handlers for the API layer
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Directus-specific error
 */
export class DirectusError extends ApiError {
    constructor(
        message: string,
        statusCode?: number,
        details?: unknown
    ) {
        super('DIRECTUS_ERROR', message, statusCode, details);
        this.name = 'DirectusError';
    }
}

/**
 * Validation error (4xx responses)
 */
export class ValidationError extends ApiError {
    constructor(
        message: string,
        public fields?: Record<string, string[]>,
        statusCode?: number
    ) {
        super('VALIDATION_ERROR', message, statusCode);
        this.name = 'ValidationError';
    }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
    constructor(message: string = 'Authentication failed') {
        super('AUTH_ERROR', message, 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiError {
    constructor(message: string = 'Access denied') {
        super('AUTHZ_ERROR', message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Server error (5xx responses)
 */
export class ServerError extends ApiError {
    constructor(
        message: string,
        statusCode: number = 500,
        details?: unknown
    ) {
        super('SERVER_ERROR', message, statusCode, details);
        this.name = 'ServerError';
    }
}

/**
 * Network error
 */
export class NetworkError extends ApiError {
    constructor(message: string = 'Network request failed') {
        super('NETWORK_ERROR', message);
        this.name = 'NetworkError';
    }
}

/**
 * Create appropriate error from HTTP response
 */
export function createErrorFromResponse(
    status: number,
    statusText: string,
    data?: any
): ApiError {
    const message = data?.errors?.[0]?.message || statusText;

    if (status === 401) {
        return new AuthenticationError(message);
    }

    if (status === 403) {
        return new AuthorizationError(message);
    }

    if (status === 404) {
        return new NotFoundError(message);
    }

    if (status >= 400 && status < 500) {
        return new ValidationError(message, undefined, status);
    }

    if (status >= 500) {
        return new ServerError(message, status, data);
    }

    return new DirectusError(message, status, data);
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Extract error message from any error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}

/**
 * Extract status code from any error
 */
export function getErrorStatusCode(error: unknown): number | undefined {
    if (error instanceof ApiError) {
        return error.statusCode;
    }

    return undefined;
}