import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    LANGUAGE: 'user_language', // 'tr' or 'id'
};

export const getLanguage = async () => {
    try {
        const value = await AsyncStorage.getItem(KEYS.LANGUAGE);
        return value || 'tr'; // Default to Turkish
    } catch (e) {
        console.error("Error reading language", e);
        return 'tr';
    }
};

export const setLanguage = async (lang) => {
    try {
        await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
    } catch (e) {
        // ignore error
    }
};

const CACHE_KEYS = {
    LOCATION: 'cached_location',
    PRAYER_TIMES: 'cached_prayer_times'
};

export const setLocationCache = async (data) => {
    try {
        await AsyncStorage.setItem(CACHE_KEYS.LOCATION, JSON.stringify(data));
    } catch (e) {
        console.error("Error caching location", e);
    }
};

export const getLocationCache = async () => {
    try {
        const data = await AsyncStorage.getItem(CACHE_KEYS.LOCATION);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

export const setPrayerTimesCache = async (data) => {
    try {
        await AsyncStorage.setItem(CACHE_KEYS.PRAYER_TIMES, JSON.stringify(data));
    } catch (e) {
        console.error("Error caching prayer times", e);
    }
};

export const getPrayerTimesCache = async () => {
    try {
        const data = await AsyncStorage.getItem(CACHE_KEYS.PRAYER_TIMES);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};
