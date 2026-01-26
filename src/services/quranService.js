import AsyncStorage from '@react-native-async-storage/async-storage';
import { MANUAL_TRANSLATIONS } from '../data/manualTranslations';
import { SURAH_INFO } from '../data/surahInfo';
import { SURAH_NAMES } from '../data/surahNames';

/**
 * Quran Service - Using Quran.com API v4
 * 
 * FEATURES:
 * - Uses text_uthmani for authentic Mushaf text with full Tajweed marks
 * - Includes Waqf (stop) signs: ۚ ۖ ۗ ۘ ۙ
 * - Proper Madd (elongation) marks and special Uthmani characters
 * - Official Quran.com translations (Diyanet, Saheeh International, etc.)
 */

const BASE_URL = 'https://api.quran.com/api/v4';

/**
 * Robust helper to fetch all pages from a paginated Quran.com endpoint
 */
const fetchAllPages = async (endpoint, params = {}) => {
    let allItems = [];
    let page = 1;
    let hasNextPage = true;

    try {
        const queryParams = new URLSearchParams({
            ...params,
            per_page: 100, // API standard max
        });

        while (hasNextPage) {
            queryParams.set('page', page);
            const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
            const data = await response.json();

            // The API returns ayahs in "verses" array
            const items = data.verses || [];
            if (items.length === 0) break;

            allItems = [...allItems, ...items];

            const pagination = data.pagination;
            if (pagination && pagination.next_page) {
                page = pagination.next_page;
            } else {
                hasNextPage = false;
            }

            // Safety break to prevent infinite loops (max 50 pages for any segment)
            if (page > 50) break;
        }

        return allItems;
    } catch (error) {
        console.error(`[QuranService] fetchAllPages error for ${endpoint}:`, error);
        return [];
    }
};

// Quran.com Translation Resource IDs
const TRANSLATION_IDS = {
    ar: null, // No translation needed for Arabic
    tr: 77,   // Turkish Translation(Diyanet)
    en: 20,   // Saheeh International (Verified stable)
    id: 33,   // Indonesian Ministry of Religious Affairs (Kemenag)
};

// Audio Reciter ID (Mishary Alafasy)
const RECITER_ID = 7;

// Map language code to translation ID
const getTranslationId = (language) => {
    if (!language) return 77;
    const langCode = language.split('-')[0];
    if (langCode === 'tr') return 77;
    return TRANSLATION_IDS[langCode] ?? 20;
};

/**
 * Clean footnote reference numbers from translation text
 * Removes patterns like "word1", "word,2", "word.3" which are footnote markers
 */
const cleanTranslation = (text) => {
    if (!text) return null;
    // Remove HTML tags first
    let cleaned = text.replace(/<[^>]*>/g, '');
    // Remove footnote numbers that appear after words/punctuation (e.g., "Allāh,1" -> "Allāh,")
    // Pattern: digit(s) that follow a letter or punctuation and are followed by space, punctuation, or end
    cleaned = cleaned.replace(/([a-zA-ZāīūĀĪŪ.,;:!?'"\-])\d+/g, '$1');
    // Clean up any trailing punctuation followed by nothing (like "word, " -> "word, ")
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
};

/**
 * Clear all Quran-related cache (call this if data seems stale)
 */
export const clearQuranCache = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const quranKeys = allKeys.filter(key =>
            key.startsWith('surah_meta') ||
            key.startsWith('quran_')
        );
        if (quranKeys.length > 0) {
            await AsyncStorage.multiRemove(quranKeys);
        }
        return true;
    } catch (error) {
        console.error('[QuranService] Failed to clear cache:', error);
        return false;
    }
};

export const getSurahs = async (language) => {
    try {
        const langCode = (language || 'tr').split('-')[0];
        // Cache key for surah list meta - v5_uthmani uses authentic Mushaf text
        const cacheKey = `surah_meta_v5_uthmani_${langCode}`;
        const cached = await AsyncStorage.getItem(cacheKey);

        // If we have valid cached data, return it
        if (cached) {
            return JSON.parse(cached);
        }

        // Fetch chapters list from Quran.com API v4
        const response = await fetch(`${BASE_URL}/chapters?language=${langCode}`);
        const data = await response.json();

        if (data.chapters && data.chapters.length > 0) {
            // Transform to match expected format
            const surahs = data.chapters.map(chapter => ({
                number: chapter.id,
                name: chapter.name_arabic,
                englishName: chapter.name_simple,
                englishNameTranslation: chapter.translated_name?.name || chapter.name_simple,
                numberOfAyahs: chapter.verses_count,
                revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
                // Add localized name from our local data for better accuracy
                localizedName: SURAH_NAMES[chapter.id]?.[langCode] || chapter.name_simple
            }));

            await AsyncStorage.setItem(cacheKey, JSON.stringify(surahs));
            return surahs;
        }
        throw new Error('Failed to fetch surahs');
    } catch (error) {
        console.error("Error fetching surahs:", error);
        return [];
    }
};

export const getSurahDetails = async (surahNumber, language) => {
    try {
        const langCode = (language || 'tr').split('-')[0];
        const translationId = getTranslationId(language);

        // 1. Fetch all verses using paginated helper
        const params = {
            language: langCode,
            words: 'false',
            fields: 'text_uthmani,verse_key,verse_number,page_number',
            v: 'v4_saheeh'
        };

        if (translationId && langCode !== 'ar') {
            params.translations = translationId;
        }

        const allVerses = await fetchAllPages(`/verses/by_chapter/${surahNumber}`, params);

        if (!allVerses || allVerses.length === 0) {
            throw new Error('Failed to fetch verses');
        }

        // Strict Sorting: Sura Number + Verse Number to guarantee sequence
        allVerses.sort((a, b) => {
            const [aSura, aVerse] = a.verse_key.split(':').map(Number);
            const [bSura, bVerse] = b.verse_key.split(':').map(Number);
            if (aSura !== bSura) return aSura - bSura;
            return aVerse - bVerse;
        });

        // 2. Fetch audio and chapter info (non-paginated or simpler)
        const audioUrl = `${BASE_URL}/recitations/${RECITER_ID}/by_chapter/${surahNumber}?per_page=999`;
        const chapterUrl = `${BASE_URL}/chapters/${surahNumber}?language=${langCode}`;

        const [audioResponse, chapterResponse] = await Promise.all([
            fetch(audioUrl),
            fetch(chapterUrl)
        ]);

        const audioData = await audioResponse.json();
        const chapterData = await chapterResponse.json();

        // Build audio map (verse_key -> {url, duration})
        const audioMap = new Map();
        if (audioData.audio_files) {
            audioData.audio_files.forEach(audio => {
                audioMap.set(audio.verse_key, { url: audio.url, duration: audio.duration_ms });
            });
        }

        // Build ayahs array
        const ayahs = allVerses.map((verse, idx) => {
            const verseKey = verse.verse_key;
            const audioInfo = audioMap.get(verseKey);
            const audioUrl = audioInfo?.url;
            const durationMs = audioInfo?.duration;

            // Get translation text
            let translationText = null;

            // Check for manual override first
            const manualTr = MANUAL_TRANSLATIONS[langCode]?.[surahNumber]?.[verse.verse_number] ||
                MANUAL_TRANSLATIONS[langCode]?.[String(surahNumber)]?.[verse.verse_number];

            if (manualTr) {
                translationText = manualTr;
            } else if (verse.translations && verse.translations.length > 0) {
                // Clean footnote numbers and HTML tags from translation
                translationText = cleanTranslation(verse.translations[0].text);
            }

            return {
                number: verse.id, // Global verse ID
                numberInSurah: verse.verse_number,
                text: verse.text_uthmani, // Authentic Mushaf text with Tajweed & Waqf marks
                translation: translationText,
                audio: audioUrl ? `https://verses.quran.com/${audioUrl}` : null,
                duration: durationMs || 0, // Pass duration (milliseconds)
                juz: verse.juz_number,
                page: verse.page_number,
                surahName: langCode === 'ar'
                    ? chapterData.chapter?.name_arabic
                    : (SURAH_NAMES[surahNumber]?.[langCode] || chapterData.chapter?.name_simple),
                surahNumber: surahNumber,
                verseKey: verseKey,
                surah: {
                    number: surahNumber,
                    numberOfAyahs: chapterData.chapter?.verses_count || 0
                }
            };
        });

        return {
            number: surahNumber,
            name: chapterData.chapter?.name_arabic || '',
            englishName: chapterData.chapter?.name_simple || '',
            englishNameTranslation: chapterData.chapter?.translated_name?.name || '',
            numberOfAyahs: chapterData.chapter?.verses_count || ayahs.length,
            revelationType: chapterData.chapter?.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
            ayahs: ayahs
        };

    } catch (error) {
        console.error(`Error fetching surah ${surahNumber}:`, error);
        return null;
    }
};

export const getJuzDetails = async (juzNumber, language) => {
    try {
        const langCode = (language || 'tr').split('-')[0];
        const translationId = getTranslationId(language);

        // 1. Fetch all Juz verses using paginated helper
        const params = {
            language: langCode,
            words: 'false',
            fields: 'text_uthmani,verse_key,verse_number,page_number',
            v: 'v4_saheeh'
        };

        if (translationId && langCode !== 'ar') {
            params.translations = translationId;
        }

        const allJuzVerses = await fetchAllPages(`/verses/by_juz/${juzNumber}`, params);

        if (!allJuzVerses || allJuzVerses.length === 0) {
            throw new Error('Failed to fetch Juz verses');
        }

        // Strict Sorting for Juz: Must follow Surah order THEN Verse order
        allJuzVerses.sort((a, b) => {
            const [aSura, aVerse] = a.verse_key.split(':').map(Number);
            const [bSura, bVerse] = b.verse_key.split(':').map(Number);
            if (aSura !== bSura) return aSura - bSura;
            return aVerse - bVerse;
        });

        // 2. Fetch audio recitations for this juz
        const audioUrl = `${BASE_URL}/recitations/${RECITER_ID}/by_juz/${juzNumber}?per_page=999`;
        const audioResponse = await fetch(audioUrl);
        const audioData = await audioResponse.json();

        // Build audio map
        const audioMap = new Map();
        if (audioData.audio_files) {
            audioData.audio_files.forEach(audio => {
                audioMap.set(audio.verse_key, {
                    url: audio.url,
                    duration: audio.duration_ms || audio.duration // Handle bothAPI formats
                });
            });
        }

        // Build ayahs array
        const ayahs = allJuzVerses.map((verse) => {
            const verseKey = verse.verse_key;
            const [surahNum, verseNum] = verseKey.split(':').map(Number);
            const audioEntry = audioMap.get(verseKey);
            const audioUrl = audioEntry?.url;
            const durationMs = audioEntry?.duration;

            let translationText = null;

            // Check for manual override first (same pattern as getSurahDetails)
            const manualTr = MANUAL_TRANSLATIONS[langCode]?.[surahNum]?.[verseNum] ||
                MANUAL_TRANSLATIONS[langCode]?.[String(surahNum)]?.[verseNum];

            if (manualTr) {
                translationText = manualTr;
            } else if (verse.translations && verse.translations.length > 0) {
                translationText = cleanTranslation(verse.translations[0].text);
            }

            return {
                number: verse.id,
                numberInSurah: verseNum,
                text: verse.text_uthmani,
                translation: translationText,
                audio: audioUrl ? `https://verses.quran.com/${audioUrl}` : null,
                duration: durationMs || 0,
                juz: juzNumber,
                page: verse.page_number,
                surahName: langCode === 'ar'
                    ? null // Will be filled from surah data if needed
                    : (SURAH_NAMES[surahNum]?.[langCode] || `Surah ${surahNum}`),
                surahNumber: surahNum,
                verseKey: verseKey,
                surah: {
                    number: surahNum,
                    name: SURAH_NAMES[surahNum]?.ar || '',
                    englishName: SURAH_NAMES[surahNum]?.en || `Surah ${surahNum}`,
                    numberOfAyahs: SURAH_INFO?.[surahNum]?.count || null
                }
            };
        });

        return ayahs;

    } catch (error) {
        console.error(`Error fetching juz ${juzNumber}:`, error);
        return [];
    }
};

/**
 * Get a single verse by key (e.g., "4:3")
 * Useful for daily verse feature
 */
export const getVerseByKey = async (verseKey, language) => {
    try {
        const langCode = (language || 'tr').split('-')[0];
        const translationId = getTranslationId(language);

        let url = `${BASE_URL}/verses/by_key/${verseKey}?language=${langCode}&words=false&fields=text_uthmani,verse_key,verse_number&v=v4_saheeh`;

        if (translationId && langCode !== 'ar') {
            url += `&translations=${translationId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.verse) {
            throw new Error('Verse not found');
        }

        const verse = data.verse;
        const [surahNum, verseNum] = verseKey.split(':').map(Number);

        let translationText = null;

        // Check for manual override first (same pattern as getSurahDetails)
        const manualTr = MANUAL_TRANSLATIONS[langCode]?.[surahNum]?.[verseNum] ||
            MANUAL_TRANSLATIONS[langCode]?.[String(surahNum)]?.[verseNum];

        if (manualTr) {
            translationText = manualTr;
        } else if (verse.translations && verse.translations.length > 0) {
            translationText = cleanTranslation(verse.translations[0].text);
        }

        return {
            number: verse.id,
            numberInSurah: verseNum,
            text: verse.text_uthmani,
            translation: translationText,
            surahName: SURAH_NAMES[surahNum]?.[langCode] || `Surah ${surahNum}`,
            surahNumber: surahNum,
            verseKey: verseKey
        };

    } catch (error) {
        console.error(`Error fetching verse ${verseKey}:`, error);
        return null;
    }
};
