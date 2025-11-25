/**
 * API Route: Assign Courier and Get AWB
 * POST /api/shiprocket/assign-courier
 */

import { NextRequest, NextResponse } from 'next/server';
import { assignAWB, requestPickup } from '@/lib/shiprocket/orders';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { shipment_id, courier_id } = await request.json();

        if (!shipment_id || !courier_id) {
            return NextResponse.json(
                { error: 'Shipment ID and Courier ID are required' },
                { status: 400 }
            );
        }

        console.log('Assigning courier:', { shipment_id, courier_id });

        // Assign AWB (this deducts money from Shiprocket wallet)
        const shipment = await assignAWB({
            shipment_id,
            courier_id,
        });

        console.log('AWB assigned:', shipment);

        // Request pickup
        await requestPickup(shipment_id);

        // Update in Supabase
        const supabase = getSupabaseServiceRoleClient();
        await supabase
            .from('shipments')
            .update({
                tracking_id: shipment.awb_code,
                courier_name: shipment.courier_name,
                status: 'AWB_ASSIGNED',
                metadata: {
                    awb_assigned_at: new Date().toISOString(),
                    courier_id,
                },
            })
            .eq('shiprocket_shipment_id', shipment_id);

        return NextResponse.json({
            success: true,
            awb_code: shipment.awb_code,
            courier_name: shipment.courier_name,
            message: 'Courier assigned and AWB generated successfully!',
        });

    } catch (error: any) {
        console.error('Assign courier error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to assign courier' },
            { status: 500 }
        );
    }
}
