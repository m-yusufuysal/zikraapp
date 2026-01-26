import AsyncStorage from '@react-native-async-storage/async-storage';

// Usage limits per tier
const LIMITS = {
    free: { dream: 1, dhikr: 1 },
    starter: { dream: 3, dhikr: 3 },
    pro: { dream: 10, dhikr: 10 },
    unlimited: { dream: 99, dhikr: 99 }
};

// Helper to get premium tier from local storage (synced with Supabase)
const getPremiumTier = async () => {
    try {
        const isPremium = await AsyncStorage.getItem('isPremium') === 'true';
        const tier = await AsyncStorage.getItem('premiumTier') || 'starter';
        return { isPremium, tier: isPremium ? tier : 'free' };
    } catch (e) {
        // Storage read error - default to free
        return { isPremium: false, tier: 'free' };
    }
};

export const checkLimit = async (type) => { // type: 'dream' or 'dhikr'
    try {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = await AsyncStorage.getItem('usage_date');

        let currentCount = 0;

        if (lastDate !== today) {
            // New day, reset counts
            await AsyncStorage.setItem('usage_date', today);
            await AsyncStorage.setItem('usage_dreams', '0');
            await AsyncStorage.setItem('usage_dhikrs', '0');
        } else {
            const countStr = await AsyncStorage.getItem(`usage_${type}s`);
            currentCount = parseInt(countStr || '0', 10);
        }

        // Get premium tier from local storage
        const { isPremium, tier } = await getPremiumTier();

        // Determine user tier and limits
        const userTier = isPremium ? tier : 'free';
        const limit = LIMITS[userTier]?.[type] || LIMITS.free[type];


        if (currentCount >= limit) {
            return { allowed: false, limit, currentCount, tier: userTier };
        }

        return { allowed: true, limit, currentCount, tier: userTier };

    } catch (e) {
        console.error("Limit check error:", e);
        return { allowed: true }; // Allow on error to be safe
    }
};

export const incrementUsage = async (type) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = await AsyncStorage.getItem('usage_date');

        if (lastDate !== today) {
            await AsyncStorage.setItem('usage_date', today);
            await AsyncStorage.setItem(`usage_${type}s`, '1');
            // Reset other one too just in case
            const other = type === 'dream' ? 'dhikr' : 'dream';
            await AsyncStorage.setItem(`usage_${other}s`, '0');
        } else {
            const countStr = await AsyncStorage.getItem(`usage_${type}s`);
            const currentCount = parseInt(countStr || '0', 10);
            await AsyncStorage.setItem(`usage_${type}s`, (currentCount + 1).toString());
        }
    } catch (e) {
        console.error("Increment usage error:", e);
    }
};

export const getRemainingCount = async (type) => {
    // Utility for UI if needed
    const check = await checkLimit(type);
    return Math.max(0, check.limit - check.currentCount);
};

// Force refresh premium status from local storage
export const refreshPremiumStatus = async () => {
    return await getPremiumTier();
};
