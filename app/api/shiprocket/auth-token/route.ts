/**
 * API Route: Get Shiprocket Auth Token
 * Returns the current Shiprocket authentication token
 */

import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/shiprocket/client';

export async function GET() {
    try {
        const token = await getAuthToken();

        return NextResponse.json({
            success: true,
            token,
        });
    } catch (error) {
        console.error('Error getting auth token:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get authentication token',
            },
            { status: 500 }
        );
    }
}
