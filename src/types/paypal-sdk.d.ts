/**
 * Type declarations for @paypal/checkout-server-sdk
 * 
 * This file provides type definitions for the PayPal Checkout Server SDK
 * since the package doesn't include official TypeScript definitions.
 */

declare module '@paypal/checkout-server-sdk' {
    export class Orders {
        constructor(client: any);
        createOrder(createOrderRequest: any): Promise<any>;
        getOrder(orderID: string): Promise<any>;
        captureOrder(orderID: string, captureRequest: any): Promise<any>;
    }

    export class SandboxEnvironment {
        constructor(clientId: string, clientSecret: string);
    }

    export class LiveEnvironment {
        constructor(clientId: string, clientSecret: string);
    }

    export class HttpClient {
        constructor(environment: any);
    }

    export class HttpRequest {
        constructor(verb: string, path: string, body?: any, headers?: Record<string, string>);
        headers(headers: Record<string, string>): this;
        body(body: any): this;
    }

    export interface ILogger {
        debug(message: string): void;
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
    }

    export class PayPalHttpClient {
        constructor(environment: any);
        execute(request: HttpRequest): Promise<any>;
    }
}

declare global {
    interface Window {
        paypal?: {
            Buttons: (options: any) => {
                render: (container: HTMLElement | string) => Promise<void>;
            };
        };
    }
}

export { };