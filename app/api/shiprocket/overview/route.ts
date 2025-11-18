"use server";

import { NextRequest, NextResponse } from "next/server";
import { subDays, formatISO } from "date-fns";
import { getShiprocketOverviewMetrics } from "@/lib/services/shiprocket";

const DEFAULT_RANGE_DAYS = 14;

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
    const metrics = await getShiprocketOverviewMetrics(range);

    return NextResponse.json({
      data: metrics,
      range,
    });
  } catch (error) {
    console.error("Shiprocket overview fetch failed", error);
    return NextResponse.json(
      {
        error: "Failed to load Shiprocket overview metrics",
        range,
      },
      { status: 500 }
    );
  }
}

