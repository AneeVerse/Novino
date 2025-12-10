"use server";

import { NextRequest, NextResponse } from "next/server";
import { subDays, formatISO } from "date-fns";
import { getShiprocketOverviewMetrics } from "@/lib/services/shiprocket";

const DEFAULT_RANGE_DAYS = 1;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const toParam = url.searchParams.get("to");
  const fromParam = url.searchParams.get("from");

  const today = new Date();
  const defaultTo = formatISO(today, { representation: "date" });
  const defaultFrom = formatISO(subDays(today, DEFAULT_RANGE_DAYS), { representation: "date" });

  const range = {
    from: fromParam ?? defaultFrom,
    to: toParam ?? defaultTo,
  };

  try {
    console.log('📊 Shiprocket overview API called with range:', range);
    const metrics = await getShiprocketOverviewMetrics(range);

    console.log('✅ Shiprocket overview metrics calculated:', {
      totalOrders: metrics.totalOrders,
      codOrders: metrics.codOrders,
      prepaidOrders: metrics.prepaidOrders,
      todaysOrders: metrics.todaysOrders,
      totalRevenue: metrics.totalRevenue,
      averageOrderValue: metrics.averageOrderValue,
    });

    return NextResponse.json({
      data: metrics,
      range,
    });
  } catch (error) {
    console.error("❌ Shiprocket overview fetch failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      range,
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load Shiprocket overview metrics",
        range,
      },
      { status: 500 }
    );
  }
}

