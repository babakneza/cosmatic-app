/**
 * Type declarations for @paypal/checkout-server-sdk
 * 
 * This file provides type definitions for the PayPal Checkout Server SDK
 * since the package doesn't include official TypeScript definitions.
 */

export class Orders {
    static OrdersCreateRequest: new () => OrdersCreateRequest;
    static OrdersGetRequest: new (orderId: string) => OrdersGetRequest;
    static OrdersCaptureRequest: new (orderId: string) => OrdersCaptureRequest;
}

export class OrdersCreateRequest {
    prefer(value: string): void;
    body: any;
}

export class OrdersGetRequest {
    constructor(orderId: string);
}

export class OrdersCaptureRequest {
    constructor(orderId: string);
    requestBody(body: any): void;
    prefer(value: string): void;
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
    execute(request: any): Promise<any>;
}