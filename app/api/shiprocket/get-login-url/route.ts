/**
 * API Route: Get Shiprocket Login URL
 * Creates an intermediary login page that will auto-authenticate with Shiprocket
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Return a URL to our own login handler page
        const baseUrl = request.nextUrl.origin;
        const loginUrl = `${baseUrl}/shiprocket/login`;

        return NextResponse.json({
            success: true,
            loginUrl,
        });
    } catch (error) {
        console.error('Error generating login URL:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate login URL',
            },
            { status: 500 }
        );
    }
}
