import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    DHIKR_PROGRESS: 'dhikr_progress_',
};

/**
 * Saves the current progress of a Dhikr session.
 * @param {string} sessionId - The unique ID of the session.
 * @param {Array<number>} counts - Array of current counts for each step.
 */
export const saveDhikrProgress = async (sessionId, counts) => {
    if (!sessionId) return;
    try {
        const key = `${STORAGE_KEYS.DHIKR_PROGRESS}${sessionId}`;
        await AsyncStorage.setItem(key, JSON.stringify(counts));
    } catch (error) {
        console.error('Failed to save dhikr progress:', error);
    }
};

/**
 * Retrieves the saved progress of a Dhikr session.
 * @param {string} sessionId - The unique ID of the session.
 * @returns {Promise<Array<number>|null>} - Array of counts or null if not found.
 */
export const getDhikrProgress = async (sessionId) => {
    if (!sessionId) return null;
    try {
        const key = `${STORAGE_KEYS.DHIKR_PROGRESS}${sessionId}`;
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to retrieve dhikr progress:', error);
        return null;
    }
};

/**
 * Clears the saved progress of a Dhikr session.
 * @param {string} sessionId - The unique ID of the session.
 */
export const clearDhikrProgress = async (sessionId) => {
    if (!sessionId) return;
    try {
        const key = `${STORAGE_KEYS.DHIKR_PROGRESS}${sessionId}`;
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to clear dhikr progress:', error);
    }
};
