/**
 * PayPal Error Handling
 * 
 * Custom error types and error mapping for PayPal operations.
 */

export enum PayPalErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    API_ERROR = 'API_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    CAPTURE_ERROR = 'CAPTURE_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom PayPal Error class
 */
export class PayPalError extends Error {
    constructor(
        message: string,
        public errorType: PayPalErrorType,
        public userMessage: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'PayPalError';
    }

    /**
     * Convert error to JSON for logging/transmission
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            errorType: this.errorType,
            userMessage: this.userMessage,
            details: this.details,
        };
    }
}

/**
 * Map PayPal API errors to user-friendly messages
 */
export function getErrorMessage(error: PayPalError | Error, locale: 'ar' | 'en' = 'en'): string {
    if (error instanceof PayPalError) {
        if (locale === 'ar') {
            return mapErrorToArabic(error.errorType);
        }
        return error.userMessage;
    }

    // Generic error message
    if (locale === 'ar') {
        return 'حدث خطأ. يرجى المحاولة مرة أخرى.';
    }
    return 'An error occurred. Please try again.';
}

/**
 * Map error types to Arabic messages
 */
function mapErrorToArabic(errorType: PayPalErrorType): string {
    const messages: Record<PayPalErrorType, string> = {
        [PayPalErrorType.VALIDATION_ERROR]: 'بيانات الطلب غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.',
        [PayPalErrorType.API_ERROR]: 'حدث خطأ في معالجة الدفع. يرجى المحاولة مرة أخرى لاحقاً.',
        [PayPalErrorType.NETWORK_ERROR]: 'خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
        [PayPalErrorType.CAPTURE_ERROR]: 'فشل في التقاط الدفع. يرجى المحاولة مرة أخرى.',
        [PayPalErrorType.AUTHENTICATION_ERROR]: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.',
        [PayPalErrorType.UNKNOWN_ERROR]: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    };

    return messages[errorType] || 'حدث خطأ. يرجى المحاولة مرة أخرى.';
}

/**
 * Log PayPal error securely (without exposing sensitive data)
 */
export function logPayPalError(error: PayPalError | Error, context?: Record<string, any>): void {
    if (error instanceof PayPalError) {
        console.error('[PayPal Error]', {
            type: error.errorType,
            message: error.message,
            timestamp: new Date().toISOString(),
            context,
            // Don't log userMessage or details as they might contain sensitive info
        });
    } else {
        console.error('[PayPal Error] Unexpected error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context,
        });
    }
}