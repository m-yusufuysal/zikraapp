/**
 * Zikra App - Interpret Dream Edge Function (v2.0)
 * 
 * FIXES APPLIED:
 * 1. Writes results to dream_interpretations table
 * 2. Uses gpt-4o-mini for speed
 * 3. Uses response_format for guaranteed JSON
 * 4. Complete language-specific prompts (no mixed languages)
 * 5. Proper error handling with status updates
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

const headers = { ...corsHeaders, ...securityHeaders };

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers });
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let interpretationId: string | null = null;

    try {
        // 1. SECURITY: Extract and verify JWT
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth error:', authError);
            throw new Error('Unauthorized');
        }

        const user_id = user.id;

        // 1.1 IP SECURITY CHECKS
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

        // Check Blocklist
        const { data: isBlocked } = await supabaseClient.rpc('fn_is_ip_blocked', { check_ip: clientIp });
        if (isBlocked) {
            throw new Error('Access denied.');
        }

        // Check Premium Status with Tier
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('is_premium, premium_tier')
            .eq('id', user_id)
            .single();

        const isPremium = profile?.is_premium === true;
        const premiumTier = profile?.premium_tier || null;

        // Tier-based limits: Free=1, Starter=3, Pro=10, Unlimited=99
        const getTierLimits = (isPremium: boolean, tier: string | null) => {
            if (!isPremium) return { daily: 1, hourly: 5 };
            switch (tier) {
                case 'starter': return { daily: 3, hourly: 20 };
                case 'pro': return { daily: 10, hourly: 50 };
                case 'unlimited': return { daily: 99, hourly: 200 };
                default: return { daily: 3, hourly: 20 }; // fallback to starter
            }
        };

        const limits = getTierLimits(isPremium, premiumTier);

        // Parse request body first (needed for language in error messages)
        const {
            name,
            dream_text,
            birth_date,
            birth_time,
            birth_place,
            language = 'tr',
            request_hash
        } = await req.json();

        console.log(`[InterpretDream] User ${user_id} | Premium: ${isPremium} | Tier: ${premiumTier || 'free'} | Limits: ${limits.daily}/day | Lang: ${language}`);

        // Check hourly rate limit
        const { data: isAllowed, error: rateLimitError } = await supabaseClient.rpc('fn_check_rate_limit', {
            identifier: `dream:${user_id}`,
            limit_count: limits.hourly,
            window_seconds: 3600
        });

        console.log(`[InterpretDream] Rate limit check: isAllowed=${isAllowed}, error=${rateLimitError?.message || 'none'}`);

        // Only block if we explicitly got false (not null or error)
        if (isAllowed === false) {
            const rateLimitMsg = language === 'tr'
                ? 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.'
                : 'Too many requests. Please wait a moment.';
            // Use a special prefix so we can detect it in catch block
            throw new Error(`RATE_LIMIT:${rateLimitMsg}`);
        }

        // 2. VALIDATION & SECURITY
        if (!dream_text) {
            throw new Error(language === 'tr' ? 'Rüya metni gerekli.' : 'Dream text is required.');
        }

        if (dream_text.length > 2000) {
            throw new Error('Dream text too long (max 2000 chars).');
        }

        // 3. DAILY LIMIT CHECK
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabaseClient
            .from('dream_interpretations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .gte('created_at', yesterday);

        if (count && count >= limits.daily) {
            throw new Error(language === 'tr'
                ? `Günlük rüya tabiri limitine ulaştınız (${limits.daily}/gün). ${!isPremium ? 'Premium\'a geçerek daha fazla yorum alabilirsiniz.' : ''}`
                : `Daily dream interpretation limit reached (${limits.daily}/day). ${!isPremium ? 'Upgrade to Premium for more.' : ''}`);
        }

        // Check for duplicate request (exact match)
        if (request_hash) {
            const { data: existing } = await supabaseClient
                .from('dream_interpretations')
                .select('id, status, summary, symbols, personal_interpretation, spiritual_advice, warning, recommended_action')
                .eq('request_hash', request_hash)
                .single();

            if (existing && existing.status === 'completed') {
                return new Response(JSON.stringify({
                    success: true,
                    interpretation_id: existing.id,
                    cached: true,
                    symbols: existing.symbols,
                    personal_interpretation: existing.personal_interpretation,
                    spiritual_advice: existing.spiritual_advice,
                    warning: existing.warning,
                    recommended_action: existing.recommended_action
                }), {
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
        }

        // Semantic cache removed for performance - was adding ~2-3s latency

        // 1. Create pending interpretation in DB
        const insertData: Record<string, unknown> = {
            dream_text,
            name,
            birth_date,
            birth_time,
            birth_place,
            status: 'processing',
            request_hash
        };

        // Only add user_id if provided (for guest users)
        if (user_id) {
            insertData.user_id = user_id;
        }

        const { data: interpretation, error: insertError } = await supabaseClient
            .from('dream_interpretations')
            .insert(insertData)
            .select('id')
            .single();

        if (insertError) {
            console.error('Insert error object:', JSON.stringify(insertError));
            // Return specific DB error to client for debugging
            throw new Error(`DB Insert Failed: ${insertError.message} (${insertError.details || ''})`);
        }

        interpretationId = interpretation.id;

        // 2. Build language-specific prompts
        let systemPrompt = '';
        let userPrompt = '';

        // Map language code to full language name
        const languageMap: { [key: string]: string } = {
            'tr': 'Turkish (Türkçe)',
            'en': 'English',
            'ar': 'Arabic (العربية)',
            'id': 'Indonesian (Bahasa Indonesia)'
        };
        const languageName = languageMap[language] || 'English';

        if (language === 'tr') {
            systemPrompt = `Sen İslami rüya tabiri konusunda derin bilgiye sahip bir alimsin.

ÇOK ÖNEMLİ: CEVAPLARI SADECE VE SADECE **${languageName}** DİLİNDE VER. 
Kullanıcının uygulamayı kullandığı dil: ${languageName}.

SADECE aşağıdaki JSON formatında cevap ver:
{
    "symbols": [
        {"symbol": "Görülen sembol", "meaning": "İslami anlamı", "source": "Kaynak (İbn-i Sirin, Nablusi vb.)"}
    ],
    "personal_interpretation": "Kişiye, ismine (${name || 'Kardeşim'}) hitaben yazılmış, rüyanın detaylarına inen, duygusal ve manevi derinliği olan PARAGRAF. (En az 5-6 cümle).",
    "spiritual_advice": "Kişinin haliyet-i ruhiyesine uygun, sıcak bir dille yazılmış manevi tavsiye ve rahatlatıcı bir dua.",
    "recommended_action": "Bu rüyadan yola çıkarak, kişinin manevi dünyasına katkı sağlayacak ÇOK SOMUT ve ÖZGÜN bir amel önerisi. (Örn: 'Çocuklara şeker dağıt', 'Bir tebessüm sadakası ver', 'Küs olduğun biriyle konuş'). Sığ önerilerden kaçın.",
    "warning": "Varsa dikkat edilmesi gereken bir husus, yoksa null."
}

KURALLAR:
1. ÜSLUP: Samimi, güven veren, bir mürşit veya bilge dost edasıyla konuş. Kişiye ismiyle hitap etmeye çalış.
2. DERİNLİK: 'Hayırdır inşallah', 'Güzel rüya' gibi kısa geçiştirmeler yapma. Sembolleri birbirine bağlayarak bütüncül bir hikaye anlat.
3. recommended_action: Sıradan olmasın, rüyanın içeriğine (su, ateş, uçmak vs.) uygun yaratıcı bir iyilik öner.`;

            userPrompt = `Kullanıcı Bilgileri:
İsim: ${name || 'Bilinmiyor'}
Doğum: ${birth_date || 'Bilinmiyor'} ${birth_time || ''}, ${birth_place || ''}
Dil: ${languageName}

Rüya:
${dream_text}

Lütfen bu rüyayı **${languageName}** dilinde yorumla ve kişiye özel somut bir amel öner.`;

        } else {
            // UNIVERSAL DETAILED INTERPRETER PROMPT (En, Ar, Id, etc.)
            // Matches the quality and depth of the Turkish prompt.
            systemPrompt = `You are an expert Islamic Dream Interpreter with deep spiritual insight.

IMPORTANT: ALL RESPONSES MUST BE IN **${languageName}**. DO NOT USE ANY OTHER LANGUAGE!
The user is using the app in: ${languageName}.

Output ONLY this JSON format:
{
    "symbols": [
        {"symbol": "Symbol seen", "meaning": "Islamic meaning", "source": "Source (Ibn Sirin, Nablusi, etc.)"}
    ],
    "personal_interpretation": "A detailed, emotional, and spiritual analysis addressed specifically to the person (${name || 'My Dear Brother/Sister'}). Must be a FULL PARAGRAPH (5-6 sentences) connecting the symbols to their life.",
    "spiritual_advice": "Warm, comforting spiritual advice and a specific prayer suggestion suitable for their emotional state.",
    "recommended_action": "A VERY CONCRETE, SPECIFIC, and ORIGINAL good deed recommended based on this dream. (Must be at least 5-6 SENTENCES). valid examples: 'Buy ice cream for a child today', 'Call an estranged relative', 'Feed a stray cat', 'Pray 2 rakaat of Hajat'. Avoid generic advice.",
    "warning": "Any specific caution to note, or null."
}

RULES:
1. TONE: Sincere, trustworthy, like a wise spiritual mentor. Address the user by name if possible.
2. DEPTH: Do not give short, generic answers. Weave the symbols into a coherent narrative about their life.
3. RECOMMENDED ACTION: Must be creative and specifically tied to the dream's content (e.g., if they dreamt of water, suggest giving water to someone).
4. LENGTH: 'personal_interpretation' and 'recommended_action' must be detailed paragraphs, not one-liners.`;

            userPrompt = `User Information:
Name: ${name || 'Unknown'}
Birth: ${birth_date || 'Unknown'} ${birth_time || ''}, ${birth_place || ''}
Language: ${languageName}

Dream:
${dream_text}

Please interpret this dream in **${languageName}** with great depth.
1. Address ${name} directly in the interpretation.
2. Provide a specific, creative, and actionable good deed (5-6 sentences).`;
        }

        // 3. Call OpenAI
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('Configuration error: Missing OPENAI_API_KEY');
        }

        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 1200, // Reduced from 2000 for faster response
            }),
        });

        if (!openAIResponse.ok) {
            const errorText = await openAIResponse.text();
            throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
        }

        const aiData = await openAIResponse.json();

        if (!aiData.choices || !aiData.choices[0]?.message?.content) {
            throw new Error('Invalid OpenAI response');
        }

        const result = JSON.parse(aiData.choices[0].message.content);

        // 4. Update interpretation with AI results
        const { error: updateError } = await supabaseClient
            .from('dream_interpretations')
            .update({
                symbols: Array.isArray(result.symbols) ? result.symbols : [],
                personal_interpretation: result.personal_interpretation,
                spiritual_advice: result.spiritual_advice,
                warning: result.warning,
                recommended_action: result.recommended_action,
                status: 'completed'
            })
            .eq('id', interpretationId);

        if (updateError) {
            console.error('Update error:', updateError);
            throw new Error('Failed to update interpretation');
        }


        // Return the interpretation directly
        return new Response(JSON.stringify({
            success: true,
            interpretation_id: interpretationId,
            ...result
        }), {
            headers: { ...headers, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        console.error('[InterpretDream] Error:', errorMessage);
        if (error.stack) console.error('[InterpretDream] Stack:', error.stack);

        // Check for rate limit error (using our RATE_LIMIT: prefix or keywords)
        const isRateLimit = errorMessage.startsWith('RATE_LIMIT:') ||
            errorMessage.includes('limit') ||
            errorMessage.includes('Rate') ||
            errorMessage.includes('istek') ||
            errorMessage.includes('bekleyin');

        // Clean up the error message (remove RATE_LIMIT: prefix if present)
        const cleanMessage = errorMessage.startsWith('RATE_LIMIT:')
            ? errorMessage.replace('RATE_LIMIT:', '')
            : errorMessage;

        return new Response(JSON.stringify({
            success: false,
            error: cleanMessage,
            code: isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'INTERNAL_ERROR'
        }), {
            headers: { ...headers, 'Content-Type': 'application/json' },
            status: isRateLimit ? 429 : 400,
        });
    }
});
