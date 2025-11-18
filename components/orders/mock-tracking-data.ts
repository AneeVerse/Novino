"use client";

import {
  type TrackingJourneyCardProps,
  type TrackingJourneyEvent,
} from "./tracking-journey-card";

const basePreviewEvents: TrackingJourneyEvent[] = [
  {
    status: "Out for delivery",
    location: "998-920 7th Ave, New York",
    recordedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    remarks: "Courier is heading to the destination",
  },
  {
    status: "Arrived at destination hub",
    location: "South City Facility",
    recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    remarks: "Parcel scanned at the destination warehouse",
  },
  {
    status: "Departed sorting center",
    location: "Business Town Logistics Park",
    recordedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    status: "Picked up from seller",
    location: "39-1 E 57th St, New York",
    recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getTrackingPreviewData = (
  overrides?: Partial<TrackingJourneyCardProps>
): TrackingJourneyCardProps => {
  const base: TrackingJourneyCardProps = {
    trackingNumber: "NB145618X8S",
    statusText: "Out for delivery",
    courierName: "Nimbus Express",
    summaryLabel: "Preview · your parcel is on the way",
    meta: {
      deliveryType: "Express",
      estimate: "Today · 09:10 AM",
      weight: "10 Kg",
    },
    stops: [
      {
        label: "39-1 E 57th St, New York",
        detail: "Pickup confirmed · 09:10 AM",
      },
      {
        label: "998-920 7th Ave, New York",
        detail: "2 km away · ETA 09:45 AM",
      },
    ],
    shipper: {
      name: "Jack Frost",
      role: "Your shipper",
      rating: 4.8,
      phone: "+1 212 555 0100",
      whatsappUrl: "https://wa.me/12125550100",
    },
    events: basePreviewEvents,
    accentColor: "#0bd88f",
  };

  return {
    ...base,
    ...overrides,
    meta: {
      ...base.meta,
      ...(overrides?.meta || {}),
    },
    stops: overrides?.stops ?? base.stops,
    shipper: {
      ...base.shipper,
      ...(overrides?.shipper || {}),
    },
    events: overrides?.events ?? base.events,
    accentColor: overrides?.accentColor ?? base.accentColor,
  };
};


