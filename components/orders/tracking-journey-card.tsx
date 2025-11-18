"use client";

import { ReactNode, useMemo } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Clock3,
  PackageCheck,
  Truck,
  Star,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TrackingJourneyEvent = {
  status: string;
  recordedAt: string | Date;
  location?: string;
  remarks?: string;
};

type Stop = {
  label: string;
  detail?: string;
  icon?: ReactNode;
};

type MetaItem = {
  label: string;
  value?: string;
  icon?: ReactNode;
};

type ShipperDetails = {
  name?: string;
  role?: string;
  rating?: number;
  phone?: string;
  whatsappUrl?: string;
  supportUrl?: string;
};

interface TrackingJourneyCardProps {
  trackingNumber?: string;
  statusText?: string;
  courierName?: string;
  summaryLabel?: string;
  meta?: {
    deliveryType?: string;
    estimate?: string;
    weight?: string;
  };
  stops?: Stop[];
  shipper?: ShipperDetails;
  events?: TrackingJourneyEvent[];
  accentColor?: string;
  className?: string;
  actionSlot?: ReactNode;
}

const formatEventDate = (dateLike?: string | Date) => {
  if (!dateLike) return "—";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const defaultStops: Stop[] = [
  { label: "Origin facility", detail: "Preparing your parcel" },
  { label: "Destination", detail: "En route" },
];

const stopIcon = (index: number) => {
  if (index === 0) {
    return (
      <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white">
        <MapPin className="h-5 w-5" />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="h-10 w-10 rounded-2xl bg-[#0bd88f]/10 text-[#0bd88f] flex items-center justify-center">
        <Navigation className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
      <Circle className="h-5 w-5" />
    </div>
  );
};

const metaIcon = (type: "delivery" | "estimate" | "weight") => {
  switch (type) {
    case "estimate":
      return <Clock3 className="h-4 w-4" />;
    case "weight":
      return <PackageCheck className="h-4 w-4" />;
    default:
      return <Truck className="h-4 w-4" />;
  }
};

export default function TrackingJourneyCard({
  trackingNumber,
  statusText = "In transit",
  courierName,
  summaryLabel = "Your parcel is on the way",
  meta,
  stops,
  shipper,
  events,
  accentColor = "#0bd88f",
  className,
  actionSlot,
}: TrackingJourneyCardProps) {
  const timeline = useMemo(() => {
    return [...(events || [])].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  }, [events]);

  const derivedStops = useMemo<Stop[]>(() => {
    if (stops?.length) return stops;
    if (timeline.length >= 2) {
      const latest = timeline[0];
      const first = timeline[timeline.length - 1];
      return [
        {
          label: first.location || "Origin facility",
          detail: formatEventDate(first.recordedAt),
        },
        {
          label: latest.location || "Current checkpoint",
          detail: formatEventDate(latest.recordedAt),
        },
      ];
    }
    return defaultStops;
  }, [stops, timeline]);

  const metaItems: MetaItem[] = [
    {
      label: "Delivery type",
      value: meta?.deliveryType || "Standard",
      icon: metaIcon("delivery"),
    },
    {
      label: "Estimate",
      value: meta?.estimate || "Updating soon",
      icon: metaIcon("estimate"),
    },
    {
      label: "Weight",
      value: meta?.weight || "—",
      icon: metaIcon("weight"),
    },
  ];

  const rating = Math.round((shipper?.rating ?? 0) * 10) / 10;

  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-[minmax(280px,1.05fr)_minmax(320px,1.15fr)]",
        className
      )}
    >
      <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-[#101828] via-[#081020] to-[#040811] text-white shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <p className="text-sm text-white/70">Tracking</p>
            <p className="text-xl font-semibold mt-1">
              "{trackingNumber || "Assigning AWB"}"
            </p>
            <p className="text-xs text-white/60 mt-1 uppercase tracking-[0.3em]">
              {courierName || "Courier partner"}
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-medium text-white/70">
            {statusText}
          </span>
        </div>

        <div className="px-6 py-8">
          <div className="relative h-[260px] rounded-[28px] border border-white/10 bg-white/5 overflow-hidden">
            <div className="absolute inset-4 rounded-[22px] bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
            <div className="absolute inset-8 grid grid-cols-3 grid-rows-3 gap-6 opacity-30">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-white/10" />
              ))}
            </div>
            <div className="absolute inset-10">
              <div className="relative h-full w-full">
                <svg
                  viewBox="0 0 300 220"
                  className="absolute inset-0 h-full w-full text-white/40"
                >
                  <path
                    d="M20 200 Q120 40 200 120 T280 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                  />
                </svg>
                <div
                  className="absolute h-4 w-4 rounded-full shadow-lg"
                  style={{
                    top: "70%",
                    left: "10%",
                    backgroundColor: accentColor,
                    boxShadow: `0 0 25px ${accentColor}`,
                  }}
                />
                <div className="absolute right-6 top-8 flex flex-col items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-white/70" />
                  <div className="h-[140px] w-px bg-white/30" />
                  <div className="h-5 w-5 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {derivedStops.map((stop, index) => (
            <div
              key={`${stop.label}-${index}`}
              className="flex items-center gap-3 text-sm text-white/80"
            >
              {stop.icon ?? stopIcon(index)}
              <div>
                <p className="font-medium">{stop.label}</p>
                {stop.detail && (
                  <p className="text-xs text-white/60">{stop.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-white/5 bg-[#121216]/95 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/5 p-6 space-y-6">
          <div>
            <p className="text-sm text-white/60">{summaryLabel}</p>
            <p className="text-2xl font-semibold mt-1">Live tracking</p>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em]">
              Updated in real time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {shipper?.name || courierName || "Courier partner"}
              </p>
              <p className="text-xs text-white/60">
                {shipper?.role || "Logistics partner"}
              </p>
              {rating > 0 && (
                <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  {rating.toFixed(1)} rating
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {shipper?.phone && (
                <a
                  href={`tel:${shipper.phone}`}
                  className="h-10 w-10 rounded-2xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 transition"
                  aria-label="Call courier"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              {shipper?.whatsappUrl && (
                <a
                  href={shipper.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 w-10 rounded-2xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:border-white/30 transition"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {actionSlot}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center"
              >
                <div className="flex items-center justify-center gap-1 text-xs text-white/50 uppercase tracking-[0.2em]">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm font-semibold text-white mb-4">Timeline</p>
          {timeline.length ? (
            <ol className="relative border-l border-white/10 pl-6 space-y-6">
              {timeline.map((event, index) => (
                <li key={`${event.status}-${index}`} className="ml-2 relative">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2",
                      index === 0
                        ? "border-[var(--accent-color)] bg-[var(--accent-color)] shadow-[0_0_15px_var(--accent-color)]"
                        : "border-white/30 bg-[#121216]"
                    )}
                    style={
                      index === 0
                        ? ({ ["--accent-color" as const]: accentColor } as any)
                        : undefined
                    }
                  />
                  <p className="text-sm font-semibold">{event.status}</p>
                  <p className="text-xs text-white/60 mt-1">
                    {formatEventDate(event.recordedAt)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                  {event.remarks && (
                    <p className="text-xs text-white/70 mt-1">{event.remarks}</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
              Tracking events will appear here once the courier scans your parcel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


