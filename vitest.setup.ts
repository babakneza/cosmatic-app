import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock PayPal SDK
vi.mock('@paypal/checkout-server-sdk', () => ({
    SandboxEnvironment: class {
        clientId: string;
        clientSecret: string;
        constructor(clientId: string, clientSecret: string) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
        }
    },
    LiveEnvironment: class {
        clientId: string;
        clientSecret: string;
        constructor(clientId: string, clientSecret: string) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
        }
    },
    PayPalHttpClient: class {
        environment: any;
        constructor(environment: any) {
            this.environment = environment;
        }
        execute(request: any) {
            return Promise.resolve({ result: {} });
        }
    },
    Orders: {
        OrdersCreateRequest: class {
            body: Record<string, any>;
            headers: Record<string, any>;
            constructor() {
                this.body = {};
                this.headers = {};
            }
        },
        OrdersGetRequest: class {
            path: string;
            constructor(orderId: string) {
                this.path = `/v2/checkout/orders/${orderId}`;
            }
        },
        OrdersCaptureRequest: class {
            path: string;
            body: Record<string, any>;
            constructor(orderId: string) {
                this.path = `/v2/checkout/orders/${orderId}/capture`;
                this.body = {};
            }
        },
    },
}));

// Mock next-intl for unit tests
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
}));

// Mock next-intl/server for server components
vi.mock('next-intl/server', () => ({
    getTranslations: () => (key: string) => key,
    getLocale: () => 'en',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

// Mock environment variables for PayPal tests
process.env.NEXT_PUBLIC_DIRECTUS_URL = 'https://admin.buyjan.com';
process.env.NEXT_PUBLIC_SITE_URL = 'https://buyjan.com';
process.env.DIRECTUS_API_TOKEN = 'test_token';
process.env.NEXT_PUBLIC_DIRECTUS_API_TOKEN = 'public_test_token';
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test_client_id';
process.env.PAYPAL_CLIENT_SECRET = 'test_client_secret';
process.env.PAYPAL_MODE = 'sandbox';