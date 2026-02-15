import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const CACHE_KEY = '@islamvy_daily_quote';

/**
 * Strips any citation/reference text that may have leaked into the body.
 */
const cleanBody = (body) => {
    if (!body) return '';
    let clean = body.trim();

    // Remove trailing parenthetical citations
    clean = clean.replace(/\s*\([^)]*(?:Surah|Sura|Sure|Sourate|سورة|Quran|Qur'an|Coran|Kur'an|Kuran|Hadith|Hadis|Hadîs|Bukhari|Buhârî|Muslim|Müslim|Tirmidhi|Tirmizî|Abu Dawud|Ebû Dâvud|Nasai|Nesâî|Ibn Majah|İbn Mâce|Taberânî|Beyhakî)[^)]*\)\s*$/i, '').trim();

    // Remove trailing bracket citations
    clean = clean.replace(/\s*\[[^\]]*(?:Surah|Sura|Sure|Sourate|سورة|Quran|Qur'an|Coran|Kur'an|Kuran|Hadith|Hadis)[^\]]*\]\s*$/i, '').trim();

    // Remove trailing "— Source" or "- Source" citations
    clean = clean.replace(/\s*[—–-]\s*(?:Surah|Sura|Sure|Sourate|سورة|Quran|Qur'an|Coran|Hadith|Hadis).*$/i, '').trim();

    // Remove leading/trailing quotation marks if present
    clean = clean.replace(/^[""\u201C\u201D]+|[""\u201C\u201D]+$/g, '').trim();

    return clean;
};

/**
 * Get the locally cached daily quote from AsyncStorage.
 */
const getCachedQuote = async () => {
    try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

/**
 * Save the daily quote to AsyncStorage for offline access.
 */
const setCachedQuote = async (quoteData) => {
    try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(quoteData));
    } catch (e) {
        console.warn('Failed to cache daily quote:', e);
    }
};

/**
 * Returns a daily quote. Strategy:
 * 1. Try Supabase Edge Function (AI-generated, priority-based)
 * 2. If that fails, show the locally cached quote (persists offline, even for days)
 * 3. If no cache exists at all, show a hardcoded emergency fallback
 *
 * Once fetched, the quote is cached locally. It updates only when a new day's
 * quote is successfully fetched.
 */
export const getDailyQuote = async (language = 'en', date = null) => {
    const langCode = (language || 'en').split('-')[0].toLowerCase();
    const d = date ? new Date(date) : new Date();
    const requestedDate = d.toISOString().split('T')[0];

    // Check local cache first
    const cached = await getCachedQuote();
    const cacheIsForToday = cached && cached.date === requestedDate && cached.language === langCode;

    // If we have today's cache, return it immediately (no network needed)
    if (cacheIsForToday) {
        if (__DEV__) console.log('[DailyQuote] Returning cached quote for today.');
        return cached;
    }

    // Try fetching from Supabase
    try {
        const { data, error } = await supabase.functions.invoke('get-daily-quote', {
            body: { language: langCode, date: requestedDate }
        });

        if (!error && data && !data.is_fallback) {
            if (__DEV__) console.log('[DailyQuote] Fetched fresh quote from Supabase.');

            const result = {
                body: cleanBody(data.body),
                title: data.title,
                citation: data.citation,
                type: data.type || 'verse',
                contextReason: data.context_reason || null,
                id: data.id || 'ai-generated',
                date: requestedDate,
                language: langCode
            };

            // Cache it for offline access
            await setCachedQuote(result);
            return result;
        }

        if (error) console.warn('[DailyQuote] Supabase error:', error.message);
    } catch (fetchError) {
        console.warn('[DailyQuote] Network error:', fetchError);
    }

    // Network failed — return whatever we have cached (even from a previous day)
    if (cached) {
        if (__DEV__) console.log('[DailyQuote] Offline — returning stale cached quote.');
        return cached;
    }

    // Absolute last resort — no cache, no network
    if (__DEV__) console.log('[DailyQuote] No cache, no network — using hardcoded fallback.');

    const fallbacks = {
        tr: { body: "Öyleyse beni anın ki ben de sizi anayım.", citation: "BAKARA, 152", title: "Günün Sözü" },
        en: { body: "So remember Me; I will remember you.", citation: "AL-BAQARAH, 152", title: "Daily Inspiration" },
        ar: { body: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", citation: "البقرة، 152", title: "ذكرى اليوم" },
        fr: { body: "Souvenez-vous de Moi, Je me souviendrai de vous.", citation: "AL-BAQARAH, 152", title: "Inspiration du Jour" },
        id: { body: "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.", citation: "AL-BAQARAH, 152", title: "Inspirasi Harian" }
    };

    const fb = fallbacks[langCode] || fallbacks.en;
    return {
        body: fb.body,
        title: fb.title,
        citation: fb.citation,
        type: 'verse',
        contextReason: null,
        id: 'hardcoded-fallback',
        date: requestedDate,
        language: langCode
    };
};
