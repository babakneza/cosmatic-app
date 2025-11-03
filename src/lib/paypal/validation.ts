/**
 * PayPal Payment Validation Utilities
 * 
 * Provides validation functions for payment-related input fields:
 * - Phone numbers (Oman country code)
 * - Postal codes
 * - Email addresses
 * - Currency amounts
 * - Personal information
 */

/**
 * Validate Omani phone number format
 * 
 * Accepts:
 * - +968 1234 5678
 * - +9681234567
 * - 968 1234 5678
 * - 1234 5678
 * - 12345678
 * 
 * Omani phone numbers:
 * - 8 digits long (excluding country code)
 * - Start with 9 for mobile or other prefixes for landline
 * - Country code: +968
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
    if (!phone || typeof phone !== 'string') {
        return { valid: false, error: 'Phone number is required' };
    }

    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-().+]/g, '');

    // Must be digits only after cleaning
    if (!/^\d+$/.test(cleaned)) {
        return { valid: false, error: 'Phone number must contain only digits' };
    }

    let numberToValidate = cleaned;

    // If starts with country code +968 or 968, strip it
    if (cleaned.startsWith('968') && cleaned.length > 3) {
        numberToValidate = cleaned.substring(3);
    }

    // Omani numbers should be 8 digits after removing country code
    if (numberToValidate.length !== 8) {
        return {
            valid: false,
            error: 'Phone number must be 8 digits (for Oman)',
        };
    }

    // Omani mobile/landline validation
    // Mobile: 9XXXXXXX (Vodafone, Oman Mobile)
    // Landline: 2XXXXXXX (Oman Telecom)
    if (!/^[92]/.test(numberToValidate)) {
        return {
            valid: false,
            error: 'Invalid Omani phone number (must start with 2 or 9)',
        };
    }

    return { valid: true };
}

/**
 * Validate postal code format for Oman
 * 
 * Omani postal codes:
 * - 3 or 4 digits
 * - Typically format: 123 or 1234
 * 
 * Examples:
 * - 111 (valid)
 * - 1111 (valid)
 * - 12 (invalid - too short)
 * - 12345 (invalid - too long)
 */
export function validatePostalCode(postalCode: string): { valid: boolean; error?: string } {
    if (!postalCode) {
        // Postal code is optional for some addresses
        return { valid: true };
    }

    if (typeof postalCode !== 'string') {
        return { valid: false, error: 'Postal code must be a string' };
    }

    const cleaned = postalCode.trim();

    // Must be digits only
    if (!/^\d+$/.test(cleaned)) {
        return { valid: false, error: 'Postal code must contain only digits' };
    }

    // Must be 3-4 digits (common for Oman)
    if (cleaned.length < 3 || cleaned.length > 4) {
        return {
            valid: false,
            error: 'Postal code must be 3 or 4 digits',
        };
    }

    return { valid: true };
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }

    const cleaned = email.trim().toLowerCase();

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) {
        return { valid: false, error: 'Invalid email address format' };
    }

    // Additional checks
    if (cleaned.length > 254) {
        return { valid: false, error: 'Email address is too long' };
    }

    return { valid: true };
}

/**
 * Validate payment amount
 * 
 * For OMR currency:
 * - Must be positive
 * - Must have at most 3 decimal places
 * - Must be a valid number
 */
export function validateAmount(
    amount: number | string,
    options?: {
        minAmount?: number;
        maxAmount?: number;
        currency?: string;
    }
): { valid: boolean; error?: string; formatted?: string } {
    const min = options?.minAmount ?? 0;
    const max = options?.maxAmount ?? 999999.999;
    const currency = options?.currency ?? 'OMR';

    if (amount === null || amount === undefined) {
        return { valid: false, error: 'Amount is required' };
    }

    let numAmount: number;
    try {
        numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    } catch {
        return { valid: false, error: 'Invalid amount format' };
    }

    if (isNaN(numAmount)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount < min) {
        return { valid: false, error: `Minimum amount is ${currency} ${min.toFixed(3)}` };
    }

    if (numAmount > max) {
        return { valid: false, error: `Maximum amount is ${currency} ${max.toFixed(3)}` };
    }

    // Check decimal places (OMR uses 3 decimal places)
    const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 3) {
        return {
            valid: false,
            error: `Amount can have at most 3 decimal places for ${currency}`,
        };
    }

    return {
        valid: true,
        formatted: numAmount.toFixed(3),
    };
}

/**
 * Validate name field (first/last name)
 * 
 * Requirements:
 * - At least 2 characters
 * - At most 50 characters
 * - No excessive special characters
 * - Supports ASCII and Unicode (Arabic, CJK, etc.) characters
 */
export function validateName(name: string): { valid: boolean; error?: string } {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Name is required' };
    }

    const cleaned = name.trim();

    if (cleaned.length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (cleaned.length > 50) {
        return { valid: false, error: 'Name must be at most 50 characters' };
    }

    // Allow letters (including Unicode), spaces, hyphens, apostrophes
    // Reject only dangerous special characters like < > { } [ ] \ etc
    const dangerousCharsCount = (cleaned.match(/[<>{}[\]\\`^|~]/g) || []).length;
    if (dangerousCharsCount > 0) {
        return { valid: false, error: 'Name contains invalid special characters' };
    }

    return { valid: true };
}

/**
 * Validate address line
 * 
 * Requirements:
 * - At least 5 characters
 * - At most 100 characters
 * - No excessive special characters
 */
export function validateAddressLine(address: string): { valid: boolean; error?: string } {
    if (!address || typeof address !== 'string') {
        return { valid: false, error: 'Address is required' };
    }

    const cleaned = address.trim();

    if (cleaned.length < 5) {
        return { valid: false, error: 'Address must be at least 5 characters' };
    }

    if (cleaned.length > 100) {
        return { valid: false, error: 'Address must be at most 100 characters' };
    }

    return { valid: true };
}

/**
 * Validate city/wilayat name
 */
export function validateCity(city: string): { valid: boolean; error?: string } {
    if (!city || typeof city !== 'string') {
        return { valid: false, error: 'City is required' };
    }

    const cleaned = city.trim();

    if (cleaned.length < 2) {
        return { valid: false, error: 'City must be at least 2 characters' };
    }

    if (cleaned.length > 50) {
        return { valid: false, error: 'City must be at most 50 characters' };
    }

    // Should not contain excessive numbers
    const numberCount = (cleaned.match(/\d/g) || []).length;
    if (numberCount > 3) {
        return { valid: false, error: 'City name contains too many numbers' };
    }

    return { valid: true };
}

/**
 * Comprehensive validation for shipping address
 */
export function validateShippingAddress(address: any): {
    valid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    // Validate full name
    if (!address.full_name) {
        errors.full_name = 'Full name is required';
    } else {
        const nameValidation = validateName(address.full_name);
        if (!nameValidation.valid) {
            errors.full_name = nameValidation.error || 'Invalid full name';
        }
    }

    // Validate phone
    if (!address.phone) {
        errors.phone = 'Phone number is required';
    } else {
        const phoneValidation = validatePhoneNumber(address.phone);
        if (!phoneValidation.valid) {
            errors.phone = phoneValidation.error || 'Invalid phone number';
        }
    }

    // Validate email (if provided)
    if (address.email) {
        const emailValidation = validateEmail(address.email);
        if (!emailValidation.valid) {
            errors.email = emailValidation.error || 'Invalid email';
        }
    }

    // Validate street address
    if (!address.street_address) {
        errors.street_address = 'Street address is required';
    } else {
        const streetValidation = validateAddressLine(address.street_address);
        if (!streetValidation.valid) {
            errors.street_address = streetValidation.error || 'Invalid street address';
        }
    }

    // Validate city/wilayat
    if (!address.wilayat) {
        errors.wilayat = 'City/Wilayat is required';
    } else {
        const cityValidation = validateCity(address.wilayat);
        if (!cityValidation.valid) {
            errors.wilayat = cityValidation.error || 'Invalid city';
        }
    }

    // Validate postal code (optional)
    if (address.postal_code) {
        const postalValidation = validatePostalCode(address.postal_code);
        if (!postalValidation.valid) {
            errors.postal_code = postalValidation.error || 'Invalid postal code';
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove dangerous characters but preserve some for addresses
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const numberToFormat = cleaned.endsWith('968')
        ? cleaned.substring(0, cleaned.length - 3)
        : cleaned.length > 8
            ? cleaned.substring(cleaned.length - 8)
            : cleaned;

    if (numberToFormat.length === 8) {
        return `${numberToFormat.slice(0, 4)} ${numberToFormat.slice(4)}`;
    }
    return phone;
}

/**
 * Validate full payment order request
 */
export function validatePaymentOrder(order: any): {
    valid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    // Validate items
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        errors.items = 'Order must contain at least one item';
    } else {
        for (let i = 0; i < order.items.length; i++) {
            const item = order.items[i];
            if (!item.product_id || !item.name || item.quantity <= 0 || item.unit_price <= 0) {
                errors[`item_${i}`] = 'Invalid item data';
            }
        }
    }

    // Validate totals
    if (!order.totals) {
        errors.totals = 'Order totals required';
    } else {
        const { subtotal, tax, shipping, total } = order.totals;

        const subtotalValidation = validateAmount(subtotal);
        if (!subtotalValidation.valid) {
            errors.subtotal = subtotalValidation.error || 'Invalid subtotal';
        }

        const taxValidation = validateAmount(tax);
        if (!taxValidation.valid) {
            errors.tax = taxValidation.error || 'Invalid tax amount';
        }

        const shippingValidation = validateAmount(shipping);
        if (!shippingValidation.valid) {
            errors.shipping = shippingValidation.error || 'Invalid shipping cost';
        }

        const totalValidation = validateAmount(total);
        if (!totalValidation.valid) {
            errors.total = totalValidation.error || 'Invalid total amount';
        }

        // Verify total calculation
        const calculatedTotal = (
            (parseFloat(subtotal) || 0) +
            (parseFloat(tax) || 0) +
            (parseFloat(shipping) || 0)
        ).toFixed(3);

        if (Math.abs(parseFloat(calculatedTotal) - parseFloat(total)) > 0.001) {
            errors.total = 'Total amount does not match calculation (subtotal + tax + shipping)';
        }
    }

    // Validate customer email
    if (!order.customer_email) {
        errors.customer_email = 'Customer email required';
    } else {
        const emailValidation = validateEmail(order.customer_email);
        if (!emailValidation.valid) {
            errors.customer_email = emailValidation.error || 'Invalid customer email';
        }
    }

    // Validate addresses
    if (!order.shipping_address) {
        errors.shipping_address = 'Shipping address required';
    } else {
        const addressValidation = validateShippingAddress(order.shipping_address);
        if (!addressValidation.valid) {
            errors.shipping_address = 'Invalid shipping address: ' + Object.values(addressValidation.errors)[0];
        }
    }

    if (!order.billing_address) {
        errors.billing_address = 'Billing address required';
    } else {
        const addressValidation = validateShippingAddress(order.billing_address);
        if (!addressValidation.valid) {
            errors.billing_address = 'Invalid billing address: ' + Object.values(addressValidation.errors)[0];
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}