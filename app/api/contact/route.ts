import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        await sendContactEmail(name, email, subject, message);

        return NextResponse.json(
            { message: 'Message sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending contact email:', error);
        return NextResponse.json(
            { message: 'Failed to send message' },
            { status: 500 }
        );
    }
}
