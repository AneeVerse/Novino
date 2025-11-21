import { cookies } from 'next/headers';
import type { NextApiRequest } from 'next';
import type { NextRequest } from 'next/server';
import { cache } from 'react';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { parse as parseCookie } from 'cookie';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase anon key environment variable');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase service role key environment variable');
}

let serviceRoleClient: SupabaseClient | null = null;

export const getSupabaseServerClient = cache(() => {
  const cookieStore = cookies();

  return createServerSupabaseClient({
    cookies: () => cookieStore,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
  });
});

export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (!serviceRoleClient) {
    serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return serviceRoleClient;
}

type SupportedRequest = NextApiRequest | NextRequest | Request;

function getHeaderValue(req: SupportedRequest, name: string): string | null {
  if ('headers' in req) {
    const headers: any = req.headers;
    if (typeof headers.get === 'function') {
      return headers.get(name) || headers.get(name.toLowerCase());
    }

    const headerValue =
      headers[name.toLowerCase() as keyof typeof headers] ??
      headers[name as keyof typeof headers];

    if (Array.isArray(headerValue)) {
      return headerValue[0] ?? null;
    }

    return (headerValue as string) ?? null;
  }

  return null;
}

function getCookieValue(req: SupportedRequest, name: string): string | null {
  if ('cookies' in req) {
    const cookiesOrStore: any = (req as any).cookies;

    // NextRequest / Request cookies
    if (typeof cookiesOrStore.get === 'function') {
      return cookiesOrStore.get(name)?.value || null;
    }

    // NextApiRequest cookies object
    if (typeof cookiesOrStore === 'object' && cookiesOrStore !== null) {
      return cookiesOrStore[name] ?? null;
    }
  }

  // Fallback to manually parsing the cookie header
  const cookieHeader =
    getHeaderValue(req, 'cookie') || getHeaderValue(req, 'Cookie');
  if (cookieHeader) {
    const parsed = parseCookie(cookieHeader);
    return parsed[name] ?? null;
  }

  return null;
}

export function getSupabaseTokenFromRequest(req: SupportedRequest): string | null {
  const authHeader =
    getHeaderValue(req, 'authorization') || getHeaderValue(req, 'Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Supabase auth helpers store the access token in this cookie
  return (
    getCookieValue(req, 'sb-access-token') ||
    getCookieValue(req, 'supabase-access-token') ||
    null
  );
}

export async function getSupabaseUserFromRequest(req: SupportedRequest): Promise<{
  user: User | null;
  error: Error | null;
  accessToken: string | null;
}> {
  const token = getSupabaseTokenFromRequest(req);

  if (!token) {
    return {
      user: null,
      error: new Error('Missing Supabase access token'),
      accessToken: null,
    };
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      user: null,
      error: error ?? new Error('Unable to load Supabase user'),
      accessToken: token,
    };
  }

  return { user: data.user, error: null, accessToken: token };
}


