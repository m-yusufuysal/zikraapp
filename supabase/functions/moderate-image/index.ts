import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

const headers = { ...corsHeaders, ...securityHeaders };

serve(async (req: Request) => {
    // 1. Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers })
    }

    try {
        // 2. Initialize Supabase Client with Service Role (matching interpret-dream pattern)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 3. Extract & Verify Auth Token
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header provided');
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

        if (authError || !user) {
            console.error('Moderation Auth Error:', authError);
            throw new Error('Unauthorized access');
        }

        // 4. Parse Request
        const { image, lang = 'tr' } = await req.json();
        const apiKey = Deno.env.get('OPENAI_API_KEY');

        if (!apiKey) {
            throw new Error("Configuration error: Missing OPENAI_API_KEY");
        }

        if (!image) {
            throw new Error("Missing image data");
        }

        console.log(`[ModerateImage] Incoming lang: "${lang}" for user: ${user.id}`);

        // 5. Robust Language Detection
        let targetLang = "Turkish";
        const normalizedLang = (lang || 'tr').toLowerCase();

        if (normalizedLang.startsWith('en')) targetLang = "English";
        else if (normalizedLang.startsWith('ar')) targetLang = "Arabic";
        else if (normalizedLang.startsWith('tr')) targetLang = "Turkish";
        else if (normalizedLang.startsWith('id')) targetLang = "Indonesian";
        else if (normalizedLang.startsWith('fr')) targetLang = "French";

        // 4.5 RATE LIMIT: Prevent API credit abuse (20 images/hour per user)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: recentCount } = await supabaseClient
            .from('moderation_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('type', 'image')
            .gte('created_at', oneHourAgo);

        if (recentCount && recentCount >= 20) {
            const rateLimitReasons: Record<string, string> = {
                Turkish: 'Çok fazla istek. Lütfen bekleyin.',
                English: 'Too many requests. Please wait.',
                Arabic: 'طلبات كثيرة. يرجى الانتظار.',
                Indonesian: 'Terlalu banyak permintaan. Harap tunggu.',
                French: 'Trop de requêtes. Veuillez patienter.',
            };
            return new Response(JSON.stringify({
                isSafe: false,
                reason: rateLimitReasons[targetLang] || rateLimitReasons.English,
                code: 'RATE_LIMIT_EXCEEDED'
            }), {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        // 6. Call OpenAI GPT-4o-mini with Vision
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this image for Islamic community app safety. 
Rejection criteria: 
1. NSFW / Adult content / Nakedness / Suggestive poses. 
2. Gambling / Betting logos or themes. 
3. Advertisements / Commercial promotions / Links. 
4. Slang / Profanity in text within the image. 

IMPORTANT: You MUST respond in ${targetLang}. 
Your response must be a valid JSON only, no markdown: {"isSafe": boolean, "reason": "Short ${targetLang} explanation if unsafe, else null"}`
                            },
                            {
                                type: "image_url",
                                image_url: { url: `data:image/jpeg;base64,${image}` }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Clean potential markdown or extra text
        const jsonMatch = content.match(/\{.*\}/s);
        const resultJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { isSafe: true };

        return new Response(JSON.stringify(resultJson), {
            headers: { ...headers, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error: any) {
        console.error("Moderation Function Error:", error.message);

        // Return 200 with error details to allow client to handle it gracefully
        return new Response(JSON.stringify({
            isSafe: false,
            error: error.message,
            technical_failure: true,
            reason: "community.moderation_error"
        }), {
            headers: { ...headers, 'Content-Type': 'application/json' },
            status: 200
        });
    }
})
