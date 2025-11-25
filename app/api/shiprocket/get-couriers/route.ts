/**
 * API Route: Get Available Couriers for Order
 * POST /api/shiprocket/get-couriers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceability } from '@/lib/shiprocket/orders';
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

        // Fetch order from Supabase
        const supabase = getSupabaseServiceRoleClient();
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const address = order.delivery_address || {};
        const warehousePincode = process.env.SHIPROCKET_WAREHOUSE_PINCODE || '410210';

        // Get available couriers with rates
        const serviceability = await getServiceability({
            pickup_postcode: warehousePincode,
            delivery_postcode: address.pincode,
            weight: 0.5, // You can calculate actual weight from order items
            cod: order.payment_status === 'paid' ? 0 : 1,
        });

        const couriers = serviceability.data.available_courier_companies;

        if (!couriers || couriers.length === 0) {
            return NextResponse.json(
                { error: 'No couriers available for this route' },
                { status: 400 }
            );
        }

        // Sort by rate (cheapest first)
        couriers.sort((a, b) => a.rate - b.rate);

        return NextResponse.json({
            success: true,
            couriers: couriers.map(c => ({
                id: c.courier_company_id,
                name: c.courier_name,
                rate: c.rate,
                estimated_delivery_days: c.estimated_delivery_days,
                freight_charge: c.freight_charge,
                cod_charges: c.cod_charges,
                rating: c.rating,
            })),
        });

    } catch (error: any) {
        console.error('Get couriers error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get couriers' },
            { status: 500 }
        );
    }
}
