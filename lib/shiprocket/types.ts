/**
 * Shiprocket Order Types
 * Based on official Shiprocket API documentation
 */

export interface ShiprocketOrder {
    id: number;
    order_id: string;
    order_date: string;
    pickup_location: string;
    channel_id: string;
    comment: string;
    billing_customer_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_address_2: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_address_2: string;
    shipping_city: string;
    shipping_pincode: string;
    shipping_country: string;
    shipping_state: string;
    shipping_email: string;
    shipping_phone: string;
    order_items: ShiprocketOrderItem[];
    payment_method: 'Prepaid' | 'COD';
    shipping_charges: number;
    giftwrap_charges: number;
    transaction_charges: number;
    total_discount: number;
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
    status: string;
    status_code: number;
    awb_code?: string;
    courier_name?: string;
    courier_company_id?: number;
    shipments?: ShiprocketShipment[];
}

export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount: number;
    tax: number;
    hsn: number;
}

export interface ShiprocketShipment {
    id: number;
    shipment_id: string;
    order_id: string;
    awb_code: string;
    courier_company_id: number;
    courier_name: string;
    status: string;
    status_code: number;
    pickup_scheduled_date: string;
    delivered_date?: string;
    weight: number;
    packages: number;
    current_status: string;
    tracking_data?: ShiprocketTracking[];
}

export interface ShiprocketTracking {
    id: number;
    awb_code: string;
    courier_company_id: number;
    shipment_status: string;
    shipment_track: ShiprocketTrackingActivity[];
    shipment_track_activities: ShiprocketTrackingActivity[];
    track_url: string;
    etd: string;
}

export interface ShiprocketTrackingActivity {
    date: string;
    status: string;
    activity: string;
    location: string;
    'sr-status': string;
    'sr-status-label': string;
}

export interface CreateOrderRequest {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    order_items: ShiprocketOrderItem[];
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

export interface CourierServiceability {
    courier_company_id: number;
    courier_name: string;
    delivery_performance: number;
    estimated_delivery_days: string;
    freight_charge: number;
    rate: number;
    cod_charges: number;
    is_surface: boolean;
    pickup_availability: string;
    delivery_availability: string;
}

export interface ShipmentCreationResponse {
    shipment_id: number;
    status: string;
    status_code: number;
    onboarding_completed_now: number;
    awb_code: string;
    courier_company_id: number;
    courier_name: string;
}
