"use client";

import { useEffect, useState } from "react";
import TrackingTimeline from "@/components/orders/tracking-timeline";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shipmentLoading, setShipmentLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  const loadShipment = (orderId: string, refresh = true) => {
    setShipmentLoading(true);
    fetch(`/api/shipments/${orderId}${refresh ? '?refresh=true' : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setShipment(data?.shipment ?? null))
      .finally(() => setShipmentLoading(false));
  };

  useEffect(() => {
    if (!selectedOrder) return;
    loadShipment(selectedOrder._id);
  }, [selectedOrder]);

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading orders...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`rounded-lg border p-4 cursor-pointer ${
                selectedOrder?._id === order._id ? "border-[#AE876D]" : "border-border"
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
                  <p className="font-medium text-white">{order.user?.email ?? order.userId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground capitalize">{order.orderStatus}</p>
                  <p className="text-lg font-semibold text-[#AE876D]">₹{order.total?.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {order.items?.length ?? 0} item(s) • {order.paymentStatus}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          {!selectedOrder ? (
            <p className="text-sm text-muted-foreground">Select an order to view tracking.</p>
          ) : shipmentLoading ? (
            <p className="text-sm text-muted-foreground">Refreshing tracking...</p>
          ) : !shipment ? (
            <p className="text-sm text-muted-foreground">No shipment found for this order yet.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Courier</p>
                  <p className="font-medium text-white">
                    {shipment.courierName || "Assigning"}
                  </p>
                </div>
                {shipment.trackingUrl && (
                  <Link
                    href={shipment.trackingUrl}
                    target="_blank"
                    className="text-sm text-[#AE876D]"
                  >
                    Tracking link
                  </Link>
                )}
              </div>
              <p className="text-xs text-muted-foreground">AWB: {shipment.awbCode ?? "Pending"}</p>
              <TrackingTimeline events={shipment.trackingEvents ?? []} />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => selectedOrder && loadShipment(selectedOrder._id, true)}
              >
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


