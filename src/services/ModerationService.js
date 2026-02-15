import { invokeEdgeFunction } from "../utils/apiClient";



/**
 * Checks text for prohibited content, links, and sensitive information.
 * @param {string} text The text to moderate
 * @returns {object} { isSafe: boolean, reason: string | null }
 */
export const moderateContent = (text) => {
    if (!text) return { isSafe: true };

    // 1. Pattern Checks (Safety first)


    // 2. IBAN Check (TR IBAN format)
    const ibanRegex = /TR\d{2}\s?(\d{4}\s?){5}\d{2}/gi;
    if (ibanRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'community.moderation_iban'
        };
    }

    // 3. Email Check
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'community.moderation_email'
        };
    }

    // 4. Phone Number Check
    const phoneRegex = /(05|5)\d{9}|\d{3}[\s-]?\d{3}[\s-]?\d{4}|\+\d{10,15}/g;
    if (phoneRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'community.moderation_phone'
        };
    }

    // 5. General URL/Site Check
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|edu|gov|io|biz|info|tr|me|tv|shop|site))/gi;
    if (urlRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'community.moderation_link'
        };
    }

    // 6. Generic Personal Info Pattern (ID numbers, etc. simplified)
    const idRegex = /\b\d{11}\b/g; // TR ID check
    if (idRegex.test(text)) {
        return {
            isSafe: false,
            reason: 'community.moderation_id'
        };
    }

    return { isSafe: true };
};

/**
 * Server-side Image Moderation (Supabase Edge Function)
 * Securely calls AI on the server to avoid exposing API keys.
 */
export const moderateImage = async (base64Data, lang = 'tr') => {
    if (!base64Data) {
        console.warn("[ModerationService] No base64 data provided for moderation");
        return { isSafe: false, reason: "community.moderation_error" };
    }

    try {
        if (__DEV__) console.log(`[ModerationService] Requesting image moderation. Language: "${lang}"`);
        const data = await invokeEdgeFunction('moderate-image', {
            body: { image: base64Data, lang }
        });

        if (__DEV__) console.log("[ModerationService] Image Moderation Result:", data);
        return data || { isSafe: false, reason: "community.moderation_error" };
    } catch (error) {
        console.error("[ModerationService] Image Moderation Exception:", error);
        return {
            isSafe: false,
            error: true,
            reason: "community.moderation_error"
        };
    }
};
/**
 * Server-side Text Moderation (Supabase Edge Function)
 * Strict AI moderation for community posts (Sexual, Profanity, Gambling, Islamic Suitability).
 */
export const moderateTextAI = async (text, type = 'post', lang = 'tr') => {
    if (!text) return { isSafe: true };

    try {
        const fetchLang = lang || 'tr';
        if (__DEV__) console.log(`[ModerationService] Requesting AI moderation. Language: "${fetchLang}", Type: "${type}"`);

        const data = await invokeEdgeFunction('moderate-text', {
            body: { text, type, lang: fetchLang }
        });

        if (__DEV__) console.log("[ModerationService] Text Moderation Result:", data);
        return data || { isSafe: false, reason: "community.moderation_error" };
    } catch (error) {
        console.error("[ModerationService] Text Moderation Exception:", error);
        return {
            isSafe: false,
            error: true,
            reason: "community.moderation_error"
        };
    }
};

export default {
    moderateContent,
    moderateImage,
    moderateTextAI
};
