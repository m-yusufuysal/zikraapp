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
    // TEMPORARY BYPASS: Return mocked unlimited access to avoid supabase errors
    return {
        allowed: true,
        limit: 999,
        currentCount: 0,
        tier: 'unlimited',
        deviceLimitReached: false,
        canBypassWithAd: true
    };
};

export const incrementUsage = async (type) => {
    // TEMPORARY BYPASS: Do nothing to avoid supabase errors
    return;
};

export const getRemainingCount = async (type) => {
    const check = await checkLimit(type);
    return Math.max(0, check.limit - check.currentCount);
};

// Force refresh premium status from local storage
export const refreshPremiumStatus = async () => {
    return await getPremiumTier();
};
