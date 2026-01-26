import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Finance Service
 * Fetches live metal prices (Gold/Silver) to assist with Zakat calculations.
 * Uses public APIs with fallback to static averages.
 */

const CACHE_KEY = 'metal_prices_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

// Static fallbacks (Updated Jan 2026 approx)
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
        // Ideally use a paid API like GoldAPI.io for production.
        // For open source / free tier, we use standard aggregators or simple math from base USD.

        // Fetch Gold Price (Xau) in USD
        const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const xauPrice = data.items[0].xauPrice; // 1 oz Gold in USD
            const xagPrice = data.items[0].xagPrice; // 1 oz Silver in USD

            // Convert Ounce to Gram (1 Troy Oz = 31.1035 g)
            const goldPerGramUSD = xauPrice / 31.1035;
            const silverPerGramUSD = xagPrice / 31.1035;

            // Get Exchange Rates if not USD
            let rate = 1;
            if (currencyCode !== 'USD') {
                // Free currency API
                const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
                const rateData = await rateRes.json();
                rate = rateData.rates[currencyCode] || 1;
            }

            const prices = {
                gold: Math.round(goldPerGramUSD * rate).toString(),
                silver: Math.round(silverPerGramUSD * rate).toString() // Keep silver precise? Zakat usually rounds.
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
