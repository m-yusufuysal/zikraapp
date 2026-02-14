import { MMKV } from "react-native-mmkv";
/**
 * Location Service - Hybrid Cache Strategy
 * 
 * Purpose: "Cache-First, Then-Fresh" strategy for instant location data.
 * - Step 0: Return last cached location immediately (no waiting)
 * - Step 1: Fetch fresh GPS in background
 * - Step 2: Update cache and notify listeners silently
 *
 * Uses MMKV for fast encrypted storage.
 */
import * as Location from 'expo-location';

// Initialize MMKV storage
const storage = new MMKV({ id: 'location-cache' });

const CACHE_KEY = 'last_location';
const CACHE_EXPIRY_KEY = 'last_location_expiry';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Gets cached location instantly, then fetches fresh data in background.
 * Returns cached data immediately (or null if no cache).
 */
export const getHybridLocation = async ({ onCached, onFresh, onError }) => {
    try {
        // === STEP 0: Immediate Cache Return ===
        const cachedJson = storage.getString(CACHE_KEY);
        const expiry = storage.getNumber(CACHE_EXPIRY_KEY) || 0;

        if (cachedJson && Date.now() < expiry) {
            const cached = JSON.parse(cachedJson);
            if (onCached) onCached(cached);
        }

        // === STEP 1: Background GPS Fetch ===
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn('[LocationService] Permission denied');
            if (onError) onError(new Error('LOCATION_PERMISSION_DENIED'));
            return null; // Return null to trigger graceful fallback in UI
        }

        // Use getLastKnownPositionAsync first (instant, might be stale)
        const lastKnown = await Location.getLastKnownPositionAsync({
            maxAge: 5 * 60 * 1000, // Accept positions up to 5 minutes old
        });

        if (lastKnown && !cachedJson) {
            // If no cache but we have lastKnown, return that immediately
            if (onCached) onCached(lastKnown);
        }

        // Now get high-accuracy position (this can take time)
        try {
            const fresh = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Good balance of speed/accuracy
                timeInterval: 5000,
                distanceInterval: 100,
            });

            // === STEP 2: Update Cache ===
            storage.set(CACHE_KEY, JSON.stringify(fresh));
            storage.set(CACHE_EXPIRY_KEY, Date.now() + CACHE_TTL_MS);

            if (onFresh) onFresh(fresh);
            return fresh;
        } catch (locError) {
            // Handle error 1 (Denied) or other fetch errors
            if (locError.code === 'E_LOCATION_UNAUTHORIZED' || locError.message?.includes('error 1')) {
                console.warn('[LocationService] Fetch unauthorized/denied');
                if (onError) onError(new Error('LOCATION_PERMISSION_DENIED'));
                return null;
            }
            throw locError;
        }

    } catch (error) {
        console.error('[LocationService] Error:', error);
        if (onError) onError(error);
        return null;
    }
};

/**
 * Get cached location synchronously (for immediate display on app open)
 */
export const getCachedLocation = () => {
    try {
        const cachedJson = storage.getString(CACHE_KEY);
        if (cachedJson) {
            return JSON.parse(cachedJson);
        }
    } catch (error) {
        console.error('[LocationService] Cache read error:', error);
    }
    return null;
};

/**
 * Clear location cache
 */
export const clearLocationCache = () => {
    storage.delete(CACHE_KEY);
    storage.delete(CACHE_EXPIRY_KEY);
};
