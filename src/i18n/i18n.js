
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

// Import translations
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import id from './locales/id.json';
import tr from './locales/tr.json';

import * as Location from 'expo-location';

const resources = {
    tr: { translation: tr },
    en: { translation: en },
    ar: { translation: ar },
    id: { translation: id },
    fr: { translation: fr },
};

const LANGUAGE_KEY = 'user_language';
const SUPPORTED_LANGUAGES = ['tr', 'en', 'ar', 'id', 'fr'];

// Initialize i18n synchronously with default language to prevent "NO_I18NEXT_INSTANCE" warning
i18n.use(initReactI18next).init({
    resources,
    lng: 'en', // Will be updated in initI18n()
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
});

// Detect language or fallback to 'en'
const getLanguage = async () => {
    try {
        // 1. Check saved preference
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) return savedLanguage;

        // 2. Check device locale
        const deviceLanguage = Localization.getLocales()[0]?.languageCode;
        if (SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
            await AsyncStorage.setItem(LANGUAGE_KEY, deviceLanguage);
            return deviceLanguage;
        }

        // 3. GPS Fallback for unsupported languages
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                const [address] = await Location.reverseGeocodeAsync(location.coords);

                if (address?.isoCountryCode === 'TR') {
                    await AsyncStorage.setItem(LANGUAGE_KEY, 'tr');
                    return 'tr';
                }
                if (address?.isoCountryCode === 'SA') {
                    await AsyncStorage.setItem(LANGUAGE_KEY, 'ar');
                    return 'ar';
                }
            }
        } catch (locationError) {
            console.warn('[i18n] Location detection failed:', locationError);
        }

        // 4. Default Fallback
        return 'en';
    } catch (error) {
        return 'en';
    }
};

export const initI18n = async () => {
    const language = await getLanguage();

    // Handle RTL for Arabic
    if (language === 'ar' && !I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
    } else if (language !== 'ar' && I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
    }

    // Change to detected language (i18n is already initialized synchronously)
    await i18n.changeLanguage(language);
};

export default i18n;
