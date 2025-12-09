import crypto from 'crypto';

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
const channelId = process.env.SHIPROCKET_CHANNEL_ID;
const defaultPickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'work';

type TokenCache = { token: string | null; expiresAt: number };
const tokenCache: TokenCache = { token: null, expiresAt: 0 };

export type ShiprocketOrderPayload = {
  orderId: string;
  orderNumber?: string;
  paymentMethod: 'PREPAID' | 'COD';
  total: number;
  deliveryAddress: {
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  items: {
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
    discount?: number;
  }[];
  dimensions?: {
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
  };
  pickupLocation?: string;
};

/**
 * Checks if a phone number appears to be a test/fake number
 * Shiprocket rejects obvious test numbers
 */
function isLikelyTestNumber(digits: string): boolean {
  if (digits.length !== 10) return false;

  // Check for repetitive digits (1111111111, 7777777777, etc.)
  const allSame = digits.split('').every(d => d === digits[0]);
  if (allSame) return true;

  // Check for sequential numbers (1234567890, 9876543210, etc.)
  const isSequential = digits.split('').every((d, i) => {
    if (i === 0) return true;
    const prev = parseInt(digits[i - 1], 10);
    const curr = parseInt(d, 10);
    return curr === prev + 1 || curr === prev - 1;
  });
  if (isSequential) return true;

  // Check for alternating patterns (1212121212, 1010101010, etc.)
  const isAlternating = digits.length >= 4 &&
    digits.slice(0, 2) === digits.slice(2, 4) &&
    digits.split('').every((d, i) => i % 2 === 0 ? d === digits[0] : d === digits[1]);
  if (isAlternating) return true;

  // Common test numbers known to be rejected
  const testNumbers = [
    '1111111111', '2222222222', '3333333333', '4444444444',
    '5555555555', '6666666666', '7777777777', '8888888888',
    '9999999999', '0000000000', '1234567890', '9876543210',
    '0123456789', '1010101010', '1212121212', '1234123412'
  ];
  if (testNumbers.includes(digits)) return true;

  return false;
}

function normalizePhone(phone?: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Handle empty after stripping
  if (!digits) {
    return '';
  }

  // Handle international format (+91 or 91 prefix)
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 13 && digits.startsWith('9191')) {
    digits = digits.slice(2);
  }

  // Handle leading zero (domestic format)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Take last 10 digits if longer
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  // Validate: must be exactly 10 digits and not start with 0 or 1
  // Indian mobile numbers start with 6-9, landlines with 2-5
  if (digits.length === 10) {
    // Ensure it's a valid Indian number (first digit should be 6-9 for mobile)
    const firstDigit = parseInt(digits[0], 10);
    if (firstDigit >= 6 && firstDigit <= 9) {
      return digits;
    }
    // Also allow landline numbers (starting with 2-5) for validation purposes
    if (firstDigit >= 2 && firstDigit <= 5) {
      return digits;
    }
  }

  return '';
}

async function ensureToken(force = false) {
  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be configured.');
  }

  if (!force && tokenCache.token && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  tokenCache.token = data.token;
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in * 1000 : 3600_000;
  tokenCache.expiresAt = Date.now() + expiresIn - 60_000; // renew 1 min early
  return tokenCache.token;
}

async function shiprocketFetch<T>(path: string, init: RequestInit = {}, force = false): Promise<T> {
  const token = await ensureToken(force);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && !force) {
    // Token expired, retry once
    return shiprocketFetch<T>(path, init, true);
  }

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = `Shiprocket request failed (${path}): ${res.status}`;

    // Try to parse error response for better error messages
    try {
      const errorData = JSON.parse(text);
      if (errorData.message) {
        errorMessage += ` - ${errorData.message}`;
      }
      if (errorData.errors) {
        const errorDetails = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        if (errorDetails) {
          errorMessage += ` (${errorDetails})`;
        }
      }
      // Log request body for debugging (sanitize sensitive data)
      // Note: body might be consumed if it's a stream, so we try to parse it
      try {
        // Clone the request body string if it exists
        const bodyString = typeof init.body === 'string' ? init.body : null;
        if (bodyString) {
          try {
            const requestBody = JSON.parse(bodyString);
            const sanitized = { ...requestBody };
            // Don't log full body in production, but include key fields for debugging
            const isTestPhone = sanitized.billing_phone ? isLikelyTestNumber(String(sanitized.billing_phone)) : false;
            console.error('Shiprocket request failed. Request body fields:', {
              order_id: sanitized.order_id,
              billing_phone: sanitized.billing_phone,
              billing_customer_name: sanitized.billing_customer_name,
              is_likely_test_number: isTestPhone,
              note: isTestPhone ? '⚠️ This phone number appears to be a test/fake number (repetitive digits). Shiprocket rejects obvious test numbers. Please use a real, valid Indian mobile number.' : undefined,
            });
          } catch (parseError) {
            // Body might not be valid JSON, log raw if it's a short string
            if (bodyString.length < 500) {
              console.error('Shiprocket request failed. Request body (raw):', bodyString.substring(0, 200));
            }
          }
        }
      } catch (e) {
        // Ignore errors - body might not be available
      }
    } catch (e) {
      // If not JSON, use raw text
      errorMessage += ` - ${text.substring(0, 200)}`;
    }

    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export interface ShiprocketOrderItem {
  name?: string;
  sku?: string;
  units?: number;
  selling_price?: number | string;
  discount?: number | string;
  [key: string]: unknown;
}

export interface ShiprocketOrderShipment {
  awb_code?: string;
  courier_company_id?: number;
  courier_company_name?: string;
  status?: string;
  status_code?: number;
  pickup_date?: string;
  delivered_date?: string;
  shipment_type?: string;
  shipment_mode?: string;
  weight?: number | string;
  length?: number | string;
  breadth?: number | string;
  height?: number | string;
  volumetric_weight?: number | string;
  [key: string]: unknown;
}

export interface ShiprocketOrder {
  id?: number;
  order_id?: string;
  channel_order_id?: string;
  channel?: string;
  channel_name?: string;
  status?: string;
  status_code?: number;
  created_at?: string;
  order_date?: string;
  payment_method?: string;
  payment_status?: string;
  sub_total?: number | string;
  total?: number | string;
  order_items?: ShiprocketOrderItem[];
  shipments?: ShiprocketOrderShipment[];
  pickup_location?: string;
  billing_customer_name?: string;
  billing_last_name?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  billing_address_2?: string;
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
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
  };
  [key: string]: unknown;
}

export interface ShiprocketProduct {
  id?: number;
  sku?: string;
  name?: string;
  price?: number;
  selling_price?: number;
  cost_price?: number;
  mrp?: number;
  image?: string;
  images?: string[];
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
  status?: string;
  [key: string]: unknown;
}

export interface ShiprocketProductListResponse {
  data?: ShiprocketProduct[];
  meta?: {
    pagination?: {
      total?: number;
      count?: number;
      per_page?: number;
      current_page?: number;
      total_pages?: number;
    };
  };
}

export interface ShiprocketProductFilters {
  page?: number;
  perPage?: number;
  search?: string;
  sku?: string;
}

export interface ShiprocketOrderListResponse {
  data?: ShiprocketOrder[];
  meta?: {
    pagination?: {
      total?: number;
      count?: number;
      per_page?: number;
      current_page?: number;
      total_pages?: number;
    };
  };
}

export interface ShiprocketOrderFilters {
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
  status?: string;
  channelId?: string;
  search?: string;
  sort?: "ASC" | "DESC";
}

export async function fetchShiprocketOrdersList(filters: ShiprocketOrderFilters = {}) {
  const query = new URLSearchParams();

  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.page) query.set("page", String(filters.page));
  if (filters.perPage) query.set("per_page", String(filters.perPage));
  if (filters.status) query.set("status", filters.status);
  if (filters.channelId) query.set("channel_id", filters.channelId);
  if (filters.search) query.set("search", filters.search);
  if (filters.sort) query.set("sort", filters.sort);

  const path = `/orders${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    const response = await shiprocketFetch<ShiprocketOrderListResponse>(path);

    // Log response for debugging
    if (filters.page === 1 || !filters.page) {
      console.log('📦 Shiprocket orders API response:', {
        path,
        ordersCount: response.data?.length ?? 0,
        pagination: response.meta?.pagination,
        filters,
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Shiprocket orders API error:', {
      path,
      filters,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function fetchShiprocketProductsList(filters: ShiprocketProductFilters = {}) {
  const query = new URLSearchParams();

  if (filters.page) query.set("page", String(filters.page));
  if (filters.perPage) query.set("per_page", String(filters.perPage));
  if (filters.search) query.set("search", filters.search);
  if (filters.sku) query.set("sku", filters.sku);

  const path = `/products${query.toString() ? `?${query.toString()}` : ""}`;
  return shiprocketFetch<ShiprocketProductListResponse>(path);
}

export interface ShiprocketOverviewMetrics {
  totalOrders: number;
  codOrders: number;
  prepaidOrders: number;
  todaysOrders: number;
  yesterdaysOrders?: number;
  newOrders: number; // Orders with NEW status (not yet shipped)
  totalRevenue: number;
  todayRevenue?: number;
  yesterdayRevenue?: number;
  averageOrderValue: number;
  period: { from: string; to: string };
  sampleSize: number;
  fetchedAt: string;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

export async function getShiprocketOverviewMetrics(range: { from: string; to: string }) {
  // Fetch all orders with pagination
  let allOrders: ShiprocketOrder[] = [];
  let currentPage = 1;
  const perPage = 200;
  let hasMorePages = true;

  console.log('📊 Fetching Shiprocket orders for metrics:', {
    from: range.from,
    to: range.to,
    perPage,
  });

  // Paginate through all orders
  while (hasMorePages) {
    try {
      const response = await fetchShiprocketOrdersList({
        from: range.from,
        to: range.to,
        page: currentPage,
        perPage,
        sort: "DESC",
      });

      const pageOrders = response.data ?? [];
      allOrders = [...allOrders, ...pageOrders];

      const pagination = response.meta?.pagination;
      const totalPages = pagination?.total_pages ?? 1;
      const currentPageCount = pagination?.count ?? pageOrders.length;

      console.log(`📄 Fetched page ${currentPage}/${totalPages}: ${currentPageCount} orders (total so far: ${allOrders.length})`);

      // Check if there are more pages
      if (currentPage >= totalPages || pageOrders.length === 0 || currentPageCount < perPage) {
        hasMorePages = false;
      } else {
        currentPage += 1;
      }
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      hasMorePages = false;
    }
  }

  console.log(`✅ Total orders fetched: ${allOrders.length}`);

  // Get today's date in IST (Indian Standard Time, UTC+5:30)
  // Shiprocket operates in IST, so we need to compare dates in IST
  const now = new Date();

  // Get current date in IST format (YYYY-MM-DD)
  // Use Intl.DateTimeFormat to get date in IST timezone
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const todayISO = istFormatter.format(now);

  // Get yesterday's date in IST
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = istFormatter.format(yesterday);

  console.log('📅 Date calculations (IST):', {
    utcNow: now.toISOString(),
    todayISO,
    yesterdayISO,
    utcDate: now.toISOString().slice(0, 10),
    istDate: todayISO,
  });

  // Helper function to parse Shiprocket date format
  const parseShiprocketDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';

    try {
      // Try parsing as Date object - handles formats like "26 Nov 2025, 05:05 PM"
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        // Convert to IST and format as YYYY-MM-DD
        const istFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        return istFormatter.format(parsed);
      }
    } catch (e) {
      // If parsing fails, try ISO format check
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.slice(0, 10);
      }
    }
    return '';
  };

  // Sample a few orders to see their date format
  if (allOrders.length > 0) {
    const sampleOrders = allOrders.slice(0, 3);
    console.log('📋 Sample order dates:', sampleOrders.map(order => {
      const rawDate = order.created_at || order.order_date || '';
      const parsedISO = parseShiprocketDate(rawDate);
      return {
        order_id: order.order_id || order.channel_order_id,
        created_at: order.created_at,
        order_date: order.order_date,
        parsedISO,
        matchesToday: parsedISO === todayISO,
      };
    }));
  }

  type RevenueTotals = {
    totalRevenue: number;
    codOrders: number;
    prepaidOrders: number;
    todaysOrders: number;
    yesterdaysOrders: number;
    newOrders: number;
    todayRevenue: number;
    yesterdayRevenue: number;
  };

  const totals = allOrders.reduce<RevenueTotals>(
    (acc, order) => {
      const total = toNumber(order.total) || toNumber(order.sub_total);
      acc.totalRevenue += total;

      // Check payment method - handle various formats
      const paymentMethod = (order.payment_method || '').toUpperCase().trim();
      if (paymentMethod === "COD" || paymentMethod.includes("COD")) {
        acc.codOrders += 1;
      } else if (paymentMethod) {
        acc.prepaidOrders += 1;
      } else {
        // If payment method is missing, default to prepaid
        acc.prepaidOrders += 1;
      }

      // Check date - Shiprocket may use created_at or order_date
      // Shiprocket returns dates in format like "26 Nov 2025, 05:05 PM"
      const orderDate = order.created_at || order.order_date || '';
      const orderDateISO = parseShiprocketDate(orderDate);

      // Compare dates (just the date part, ignore time)
      if (orderDateISO === todayISO) {
        acc.todaysOrders += 1;
        acc.todayRevenue += total;
      }
      if (orderDateISO === yesterdayISO) {
        acc.yesterdaysOrders += 1;
        acc.yesterdayRevenue += total;
      }

      // Count orders with NEW status (not yet shipped)
      const status = (order.status || '').toUpperCase().trim();
      if (status === 'NEW' || status.includes('NEW') || status === 'PENDING' || !status) {
        acc.newOrders += 1;
      }

      return acc;
    },
    {
      totalRevenue: 0,
      codOrders: 0,
      prepaidOrders: 0,
      todaysOrders: 0,
      yesterdaysOrders: 0,
      newOrders: 0,
      todayRevenue: 0,
      yesterdayRevenue: 0,
    }
  );

  const totalOrders = allOrders.length;
  const averageOrderValue = totalOrders ? totals.totalRevenue / totalOrders : 0;

  console.log('📈 Calculated metrics:', {
    totalOrders,
    codOrders: totals.codOrders,
    prepaidOrders: totals.prepaidOrders,
    todaysOrders: totals.todaysOrders,
    yesterdaysOrders: totals.yesterdaysOrders,
    newOrders: totals.newOrders,
    todayRevenue: totals.todayRevenue,
    yesterdayRevenue: totals.yesterdayRevenue,
    totalRevenue: totals.totalRevenue,
    averageOrderValue,
    todayISO,
    yesterdayISO,
  });

  const metrics: ShiprocketOverviewMetrics = {
    totalOrders,
    codOrders: totals.codOrders,
    prepaidOrders: totals.prepaidOrders,
    todaysOrders: totals.todaysOrders,
    yesterdaysOrders: totals.yesterdaysOrders,
    newOrders: totals.newOrders,
    totalRevenue: Number(totals.totalRevenue.toFixed(2)),
    todayRevenue: Number(totals.todayRevenue.toFixed(2)),
    yesterdayRevenue: Number(totals.yesterdayRevenue.toFixed(2)),
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    period: range,
    sampleSize: allOrders.length,
    fetchedAt: new Date().toISOString(),
  };

  return metrics;
}

export async function createShiprocketShipment(payload: ShiprocketOrderPayload) {
  if (!channelId) {
    throw new Error('SHIPROCKET_CHANNEL_ID must be configured.');
  }

  // Validate and normalize phone number
  const originalPhone = payload.deliveryAddress.phone;
  const normalizedPhone = normalizePhone(originalPhone);

  if (!normalizedPhone) {
    console.error('Shiprocket: Invalid phone number', {
      original: originalPhone,
      type: typeof originalPhone,
      normalized: normalizedPhone,
    });
    throw new Error(`Invalid phone number provided: "${originalPhone}". Phone number must be a valid 10-digit Indian mobile number (starting with 6-9).`);
  }

  // Check if phone number appears to be a test/fake number
  // Shiprocket rejects obvious test numbers like 7777777777, 1234567890, etc.
  if (isLikelyTestNumber(normalizedPhone)) {
    console.warn('Shiprocket: Phone number appears to be a test number', {
      original: originalPhone,
      normalized: normalizedPhone,
      warning: 'Shiprocket may reject this number as it appears to be a test/fake number',
    });
    // We'll still try to send it, but log a warning
    // Shiprocket will reject it if it's truly a test number
  }

  console.log('Shiprocket: Phone normalized', {
    original: originalPhone,
    normalized: normalizedPhone,
  });

  const body = {
    order_id: payload.orderNumber ?? payload.orderId,
    order_date: new Date().toISOString(),
    pickup_location: payload.pickupLocation ?? defaultPickupLocation,
    channel_id: Number(channelId),
    billing_customer_name: payload.deliveryAddress.name,
    billing_last_name: '',
    billing_phone: normalizedPhone,
    billing_email: payload.deliveryAddress.email ?? 'support@novino.io',
    billing_address: payload.deliveryAddress.addressLine1,
    billing_address_2: payload.deliveryAddress.addressLine2 ?? '',
    billing_city: payload.deliveryAddress.city,
    billing_state: payload.deliveryAddress.state,
    billing_country: payload.deliveryAddress.country ?? 'India',
    billing_pincode: payload.deliveryAddress.pincode,
    shipping_is_billing: true,
    payment_method: payload.paymentMethod,
    sub_total: payload.total,
    length: payload.dimensions?.length ?? 10,
    breadth: payload.dimensions?.breadth ?? 10,
    height: payload.dimensions?.height ?? 5,
    weight: payload.dimensions?.weight ?? 0.5,
    order_items: payload.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.units,
      selling_price: item.sellingPrice,
      discount: item.discount ?? 0,
    })),
  };

  let response = await shiprocketFetch<any>('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // Log the response to debug structure
  console.log('Shiprocket create order response:', JSON.stringify(response, null, 2));

  // Handle pickup location error - Shiprocket returns available locations when pickup location is wrong
  if (response.message && response.message.includes('Wrong Pickup location') && response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
    const availableLocation = response.data.data[0];
    const correctPickupLocation = availableLocation.pickup_location;

    console.warn(`Shiprocket: Wrong pickup location "${body.pickup_location}". Available location is "${correctPickupLocation}". Retrying with correct location...`);

    // Update the body with the correct pickup location
    body.pickup_location = correctPickupLocation;

    // Retry with the correct pickup location
    response = await shiprocketFetch<any>('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log('Shiprocket create order response (retry):', JSON.stringify(response, null, 2));
  }

  // Check if this is still an error response
  if (response.message && !response.order_id && !response.shipment_id) {
    console.error('Shiprocket order creation failed:', response);
    throw new Error(`Shiprocket order creation failed: ${response.message}. ${response.data?.data ? `Available pickup locations: ${JSON.stringify(response.data.data.map((loc: any) => loc.pickup_location))}` : ''}`);
  }

  // Normalize response field names - Shiprocket might return different field names
  // Handle both snake_case and camelCase variations
  const normalizedResponse = {
    order_id: response.order_id || response.orderId || response.order_id_raw || response.channel_order_id || null,
    shipment_id: response.shipment_id || response.shipmentId || response.shipment_id_raw || null,
    awb_code: response.awb_code || response.awbCode || response.awb || null,
    courier_company: response.courier_company || response.courierCompany || response.courier_name || null,
    courier_name: response.courier_name || response.courierName || response.courier_company || null,
    tracking_url: response.tracking_url || response.trackingUrl || response.tracking || null,
    status: response.status || response.status_code || null,
    status_code: response.status_code || response.statusCode || null,
    // Include all original fields for backwards compatibility
    ...response,
  };

  // Validate that we got the required fields
  if (!normalizedResponse.order_id && !normalizedResponse.shipment_id) {
    console.error('Shiprocket response missing required fields:', response);
    throw new Error(`Shiprocket order creation succeeded but response is missing required fields (order_id, shipment_id). Response: ${JSON.stringify(response)}`);
  }

  return normalizedResponse;
}

export async function scheduleShiprocketPickup(shipmentId: number, pickupDate?: string) {
  const body = {
    shipment_id: [shipmentId],
    pickup_date: pickupDate ?? new Date().toISOString().slice(0, 10),
  };

  return shiprocketFetch<any>('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchShiprocketTracking(shipmentId: number) {
  return shiprocketFetch<any>(`/courier/track/shipment/${shipmentId}`);
}

export function verifyShiprocketWebhook(_rawBody: string, signature: string | null) {
  if (!webhookSecret || !signature) return false;
  if (webhookSecret.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(webhookSecret));
}


