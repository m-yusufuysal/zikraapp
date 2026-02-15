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
        // 2. Initialize Supabase Client with Service Role
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
        const { text, type, lang = 'tr' } = await req.json();
        const apiKey = Deno.env.get('OPENAI_API_KEY');

        if (!apiKey) {
            throw new Error("Configuration error: Missing OPENAI_API_KEY");
        }

        if (!text) {
            return new Response(JSON.stringify({ isSafe: true }), {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        console.log(`[ModerateText] Incoming lang: "${lang}", content length: ${text.length}`);

        // 5. Robust Language Detection
        let targetLang = "Turkish";
        const normalizedLang = (lang || 'tr').toLowerCase();

        if (normalizedLang.startsWith('en')) targetLang = "English";
        else if (normalizedLang.startsWith('ar')) targetLang = "Arabic";
        else if (normalizedLang.startsWith('tr')) targetLang = "Turkish";
        else if (normalizedLang.startsWith('id')) targetLang = "Indonesian";
        else if (normalizedLang.startsWith('fr')) targetLang = "French";

        // 4.5 FAST PRE-FILTER: Catch obvious profanity without an API call
        // This reduces OpenAI costs by ~30-40% for clear violations
        const BANNED_PATTERNS = [
            // Turkish profanity (common obfuscations)
            /\ba\s*m\s*[ıi]?\s*n\s*a\b/i,
            /\bs\s*[ıi]\s*k/i,
            /\bo\s*r\s*o\s*s\s*p/i,
            /\bp\s*[ıi]\s*[cç]/i,
            /\bg[öo]t\s*[üu]/i,
            // English
            /\bf+u+c+k/i,
            /\bs+h+i+t+(?!ake)/i,
            /\bn+[i1]+g+[gae]+[ra]/i,
            // Gambling/Casino
            /\bcasino\b/i,
            /\bslot\s*mach/i,
            /\biddaa\b/i,
            /\bbahis\b/i,
            /\bbet365\b/i,
        ];

        const normalizedText = text.replace(/[.\-_*#@!]/g, '').toLowerCase();
        const quickMatch = BANNED_PATTERNS.some(p => p.test(normalizedText) || p.test(text));
        if (quickMatch) {
            const quickReasons: Record<string, string> = {
                Turkish: 'İçerik uygun değil.',
                English: 'Content is not appropriate.',
                Arabic: 'المحتوى غير مناسب.',
                Indonesian: 'Konten tidak pantas.',
                French: 'Le contenu n\'est pas approprié.',
            };
            return new Response(JSON.stringify({
                isSafe: false,
                reason: quickReasons[targetLang] || quickReasons.English
            }), {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        // 6. Call OpenAI GPT-4o-mini
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
                        role: "system",
                        content: `You are a strict moderator for 'Islamvy', an Islamic community app. Your goal is to ensure all user posts are respectful and follow Islamic values.

CRITICAL INSTRUCTION: You MUST detect and block OBFUSCATED/HIDDEN profanity. Users try to bypass filters by:
- Spacing out letters (e.g., "a p t a l", "m a l", "s . i . k")
- Using punctuation to break words (e.g., "s.i.k", "a-p-t-a-l")
- Mixing numbers or symbols (e.g., "b0k", "a@mq")
- Phonetic misspellings

REJECTION CRITERIA (If any are met, set isSafe: false):
1. SEXUAL/ADULT (NSFW): Any sexual references, suggestive language, or explicit content.
2. GAMBLING/CASINO: Any mention of casino, betting (iddaa, bahis), slot, or gambling promotions.
3. PROFANITY/SLANG: Any cursing, rude insults, or toxic language in any language. deeply analyze text for hidden Turkish profanity like "a mk", "a.q", "oç", "piç", "s i k".
4. ANTI-RELIGIOUS/HATE: Content that mocks religion, promotes other religions aggressively, or is generally disrespectful to Islamic values.
5. SPAM/MALICIOUS: Links to suspicious sites, "get rich fast" schemes, or malicious ads.

Note: DO NOT block simple personal requests for help or prayers (e.g., "Para lazım", "Borcum var").

IMPORTANT: You MUST respond in ${targetLang}. 
Your response must be a valid JSON only, no markdown: {"isSafe": boolean, "reason": "Short ${targetLang} explanation if unsafe, else null"}`
                    },
                    {
                        role: "user",
                        content: `Post Type: ${type}\nContent to moderate: "${text}"`
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
