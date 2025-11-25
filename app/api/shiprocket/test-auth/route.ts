/**
 * API Route: Test Shiprocket Authentication
 * GET /api/shiprocket/test-auth
 */

import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/shiprocket/client';

export async function GET() {
    try {
        console.log('Testing Shiprocket authentication...');
        console.log('Email:', process.env.SHIPROCKET_EMAIL ? 'Set ✓' : 'Missing ✗');
        console.log('Password:', process.env.SHIPROCKET_PASSWORD ? 'Set ✓' : 'Missing ✗');

        const token = await getAuthToken();

        return NextResponse.json({
            success: true,
            message: 'Authentication successful!',
            tokenPreview: token.substring(0, 20) + '...',
        });
    } catch (error: any) {
        console.error('Auth test failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                hint: 'Check your SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env.local',
            },
            { status: 500 }
        );
    }
}
