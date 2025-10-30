/**
 * States/Governorates API
 * Handles fetching states for different countries
 */

export interface State {
    value: string;
    label_en: string;
    label_ar: string;
}

// Governorates by Country
export const STATES_BY_COUNTRY: Record<string | number, State[]> = {
    // Oman (ID: 7)
    7: [
        { value: 'muscat', label_en: 'Muscat', label_ar: 'مسقط' },
        { value: 'dhofar', label_en: 'Dhofar', label_ar: 'ظفار' },
        { value: 'musandam', label_en: 'Musandam', label_ar: 'مسندم' },
        { value: 'al_buraimi', label_en: 'Al Buraimi', label_ar: 'البريمي' },
        { value: 'ad_dakhiliyah', label_en: 'Ad Dakhiliyah', label_ar: 'الداخلية' },
        { value: 'al_batinah_north', label_en: 'Al Batinah North', label_ar: 'شمال الباطنة' },
        { value: 'al_batinah_south', label_en: 'Al Batinah South', label_ar: 'جنوب الباطنة' },
        { value: 'ash_sharqiyah_north', label_en: 'Ash Sharqiyah North', label_ar: 'شمال الشرقية' },
        { value: 'ash_sharqiyah_south', label_en: 'Ash Sharqiyah South', label_ar: 'جنوب الشرقية' },
        { value: 'ad_dhahirah', label_en: 'Ad Dhahirah', label_ar: 'الظاهرة' },
        { value: 'al_wusta', label_en: 'Al Wusta', label_ar: 'الوسطى' },
    ],
    // Bahrain (ID: 8)
    8: [
        { value: 'capital', label_en: 'Capital', label_ar: 'العاصمة' },
        { value: 'muharraq', label_en: 'Muharraq', label_ar: 'المحرق' },
        { value: 'northern', label_en: 'Northern', label_ar: 'الشمالية' },
        { value: 'southern', label_en: 'Southern', label_ar: 'الجنوبية' },
        { value: 'western', label_en: 'Western', label_ar: 'الغربية' },
    ],
    // Kuwait (ID: 9)
    9: [
        { value: 'capital', label_en: 'Capital', label_ar: 'العاصمة' },
        { value: 'ahmadi', label_en: 'Ahmadi', label_ar: 'الأحمدي' },
        { value: 'farwaniya', label_en: 'Farwaniya', label_ar: 'الفروانية' },
        { value: 'hawalli', label_en: 'Hawalli', label_ar: 'حولي' },
        { value: 'jahra', label_en: 'Jahra', label_ar: 'الجهراء' },
        { value: 'mubarak_alkabeer', label_en: 'Mubarak Al-Kabeer', label_ar: 'مبارك الكبير' },
    ],
    // Qatar (ID: 10)
    10: [
        { value: 'doha', label_en: 'Doha', label_ar: 'الدوحة' },
        { value: 'al_rayyan', label_en: 'Al Rayyan', label_ar: 'الريان' },
        { value: 'al_wakrah', label_en: 'Al Wakrah', label_ar: 'الوكرة' },
        { value: 'umm_salal', label_en: 'Umm Salal', label_ar: 'أم صلال' },
        { value: 'al_khor', label_en: 'Al Khor', label_ar: 'الخور' },
        { value: 'al_daayen', label_en: 'Al Daayen', label_ar: 'الدايين' },
    ],
    // Saudi Arabia (ID: 11)
    11: [
        { value: 'riyadh', label_en: 'Riyadh', label_ar: 'الرياض' },
        { value: 'jeddah', label_en: 'Jeddah', label_ar: 'جدة' },
        { value: 'makkah', label_en: 'Makkah', label_ar: 'مكة' },
        { value: 'madinah', label_en: 'Madinah', label_ar: 'المدينة' },
        { value: 'qassim', label_en: 'Qassim', label_ar: 'القصيم' },
        { value: 'eastern', label_en: 'Eastern', label_ar: 'الشرقية' },
        { value: 'asir', label_en: 'Asir', label_ar: 'عسير' },
        { value: 'tabuk', label_en: 'Tabuk', label_ar: 'تبوك' },
        { value: 'hail', label_en: 'Hail', label_ar: 'حائل' },
        { value: 'northern_borders', label_en: 'Northern Borders', label_ar: 'الحدود الشمالية' },
        { value: 'al_bahah', label_en: 'Al-Bahah', label_ar: 'الباحة' },
        { value: 'najran', label_en: 'Najran', label_ar: 'نجران' },
    ],
    // UAE (ID: 12)
    12: [
        { value: 'abu_dhabi', label_en: 'Abu Dhabi', label_ar: 'أبو ظبي' },
        { value: 'dubai', label_en: 'Dubai', label_ar: 'دبي' },
        { value: 'sharjah', label_en: 'Sharjah', label_ar: 'الشارقة' },
        { value: 'ajman', label_en: 'Ajman', label_ar: 'عجمان' },
        { value: 'umm_al_quwain', label_en: 'Umm Al Quwain', label_ar: 'أم القيوين' },
        { value: 'ras_al_khaimah', label_en: 'Ras Al Khaimah', label_ar: 'رأس الخيمة' },
        { value: 'fujairah', label_en: 'Fujairah', label_ar: 'الفجيرة' },
    ],
};

/**
 * Get states/governorates for a specific country
 * @param countryId - Country ID from the countries collection
 * @returns Array of states for the country
 */
export function getStatesByCountry(countryId?: string | number): State[] {
    if (!countryId) return [];

    // Convert to number for key lookup
    const numericId = typeof countryId === 'string' ? parseInt(countryId, 10) : countryId;

    return STATES_BY_COUNTRY[numericId] || [];
}

/**
 * Get a state name by country ID and state value
 * @param countryId - Country ID
 * @param stateValue - State value
 * @param locale - Language locale ('ar' or 'en')
 */
export function getStateName(countryId?: string | number, stateValue?: string, locale: string = 'en'): string {
    if (!countryId || !stateValue) return '';

    const states = getStatesByCountry(countryId);
    const state = states.find(s => s.value === stateValue);

    if (!state) return '';

    return locale === 'ar' ? state.label_ar : state.label_en;
}