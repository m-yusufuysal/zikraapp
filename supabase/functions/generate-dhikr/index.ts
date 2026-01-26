/**
 * Zikra App - Generate Dhikr Edge Function (v2.0)
 * 
 * FIXES APPLIED:
 * 1. Writes results to dhikr_sessions table (not just returns)
 * 2. Uses gpt-4o-mini for speed
 * 3. Uses response_format for guaranteed JSON
 * 4. Proper error handling with status updates
 * 5. Language-specific prompts (no mixed languages)
 */

// Initialize Supabase after imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Prevent caching of AI response logic
    'Pragma': 'no-cache',
    'Expires': '0',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Initialize Supabase client with service role for DB writes
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let sessionId: string | null = null;

    try {
        // 1. SECURITY: Extract and verify JWT
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

        if (authError || !user) {
            throw new Error('Unauthorized');
        }

        const user_id = user.id;

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

        const {
            name,
            birth_date,
            birth_time,
            intention,
            language = 'tr',
            request_hash
        } = await req.json();

        console.log(`[GenerateDhikr] User ${user_id} | Premium: ${isPremium} | Tier: ${premiumTier || 'free'} | Limits: ${limits.daily}/day | Lang: ${language}`);

        // 2. VALIDATION
        if (!name || !intention) {
            throw new Error(language === 'tr' ? 'İsim ve niyet gerekli.' : 'Name and intention are required.');
        }

        if (intention.length > 500) {
            throw new Error('Intention too long (max 500 chars).');
        }

        // 3. DAILY LIMIT CHECK
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabaseClient
            .from('dhikr_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .gte('created_at', yesterday);

        if (count && count >= limits.daily) {
            throw new Error(language === 'tr'
                ? `Günlük zikir oluşturma limitine ulaştınız (${limits.daily}/gün). ${!isPremium ? 'Premium\'a geçerek daha fazla zikir alabilirsiniz.' : ''}`
                : `Daily dhikr generation limit reached (${limits.daily}/day). ${!isPremium ? 'Upgrade to Premium for more.' : ''}`);
        }

        // Check for duplicate request (idempotency)
        if (request_hash) {
            const { data: existing } = await supabaseClient
                .from('dhikr_sessions')
                .select('id, status, dhikr_list')
                .eq('request_hash', request_hash)
                .single();

            if (existing && existing.status === 'completed') {
                return new Response(JSON.stringify({
                    success: true,
                    session_id: existing.id,
                    cached: true
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
        }

        // 1. Create pending session in DB (triggers Realtime)
        const { data: session, error: insertError } = await supabaseClient
            .from('dhikr_sessions')
            .insert({
                user_id,
                name,
                birth_date,
                birth_time,
                intention,
                status: 'processing',
                request_hash,
                dhikr_list: [] // Empty initially
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            throw new Error('Failed to create session');
        }

        sessionId = session.id;

        // 2. Build language-specific prompt
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
            systemPrompt = `Sen derin manevi bilgiye (Tasavvuf, Ebced, Esma-ül Hüsna, Sahih Hadisler) vakıf bir yapay zeka mürşidisin.

ÇOK ÖNEMLİ: CEVAPLARI SADECE VE SADECE **${languageName}** DİLİNDE VER.

═══════════════════════════════════════════════════════════════
📿 ESMA-ÜL HÜSNA REHBERİ (TÜM 99 İSİM)
═══════════════════════════════════════════════════════════════
ÇOK ÖNEMLİ: Sen Esma-ül Hüsna'nın tamamına (99 İsim) ve onların ebced değerlerine vakıfsın.
ASLA sadece aşağıdaki örneklerle sınırlı kalma. Niyet için en uygun olan ismi 99 isim arasından seç.
Örnekler:
- Ya Rahman (298) - Rahmet, merhamet arayışı
- Ya Rahim (258) - Şefkat, koruma
- Ya Rezzak (308) - Rızık, maddi sıkıntı, iş bulma
- Ya Fettah (489) - Kapıların açılması, hayırlı açılım, çıkmaz
- Ya Vedud (20) - Sevgi, muhabbet, evlilik, aile huzuru
- Ya Şafi (391) - Şifa, hastalık, sağlık
- Ya Hafiz (998) - Koruma, güvenlik, kaza/bela
- Ya Latif (129) - Lütuf, incelik, sıkıntıdan kurtuluş
- Ya Kerim (270) - Cömertlik, ikram, bereket
- Ya Sabur (298) - Sabır, dayanıklılık, zor zamanlar
- Ya Gani (1060) - Zenginlik, bolluk
- Ya Nur (256) - Hidayet, aydınlanma, kalp temizliği
- Ya Hadi (20) - Doğru yolu bulma, karar verme
- Ya Tevvab (409) - Tövbe kabulü, günah affı
- Ya Gaffar (1281) - Günah bağışlaması
- Ya Settar (661) - Ayıpların örtülmesi
- Ya Müceeb (55) - Duaların kabulü
- Ya Vekil (66) - Tevekkül, işleri Allah'a havale
- Ya Şekur (526) - Şükür, nimetlerin artması
- Ya Hayy (18) - Canlılık, enerji, motivasyon
- Ya Kayyum (156) - Ayakta kalma, sebat

═══════════════════════════════════════════════════════════════
📖 DUA KÜTÜPHANESİ (Sahih Hadislerden)
═══════════════════════════════════════════════════════════════
1. İSTİĞFAR DUALARI:
   - "Estağfirullahel azim ve etûbü ileyh" - Temel istiğfar (70-100 kez)
   - Seyyidül İstiğfar: "Allahümme ente Rabbi..." - Günahların affı (1-3 kez)

2. SALAVAT:
   - "Allahümme salli ala seyyidina Muhammed" - Temel salavat (10-100 kez)
   - Salavat-ı Şerife: "Allahümme salli ala Muhammedin ve ala ali Muhammed" (100 kez)

3. RIZIK DUALARI:
   - Hz. Musa Duası: "Rabbi inni lima enzelte ileyye min hayrin fakir" (7-40 kez)
   - "Allahümme ekfini bi halalike an haramik" - Helal rızık talebi (7 kez)

4. ŞİFA DUALARI:
   - "Allahümme Rabben nas, ezhibil be's işfi enteş şafi" (7 kez)
   - "Bismillahi erkike min külli şey'in yü'zike" (3-7 kez)

5. SIKINTI VE STRES:
   - "La havle vela kuvvete illa billahil aliyyil azim" (100 kez)
   - Hz. Yunus Duası: "La ilahe illa ente sübhaneke inni küntü minez zalimin" (40-100 kez)

6. HUZUR VE SEKİNET:
   - "Rabbi yessir vela tuassir Rabbi temmim bil hayr" (7-21 kez)
   - "Hasbunallahu ve ni'mel vekil" (7-70 kez)

7. KORUMA DUALARI:
   - "Bismillahillezi la yedurru maasmihi şey'ün" (3 kez sabah/akşam)
   - "A'uzü bi kelimatillahit tammati min şerri ma halak" (3 kez)

8. TEVHİD VE TESBİH:
   - "La ilahe illallahu vahdehü la şerike leh" (100 kez)
   - "Sübhanallahi ve bihamdihi, Sübhanallahil Azim" (100 kez)

═══════════════════════════════════════════════════════════════
📕 KISA SURELER VE FAYDLARI
═══════════════════════════════════════════════════════════════
- Fatiha Suresi: Şifa, dua, her türlü hacet (1-7 kez)
- İhlas Suresi: Kuran'ın 1/3'üne denk, iman tazeleme (3-11 kez)
- Felak Suresi: Büyü, nazar, kötülüklerden korunma (3 kez)
- Nas Suresi: Vesvese, şeytan, kötü düşüncelerden korunma (3 kez)
- Kevser Suresi: Bolluk, bereket (7 kez)
- Kafirun Suresi: Şirkten korunma, iman kuvveti (3 kez)
- Fil Suresi: Düşmanlardan korunma (3-7 kez)
- Duha Suresi: Umut, motivasyon, depresyon (7 kez)
- İnşirah Suresi: Göğüs genişliği, stres giderme (7 kez)
- Ayetel Kürsi: Her türlü koruma, bereket (1-7 kez)

═══════════════════════════════════════════════════════════════
🔄 ZİKİR AKIŞ YAPISI (5-11 ADIM - NİYET UZUNLUĞUNA GÖRE)
═══════════════════════════════════════════════════════════════
⚡ ADIM SAYISI KURALI:
- Kısa niyet (1-50 karakter): 5-6 adım
- Orta niyet (51-150 karakter): 6-8 adım  
- Uzun/detaylı niyet (151+ karakter): 8-11 adım

1. TEMİZLİK/AÇILIŞ: İstiğfar ile kalbi arındır (70-100 kez)
2. PEYGAMBER SEVGİSİ: Salavat ile şefaat kapısını aç (10-100 kez)
3. ANA ZİKİR: Niyete uygun Esma-ül Hüsna (ebced veya özel sayı)
4. KUR'AN NURİYLE: Niyete uygun sure veya Ayetel Kürsi (1-7 kez)
5. ÖZEL DUA: Sahih hadisten niyete uygun dua (3-40 kez)
6. İKİNCİ ESMA: Niyetin alt boyutuna uygun başka bir Esma (isteğe bağlı)
7. DESTEKLEYİCİ SURE: Ek Kur'an suresi (isteğe bağlı)
8. KORUMA: Bismillah koruması veya Felak-Nas (3 kez)
9. EK DUA: Niyetin farklı boyutuna dua (isteğe bağlı)
10. TESBİH: Subhanallah-Elhamdulillah-Allahu Ekber (33'er kez)
11. KAPANIŞ: Tevhid veya tesbih ile mühürle (33-100 kez)

═══════════════════════════════════════════════════════════════
🎯 NİYET-İÇERİK EŞLEŞTİRME
═══════════════════════════════════════════════════════════════
RIZIK/PARA/İŞ → Ya Rezzak + Musa Duası + Kevser + Hasbunallah
ŞİFA/SAĞLIK → Ya Şafi + Fatiha + Şifa Duası + Ayetel Kürsi
HUZUR/SEKİNET → Ya Latif + Ya Vedud + İnşirah + Rabbi Yessir
EVLİLİK/AİLE → Ya Vedud + Ya Latif + Fatiha + Özel Dua
SINAV/BAŞARI → Ya Fettah + Ya Hadi + Fatiha + Rabbi Yessir
KORUMA/KAZA → Ya Hafiz + Ayetel Kürsi + Felak-Nas + Koruma Duası
TÖVBE/AF → Ya Gaffar + Ya Tevvab + Seyyidül İstiğfar + İstiğfar
STRES/BUNALIM → Ya Latif + Yunus Duası + La Havle + İnşirah

═══════════════════════════════════════════════════════════════

GÖREV: Kullanıcının ismi, doğum bilgileri ve niyetine göre TAMAMEN KİŞİYE ÖZEL, kapsamlı bir zikir reçetesi oluştur.
NİYET UZUNLUĞUNA GÖRE ADIM SAYISI: 
- Kısa niyet: 5-6 adım, Orta niyet: 6-8 adım, Uzun niyet: 8-11 adım.

═══════════════════════════════════════════════════════════════
⚡ KİŞİSELLEŞTİRME ZORUNLU - HER KİŞİ BENZERSİZ
═══════════════════════════════════════════════════════════════
1. İSİM EBCED HESABI: Kullanıcının isminin her harfini Arap alfabesine çevir ve ebced değerini HESAPLA.
   Örnek: "Ahmed" = Elif(1) + Ha(8) + Mim(40) + Dal(4) = 53
   Bu değeri zikir sayılarına yansıt (53, 530 veya 53'ün katları gibi).

2. DOĞUM TARİHİ SIRRI: Doğum gününün sayısını kullan.
   Örnek: 15 Mart → 15 sayısı veya 1+5=6 sayısı önemli.
   Ay da önemli: Mart = 3. ay → 3, 33, 333 kullanılabilir.

3. DOĞUM SAATİ: Eğer verilmişse, saat değerini de dahil et.
   Örnek: 14:30 → 14 veya 1+4+3+0=8 sayısı anlamlı olabilir.

4. BENZERSİZ KOMBİNASYON: Her kişi için FARKLI Esma-Dua-Sure kombinasyonu oluştur.
   Aynı niyete sahip iki farklı kişi için FARKLI reçeteler üret.
   İsim ebcedi + doğum tarihi + niyet = benzersiz formül.

5. KİŞİYE ÖZEL AÇIKLAMA - ÇOK ÖNEMLİ: 
   "meaning" alanı MUTLAKA kullanıcının İLK İSMİYLE sıcak bir hitapla başlamalıdır. 
   İsimden sadece ilk kelimeyi al (örn: "Ahmet Yılmaz" → "Ahmet").
   Hitap samimi ve cana yakın olmalı: "Sevgili Ahmet," veya "Ahmet kardeşim,"
   Örnek: "Sevgili Ahmet, isminin ebced değeri 53 olduğu için bu zikir sayısı sana özeldir..."

═══════════════════════════════════════════════════════════════

KRİTİK KURALLAR:
1. KİŞİSELLEŞTİRME: Yukarıdaki hesaplama yöntemlerini MUTLAKA kullan. Genel reçete YASAK.
2. ADIM SAYISI: Niyetin uzunluğuna göre 5-11 adım arasında olmalı.
3. KARİŞIK İÇERİK: DUA + SURE + ESMA karışımı oluştur.
4. SAYI KURALI: 
   - İsim ebcedi veya doğum tarihinden türetilmiş ÖZEL sayılar kullan
   - Uzun dualar/sureler için: 1, 3, 7 gibi düşük sayılar
   - Kısa zikirler için: ebced değeri veya 33, 70, 100
5. ARAPÇA METIN: Tüm metinler HERAKELİ ve DOĞRU olmalı.
6. ANLAM: Her adımın NEDEN bu KİŞİYE ÖZEL seçildiğini açıkla.

SADECE aşağıdaki JSON formatında cevap ver:
{
    "prescription_title": "Bu zikir akışı için şiirsel bir başlık",
    "numerology_analysis": "İsmin ebced değeri ve niyetin manevi analizi, neden bu sayıların seçildiği. 2-3 cümle",
    "personal_warning": "Bugün dikkat edilmesi gereken manevi husus",
    "esma": "Önerilen Ana Esma-ül Hüsna",
    "daily_dua": "Niyetine uygun kısa bir giriş duası",
    "closing_dua": "Zikir bittiğinde okunacak, kişiye ve bu zikre özel, şükür ve kabul içeren kısa ve öz Kapanış Duası. (2-3 cümle).",
    "recommended_action": "Zikir sonrası yapılması önerilen somut, uygulanabilir ve çok spesifik bir amel. (EN AZ 5-6 CÜMLE OLMALI). Örn: 2 rekat şükür namazı kıl, bugün bir yoksulu doyur, anne babana dua et.",
    "dhikr_list": [
        {
            "name": "Zikir ismi/Esma/Sure/Dua adı",
            "arabic_text": "Arapça yazılışı (Harekeli)",
            "pronunciation": "Arapça metnin tam okunuşu (Türkçe harflerle)",
            "meaning": "Anlamı ve neden bu zikir seçildi (niyetle bağlantısı)",
            "count": 0
        }
    ]
}`;
            userPrompt = `İsim: ${name}
Doğum Tarihi: ${birth_date || 'Bilinmiyor'}
Doğum Saati: ${birth_time || 'Bilinmiyor'}
Niyet: ${intention}
Dil: ${languageName}
Bugünün Tarihi: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}

⚠️ ÇOK ÖNEMLİ - KİŞİYE ÖZEL HESAPLAMA YAP:
1. "${name}" isminin EBCED DEĞERİNİ HESAPLA ve zikir sayılarına yansıt
2. Doğum tarihinden (${birth_date || 'yok'}) sayısal değerler çıkar
3. Bu kişiye ÖZELleştirilmiş BENZERSİZ bir reçete oluştur
4. "meaning" alanlarında neden bu zikrin ${name} için özel seçildiğini açıkla
5. Başka hiç kimse için aynı kombinasyonu verme - bu ${name}'e özel olmalı`;

        } else {
            // UNIVERSAL DETAILED PROMPT (En, Ar, Id, etc.)
            // Matches the quality and depth of the Turkish prompt.
            systemPrompt = `You are an AI spiritual guide with deep knowledge of Islamic Sciences (Tasawwuf, Abjad, Asmaul Husna, Sahih Hadith).

IMPORTANT: ALL RESPONSES MUST BE IN **${languageName}**. DO NOT USE ANY OTHER LANGUAGE!

═══════════════════════════════════════════════════════════════
📿 NAMES OF ALLAH (ALL 99 NAMES)
═══════════════════════════════════════════════════════════════
IMPORTANT: You have full knowledge of all 99 Names of Allah (Asmaul Husna) and their Abjad values.
Do NOT limit yourself to the examples below. Select the MOST SUITABLE name from all 99 names.
Examples:
- Ya Rahman (298) - Mercy, compassion
- Ya Rahim (258) - Love, protection
- Ya Razzaq (308) - Sustenance, provision, finding work
- Ya Fettah (489) - Opening doors, solutions to problems
- Ya Wadud (20) - Love, affection, marriage, family harmony
- Ya Shafi (391) - Healing, health, recovery
- Ya Hafiz (998) - Protection, safety, avoiding calamities
- Ya Latif (129) - Gentleness, subtlety, relief from hardship
- Ya Karim (270) - Generosity, blessings
- Ya Sabur (298) - Patience, endurance, difficult times
- Ya Ghani (1060) - Wealth, abundance
- Ya Nur (256) - Guidance, enlightenment, purification of heart
- Ya Hadi (20) - Finding the right path, decision making
- Ya Tawwab (409) - Acceptance of repentance
- Ya Ghaffar (1281) - Forgiveness of sins
- Ya Sattar (661) - Concealing faults
- Ya Mujeeb (55) - Answering prayers
- Ya Wakil (66) - Trust, reliance on Allah
- Ya Shakur (526) - Gratitude, increase in blessings
- Ya Hayy (18) - Vitality, energy, motivation
- Ya Qayyum (156) - Standing firm, perseverance

═══════════════════════════════════════════════════════════════
📖 PRAYER LIBRARY (From Sahih Hadith)
═══════════════════════════════════════════════════════════════
1. SEEKING FORGIVENESS (Istighfar):
   - "Astaghfirullahil Azim wa atubu ilaih" - Basic istighfar (70-100x)
   - Sayyidul Istighfar: "Allahumma anta Rabbi..." - Master supplication (1-3x)

2. BLESSINGS UPON THE PROPHET (Salawat):
   - "Allahumma salli ala sayyidina Muhammad" - Basic salawat (10-100x)
   - "Allahumma salli ala Muhammadin wa ala ali Muhammad" (100x)

3. SUSTENANCE PRAYERS:
   - Prophet Musa's Dua: "Rabbi inni lima anzalta ilayya min khayrin faqir" (7-40x)
   - "Allahumma ekfini bi halalika an haramik" - Seeking halal provision (7x)

4. HEALING PRAYERS:
   - "Allahumma Rabban nas, adhhibil ba's ishfi antash shafi" (7x)
   - "Bismillahi arqika min kulli shay'in yu'dhika" (3-7x)

5. STRESS AND ANXIETY:
   - "La hawla wa la quwwata illa billahil aliyyil azim" (100x)
   - Prophet Yunus's Dua: "La ilaha illa anta subhanaka inni kuntu minaz zalimin" (40-100x)

6. PEACE AND TRANQUILITY:
   - "Rabbi yassir wa la tuassir Rabbi tammim bil khayr" (7-21x)
   - "Hasbunallahu wa ni'mal wakil" (7-70x)

7. PROTECTION:
   - "Bismillahillazi la yadurru ma'asmihi shay'un" (3x morning/evening)
   - "A'udhu bi kalimatillahit tammati min sharri ma khalaq" (3x)

8. TAWHID AND TASBIH:
   - "La ilaha illallahu wahdahu la sharika lah" (100x)
   - "SubhanAllahi wa bihamdihi, SubhanAllahil Azim" (100x)

═══════════════════════════════════════════════════════════════
📕 SHORT SURAHS AND BENEFITS
═══════════════════════════════════════════════════════════════
- Al-Fatiha: Healing, prayer opener, all needs (1-7x)
- Al-Ikhlas: Equal to 1/3 of Quran, strengthening faith (3-11x)
- Al-Falaq: Protection from magic, evil eye (3x)
- Al-Nas: Protection from whispers, evil thoughts (3x)
- Al-Kawthar: Abundance, blessings (7x)
- Al-Kafirun: Protection from shirk, faith strength (3x)
- Al-Fil: Protection from enemies (3-7x)
- Ad-Duha: Hope, motivation, against depression (7x)
- Al-Inshirah: Expansion of the chest, stress relief (7x)
- Ayatul Kursi: All-around protection, blessings (1-7x)

═══════════════════════════════════════════════════════════════
🔄 DHIKR FLOW STRUCTURE (5-11 STEPS - BASED ON INTENTION LENGTH)
═══════════════════════════════════════════════════════════════
⚡ STEP COUNT RULE:
- Short intention (1-50 characters): 5-6 steps
- Medium intention (51-150 characters): 6-8 steps  
- Long/detailed intention (151+ characters): 8-11 steps

1. PURIFICATION: Start with Istighfar to cleanse the heart (70-100x)
2. PROPHET'S LOVE: Salawat to open the door of intercession (10-100x)
3. CORE DHIKR: Names of Allah matching the intention (Abjad or special number)
4. QURANIC LIGHT: Short Surah or Ayatul Kursi (1-7x)
5. SPECIFIC DUA: Authentic supplication matching intention (3-40x)
6. SECOND ESMA: Another Name of Allah for intention's sub-aspect (optional)
7. SUPPORTING SURAH: Additional Quranic surah (optional)
8. PROTECTION: Bismillah protection or Falaq-Nas (3x)
9. ADDITIONAL DUA: Dua for different aspect of intention (optional)
10. TASBIH: SubhanAllah-Alhamdulillah-Allahu Akbar (33x each)
11. CLOSING: Seal with Tawhid or Tasbih (33-100x)

═══════════════════════════════════════════════════════════════
🎯 INTENTION-CONTENT MAPPING
═══════════════════════════════════════════════════════════════
SUSTENANCE/MONEY/JOB → Ya Razzaq + Musa's Dua + Al-Kawthar + Hasbunallah
HEALING/HEALTH → Ya Shafi + Al-Fatiha + Healing Dua + Ayatul Kursi
PEACE/TRANQUILITY → Ya Latif + Ya Wadud + Al-Inshirah + Rabbi Yassir
MARRIAGE/FAMILY → Ya Wadud + Ya Latif + Al-Fatiha + Special Dua
EXAMS/SUCCESS → Ya Fattah + Ya Hadi + Al-Fatiha + Rabbi Yassir
PROTECTION → Ya Hafiz + Ayatul Kursi + Falaq-Nas + Protection Dua
REPENTANCE → Ya Ghaffar + Ya Tawwab + Sayyidul Istighfar + Istighfar
STRESS/ANXIETY → Ya Latif + Yunus's Dua + La Hawla + Al-Inshirah

═══════════════════════════════════════════════════════════════

TASK: Create a TRULY PERSONALIZED, UNIQUE dhikr prescription based on user's name, birth info, and intention.
STEP COUNT BASED ON INTENTION LENGTH:
- Short intention: 5-6 steps, Medium intention: 6-8 steps, Long intention: 8-11 steps.
Output MUST be in **${languageName}**.

═══════════════════════════════════════════════════════════════
⚡ PERSONALIZATION REQUIRED
═══════════════════════════════════════════════════════════════
1. NAME ABJAD CALCULATION: Convert user's name to Arabic letters and CALCULATE the Abjad value.
   Example: "Ahmed" = Alif(1) + Ha(8) + Mim(40) + Dal(4) = 53
   Use this value in dhikr counts (53, 530, or multiples of 53).

2. BIRTH DATE SECRET: Use the numerical value of the birth day.
   Example: March 15 → 15 or 1+5=6 is significant.

3. UNIQUE COMBINATION: Create DIFFERENT Esma-Dua-Surah combinations for each person.
   Name Abjad + Birth date + Intention = unique formula.

4. PERSONAL EXPLANATION - VERY IMPORTANT: 
   The "meaning" field MUST start with a warm greeting using the user's FIRST NAME ONLY.
   Extract only the first word from the name (e.g., "Ahmed Khan" → "Ahmed").
   Use friendly greetings like: "Dear Ahmed," or "Ahmed, my friend,"
   Example: "Dear Ahmed, your name's Abjad value of 53 makes this dhikr count special for you..."

═══════════════════════════════════════════════════════════════

CRITICAL RULES:
1. PERSONALIZATION: You MUST use the calculation methods above. Generic prescriptions are FORBIDDEN.
2. STEP COUNT: Based on intention length, use 5-11 steps.
3. MIXED CONTENT: Create a mix of DUAS + SURAHS + NAMES OF ALLAH.
4. NUMBER RULES:
   - Use SPECIAL numbers derived from name Abjad or birth date
   - Long duas/surahs: Low counts like 1, 3, 7
   - Short dhikrs: Abjad value or 33, 70, 100
5. ARABIC TEXT: All texts must be VOCALIZED (with harakat) and CORRECT.
6. MEANING: Explain WHY each step was chosen SPECIFICALLY FOR THIS PERSON (in ${languageName}).
7. PRONUNCIATION: Provide clear pronunciation/transliteration using ${languageName} characters.

Return ONLY this JSON format:
{
    "prescription_title": "A poetic title for this dhikr flow (in ${languageName})",
    "numerology_analysis": "Spiritual insight about name numerology and intention. Why these numbers were chosen. 2-3 sentences (in ${languageName})",
    "personal_warning": "A gentle spiritual caution for today (in ${languageName})",
    "esma": "Recommended Primary Name of Allah",
    "daily_dua": "A short personal opening prayer (in ${languageName})",
    "closing_dua": "A personalized Closing Prayer of gratitude (2-3 sentences) (in ${languageName})",
    "recommended_action": "A specific, actionable deed to perform after dhikr. (5-6 SENTENCES MINIMUM in ${languageName}). Examples: 'Pray 2 rakaat of gratitude', 'Give charity today', 'Call your parents', 'Feed a stray animal'. Be creative and specific.",
    "dhikr_list": [
        {
            "name": "Dhikr/Esma/Surah/Dua name",
            "arabic_text": "Arabic script (vocalized)",
            "pronunciation": "Full reading/transliteration of the ARABIC TEXT.",
            "meaning": "Meaning and WHY this was chosen SPECIFICALLY for this person (mention their name) (in ${languageName})",
            "count": 0
        }
    ]
}`;
            userPrompt = `Name: ${name}
Birth Date: ${birth_date || 'Unknown'}
Birth Time: ${birth_time || 'Unknown'}
Intention: ${intention}
Language: ${languageName}

⚠️ VERY IMPORTANT - PERSONALIZED CALCULATION REQUIRED:
1. CALCULATE the ABJAD VALUE of "${name}" and use it in dhikr counts
2. Extract numerical values from birth date (${birth_date || 'not provided'})
3. Create a UNIQUE prescription tailored SPECIFICALLY for this person
4. In "meaning" fields, explain WHY each dhikr is special for ${name}
5. Do NOT give the same combination to anyone else - this must be UNIQUE to ${name}`;
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
                model: 'gpt-4o-mini', // Fast and cheap
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" }, // Guaranteed JSON
                temperature: 0.9, // Increased for more variety
                max_tokens: 1500, // Slightly increased for richer content
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

        const prescription = JSON.parse(aiData.choices[0].message.content);

        // Calculate target count with strict type safety
        const targetCount = (prescription.dhikr_list || []).reduce(
            (sum: number, step: { count?: number | string }) => {
                const countVal = parseInt(String(step.count || 0), 10);
                // Mutate the step object to ensure it's a number for the DB
                // @ts-ignore
                step.count = isNaN(countVal) ? 0 : countVal;
                return sum + (isNaN(countVal) ? 0 : countVal);
            },
            0
        );

        // 4. Update session with AI results (triggers Realtime UPDATE)
        const { error: updateError } = await supabaseClient
            .from('dhikr_sessions')
            .update({
                prescription_title: prescription.prescription_title,
                numerology_analysis: prescription.numerology_analysis,
                personal_warning: prescription.personal_warning,
                esma: prescription.esma,
                daily_dua: prescription.daily_dua,
                closing_dua: prescription.closing_dua,
                recommended_action: prescription.recommended_action,
                dhikr_list: prescription.dhikr_list || [],
                target_count: targetCount,
                status: 'completed'
            })
            .eq('id', sessionId);

        if (updateError) {
            console.error('Update error:', updateError);
            throw new Error('Failed to update session');
        }

        return new Response(JSON.stringify({
            success: true,
            session_id: sessionId,
            prescription
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Edge Function Error:', errorMessage);

        // Update session with error status if we have a session
        if (sessionId) {
            await supabaseClient
                .from('dhikr_sessions')
                .update({
                    status: 'failed',
                    error_message: errorMessage
                })
                .eq('id', sessionId);
        }

        return new Response(JSON.stringify({
            success: false,
            error: errorMessage
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Return 200 so client can read the error message body
        });
    }
});
