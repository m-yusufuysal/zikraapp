import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Daily Quote Edge Function v3
 * 
 * Priority-based content selection:
 * 1. Special Islamic days (Mawlid, Laylat al-Qadr, Eid, Ashura, Isra Mi'raj, etc.)
 * 2. Universal special days (Mother's Day, Father's Day, World Peace Day, etc.)
 * 3. Current events context (seasonal, humanitarian themes)
 * 4. General inspiring verse or sahih hadith
 * 
 * All languages get the SAME base content (translated, not re-generated).
 * Citation is NEVER included inside the body text.
 * Verses include enough surrounding context to convey the full message.
 */

// Known Islamic special days by Hijri month-day
const ISLAMIC_SPECIAL_DAYS: Record<string, { tr: string; en: string; ar: string; fr: string; id: string }> = {
    '1-1': { tr: 'Hicri Yılbaşı', en: 'Islamic New Year', ar: 'رأس السنة الهجرية', fr: 'Nouvel An Islamique', id: 'Tahun Baru Islam' },
    '1-10': { tr: 'Muharrem / Aşure Günü', en: 'Day of Ashura', ar: 'يوم عاشوراء', fr: 'Jour d\'Achoura', id: 'Hari Asyura' },
    '3-12': { tr: 'Mevlid Kandili (Peygamberimizin Doğumu)', en: 'Mawlid an-Nabi (Birth of Prophet Muhammad ﷺ)', ar: 'المولد النبوي الشريف', fr: 'Mawlid an-Nabi (Naissance du Prophète ﷺ)', id: 'Maulid Nabi Muhammad ﷺ' },
    '7-27': { tr: 'Miraç Kandili', en: 'Isra and Mi\'raj', ar: 'ليلة الإسراء والمعراج', fr: 'Isra et Mi\'raj', id: 'Isra Mi\'raj' },
    '8-15': { tr: 'Berat Kandili', en: 'Mid-Sha\'ban (Night of Records)', ar: 'ليلة النصف من شعبان', fr: 'Nuit du Mi-Cha\'bane', id: 'Nisfu Sya\'ban' },
    '9-1': { tr: 'Ramazan Başlangıcı', en: 'Start of Ramadan', ar: 'بداية شهر رمضان', fr: 'Début du Ramadan', id: 'Awal Ramadan' },
    '9-27': { tr: 'Kadir Gecesi', en: 'Laylat al-Qadr (Night of Power)', ar: 'ليلة القدر', fr: 'Laylat al-Qadr (Nuit du Destin)', id: 'Lailatul Qadr (Malam Kemuliaan)' },
    '10-1': { tr: 'Ramazan Bayramı', en: 'Eid al-Fitr', ar: 'عيد الفطر', fr: 'Aïd al-Fitr', id: 'Idul Fitri' },
    '10-2': { tr: 'Ramazan Bayramı 2. Gün', en: 'Eid al-Fitr Day 2', ar: 'عيد الفطر - اليوم الثاني', fr: 'Aïd al-Fitr Jour 2', id: 'Idul Fitri Hari 2' },
    '10-3': { tr: 'Ramazan Bayramı 3. Gün', en: 'Eid al-Fitr Day 3', ar: 'عيد الفطر - اليوم الثالث', fr: 'Aïd al-Fitr Jour 3', id: 'Idul Fitri Hari 3' },
    '12-8': { tr: 'Terviye Günü (Arife)', en: 'Day of Tarwiyah', ar: 'يوم التروية', fr: 'Jour de Tarwiyah', id: 'Hari Tarwiyah' },
    '12-9': { tr: 'Arife Günü / Arafe', en: 'Day of Arafah', ar: 'يوم عرفة', fr: 'Jour d\'Arafat', id: 'Hari Arafah' },
    '12-10': { tr: 'Kurban Bayramı', en: 'Eid al-Adha', ar: 'عيد الأضحى', fr: 'Aïd al-Adha', id: 'Idul Adha' },
    '12-11': { tr: 'Kurban Bayramı 2. Gün', en: 'Eid al-Adha Day 2', ar: 'عيد الأضحى - اليوم الثاني', fr: 'Aïd al-Adha Jour 2', id: 'Idul Adha Hari 2' },
    '12-12': { tr: 'Kurban Bayramı 3. Gün', en: 'Eid al-Adha Day 3', ar: 'عيد الأضحى - اليوم الثالث', fr: 'Aïd al-Adha Jour 3', id: 'Idul Adha Hari 3' },
    '12-13': { tr: 'Kurban Bayramı 4. Gün', en: 'Eid al-Adha Day 4', ar: 'عيد الأضحى - اليوم الرابع', fr: 'Aïd al-Adha Jour 4', id: 'Idul Adha Hari 4' },
};

// Universal special days by Gregorian month-day
const UNIVERSAL_SPECIAL_DAYS: Record<string, { tr: string; en: string; ar: string; fr: string; id: string }> = {
    '1-1': { tr: 'Yeni Yıl', en: 'New Year\'s Day', ar: 'رأس السنة الميلادية', fr: 'Jour de l\'An', id: 'Tahun Baru' },
    '3-8': { tr: 'Dünya Kadınlar Günü', en: 'International Women\'s Day', ar: 'اليوم العالمي للمرأة', fr: 'Journée Internationale des Femmes', id: 'Hari Perempuan Internasional' },
    '3-21': { tr: 'Dünya Barış Günü', en: 'World Peace Day', ar: 'اليوم العالمي للسلام', fr: 'Journée Mondiale de la Paix', id: 'Hari Perdamaian Dunia' },
    '4-23': { tr: 'Ulusal Egemenlik ve Çocuk Bayramı', en: 'National Sovereignty and Children\'s Day', ar: 'يوم السيادة الوطنية وعيد الطفل', fr: 'Journée de la Souveraineté Nationale et des Enfants', id: 'Hari Kedaulatan dan Anak' },
    '5-1': { tr: 'Emek ve Dayanışma Günü', en: 'International Workers\' Day', ar: 'اليوم العالمي للعمال', fr: 'Fête du Travail', id: 'Hari Buruh Internasional' },
    '6-5': { tr: 'Dünya Çevre Günü', en: 'World Environment Day', ar: 'اليوم العالمي للبيئة', fr: 'Journée Mondiale de l\'Environnement', id: 'Hari Lingkungan Hidup Sedunia' },
    '6-15': { tr: 'Babalar Günü', en: 'Father\'s Day', ar: 'عيد الأب', fr: 'Fête des Pères', id: 'Hari Ayah' },
    '10-1': { tr: 'Dünya Yaşlılar Günü', en: 'International Day of Older Persons', ar: 'اليوم العالمي لكبار السن', fr: 'Journée Internationale des Personnes Âgées', id: 'Hari Lanjut Usia Internasional' },
    '10-5': { tr: 'Dünya Öğretmenler Günü', en: 'World Teachers\' Day', ar: 'اليوم العالمي للمعلم', fr: 'Journée Mondiale des Enseignants', id: 'Hari Guru Sedunia' },
    '11-24': { tr: 'Öğretmenler Günü', en: 'Teachers\' Day (Turkey)', ar: 'يوم المعلم (تركيا)', fr: 'Journée des Enseignants (Turquie)', id: 'Hari Guru (Turki)' },
    '12-10': { tr: 'Dünya İnsan Hakları Günü', en: 'Human Rights Day', ar: 'اليوم العالمي لحقوق الإنسان', fr: 'Journée des Droits de l\'Homme', id: 'Hari HAM Internasional' },
};

/**
 * Get current Hijri date components.
 * Uses Intl.DateTimeFormat for reliable Hijri calendar conversion.
 */
function getHijriDate(date: Date): { month: number; day: number } {
    try {
        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'numeric',
        });
        const parts = formatter.formatToParts(date);
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '0');
        return { month, day };
    } catch {
        return { month: 0, day: 0 };
    }
}

/**
 * Detect the current context for content selection.
 */
function detectContext(date: Date, lang: string): { priority: number; occasion: string; promptHint: string } {
    // Priority 1 — Islamic special days
    const hijri = getHijriDate(date);
    const hijriKey = `${hijri.month}-${hijri.day}`;
    const islamicDay = ISLAMIC_SPECIAL_DAYS[hijriKey];
    if (islamicDay) {
        const name = islamicDay[lang as keyof typeof islamicDay] || islamicDay.en;
        return {
            priority: 1,
            occasion: name,
            promptHint: `Today is a very special Islamic day: ${islamicDay.en}. Select a Quran verse or Sahih hadith that is DIRECTLY related to this occasion. The content must celebrate or reflect the spiritual significance of this day.`
        };
    }

    // Priority 2 — Universal special days
    const gMonth = date.getMonth() + 1;
    const gDay = date.getDate();
    const gregKey = `${gMonth}-${gDay}`;
    const universalDay = UNIVERSAL_SPECIAL_DAYS[gregKey];
    if (universalDay) {
        const name = universalDay[lang as keyof typeof universalDay] || universalDay.en;
        return {
            priority: 2,
            occasion: name,
            promptHint: `Today is ${universalDay.en}. Select a Quran verse or Sahih hadith that relates to the theme of this day (e.g., honoring parents, seeking knowledge, justice, compassion, etc.).`
        };
    }

    // Priority 3/4 — General (with seasonal awareness)
    const month = date.getMonth(); // 0-indexed
    let seasonHint = '';
    if (month >= 2 && month <= 4) seasonHint = 'Themes of renewal, hope, new beginnings, and gratitude are appropriate for this spring season.';
    else if (month >= 5 && month <= 7) seasonHint = 'Themes of generosity, perseverance, and seeking shade in Allah\'s mercy are fitting for this warm season.';
    else if (month >= 8 && month <= 10) seasonHint = 'Themes of reflection, harvest of good deeds, and preparation are suitable for this autumn season.';
    else seasonHint = 'Themes of patience, warmth of faith, and inner light are fitting for this winter season.';

    return {
        priority: 4,
        occasion: '',
        promptHint: `Select a deeply inspiring and thought-provoking Quran verse or Sahih hadith for today. ${seasonHint} Choose content that touches the heart and motivates spiritual growth.`
    };
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    let currentLanguage = 'en';

    try {
        // Parse body
        let bodyData: { language?: string; date?: string } = {};
        try {
            const text = await req.text();
            if (text && text.trim()) {
                bodyData = JSON.parse(text);
            }
        } catch {
            // Empty or invalid body
        }

        currentLanguage = (bodyData.language || 'en').toLowerCase();
        const today = new Date().toISOString().split('T')[0];
        const requestedDate = bodyData.date || today;
        const dateObj = new Date(requestedDate + 'T12:00:00Z');

        console.log(`[v3] Request: date=${requestedDate}, lang=${currentLanguage}`);

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const openAIKey = Deno.env.get('OPENAI_API_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Step 1: Check cache for this language + date
        const { data: cachedQuote } = await supabase
            .from('daily_quotes')
            .select('*')
            .eq('date', requestedDate)
            .eq('language', currentLanguage)
            .maybeSingle();

        if (cachedQuote) {
            console.log(`[v3] Cache HIT for ${currentLanguage}`);
            return new Response(JSON.stringify(cachedQuote), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log(`[v3] Cache MISS for ${currentLanguage}`);

        if (!openAIKey) throw new Error('OPENAI_API_KEY is missing');

        // Step 2: Check if a reference quote exists in ANY language for this date
        const { data: referenceQuote } = await supabase
            .from('daily_quotes')
            .select('*')
            .eq('date', requestedDate)
            .not('language', 'eq', currentLanguage)
            .limit(1)
            .maybeSingle();

        const languageNames: Record<string, string> = {
            tr: 'Turkish', en: 'English', ar: 'Arabic', id: 'Indonesian', fr: 'French'
        };
        const targetLang = languageNames[currentLanguage] || 'English';

        let systemPrompt: string;
        let userPrompt: string;

        if (referenceQuote) {
            // TRANSLATION MODE — Ensure same content across languages
            console.log(`[v3] Translation mode: translating from ${referenceQuote.language} to ${currentLanguage}`);
            systemPrompt = `You are an expert Islamic translator for the Islamvy mobile app.
Your task is to translate a daily Islamic quote to ${targetLang}.

CRITICAL RULES:
1. Translate the FULL, COMPLETE body text. Do NOT summarize or truncate.
2. If the body is a Quran verse, provide the accepted ${targetLang} translation of that exact verse/passage.
3. If the body is a Hadith, translate it faithfully and completely.
4. The "citation" must be the standard academic reference (e.g., "Al-Baqarah, 2:152" or "Sahih Bukhari, 6018").
5. NEVER include the citation/reference inside the body text. The body must contain ONLY the verse/hadith text.
6. Return valid JSON with exactly these fields: title, body, citation, type, context_reason`;

            userPrompt = `Translate the following to ${targetLang}:

Body: "${referenceQuote.body}"
Citation: "${referenceQuote.citation}"
Type: "${referenceQuote.type}"
Context: "${referenceQuote.context_reason || ''}"

Return JSON: { "title": "(inspiring title in ${targetLang})", "body": "(FULL translated text)", "citation": "(localized citation)", "type": "${referenceQuote.type}", "context_reason": "(translated context in ${targetLang})" }`;

        } else {
            // GENERATION MODE — Create new content with priority-based selection
            const context = detectContext(dateObj, currentLanguage);
            console.log(`[v3] Generation mode: priority=${context.priority}, occasion="${context.occasion}"`);

            systemPrompt = `You are an expert Islamic Scholar for the Islamvy mobile app.
You provide a daily Quran verse or Sahih Hadith in ${targetLang}.

CRITICAL RULES:
1. ${context.promptHint}
2. The "body" must contain the FULL, UNABRIDGED text of the verse or hadith. If a verse needs surrounding ayahs for context, include them (up to 3 consecutive ayahs maximum).
3. NEVER include the citation/source reference inside the body text. The body must contain ONLY the sacred text itself.
4. The "citation" must be the standard academic reference format: "SurahName, AyahNumber" for Quran or "BookName, HadithNumber" for Hadith.
5. Ensure absolute AUTHENTICITY — only Sahih (authentic) hadiths from collections like Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasai, Ibn Majah.
6. The "title" should be a short, beautiful, inspiring heading (NOT a citation).
7. The "context_reason" should briefly explain why this content was selected for today.
8. Return valid JSON with exactly these fields: title, body, citation, type, context_reason`;

            const occasionInfo = context.occasion
                ? `\nToday's special occasion: ${context.occasion}`
                : '';

            userPrompt = `Provide an authentic, deeply inspiring Quran verse or Sahih hadith for ${requestedDate} in ${targetLang}.${occasionInfo}

Requirements:
- COMPLETE text, never truncated
- Body must NOT contain any citation or reference text
- If quoting Quran, include enough ayahs to convey the full message
- Citation separate from body

Return JSON: { "title": "...", "body": "...", "citation": "...", "type": "verse|hadith", "context_reason": "..." }`;
        }

        // Step 3: Call OpenAI
        console.log('[v3] Calling OpenAI...');
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
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: referenceQuote ? 0.3 : 0.7,
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(`[v3] OpenAI Error ${aiResponse.status}: ${errorText}`);
            throw new Error(`OpenAI API Error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const quote = JSON.parse(aiData.choices[0].message.content);
        console.log(`[v3] Quote generated: "${quote.title}"`);

        // Clean body: strip any citation that may have leaked into the body
        let cleanBody = quote.body || '';
        // Remove trailing parenthetical citations like "(Al-Baqarah, 152)" or "(Bukhari 6018)"
        cleanBody = cleanBody.replace(/\s*\([^)]*(?:Surah|Sura|سورة|Quran|Coran|Hadith|Hadis|Bukhari|Muslim|Tirmidhi|Abu Dawud|Nasai|Ibn Majah)[^)]*\)\s*$/i, '').trim();
        // Remove trailing bracket citations like "[Al-Baqarah: 152]"
        cleanBody = cleanBody.replace(/\s*\[[^\]]*(?:Surah|Sura|سورة|Quran|Coran|Hadith|Hadis)[^\]]*\]\s*$/i, '').trim();

        // Step 4: Save to DB
        const insertData = {
            date: requestedDate,
            language: currentLanguage,
            title: quote.title,
            body: cleanBody,
            citation: quote.citation,
            type: quote.type || 'verse',
            context_reason: quote.context_reason || null
        };

        const { data: savedQuote, error: saveError } = await supabase
            .from('daily_quotes')
            .insert(insertData)
            .select('*')
            .single();

        if (saveError) {
            if (saveError.code === '23505') {
                console.log('[v3] Duplicate detected, fetching existing...');
                const { data: existing } = await supabase
                    .from('daily_quotes')
                    .select('*')
                    .eq('date', requestedDate)
                    .eq('language', currentLanguage)
                    .single();

                return new Response(JSON.stringify(existing), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
            console.error('[v3] DB Save Error:', saveError.message);
            throw saveError;
        }

        console.log('[v3] Quote saved successfully!');
        return new Response(JSON.stringify(savedQuote), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error('[v3] FATAL ERROR:', err.message);

        const fallbacks: Record<string, any> = {
            tr: { title: "Günün Sözü", body: "Sabret, şüphesiz Allah sabredenlerle beraberdir.", citation: "Bakara, 153", context_reason: "Sabır hatırlatması" },
            ar: { title: "ذكرى اليوم", body: "اصْبِرُوا إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", citation: "البقرة، 153", context_reason: "تذكير بالصبر" },
            en: { title: "Daily Inspiration", body: "Be patient, for indeed Allah is with the patient.", citation: "Al-Baqarah, 153", context_reason: "Patience reminder" },
            fr: { title: "Inspiration du Jour", body: "Soyez patients, car Allah est avec ceux qui patientent.", citation: "Al-Baqarah, 153", context_reason: "Rappel de patience" },
            id: { title: "Inspirasi Harian", body: "Bersabarlah, sesungguhnya Allah bersama orang-orang yang sabar.", citation: "Al-Baqarah, 153", context_reason: "Pengingat kesabaran" }
        };

        const fallback = {
            ...(fallbacks[currentLanguage] || fallbacks.en),
            type: "verse",
            is_fallback: true,
            error: err.message
        };

        return new Response(JSON.stringify(fallback), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
