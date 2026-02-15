-- ============================================
-- Islamvy App - Push Notification Webhook Setup
-- SIMPLER ALTERNATIVE using Supabase Database Webhooks
-- ============================================

-- This file contains the setup for using Supabase Database Webhooks
-- instead of pg_net triggers. This is easier to set up and more reliable.

-- STEP 1: Go to Supabase Dashboard
-- Navigate to: Database > Webhooks > Create a new webhook

-- STEP 2: Configure the webhook:
-- Name: community_push_notification
-- Table: community_notifications
-- Events: INSERT
-- Type: Supabase Edge Function
-- Edge Function: send-push-notification

-- STEP 3: The Edge Function will receive the notification data automatically
-- But we need to modify it to handle webhook payloads

-- ============================================
-- UPDATED EDGE FUNCTION (send-push-notification/index.ts)
-- Replace your existing file with this version
-- ============================================

/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Notification messages by type (multi-language)
const NOTIFICATION_MESSAGES = {
    amen: {
        tr: { title: '🤲 Amin', body: 'Birisi duanıza amin dedi.' },
        en: { title: '🤲 Amen', body: 'Someone said amen to your prayer.' },
        ar: { title: '🤲 آمين', body: 'قال أحدهم آمين لدعائك.' },
        id: { title: '🤲 Amin', body: 'Seseorang mengaminkan doamu.' },
    },
    prayed: {
        tr: { title: '📿 Dua', body: 'Birisi sizin için dua etti.' },
        en: { title: '📿 Prayer', body: 'Someone prayed for you.' },
        ar: { title: '📿 دعاء', body: 'شخص ما دعا لك.' },
        id: { title: '📿 Doa', body: 'Seseorang mendoakanmu.' },
    },
    support: {
        tr: { title: '💚 Destek', body: 'Birisi zikirinizi destekledi.' },
        en: { title: '💚 Support', body: 'Someone supported your dhikr.' },
        ar: { title: '💚 دعم', body: 'شخص ما دعم ذكرك.' },
        id: { title: '💚 Dukungan', body: 'Seseorang mendukung dzikirmu.' },
    },
    hatim_slot_taken: {
        tr: { title: '📖 Hatim', body: 'Birisi hatminizden bir cüz aldı.' },
        en: { title: '📖 Hatim', body: 'Someone took a juz from your hatim.' },
        ar: { title: '📖 ختمة', body: 'شخص ما أخذ جزءاً من ختمتك.' },
        id: { title: '📖 Khatam', body: 'Seseorang mengambil juz dari khatammu.' },
    },
    hatim_completed: {
        tr: { title: '📖 Hatim Tamamlandı', body: 'Allah kabul etsin! Hatminiz tamamlandı. 🌟' },
        en: { title: '📖 Hatim Completed', body: 'May Allah accept! Your hatim is complete. 🌟' },
        ar: { title: '📖 تمت الختمة', body: 'تقبل الله! ختمتك اكتملت. 🌟' },
        id: { title: '📖 Khatam Selesai', body: 'Semoga Allah terima! Khatammu selesai. 🌟' },
    },
    dhikr_completed: {
        tr: { title: '📿 Zikir Tamamlandı', body: 'Allah kabul etsin! Zikriniz tamamlandı. ✨' },
        en: { title: '📿 Dhikr Completed', body: 'May Allah accept! Your dhikr is complete. ✨' },
        ar: { title: '📿 تم الذكر', body: 'تقبل الله! ذكرك اكتمل. ✨' },
        id: { title: '📿 Dzikir Selesai', body: 'Semoga Allah terima! Dzikirmu selesai. ✨' },
    },
    new_product: {
        tr: { title: '🛍️ Islamvy Shop', body: 'Yeni ürünler mağazada!' },
        en: { title: '🛍️ Islamvy Shop', body: 'New products in the shop!' },
        ar: { title: '🛍️ متجر ذكرى', body: 'منتجات جديدة في المتجر!' },
        id: { title: '🛍️ Islamvy Shop', body: 'Produk baru di toko!' },
    },
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const payload = await req.json();
        
        // Check if this is a webhook payload (has 'record' field) or direct call
        const isWebhook = payload.type === 'INSERT' && payload.record;
        
        let user_ids: string[];
        let title: string;
        let body: string;
        let data: Record<string, any> = {};

        if (isWebhook) {
            // Webhook from database trigger
            const record = payload.record;
            user_ids = [record.user_id];
            
            // Get user's language preference
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('language')
                .eq('id', record.user_id)
                .single();
            
            const lang = profile?.language || 'tr';
            const messages = NOTIFICATION_MESSAGES[record.type as keyof typeof NOTIFICATION_MESSAGES];
            
            if (!messages) {
                return new Response(JSON.stringify({ success: false, error: 'Unknown notification type' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                });
            }
            
            const langMessages = messages[lang as keyof typeof messages] || messages.tr;
            title = langMessages.title;
            body = langMessages.body;
            data = { type: record.type, notification_id: record.id };
        } else {
            // Direct API call (existing behavior)
            user_ids = payload.user_ids;
            title = payload.title;
            body = payload.body;
            data = payload.data || {};
        }

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return new Response(JSON.stringify({ success: false, error: 'User IDs missing' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Get push tokens
        const { data: profiles, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, expo_push_token')
            .in('id', user_ids);

        if (profileError) throw profileError;

        const tokens = profiles
            .filter(p => p.expo_push_token)
            .map(p => p.expo_push_token);

        if (tokens.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'No tokens found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Prepare Expo messages
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        }));

        // Send to Expo
        const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        const result = await expoResponse.json();

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
*/

-- After updating the Edge Function, deploy it with:
-- supabase functions deploy send-push-notification

-- Then set up the webhook in Supabase Dashboard as described above.
