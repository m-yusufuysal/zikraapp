import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // 1. Handle CORS for Browser/Mobile
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('--- Daily Quote Function Start ---');

        const bodyData = await req.json().catch(() => ({}));
        const language = bodyData.language || 'en';
        const today = new Date().toISOString().split('T')[0];
        const requestedDate = bodyData.date || today;

        console.log(`Fetching quote for: ${requestedDate}, Lang: ${language}`);

        // Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const openAIKey = Deno.env.get('OPENAI_API_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase environment variables are not set.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Check Cache (Database)
        const { data: cachedQuote, error: dbError } = await supabase
            .from('daily_quotes')
            .select('*')
            .eq('date', requestedDate)
            .eq('language', language)
            .maybeSingle();

        if (dbError) console.error('DB Fetch Error:', dbError);

        if (cachedQuote) {
            console.log('Returning cached quote from database.');
            return new Response(JSON.stringify(cachedQuote), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Generate with AI (OpenAI)
        if (!openAIKey) {
            throw new Error('OPENAI_API_KEY is not set in Supabase Secrets.');
        }

        const languageNames: Record<string, string> = {
            tr: 'Turkish',
            en: 'English',
            ar: 'Arabic',
            id: 'Indonesian',
        };
        const targetLang = languageNames[language] || 'English';

        console.log(`Generating new quote for ${targetLang}...`);

        const systemPrompt = `You are a high-level spiritual and cultural guide for the Zikra app.
Your task is to provide a "Daily Quote" (Günün Sözü) that captures the spiritual essence of the current day.

CONTENT PRIORITY:
1. ISLAMIC SPECIAL DAYS: If today is an Islamic special day (Ramadan, Eid, Kandil, Ashura, etc.), provide a Verse or Sahih Hadith directly related to its meaning.
2. GLOBAL SPECIAL DAYS: If today is a global special day (Mother's Day, Father's Day, New Year, Earth Day, etc.), provide a Verse or Sahih Hadith that provides an Islamic perspective or blessing for that theme.
3. WORLD CONTEXT: Consider current major world themes or seasonal transitions (Spring, Harvest, Peace, Resilience) and provide a relevant Sahih Hadith or Verse.
4. GENERAL WISDOM: If no specific event, provide an inspiring Sahih Hadith or Quranic Verse.

STRICT RULES:
- LANGUAGE: You MUST provide all text (title, body, citation) in **${targetLang}**.
- SOURCES: Only use the Quran or SAHIH Hadith collections (Bukhari, Muslim, Tirmidhi, etc.).
- VARIETY: Alternate between Verses and Hadiths daily.
- FORMAT: You MUST return a valid JSON object.

JSON Format:
{
  "title": "A poetic and relevant title (e.g., 'Mother's Mercy', 'The Night of Power')",
  "body": "The full text of the verse or hadith",
  "citation": "Surah X:Y or Name of Hadith Book and Chapter/Number",
  "type": "verse" or "hadith"
}`;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAIKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Give me a highly relevant and inspiring quote for this specific date: ${requestedDate}.` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.85,
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`OpenAI API Error (${aiResponse.status}): ${errorText}`);
        }

        const aiData = await aiResponse.json();
        const quote = JSON.parse(aiData.choices[0].message.content);

        // 5. Save to Database
        console.log(`Saving generated quote for ${requestedDate} to DB...`);
        const { data: savedQuote, error: saveError } = await supabase
            .from('daily_quotes')
            .insert({
                date: requestedDate,
                language: language,
                title: quote.title,
                body: quote.body,
                citation: quote.citation,
                type: quote.type || 'verse'
            })
            .select('*')
            .single();

        if (saveError) {
            if (saveError.code === '23505') {
                const { data: retry } = await supabase
                    .from('daily_quotes')
                    .select('*')
                    .eq('date', today)
                    .eq('language', language)
                    .single();
                return new Response(JSON.stringify(retry), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
            throw saveError;
        }

        return new Response(JSON.stringify(savedQuote), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error('CRITICAL ERROR:', err.message);

        const fallback = {
            title: "Günün Tesellisi",
            body: "Sabret, şüphesiz Allah sabredenlerle beraberdir.",
            citation: "Bakara 153",
            type: "verse",
            is_fallback: true,
            error_log: err.message
        };

        return new Response(JSON.stringify(fallback), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Always return 200 for frontend stability
        });
    }
});
