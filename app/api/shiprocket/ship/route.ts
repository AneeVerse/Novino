/**
 * API Route: Create Order in Shiprocket
 * POST /api/shiprocket/ship
 * 
 * Creates order in Shiprocket (courier assignment done manually from dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/shiprocket/orders';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Step 1: Fetch order from Supabase
        const supabase = getSupabaseServiceRoleClient();
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found in database' },
                { status: 404 }
            );
        }

        // Step 2: Get delivery address
        const address = order.delivery_address || {};

        if (!address.pincode) {
            return NextResponse.json(
                { error: 'Order missing delivery pincode' },
                { status: 400 }
            );
        }

        // Step 3: Create order in Shiprocket
        const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

        console.log('Creating Shiprocket order:', {
            order_number: order.order_number,
            pickup_location: pickupLocation,
            delivery_pincode: address.pincode,
        });

        const shiprocketOrderResponse = await createOrder({
            order_id: order.order_number,
            order_date: new Date(order.created_at).toISOString().split('T')[0],
            pickup_location: pickupLocation,
            billing_customer_name: address.name || 'Customer',
            billing_last_name: '',
            billing_address: address.line1 || '',
            billing_city: address.city || '',
            billing_pincode: address.pincode,
            billing_state: address.state || '',
            billing_country: 'India',
            billing_email: address.email || 'noreply@novino.com',
            billing_phone: address.phone || '9999999999',
            shipping_is_billing: true,
            order_items: (order.items || []).map((item: any) => ({
                name: item.name,
                sku: item.productId || item.id,
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 0,
            })),
            payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
            sub_total: order.total,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5,
        });

        console.log('Shiprocket response:', shiprocketOrderResponse);

        // Check if order creation was successful
        if (!shiprocketOrderResponse.order_id || !shiprocketOrderResponse.shipment_id) {
            return NextResponse.json(
                {
                    error: 'Failed to create Shiprocket order',
                    details: shiprocketOrderResponse,
                },
                { status: 400 }
            );
        }

        // Step 4: Save to Supabase
        await supabase.from('shipments').insert({
            order_id: order.id,
            shiprocket_order_id: shiprocketOrderResponse.order_id,
            shiprocket_shipment_id: shiprocketOrderResponse.shipment_id,
            status: 'CREATED',
            courier_name: 'Pending Assignment',
            metadata: {
                created_at: new Date().toISOString(),
                message: 'Order created successfully',
            },
        });

        return NextResponse.json({
            success: true,
            order_id: shiprocketOrderResponse.order_id,
            shipment_id: shiprocketOrderResponse.shipment_id,
            message: '✅ Order created in Shiprocket! Now assign courier from Shiprocket dashboard.',
            instructions: 'Login to Shiprocket → Orders → Find this order → Click "Ready to Ship" → Assign Courier',
        });

    } catch (error: any) {
        console.error('Shiprocket ship error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create shipment' },
            { status: 500 }
        );
    }
}
