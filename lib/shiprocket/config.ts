/**
 * Shiprocket API Configuration
 * Official Documentation: https://apidocs.shiprocket.in
 */

export const SHIPROCKET_CONFIG = {
    // API Base URL
    BASE_URL: 'https://apiv2.shiprocket.in/v1/external',

    // Authentication
    AUTH: {
        EMAIL: process.env.SHIPROCKET_EMAIL || '',
        PASSWORD: process.env.SHIPROCKET_PASSWORD || '',
    },

    // Token will be stored in memory and refreshed when needed
    TOKEN_EXPIRY_HOURS: 10, // Shiprocket tokens expire after 10 days but we refresh more frequently
} as const;

export interface ShiprocketAuthResponse {
    token: string;
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company_id: number;
}

export interface ShiprocketError {
    message: string;
    status_code: number;
    errors?: Record<string, string[]>;
}
