import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    const locales = ['ar', 'en'] as const;
    const defaultLocale = 'ar';

    // Validate that the incoming `locale` parameter is valid
    let locale = await requestLocale;

    // Ensure we have a valid locale
    if (!locale || !locales.includes(locale as typeof locales[number])) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./src/messages/${locale}.json`)).default,
        timeZone: 'Asia/Muscat',
        now: new Date(),
    };
});