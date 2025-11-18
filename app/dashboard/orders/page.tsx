"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TrackingJourneyCard, {
  type TrackingJourneyEvent,
  type TrackingJourneyCardProps,
} from "@/components/orders/tracking-journey-card";
import { getTrackingPreviewData } from "@/components/orders/mock-tracking-data";
import {
  Search,
  Calendar,
  RefreshCw,
  Truck,
  Package,
  MapPin,
  CreditCard,
  User,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface ShiprocketOrderItem {
  name?: string;
  sku?: string;
  units?: number;
  selling_price?: number | string;
  product_image?: string;
  image?: string;
  image_url?: string;
  item_image?: string;
  [key: string]: unknown;
}

interface ShiprocketOrderLite {
  order_id?: string;
  channel_order_id?: string;
  status?: string;
  created_at?: string;
  order_date?: string;
  payment_method?: string;
  payment_status?: string;
  sub_total?: number | string;
  total?: number | string;
  order_items?: ShiprocketOrderItem[];
  shipments?: Array<{
    awb_code?: string;
    courier_company_name?: string;
    status?: string;
    shipment_mode?: string;
    shipment_type?: string;
    weight?: number | string;
    length?: number | string;
    breadth?: number | string;
    height?: number | string;
    volumetric_weight?: number | string;
  }>;
  pickup_location?: string;
  billing_customer_name?: string;
  billing_address?: string;
  billing_address_2?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_city?: string;
  billing_state?: string;
  billing_pincode?: string;
  shipping_zone?: string;
  shipping_zone_code?: string;
  courier_company_name?: string;
  weight?: number | string;
  length?: number | string;
  breadth?: number | string;
  height?: number | string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_city?: string;
  customer_state?: string;
  customer_pincode?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
  };
  trackingEvents?: TrackingJourneyEvent[];
  trackingUrl?: string;
  pickupScheduledFor?: string;
  shiprocketShipmentId?: number;
  localOrderId?: string;
}

interface ShiprocketOrdersSummary {
  totalOrders: number;
  totalRevenue: number;
  codOrders: number;
  prepaidOrders: number;
  deliveredOrders: number;
  inTransitOrders: number;
  newOrders: number;
  avgOrderValue: number;
  lastSynced: string;
  statusCounts: Record<string, number>;
}

interface ShiprocketOrdersResponse {
  data: ShiprocketOrderLite[];
  summary: ShiprocketOrdersSummary;
  pagination: {
    total?: number;
    count?: number;
    per_page?: number;
    current_page?: number;
    total_pages?: number;
  };
  range: {
    from: string;
    to: string;
  };
}

const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const ORDER_TABS = [
  { label: "New", value: "new", match: ["new", "pending", "awaiting"] },
  { label: "Ready To Ship", value: "ready_to_ship", match: ["ready to ship", "confirmed"] },
  { label: "Pickups & Manifests", value: "pickups", match: ["pickup", "manifest"] },
  { label: "In Transit", value: "in_transit", match: ["in transit", "ship", "dispatched"] },
  { label: "Delivered", value: "delivered", match: ["deliver"] },
  { label: "RTO", value: "rto", match: ["rto", "return", "returned"] },
  { label: "All", value: "all", match: [] },
] as const;

type OrderTabValue = (typeof ORDER_TABS)[number]["value"];

const TRACKING_PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TRACKING_PREVIEW !== "false";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const makeRange = (days: number) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    label: `Last ${days} days`,
  };
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const statusBadgeColor = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("deliver")) return "bg-green-500/15 text-green-300 border-green-400/30";
  if (normalized.includes("ship")) return "bg-blue-500/15 text-blue-300 border-blue-400/30";
  if (normalized.includes("transit")) return "bg-purple-500/15 text-purple-300 border-purple-400/30";
  if (normalized.includes("cancel")) return "bg-red-500/15 text-red-300 border-red-400/30";
  return "bg-white/10 text-white border-white/20";
};

const formatWeight = (value?: number | string) => {
  const weight = toNumber(value);
  if (!weight) return "—";
  return `${weight} Kg`;
};

const formatDimensions = (dimensions: { length?: number | string; breadth?: number | string; height?: number | string }) => {
  const length = toNumber(dimensions.length);
  const breadth = toNumber(dimensions.breadth);
  const height = toNumber(dimensions.height);
  if (!length && !breadth && !height) return "—";
  return `${length || 0} × ${breadth || 0} × ${height || 0} cm`;
};

const buildTrackingCardData = (order: ShiprocketOrderLite): TrackingJourneyCardProps | null => {
  const shipment = order.shipments?.[0];
  const events = order.trackingEvents ?? [];
  const courierName = shipment?.courier_company_name || order.courier_company_name || "Courier partner";
  const statusText = shipment?.status || order.status || "In transit";
  const destinationCity = order.customer?.city || order.billing_city || order.customer_city || "Destination city";
  const destinationState = order.customer?.state || order.billing_state || order.customer_state || "";
  const pickupLabel =
    order.pickup_location ||
    order.billing_address ||
    order.customer?.address ||
    (order.customer_name ? `${order.customer_name} pickup` : "Pickup scheduled");
  const trackingNumber = shipment?.awb_code || order.order_id || order.channel_order_id || "—";

  const dialPhone = order.billing_phone || order.customer?.phone || order.customer_phone;
  const numericPhone = dialPhone?.replace(/\D/g, "");

  const payloadOverrides: Partial<TrackingJourneyCardProps> = {
    trackingNumber,
    courierName,
    statusText,
    summaryLabel: statusText,
    meta: {
      deliveryType: shipment?.shipment_mode || shipment?.shipment_type || "Standard",
      estimate: order.order_date ? formatDate(order.order_date) : "ETA updating",
      weight: formatWeight(shipment?.weight || order.weight),
    },
    stops: [
      {
        label: pickupLabel,
        detail: formatDate(order.created_at),
      },
      {
        label: destinationState ? `${destinationCity}, ${destinationState}` : destinationCity,
        detail: order.billing_pincode || order.customer?.pincode || order.customer_pincode,
      },
    ],
    shipper: {
      name: courierName,
      role: statusText,
      rating: 4.9,
      phone: dialPhone,
      whatsappUrl: numericPhone ? `https://wa.me/91${numericPhone}` : undefined,
      supportUrl: order.trackingUrl,
    },
  };

  if (events.length) {
    return {
      ...payloadOverrides,
      events,
      accentColor: "#0bd88f",
    } as TrackingJourneyCardProps;
  }

  if (!TRACKING_PREVIEW_ENABLED) {
    return null;
  }

  return getTrackingPreviewData(payloadOverrides);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ShiprocketOrderLite[]>([]);
  const [summary, setSummary] = useState<ShiprocketOrdersSummary | null>(null);
  const [pagination, setPagination] = useState<ShiprocketOrdersResponse["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState(() => makeRange(14));
  const [activePreset, setActivePreset] = useState(14);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<OrderTabValue>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilters, setClientFilters] = useState({
    payment: "all",
    zone: "all",
    courier: "all",
    shipmentMode: "all",
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedOrder, setSelectedOrder] = useState<ShiprocketOrderLite | null>(null);
  const trackingCardData = selectedOrder ? buildTrackingCardData(selectedOrder) : null;
  const hasLiveTracking = Boolean(selectedOrder?.trackingEvents?.length);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          from: dateRange.from,
          to: dateRange.to,
          page: String(page),
          perPage: String(perPage),
        });
        if (statusFilter !== "all") params.set("status", statusFilter);

        const response = await fetch(`/api/shiprocket/orders?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load Shiprocket orders");
        }

        const payload: ShiprocketOrdersResponse = await response.json();
        setOrders(payload.data ?? []);
        setSummary(payload.summary);
        setPagination(payload.pagination);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [dateRange.from, dateRange.to, page, perPage, statusFilter]);

  const derivedFilters = useMemo(() => {
    const zones = new Set<string>();
    const payments = new Set<string>();
    const couriers = new Set<string>();
    const shipmentModes = new Set<string>();

    orders.forEach((order) => {
      const zone = (order.shipping_zone_code || order.shipping_zone || "unknown").toLowerCase();
      if (zone) zones.add(zone);

      const payment = (order.payment_method || "unknown").toLowerCase();
      if (payment) payments.add(payment);

      const courier =
        (order.courier_company_name || order.shipments?.[0]?.courier_company_name || "unknown")?.toLowerCase() ??
        "unknown";
      if (courier) couriers.add(courier);

      const shipmentMode =
        (order.shipments?.[0]?.shipment_mode || order.shipments?.[0]?.shipment_type || "standard")?.toLowerCase() ??
        "standard";
      if (shipmentMode) shipmentModes.add(shipmentMode);
    });

    const toOptions = (set: Set<string>) =>
      Array.from(set)
        .filter(Boolean)
        .map((value) => ({
          value,
          label: value === "unknown" ? "Unknown" : value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    return {
      zones: toOptions(zones),
      payments: toOptions(payments),
      couriers: toOptions(couriers),
      shipmentModes: toOptions(shipmentModes),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const tabConfig = ORDER_TABS.find((tab) => tab.value === activeTab);

    return orders.filter((order) => {
      if (tabConfig && tabConfig.match.length > 0) {
        const normalizedStatus = (order.status || "").toLowerCase();
        const matchesTab = tabConfig.match.some((needle) => normalizedStatus.includes(needle));
        if (!matchesTab) return false;
      }

      const payment = (order.payment_method || "unknown").toLowerCase();
      if (clientFilters.payment !== "all" && payment !== clientFilters.payment) return false;

      const zone = (order.shipping_zone_code || order.shipping_zone || "unknown").toLowerCase();
      if (clientFilters.zone !== "all" && zone !== clientFilters.zone) return false;

      const courier =
        (order.courier_company_name || order.shipments?.[0]?.courier_company_name || "unknown")?.toLowerCase() ??
        "unknown";
      if (clientFilters.courier !== "all" && courier !== clientFilters.courier) return false;

      const shipmentMode =
        (order.shipments?.[0]?.shipment_mode || order.shipments?.[0]?.shipment_type || "standard")?.toLowerCase() ??
        "standard";
      if (clientFilters.shipmentMode !== "all" && shipmentMode !== clientFilters.shipmentMode) return false;

      if (searchTerm) {
        const haystack = [
          order.order_id,
          order.channel_order_id,
          order.billing_customer_name,
          order.billing_email,
          order.billing_phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchTerm.toLowerCase())) return false;
      }

      return true;
    });
  }, [orders, clientFilters, searchTerm, activeTab]);

  const handlePresetChange = (days: number) => {
    setActivePreset(days);
    setDateRange(makeRange(days));
    setPage(1);
  };

  const handleDateChange = (field: "from" | "to", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
      label: `${prev.from}  ${prev.to}`,
    }));
    setActivePreset(-1);
  };

  const handleClientFilterChange = (key: keyof typeof clientFilters, value: string) => {
    setClientFilters((prev) => ({ ...prev, [key]: value }));
  };

  const currentPage = pagination?.current_page ?? page;
  const totalPages = pagination?.total_pages ?? 1;

  const summaryCards = [
    {
      title: "Orders Placed",
      value: summary?.totalOrders ?? 0,
      description: `${dateRange.from}  ${dateRange.to}`,
    },
    {
      title: "Delivered",
      value: summary?.deliveredOrders ?? 0,
      description: "Completed fulfilments",
    },
    {
      title: "In Transit",
      value: summary?.inTransitOrders ?? 0,
      description: "Moving through network",
    },
    {
      title: "Revenue",
      value: summary ? formatCurrency(summary.totalRevenue) : "₹0",
      description: `AVG ${summary ? formatCurrency(summary.avgOrderValue) : "₹0"}`,
    },
  ];

  const getTabCount = (value: OrderTabValue) => {
    if (value === "all") {
      return summary?.totalOrders ?? orders.length;
    }
    const tab = ORDER_TABS.find((item) => item.value === value);
    if (!tab || !summary?.statusCounts) return undefined;
    return Object.entries(summary.statusCounts).reduce((acc, [status, count]) => {
      const normalized = status.toLowerCase();
      const matches = tab.match.some((needle) => normalized.includes(needle));
      return matches ? acc + count : acc;
    }, 0);
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#1a1a1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[90%] bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent)]" />
      </div>
      <div className="relative max-w-[1400px] mx-auto space-y-6 p-6">
        <Card className="bg-gradient-to-br from-[#1f1f1f] via-[#161616] to-[#0f0f0f] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)] rounded-3xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.35em] text-white/40 uppercase">Orders</p>
              <h1 className="text-3xl font-semibold text-white mt-2">Shipments dashboard</h1>
              <p className="text-white/60 text-sm">
                Synced {summary?.lastSynced ? formatDate(summary.lastSynced) : "just now"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetChange(preset.days)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activePreset === preset.days
                      ? "bg-white text-black shadow-white/30 shadow-lg"
                      : "bg-white/10 border border-white/10 text-white/60 hover:text-white"
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setPage(1);
                }}
                className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 backdrop-blur shadow-inner shadow-black/40"
              >
                <p className="text-sm text-white/60">{card.title}</p>
                <p className="text-4xl font-semibold text-white mt-2">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </p>
                <p className="text-xs text-white/40 mt-2">{card.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#181818]/90 border border-white/10 rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur">
          <CardContent className="flex flex-wrap gap-3 p-4">
            {ORDER_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const tabCount = getTabCount(tab.value);
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-black border-white shadow-white/30 shadow-lg"
                      : "bg-transparent border-white/15 text-white/70 hover:text-white hover:border-white/40"
                  )}
                >
                  <span>{tab.label}</span>
                  {typeof tabCount === "number" && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        isActive ? "bg-black/10 text-black" : "bg-white/10 text-white/70"
                      )}
                    >
                      {tabCount}
                    </span>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-[#1d1d1d]/90 border border-white/10 rounded-3xl shadow-[0_28px_70px_rgba(0,0,0,0.45)] backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by Order ID, customer, email or phone"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:w-auto">
                <select
                  value={clientFilters.payment}
                  onChange={(event) => handleClientFilterChange("payment", event.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="all">Payment</option>
                  {derivedFilters.payments.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={clientFilters.zone}
                  onChange={(event) => handleClientFilterChange("zone", event.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="all">Zone</option>
                  {derivedFilters.zones.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={clientFilters.courier}
                  onChange={(event) => handleClientFilterChange("courier", event.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="all">Courier</option>
                  {derivedFilters.couriers.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={clientFilters.shipmentMode}
                  onChange={(event) => handleClientFilterChange("shipmentMode", event.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="all">Mode</option>
                  {derivedFilters.shipmentModes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm">
                <Calendar className="w-4 h-4 text-white/40" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(event) => handleDateChange("from", event.target.value)}
                  className="bg-transparent outline-none flex-1"
                />
              </label>
              <label className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm">
                <Calendar className="w-4 h-4 text-white/40" />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(event) => handleDateChange("to", event.target.value)}
                  className="bg-transparent outline-none flex-1"
                />
              </label>
              <select
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setPage(1);
                }}
                className="bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-white/30"
              >
                {[25, 50, 100, 200].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-[#1f1f1f] to-[#111111] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-white">Orders</CardTitle>
              <CardDescription className="text-white/60">
                Showing {filteredOrders.length.toLocaleString()} orders
              </CardDescription>
            </div>
            <div className="text-sm text-white/60">
              Page {currentPage} of {totalPages}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <div className="py-16 text-center text-white/50 text-sm">Loading Shiprocket orders…</div>
            )}
            {!isLoading && filteredOrders.length === 0 && (
              <div className="py-16 text-center text-white/50 text-sm">No orders match your filters.</div>
            )}
            {!isLoading && filteredOrders.length > 0 && (
              <div className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const courierName =
                    order.courier_company_name || order.shipments?.[0]?.courier_company_name || "N/A";
                  const amount = toNumber(order.total) || toNumber(order.sub_total);
                  const payment = (order.payment_method || "Unknown").toUpperCase();
                  const statusLabel = order.status || "Unknown";
                  const awbCode = order.shipments?.[0]?.awb_code;
                  const shipmentMode = order.shipments?.[0]?.shipment_mode || order.shipments?.[0]?.shipment_type;
                  const weight =
                    order.weight ??
                    (order.shipments?.[0] as { weight?: number | string } | undefined)?.weight ??
                    undefined;
                  const volumetricWeight =
                    (order.shipments?.[0] as { volumetric_weight?: number | string } | undefined)?.volumetric_weight ??
                    undefined;
                  const dimensions = formatDimensions({
                    length: order.length ?? order.shipments?.[0]?.length,
                    breadth: order.breadth ?? order.shipments?.[0]?.breadth,
                    height: order.height ?? order.shipments?.[0]?.height,
                  });
                  const customerName =
                    order.billing_customer_name || order.customer?.name || order.customer_name || "Unknown";
                  const customerEmail = order.billing_email || order.customer?.email || order.customer_email || "No email";
                  const customerPhone = order.billing_phone || order.customer?.phone || order.customer_phone || "—";
                  const customerCity = order.billing_city || order.customer?.city || order.customer_city;
                  const customerState = order.billing_state || order.customer?.state || order.customer_state;
                  const customerPincode = order.billing_pincode || order.customer?.pincode || order.customer_pincode;
                  const orderItems = order.order_items ?? [];

                  return (
                    <div
                      key={`${order.order_id ?? order.channel_order_id}-${order.created_at}`}
                      className="p-6 transition hover:bg-white/5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Order</p>
                          <p className="mt-1 text-xl font-semibold text-white">
                            {order.order_id || order.channel_order_id || "—"}
                          </p>
                          <div className="mt-1 text-xs text-white/50">
                            {formatDate(order.created_at || order.order_date)}
                            {order.channel_order_id && (
                              <span className="ml-2 text-white/30">#{order.channel_order_id}</span>
                            )}
                          </div>
                          {awbCode && <div className="text-xs text-white/40 mt-1">AWB: {awbCode}</div>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={cn("border text-xs", statusBadgeColor(statusLabel))}>
                            {statusLabel.toUpperCase()}
                          </Badge>
                          {shipmentMode && (
                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                              {shipmentMode}
                            </span>
                          )}
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                            {courierName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Customer details</p>
                          <div className="mt-3 space-y-2 text-sm">
                            <p className="text-white font-medium">{customerName}</p>
                            <p className="text-white/70 break-all">{customerEmail}</p>
                            {customerPhone && <p className="text-white/70">{customerPhone}</p>}
                             {(customerCity || customerState || customerPincode) && (
                               <p className="text-white/50 text-xs">
                                 {[customerCity, customerState, customerPincode].filter(Boolean).join(", ")}
                               </p>
                             )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Product details</p>
                            <div className="mt-3 space-y-3">
                              {orderItems.length > 0 ? (
                                orderItems.slice(0, 2).map((item, index) => {
                                  const itemImage =
                                    item.product_image || item.image || item.image_url || (item as { item_image?: string })?.item_image;
                                  return (
                                    <div key={`${item.sku}-${index}`} className="flex items-center gap-3">
                                      <div className="flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 h-14 w-14">
                                        {itemImage ? (
                                          <Image
                                            src={itemImage}
                                            alt={item.name || "Product"}
                                            width={56}
                                            height={56}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
                                            No image
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-white line-clamp-1">{item.name || "Unnamed"}</p>
                                        <p className="text-xs text-white/50">
                                          SKU {item.sku || "N/A"} · Qty {item.units ?? 1}
                                        </p>
                                      </div>
                                      <p className="ml-auto text-sm font-medium text-white/80">
                                        {formatCurrency((item.units ?? 1) * (toNumber(item.selling_price) || 0))}
                                      </p>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-sm text-white/50">No items reported by Shiprocket.</p>
                              )}
                              {orderItems.length > 2 && (
                                <p className="text-xs text-white/50">+{orderItems.length - 2} more items</p>
                              )}
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-4 text-sm text-white/80 space-y-1">
                            <p className="text-white/60 text-xs uppercase">Package details</p>
                            <p>Dead wt.: <span className="text-white/60">{formatWeight(weight)}</span></p>
                            <p>Vol. wt.: <span className="text-white/60">{formatWeight(volumetricWeight)}</span></p>
                            <p>Size: <span className="text-white/60">{dimensions}</span></p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Shipping & pickup</p>
                          <div className="mt-3 space-y-3 text-sm text-white/80">
                            <div>
                              <p className="text-white/60 text-xs">Shipping address</p>
                              <p className="font-medium text-white">{customerName}</p>
                              <p className="text-white/70">{order.customer?.address || order.billing_address || "—"}</p>
                              <p className="text-white/60">
                                {[order.billing_city || customerCity, order.billing_state || customerState, order.billing_pincode || customerPincode]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-xs">Pickup address</p>
                              <p>Location: <span className="text-white/60">{order.pickup_location || "—"}</span></p>
                              <p>Shipping zone: <span className="text-white/60">{order.shipping_zone || order.shipping_zone_code || "—"}</span></p>
                              <p>Mode: <span className="text-white/60">{shipmentMode || "—"}</span></p>
                              {awbCode && (
                                <p>
                                  AWB: <span className="text-white/60">{awbCode}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Payment & actions</p>
                            <div className="mt-3 space-y-2 text-sm">
                              <p className="text-2xl font-semibold text-white">{formatCurrency(amount)}</p>
                              <p className="inline-flex items-center gap-2 text-white/70">
                                <CreditCard className="h-4 w-4" />
                                {payment}
                              </p>
                              <p className="text-white/60 text-xs">Status: {order.payment_status || "N/A"}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex-1 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white hover:border-white/40"
                            >
                              View details
                            </button>
                            {awbCode && (
                              <a
                                href={`https://shiprocket.co/tracking/${awbCode}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 rounded-full border border-white/15 px-4 py-2 text-center text-xs font-medium text-white/80 hover:text-white hover:border-white/40"
                              >
                                Track
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 items-center justify-between text-sm text-white/60 md:flex-row">
          <div>
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border transition",
                currentPage <= 1
                  ? "border-white/10 text-white/30 cursor-not-allowed"
                  : "border-white/20 text-white hover:border-white/40"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border transition",
                currentPage >= totalPages
                  ? "border-white/10 text-white/30 cursor-not-allowed"
                  : "border-white/20 text-white hover:border-white/40"
              )}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-6xl bg-[#1a1a1a] border border-white/10 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                Order {selectedOrder?.order_id || selectedOrder?.channel_order_id}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="w-4 h-4" /> Order Date
                    </div>
                    <p className="text-white font-medium mt-2">
                      {formatDate(selectedOrder.created_at || selectedOrder.order_date)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Package className="w-4 h-4" /> Status
                    </div>
                    <Badge className={cn("mt-2 border text-xs", statusBadgeColor(selectedOrder.status))}>
                      {(selectedOrder.status || "Unknown").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <h3 className="font-semibold mb-3">Customer</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{selectedOrder.billing_customer_name || "Unknown"}</span>
                      </div>
                      {selectedOrder.billing_email && <p>{selectedOrder.billing_email}</p>}
                      {selectedOrder.billing_phone && <p>{selectedOrder.billing_phone}</p>}
                      <div className="flex items-start gap-2 text-white/60">
                        <MapPin className="w-4 h-4 mt-1" />
                        <div>
                          <p>{selectedOrder.billing_city}</p>
                          <p>
                            {selectedOrder.billing_state} - {selectedOrder.billing_pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <h3 className="font-semibold mb-3">Payment</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{(selectedOrder.payment_method || "Unknown").toUpperCase()}</span>
                      </div>
                      <p>Status: {selectedOrder.payment_status || "N/A"}</p>
                      <p>Total: {formatCurrency(toNumber(selectedOrder.total) || toNumber(selectedOrder.sub_total))}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <h3 className="font-semibold mb-3">Shipping & address</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <p>{selectedOrder.billing_address || "—"}</p>
                      {selectedOrder.billing_city && (
                        <p>
                          {selectedOrder.billing_city}, {selectedOrder.billing_state} - {selectedOrder.billing_pincode}
                        </p>
                      )}
                      <p>Pickup: {selectedOrder.pickup_location || "—"}</p>
                      <p>Shipping zone: {selectedOrder.shipping_zone || selectedOrder.shipping_zone_code || "—"}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <h3 className="font-semibold mb-3">Courier & tracking</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <p>Courier: {selectedOrder.courier_company_name || selectedOrder.shipments?.[0]?.courier_company_name || "—"}</p>
                      <p>Mode: {selectedOrder.shipments?.[0]?.shipment_mode || selectedOrder.shipments?.[0]?.shipment_type || "—"}</p>
                      <p>AWB: {selectedOrder.shipments?.[0]?.awb_code || "—"}</p>
                      <p>Weight: {selectedOrder.weight ?? selectedOrder.shipments?.[0]?.weight ?? "—"} Kg</p>
                      {selectedOrder.shipments?.[0]?.awb_code && (
                        <a
                          href={`https://shiprocket.co/tracking/${selectedOrder.shipments[0].awb_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-white hover:text-white/80"
                        >
                          Track shipment <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                  <h3 className="font-semibold mb-4">Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.order_items || []).map((item, index) => (
                      <div
                        key={`${item.sku}-${index}`}
                        className="flex items-center gap-3 border border-white/5 rounded-2xl px-4 py-3"
                      >
                        <div className="flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 h-14 w-14">
                          {item.product_image || item.image || item.image_url ? (
                            <Image
                              src={(item.product_image || item.image || item.image_url) as string}
                              alt={item.name || "Product"}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{item.name || "Unnamed item"}</p>
                          <p className="text-xs text-white/50 mt-1">
                            SKU: {item.sku || "N/A"} — Qty: {item.units ?? 1}
                          </p>
                        </div>
                        <p className="text-sm text-white/80">
                          {formatCurrency((item.units ?? 1) * (toNumber(item.selling_price) || 0))}
                        </p>
                      </div>
                    ))}
                    {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) && (
                      <p className="text-white/50 text-sm">Item details not available for this order.</p>
                    )}
                  </div>
                </div>

                {trackingCardData && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Tracking journey</h3>
                    <TrackingJourneyCard {...trackingCardData} />
                    {!hasLiveTracking && (
                      <p className="text-xs text-white/60">
                        Preview only · set <span className="font-semibold">NEXT_PUBLIC_ENABLE_TRACKING_PREVIEW</span> to{" "}
                        <span className="font-semibold">false</span> to disable.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {error && (
          <div className="p-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
