/**
 * Shiprocket Orders Service
 * Functions to manage orders with Shiprocket API
 */

import { shiprocketRequest } from './client';
import type {
    ShiprocketOrder,
    CreateOrderRequest,
    CourierServiceability,
    ShipmentCreationResponse,
    ShiprocketTracking,
} from './types';

/**
 * Fetch all orders from Shiprocket
 */
export async function fetchOrders(params?: {
    page?: number;
    per_page?: number;
    filter?: string;
}): Promise<{ data: ShiprocketOrder[]; meta: { pagination: any } }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.filter) searchParams.set('filter', params.filter);

    const query = searchParams.toString();
    const endpoint = `/orders${query ? `?${query}` : ''}`;

    return shiprocketRequest<{ data: ShiprocketOrder[]; meta: { pagination: any } }>(endpoint);
}

/**
 * Create a new order in Shiprocket
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<{ order_id: number; shipment_id: number }> {
    return shiprocketRequest('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
}

/**
 * Get courier serviceability and rates for an order
 */
export async function getServiceability(params: {
    pickup_postcode: string;
    delivery_postcode: string;
    weight: number;
    cod: 0 | 1;
}): Promise<{ data: { available_courier_companies: CourierServiceability[] } }> {
    const searchParams = new URLSearchParams({
        pickup_postcode: params.pickup_postcode,
        delivery_postcode: params.delivery_postcode,
        weight: params.weight.toString(),
        cod: params.cod.toString(),
    });

    return shiprocketRequest(`/courier/serviceability?${searchParams.toString()}`);
}

/**
 * Create/Assign AWB (Air Waybill) for shipment
 */
export async function assignAWB(params: {
    shipment_id: number;
    courier_id: number;
}): Promise<ShipmentCreationResponse> {
    return shiprocketRequest('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify({
            shipment_id: params.shipment_id,
            courier_id: params.courier_id,
        }),
    });
}

/**
 * Generate pickup request for shipment
 */
export async function requestPickup(shipment_id: number): Promise<{ pickup_status: number; response: any }> {
    return shiprocketRequest('/courier/generate/pickup', {
        method: 'POST',
        body: JSON.stringify({ shipment_id }),
    });
}

/**
 * Track shipment by AWB code
 */
export async function trackShipment(awb_code: string): Promise<ShiprocketTracking> {
    return shiprocketRequest(`/courier/track/awb/${awb_code}`);
}

/**
 * Cancel shipment
 */
export async function cancelShipment(awb_codes: string[]): Promise<{ message: string }> {
    return shiprocketRequest('/orders/cancel/shipment/awbs', {
        method: 'POST',
        body: JSON.stringify({ awbs: awb_codes }),
    });
}

/**
 * Generate shipping label
 */
export async function generateLabel(shipment_ids: number[]): Promise<{ label_url: string }> {
    return shiprocketRequest('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipment_ids }),
    });
}

/**
 * Generate manifest
 */
export async function generateManifest(shipment_ids: number[]): Promise<{ manifest_url: string }> {
    return shiprocketRequest('/manifests/generate', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipment_ids }),
    });
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<{ data: { balance: number } }> {
    return shiprocketRequest('/account/details/balance');
}
