/**
 * Shiprocket API Client
 * Handles authentication and API requests
 */

import { SHIPROCKET_CONFIG, ShiprocketAuthResponse, ShiprocketError } from './config';

// In-memory token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Get authentication token (cached or fresh)
 */
export async function getAuthToken(): Promise<string> {
    // Return cached token if still valid
    if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    // Get fresh token
    try {
        const response = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: SHIPROCKET_CONFIG.AUTH.EMAIL,
                password: SHIPROCKET_CONFIG.AUTH.PASSWORD,
            }),
        });

        if (!response.ok) {
            throw new Error(`Shiprocket auth failed: ${response.statusText}`);
        }

        const data: ShiprocketAuthResponse = await response.json();

        // Cache token
        cachedToken = data.token;
        tokenExpiresAt = Date.now() + (SHIPROCKET_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

        return data.token;
    } catch (error) {
        console.error('Shiprocket authentication error:', error);
        throw new Error('Failed to authenticate with Shiprocket');
    }
}

/**
 * Make authenticated API request to Shiprocket
 */
export async function shiprocketRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();

    const response = await fetch(`${SHIPROCKET_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = data as ShiprocketError;
        console.error('Shiprocket API error:', error);
        throw new Error(error.message || 'Shiprocket API request failed');
    }

    return data as T;
}

/**
 * Clear cached token (useful for logout or token refresh)
 */
export function clearAuthToken() {
    cachedToken = null;
    tokenExpiresAt = null;
}
