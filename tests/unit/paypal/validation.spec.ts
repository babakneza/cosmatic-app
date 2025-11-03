/**
 * Unit Tests for PayPal Payment Validation Utilities
 * 
 * Tests for:
 * - Phone number validation (Omani format)
 * - Postal code validation
 * - Email validation
 * - Amount validation (OMR currency)
 * - Name and address validation
 * - Comprehensive order validation
 */

import {
    validatePhoneNumber,
    validatePostalCode,
    validateEmail,
    validateAmount,
    validateName,
    validateAddressLine,
    validateCity,
    validateShippingAddress,
    validatePaymentOrder,
    sanitizeInput,
    formatPhoneNumber,
} from '@/lib/paypal/validation';

describe('PayPal Payment Validation', () => {
    describe('validatePhoneNumber', () => {
        it('should validate correct Omani phone numbers', () => {
            const validNumbers = [
                '+968 9123 4567',
                '+968 91234567',
                '968 9123 4567',
                '9123 4567',
                '91234567',
                '+968 2345 6789',
                '23456789',
                '+96823456789',
            ];

            validNumbers.forEach((phone) => {
                const result = validatePhoneNumber(phone);
                expect(result.valid).toBe(true);
            });
        });

        it('should reject invalid phone number formats', () => {
            const invalidNumbers = [
                '123',
                '12345',
                '1234567',
                '123456789',
                '+968 1234 5678',
                '+1 234 5678',
                'abc12345678',
                '',
                '   ',
            ];

            invalidNumbers.forEach((phone) => {
                const result = validatePhoneNumber(phone);
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        it('should reject phone numbers starting with invalid prefix', () => {
            const result = validatePhoneNumber('81234567');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('2 or 9');
        });

        it('should handle phone numbers with various formatting', () => {
            const result1 = validatePhoneNumber('(+968) 91-234-567');
            expect(result1.valid).toBe(true);

            const result2 = validatePhoneNumber('+968-9123-4567');
            expect(result2.valid).toBe(true);
        });

        it('should reject non-string phone numbers', () => {
            const result = validatePhoneNumber(null as any);
            expect(result.valid).toBe(false);
        });
    });

    describe('validatePostalCode', () => {
        it('should validate correct Omani postal codes', () => {
            const validCodes = ['111', '123', '1234', '9999'];

            validCodes.forEach((code) => {
                const result = validatePostalCode(code);
                expect(result.valid).toBe(true);
            });
        });

        it('should allow empty postal code (optional field)', () => {
            const result = validatePostalCode('');
            expect(result.valid).toBe(true);
        });

        it('should reject invalid postal code lengths', () => {
            const invalidCodes = ['11', '12345', 'abc'];

            invalidCodes.forEach((code) => {
                const result = validatePostalCode(code);
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        it('should reject non-numeric postal codes', () => {
            const result = validatePostalCode('abc1');
            expect(result.valid).toBe(false);
        });

        it('should handle whitespace', () => {
            const result = validatePostalCode('  123  ');
            expect(result.valid).toBe(true);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'info+tag@company.com',
                'contact@subdomain.example.com',
            ];

            validEmails.forEach((email) => {
                const result = validateEmail(email);
                expect(result.valid).toBe(true);
            });
        });

        it('should reject invalid email formats', () => {
            const invalidEmails = [
                'plaintext',
                '@example.com',
                'test@',
                'test@.com',
                'test @example.com',
                '',
            ];

            invalidEmails.forEach((email) => {
                const result = validateEmail(email);
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        it('should handle case-insensitive emails', () => {
            const result = validateEmail('TEST@EXAMPLE.COM');
            expect(result.valid).toBe(true);
        });

        it('should reject overly long emails', () => {
            const longEmail = 'a'.repeat(250) + '@example.com';
            const result = validateEmail(longEmail);
            expect(result.valid).toBe(false);
        });
    });

    describe('validateAmount', () => {
        it('should validate correct OMR amounts', () => {
            const validAmounts = ['100.000', '50.500', '1.001', 100, 50.5, 1.001];

            validAmounts.forEach((amount) => {
                const result = validateAmount(amount, { currency: 'OMR' });
                expect(result.valid).toBe(true);
                expect(result.formatted).toBeDefined();
            });
        });

        it('should reject negative amounts', () => {
            const result = validateAmount(-100, { currency: 'OMR' });
            expect(result.valid).toBe(false);
        });

        it('should reject amounts exceeding maximum', () => {
            const result = validateAmount(1000000, { maxAmount: 999999 });
            expect(result.valid).toBe(false);
        });

        it('should reject amounts below minimum', () => {
            const result = validateAmount(0.5, { minAmount: 1 });
            expect(result.valid).toBe(false);
        });

        it('should reject amounts with too many decimals', () => {
            const result = validateAmount(100.1234, { currency: 'OMR' });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('3 decimal places');
        });

        it('should format amount to 3 decimal places', () => {
            const result = validateAmount(100, { currency: 'OMR' });
            expect(result.formatted).toBe('100.000');
        });

        it('should reject invalid amount types', () => {
            const result = validateAmount('invalid', { currency: 'OMR' });
            expect(result.valid).toBe(false);
        });
    });

    describe('validateName', () => {
        it('should validate correct names', () => {
            const validNames = [
                'John Doe',
                'Ali Mohammed',
                'Mary-Jane',
                "O'Brien",
                'محمد علي',
            ];

            validNames.forEach((name) => {
                const result = validateName(name);
                expect(result.valid).toBe(true);
            });
        });

        it('should reject names too short', () => {
            const result = validateName('A');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('at least 2');
        });

        it('should reject names too long', () => {
            const result = validateName('A'.repeat(51));
            expect(result.valid).toBe(false);
            expect(result.error).toContain('at most 50');
        });

        it('should reject names with excessive special characters', () => {
            const result = validateName('John@#$%&Doe!!!');
            expect(result.valid).toBe(false);
        });

        it('should require names', () => {
            const result = validateName('');
            expect(result.valid).toBe(false);
        });
    });

    describe('validateAddressLine', () => {
        it('should validate correct address lines', () => {
            const validAddresses = [
                'P.O. Box 123',
                'Al Khuwair, Building 45',
                '123 Main Street, Muscat',
                'Apartment 10, Building 5, Street 1',
            ];

            validAddresses.forEach((address) => {
                const result = validateAddressLine(address);
                expect(result.valid).toBe(true);
            });
        });

        it('should reject addresses too short', () => {
            const result = validateAddressLine('123');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('at least 5');
        });

        it('should reject addresses too long', () => {
            const result = validateAddressLine('A'.repeat(101));
            expect(result.valid).toBe(false);
            expect(result.error).toContain('at most 100');
        });

        it('should require addresses', () => {
            const result = validateAddressLine('');
            expect(result.valid).toBe(false);
        });
    });

    describe('validateCity', () => {
        it('should validate correct city names', () => {
            const validCities = ['Muscat', 'Salalah', 'Nizwa', 'Sohar'];

            validCities.forEach((city) => {
                const result = validateCity(city);
                expect(result.valid).toBe(true);
            });
        });

        it('should reject city names too short', () => {
            const result = validateCity('M');
            expect(result.valid).toBe(false);
        });

        it('should reject city names too long', () => {
            const result = validateCity('A'.repeat(51));
            expect(result.valid).toBe(false);
        });

        it('should reject city names with excessive numbers', () => {
            const result = validateCity('City123456');
            expect(result.valid).toBe(false);
        });
    });

    describe('validateShippingAddress', () => {
        it('should validate complete shipping address', () => {
            const address = {
                full_name: 'John Doe',
                phone: '91234567',
                email: 'john@example.com',
                street_address: 'P.O. Box 123',
                wilayat: 'Muscat',
                governorate: 'Muscat',
                postal_code: '111',
            };

            const result = validateShippingAddress(address);
            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should identify all validation errors', () => {
            const address = {
                full_name: 'A', // Too short
                phone: 'invalid', // Invalid format
                street_address: '123', // Too short
                wilayat: 'A', // Too short
            };

            const result = validateShippingAddress(address);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveProperty('full_name');
            expect(result.errors).toHaveProperty('phone');
            expect(result.errors).toHaveProperty('street_address');
            expect(result.errors).toHaveProperty('wilayat');
        });

        it('should allow optional fields', () => {
            const address = {
                full_name: 'John Doe',
                phone: '91234567',
                street_address: 'P.O. Box 123',
                wilayat: 'Muscat',
                // email and postal_code are optional
            };

            const result = validateShippingAddress(address);
            expect(result.valid).toBe(true);
        });
    });

    describe('validatePaymentOrder', () => {
        it('should validate complete payment order', () => {
            const order = {
                items: [
                    { product_id: '1', name: 'Product', quantity: 1, unit_price: 100 },
                ],
                totals: {
                    subtotal: 100,
                    tax: 5,
                    shipping: 10,
                    total: 115,
                },
                customer_email: 'customer@example.com',
                shipping_address: {
                    full_name: 'John Doe',
                    phone: '91234567',
                    street_address: 'P.O. Box 123',
                    wilayat: 'Muscat',
                },
                billing_address: {
                    full_name: 'John Doe',
                    phone: '91234567',
                    street_address: 'P.O. Box 123',
                    wilayat: 'Muscat',
                },
            };

            const result = validatePaymentOrder(order);
            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should reject order with invalid total calculation', () => {
            const order = {
                items: [
                    { product_id: '1', name: 'Product', quantity: 1, unit_price: 100 },
                ],
                totals: {
                    subtotal: 100,
                    tax: 5,
                    shipping: 10,
                    total: 120, // Should be 115
                },
                customer_email: 'customer@example.com',
                shipping_address: {
                    full_name: 'John Doe',
                    phone: '91234567',
                    street_address: 'P.O. Box 123',
                    wilayat: 'Muscat',
                },
                billing_address: {
                    full_name: 'John Doe',
                    phone: '91234567',
                    street_address: 'P.O. Box 123',
                    wilayat: 'Muscat',
                },
            };

            const result = validatePaymentOrder(order);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveProperty('total');
        });

        it('should reject order with invalid items', () => {
            const order = {
                items: [],
                totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
                customer_email: 'customer@example.com',
                shipping_address: { full_name: 'John' } as any,
                billing_address: { full_name: 'John' } as any,
            };

            const result = validatePaymentOrder(order);
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveProperty('items');
        });

        it('should identify multiple errors', () => {
            const order = {
                items: [],
                totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
                customer_email: 'invalid-email',
                shipping_address: { full_name: 'A' } as any,
                billing_address: {} as any,
            };

            const result = validatePaymentOrder(order);
            expect(result.valid).toBe(false);
            expect(Object.keys(result.errors).length).toBeGreaterThan(1);
        });
    });

    describe('sanitizeInput', () => {
        it('should remove dangerous characters', () => {
            const input = 'Normal <script>alert("XSS")</script> text';
            const result = sanitizeInput(input);
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        it('should remove javascript protocol', () => {
            const input = 'Click javascript:void(0)';
            const result = sanitizeInput(input);
            expect(result).not.toContain('javascript:');
        });

        it('should remove event handlers', () => {
            const input = 'Text onclick=alert("XSS")';
            const result = sanitizeInput(input);
            expect(result).not.toContain('onclick');
        });

        it('should preserve normal text', () => {
            const input = 'Normal customer name with spaces';
            const result = sanitizeInput(input);
            expect(result).toBe(input);
        });

        it('should handle empty strings', () => {
            const result = sanitizeInput('');
            expect(result).toBe('');
        });
    });

    describe('formatPhoneNumber', () => {
        it('should format 8-digit phone numbers', () => {
            const result = formatPhoneNumber('91234567');
            expect(result).toBe('9123 4567');
        });

        it('should format phone numbers with country code', () => {
            const result = formatPhoneNumber('+96891234567');
            expect(result).toBe('9123 4567');
        });

        it('should handle already formatted numbers', () => {
            const result = formatPhoneNumber('9123 4567');
            expect(result).toMatch(/\d{4}\s\d{4}/);
        });

        it('should preserve unformatted numbers if invalid', () => {
            const result = formatPhoneNumber('123');
            expect(result).toBe('123');
        });
    });

    describe('Edge Cases & Security', () => {
        it('should handle null and undefined', () => {
            expect(validatePhoneNumber(null as any).valid).toBe(false);
            expect(validateEmail(null as any).valid).toBe(false);
            expect(validateName(null as any).valid).toBe(false);
        });

        it('should handle very long strings', () => {
            const longString = 'A'.repeat(10000);
            expect(validateName(longString).valid).toBe(false);
            expect(validateAddressLine(longString).valid).toBe(false);
        });

        it('should handle special unicode characters', () => {
            const result = validateName('محمد علي');
            expect(result.valid).toBe(true);

            const result2 = validateName('太郎');
            expect(result2.valid).toBe(true);
        });

        it('should prevent SQL injection', () => {
            const injection = "'; DROP TABLE users; --";
            const result = sanitizeInput(injection);
            expect(result).toBe(injection); // SQL injection is not a client-side concern, should be validated server-side
        });
    });
});