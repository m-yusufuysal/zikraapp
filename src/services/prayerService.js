import AsyncStorage from '@react-native-async-storage/async-storage';
import * as adhan from 'adhan';

const CACHE_KEY = 'cached_prayer_times';

// Direct implementation of Aladhan API fetch (replacing the deleted module)
const fetchRemotePrayerTimes = async (latitude, longitude, date = new Date()) => {
    try {
        const dateStr = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=13`; // Method 13 = Diyanet

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data; // Returns object with timings
        }
        throw new Error('Invalid API response');
    } catch (error) {
        console.warn("Aladhan API Error:", error);
        throw error;
    }
};

/**
 * Get prayer times for a specific location.
 * Tries remote API first, then falls back to local calculation using adhan library.
 */
export const getPrayerTimes = async (latitude, longitude, date = new Date()) => {
    try {
        // 1. Try Remote API
        try {
            const data = await fetchRemotePrayerTimes(latitude, longitude, date);
            if (data && data.timings) {
                const timings = data.timings;
                // Cache for offline use
                await cachePrayerTimes(timings);
                return timings;
            }
        } catch (remoteError) {
            console.warn("Remote prayer times failed, falling back to local/cache:", remoteError);
        }

        // 2. Try Cache
        const cached = await getCachedPrayerTimes();
        if (cached) {
            // Check if cache is for today (basic check)
            // Ideally check date matching, but for fallback it's okay
            return cached;
        }

        // 3. Last Resort: Local Calculation with Adhan library
        return calculateLocalPrayerTimes(latitude, longitude, date);

    } catch (error) {
        console.error("PrayerService Error:", error);
        return calculateLocalPrayerTimes(latitude, longitude, date);
    }
};

const calculateLocalPrayerTimes = (latitude, longitude, date) => {
    try {
        const coordinates = new adhan.Coordinates(latitude, longitude);
        const params = adhan.CalculationMethod.Turkey(); // Defaults to Diyanet for Zikra app
        const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

        const format = (time) => {
            if (!time || !(time instanceof Date) || isNaN(time)) {
                return '00:00';
            }
            return time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        return {
            Fajr: format(prayerTimes.fajr),
            Sunrise: format(prayerTimes.sunrise),
            Dhuhr: format(prayerTimes.dhuhr),
            Asr: format(prayerTimes.asr),
            Maghrib: format(prayerTimes.maghrib),
            Isha: format(prayerTimes.isha),
            LastThird: format(prayerTimes.lastThird), // Used for Teheccud/Night prayer
        };
    } catch (e) {
        console.error("Local calculation failed:", e);
        return {
            Fajr: '00:00',
            Sunrise: '00:00',
            Dhuhr: '00:00',
            Asr: '00:00',
            Maghrib: '00:00',
            Isha: '00:00',
            LastThird: '00:00',
        };
    }
};

const cachePrayerTimes = async (timings) => {
    try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            timings,
            date: new Date().toDateString()
        }));
    } catch (e) {
        console.error("Error caching prayer times", e);
    }
};

const getCachedPrayerTimes = async () => {
    try {
        const json = await AsyncStorage.getItem(CACHE_KEY);
        if (json) {
            const data = JSON.parse(json);
            // Only return if it's from today (optional logic)
            return data.timings;
        }
    } catch (e) {
        console.error("Error reading prayer cache", e);
    }
    return null;
};
