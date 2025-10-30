import type { Metadata, Viewport } from 'next';
import { Inter, Lora, Cairo } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import './globals.css';

// English fonts - Premium combination
const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-en-sans',
    display: 'swap',
});

const lora = Lora({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-en-serif',
    display: 'swap',
});

// Arabic font - Cairo with fallback to Tajawal for luxury aesthetic
const cairo = Cairo({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-ar-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Buyjan - Premium Beauty Products in Oman',
    description: 'Your favorite store for luxury cosmetics and beauty products in Oman. Shop the latest beauty trends with free shipping.',
    keywords: 'cosmetics, beauty, makeup, skincare, Oman, luxury beauty, buyjan',
    authors: [{ name: 'Buyjan' }],
    openGraph: {
        title: 'Buyjan - Premium Beauty Products in Oman',
        description: 'Your favorite store for luxury cosmetics and beauty products in Oman',
        url: 'https://buyjan.com',
        siteName: 'Buyjan',
        locale: 'ar_OM',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buyjan - Premium Beauty Products in Oman',
        description: 'Your favorite store for luxury cosmetics and beauty products in Oman',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#D4AF37',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" suppressHydrationWarning>
            <body className={`${inter.variable} ${lora.variable} ${cairo.variable} antialiased`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
