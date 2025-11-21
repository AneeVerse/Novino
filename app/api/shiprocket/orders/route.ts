"use server";

import { NextRequest, NextResponse } from "next/server";
import { formatISO, subDays } from "date-fns";
import {
  fetchShiprocketOrdersList,
  fetchShiprocketProductsList,
} from "@/lib/services/shiprocket";
import type { ShiprocketOrder, ShiprocketProduct } from "@/lib/services/shiprocket";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";

const DEFAULT_RANGE_DAYS = 14;
const DEFAULT_PER_PAGE = 25;

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const isMaskedPhone = (value?: string) => {
  if (!value) return true;
  const cleaned = value.replace(/[^\dxX*]/g, "");
  if (!cleaned) return true;
  return /^[xX*]+$/.test(cleaned);
};

const normalizeSku = (sku?: string | null) => (sku ?? "").trim().toLowerCase();

const fetchProductsBySkus = async (skus: string[]) => {
  const map = new Map<string, ShiprocketProduct>();
  if (!skus.length) return map;

  await Promise.all(
    skus.map(async (sku) => {
      const normalizedSku = normalizeSku(sku);
      if (!normalizedSku || map.has(normalizedSku)) return;
      try {
        const response = await fetchShiprocketProductsList({
          search: sku,
          sku,
          perPage: 50,
        });
        const product = response.data?.find(
          (item) => normalizeSku(item.sku) === normalizedSku
        );
        if (product) {
          map.set(normalizedSku, product);
        }
      } catch (error) {
        console.error("Failed to fetch Shiprocket product details", { sku, error });
      }
    })
  );

  return map;
};

const enrichOrdersWithLocalData = async (orders: ShiprocketOrder[]) => {
  if (!orders.length) return orders;

  try {
    const supabase = getSupabaseServiceRoleClient();

    const orderNumbers = Array.from(
      new Set(
        orders
          .map((order) => order.order_id || order.channel_order_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (!orderNumbers.length) return orders;

    // Fetch local orders from Supabase
    const { data: localOrders } = await supabase
      .from('orders')
      .select('order_number, items, delivery_address, total, id')
      .in('order_number', orderNumbers);

    if (!localOrders || !localOrders.length) return orders;

    const localOrderMap = new Map(localOrders.map((order) => [order.order_number, order]));
    const orderIds = localOrders.map((order) => order.id).filter((id): id is string => Boolean(id));

    // Fetch shipments for these orders
    const { data: shipments } = orderIds.length
      ? await supabase
        .from('shipments')
        .select('order_id, shiprocket_order_id, shiprocket_shipment_id, courier_name, tracking_id, tracking_url, status, expected_delivery_date, metadata')
        .in('order_id', orderIds)
      : { data: [] };

    const shipmentByOrderId = new Map(
      (shipments || []).map((shipment) => [shipment.order_id, shipment])
    );

    const enriched = orders.map((order) => {
      const local =
        (order.channel_order_id && localOrderMap.get(order.channel_order_id)) ||
        (order.order_id && localOrderMap.get(String(order.order_id)));

      if (!local) {
        return order;
      }

      const shipment = local.id ? shipmentByOrderId.get(local.id) : null;

      const address = local.delivery_address || {};
      if (!order.billing_customer_name && address.name) {
        order.billing_customer_name = address.name;
      }
      if (!order.billing_email && address.email) {
        order.billing_email = address.email;
      }
      if ((isMaskedPhone(order.billing_phone) || !order.billing_phone) && address.phone) {
        order.billing_phone = address.phone;
      }

      order.customer = {
        name: address.name,
        email: address.email,
        phone: address.phone,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        address: [address.line1, address.line2].filter(Boolean).join(", "),
      };
      order.billing_address = order.customer.address;
      order.billing_city = address.city;
      order.billing_state = address.state;
      order.billing_pincode = address.pincode;

      if (!order.order_items || order.order_items.length === 0) {
        order.order_items = (local.items || []).map((item: any) => ({
          name: item.name,
          sku: item.productId || item.id,
          units: item.quantity,
          selling_price: item.price,
          product_image: item.image,
        }));
      } else {
        order.order_items = order.order_items.map((item, index) => {
          if (item.name && item.sku && item.selling_price && (item as any).product_image) {
            return item;
          }
          const fallback = local.items?.[index];
          if (!fallback) return item;
          return {
            ...item,
            name: item.name || fallback.name,
            sku: item.sku || fallback.productId || fallback.id,
            selling_price: item.selling_price || fallback.price,
            units: item.units ?? fallback.quantity,
            product_image: (item as any).product_image || fallback.image,
          };
        });
      }

      if (local?.id) {
        (order as any).localOrderId = local.id;
      }

      if (shipment) {
        if (!order.shipments || order.shipments.length === 0) {
          order.shipments = [
            {
              awb_code: shipment.tracking_id,
              courier_company_name: shipment.courier_name,
              status: shipment.status,
            },
          ];
        } else {
          order.shipments = order.shipments.map((item) => ({
            awb_code: item.awb_code || shipment.tracking_id,
            courier_company_name: item.courier_company_name || shipment.courier_name,
            status: item.status || shipment.status,
            shipment_mode: item.shipment_mode,
            shipment_type: item.shipment_type,
          }));
        }

        if (!order.status && shipment.status) {
          order.status = shipment.status;
        }

        (order as any).trackingEvents = shipment.metadata?.tracking_events || [];
        (order as any).trackingUrl = shipment.tracking_url || (order as any).trackingUrl;
        (order as any).pickupScheduledFor = shipment.expected_delivery_date || (order as any).pickupScheduledFor;
        (order as any).shiprocketShipmentId = shipment.shiprocket_shipment_id || (order as any).shiprocketShipmentId;
      }

      return order;
    });

    return enriched;
  } catch (error) {
    console.error("Failed to enrich Shiprocket orders with local data", error);
    return orders;
  }
};

const enrichOrdersWithShiprocketProducts = async (orders: ShiprocketOrder[]) => {
  const missingSkus = new Set<string>();

  orders.forEach((order) => {
    (order.order_items || []).forEach((item) => {
      if (!item) return;
      const hasName = Boolean(item.name);
      const hasImage =
        Boolean(
          (item as any).product_image ||
          (item as any).image ||
          (item as any).image_url ||
          (item as any).item_image
        ) || false;
      if ((!hasName || !hasImage) && item.sku) {
        missingSkus.add(item.sku);
      }
    });
  });

  if (!missingSkus.size) return orders;

  const productsMap = await fetchProductsBySkus(Array.from(missingSkus));
  if (!productsMap.size) return orders;

  orders.forEach((order) => {
    order.order_items = (order.order_items || []).map((item) => {
      if (!item?.sku) return item;
      const product = productsMap.get(normalizeSku(item.sku));
      if (!product) return item;

      const currentImage =
        (item as any).product_image ||
        (item as any).image ||
        (item as any).image_url ||
        (item as any).item_image;
      const productImage = product.image || (product.images && product.images[0]);

      return {
        ...item,
        name: item.name || product.name || item.sku,
        selling_price:
          item.selling_price ??
          product.selling_price ??
          product.price ??
          product.mrp,
        product_image: currentImage || productImage || item.product_image,
      };
    });
  });

  return orders;
};

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

const buildSummary = (orders: ShiprocketOrder[]): ShiprocketOrdersSummary => {
  const base: ShiprocketOrdersSummary = {
    totalOrders: 0,
    totalRevenue: 0,
    codOrders: 0,
    prepaidOrders: 0,
    deliveredOrders: 0,
    inTransitOrders: 0,
    newOrders: 0,
    avgOrderValue: 0,
    lastSynced: new Date().toISOString(),
    statusCounts: {},
  };

  const summary = orders.reduce((acc, order) => {
    acc.totalOrders += 1;
    const amount = toNumber(order.total) || toNumber(order.sub_total);
    acc.totalRevenue += amount;

    const payment = (order.payment_method || "").toLowerCase();
    if (payment.includes("cod")) {
      acc.codOrders += 1;
    } else {
      acc.prepaidOrders += 1;
    }

    const status = (order.status || "unknown").toLowerCase();
    acc.statusCounts[status] = (acc.statusCounts[status] ?? 0) + 1;

    if (status.includes("deliver")) {
      acc.deliveredOrders += 1;
    } else if (status.includes("transit") || status.includes("ship")) {
      acc.inTransitOrders += 1;
    } else {
      acc.newOrders += 1;
    }

    return acc;
  }, base);

  summary.totalRevenue = Number(summary.totalRevenue.toFixed(2));
  summary.avgOrderValue = summary.totalOrders
    ? Number((summary.totalRevenue / summary.totalOrders).toFixed(2))
    : 0;
  summary.lastSynced = new Date().toISOString();
  return summary;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const toParam = url.searchParams.get("to");
  const fromParam = url.searchParams.get("from");
  const statusParam = url.searchParams.get("status");
  const pageParam = url.searchParams.get("page");
  const perPageParam = url.searchParams.get("perPage");

  const today = new Date();
  const defaultTo = formatISO(today, { representation: "date" });
  const defaultFrom = formatISO(subDays(today, DEFAULT_RANGE_DAYS), {
    representation: "date",
  });

  const range = {
    from: fromParam ?? defaultFrom,
    to: toParam ?? defaultTo,
  };

  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Math.min(200, Number(perPageParam) || DEFAULT_PER_PAGE);
  const status =
    statusParam && statusParam.toLowerCase() !== "all" ? statusParam : undefined;

  try {
    const response = await fetchShiprocketOrdersList({
      from: range.from,
      to: range.to,
      page,
      perPage,
      status,
      sort: "DESC",
    });

    let orders = await enrichOrdersWithLocalData(response.data ?? []);
    orders = await enrichOrdersWithShiprocketProducts(orders);
    const summary = buildSummary(orders);
    const pagination =
      response.meta?.pagination ?? {
        total: summary.totalOrders,
        count: orders.length,
        per_page: perPage,
        current_page: page,
        total_pages: 1,
      };

    return NextResponse.json({
      data: orders,
      summary,
      pagination,
      range,
    });
  } catch (error) {
    console.error("Shiprocket orders fetch failed", error);
    return NextResponse.json(
      {
        error: "Failed to load Shiprocket orders",
        range,
      },
      { status: 500 }
    );
  }
}
