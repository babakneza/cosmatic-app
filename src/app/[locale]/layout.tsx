import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import type { Metadata } from 'next';
import { LayoutClientWrapper } from '@/components/layout/LayoutClientWrapper';

type Props = {
    children: ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    // Await the params first
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Directly load messages for the locale
    const messages = (await import(`@/messages/${locale}.json`)).default;

    // Determine text direction
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <NextIntlClientProvider messages={messages}>
            <LayoutClientWrapper direction={direction} locale={locale}>
                {children}
            </LayoutClientWrapper>
        </NextIntlClientProvider>
    );
}

// Metadata without viewport/themeColor
// DIAGNOSTIC: Temporarily disabled to isolate build error
// export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
//     const { locale } = await params;
//
//     return {
//         title: 'BuyJan - Online Shopping in Oman',
//         description: 'Shop online for electronics, fashion, home goods, and more with fast delivery across Oman',
//         // Remove viewport and themeColor from here as they're now in viewport.ts
//     };
// }
