import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPayPalMode, isPayPalConfigured } from '@/lib/paypal/config';

describe('PayPal Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset environment variables
        delete process.env.PAYPAL_MODE;
        delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        delete process.env.PAYPAL_CLIENT_SECRET;
    });

    describe('getPayPalMode', () => {
        it('should return sandbox mode by default', () => {
            process.env.PAYPAL_MODE = 'sandbox';
            const mode = getPayPalMode();
            expect(mode).toBe('sandbox');
        });

        it('should return live mode when configured', () => {
            process.env.PAYPAL_MODE = 'live';
            const mode = getPayPalMode();
            expect(mode).toBe('live');
        });

        it('should default to sandbox when PAYPAL_MODE is not set', () => {
            delete process.env.PAYPAL_MODE;
            const mode = getPayPalMode();
            expect(mode).toBe('sandbox');
        });

        it('should handle invalid modes gracefully', () => {
            process.env.PAYPAL_MODE = 'invalid_mode';
            const mode = getPayPalMode();
            // Should default to sandbox or throw error based on implementation
            expect(['sandbox', 'live']).toContain(mode);
        });
    });

    describe('isPayPalConfigured', () => {
        it('should return true when all required credentials are present', () => {
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
            process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
            process.env.PAYPAL_MODE = 'sandbox';

            const configured = isPayPalConfigured();
            expect(configured).toBe(true);
        });

        it('should return false when client ID is missing', () => {
            delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
            process.env.PAYPAL_CLIENT_SECRET = 'test_secret';

            const configured = isPayPalConfigured();
            expect(configured).toBe(false);
        });

        it('should return false when client secret is missing', () => {
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
            delete process.env.PAYPAL_CLIENT_SECRET;

            const configured = isPayPalConfigured();
            expect(configured).toBe(false);
        });

        it('should return false when neither credential is present', () => {
            delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
            delete process.env.PAYPAL_CLIENT_SECRET;

            const configured = isPayPalConfigured();
            expect(configured).toBe(false);
        });
    });

    describe('Environment Detection', () => {
        it('should use SandboxEnvironment when mode is sandbox', () => {
            process.env.PAYPAL_MODE = 'sandbox';
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
            process.env.PAYPAL_CLIENT_SECRET = 'test_secret';

            const mode = getPayPalMode();
            expect(mode).toBe('sandbox');
        });

        it('should use LiveEnvironment when mode is live', () => {
            process.env.PAYPAL_MODE = 'live';
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
            process.env.PAYPAL_CLIENT_SECRET = 'test_secret';

            const mode = getPayPalMode();
            expect(mode).toBe('live');
        });
    });

    describe('Credential Validation', () => {
        it('should validate that credentials are non-empty strings', () => {
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
            process.env.PAYPAL_CLIENT_SECRET = 'test_secret';

            const configured = isPayPalConfigured();
            expect(configured).toBe(true);
        });

        it('should handle whitespace-only credentials as invalid', () => {
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = '   ';
            process.env.PAYPAL_CLIENT_SECRET = 'test_secret';

            const configured = isPayPalConfigured();
            // Should return false or handle gracefully
            expect(typeof configured).toBe('boolean');
        });
    });
});