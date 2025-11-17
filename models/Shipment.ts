import mongoose, { Schema, Document } from 'mongoose';

interface TrackingEvent {
  status: string;
  location?: string;
  remarks?: string;
  recordedAt: Date;
}

export interface IShipment extends Document {
  orderId: string;
  userId: string;
  shiprocketOrderId: number;
  shiprocketShipmentId: number;
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  status: string;
  pickupScheduledFor?: Date;
  trackingEvents: TrackingEvent[];
}

const TrackingEventSchema = new Schema<TrackingEvent>({
  status: { type: String, required: true },
  location: String,
  remarks: String,
  recordedAt: { type: Date, default: Date.now },
});

const ShipmentSchema = new Schema<IShipment>(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    shiprocketOrderId: { type: Number, required: true, unique: true },
    shiprocketShipmentId: { type: Number, required: true, unique: true },
    courierName: String,
    awbCode: String,
    trackingUrl: String,
    status: { type: String, default: 'processing' },
    pickupScheduledFor: Date,
    trackingEvents: [TrackingEventSchema],
  },
  { timestamps: true }
);

const Shipment = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);

export default Shipment;


