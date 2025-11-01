import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as ContactFormData;

        const { fullName, email, phone, subject, message } = body;

        if (!fullName || !email || !phone || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        console.log('Contact form submission:', {
            fullName,
            email,
            phone,
            subject,
            message,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Contact form submitted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Failed to process contact form' },
            { status: 500 }
        );
    }
}
