import { supabase } from './supabase';

/**
 * Community Service
 * Handles prayer requests, collective dhikrs, and Hatim groups.
 */

export const getCommunityPosts = async (type = null) => {
    try {
        let query = supabase
            .from('community_posts')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map(post => ({
            ...post,
            userName: post.show_full_name && post.profiles?.full_name
                ? post.profiles.full_name
                : (post.profiles?.full_name ? maskName(post.profiles.full_name) : 'Zikra Kullanıcısı')
        }));
    } catch (error) {
    }
};

export const getPostById = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('id', postId)
            .single();

        if (error) throw error;

        return {
            ...data,
            userName: data.show_full_name && data.profiles?.full_name
                ? data.profiles.full_name
                : (data.profiles?.full_name ? maskName(data.profiles.full_name) : 'Zikra Kullanıcısı')
        };
    } catch (error) {
        console.error('getPostById Error:', error);
        return null;
    }
};

export const getUserCommunityPosts = async (userId) => {
    try {
        // 1. Fetch regular posts
        const { data: postsData, error: postsError } = await supabase
            .from('community_posts')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('user_id', userId)
            .neq('status', 'hidden')
            .neq('status', 'deleted')
            .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // 2. Fetch Hatim groups
        const { data: hatimsData, error: hatimsError } = await supabase
            .from('hatim_groups')
            .select('*')
            .eq('created_by', userId)
            .neq('status', 'deleted');

        if (hatimsError) throw hatimsError;

        const regularPosts = postsData.map(post => ({
            ...post,
            userName: post.profiles?.full_name || 'Sen'
        }));

        const hatimPosts = hatimsData.map(h => ({
            ...h,
            type: 'hatim',
            user_id: h.created_by,
            userName: 'Sen',
            content: h.description,
            current_count: 0 // Hatims don't use current_count in this view
        }));

        return [...regularPosts, ...hatimPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
        console.error('getUserCommunityPosts Error:', error);
        return [];
    }
};

export const deleteCommunityPost = async (postId, type) => {
    try {
        if (type === 'hatim') {
            const { error } = await supabase
                .from('hatim_groups')
                .update({ status: 'deleted' })
                .eq('id', postId);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('community_posts')
                .update({ status: 'deleted' })
                .eq('id', postId);
            if (error) throw error;
        }
        return true;
    } catch (error) {
        console.error('deleteCommunityPost Error:', error);
        return false;
    }
};

export const getUserParticipationStats = async (userId) => {
    try {
        // 1. Prayers (Amen) count
        const { count: amenCount, error: amenError } = await supabase
            .from('community_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'amen');

        // 2. Dhikr participation count
        const { count: dhikrCount, error: dhikrError } = await supabase
            .from('community_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'prayed');

        // 3. Hatim slots taken
        const { count: hatimCount, error: hatimError } = await supabase
            .from('hatim_slots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (amenError || dhikrError || hatimError) throw (amenError || dhikrError || hatimError);

        return {
            prayers: amenCount || 0,
            dhikrs: dhikrCount || 0,
            hatims: hatimCount || 0
        };
    } catch (error) {
        console.error('getUserParticipationStats Error:', error);
        return { prayers: 0, dhikrs: 0, hatims: 0 };
    }
};

export const createCommunityPost = async ({ user_id, title, content, type, target_count, current_count, language_code, city, show_full_name = false }) => {
    try {
        const { data, error } = await supabase
            .from('community_posts')
            .insert({
                user_id,
                title,
                content,
                type,
                target_count,
                current_count,
                language_code,
                city,
                show_full_name,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;

        // If it's a dhikr and the creator took some initial count, 
        // we might handle that via an initial interaction or just trust the DB default.
        // For simplicity, we'll let the user's initial count be handled by the current_count column.

        return data;
    } catch (error) {
        console.error('createCommunityPost Error:', error);
        throw error;
    }
};

export const createCommunityHatim = async (title, description, created_by, selectedSlots = [], language_code, city, show_full_name = false) => {
    try {
        // 1. Create Hatim Group
        const { data: group, error: groupError } = await supabase
            .from('hatim_groups')
            .insert({
                created_by,
                title,
                description,
                status: 'open',
                language_code,
                city,
                show_full_name
            })
            .select()
            .single();

        if (groupError) throw groupError;

        // 2. Prepare 30 slots
        const slotsToCreate = Array.from({ length: 30 }, (_, i) => {
            const slotNum = i + 1;
            const isTakenByCreator = selectedSlots.includes(slotNum);
            return {
                hatim_id: group.id,
                slot_number: slotNum,
                user_id: isTakenByCreator ? created_by : null,
                status: isTakenByCreator ? 'taken' : 'available',
                taken_at: isTakenByCreator ? new Date().toISOString() : null
            };
        });

        // 3. Bulk insert slots
        const { error: sError } = await supabase
            .from('hatim_slots')
            .insert(slotsToCreate);

        if (sError) throw sError;

        return group;
    } catch (error) {
        console.error('createCommunityHatim Error:', error);
        throw error;
    }
};

export const interactWithPost = async (postId, userId, type = 'amen', amount = 1) => {
    try {
        const { error } = await supabase
            .from('community_interactions')
            .insert({
                post_id: postId,
                user_id: userId,
                type,
                amount: amount
            });

        if (error && error.code !== '23505') { // Ignore duplicate entries if they try to pledge again? 
            // Actually, maybe we want to allow multiple pledges? 
            // Currently UNIQUE(post_id, user_id, type) prevents that.
            // Let's stick to unique for now to prevent spam.
            throw error;
        }
        return true;
    } catch (error) {
        console.error('interactWithPost Error:', error);
        return false;
    }
};

export const getHatimGroups = async () => {
    try {
        const { data, error } = await supabase
            .from('hatim_groups')
            .select('*')
            .in('status', ['open', 'completed'])
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('getHatimGroups Error:', error);
        return [];
    }
};

export const getHatimSlots = async (hatimId) => {
    try {
        const { data, error } = await supabase
            .from('hatim_slots')
            .select(`
                *,
                profiles:user_id (
                    full_name
                )
            `)
            .eq('hatim_id', hatimId)
            .order('slot_number', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('getHatimSlots Error:', error);
        return [];
    }
};

export const takeHatimSlot = async (hatimId, slotNumber, userId) => {
    try {
        const { error } = await supabase
            .from('hatim_slots')
            .update({
                user_id: userId,
                status: 'taken',
                taken_at: new Date().toISOString()
            })
            .eq('hatim_id', hatimId)
            .eq('slot_number', slotNumber)
            .is('user_id', null); // Ensure it's still available

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('takeHatimSlot Error:', error);
        return false;
    }
};

// Internal Name Masking
const maskName = (name) => {
    if (!name) return '***';
    const parts = name.split(' ');
    return parts.map(p => {
        if (p.length <= 2) return p;
        return p.substring(0, 2) + '*'.repeat(p.length - 2);
    }).join(' ');
};

export const reportPost = async (postId, userId, reason) => {
    try {
        const { error } = await supabase
            .from('community_reports')
            .insert({
                post_id: postId,
                reporter_id: userId,
                reason
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('reportPost Error:', error);
        return false;
    }
};

/**
 * Normalizes text for better translation (e.g. moneyyy -> money)
 */
const normalizeText = (text) => {
    if (!text) return '';
    // Reduce 3 or more repeated characters to 1 (e.g. ssssaaaalam -> salam)
    // We keep 2 repeating for words like "all" or Turkish "saat"
    return text.replace(/(.)\1{2,}/g, '$1');
};

/**
 * Translates content using AI context.
 * For now, we use a mock that simulates AI translation.
 */
export const translateText = async (text, targetLang, sourceLang = 'auto') => {
    try {
        if (!text) return '';

        const normalized = normalizeText(text);

        // Normalize languages
        const src = (sourceLang && sourceLang !== 'auto') ? sourceLang.split('-')[0].toLowerCase() : 'auto';
        const tgt = (targetLang || 'en').split('-')[0].toLowerCase();

        if (src !== 'auto' && src === tgt) return text;

        // Using Google Translate's Public GTX API (Highly Reliable)
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tgt}&dt=t&q=${encodeURIComponent(normalized)}&ie=UTF-8&oe=UTF-8`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        // Google GTX result is nested: [[["translated", "original", null, null, 1]], null, "tr"]
        if (result && result[0] && result[0][0] && result[0][0][0]) {
            return result[0][0][0];
        }

        throw new Error('Could not parse Google Translate response');
    } catch (error) {
        console.warn('Google Translate failed, trying LibreTranslate fallback:', error.message);

        // Fallback to a stable LibreTranslate instance if Google fails
        try {
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: (sourceLang || 'tr').split('-')[0].toLowerCase(),
                    target: (targetLang || 'en').split('-')[0].toLowerCase(),
                    format: 'text'
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.translatedText) return result.translatedText;
        } catch (e) { }

        // Final fallback to Supabase Function
        try {
            const { data, error: sfError } = await supabase.functions.invoke('translate-content', {
                body: { text, targetLang, sourceLang }
            });

            if (!sfError && data?.translatedText) {
                return data.translatedText;
            }
        } catch (e) { }

        return text; // Return original if everything fails
    }
};
