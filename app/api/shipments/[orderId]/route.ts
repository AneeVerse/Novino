import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Shipment from '@/models/Shipment';
import { fetchShiprocketTracking } from '@/lib/services/shiprocket';

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  await connectToDatabase();
  const shipment = await Shipment.findOne({ orderId });
  if (!shipment) {
    return NextResponse.json({ message: 'Shipment not found' }, { status: 404 });
  }

  if (req.nextUrl.searchParams.get('refresh') === 'true') {
    try {
      const latest = await fetchShiprocketTracking(shipment.shiprocketShipmentId);
      const activities = latest?.tracking_data?.shipment_track?.activities || [];
      if (activities.length) {
        shipment.trackingEvents = activities.map((activity: any) => ({
          status: activity.activity,
          location: activity.location,
          remarks: activity.remarks,
          recordedAt: new Date(activity.date),
        }));
        shipment.status = latest.current_status || shipment.status;
        await shipment.save();
      }
    } catch (error) {
      console.error('Failed to refresh Shiprocket tracking', error);
    }
  }

  return NextResponse.json({ shipment });
}


