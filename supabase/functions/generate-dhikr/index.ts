/**
 * Islamvy App - Generate Dhikr Edge Function (v2.0)
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
            request_hash,
            timezone_offset  // UTC offset in hours (e.g., 3 for Turkey, 7 for Indonesia)
        } = await req.json();

        console.log(`[GenerateDhikr] User ${user_id} | Premium: ${isPremium} | Tier: ${premiumTier || 'free'} | Limits: ${limits.daily}/day | Lang: ${language}`);

        // 2. VALIDATION
        if (!name || !intention) {
            let errorMsg = 'Name and intention are required.';
            if (language === 'tr') errorMsg = 'İsim ve niyet gerekli.';
            else if (language === 'fr') errorMsg = 'Le nom et l\'intention sont requis.';
            throw new Error(errorMsg);
        }

        if (intention.length > 666) {
            throw new Error('Intention too long (max 666 chars).');
        }

        // 3. DAILY LIMIT CHECK
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabaseClient
            .from('dhikr_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .gte('created_at', yesterday);

        if (count && count >= limits.daily) {
            let limitMsg = `Daily dhikr generation limit reached (${limits.daily}/day). ${!isPremium ? 'Upgrade to Premium for more.' : ''}`;
            if (language === 'tr') {
                limitMsg = `Günlük zikir oluşturma limitine ulaştınız (${limits.daily}/gün). ${!isPremium ? 'Premium\'a geçerek daha fazla zikir alabilirsiniz.' : ''}`;
            } else if (language === 'fr') {
                limitMsg = `Limite quotidienne de génération de dhikr atteinte (${limits.daily}/jour). ${!isPremium ? 'Passez à Premium pour en avoir plus.' : ''}`;
            }
            throw new Error(limitMsg);
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

        // === CREATIVITY ENHANCEMENTS ===
        // Random seed to prevent repetitive outputs
        const creativitySeed = Math.floor(Math.random() * 100000);
        // Session count for today (how many times this user generated today)
        const sessionCountToday = (count || 0) + 1;
        // Current time of day for time-aware content
        const now = new Date();
        const utcOffset = typeof timezone_offset === 'number' ? timezone_offset : 3; // Default to Turkey (UTC+3)
        const currentHour = (now.getUTCHours() + utcOffset + 24) % 24;
        let timeOfDay = 'gece';
        let timeOfDayEn = 'night';
        if (currentHour >= 4 && currentHour < 12) { timeOfDay = 'sabah'; timeOfDayEn = 'morning'; }
        else if (currentHour >= 12 && currentHour < 15) { timeOfDay = 'öğle'; timeOfDayEn = 'afternoon'; }
        else if (currentHour >= 15 && currentHour < 18) { timeOfDay = 'ikindi'; timeOfDayEn = 'late afternoon'; }
        else if (currentHour >= 18 && currentHour < 21) { timeOfDay = 'akşam'; timeOfDayEn = 'evening'; }
        // Approximate Hijri date (simplified)
        const hijriEstimate = Math.floor((now.getTime() / 1000 - 1406000000) / 86400 % 354);

        // Map language code to full language name
        const languageMap: { [key: string]: string } = {
            'tr': 'Turkish (Türkçe)',
            'en': 'English',
            'ar': 'Arabic (العربية)',
            'id': 'Indonesian (Bahasa Indonesia)',
            'fr': 'French (Français)'
        };
        const languageName = languageMap[language] || 'English';

        if (language === 'tr') {
            systemPrompt = `Sen derin manevi bilgiye (Tasavvuf, Ebced, Esma-ül Hüsna, Sahih Hadisler) vakıf bir yapay zeka mürşidisin.

ÇOK ÖNEMLİ: CEVAPLARI SADECE VE SADECE **${languageName}** DİLİNDE VER.

🎲 YARATICILIK PARAMETRELERİ:
- Tohum: ${creativitySeed}
- Bugünkü oturum: ${sessionCountToday}. seans
- Tahmini Hicri gün: ${hijriEstimate}
- Vakit dilimi: ${timeOfDay}

⏰ ZAMANA DUYARLI İÇERİK:
- Şu an ${timeOfDay} vakti. Reçeteyi bu vakte uygun olarak oluştur:
  • Sabah (Fecr-Öğle): Enerjik, motivasyon artırıcı zikirler
  • Öğle (Zuhr-Asr): Odaklanma ve verimlilik zikirleri  
  • Akşam (Mağrib-İşa): Tefekkür, şükür ve muhasebe zikirleri
  • Gece (Teheccüd): Derin ruhani zikirler, kalp temizliği

🔀 ÇEŞİTLİLİK KURALLARI (ZORUNLU):
- ASLA her zaman İstiğfar ile başlama. Bazen Salavat, bazen bir Kur'an suresi, bazen doğrudan Esma ile başla.
- Her oturumda EN AZ bir NADIR ve AZ BİLİNEN dua veya zikir kullan (sahih kaynaklardan).
- Aynı niyetle bile olsa, her seferinde FARKLI akış yapısı oluştur.
- Popüler ilk 10 Esma dışında en az bir Esma mutlaka dahil et.
- Oturum numarası ${sessionCountToday} → Bu kullanıcı bugün ${sessionCountToday}. kez istiyor, öncekilerden TAMAMEN FARKLI bir reçete ver.

═══════════════════════════════════════════════════════════════
📿 ESMA-ÜL HÜSNA REHBERİ (TÜM 99 İSİM - TAM LİSTE)
═══════════════════════════════════════════════════════════════
ÇOK ÖNEMLİ: 99 İsim'in TAMAMINA vakıfsın. Niyet için en uygun olan ismi seç.
1. Ya Allah - Bütün isimleri kapsayan zat ismi
2. Ya Rahman (298) - Rahmet, merhamet
3. Ya Rahim (258) - Şefkat, koruma
4. Ya Melik (90) - Hükümranlık, otorite
5. Ya Kuddüs (170) - Arınma, temizlik
6. Ya Selam (131) - Esenlik, barış
7. Ya Mü'min (137) - Güven, iman kuvveti
8. Ya Müheymin (145) - Gözetim, koruma
9. Ya Aziz (94) - İzzet, şeref, güç
10. Ya Cebbar (206) - Onarma, düzeltme
11. Ya Mütekebbir (662) - Büyüklük, kibir kırma
12. Ya Halık (731) - Yaratıcılık, yeni başlangıç
13. Ya Bari (213) - Eksiksiz yaratma
14. Ya Musavvir (336) - Şekillendirme, güzellik
15. Ya Gaffar (1281) - Bağışlama
16. Ya Kahhar (306) - Üstün gelme, düşmana galebe
17. Ya Vehhab (14) - Karşılıksız ikram
18. Ya Rezzak (308) - Rızık, maddi bolluk
19. Ya Fettah (489) - Kapıların açılması
20. Ya Alim (150) - İlim, bilgi
21. Ya Kabız (903) - Tutma, engelleme
22. Ya Basıt (72) - Genişletme, ferahlık
23. Ya Hafid (1481) - Alçaltma
24. Ya Rafi (351) - Yüceltme, makam
25. Ya Muizz (117) - İzzet verme, onurlandırma
26. Ya Müzill (770) - Zillete düşürme
27. Ya Semi (180) - İşitme, duaları duyma
28. Ya Basir (302) - Görme, basiret
29. Ya Hakem (68) - Hükmetme, adalet
30. Ya Adl (104) - Adalet
31. Ya Latif (129) - Lütuf, incelik
32. Ya Habir (812) - Haberdar olma
33. Ya Halim (88) - Yumuşaklık, hilm
34. Ya Azim (1020) - Büyüklük
35. Ya Gafur (1286) - Mağfiret
36. Ya Şekur (526) - Şükrü kabul
37. Ya Aliyy (110) - Yücelik
38. Ya Kebir (232) - Büyüklük
39. Ya Hafiz (998) - Koruyucu
40. Ya Mukit (550) - Rızık verici
41. Ya Hasib (80) - Hesap gören
42. Ya Celil (73) - Celal sahibi
43. Ya Kerim (270) - Cömertlik
44. Ya Rakib (312) - Gözetleyici
45. Ya Mucib (55) - Duaları kabul eden
46. Ya Vasi (137) - Geniş rahmet
47. Ya Hakim (78) - Hikmet sahibi
48. Ya Vedud (20) - Sevgi, muhabbet
49. Ya Mecid (57) - Şan, şeref
50. Ya Bais (573) - Diriltici, umut
51. Ya Şehid (319) - Şahit
52. Ya Hakk (108) - Hakikat
53. Ya Vekil (66) - Tevekkül
54. Ya Kaviyy (116) - Güç, kuvvet
55. Ya Metin (500) - Sağlamlık
56. Ya Veliyy (46) - Dost, yardımcı
57. Ya Hamid (62) - Hamd edilen
58. Ya Muhsi (148) - Sayan
59. Ya Mübdi (56) - İlk yaratan
60. Ya Muid (124) - Tekrar yaratan
61. Ya Muhyi (68) - Hayat veren
62. Ya Mümit (490) - Öldüren
63. Ya Hayy (18) - Diri, canlılık
64. Ya Kayyum (156) - Ayakta tutan
65. Ya Vacid (14) - Bulan
66. Ya Macid (48) - Şerefli
67. Ya Vahid (19) - Bir olan
68. Ya Samed (134) - Muhtaç olmayan
69. Ya Kadir (305) - Güç yetiren
70. Ya Muktedir (744) - Kudret sahibi
71. Ya Mukaddim (184) - Öne alan
72. Ya Muahhir (846) - Erteleyen
73. Ya Evvel (37) - İlk
74. Ya Ahir (801) - Son
75. Ya Zahir (1106) - Açık, görünen
76. Ya Batın (62) - Gizli
77. Ya Vali (47) - İdare eden
78. Ya Müteali (551) - Yüce
79. Ya Berr (202) - İyilik sahibi
80. Ya Tevvab (409) - Tövbe kabul eden
81. Ya Müntekim (630) - İntikam alan
82. Ya Afüv (156) - Affeden
83. Ya Rauf (287) - Şefkatli
84. Ya Malikül Mülk (212) - Mülk sahibi
85. Ya Zül Celali vel İkram (1100) - Celal ve ikram sahibi
86. Ya Muksit (209) - Adaletli
87. Ya Cami (114) - Toplayan, birleştiren
88. Ya Gani (1060) - Zengin
89. Ya Muğni (1100) - Zengin kılan
90. Ya Mani (161) - Engelleyen
91. Ya Darr (1001) - Zarar veren (hikmetle)
92. Ya Nafi (201) - Fayda veren
93. Ya Nur (256) - Aydınlatan
94. Ya Hadi (20) - Hidayet eden
95. Ya Bedi (86) - Emsalsiz yaratan
96. Ya Baki (113) - Ebedi
97. Ya Varis (707) - Miras alan
98. Ya Reşid (514) - Doğru yola ileten
99. Ya Sabur (298) - Sabırlı

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

2. DOĞUM VERİLERİNİ DOĞAL KULLAN: Doğum tarihi ve saatini zikir sayılarına veya anlamlarına yedirirken "Şu saatte doğduğunuz için..." gibi ifadeleri sürekli tekrarlamaktan kaçın. Bu bilgileri arka planda bir rehber olarak kullan, metinde doğal ve dengeli bir şekilde yer ver.

3. DOĞUM SAATİ: Eğer verilmişse, saat değerini de dahil et.
   Örnek: 14:30 → 14 veya 1+4+3+0=8 sayısı anlamlı olabilir.

4. BENZERSİZ KOMBİNASYON: Her kişi için FARKLI Esma-Dua-Sure kombinasyonu oluştur.
   Aynı niyete sahip iki farklı kişi için FARKLI reçeteler üret.
   İsim ebcedi + doğum tarihi + niyet = benzersiz formül.

5. KİŞİYE ÖZEL AÇIKLAMA - ÇOK ÖNEMLİ: 
   "meaning" alanı MUTLAKA kullanıcının İLK İSMİYLE sıcak bir hitapla başlamalıdır. 
   İsimden sadece ilk kelimeyi al (örn: "Ahmet Yılmaz" → "Ahmet").
   Hitap samimi ve cana yakın olmalı: "Sevgili Ahmet," veya "Ahmet kardeşim,"
   Örnek: "Sevgili Ahmet, bu zikir sayısı sana özeldir..."

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
6. ANLAM: Her adımın NEDEN bu KİŞİYE ÖZEL seçildiğini , ona ismiyle hitap ederek açıkla.

SADECE aşağıdaki JSON formatında cevap ver:
{
    "prescription_title": "Bu zikir akışı için şiirsel bir başlık",
    "numerology_analysis": "İsmin ebced değeri ve niyetin manevi analizi, neden bu sayıların seçildiği. 2-3 cümle",
    "personal_warning": "Bugün dikkat edilmesi gereken manevi husus",
    "esma": "Önerilen Ana Esma-ül Hüsna",
    "daily_dua": "Niyetine uygun kısa bir giriş duası",
    "closing_dua": "Zikir bittiğinde kulun Rabbine arz edeceği, 'Ben' diliyle yazılmış (Yarabbi, ben aciz kulun...), edebi, şiirsel, derin anlamlı, günahlardan arınma ve tam teslimiyet içeren, kalbe dokunan bir yakarış duası. (En az 3-4 cümle).",
    "recommended_action": "Bu kısım ÇOK ÖNEMLİ: Zikir sonrası yapılması önerilen, kişinin niyetine (${intention}) ve şu anki vakte (${timeOfDay}) TAM UYUMLU, somut ve uygulanabilir bir amel. ASLA 'sabah namazı kıl' gibi zaten yapılmış veya genel şeyler söyleme. Eğer niyet 'sabah namazı sonrası' ise, günün geri kalanı için bir aksiyon ver. Eğer niyet 'uyku öncesi' ise, rüyalar veya rahatlama ile ilgili bir amel ver. (EN AZ 5-6 CÜMLE). Örnek: 'Zikrinden sonra bir sadaka ver', 'Şu kişiyi ara ve helallik iste'. BU KİŞİYE ÖZEL OLSUN.",
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
            userPrompt = `🎲 Yaratıcılık Tohumu: ${creativitySeed}
📅 Bugünün Tarihi: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
⏰ Şu anki vakit: ${timeOfDay}
🔢 Bugünkü oturum numarası: ${sessionCountToday}

İsim: ${name}
Doğum Tarihi: ${birth_date || 'Bilinmiyor'}
Doğum Saati: ${birth_time || 'Bilinmiyor'}
Niyet: ${intention} (DİKKAT: Önerilen Amel bu niyetle DOĞRUDAN İLGİLİ OLMALI. Alakasız genel tavsiye verme.)
Dil: ${languageName}

⚠️ ÇOK ÖNEMLİ - KİŞİYE ÖZEL HESAPLAMA YAP:
1. "${name}" isminin EBCED DEĞERİNİ HESAPLA ve zikir sayılarına yansıt
2. Doğum tarihinden (${birth_date || 'yok'}) sayısal değerler çıkar
3. Bu kişiye ÖZELleştirilmiş BENZERSİZ bir reçete oluştur
4. "meaning" alanlarında neden bu zikrin ${name} için özel seçildiğini açıkla
5. Başka hiç kimse için aynı kombinasyonu verme - bu ${name}'e özel olmalı
6. Bu ${sessionCountToday}. seans — önceki seanslardan TAMAMEN FARKLI bir akış oluştur
7. ${timeOfDay} vaktine uygun zikirler tercih et`;

        } else {
            // UNIVERSAL DETAILED PROMPT (En, Ar, Id, etc.)
            systemPrompt = `You are an AI spiritual guide with deep knowledge of Islamic Sciences (Tasawwuf, Abjad, Asmaul Husna, Sahih Hadith).

IMPORTANT: ALL RESPONSES MUST BE IN **${languageName}**. DO NOT USE ANY OTHER LANGUAGE!

🎲 CREATIVITY PARAMETERS:
- Seed: ${creativitySeed}
- Today's session: #${sessionCountToday}
- Estimated Hijri day: ${hijriEstimate}
- Time of day: ${timeOfDayEn}

⏰ TIME-AWARE CONTENT:
- Current time: ${timeOfDayEn}. Tailor prescription to this time:
  • Morning (Fajr-Zuhr): Energizing, motivational dhikrs
  • Afternoon (Zuhr-Asr): Focus and productivity dhikrs
  • Evening (Maghrib-Isha): Reflection, gratitude, self-accountability dhikrs
  • Night (Tahajjud): Deep spiritual dhikrs, heart purification

🔀 VARIETY RULES (MANDATORY):
- Do NOT always start with Istighfar. Sometimes start with Salawat, a Quran surah, or directly with an Esma.
- Each session MUST include at least one RARE and LESSER-KNOWN dua from sahih sources.
- Even with the same intention, create a COMPLETELY DIFFERENT flow structure each time.
- Include at least one Esma OUTSIDE the popular top-10 Names.
- Session #${sessionCountToday} → This user is requesting for the ${sessionCountToday} time today. Give COMPLETELY DIFFERENT prescription from previous ones.

═══════════════════════════════════════════════════════════════
📿 ALL 99 NAMES OF ALLAH (COMPLETE REFERENCE)
═══════════════════════════════════════════════════════════════
You have FULL knowledge of all 99 Names. Select the most suitable for the intention.
1. Ya Allah 2. Ya Rahman (298) 3. Ya Rahim (258) 4. Ya Malik (90) 5. Ya Quddus (170)
6. Ya Salam (131) 7. Ya Mu'min (137) 8. Ya Muhaymin (145) 9. Ya Aziz (94) 10. Ya Jabbar (206)
11. Ya Mutakabbir (662) 12. Ya Khaliq (731) 13. Ya Bari (213) 14. Ya Musawwir (336)
15. Ya Ghaffar (1281) 16. Ya Qahhar (306) 17. Ya Wahhab (14) 18. Ya Razzaq (308)
19. Ya Fattah (489) 20. Ya Alim (150) 21. Ya Qabid (903) 22. Ya Basit (72)
23. Ya Khafid (1481) 24. Ya Rafi (351) 25. Ya Mu'izz (117) 26. Ya Mudhill (770)
27. Ya Sami (180) 28. Ya Basir (302) 29. Ya Hakam (68) 30. Ya Adl (104)
31. Ya Latif (129) 32. Ya Khabir (812) 33. Ya Halim (88) 34. Ya Azim (1020)
35. Ya Ghafur (1286) 36. Ya Shakur (526) 37. Ya Aliyy (110) 38. Ya Kabir (232)
39. Ya Hafiz (998) 40. Ya Muqit (550) 41. Ya Hasib (80) 42. Ya Jalil (73)
43. Ya Karim (270) 44. Ya Raqib (312) 45. Ya Mujib (55) 46. Ya Wasi (137)
47. Ya Hakim (78) 48. Ya Wadud (20) 49. Ya Majid (57) 50. Ya Ba'ith (573)
51. Ya Shahid (319) 52. Ya Haqq (108) 53. Ya Wakil (66) 54. Ya Qawiyy (116)
55. Ya Matin (500) 56. Ya Waliyy (46) 57. Ya Hamid (62) 58. Ya Muhsi (148)
59. Ya Mubdi (56) 60. Ya Mu'id (124) 61. Ya Muhyi (68) 62. Ya Mumit (490)
63. Ya Hayy (18) 64. Ya Qayyum (156) 65. Ya Wajid (14) 66. Ya Majid (48)
67. Ya Wahid (19) 68. Ya Samad (134) 69. Ya Qadir (305) 70. Ya Muqtadir (744)
71. Ya Muqaddim (184) 72. Ya Mu'akhkhir (846) 73. Ya Awwal (37) 74. Ya Akhir (801)
75. Ya Zahir (1106) 76. Ya Batin (62) 77. Ya Wali (47) 78. Ya Muta'ali (551)
79. Ya Barr (202) 80. Ya Tawwab (409) 81. Ya Muntaqim (630) 82. Ya Afuww (156)
83. Ya Ra'uf (287) 84. Ya Malikul Mulk (212) 85. Ya Dhul Jalali wal Ikram (1100)
86. Ya Muqsit (209) 87. Ya Jami (114) 88. Ya Ghani (1060) 89. Ya Mughni (1100)
90. Ya Mani (161) 91. Ya Darr (1001) 92. Ya Nafi (201) 93. Ya Nur (256)
94. Ya Hadi (20) 95. Ya Badi (86) 96. Ya Baqi (113) 97. Ya Warith (707)
98. Ya Rashid (514) 99. Ya Sabur (298)

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

2. USE BIRTH DATA NATURALLY: When integrating birth date or time into the dhikr counts or meanings, avoid repeating phrases like "Because you were born at..." in every step. Use these as subtle background influences.

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
    "closing_dua": "A deeply poetic and touching Closing Prayer written in the FIRST PERSON ('Oh my Lord, I am Your humble servant...'). It should express total surrender, gratitude, and seeking purification. (At least 3-4 sentences).",
    "recommended_action": "CRITICAL: A concrete, actionable deed to perform after dhikr that MATCHES the user's intention ('${intention}') and time ('${timeOfDayEn}'). Do NOT give generic advice like 'pray fajr' if they already did. If intention is 'after fajr', give a deed for the day. If 'before sleep', give a deed for the night. (5-6 SENTENCES MINIMUM). Make it UNIQUE to ${name}.",
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
            userPrompt = `🎲 Creativity Seed: ${creativitySeed}
📅 Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
⏰ Current time of day: ${timeOfDayEn}
🔢 Session number today: ${sessionCountToday}

Name: ${name}
Birth Date: ${birth_date || 'Unknown'}
Birth Time: ${birth_time || 'Unknown'}
Intention: ${intention} (NOTE: Recommended Action MUST be directly related to this intention. Do not give unrelated generic advice.)
Language: ${languageName}

⚠️ VERY IMPORTANT - PERSONALIZED CALCULATION REQUIRED:
1. CALCULATE the ABJAD VALUE of "${name}" and use it in dhikr counts
2. Extract numerical values from birth date (${birth_date || 'not provided'})
3. Create a UNIQUE prescription tailored SPECIFICALLY for this person
4. In "meaning" fields, explain WHY each dhikr is special for ${name}
5. Do NOT give the same combination to anyone else - this must be UNIQUE to ${name}
6. This is session #${sessionCountToday} — create a COMPLETELY DIFFERENT flow from any previous sessions
7. Prefer dhikrs appropriate for ${timeOfDayEn} time`;
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
                temperature: 1.0, // Maximum variety and creativity
                max_tokens: 2500, // Richer, more detailed content
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
