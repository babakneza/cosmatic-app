/**
 * Countries API
 * Handles fetching countries from Directus
 */

import axios from 'axios';

export interface Country {
    id: string | number;
    countries: string;
    created_at?: string;
    updated_at?: string;
}

// Country ID to Name Mapping
export const COUNTRY_NAMES_BY_ID: Record<string | number, { en: string; ar: string }> = {
    7: { en: 'Oman', ar: 'عمان' },
    8: { en: 'Bahrain', ar: 'البحرين' },
    9: { en: 'Kuwait', ar: 'الكويت' },
    10: { en: 'Qatar', ar: 'قطر' },
    11: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    12: { en: 'UAE', ar: 'الإمارات العربية المتحدة' },
};

/**
 * Get country name by ID
 */
export function getCountryName(countryId: string | number | undefined, locale: string = 'en'): string | null {
    if (!countryId) return null;
    const country = COUNTRY_NAMES_BY_ID[countryId];
    if (!country) return null;
    return locale === 'ar' ? country.ar : country.en;
}

/**
 * Get all countries
 */
export async function getCountries(): Promise<Country[]> {
    try {
        const response = await axios.get('/api/countries');
        return response.data.data || [];
    } catch (error: any) {
        return [];
    }
}

/**
 * Get a single country by ID
 */
export async function getCountry(countryId: string): Promise<Country | null> {
    try {
        const response = await axios.get(`/api/countries/${countryId}`);
        return response.data.data || null;
    } catch (error: any) {
        return null;
    }
}