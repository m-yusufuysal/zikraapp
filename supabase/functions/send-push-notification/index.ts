import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        const { user_ids, title, body, data = {} } = await req.json();

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return new Response(JSON.stringify({ success: false, error: 'User IDs missing' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // 1. Get push tokens for all users
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

        // 2. Prepare Expo messages
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        }));

        // 3. Send to Expo
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
