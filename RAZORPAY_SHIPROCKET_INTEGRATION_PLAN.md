# Razorpay + Shiprocket Integration Plan

This document captures the full survey of the Novino repo and a step-by-step plan to integrate Razorpay payments with Shiprocket fulfillment, while keeping changes minimal and beginner friendly.

---

## 1. Project Survey

| Capability | Files / Routes | Notes |
| --- | --- | --- |
| **Cart UI + logic** | `app/cart/page.tsx`, `app/cart/address/page.tsx`, `contexts/CartContext.tsx`, `components/ui/cart-drawer.tsx` | LocalStorage selections, fetches `/api/addresses` |
| **Checkout CTA** | `app/cart/page.tsx` → `/checkout` | No payment gateway yet |
| **Checkout UI** | `app/checkout/page.tsx` | Simulated methods (UPI/COD/etc) |
| **Order APIs** | `pages/api/orders/index.ts`, `pages/api/orders/[id].ts`, `pages/api/admin/orders.ts` | Pages Router handlers (server-only) |
| **Models** | `models/Order.ts`, `models/Cart.ts`, `models/Address.ts` | Need Payment + Shipment models |
| **Admin / Dashboard** | `app/dashboard/page.tsx` (general), `app/dashboard/users/page.tsx`, `/api/admin/orders` | No dedicated order tracking UI yet |
| **Customer Orders Page** | `app/profile/page.tsx` | Lists orders, lacks tracking timeline |

### Router usage

- **App Router:** All `/app/**` pages (cart, checkout, profile, dashboard, etc.).
- **Pages Router:** Legacy APIs in `/pages/api/**` (orders, cart, auth).
- **Evidence:** `app/cart/page.tsx` uses `use client`, while `pages/api/orders/index.ts` exports a classic handler.

### Environment variables

- `lib/db.ts` expects `MONGODB_URI`.
- `lib/auth.ts` uses `JWT_SECRET`.
- No Razorpay / Shiprocket vars yet; we will add:
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
  - `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_CHANNEL_ID`, `SHIPROCKET_WEBHOOK_SECRET`
- Keep all secrets server-side (only optional `NEXT_PUBLIC_RAZORPAY_KEY_ID` if you must expose key to client).

### Clean-up / Simplification Targets

- Duplicate address fetch logic in cart vs address page.
- Checkout totals re-implemented; consider helper later (not mandatory now).
- Empty folders (e.g., `components/blog/`) can be ignored for this integration.
- Minimal hotspots listed below.

---

## 2. Minimal Hotspot File List

| Path | Action | Purpose |
| --- | --- | --- |
| `lib/services/razorpay.ts` | **Add** | Encapsulate Razorpay SDK + signature helpers |
| `lib/services/shiprocket.ts` | **Add** | Shiprocket auth, shipment, pickup, tracking |
| `models/Payment.ts` | **Add** | Store Razorpay payment metadata |
| `models/Shipment.ts` | **Add** | Store Shiprocket ids + tracking timeline |
| `models/Order.ts` | **Update** | Add payment/shipment references + timeline |
| `pages/api/orders/index.ts` | **Update** | Align statuses with new enums (or deprecate POST) |
| `app/api/payments/razorpay-order/route.ts` | **Add** | Server endpoint to create Razorpay order |
| `app/api/payments/razorpay-verify/route.ts` | **Add** | Verify Razorpay signature → create payment + shipment |
| `app/api/webhooks/razorpay/route.ts` | **Add** | Handle Razorpay async events |
| `app/api/webhooks/shiprocket/route.ts` | **Add** | Handle Shiprocket tracking webhooks |
| `app/api/shipments/[orderId]/route.ts` | **Add** | Fetch cached tracking + optional refresh |
| `app/checkout/page.tsx` | **Update** | Replace fake confirm button with Razorpay Checkout |
| `components/orders/tracking-timeline.tsx` | **Add** | Reusable timeline UI |
| `app/profile/page.tsx` | **Update** | Fetch shipment data + display timeline |
| `app/dashboard/orders/page.tsx` | **Add** | Simple admin order tracking view |

---

## 3. Patch-Style Snippets

> Copy/paste each chunk into the indicated file (create file if missing). All snippets are TypeScript unless noted.

<details>
<summary><strong>lib/services/razorpay.ts</strong> (server)</summary>

```ts
import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!keyId || !keySecret) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.');
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

export async function createRazorpayOrder({ amountInPaise, receipt, notes }: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
    payment_capture: 1,
  });
}

export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const generated = crypto
    .createHmac('sha256', keySecret!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return generated === razorpaySignature;
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null) {
  if (!webhookSecret || !signature) return false;
  const digest = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return digest === signature;
}

export function getRazorpayPublicKey() {
  return keyId;
}
```

</details>

<details>
<summary><strong>lib/services/shiprocket.ts</strong> (server)</summary>

```ts
import crypto from 'crypto';

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
const channelId = process.env.SHIPROCKET_CHANNEL_ID;

type TokenCache = { token: string | null; expiresAt: number };
const tokenCache: TokenCache = { token: null, expiresAt: 0 };

async function ensureToken(force = false) { ... }           // (same as earlier answer)
async function shiprocketFetch<T>(path: string, init: RequestInit = {}, force = false) { ... }

export async function createShiprocketShipment(payload: ShiprocketOrderPayload) { ... }
export async function scheduleShiprocketPickup(shipmentId: number, pickupDate?: string) { ... }
export async function fetchShiprocketTracking(shipmentId: number) { ... }

export function verifyShiprocketWebhook(rawBody: string, signature: string | null) { ... }
```

(Fill in `...` with the exact bodies from the previous patch.)

</details>

<details>
<summary><strong>models/Payment.ts</strong> (server, Mongo)</summary>

```ts
import mongoose, { Schema, Document } from 'mongoose';

const PaymentSchema = new Schema({
  orderId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  gateway: { type: String, enum: ['razorpay'], default: 'razorpay' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['requires_confirmation', 'paid', 'failed', 'refunded'], default: 'requires_confirmation' },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  method: String,
  capturedAt: Date,
  failureReason: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
```

</details>

<details>
<summary><strong>models/Shipment.ts</strong></summary>

```ts
import mongoose, { Schema } from 'mongoose';

const TrackingEventSchema = new Schema({
  status: { type: String, required: true },
  location: String,
  remarks: String,
  recordedAt: { type: Date, default: Date.now },
});

const ShipmentSchema = new Schema({
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
}, { timestamps: true });

export default mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
```

</details>

<details>
<summary><strong>models/Order.ts</strong> (partial diff)</summary>

```
paymentMethod: 'cod' | 'card' | 'upi' | 'wallet' | 'netbanking' | 'razorpay';
paymentStatus: 'requires_payment' | 'pending' | 'paid' | 'failed' | 'refunded';
razorpayOrderId?: string;
paymentId?: Schema.Types.ObjectId;
shipmentId?: Schema.Types.ObjectId;
statusTimeline: [{ status: string; note?: string; at: Date }];
```

</details>

<details>
<summary><strong>app/api/payments/razorpay-order/route.ts</strong></summary>

```ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { createRazorpayOrder, getRazorpayPublicKey } from '@/lib/services/razorpay';

export async function POST(req: NextRequest) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const user = verifyToken(token);
  await connectToDatabase();

  const body = await req.json();
  const { items, subtotal, gst, shippingCost = 0, total, deliveryAddress, giftWrap } = body;

  if (!items?.length || !deliveryAddress) {
    return NextResponse.json({ message: 'Missing items or address' }, { status: 400 });
  }

  const order = await Order.create({
    userId: user.userId,
    items,
    subtotal,
    gst,
    shippingCost,
    total,
    deliveryAddress,
    paymentMethod: 'razorpay',
    paymentStatus: 'requires_payment',
    orderStatus: 'pending',
    giftWrap: !!giftWrap,
    statusTimeline: [{ status: 'pending', note: 'Awaiting Razorpay payment', at: new Date() }],
  });

  const razorpayOrder = await createRazorpayOrder({
    amountInPaise: Math.round(total * 100),
    receipt: order.orderNumber ?? order._id.toString(),
    notes: { orderId: order._id.toString(), userId: user.userId },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return NextResponse.json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: getRazorpayPublicKey(),
    customer: {
      name: deliveryAddress.name,
      email: user.email,
      contact: deliveryAddress.phone ?? '',
    },
  }, { status: 201 });
}
```

</details>

<details>
<summary><strong>app/api/payments/razorpay-verify/route.ts</strong></summary>

```ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Shipment from '@/models/Shipment';
import { verifyPaymentSignature } from '@/lib/services/razorpay';
import { createShiprocketShipment, scheduleShiprocketPickup } from '@/lib/services/shiprocket';

export async function POST(req: NextRequest) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = await req.json();
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ message: 'Missing Razorpay payload' }, { status: 400 });
  }

  if (!verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
    return NextResponse.json({ message: 'Signature mismatch' }, { status: 400 });
  }

  await connectToDatabase();
  const order = await Order.findById(orderId);
  if (!order || order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  const payment = await Payment.create({
    orderId: order._id,
    userId: order.userId,
    amount: order.total,
    currency: 'INR',
    status: 'paid',
    razorpayOrderId,
    razorpayPaymentId,
    method: paymentMethod,
    capturedAt: new Date(),
  });

  order.paymentId = payment._id;
  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.statusTimeline.push({ status: 'payment_confirmed', note: 'Razorpay payment verified', at: new Date() });

  const shipmentResponse = await createShiprocketShipment({
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    paymentMethod: 'PREPAID',
    total: order.total,
    deliveryAddress: {
      name: order.deliveryAddress.name,
      phone: payment.metadata?.phone ?? '',
      addressLine1: order.deliveryAddress.line1,
      addressLine2: order.deliveryAddress.line2,
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      pincode: order.deliveryAddress.pincode,
    },
    items: order.items.map((item) => ({
      name: item.name,
      sku: item.productId,
      units: item.quantity,
      sellingPrice: item.price,
    })),
  });

  const pickup = await scheduleShiprocketPickup(shipmentResponse.shipment_id);

  const shipment = await Shipment.create({
    orderId: order._id,
    userId: order.userId,
    shiprocketOrderId: shipmentResponse.order_id,
    shiprocketShipmentId: shipmentResponse.shipment_id,
    courierName: shipmentResponse.courier_company,
    awbCode: shipmentResponse.awb_code,
    trackingUrl: shipmentResponse.tracking_url,
    status: 'processing',
    pickupScheduledFor: pickup?.pickup_scheduled_date ? new Date(pickup.pickup_scheduled_date) : undefined,
    trackingEvents: [{ status: 'processing', remarks: 'Shipment created in Shiprocket', recordedAt: new Date() }],
  });

  order.shipmentId = shipment._id;
  order.statusTimeline.push({ status: 'processing', note: 'Shipment created & pickup scheduled', at: new Date() });
  await order.save();

  return NextResponse.json({ order, payment, shipment });
}
```

</details>

<details>
<summary><strong>app/api/webhooks/razorpay/route.ts</strong></summary>

```ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import { verifyRazorpayWebhook } from '@/lib/services/razorpay';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  if (!verifyRazorpayWebhook(rawBody, signature)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payload = event.payload?.payment?.entity;
  if (!payload) return NextResponse.json({ ok: true });

  await connectToDatabase();
  const payment = await Payment.findOne({ razorpayOrderId: payload.order_id });
  if (!payment) return NextResponse.json({ ok: true });

  if (event.event === 'payment.failed') {
    payment.status = 'failed';
    payment.failureReason = payload.error_description;
    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'failed';
      order.statusTimeline.push({ status: 'payment_failed', note: payload.error_description, at: new Date() });
      await order.save();
    }
  }

  return NextResponse.json({ ok: true });
}
```

</details>

<details>
<summary><strong>app/api/webhooks/shiprocket/route.ts</strong></summary>

```ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Shipment from '@/models/Shipment';
import Order from '@/models/Order';
import { verifyShiprocketWebhook } from '@/lib/services/shiprocket';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-shiprocket-signature');
  if (!verifyShiprocketWebhook(rawBody, signature)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  await connectToDatabase();

  const shipment = await Shipment.findOne({ shiprocketShipmentId: payload.shipment_id });
  if (!shipment) return NextResponse.json({ ok: true });

  shipment.status = payload.current_status;
  shipment.trackingEvents.push({
    status: payload.current_status,
    location: payload.current_location,
    remarks: payload.remark,
    recordedAt: new Date(payload.updated_at || Date.now()),
  });
  await shipment.save();

  const order = await Order.findById(shipment.orderId);
  if (order) {
    if (payload.current_status === 'DELIVERED') order.orderStatus = 'delivered';
    order.statusTimeline.push({ status: payload.current_status.toLowerCase(), note: payload.remark, at: new Date() });
    await order.save();
  }

  return NextResponse.json({ ok: true });
}
```

</details>

<details>
<summary><strong>app/api/shipments/[orderId]/route.ts</strong></summary>

```ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Shipment from '@/models/Shipment';
import { fetchShiprocketTracking } from '@/lib/services/shiprocket';

interface Params { params: { orderId: string } }

export async function GET(req: NextRequest, { params }: Params) {
  await connectToDatabase();
  const shipment = await Shipment.findOne({ orderId: params.orderId });
  if (!shipment) return NextResponse.json({ message: 'Shipment not found' }, { status: 404 });

  if (req.nextUrl.searchParams.get('refresh') === 'true') {
    const latest = await fetchShiprocketTracking(shipment.shiprocketShipmentId);
    const list = latest?.tracking_data?.shipment_track?.activities || [];
    if (list.length) {
      shipment.trackingEvents = list.map((activity: any) => ({
        status: activity.activity,
        location: activity.location,
        remarks: activity.remarks,
        recordedAt: new Date(activity.date),
      }));
      shipment.status = latest.current_status;
      await shipment.save();
    }
  }

  return NextResponse.json({ shipment });
}
```

</details>

<details>
<summary><strong>components/orders/tracking-timeline.tsx</strong></summary>

```tsx
"use client";

export default function TrackingTimeline({ events = [] }: { events: { status: string; recordedAt: string; location?: string; remarks?: string; }[] }) {
  if (!events.length) return <p className="text-sm text-muted-foreground">Tracking not available yet.</p>;

  const sorted = [...events].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  return (
    <ol className="relative border-l border-muted-foreground/40 pl-4 space-y-4">
      {sorted.map((event, index) => (
        <li key={index} className="ml-2">
          <div className="absolute -left-2 top-1.5 h-3 w-3 rounded-full bg-[#AE876D]" />
          <p className="text-sm font-medium">{event.status}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.recordedAt).toLocaleString()}
            {event.location ? ` · ${event.location}` : ''}
          </p>
          {event.remarks && <p className="text-xs mt-1">{event.remarks}</p>}
        </li>
      ))}
    </ol>
  );
}
```

</details>

<details>
<summary><strong>app/checkout/page.tsx</strong> (client Razorpay flow)</summary>

```tsx
const handleConfirmOrder = async () => {
  ...
  const orderResponse = await fetch('/api/payments/razorpay-order', { method: 'POST', body: JSON.stringify(orderData) });
  const gateway = await orderResponse.json();

  if (!(window as any).Razorpay) {
    await loadExternalScript('https://checkout.razorpay.com/v1/checkout.js');
  }

  const options = {
    key: gateway.key,
    amount: gateway.amount,
    currency: gateway.currency,
    order_id: gateway.razorpayOrderId,
    name: 'Novino',
    description: `Order #${gateway.orderId}`,
    handler: async (response: any) => {
      const verifyRes = await fetch('/api/payments/razorpay-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: gateway.orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          paymentMethod: selectedPayment,
        }),
      });
      if (!verifyRes.ok) { ...toast error...; return; }
      ...toast success + redirect...
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
```

</details>

<details>
<summary><strong>app/profile/page.tsx</strong> (timeline snippet)</summary>

```tsx
import TrackingTimeline from "@/components/orders/tracking-timeline";

const [shipments, setShipments] = useState<Record<string, Shipment>>({});

const hydrateShipment = async (orderId: string) => {
  if (shipments[orderId]) return;
  const res = await fetch(`/api/shipments/${orderId}`);
  if (res.ok) {
    const data = await res.json();
    setShipments(prev => ({ ...prev, [orderId]: data.shipment }));
  }
};

...
<Button onClick={() => { setSelectedOrder(order); hydrateShipment(order._id); }}>
  View Details
</Button>
...
{selectedOrder && (
  <div className="rounded-md border p-4">
    <div className="flex items-center justify-between mb-3">
      <p className="font-semibold">{shipments[selectedOrder._id]?.status ?? 'Processing'}</p>
      {shipments[selectedOrder._id]?.trackingUrl && (
        <Link href={shipments[selectedOrder._id].trackingUrl!} target="_blank" className="text-sm text-[#AE876D]">
          Open tracking
        </Link>
      )}
    </div>
    <TrackingTimeline events={shipments[selectedOrder._id]?.trackingEvents ?? []} />
  </div>
)}
```

</details>

<details>
<summary><strong>app/dashboard/orders/page.tsx</strong></summary>

```tsx
"use client";
import { useState, useEffect } from "react";
import TrackingTimeline from "@/components/orders/tracking-timeline";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [shipment, setShipment] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/orders').then(res => res.json()).then(data => setOrders(data.orders ?? []));
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    fetch(`/api/shipments/${selectedOrder._id}?refresh=true`).then(res => res.json()).then(data => setShipment(data.shipment));
  }, [selectedOrder]);

  ...
}
```

</details>

---

## 4. DB Schema Summary (Prisma-style pseudocode)

```prisma
model Order {
  paymentMethod   String @enum(["cod","card","upi","wallet","netbanking","razorpay"])
  paymentStatus   String @enum(["requires_payment","pending","paid","failed","refunded"])
  razorpayOrderId String?
  paymentId       ObjectId? @relation(fields: [paymentId], references: [id])
  shipmentId      ObjectId? @relation(fields: [shipmentId], references: [id])
  statusTimeline  StatusEvent[]
}

model Payment {
  orderId          String
  userId           String
  razorpayOrderId  String @unique
  razorpayPaymentId String?
  status           String
}

model Shipment {
  orderId             String
  shiprocketOrderId   Int @unique
  shiprocketShipmentId Int @unique
  trackingEvents      TrackingEvent[]
}
```

(Replace with actual Mongoose schemas above.)

---

## 5. Sequence of Events

1. Customer selects items → `/checkout`.
2. Client POST `/api/payments/razorpay-order`.
3. Server creates Mongo `Order` + Razorpay order.
4. Client opens Razorpay Checkout (paise amounts).
5. Razorpay success: client POST `/api/payments/razorpay-verify`.
6. Server verifies HMAC → saves `Payment` → updates `Order`.
7. Server creates Shiprocket shipment + schedules pickup.
8. `Shipment` saved; `/api/shipments/:orderId` surfaces timeline.
9. Webhooks (Razorpay + Shiprocket) keep data in sync.
10. UI (profile + admin) fetch orders + shipments to display statuses.

Example payloads are identical to the ones listed in the previous response.

---

## 6. Testing Checklist

- `curl POST /api/payments/razorpay-order` with sample cart → expect 201.
- Use Razorpay test key to open checkout; confirm payment in test mode.
- `curl POST /api/payments/razorpay-verify` with generated signature (use Node `crypto.createHmac`).
- Trigger Razorpay webhook (dashboard) → ensure `/api/webhooks/razorpay` updates records.
- Trigger Shiprocket webhook (sandbox) → `/api/webhooks/shiprocket` should append timeline.
- `curl /api/shipments/:orderId?refresh=true` → confirm remote tracking ingest.
- UI smoke test: Checkout → Payment success → Profile orders list shows timeline.

Sample secrets (test mode):

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_test
SHIPROCKET_EMAIL=test@example.com
SHIPROCKET_PASSWORD=testpass
SHIPROCKET_CHANNEL_ID=123456
SHIPROCKET_WEBHOOK_SECRET=shipwhsec
```

---

## 7. Deployment Checklist + Gotchas

- Ensure env vars are set in Vercel / server before deploying.
- Keep Razorpay keys server-side; only pass `key_id` to client at runtime.
- Verify raw body parsing for webhooks (App Router `req.text()`).
- Shiprocket API has rate limits; only call `refresh=true` for manual refreshes/admin page.
- Razorpay uses paise (multiply INR by 100). Shiprocket expects kg/cm.
- Pickup location string must match Shiprocket panel configuration.
- Add logging for webhook failures; consider queue/retry if traffic grows.
- COD variant: keep legacy `/api/orders` for COD until new flow ready.

---

## 8. Step-by-Step Runbook (Beginner Friendly)

1. **Copy this file** somewhere handy for reference.
2. **Install SDK:** `npm install razorpay`.
3. **Create service files** (`lib/services/razorpay.ts`, `lib/services/shiprocket.ts`) using snippets above.
4. **Add Mongo models** for `Payment` and `Shipment`; update `Order` schema.
5. **Implement API routes** under `app/api/payments/**`, `app/api/webhooks/**`, `app/api/shipments/[orderId]`.
6. **Update checkout page** to use Razorpay Checkout script.
7. **Add tracking component** and integrate into `app/profile/page.tsx`.
8. **(Optional) Add admin orders page** in `app/dashboard/orders/page.tsx`.
9. **Set env vars** (`.env`, Vercel dashboard).
10. **Run local tests:** `npm run dev`, walk through test payment using Razorpay sandbox keys.
11. **Configure Razorpay webhook** to `https://<domain>/api/webhooks/razorpay`.
12. **Configure Shiprocket webhook** to `https://<domain>/api/webhooks/shiprocket`.
13. **Deploy** and repeat test checkout in production test mode before switching to live keys.

You now have a minimal, well-scoped plan to integrate Razorpay + Shiprocket without touching unrelated parts of the codebase. Happy building!

