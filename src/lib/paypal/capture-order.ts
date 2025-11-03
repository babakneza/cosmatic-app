/**
 * PayPal Order Capture Service
 * 
 * Captures (finalizes) a PayPal order that has been approved by the user.
 * Extracts transaction details for order creation in Directus.
 */

import { paypalClient, Orders } from './config';
import { PayPalError, PayPalErrorType } from './errors';

/**
 * Payer information from PayPal
 */
export interface PayerInfo {
    email: string;
    name: string;
    phone?: string;
}

/**
 * Transaction details from PayPal capture
 */
export interface TransactionDetails {
    transactionId: string; // PayPal order ID
    payerId: string;
    payerEmail: string;
    payerName: string;
    amount: string;
    currency: string;
    status: string;
    createTime?: string;
    updateTime?: string;
}

/**
 * Capture response
 */
export interface CaptureOrderResponse {
    success: boolean;
    transactionDetails: TransactionDetails;
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(orderId: string): Promise<any> {
    try {
        const request = new Orders.OrdersGetRequest(orderId);
        const response = await paypalClient.execute(request as any);

        if (response.statusCode !== 200) {
            throw new PayPalError(
                `Failed to get order details: ${response.statusCode}`,
                PayPalErrorType.API_ERROR,
                'Could not retrieve order details. Please try again.'
            );
        }

        return response.result;
    } catch (error: any) {
        if (error instanceof PayPalError) {
            throw error;
        }

        console.error('[PayPal] Error getting order details:', error.message);
        throw new PayPalError(
            error.message || 'Unknown error getting order details',
            PayPalErrorType.API_ERROR,
            'Could not retrieve order details. Please try again.'
        );
    }
}

/**
 * Verify PayPal order status before capture
 */
export async function verifyOrderStatus(orderId: string): Promise<string> {
    try {
        const orderData = await getPayPalOrderDetails(orderId);

        const status = orderData?.status;

        if (!status) {
            throw new PayPalError(
                'No status in order data',
                PayPalErrorType.API_ERROR,
                'Order status not found. Please try again.'
            );
        }

        // Valid statuses: CREATED, APPROVED, FAILED, COMPLETED, EXPIRED, PAYER_ACTION_REQUIRED
        const validStatuses = ['CREATED', 'APPROVED', 'FAILED', 'COMPLETED', 'VOIDED', 'PAYER_ACTION_REQUIRED'];
        if (!validStatuses.includes(status)) {
            console.warn('[PayPal] Unexpected order status:', status);
        }

        console.log('[PayPal] Order status verified:', status);
        return status;
    } catch (error) {
        if (error instanceof PayPalError) {
            throw error;
        }
        throw new PayPalError(
            'Error verifying order status',
            PayPalErrorType.API_ERROR,
            'Could not verify order status. Please try again.'
        );
    }
}

/**
 * Capture a PayPal order
 * 
 * This finalizes an approved PayPal order and captures the payment.
 * 
 * @param orderId - PayPal order ID to capture
 * @returns Transaction details needed for order creation
 * @throws PayPalError if capture fails
 * 
 * @example
 * const result = await capturePayPalOrder('PAY-123456');
 * // Returns: { success: true, transactionDetails: { ... } }
 */
export async function capturePayPalOrder(orderId: string): Promise<CaptureOrderResponse> {
    try {
        // First verify the order exists and is approvable
        const orderData = await getPayPalOrderDetails(orderId);

        if (!orderData) {
            throw new PayPalError(
                'Order not found',
                PayPalErrorType.API_ERROR,
                'PayPal order not found. Please try again.'
            );
        }

        // Create capture request
        const request = new Orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        request.prefer('return=representation');

        console.log('[PayPal] Capturing order:', orderId);
        const response = await paypalClient.execute(request as any);

        if (response.statusCode !== 201) {
            throw new PayPalError(
                `Capture returned status ${response.statusCode}`,
                PayPalErrorType.CAPTURE_ERROR,
                'Payment capture failed. Please try again.'
            );
        }

        const captureData = response.result as any;

        // Verify capture was successful
        if (captureData.status !== 'COMPLETED') {
            console.warn('[PayPal] Unexpected capture status:', captureData.status);
            throw new PayPalError(
                `Capture completed with unexpected status: ${captureData.status}`,
                PayPalErrorType.CAPTURE_ERROR,
                'Payment processing failed. Please contact support.'
            );
        }

        // Extract transaction details from captured order
        const purchaseUnit = captureData.purchase_units?.[0];
        const captures = purchaseUnit?.payments?.captures || [];
        const capture = captures[0];

        if (!capture?.id) {
            throw new PayPalError(
                'No capture transaction ID',
                PayPalErrorType.CAPTURE_ERROR,
                'Payment was processed but we could not confirm it. Please contact support.'
            );
        }

        // Extract payer information
        const payerInfo = captureData.payer || {};
        const payerName = payerInfo.name?.full_name
            || `${payerInfo.name?.given_name || ''} ${payerInfo.name?.surname || ''}`.trim()
            || 'Unknown Payer';

        const transactionDetails: TransactionDetails = {
            transactionId: capture.id, // Use the actual capture transaction ID
            payerId: payerInfo.payer_id || orderId, // Use order ID as fallback
            payerEmail: payerInfo.email_address || 'unknown@paypal.com',
            payerName: payerName,
            amount: capture.amount?.value || purchaseUnit?.amount?.value || '0',
            currency: capture.amount?.currency_code || purchaseUnit?.amount?.currency_code || 'OMR',
            status: capture.status || 'COMPLETED',
            createTime: captureData.create_time,
            updateTime: captureData.update_time,
        };

        console.log('[PayPal] Order captured successfully:', {
            orderId,
            transactionId: transactionDetails.transactionId,
            amount: transactionDetails.amount,
        });

        return {
            success: true,
            transactionDetails,
        };
    } catch (error: any) {
        if (error instanceof PayPalError) {
            throw error;
        }

        console.error('[PayPal] Error capturing order:', {
            message: error.message,
            statusCode: error.statusCode,
            body: error.body,
        });

        throw new PayPalError(
            error.message || 'Unknown capture error',
            PayPalErrorType.CAPTURE_ERROR,
            'Payment capture failed. Please try again or contact support.',
            { originalError: error.message }
        );
    }
}