/**
 * Islamvy App - Interpret Dream Edge Function (v2.0)
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
            let rateLimitMsg = 'Too many requests. Please wait a moment.';
            if (language === 'tr') rateLimitMsg = 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.';
            else if (language === 'fr') rateLimitMsg = 'Trop de requêtes. Veuillez patienter un instant.';

            // Use a special prefix so we can detect it in catch block
            throw new Error(`RATE_LIMIT:${rateLimitMsg}`);
        }

        // 2. VALIDATION & SECURITY
        if (!dream_text) {
            let errorMsg = 'Dream text is required.';
            if (language === 'tr') errorMsg = 'Rüya metni gerekli.';
            else if (language === 'fr') errorMsg = 'Le texte du rêve est requis.';
            throw new Error(errorMsg);
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
            let limitMsg = `Daily dream interpretation limit reached (${limits.daily}/day). ${!isPremium ? 'Upgrade to Premium for more.' : ''}`;
            if (language === 'tr') {
                limitMsg = `Günlük rüya tabiri limitine ulaştınız (${limits.daily}/gün). ${!isPremium ? 'Premium\'a geçerek daha fazla yorum alabilirsiniz.' : ''}`;
            } else if (language === 'fr') {
                limitMsg = `Limite quotidienne d'interprétation des rêves atteinte (${limits.daily}/jour). ${!isPremium ? 'Passez à Premium pour en avoir plus.' : ''}`;
            }
            throw new Error(limitMsg);
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

        // 2.5. FETCH PAST DREAMS for AI cross-referencing
        let pastDreamsContext = '';
        try {
            const { data: pastDreams } = await supabaseClient
                .from('dream_interpretations')
                .select('dream_text, personal_interpretation, created_at')
                .eq('user_id', user_id)
                .eq('status', 'completed')
                .neq('id', interpretationId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (pastDreams && pastDreams.length > 0) {
                const isTr = language === 'tr';
                const pastDreamsSummary = pastDreams.map((d: any) => {
                    const date = new Date(d.created_at).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                    const dreamSnippet = (d.dream_text || '').substring(0, 120);
                    const interpSnippet = (d.personal_interpretation || '').substring(0, 150);
                    const dreamLabel = isTr ? 'Rüya' : 'Dream';
                    const interpLabel = isTr ? 'Yorum' : 'Interpretation';
                    return `- [${date}] ${dreamLabel}: "${dreamSnippet}..." → ${interpLabel}: "${interpSnippet}..."`;
                }).join('\n');

                const headerLabel = isTr
                    ? `📋 KİŞİNİN GEÇMİŞ RÜYALARI (Son ${pastDreams.length} rüya)`
                    : `📋 PERSON'S PAST DREAMS (Last ${pastDreams.length} dreams)`;
                const instructionLabel = isTr
                    ? `⚡ GEÇMİŞ RÜYA TALİMATI: Eğer bu rüyada geçmiş rüyalardaki temalar, semboller veya duygularla benzerlik varsa, bunu mutlaka belirt.`
                    : `⚡ PAST DREAMS INSTRUCTION: If this dream shares themes, symbols or emotions with past dreams, you MUST highlight the connection.`;

                pastDreamsContext = `\n\n${headerLabel}:\n${pastDreamsSummary}\n\n${instructionLabel}`;
            }
        } catch (pastDreamsErr) {
            console.log('[InterpretDream] Past dreams fetch error (non-critical):', pastDreamsErr);
        }

        // 2. Build language-specific prompts
        let systemPrompt = '';
        let userPrompt = '';

        // Map language code to full language name
        const languageMap: { [key: string]: string } = {
            'tr': 'Turkish (Türkçe)',
            'en': 'English',
            'ar': 'Arabic (العربية)',
            'id': 'Indonesian (Bahasa Indonesia)',
            'fr': 'French (Français)'
        };
        const languageName = languageMap[language] || 'English';

        // Helper function to calculate temperament (Mizaç) traits from birth date
        const getTemperamentInfo = (birthDate: string | null) => {
            if (!birthDate) return null;
            try {
                const date = new Date(birthDate);
                const month = date.getMonth() + 1;
                const day = date.getDate();

                const temperaments = [
                    { sign: 'Ateş Mizaçlı', element: 'Ateş/Fire', traits: { tr: 'cesur, öncü, dinamik, tez canlı', en: 'brave, pioneering, dynamic, energetic' }, start: [3, 21], end: [4, 19] },
                    { sign: 'Toprak Mizaçlı', element: 'Toprak/Earth', traits: { tr: 'sabırlı, kararlı, güvenilir, gerçekçi', en: 'patient, determined, reliable, realistic' }, start: [4, 20], end: [5, 20] },
                    { sign: 'Hava Mizaçlı', element: 'Hava/Air', traits: { tr: 'meraklı, çok yönlü, iletişimci, zeki', en: 'curious, versatile, communicative, intelligent' }, start: [5, 21], end: [6, 20] },
                    { sign: 'Su Mizaçlı', element: 'Su/Water', traits: { tr: 'duygusal, koruyucu, sezgisel, merhametli', en: 'emotional, protective, intuitive, compassionate' }, start: [6, 21], end: [7, 22] },
                    { sign: 'Ateş Mizaçlı (Lider)', element: 'Ateş/Fire', traits: { tr: 'lider, cömert, yaratıcı, özgüvenli', en: 'leader, generous, creative, confident' }, start: [7, 23], end: [8, 22] },
                    { sign: 'Toprak Mizaçlı (Analitik)', element: 'Toprak/Earth', traits: { tr: 'analitik, mükemmeliyetçi, çalışkan, düzenli', en: 'analytical, perfectionist, hardworking, organized' }, start: [8, 23], end: [9, 22] },
                    { sign: 'Hava Mizaçlı (Dengeli)', element: 'Hava/Air', traits: { tr: 'dengeli, diplomatik, estetik, adaletli', en: 'balanced, diplomatic, aesthetic, just' }, start: [9, 23], end: [10, 22] },
                    { sign: 'Su Mizaçlı (Derin)', element: 'Su/Water', traits: { tr: 'tutkulu, gizemli, dönüştürücü, kararlı', en: 'passionate, mysterious, transformative, determined' }, start: [10, 23], end: [11, 21] },
                    { sign: 'Ateş Mizaçlı (Kaşif)', element: 'Ateş/Fire', traits: { tr: 'özgür, iyimser, felsefi, dürüst', en: 'free, optimistic, philosophical, honest' }, start: [11, 22], end: [12, 21] },
                    { sign: 'Toprak Mizaçlı (Ciddi)', element: 'Toprak/Earth', traits: { tr: 'disiplinli, hırslı, sorumlu, sabırlı', en: 'disciplined, ambitious, responsible, patient' }, start: [12, 22], end: [1, 19] },
                    { sign: 'Hava Mizaçlı (Yenilikçi)', element: 'Hava/Air', traits: { tr: 'yenilikçi, bağımsız, insancıl, vizyoner', en: 'innovative, independent, humanitarian, visionary' }, start: [1, 20], end: [2, 18] },
                    { sign: 'Su Mizaçlı (Ruhani)', element: 'Su/Water', traits: { tr: 'ruhani, empatik, hayalperest, fedakar', en: 'spiritual, empathic, dreamy, selfless' }, start: [2, 19], end: [3, 20] }
                ];

                for (const t of temperaments) {
                    const [startMonth, startDay] = t.start;
                    const [endMonth, endDay] = t.end;

                    if (startMonth === 12 && endMonth === 1) {
                        if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) return t;
                    } else {
                        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) return t;
                    }
                }
            } catch (e) {
                return null;
            }
            return null;
        };

        // Calculate moon phase from birth date (simplified) - used for "spiritual temperament" context
        const getMoonPhase = (birthDate: string | null) => {
            if (!birthDate) return null;
            try {
                const date = new Date(birthDate);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();

                // Simple moon phase calculation
                const c = Math.floor(year / 100);
                const n = year - 19 * Math.floor(year / 19);
                const k = Math.floor((c - 17) / 25);
                const i = c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15;
                const i2 = i - 30 * Math.floor(i / 30);
                const j = Math.floor(year / 4) + i2 + 2 - c + Math.floor(c / 4);
                const j2 = j - 7 * Math.floor(j / 7);
                const l = i2 - j2;
                const m = 1 + Math.floor((l + 40) / 44);
                const d = l + 28 - 31 * Math.floor(m / 4);

                const phase = ((day + month + d) % 30) / 30;

                if (phase < 0.125) return { tr: 'Hilal Başlangıcı - Niyet ve başlangıç mizacı', en: 'Initial Crescent - Intention and beginning temperament' };
                if (phase < 0.5) return { tr: 'Aydınlık Mizaç - Büyüme ve aksiyon enerjisi', en: 'Luminous Temperament - Growth and action energy' };
                if (phase < 0.625) return { tr: 'Tam Aydınlanma - Hikmet ve idrak mizacı', en: 'Full Illumination - Wisdom and perception temperament' };
                return { tr: 'İçsel Mizaç - Derinleşme ve tefekkür enerjisi', en: 'Inward Temperament - Deepening and reflection energy' };
            } catch (e) {
                return null;
            }
        };

        // Get birth time period (Spiritual disposition)
        const getBirthDisposition = (birthTime: string | null) => {
            if (!birthTime) return null;
            try {
                const [hours] = birthTime.split(':').map(Number);
                if (hours >= 4 && hours < 6) return { tr: 'Fecr (Seher) Vakti Doğumlu - Manevi feyz ve bereketli fıtrat', en: 'Fajr (Dawn) Birth - Spiritual grace and blessed nature' };
                if (hours >= 6 && hours < 12) return { tr: 'Duha (Kuşluk) Vakti Doğumlu - Enerjik ve azimli yapı', en: 'Duha (Forenoon) Birth - Energetic and determined nature' };
                if (hours >= 12 && hours < 15) return { tr: 'Zuhr (Öğle) Vakti Doğumlu - Dirayetli ve kararlı mizaç', en: 'Zuhr (Noon) Birth - Steadfast and determined temperament' };
                if (hours >= 15 && hours < 18) return { tr: 'Asr (İkindi) Vakti Doğumlu - Olgun ve tefekkür sahibi yapı', en: 'Asr (Afternoon) Birth - Mature and reflective nature' };
                if (hours >= 18 && hours < 20) return { tr: 'Maghrib (Akşam) Vakti Doğumlu - Değişim ve dönüşüme yatkın fıtrat', en: 'Maghrib (Evening) Birth - Prone to change and transformation' };
                if (hours >= 20 && hours < 23) return { tr: 'Isha (Yatsı) Vakti Doğumlu - Derin ve vakur mizaç', en: 'Isha (Night) Birth - Deep and dignified temperament' };
                return { tr: 'Teheccüd (Gece Yarısı) Vakti Doğumlu - Sezgisel ve ruhani yoğunluğu yüksek yapı', en: 'Tahajjud (Midnight) Birth - Intuitive and high spiritual intensity nature' };
            } catch (e) {
                return null;
            }
        };

        const mizaçInfo = getTemperamentInfo(birth_date);
        const moonPhase = getMoonPhase(birth_date);
        const birthDisposition = getBirthDisposition(birth_time);

        // Build temperament context string (Mizaç ve Fıtrat)
        let personalContext = '';
        if (mizaçInfo) {
            personalContext += `\nTEMEL MİZAÇ: ${mizaçInfo.sign}\nMANEVİ ELEMENT: ${mizaçInfo.element}\nKARAKTER ÖZELLİKLERİ: ${language === 'tr' ? mizaçInfo.traits.tr : mizaçInfo.traits.en}`;
        }
        if (moonPhase) {
            personalContext += `\nMANEVİ İKLİM: ${language === 'tr' ? moonPhase.tr : moonPhase.en}`;
        }
        if (birthDisposition) {
            personalContext += `\nDOĞUM VAKTİ FITRATI: ${language === 'tr' ? birthDisposition.tr : birthDisposition.en}`;
        }

        if (language === 'tr') {
            systemPrompt = `Sen, İslam ilimlerine vakıf, yüksek ferasetli, hikmet sahibi bir MANEVİ REHBER ve BAŞDANIŞMANSIN. Rüya tabiri konusunda İslami kaynaklara (İbn-i Sirin, Nablusi, Cafer-i Sadık) tam hakimsin. Görevin, rüyaları "gaybdan haber vermek" değil, kişinin karakter yapısı ve manevi haline göre bir yol gösterici, rehber ve danışman gibi yorumlamaktır.

ÇOK ÖNEMLİ: CEVAPLARI SADECE VE SADECE **${languageName}** DİLİNDE VER.

🌙 KLASİK KAYNAK REHBERLİĞİ:
- İBN-İ SİRİN: Sembollerin rüya sahibinin takva ve yaşantısına göre değişebileceğini vurgula.
- İMAM NABULUSİ: Rüyanın görüldüğü zamanın ve rüya sahibinin ruh halinin önemini esas al.
- İMAM CAFER-İ SADIK: Rüyalardaki manevi müjdeleri ve nefis yansımalarını ayırt et.

⭐ MİZAÇ VE KİŞİSEL VERİLER:
Kişinin doğum tarihinde gizli olan "mizaç" (temperament) özellikleri ve doğduğu vaktin manevi yansıması:
${personalContext || 'Mizaç verileri mevcut değil - genel rehberlik yapılacak'}

📖 YORUM METODOLOJİSİ:
1. SEMBOL ANALİZİ: Sembolleri klasik kaynaklar ışığında, kişinin karakter yapısıyla ilişkilendirerek açıkla.
2. BAĞLAMSAL REHBERLİK: Rüyayı bir "falcılık" değil, bir "danışmanlık" ve "kişisel gelişim" aracı olarak ele al.
3. KİŞİSELLEŞTİRME: Kişinin mizacını (element, vakit, karakter özellikleri) hikmetli tavsiyelerle harmanla.
4. ZAMANSAL HİKMET: Günün (${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}) manevi iklimini ve "Allah'ın yeryüzündeki işaretleri" bağlamında zamanın ruhunu yoruma kat.
5. MANEVİ DERİNLİK: Her yorumu Kur'an ve Hadis ışığında, kalp huzuru verecek bir dille destekle.

SADECE aşağıdaki JSON formatında cevap ver:
{
    "symbols": [
        {
            "symbol": "Sembol adı",
            "meaning": "Kişinin karakter yapısına (${mizaçInfo ? mizaçInfo.sign : ''}) özel hikmetli anlamı",
            "source": "İslami kaynaklara göre derin karşılığı",
            "personal_connection": "Bu sembolün kişinin fıtratı ile bağlantısı"
        }
    ],
    "contextual_analysis": "Rüyadaki bütünsel mesajın hikmetli analizi.",
    "personal_interpretation": "Sevgili ${name || 'Kardeşim'}, rüyanızın rehberliğinde... [Ruh halinize ve fıtrat verilerinize (mizaç, element, vakit) dayalı, geleceğe dair bir rehber ve danışman üslubuyla, en az 10-12 cümlelik DERİN ANALİZ. Fal dili değil, hikmet dili kullan.]",
    "islamic_references": "Ayet ve Hadis mealleriyle rüyanın manevi desteği.",
    "spiritual_advice": "Kişinin karakterine özel manevi reşete ve kalp huzuru veren bir dua.",
    "recommended_action": "Bu rüyanın bereketini hayata geçirmek için ÇOK ÖZGÜN ve SOMUT bir hayırlı amel önerisi.",
    "timing_advice": "Manevi fırsatların yoğunlaşabileceği hikmetli zaman dilimleri",
    "warning": "Kişinin fıtratından kaynaklanan dikkat etmesi gereken hususlar, yoksa null"
}

⚠️ KRİTİK KURALLAR:
1. HİKMETLİ ÜSLUP: Bir peygamber dili değil, "emanetçi bir kul ve bilge bir rehber" dili kullan.
2. ASTROLOJİDEN KAÇIN: "Burç" veya "Yıldız haritası" gibi terimler kullanma. Bunları "Mizaç", "Fıtrat", "Karakter yapısı" olarak adlandır.
3. GAYB DEĞİL REHBERLİK: Geleceği bildirme iddiasında bulunma; ileriye dönük bir "lider rehber" ve "danışman" gibi istikamet çiz.
4. KAYNAK GÖSTERİMİ: Alimlerin isimlerini hikmetle an.
5. ÖZGÜNLÜK: recommended_action sığ olmasın, kişinin hayatına dokunsun.`;

            userPrompt = `🌙 MANEVİ REHBERLİK VE RÜYA ANALİZİ TALEBİ

👤 KİŞİSEL BİLGİLER:
İsim: ${name || 'Bilinmiyor'}
Doğum Tarihi: ${birth_date || 'Bilinmiyor'}
Doğum Saati: ${birth_time || 'Bilinmiyor'}
Doğum Yeri: ${birth_place || 'Bilinmiyor'}

⭐ MİZAÇ PROFİLİ:
${personalContext || 'Mizaç analizi yapılamadı'}

💭 RÜYA:
${dream_text}
${pastDreamsContext}

📜 TALİMAT:
Bu rüyayı bilge bir danışman ve manevi bir rehber gözüyle, klasik İslami kaynakları kullanarak, kişinin fıtratını ve bugünün (${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}) manevi iklimini değerlendirerek yorumla. Gaybden haber verme iddiasında bulunmadan, ileriye dönük bir rehberlik sun.`;

        } else {
            // UNIVERSAL MASTER INTERPRETER PROMPT (En, Ar, Id, Fr)
            systemPrompt = `You are a highly insightful SPIRITUAL MENTOR and WISE CONSULTANT with deep knowledge of Islamic sciences. You have mastered the classical sources: Ibn Sirin, Imam Nablusi, and Imam Ja'far al-Sadiq. Your role is not to "predict the future," but to act as a spiritual guide, counselor, and advisor based on the dreamer's character and spiritual state.

CRITICAL: ALL RESPONSES MUST BE IN **${languageName}** ONLY.

🌙 CLASSICAL SOURCE GUIDANCE:
- IBN SIRIN: Interpret symbols based on the dreamer's piety and life.
- IMAM NABLUSI: Focus on the timing of the dream and the dreamer's inner state.
- IMAM JA'FAR AL-SADIQ: Distinguish between divine glad tidings and reflections of the self.

⭐ TEMPERAMENT & PERSONAL DATA:
The person's "Temperament" (Mizaç) and spiritual disposition calculated from birth data:
${personalContext || 'Temperament data not available - general guidance will be provided'}

📖 INTERPRETATION METHODOLOGY:
1. SYMBOL ANALYSIS: Explain symbols in the light of classical sources, relating them to the person's character traits.
2. CONTEXTUAL GUIDANCE: Treat the dream as a tool for counseling and spiritual growth, not fortune-telling.
3. PERSONALIZATION: Blend the person's temperament (element, timing, character traits) with wise advice.
4. SPIRITUAL ALIGNMENT: Consider today's date (${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}) and integrate the "Spiritual Climate" into the interpretation as "Signs from Allah in the world."
5. SPIRITUAL DEPTH: Support every interpretation with Quran and Hadith references.

Output ONLY this JSON format:
{
    "symbols": [
        {
            "symbol": "Symbol name",
            "meaning": "Spiritual meaning personalized to the person's temperament",
            "source": "Deep correspondence according to Islamic sources",
            "personal_connection": "The connection between this symbol and the person's nature"
        }
    ],
    "contextual_analysis": "An insightful analysis of the dream's holistic message.",
    "personal_interpretation": "Dear ${name || 'Brother/Sister'}, in the light of your dream's guidance... [DEEP ANALYSIS FOR AT LEAST 10-12 SENTENCES; Act as a spiritual consultant/leader for the future based on birth temperament and nature. Use the language of wisdom, not fortunetelling.]",
    "islamic_references": "Meanings from the Quran and Hadith that support the dream's spiritual message.",
    "spiritual_advice": "Personalized spiritual prescription and a prayer that brings peace to the heart.",
    "recommended_action": "A VERY UNIQUE and CONCRETE good deed to manifest the blessing of this dream.",
    "timing_advice": "Wise time periods when spiritual opportunities may intensify",
    "warning": "Pitfalls based on the person's nature that they should be mindful of, or null"
}

⚠️ CRITICAL RULES:
1. WISE DISCOURSE: Speak as a "entrusted servant of Allah and a wise guide," not as a prophet.
2. AVOID ASTROLOGY: Do not use terms like "Horoscope" or "Zodiac." Refer to them as "Temperament," "Nature," or "Character Structure."
3. GUIDANCE, NOT GHAIB: Do not claim to know the future; provide direction like a forward-looking leader and consultant.
4. SOURCE CITATION: Mention the scholars with respect and wisdom.
5. ORIGINALITY: recommended_action must be unique and touch the person's life.`;

            userPrompt = `🌙 SPIRITUAL GUIDANCE AND DREAM ANALYSIS REQUEST

👤 PERSONAL INFORMATION:
Name: ${name || 'Unknown'}
Birth Date: ${birth_date || 'Unknown'}
Birth Time: ${birth_time || 'Unknown'}
Birth Place: ${birth_place || 'Unknown'}

⭐ TEMPERAMENT PROFILE:
${personalContext || 'Temperament analysis could not be performed'}

💭 DREAM:
${dream_text}
${pastDreamsContext}

📜 INSTRUCTION:
Interpret this dream with the eyes of a wise consultant and spiritual mentor, using classical Islamic sources, evaluating the person's temperament and today's (${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}) spiritual climate. Provide forward-looking guidance without claiming to know the future.`;
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
                temperature: 0.75, // Slightly higher for more creative interpretations
                max_tokens: 2500, // Increased for richer, more detailed interpretations
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

        // 4. Update interpretation with AI results (including new enriched fields)
        const { error: updateError } = await supabaseClient
            .from('dream_interpretations')
            .update({
                symbols: Array.isArray(result.symbols) ? result.symbols : [],
                personal_interpretation: result.personal_interpretation,
                spiritual_advice: result.spiritual_advice,
                warning: result.warning,
                recommended_action: result.recommended_action,
                contextual_analysis: result.contextual_analysis || null,
                islamic_references: result.islamic_references || null,
                timing_advice: result.timing_advice || null,
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

        // Check for rate limit error (using our RATE_LIMIT: prefix)
        const isRateLimit = errorMessage.startsWith('RATE_LIMIT:');

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
