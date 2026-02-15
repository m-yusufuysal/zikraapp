import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Notification messages by type (multi-language) - {name} and {location} are placeholders
const NOTIFICATION_MESSAGES: Record<string, Record<string, { title: string; body: string }>> = {
    amen: {
        tr: { title: '🤲 Amin', body: '{name} ({location}) duanıza amin dedi.' },
        en: { title: '🤲 Amen', body: '{name} ({location}) said amen to your prayer.' },
        ar: { title: '🤲 آمين', body: '{name} ({location}) قال آمين لدعائك.' },
        id: { title: '🤲 Amin', body: '{name} ({location}) mengaminkan doamu.' },
        fr: { title: '🤲 Amine', body: '{name} ({location}) a dit amine à votre invocation.' },
    },
    prayed: {
        tr: { title: '📿 Dua', body: '{name} ({location}) sizin için dua etti.' },
        en: { title: '📿 Prayer', body: '{name} ({location}) prayed for you.' },
        ar: { title: '📿 دعاء', body: '{name} ({location}) دعا لك.' },
        id: { title: '📿 Doa', body: '{name} ({location}) mendoakanmu.' },
        fr: { title: '📿 Invocation', body: '{name} ({location}) a prié pour vous.' },
    },
    support: {
        tr: { title: '💚 Destek', body: '{name} ({location}) zikirinizi destekledi.' },
        en: { title: '💚 Support', body: '{name} ({location}) supported your dhikr.' },
        ar: { title: '💚 دعم', body: '{name} ({location}) دعم ذكرك.' },
        id: { title: '💚 Dukungan', body: '{name} ({location}) mendukung dzikirmu.' },
        fr: { title: '💚 Soutien', body: '{name} ({location}) a soutenu votre dhikr.' },
    },
    hatim_slot_taken: {
        tr: { title: '📖 Hatim', body: '{name} ({location}) hatminizden bir cüz aldı.' },
        en: { title: '📖 Hatim', body: '{name} ({location}) took a juz from your hatim.' },
        ar: { title: '📖 ختمة', body: '{name} ({location}) أخذ جزءاً من ختمتك.' },
        id: { title: '📖 Khatam', body: '{name} ({location}) mengambil juz dari khatammu.' },
        fr: { title: '📖 Hatim', body: '{name} ({location}) a pris un juz de votre hatim.' },
    },
    hatim_completed: {
        tr: { title: '📖 Hatim Tamamlandı', body: 'Allah kabul etsin! Hatminiz tamamlandı. 🌟' },
        en: { title: '📖 Hatim Completed', body: 'May Allah accept! Your hatim is complete. 🌟' },
        ar: { title: '📖 تمت الختمة', body: 'تقبل الله! ختمتك اكتملت. 🌟' },
        id: { title: '📖 Khatam Selesai', body: 'Semoga Allah terima! Khatammu selesai. 🌟' },
        fr: { title: '📖 Hatim Terminé', body: 'Qu\'Allah accepte ! Votre hatim est terminé. 🌟' },
    },
    dhikr_completed: {
        tr: { title: '📿 Zikir Tamamlandı', body: 'Allah kabul etsin! Zikriniz tamamlandı. ✨' },
        en: { title: '📿 Dhikr Completed', body: 'May Allah accept! Your dhikr is complete. ✨' },
        ar: { title: '📿 تم الذكر', body: 'تقبل الله! ذكرك اكتمل. ✨' },
        id: { title: '📿 Dzikir Selesai', body: 'Semoga Allah terima! Dzikirmu selesai. ✨' },
        fr: { title: '📿 Dhikr Terminé', body: 'Qu\'Allah accepte ! Votre dhikr est terminé. ✨' },
    },
    new_product: {
        tr: { title: '🛍️ Islamvy Shop', body: 'Yeni ürünler mağazada!' },
        en: { title: '🛍️ Islamvy Shop', body: 'New products in the shop!' },
        ar: { title: '🛍️ متجر ذكرى', body: 'منتجات جديدة في المتجر!' },
        id: { title: '🛍️ Islamvy Shop', body: 'Produk baru di toko!' },
        fr: { title: '🛍️ Boutique Islamvy', body: 'Nouveaux produits en boutique !' },
    },
};

serve(async (req: Request) => {
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
        let data: Record<string, unknown> = {};

        if (isWebhook) {
            // Webhook from database trigger
            const record = payload.record;
            user_ids = [record.user_id];

            // Get recipient's language preference
            const { data: recipientProfile } = await supabaseClient
                .from('profiles')
                .select('language')
                .eq('id', record.user_id)
                .single();

            const lang = recipientProfile?.language || 'tr';
            const messages = NOTIFICATION_MESSAGES[record.type];

            if (!messages) {
                return new Response(JSON.stringify({ success: false, error: 'Unknown notification type' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                });
            }

            const langMessages = messages[lang] || messages.tr;
            title = langMessages.title;
            body = langMessages.body;

            // Get sender's name and location (if sender exists)
            if (record.sender_id) {
                const { data: senderProfile } = await supabaseClient
                    .from('profiles')
                    .select('full_name, location')
                    .eq('id', record.sender_id)
                    .single();

                const senderNameFallback: Record<string, string> = {
                    tr: 'Islamvy Kullanıcısı',
                    en: 'Islamvy User',
                    fr: 'Utilisateur Islamvy',
                    id: 'Pengguna Islamvy',
                    ar: 'مستخدم ذكرى'
                };
                const senderName = senderProfile?.full_name || (senderNameFallback[lang] || senderNameFallback.en);
                const senderLocation = senderProfile?.location || '';

                // Replace placeholders with actual values
                body = body.replace('{name}', senderName);
                body = body.replace('{location}', senderLocation || '🌍');

                // Clean up if no location - remove empty parentheses
                body = body.replace(' ()', '').replace(' (🌍)', '');
            } else {
                // No sender - remove placeholders
                body = body.replace('{name} ({location}) ', '');
            }

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

        const tokens = (profiles || [])
            .filter((p: { expo_push_token?: string }) => p.expo_push_token)
            .map((p: { expo_push_token: string }) => p.expo_push_token);

        if (tokens.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'No tokens found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Prepare Expo messages
        const expoMessages = tokens.map((token: string) => ({
            to: token,
            sound: 'islamvyappnotification.wav',
            title: title,
            body: body,
            data: data,
            android: {
                channelId: 'default'
            }
        }));

        // Send to Expo
        const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expoMessages),
        });

        const result = await expoResponse.json();

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ success: false, error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
