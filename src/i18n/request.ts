import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate that the incoming `locale` parameter is valid
    let locale = await requestLocale;

    // Ensure we have a valid locale
    if (!locale || !locales.includes(locale as Locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
        timeZone: 'Asia/Muscat',
        now: new Date(),
    };
});
