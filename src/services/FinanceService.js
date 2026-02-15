import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Finance Service
 * Fetches live metal prices (Gold/Silver) to assist with Zakat calculations.
 * Uses public APIs with fallback to static averages.
 */

const CACHE_KEY = 'metal_prices_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

const FALLBACK_PRICES = {
    TRY: { gold: 3400, silver: 42 },
    USD: { gold: 95, silver: 1.2 },
    EUR: { gold: 88, silver: 1.1 },
    GBP: { gold: 75, silver: 0.95 },
    SAR: { gold: 355, silver: 4.5 },
    AED: { gold: 350, silver: 4.4 },
    QAR: { gold: 345, silver: 4.3 },
    KWD: { gold: 28, silver: 0.35 },
    EGP: { gold: 4600, silver: 58 },
    AZN: { gold: 160, silver: 2.0 },
    PKR: { gold: 26500, silver: 330 },
    IDR: { gold: 1500000, silver: 19000 }
};

// Common currencies to preload on app start
const PRELOAD_CURRENCIES = ['TRY', 'USD', 'EUR', 'SAR', 'IDR'];

export const getMetalPrices = async (currencyCode = 'TRY') => {
    try {
        // 1. Check Cache
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION && data[currencyCode]) {
                return data[currencyCode];
            }
        }

        // 2. Fetch Live Data
        // Using api.gold-api.com (Reliable and fast response)
        const [goldRes, silverRes] = await Promise.all([
            fetch('https://api.gold-api.com/price/XAU'),
            fetch('https://api.gold-api.com/price/XAG')
        ]);

        const goldData = await goldRes.json();
        const silverData = await silverRes.json();

        if (goldData.price && silverData.price) {
            const xauPrice = goldData.price; // 1 oz Gold in USD
            const xagPrice = silverData.price; // 1 oz Silver in USD

            // Convert Ounce to Gram (1 Troy Oz = 31.1035 g)
            const goldPerGramUSD = xauPrice / 31.1035;
            const silverPerGramUSD = xagPrice / 31.1035;

            // Get Exchange Rates if not USD
            let rate = 1;
            if (currencyCode !== 'USD') {
                const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
                const rateData = await rateRes.json();
                rate = rateData.rates[currencyCode] || 1;
            }

            const prices = {
                gold: Math.round(goldPerGramUSD * rate).toString(),
                silver: Math.round(silverPerGramUSD * rate).toString()
            };

            // Update Cache (Merge with existing)
            const newCacheData = cached ? JSON.parse(cached).data : {};
            newCacheData[currencyCode] = prices;

            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: newCacheData
            }));

            return prices;
        }

        throw new Error('Invalid API response');

    } catch (error) {
        console.warn('[FinanceService] Fetch failed, using fallback:', error);
        return FALLBACK_PRICES[currencyCode] || FALLBACK_PRICES.TRY;
    }
};

/**
 * Preload metal prices for common currencies on app startup.
 * This ensures ZekatMatik loads instantly without network delay.
 */
export const preloadMetalPrices = async () => {
    try {
        if (__DEV__) console.log('[FinanceService] Preloading metal prices...');

        // Fetch all common currencies in parallel
        await Promise.all(
            PRELOAD_CURRENCIES.map(currency => getMetalPrices(currency))
        );

        if (__DEV__) console.log('[FinanceService] Metal prices preloaded successfully');
    } catch (error) {
        console.warn('[FinanceService] Preload failed:', error);
        // Fail silently - prices will be fetched on-demand
    }
};
