/**
 * Centralized Logger Utility
 * Provides structured logging with different log levels
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

const isDev = process.env.NODE_ENV === 'development';
const logLevelMap = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
};

const currentLogLevel =
    (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || LogLevel.INFO;

/**
 * Format log output with timestamp and level
 */
function formatLog(
    level: LogLevel,
    message: string,
    data?: any
): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

/**
 * Check if log level should be shown
 */
function shouldLog(level: LogLevel): boolean {
    return logLevelMap[level] >= logLevelMap[currentLogLevel];
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
    /**
     * Debug level - detailed development information
     */
    debug: (message: string, data?: any): void => {
        if (!isDev) return;
        if (!shouldLog(LogLevel.DEBUG)) return;
        console.debug(formatLog(LogLevel.DEBUG, message, data));
    },

    /**
     * Info level - general informational messages
     */
    info: (message: string, data?: any): void => {
        if (!shouldLog(LogLevel.INFO)) return;
        console.info(formatLog(LogLevel.INFO, message, data));
    },

    /**
     * Warn level - warning messages
     */
    warn: (message: string, data?: any): void => {
        if (!shouldLog(LogLevel.WARN)) return;
        console.warn(formatLog(LogLevel.WARN, message, data));
    },

    /**
     * Error level - error messages
     */
    error: (message: string, error?: any): void => {
        if (!shouldLog(LogLevel.ERROR)) return;
        const errorData =
            error instanceof Error
                ? {
                    message: error.message,
                    stack: isDev ? error.stack : undefined
                }
                : error;
        console.error(formatLog(LogLevel.ERROR, message, errorData));
    },

    /**
     * Log API request
     */
    logRequest: (method: string, url: string, headers?: any): void => {
        if (!isDev) return;
        logger.debug(`[API] ${method} ${url}`, {
            headers: { ...headers, Authorization: '***' }
        });
    },

    /**
     * Log API response
     */
    logResponse: (
        method: string,
        url: string,
        status: number,
        duration: number
    ): void => {
        if (!isDev) return;
        logger.debug(`[API] ${method} ${url}`, { status, duration: `${duration}ms` });
    },

    /**
     * Log API error
     */
    logApiError: (method: string, url: string, error: any): void => {
        const message =
            error instanceof Error ? error.message : JSON.stringify(error);
        logger.error(`[API] ${method} ${url} failed`, { error: message });
    }
};

/**
 * Create a scoped logger for specific modules
 */
export function createScopedLogger(scope: string) {
    return {
        debug: (message: string, data?: any) =>
            logger.debug(`[${scope}] ${message}`, data),
        info: (message: string, data?: any) =>
            logger.info(`[${scope}] ${message}`, data),
        warn: (message: string, data?: any) =>
            logger.warn(`[${scope}] ${message}`, data),
        error: (message: string, error?: any) =>
            logger.error(`[${scope}] ${message}`, error)
    };
}