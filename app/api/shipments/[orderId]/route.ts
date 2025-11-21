import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';
import { fetchShiprocketTracking } from '@/lib/services/shiprocket';

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  const supabase = getSupabaseServiceRoleClient();

  // Find shipment by order ID
  const { data: shipment } = await supabase
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (!shipment) {
    return NextResponse.json({ message: 'Shipment not found' }, { status: 404 });
  }

  // Refresh tracking data if requested
  if (req.nextUrl.searchParams.get('refresh') === 'true') {
    try {
      const latest = await fetchShiprocketTracking(shipment.shiprocket_shipment_id);
      const activities = latest?.tracking_data?.shipment_track?.activities || [];

      if (activities.length) {
        const trackingEvents = activities.map((activity: any) => ({
          status: activity.activity,
          location: activity.location,
          remarks: activity.remarks,
          recordedAt: new Date(activity.date).toISOString(),
        }));

        await supabase
          .from('shipments')
          .update({
            status: latest.current_status?.toLowerCase() || shipment.status,
            metadata: {
              ...shipment.metadata,
              tracking_events: trackingEvents,
            },
          })
          .eq('id', shipment.id);
      }
    } catch (error) {
      console.error('Failed to refresh Shiprocket tracking', error);
    }
  }

  // Fetch updated shipment
  const { data: updatedShipment } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', shipment.id)
    .single();

  return NextResponse.json({ shipment: updatedShipment });
}
