/**
 * Unit Tests for Currency Conversion Functions
 * 
 * Tests the OMR to USD conversion functionality used for PayPal transactions.
 * Ensures proper exchange rate application and decimal formatting.
 */

import { describe, it, expect } from 'vitest';
import { convertOMRtoUSD, convertOMRtoAED } from '@/lib/currency';

describe('Currency Conversion: OMR to USD', () => {
    describe('convertOMRtoUSD - Basic Conversion', () => {
        it('should convert whole number OMR amounts to USD with 2 decimal places', () => {
            const result = convertOMRtoUSD(100);
            expect(result).toBe('260.00');
        });

        it('should convert OMR 11.80 to USD 30.68', () => {
            const result = convertOMRtoUSD(11.80);
            expect(result).toBe('30.68');
        });

        it('should convert OMR 25.500 to USD 66.30', () => {
            const result = convertOMRtoUSD(25.500);
            expect(result).toBe('66.30');
        });

        it('should convert OMR 1 to USD 2.60', () => {
            const result = convertOMRtoUSD(1);
            expect(result).toBe('2.60');
        });
    });

    describe('convertOMRtoUSD - Decimal Precision', () => {
        it('should return exactly 2 decimal places', () => {
            const result = convertOMRtoUSD(50.123);
            const decimalPart = result.split('.')[1];
            expect(decimalPart.length).toBe(2);
        });

        it('should properly round when result has more than 2 decimals', () => {
            // 1.333 OMR * 2.6 = 3.4658 USD, should round to 3.47
            const result = convertOMRtoUSD(1.333);
            expect(result).toBe('3.47');
        });

        it('should preserve trailing zeros for proper formatting', () => {
            const result = convertOMRtoUSD(10);
            expect(result).toBe('26.00');
            expect(result.endsWith('00')).toBe(true);
        });

        it('should handle values with 3 decimal places (OMR standard)', () => {
            const result = convertOMRtoUSD(15.750);
            expect(result).toBe('40.95');
        });
    });

    describe('convertOMRtoUSD - Edge Cases', () => {
        it('should handle zero amount', () => {
            const result = convertOMRtoUSD(0);
            expect(result).toBe('0.00');
        });

        it('should handle very small amounts', () => {
            const result = convertOMRtoUSD(0.001);
            expect(result).toBe('0.00');
        });

        it('should handle very large amounts', () => {
            const result = convertOMRtoUSD(1000000);
            expect(result).toBe('2600000.00');
        });

        it('should handle negative amounts (for refunds)', () => {
            const result = convertOMRtoUSD(-50);
            expect(result).toBe('-130.00');
        });

        it('should handle negative decimal amounts', () => {
            const result = convertOMRtoUSD(-11.80);
            expect(result).toBe('-30.68');
        });
    });

    describe('convertOMRtoUSD - Return Type', () => {
        it('should return a string', () => {
            const result = convertOMRtoUSD(50);
            expect(typeof result).toBe('string');
        });

        it('should always return a properly formatted string with decimal point', () => {
            const result = convertOMRtoUSD(50);
            expect(result).toMatch(/^\-?\d+\.\d{2}$/);
        });

        it('should return consistent format for various inputs', () => {
            const tests = [0, 1, 1.5, 10, 50.123, 100, 1000];
            tests.forEach((amount) => {
                const result = convertOMRtoUSD(amount);
                expect(result).toMatch(/^\-?\d+\.\d{2}$/);
            });
        });
    });

    describe('convertOMRtoUSD - Exchange Rate Verification', () => {
        it('should use 1 OMR = 2.6 USD exchange rate', () => {
            // Direct verification: 1 OMR should convert to 2.60 USD
            const result = convertOMRtoUSD(1);
            expect(result).toBe('2.60');

            // Multiple of exchange rate: 10 OMR should be 26.00 USD
            const result2 = convertOMRtoUSD(10);
            expect(result2).toBe('26.00');
        });

        it('should apply consistent rate across different amounts', () => {
            const rate = 2.6;
            const testAmounts = [5, 25, 100, 50.5];

            testAmounts.forEach((omr) => {
                const result = convertOMRtoUSD(omr);
                const resultNum = parseFloat(result);
                const expected = (omr * rate).toFixed(2);
                expect(result).toBe(expected);
            });
        });
    });

    describe('convertOMRtoAED - Backward Compatibility', () => {
        it('should still exist for backward compatibility', () => {
            expect(typeof convertOMRtoAED).toBe('function');
        });

        it('should delegate to convertOMRtoUSD', () => {
            const usdResult = convertOMRtoUSD(100);
            const aedResult = convertOMRtoAED(100);
            // Should now return USD conversion (not AED)
            expect(aedResult).toBe(usdResult);
            expect(aedResult).toBe('260.00');
        });

        it('should return same result as convertOMRtoUSD for various amounts', () => {
            const testAmounts = [0, 1, 10, 50, 100, 11.80, 25.500];

            testAmounts.forEach((amount) => {
                const usdResult = convertOMRtoUSD(amount);
                const aedResult = convertOMRtoAED(amount);
                expect(aedResult).toBe(usdResult);
            });
        });

        it('should handle negative amounts in convertOMRtoAED', () => {
            const result = convertOMRtoAED(-50);
            expect(result).toBe('-130.00');
        });
    });

    describe('convertOMRtoUSD - Real-World PayPal Scenarios', () => {
        it('should handle typical product price: 45.000 OMR (men perfume)', () => {
            const result = convertOMRtoUSD(45.000);
            expect(result).toBe('117.00');
        });

        it('should handle typical product price: 89.500 OMR (luxury cream)', () => {
            const result = convertOMRtoUSD(89.500);
            expect(result).toBe('232.70');
        });

        it('should handle typical cart total: 125.500 OMR (2 items)', () => {
            const result = convertOMRtoUSD(125.500);
            expect(result).toBe('326.30');
        });

        it('should handle cart with tax and shipping: 99.750 OMR', () => {
            const result = convertOMRtoUSD(99.750);
            expect(result).toBe('259.35');
        });

        it('should handle minimum order: 5.000 OMR', () => {
            const result = convertOMRtoUSD(5.000);
            expect(result).toBe('13.00');
        });

        it('should handle high-value order: 500.000 OMR', () => {
            const result = convertOMRtoUSD(500.000);
            expect(result).toBe('1300.00');
        });
    });

    describe('convertOMRtoUSD - Floating Point Precision', () => {
        it('should handle floating point arithmetic correctly', () => {
            // JavaScript floating point: 0.1 + 0.2 !== 0.3
            // But our conversion should handle this properly
            const result = convertOMRtoUSD(0.1 + 0.2);
            expect(parseFloat(result)).toBeCloseTo(0.78, 2);
        });

        it('should avoid rounding errors in typical commerce scenarios', () => {
            // 3 items at 10 OMR each = 30 OMR subtotal
            const item1 = convertOMRtoUSD(10);
            const item2 = convertOMRtoUSD(10);
            const item3 = convertOMRtoUSD(10);
            const subtotal = convertOMRtoUSD(30);

            // All should be consistent
            expect(subtotal).toBe('78.00');
            // Individual conversions and sum should be equivalent
            expect(parseFloat(item1)).toBeCloseTo(26.00, 2);
        });

        it('should maintain precision after multiple operations', () => {
            // Convert 11.80 OMR five times should give consistent results
            const results = [
                convertOMRtoUSD(11.80),
                convertOMRtoUSD(11.80),
                convertOMRtoUSD(11.80),
                convertOMRtoUSD(11.80),
                convertOMRtoUSD(11.80),
            ];

            results.forEach((result) => {
                expect(result).toBe('30.68');
            });
        });
    });
});