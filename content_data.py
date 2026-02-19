import datetime

LANGUAGES = ['en', 'tr', 'ar', 'fr', 'id']

# --- CITY DATA FOR RAMADAN HUB ---
CITIES_CONFIG = {
    "Turkey": ["Adana", "Adiyaman", "Afyonkarahisar", "Agri", "Amasya", "Ankara", "Antalya", "Artvin", "Aydin", "Balikesir", "Bilecik", "Bingol", "Bitlis", "Bolu", "Burdur", "Bursa", "Canakkale", "Cankiri", "Corum", "Denizli", "Diyarbakir", "Edirne", "Elazig", "Erzincan", "Erzurum", "Eskisehir", "Gaziantep", "Giresun", "Gumushane", "Hakkari", "Hatay", "Isparta", "Mersin", "Istanbul", "Izmir", "Kars", "Kastamonu", "Kayseri", "Kirklareli", "Kirsehir", "Kocaeli", "Konya", "Kutahya", "Malatya", "Manisa", "Kahramanmaras", "Mardin", "Mugla", "Mus", "Nevsehir", "Nigde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdag", "Tokat", "Trabzon", "Tunceli", "Sanliurfa", "Usak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kirikkale", "Batman", "Sirnak", "Bartin", "Ardahan", "Igdir", "Yalova", "Karabuk", "Kilis", "Osmaniye", "Duzce"],
    "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Medan", "Bekasi", "Semarang", "Tangerang", "Depok", "Palembang", "Makassar", "Batam", "Pekanbaru", "Bogor", "Bandar Lampung", "Padang", "Denpasar", "Malang", "Samarinda", "Tasikmalaya", "Banjarmasin", "Balikpapan", "Serang", "Jambi", "Pontianak", "Cimahi", "Surakarta", "Manado", "Kupang", "Jayapura"],
    "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraidah", "Khamis Mushait", "Abha", "Al-Khobar", "Najran", "Ha'il", "Jizan", "Al-Jubail", "Al-Hofuf", "Yanbu"],
    "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "Tanta", "Asyut"],
    "Qatar": ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
    "Kuwait": ["Kuwait City", "Salmiya", "Hawally", "Farwaniya"],
    "Gulf": [("Dubai", "AE"), ("Abu Dhabi", "AE"), ("Muscat", "OM"), ("Manama", "BH"), ("Sharjah", "AE")],
    "Europe & Others": [("London", "UK"), ("Paris", "FR"), ("Marseille", "FR"), ("Lyon", "FR"), ("Brussels", "BE"), ("Geneva", "CH"), ("Berlin", "DE"), ("New York", "US"), ("Toronto", "CA"), ("Sydney", "AU")],
    "North Africa": [("Casablanca", "MA"), ("Marrakech", "MA"), ("Algiers", "DZ"), ("Oran", "DZ"), ("Tunis", "TN"), ("Tripoli", "LY")]
}

COUNTRY_CODES = {
    "Turkey": "TR", "Indonesia": "ID", "Saudi Arabia": "SA", "Egypt": "EG",
    "Qatar": "QA", "Kuwait": "KW"
}

TRANSLATIONS = {
    "en": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "All", "label_worship": "Worship", "label_dream": "Dreams", "label_lifestyle": "Lifestyle", "label_dhikr": "Dhikr & Dua", "label_tech": "Tech", 
        "page_title": "Islamvy Blog", "page_desc": "Islamic Insights", "hero_title": "Islamic Insights & Wisdom", "hero_desc": "Get answers to your spiritual questions with scholarly references.", 
        "read_more": "Read More", "category_dream": "Dream Interpretation", "category_dhikr": "Dhikr & Dua", "category_lifestyle": "Islamic Lifestyle", "category_tech": "Islamic Tech", "category_worship": "Worship Guide",
        "app_home": "App Home", "ramadan_2026": "Ramadan 2026", "scholar_badge": "Scholar Reviewed Content", "tldr_title": "TL;DR", "refs_title": "References & Citations", "ai_disclosure_label": "AI Disclosure",
        "ai_disclosure_text": "This content was generated and organized by AI, then reviewed for accuracy against established Islamic texts (Quran, Sahih Bukhari, Sahih Muslim, and classical scholars like Ibn Sirin).",
        "faq_title": "Frequently Asked Questions", "copyright": "© 2026 Islamvy. All rights reserved.", "ramadan_hero_subtitle": "Countdown to Mercy and Blessings", "select_city": "Select your city",
        "first_day_approx": "First Day of Ramadan (approx):", "ramadan_essentials": "Ramadan Essentials", "spiritual_prep_title": "Spiritual Preparation", "spiritual_prep_desc": "How to prepare your heart for the month of the Quran.",
        "zakat_guide_title": "Zakat Guide", "zakat_guide_desc": "Understand the purification of wealth during this blessed month.", "times_calc_info": "Times are calculated using the Muslim World League method. Please consult your local mosque for exact timings.",
        "label_sahur": "Sahur (Fajr)", "label_iftar": "Iftar (Maghrib)", "label_dhuhr": "Dhuhr", "label_asr": "Asr", "label_isha": "Isha",
        "select_country": "Select your country", "country_tr": "Turkey", "country_id": "Indonesia", "country_sa": "Saudi Arabia", "country_eg": "Egypt", "country_qa": "Qatar", "country_kw": "Kuwait", "country_gulf": "Gulf", "country_eu": "Europe & Others", "country_na": "North Africa"
    },
    "tr": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "Tümü", "label_worship": "İbadet", "label_dream": "Rüya", "label_lifestyle": "Yaşam", "label_dhikr": "Zikir & Dua", "label_tech": "Teknoloji", 
        "page_title": "Islamvy Blog", "page_desc": "İslami İçgörüler", "hero_title": "İslami İçgörüler & Hikmet", "hero_desc": "Manevi sorularınıza alim referanslarıyla cevap bulun.", 
        "read_more": "Devamını Oku", "category_dream": "Rüya Tabirleri", "category_dhikr": "Zikir ve Dua", "category_lifestyle": "İslami Yaşam", "category_tech": "İslami Teknoloji", "category_worship": "İbadet Rehberi",
        "app_home": "Uygulama Ana Sayfa", "ramadan_2026": "Ramazan 2026", "scholar_badge": "Alim Onaylı İçerik", "tldr_title": "Özet (Önemli Notlar)", "refs_title": "Referanslar ve Kaynakça", "ai_disclosure_label": "Yapay Zeka Bildirimi",
        "ai_disclosure_text": "Bu içerik yapay zeka tarafından oluşturulmuş ve düzenlenmiş, ardından Kur'an, Sahih-i Buhari, Sahih-i Müslim ve İbn Şirin gibi klasik alimlerin eserlerine dayalı olarak doğruluk açısından incelenmiştir.",
        "faq_title": "Sıkça Sorulan Sorular", "copyright": "© 2026 Islamvy. Tüm hakları saklıdır.", "ramadan_hero_subtitle": "Rahmet ve Bereket Ayına Geri Sayım", "select_city": "Şehrinizi seçin",
        "first_day_approx": "Ramazan'ın İlk Günü (tahmini):", "ramadan_essentials": "Ramazan Hazırlıkları", "spiritual_prep_title": "Manevi Hazırlık", "spiritual_prep_desc": "Kalbinizi Kur'an ayına nasıl hazırlayabilirsiniz?",
        "zakat_guide_title": "Zekat Rehberi", "zakat_guide_desc": "Bu mübarek ayda malın temizlenmesini kavrayın.", "times_calc_info": "Vakitler Dünya Müslümanlar Birliği yöntemiyle hesaplanmaktadır. Kesin vakitler için yerel camiinize danışın.",
        "label_sahur": "Sahur (İmsak)", "label_iftar": "İftar (Akşam)", "label_dhuhr": "Öğle", "label_asr": "İkindi", "label_isha": "Yatsı",
        "select_country": "Ülki seçin", "country_tr": "Türkiye", "country_id": "Endonezya", "country_sa": "Suudi Arabistan", "country_eg": "Mısır", "country_qa": "Katar", "country_kw": "Kuveyt", "country_gulf": "Körfez", "country_eu": "Avrupa ve Diğerleri", "country_na": "Kuzey Afrika"
    },
    "ar": {
        "dir": "rtl", "blog_suffix": "مدونة", "label_all": "الكل", "label_worship": "العبادة", "label_dream": "الأحلام", "label_lifestyle": "نمط الحياة", "label_dhikr": "الذكر والدعاء", "label_tech": "التكنولوجيا", 
        "page_title": "مدونة Islamvy", "page_desc": "رؤى إسلامية", "hero_title": "رؤى وبصائر إسلامية", "hero_desc": "احصل على إجابات لأسئلتك الروحية مع مراجع علمية.", 
        "read_more": "اقرأ المزيد", "category_dream": "تفسير الأحلام", "category_dhikr": "الذكر والدعاء", "category_lifestyle": "نمط الحياة الإسلامي", "category_tech": "تكنولوجيا إسلامية", "category_worship": "دليل العبادة",
        "app_home": "الرئيسية", "ramadan_2026": "رمضان 2026", "scholar_badge": "محتوى راجعه العلماء", "tldr_title": "ملخص سريع", "refs_title": "المراجع والمصادر", "ai_disclosure_label": "إفصاح الذكاء الاصطناعي",
        "ai_disclosure_text": "تم إنشاء هذا المحتوى وتنظيمه بواسطة الذكاء الاصطناعي، ثم مراجعته للتأكد من دقته مقابل النصوص الإسلامية المعتمدة (القرآن، صحيح البخاري، صحيح مسلم، وعلماء التراث مثل ابن سيرين).",
        "faq_title": "الأسئلة الشائعة", "copyright": "© 2026 Islamvy. جميع الحقوق محفوظة.", "ramadan_hero_subtitle": "العد التنازلي لشهور الرحمة والبركات", "select_city": "اختر مدينتك",
        "first_day_approx": "أول أيام رمضان (تقريباً):", "ramadan_essentials": "أساسيات رمضان", "spiritual_prep_title": "الاستعداد الروحي", "spiritual_prep_desc": "كيف تهيئ قلبك لشهر القرآن.",
        "zakat_guide_title": "دليل الزكاة", "zakat_guide_desc": "افهم تزكية المال خلال هذا الشهر الفضيل.", "times_calc_info": "يتم حساب الأوقات باستخدام طريقة رابطة العالم الإسلامي. يرجى استشارة المسجد المحلي لمعرفة الأوقات الدقيقة.",
        "label_sahur": "السحور (الفجر)", "label_iftar": "الإفطار (المغرب)", "label_dhuhr": "الظهر", "label_asr": "العصر", "label_isha": "العشاء",
        "select_country": "اختر بلدك", "country_tr": "تركيا", "country_id": "إندونيسيا", "country_sa": "المملكة العربية السعودية", "country_eg": "مصر", "country_qa": "قطر", "country_kw": "الكويت", "country_gulf": "الخليج", "country_eu": "أوروبا وأخرى", "country_na": "شمال أفريقيا"
    },
    "fr": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "Tous", "label_worship": "Culte", "label_dream": "Rêves", "label_lifestyle": "Vie", "label_dhikr": "Dhikr", "label_tech": "Tech", 
        "page_title": "Blog Islamvy", "page_desc": "Perspectives", "hero_title": "Sagesse Islamique", "hero_desc": "Obtenez des réponses basées sur des sources authentiques.", 
        "read_more": "Lire la suite", "category_dream": "Interprétation des rêves", "category_dhikr": "Dhikr & Dua", "category_lifestyle": "Mode de vie", "category_tech": "Technologie Islamique", "category_worship": "Guide de Culte",
        "app_home": "Accueil App", "ramadan_2026": "Ramadan 2026", "scholar_badge": "Contenu révisé par des savants", "tldr_title": "En résumé", "refs_title": "Références & Citations", "ai_disclosure_label": "Divulgation IA",
        "ai_disclosure_text": "Ce contenu a été généré et organisé par l'IA, puis vérifié par rapport aux textes islamiques établis (Coran, Sahih Al-Bukhari, Sahih Muslim et savants classiques comme Ibn Sirin).",
        "faq_title": "Questions Fréquemment Posées", "copyright": "© 2026 Islamvy. Tous droits réservés.", "ramadan_hero_subtitle": "Compte à rebours vers la miséricorde et les bénédictions", "select_city": "Sélectionnez votre ville",
        "first_day_approx": "Premier jour du Ramadan (environ) :", "ramadan_essentials": "Essentiels du Ramadan", "spiritual_prep_title": "Préparation Spirituelle", "spiritual_prep_desc": "Comment préparer son cœur pour le mois du Coran.",
        "zakat_guide_title": "Guide de la Zakat", "zakat_guide_desc": "Comprendre la purification des richesses pendant ce mois béni.", "times_calc_info": "Les horaires sont calculés selon la méthode de la Ligue Islamique Mondiale. Consultez votre mosquée locale pour les horaires exacts.",
        "label_sahur": "Sahur (Fajr)", "label_iftar": "Iftar (Maghrib)", "label_dhuhr": "Dhuhr", "label_asr": "Asr", "label_isha": "Isha",
        "select_country": "Choisissez votre pays", "country_tr": "Turquie", "country_id": "Indonésie", "country_sa": "Arabie Saoudite", "country_eg": "Égypte", "country_qa": "Qatar", "country_kw": "Koweït", "country_gulf": "Golfe", "country_eu": "Europe et autres", "country_na": "Afrique du Nord"
    },
    "id": {
        "dir": "ltr", "blog_suffix": "Blog", "label_all": "Semua", "label_worship": "Ibadah", "label_dream": "Mimpi", "label_lifestyle": "Gaya Hidup", "label_dhikr": "Dzikir", "label_tech": "Teknologi", 
        "page_title": "Blog Islamvy", "page_desc": "Wawasan Islam", "hero_title": "Wawasan & Hikmah Islam", "hero_desc": "Dapatkan jawaban spiritual berdasarkarn referensi shahih.", 
        "read_more": "Baca Selengkapnya", "category_dream": "Tafsir Mimpi", "category_dhikr": "Dzikir & Doa", "category_lifestyle": "Gaya Hidup", "category_tech": "Technologi Islam", "category_worship": "Panduan Ibadah",
        "app_home": "Beranda Aplikasi", "ramadan_2026": "Ramadan 2026", "scholar_badge": "Konten Tinjauan Ulama", "tldr_title": "Ringkasan", "refs_title": "Referensi & Kutipan", "ai_disclosure_label": "Pengungkapan AI",
        "ai_disclosure_text": "Konten ini dibuat dan diatur oleh AI, kemudian ditinjau keakuratannya berdasarkan teks-teks Islam (Al-Quran, Sahih Bukhari, Sahih Muslim, dan ulama klasik seperti Ibnu Sirin).",
        "faq_title": "Pertanyaan yang Sering Diajukan", "copyright": "© 2026 Islamvy. Hak cipta dilindungi undang-undang.", "ramadan_hero_subtitle": "Hitung Mundur Menuju Rahmat dan Keberkahan", "select_city": "Pilih kota Anda",
        "first_day_approx": "Hari Pertama Ramadhan (perkiraan):", "ramadan_essentials": "Esensi Ramadhan", "spiritual_prep_title": "Persiapan Spiritual", "spiritual_prep_desc": "Cara mempersiapkan hati menyambut bulan Al-Quran.",
        "zakat_guide_title": "Panduan Zakat", "zakat_guide_desc": "Pahami penyucian harta selama bulan penuh berkah ini.", "times_calc_info": "Waktu dihitung menggunakan metode Liga Muslim Dunia. Silakan konsultasikan dengan masjid setempat untuk waktu yang tepat.",
        "label_sahur": "Sahur (Fajr)", "label_iftar": "Iftar (Maghrib)", "label_dhuhr": "Dhuhur", "label_asr": "Ashar", "label_isha": "Isya",
        "select_country": "Pilih negara Anda", "country_tr": "Turki", "country_id": "Indonesia", "country_sa": "Arab Saudi", "country_eg": "Mesir", "country_qa": "Qatar", "country_kw": "Kuwait", "country_gulf": "Teluk", "country_eu": "Eropa & Lainnya", "country_na": "Afrika Utara"
    }
}

topics = [
    # Worship (20)
    ("steps-of-salah", "category_worship"), ("how-to-do-wudu", "category_worship"), ("ghusl-guide", "category_worship"), 
    ("ramadan-patience", "category_worship"), ("zakat-calculator-meaning", "category_worship"), ("tahajjud-prayer", "category_worship"),
    ("istikhara-guide", "category_worship"), ("jummah-friday-prayer", "category_worship"), ("hajj-basics", "category_worship"), 
    ("power-of-dua", "category_dhikr"), ("morning-dhikr", "category_dhikr"), ("evening-dhikr", "category_dhikr"),
    ("ayatul-kursi-benefits", "category_dhikr"), ("istighfar-benefits", "category_dhikr"), ("salawat-importance", "category_dhikr"),
    ("tawheed-meaning", "category_dhikr"), ("hasbunallah-trust", "category_dhikr"), ("sleep-adhkar", "category_dhikr"),
    ("dhikr-for-peace", "category_dhikr"), ("quran-recitation-tips", "category_worship"),
    # Lifestyle (15)
    ("sabr-patience", "category_lifestyle"), ("parents-respect", "category_lifestyle"), ("finance-halal", "category_lifestyle"),
    ("modesty-hijab", "category_lifestyle"), ("animal-rights", "category_lifestyle"), ("anxiety-islamic-tips", "category_lifestyle"),
    ("halal-food", "category_lifestyle"), ("marriage-rights", "category_lifestyle"), ("seeking-knowledge", "category_lifestyle"),
    ("time-management", "category_lifestyle"), ("social-media-ethics", "category_lifestyle"), ("best-apps-2026", "category_tech"),
    ("ai-future-islam", "category_tech"), ("smart-rug-tech", "category_tech"), ("qibla-tools", "category_tech"),
    # Dreams (20)
    ("dream-cat", "category_dream"), ("dream-snake", "category_dream"), ("dream-gold", "category_dream"),
    ("dream-water", "category_dream"), ("dream-flying", "category_dream"), ("dream-baby", "category_dream"),
    ("dream-death", "category_dream"), ("dream-rain", "category_dream"), ("dream-shoes", "category_dream"),
    ("dream-crying", "category_dream"), ("dream-car", "category_dream"), ("dream-money", "category_dream"),
    ("dream-sea", "category_dream"), ("dream-house", "category_dream"), ("dream-fish", "category_dream"),
    ("dream-teeth", "category_dream"), ("dream-fire", "category_dream"), ("dream-marriage", "category_dream"),
    ("dream-sun", "category_dream"), ("dream-prophet", "category_dream")
]

def format_title(slug):
    return slug.replace("-", " ").title().replace("Of", "of").replace("Ai", "AI")

# Title Translations for better localization
TOPIC_TRANSLATIONS = {
    "steps-of-salah": {"tr": "Namazın Kılınışı", "ar": "خطوات الصلاة", "fr": "Étapes de la prière", "id": "Tata Cara Shalat"},
    "how-to-do-wudu": {"tr": "Abdest Nasıl Alınır?", "ar": "كيفية الوضوء", "fr": "Comment faire le Wudu", "id": "Cara Berwudhu"},
    "ghusl-guide": {"tr": "Boy Abdesti (Gusül) Rehberi", "ar": "دليل الغسل", "fr": "Guide du Ghusl", "id": "Panduan Mandi Wajib"},
    "tahajjud-prayer": {"tr": "Teheccüd Namazı", "ar": "صلاة التهجد", "fr": "Prière de Tahajjud", "id": "Shalat Tahajjud"},
    "istikhara-guide": {"tr": "İstihare Namazı Rehberi", "ar": "دليل صلاة الاستخارة", "fr": "Guide de l'Istikhara", "id": "Panduan Shalat Istikharah"},
    "power-of-dua": {"tr": "Duanın Gücü", "ar": "قوة الدعاء", "fr": "Le pouvoir de la Doua", "id": "Kekuatan Doa"},
    "morning-dhikr": {"tr": "Sabah Zikirleri", "ar": "أذكار الصباح", "fr": "Dhikr du matin", "id": "Dzikir Pagi"},
    "evening-dhikr": {"tr": "Akşam Zikirleri", "ar": "أذكار المساء", "fr": "Dhikr du soir", "id": "Dzikir Petang"},
    "ayatul-kursi-benefits": {"tr": "Ayetel Kürsi Faziletleri", "ar": "فضائل آية الكرسي", "fr": "Bienfaits d'Ayatul Kursi", "id": "Manfaat Ayat Kursi"},
    "dream-cat": {"tr": "Rüyada Kedi Görmek", "ar": "حلم القطة", "fr": "Rêver d'un chat", "id": "Mimpi Kucing"},
    "dream-snake": {"tr": "Rüyada Yılan Görmek", "ar": "حلم الثعبان", "fr": "Rêver d'un serpent", "id": "Mimpi Ular"},
    "dream-baby": {"tr": "Rüyada Bebek Görmek", "ar": "حلم الطفل", "fr": "Rêver d'un bébé", "id": "Mimpi Bayi"},
    "dream-water": {"tr": "Rüyada Su Görmek", "ar": "حلم الماء", "fr": "Rêver d'eau", "id": "Mimpi Air"},
    "dream-gold": {"tr": "Rüyada Altın Görmek", "ar": "حلم الذهب", "fr": "Rêver d'or", "id": "Mimpi Emas"},
    "dream-death": {"tr": "Rüyada Ölüm Görmek", "ar": "حلم الموت", "fr": "Rêver de la mort", "id": "Mimpi Kematian"},
    "dream-shoes": {"tr": "Rüyada Ayakkabı Görmek", "ar": "حلم الحذاء", "fr": "Rêver de chaussures", "id": "Mimpi Sepatu"},
    "dream-crying": {"tr": "Rüyada Ağlamak", "ar": "حلم البكاء", "fr": "Rêver de pleurer", "id": "Mimpi Menangis"},
    "dream-car": {"tr": "Rüyada Araba Görmek", "ar": "حلم السيارة", "fr": "Rêver d'une voiture", "id": "Mimpi Mobil"},
    "dream-money": {"tr": "Rüyada Para Görmek", "ar": "حلم المال", "fr": "Rêver d'argent", "id": "Mimpi Uang"},
    "dream-sea": {"tr": "Rüyada Deniz Görmek", "ar": "حلم البحر", "fr": "Rêver de la mer", "id": "Mimpi Laut"},
    "dream-house": {"tr": "Rüyada Ev Görmek", "ar": "حلم البيت", "fr": "Rêver d'une maison", "id": "Mimpi Rumah"},
    "dream-fish": {"tr": "Rüyada Balık Görmek", "ar": "حلم السمك", "fr": "Rêver de poisson", "id": "Mimpi Ikan"},
    "dream-fire": {"tr": "Rüyada Ateş Görmek", "ar": "حلم النار", "fr": "Rêver de feu", "id": "Mimpi Api"},
    "dream-sun": {"tr": "Rüyada Güneş Görmek", "ar": "حلم الشمس", "fr": "Rêver du soleil", "id": "Mimpi Matahari"},
    "dream-prophet": {"tr": "Rüyada Peygamberimizi Görmek", "ar": "حلم رؤية النبي", "fr": "Rêver du Prophète", "id": "Mimpi Melihat Nabi"},
    "dream-flying": {"tr": "Rüyada Uçmak", "ar": "حلم الطيران", "fr": "Rêver de voler", "id": "Mimpi Terbang"},
    "dream-falling": {"tr": "Rüyada Düştüğünü Görmek", "ar": "حلم السقوط", "fr": "Rêver de tomber", "id": "Mimpi Jatuh"},
    "dream-marriage": {"tr": "Rüyada Evlenmek", "ar": "حلم الزواج", "fr": "Rêver de mariage", "id": "Mimpi Menikah"},
    "dream-prayer": {"tr": "Rüyada Namaz Kılmak", "ar": "حلم الصلاة", "fr": "Rêver de prier", "id": "Mimpi Sholat"},
    "dream-rain": {"tr": "Rüyada Yağmur Görmek", "ar": "حلم المطر", "fr": "Rêver de pluie", "id": "Mimpi Hujan"},
    "dream-teeth": {"tr": "Rüyada Diş Görmek", "ar": "حلم الأسنان", "fr": "Rêver de dents", "id": "Mimpi Gigi"},
    "ramadan-patience": {"tr": "Ramazan ve Sabır", "ar": "رمضان والصبر", "fr": "Le Ramadan et la patience", "id": "Ramadhan dan Kesabaran"},
    "zakat-calculator-meaning": {"tr": "Zekat Hesaplama ve Anlamı", "ar": "حساب الزكاة ومعناها", "fr": "Calcul de la Zakat et sa signification", "id": "Kalkulator Zakat dan Maknanya"},
    "sabr-patience": {"tr": "Sabrın Önemi", "ar": "أهمية الصبر", "fr": "L'importance du Sabr", "id": "Pentingnya Sabar"},
    "parents-respect": {"tr": "Anne Babaya Saygı", "ar": "بر الوالدين", "fr": "Le respect des parents", "id": "Berbakti kepada Orang Tua"},
    "finance-halal": {"tr": "Helal Finans", "ar": "التمويل الحلال", "fr": "Finance Halal", "id": "Keuangan Halal"},
    "modesty-hijab": {"tr": "Haya ve Tesettür", "ar": "الحياء والحجاب", "fr": "Pudeur et Hijab", "id": "Haya dan Hijab"},
    "animal-rights": {"tr": "Hayvan Hakları", "ar": "حقوق الحيوان", "fr": "Droits des animaux", "id": "Hak-hak Hewan"},
    "anxiety-islamic-tips": {"tr": "Kaygı İçin İslami Tavsiyeler", "ar": "نصائح إسلامية للقلق", "fr": "Conseils islamiques contre l'anxiété", "id": "Tips Islami Menghadapi Kecemasan"},
    "halal-food": {"tr": "Helal Gıda", "ar": "الطعام الحلال", "fr": "Nourriture Halal", "id": "Makanan Halal"},
    "marriage-rights": {"tr": "Evlilik Hakları", "ar": "حقوق الزواج", "fr": "Droits du mariage", "id": "Hak-hak Pernikahan"},
    "seeking-knowledge": {"tr": "İlim Talebi", "ar": "طلب العلم", "fr": "La recherche du savoir", "id": "Menuntut Ilmu"},
    "time-management": {"tr": "Zaman Yönetimi", "ar": "إدارة الوقت", "fr": "Gestion du temps", "id": "Manajemen Waktu"},
    "social-media-ethics": {"tr": "Sosyal Medya Ahlakı", "ar": "أخلاق وسائل التواصل", "fr": "Éthique des médias sociaux", "id": "Etika Media Sosial"},
    "best-apps-2026": {"tr": "En İyi İslami Uygulamalar 2026", "ar": "أفضل التطبيقات الإسلامية ٢٠٢٦", "fr": "Meilleures applis islamiques 2026", "id": "Aplikasi Islam Terbaik 2026"},
    "ai-future-islam": {"tr": "Yapay Zeka ve İslam'ın Geleceği", "ar": "الذكاء الاصطناعي ومستقبل الإسلام", "fr": "L'IA et l'avenir de l'Islam", "id": "AI dan Masa Depan Islam"},
    "smart-rug-tech": {"tr": "Akıllı Seccade Teknolojisi", "ar": "تقنية السجاد الذكي", "fr": "Technologie des tapis intelligents", "id": "Teknologi Sajadah Pintar"},
    "qibla-tools": {"tr": "Kıble Bulma Araçları", "ar": "أدوات القبلة", "fr": "Outils pour la Qibla", "id": "Alat Penentu Kiblat"},
    "morning-dhikr": {"tr": "Sabah Zikirleri", "ar": "أذكار الصباح", "fr": "Dhikr du matin", "id": "Dzikir Pagi"},
    "evening-dhikr": {"tr": "Akşam Zikirleri", "ar": "أذكار المساء", "fr": "Dhikr du soir", "id": "Dzikir Petang"},
    "istighfar-benefits": {"tr": "İstiğfarın Faydaları", "ar": "فوائد الاستغفار", "fr": "Les bienfaits de l'Istighfar", "id": "Manfaat Istighfar"},
    "salawat-importance": {"tr": "Salavatın Önemi", "ar": "أهمية الصلاة على النبي", "fr": "L'importance des Salawat", "id": "Pentingnya Shalawat"},
    "sleep-adhkar": {"tr": "Uyku Zikirleri", "ar": "أذكار النوم", "fr": "Adhkar du sommeil", "id": "Dzikir Sebelum Tidur"},
    "dhikr-for-peace": {"tr": "Huzur İçin Zikirlar", "ar": "ذكر للراحة النفسية", "fr": "Dhikr pour la paix", "id": "Dzikir untuk Ketenangan"},
    "ayatul-kursi-benefits": {"tr": "Ayetel Kürsi Faziletleri", "ar": "فضائل آية الكرسي", "fr": "Bienfaits d'Ayatul Kursi", "id": "Manfaat Ayat Kursi"},
    "istikhara-guide": {"tr": "İstihare Rehberi", "ar": "دليل الاستخارة", "fr": "Guide de l'Istikhara", "id": "Panduan Istikharah"},
    "quran-recitation-tips": {"tr": "Kuran Okuma İpuçları", "ar": "نصائح لتلاوة القرآن", "fr": "Conseils de récitation du Coran", "id": "Tips Tilawah Quran"},
    "hajj-basics": {"tr": "Haccın Temelleri", "ar": "أساسيات الحج", "fr": "Les bases du Hajj", "id": "Dasar-dasar Haji"},
    "jummah-friday-prayer": {"tr": "Cuma Namazı", "ar": "صلاة الجمعة", "fr": "Prière du Vendredi", "id": "Shalat Jumat"},
    "tawheed-meaning": {"tr": "Tevhidin Anlamı", "ar": "معنى التوحيد", "fr": "Le sens du Tawhid", "id": "Makna Tauhid"},
    "hasbunallah-trust": {"tr": "Hasbunallah ve Güven", "ar": "حسبنا الله والتوكل", "fr": "Hasbunallah et la confiance", "id": "Hasbunallah dan Tawakkal"},
    "power-of-dua": {"tr": "Duanın Gücü", "ar": "قوة الدعاء", "fr": "Le pouvoir de la Doua", "id": "Kekuatan Doa"}
}

# UI Translations for templates
UI_TRANSLATIONS = {
    "en": {
        "interpretation_label": "Ibn Sirin's Interpretation",
        "ramadan_start": "February 18, 2026",
        "rights_reserved": "All rights reserved.",
        "search_city": "Search city...",
        "language_name": "English"
    },
    "tr": {
        "interpretation_label": "İbn-i Şirin'in Tabiri",
        "ramadan_start": "18 Şubat 2026",
        "rights_reserved": "Tüm hakları saklıdır.",
        "search_city": "Şehir ara...",
        "language_name": "Türkçe"
    },
    "ar": {
        "interpretation_label": "تفسير ابن سيرين",
        "ramadan_start": "١٨ فبراير ٢٠٢٦",
        "rights_reserved": "جميع الحقوق محفوظة.",
        "search_city": "بحث عن مدينة...",
        "language_name": "العربية"
    },
    "fr": {
        "interpretation_label": "Interprétation d'Ibn Sirin",
        "ramadan_start": "18 février 2026",
        "rights_reserved": "Tous droits réservés.",
        "search_city": "Rechercher une ville...",
        "language_name": "Français"
    },
    "id": {
        "interpretation_label": "Tafsir Ibnu Sirin",
        "ramadan_start": "18 Februari 2026",
        "rights_reserved": "Hak cipta dilindungi.",
        "search_city": "Cari kota...",
        "language_name": "Bahasa Indonesia"
    }
}

# Accurate Islamic content based on research
# Worship Guides
worship_data = {
    "steps-of-salah": {
        "en": {
            "summary": "A comprehensive guide to performing Salah according to the Sunnah.",
            "tldr": "Salah is the second pillar of Islam and follows a specific prophetic method from Takbir to Taslim.",
            "body": """
                <p>Salah begins with <strong>Takbiratul Ihram</strong>, raising your hands to your ears and saying 'Allahu Akbar'. This marks the start of your sacred connection with Allah. Following this, you recite the opening supplication (Sana) and Surah Al-Fatihah.</p>
                <p>Each Rakat (unit) includes <strong>Ruku</strong> (bowing) where you say 'Subhana Rabbiy-al-Adheem' thrice, <strong>Sujood</strong> (prostration) where you say 'Subhana Rabbiy-al-A'la' thrice, and sitting sessions known as <strong>Jalsah</strong> and <strong>Tashahhud</strong>.</p>
                <p>The Prophet Muhammad (PBUH) instructed: 'Pray as you have seen me praying' (Sahih Bukhari).</p>
            """,
            "faqs": [{"q": "Can women pray differently?", "a": "The general steps are the same, though women should cover everything except face and hands."}],
            "refs": ["Sahih Bukhari", "Sahih Muslim"]
        },
        "tr": {
            "summary": "Sünnete göre namaz kılma rehberi.",
            "tldr": "Namaz İslam'ın ikinci şartıdır ve Tekbir'den Selam'a kadar belirli bir peygamberi yöntemi izler.",
            "body": """
                <p>Namaz, ellerinizi kulaklarınıza kaldırarak ve 'Allahu Ekber' diyerek <strong>İftitah Tekbiri</strong> ile başlar. Bu, Allah ile kutsal bağınızın başlangıcıdır. Ardından Sübhaneke ve Fatiha Suresi okunur.</p>
                <p>Her rekat, 'Sübhane Rabbiyel-Azim' dediğiniz <strong>Rükû</strong>, 'Sübhane Rabbiyel-Ala' dediğiniz <strong>Secde</strong> ve <strong>Ka'de-i Ahire</strong> (son oturuş) gibi bölümleri içerir.</p>
                <p>Peygamberimiz (S.A.V) şöyle buyurmuştur: 'Beni nasıl namaz kılıyor gördüyseniz, siz de öyle kılın' (Buhari).</p>
            """,
            "faqs": [{"q": "Namazda niyet nasıl edilir?", "a": "Niyet kalben yapılır, dil ile söylenmesi zorunlu değildir."}],
            "refs": ["Sahih-i Buhari", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "دليل شامل لأداء الصلاة وفق السنة النبوية.",
            "tldr": "الصلاة هي الركن الثاني من أركان الإسلام وتتبع منهجاً نبوياً محدداً من التكبير إلى التسليم.",
            "body": """
                <p>تبدأ الصلاة بـ <strong>تكبيرة الإحرام</strong>، برفع اليدين إلى الأذنين وقول 'الله أكبر'. هذا يمثل بداية صلتك المقدسة مع الله. بعد ذلك، تقرأ دعاء الاستفتاح وسورة الفاتحة.</p>
                <p>تتضمن كل ركعة <strong>الركوع</strong> حيث تقول 'سبحان ربي العظيم' ثلاثاً، و<strong>السجود</strong> حيث تقول 'سبحان ربي الأعلى' ثلاثاً، والجلوس للتشهد.</p>
                <p>قال النبي صلى الله عليه وسلم: 'صلوا كما رأيتموني أصلي' (صحيح البخاري).</p>
            """,
            "faqs": [{"q": "هل هناك فرق في صلاة المرأة؟", "a": "الخطوات العامة هي نفسها، مع مراعاة ستر المرأة لكل جسدها عدا الوجه والكفين."}],
            "refs": ["صحيح البخاري", "صحيح مسلم"]
        },
        "fr": {
            "summary": "Un guide complet pour accomplir la prière selon la Sunna.",
            "tldr": "La prière est le deuxième pilier de l'Islam et suit une méthode prophétique spécifique du Takbir au Taslim.",
            "body": """
                <p>La prière commence par le <strong>Takbiratul Ihram</strong>, en levant les mains vers les oreilles et en disant 'Allahu Akbar'. Cela marque le début de votre connexion sacrée avec Allah. Ensuite, récitez l'invocation d'ouverture et la Sourate Al-Fatihah.</p>
                <p>Chaque Rakat comprend le <strong>Ruku</strong> (inclinaison) où vous dites 'Subhana Rabbiy-al-Adheem' trois fois, le <strong>Sujood</strong> (prosternation) où vous dites 'Subhana Rabbiy-al-A'la' trois fois, et le Tashahhud.</p>
                <p>Le Prophète Muhammad (PSL) a dit : 'Priez comme vous m'avez vu prier' (Sahih Bukhari).</p>
            """,
            "faqs": [{"q": "Les femmes prient-elles différemment ?", "a": "Les étapes générales sont les mêmes, bien que les femmes doivent couvrir tout le corps sauf le visage et les mains."}],
            "refs": ["Sahih Bukhari", "Sahih Muslim"]
        },
        "id": {
            "summary": "Panduan komprehensif untuk mendirikan shalat sesuai Sunnah.",
            "tldr": "Shalat adalah rukun Islam kedua dan mengikuti metode kenabian yang spesifik dari Takbir hingga Salam.",
            "body": """
                <p>Shalat dimulai dengan <strong>Takbiratul Ihram</strong>, mengangkat tangan ke telinga dan mengucapkan 'Allahu Akbar'. Ini menandai dimulainya hubungan suci Anda dengan Allah. Setelah ini, bacalah doa pembuka (Sana) dan Surah Al-Fatihah.</p>
                <p>Setiap Rakaat mencakup <strong>Ruku</strong> (membungkuk) di mana Anda membaca 'Subhana Rabbiy-al-Adheem' tiga kali, <strong>Sujud</strong> di mana Anda membaca 'Subhana Rabbiy-al-A'la' tiga kali, dan duduk Tahiyat.</p>
                <p>Nabi Muhammad (SAW) bersabda: 'Shalatlah kalian sebagaimana kalian melihat aku shalat' (Sahih Bukhari).</p>
            """,
            "faqs": [{"q": "Apakah shalat wanita berbeda?", "a": "Langkah-langkah umumnya sama, meskipun wanita harus menutup seluruh tubuh kecuali wajah dan telapak tangan."}],
            "refs": ["Sahih Bukhari", "Sahih Muslim"]
        }
    },
    "how-to-do-wudu": {
        "en": {
            "summary": "Authentic step-by-step guide to Wudu (Ablution).",
            "tldr": "Wudu is required before Salah and includes washing hands, mouth, nose, face, arms, head, and feet.",
            "body": """
                <p>Wudu starts with <strong>Niyyah</strong> (intention) and saying 'Bismillah'. You wash your hands thrice, then rinse your <strong>mouth and nose</strong>. Next, wash your <strong>face</strong> and your <strong>arms</strong> up to the elbows.</p>
                <p><strong>Masah</strong> involves wiping your head with wet hands once, including the ears. Finally, wash your <strong>feet</strong> up to the ankles, ensuring water reaches between the toes.</p>
                <p>The Prophet (PBUH) said: 'The wudu of the one who does not say Bismillah is invalid' (Abu Dawud).</p>
            """,
            "faqs": [{"q": "What breaks Wudu?", "a": "Passing wind, deep sleep, or using the bathroom break wudu."}],
            "refs": ["Abu Dawud", "Sahih Muslim"]
        },
        "tr": {
            "summary": "Adım adım abdest alma rehberi.",
            "tldr": "Namazdan önce abdest farzdır; eller, ağız, burun, yüz, kollar, baş ve ayakların yıkanmasını içerir.",
            "body": "<p>Abdest <strong>Niyet</strong> ve 'Besmele' ile başlar. Elleri üç kez yıkayın, ardından <strong>ağız ve burnu</strong> temizleyin. Sonra <strong>yüzü</strong> ve dirseklere kadar <strong>kolları</strong> yıkayın.</p><p><strong>Mesh</strong>, ıslak ellerle başın ve kulakların bir kez silinmesini içerir. Son olarak <strong>ayakları</strong> bileklere kadar yıkayın.</p>",
            "faqs": [{"q": "Abdesti neler bozar?", "a": "Yellenmek, derin uyku veya tuvalet ihtiyacı abdesti bozar."}],
            "refs": ["Ebu Davud", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "دليل خطوة بخطوة للوضوء (الطهارة).",
            "tldr": "الوضوء مطلوب قبل الصلاة ويشمل غسل اليدين والفم والأنف والوجه والذراعين والرأس والقدمين.",
            "body": "<p>يبدأ الوضوء <strong>بالنية</strong> وقول 'بسم الله'. تغسل يديك ثلاث مرات، ثم تشطف <strong>فمك وأنفك</strong>. بعد ذلك، تغسل <strong>وجهك</strong> و<strong>ذراعيك</strong> حتى المرفقين.</p><p>يشمل <strong>المسح</strong> مسح رأسك بيدين مبللتين مرة واحدة، بما في ذلك الأذنين. أخيرًا، تغسل <strong>قدميك</strong> حتى الكعبين.</p>",
            "faqs": [{"q": "ما الذي يبطل الوضوء؟", "a": "خروج الريح، النوم العميق، أو استخدام الحمام يبطل الوضوء."}],
            "refs": ["أبو داود", "صحيح مسلم"]
        },
        "fr": {
            "summary": "Guide authentique étape par étape pour le Wudu (ablution).",
            "tldr": "Le Wudu est requis avant la Salah et comprend le lavage des mains, de la bouche, du nez, du visage, des bras, de la tête et des pieds.",
            "body": "<p>Le Wudu commence par la <strong>Niyyah</strong> (intention) et en disant 'Bismillah'. Lavez vos mains trois fois, puis rincez votre <strong>bouche et votre nez</strong>. Ensuite, lavez votre <strong>visage</strong> et vos <strong>bras</strong> jusqu'aux coudes.</p><p>Le <strong>Masah</strong> implique d'essuyer votre tête avec des mains mouillées une fois, y compris les oreilles. Enfin, lavez vos <strong>pieds</strong> jusqu'aux chevilles.</p>",
            "faqs": [{"q": "Qu'est-ce qui annule le Wudu ?", "a": "Émettre des gaz, un sommeil profond ou l'utilisation des toilettes annulent le Wudu."}],
            "refs": ["Abu Dawud", "Sahih Muslim"]
        },
        "id": {
            "summary": "Panduan wudu (bersuci) langkah demi langkah yang otentik.",
            "tldr": "Wudu diperlukan sebelum shalat dan meliputi mencuci tangan, mulut, hidung, wajah, lengan, kepala, dan kaki.",
            "body": "<p>Wudu dimulai dengan <strong>Niat</strong> dan mengucapkan 'Bismillah'. Cuci tangan Anda tiga kali, lalu berkumur dan membersihkan <strong>hidung</strong>. Selanjutnya, cuci <strong>wajah</strong> dan <strong>lengan</strong> Anda hingga siku.</p><p><strong>Masah</strong> melibatkan mengusap kepala dengan tangan basah sekali, termasuk telinga. Terakhir, cuci <strong>kaki</strong> Anda hingga mata kaki.</p>",
            "faqs": [{"q": "Apa yang membatalkan Wudu?", "a": "Buang angin, tidur nyenyak, atau buang air membatalkan wudu."}],
            "refs": ["Abu Dawud", "Sahih Muslim"]
        }
    },
    "ghusl-guide": {
        "en": {
            "summary": "How to perform the ritual purification of Ghusl.",
            "tldr": "Ghusl is obligatory after major impurity and follows a complete washing of the entire body.",
            "body": """
                <p>Ghusl starts with the <strong>intention</strong> and washing your hands. Wash the private parts, then perform <strong>Wudu</strong> (some scholars say feet can be washed at the end). Pour water thrice over the <strong>head</strong>, then the <strong>right side</strong> of the body, and finally the <strong>left side</strong>.</p>
                <p>Ensure that water reaches every single part of the skin and hair roots.</p>
            """,
            "faqs": [{"q": "Is washing the mouth necessary?", "a": "Yes, rinsing the mouth and nose is part of the complete Ghusl."}],
                "refs": ["Sahih Muslim", "Bulugh al-Maram"]
            },
            "tr": {
                "summary": "Gusül abdestinin (Boy Abdesti) alınışı.",
                "tldr": "Gusül, büyük kirlilikten (cenabet) sonra farzdır ve tüm vücudun yıkanmasını gerektirir.",
                "body": "<p>Gusül <strong>niyet</strong> ve ellerin yıkanmasıyla başlar. Özel bölgeleri temizleyin, ardından <strong>namaz abdesti</strong> alın. Başa üç kez su dökün, ardından vücudun <strong>sağ tarafına</strong> ve son olarak <strong>sol tarafına</strong> su dökün.</p><p>Suyun derinin her yerine ve saç köklerine ulaştığından emin olun.</p>",
                "faqs": [{"q": "Ağzı yıkamak gerekli mi?", "a": "Evet, Hanefi mezhebine göre ağza ve burna su vermek (Mazmaza ve İstinşak) guslün farzlarındandır."}],
                "refs": ["Sahih-i Müslim", "Bulûğ'ul-Merâm"]
            },
            "ar": {
                "summary": "كيفية أداء الغسل (الطهارة الكبرى).",
                "tldr": "الغسل واجب بعد الجنابة ويتضمن غسل كامل الجسم.",
                "body": "<p>يبدأ الغسل <strong>بالنية</strong> وغسل اليدين. اغسل الفرج، ثم توضأ <strong>وضوء الصلاة</strong>. أفرغ الماء ثلاث مرات على <strong>الرأس</strong>، ثم على <strong>الجانب الأيمن</strong> من الجسم، وأخيراً <strong>الجانب الأيسر</strong>.</p><p>تأكد من وصول الماء إلى كل جزء من البشرة وأصول الشعر.</p>",
                "faqs": [{"q": "هل المضمضة ضرورية؟", "a": "نعم، المضمضة والاستنشاق جزء من الغسل الكامل عند بعض المذاهب ومستحبة عند أخرى."}],
                "refs": ["صحيح مسلم", "بلوغ المرام"]
            },
            "fr": {
                "summary": "Comment effectuer la purification rituelle du Ghusl.",
                "tldr": "Le Ghusl est obligatoire après une impureté majeure et implique un lavage complet de tout le corps.",
                "body": "<p>Le Ghusl commence par l'<strong>intention</strong> et le lavage des mains. Lavez les parties intimes, puis effectuez le <strong>Wudu</strong>. Versez de l'eau trois fois sur la <strong>tête</strong>, puis sur le <strong>côté droit</strong> du corps, et enfin sur le <strong>côté gauche</strong>.</p><p>Assurez-vous que l'eau atteint chaque partie de la peau et les racines des cheveux.</p>",
                "faqs": [{"q": "Le lavage de la bouche est-il nécessaire ?", "a": "Oui, le rinçage de la bouche et du nez fait partie du Ghusl complet."}],
                "refs": ["Sahih Muslim", "Bulugh al-Maram"]
            },
            "id": {
                "summary": "Cara melakukan penyucian ritual Ghusl (Mandi Wajib).",
                "tldr": "Ghusl (Mandi Wajib) wajib dilakukan setelah hadas besar dan mengikuti pencucian seluruh tubuh.",
                "body": "<p>Ghusl dimulai dengan <strong>niat</strong> dan mencuci tangan. Cuci kemaluan, lalu lakukan <strong>Wudu</strong>. Tuangkan air tiga kali ke atas <strong>kepala</strong>, lalu ke <strong>sisi kanan</strong> tubuh, dan terakhir ke <strong>sisi kiri</strong>.</p><p>Pastikan air mencapai setiap bagian kulit dan akar rambut.</p>",
                "faqs": [{"q": "Apakah berkumur itu perlu?", "a": "Ya, berkumur dan membersihkan hidung adalah bagian dari Ghusl yang sempurna."}],
                "refs": ["Sahih Muslim", "Bulugh al-Maram"]
            }
        },
    "tahajjud-prayer": {
        "en": {
            "summary": "The virtues and method of the Night Prayer.",
            "tldr": "Tahajjud is prayed in the last third of the night and is one of the most beloved prayers to Allah.",
            "body": """
                <p>The best time for <strong>Tahajjud</strong> is after waking up from sleep in the <strong>last third</strong> of the night. It is prayed in units of two (two by two). The minimum is two rakats, and the maximum is not strictly limited, though the Prophet usually prayed 8 or 11 including Witr.</p>
                <p>Allah descends to the lowest heaven and asks: 'Who is calling upon Me, that I may answer him?' (Sahih Bukhari).</p>
            """,
            "faqs": [{"q": "Do I have to sleep first?", "a": "While waking up after sleep is ideal (the meaning of Tahajjud), praying after Isha is also valid as Qiyam-al-Layl."}],
            "refs": ["Sahih Bukhari", "Surah Al-Muzzammil"]
        },
        "tr": {
            "summary": "Teheccüd (Gece) Namazının faziletleri ve kılınışı.",
            "tldr": "Teheccüd gecenin son üçte birinde kılınır ve Allah'a en sevimli gelen namazlardan biridir.",
            "body": "<p><strong>Teheccüd</strong> için en faziletli vakit, gecenin <strong>son üçte birinde</strong> uykudan uyandıktan sonradır. İkişer rekatlar halinde kılınır. En azı iki rekattır, en çoğu için kesin bir sınır yoktur ancak Peygamberimiz (S.A.V) genellikle Vitir dahil 11 veya 13 rekat kılardı.</p><p>Allah dünya semasına iner ve şöyle buyurur: 'Bana dua eden yok mu, ona icabet edeyim?' (Buhari).</p>",
            "faqs": [{"q": "Önce uyumak şart mıdır?", "a": "İdeal olan uyuduktan sonra uyanmaktır (Teheccüd'ün manası budur), ancak Yatsı'dan sonra uyumadan kılmak da Gece İbadeti (Kıyam-ül Leyl) olarak geçerlidir."}],
            "refs": ["Sahih-i Buhari", "Müzzemmil Suresi"]
        },
        "ar": {
            "summary": "فضائل وكيفية صلاة الليل (التهجد).",
            "tldr": "صلاة التهجد تؤدى في الثلث الأخير من الليل وهي من أحب الصلوات إلى الله.",
            "body": "<p>أفضل وقت <strong>للتهجد</strong> هو بعد الاستيقاظ من النوم في <strong>الثلث الأخير</strong> من الليل. تُصلى ركعتين ركعتين. أقلها ركعتان، وأكثرها غير محدد بصرامة، لكن النبي كان يصلي عادة 11 أو 13 ركعة مع الوتر.</p><p>ينزل الله إلى السماء الدنيا ويقول: 'من يدعوني فأستجيب له؟' (صحيح البخاري).</p>",
            "faqs": [{"q": "هل يجب النوم أولاً؟", "a": "الأفضل هو الاستيقاظ بعد النوم (وهو معنى التهجد)، ولكن الصلاة بعد العشاء دون نوم تعتبر أيضاً قيام ليل."}],
            "refs": ["صحيح البخاري", "سورة المزمل"]
        },
        "fr": {
            "summary": "Les vertus et la méthode de la prière de nuit (Tahajjud).",
            "tldr": "Le Tahajjud est prié dans le dernier tiers de la nuit et est l'une des prières les plus aimées d'Allah.",
            "body": "<p>Le meilleur moment pour le <strong>Tahajjud</strong> est après le réveil du sommeil dans le <strong>dernier tiers</strong> de la nuit. Elle est priée par unités de deux. Le minimum est de deux rakats, et le maximum n'est pas strictement limité, bien que le Prophète priait généralement 11 ou 13 rakats, Witr inclus.</p><p>Allah descend au ciel le plus bas et demande : 'Qui M'invoque, que Je l'exauce ?' (Sahih Al-Bukhari).</p>",
            "faqs": [{"q": "Dois-je dormir d'abord ?", "a": "Bien que se réveiller après avoir dormi soit idéal (le sens de Tahajjud), prier après l'Isha est également valide comme Qiyam-al-Layl."}],
            "refs": ["Sahih Al-Bukhari", "Sourate Al-Muzzammil"]
        },
        "id": {
            "summary": "Keutamaan dan tata cara Shalat Malam (Tahajjud).",
            "tldr": "Tahajjud dilakukan di sepertiga malam terakhir dan merupakan salah satu shalat yang paling dicintai Allah.",
            "body": "<p>Waktu terbaik untuk <strong>Tahajjud</strong> adalah setelah bangun tidur di <strong>sepertiga terakhir</strong> malam. Shalat dilakukan dua rakaat-dua rakaat. Minimal dua rakaat, dan maksimalnya tidak dibatasi secara ketat, meskipun Nabi biasanya shalat 11 atau 13 rakaat termasuk Witir.</p><p>Allah turun ke langit dunia dan bertanya: 'Siapa yang berdoa kepada-Ku, niscaya akan Aku kabulkan?' (Sahih Bukhari).</p>",
            "faqs": [{"q": "Apakah saya harus tidur dulu?", "a": "Meskipun bangun setelah tidur adalah ideal (makna Tahajjud), shalat setelah Isya tanpa tidur juga sah sebagai Qiyamul Lail."}],
            "refs": ["Sahih Bukhari", "Surah Al-Muzzammil"]
        }
    },
    "jummah-friday-prayer": {
        "en": {
            "summary": "The virtues and etiquette of the Friday prayer.",
            "tldr": "Friday is the best day of the week, and Jummah prayer is obligatory for men.",
            "body": "<p>Prophet Muhammad (PBUH) said: 'The best day on which the sun has risen is Friday.' (Sahih Muslim). Etiquettes include taking a bath (Ghusl), wearing clean clothes, coming early to the mosque, and listening attentively to the Khutbah.</p>",
            "faqs": [{"q": "When should I recite Surah Kahf?", "a": "It is recommended to recite it anytime on Friday, from sunset on Thursday until sunset on Friday."}],
            "refs": ["Sahih Muslim", "Surah Al-Jumu'ah"]
        },
        "tr": {
            "summary": "Cuma namazının faziletleri ve adabı.",
            "tldr": "Cuma haftanın en hayırlı günüdür ve Cuma namazı erkeklere farzdır.",
            "body": "<p>Peygamber Efendimiz (S.A.V) şöyle buyurmuştur: 'Üzerine güneşin doğduğu en hayırlı gün Cuma günüdür.' (Müslim). Adabı arasında gusül almak, temiz kıyafetler giymek, camiye erken gitmek ve hutbeyi dikkatlice dinlemek vardır.</p>",
            "faqs": [{"q": "Kehf Suresi ne zaman okunmalı?", "a": "Perşembe günü gün batımından Cuma günü gün batımına kadar olan sürede okunması müstehaptır."}],
            "refs": ["Sahih-i Müslim", "Cuma Suresi"]
        },
        "ar": {
            "summary": "فضائل وآداب صلاة الجمعة.",
            "tldr": "الجمعة هو خير أيام الأسبوع، وصلاة الجمعة فرض على الرجال.",
            "body": "<p>قال النبي صلى الله عليه وسلم: 'خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ' (صحيح مسلم). من آدابها الغسل، لبس النظيف من الثياب، التبكير إلى المسجد، والإنصات للخطبة.</p>",
            "faqs": [{"q": "متى يجب قراءة سورة الكهف؟", "a": "يُستحب قراءتها في أي وقت من يوم الجمعة، من غروب شمس الخميس إلى غروب شمس الجمعة."}],
            "refs": ["صحيح مسلم", "سورة الجمعة"]
        },
        "fr": {
            "summary": "Les vertus et l'étiquette de la prière du vendredi.",
            "tldr": "Le vendredi est le meilleur jour de la semaine, et la prière du Jummah est obligatoire pour les hommes.",
            "body": "<p>Le Prophète Muhammad (PSL) a dit : 'Le meilleur jour où le soleil s'est levé est le vendredi.' (Sahih Muslim). Les étiquettes comprennent prendre un bain (Ghusl), porter des vêtements propres, venir tôt à la mosquée et écouter attentivement la Khutbah.</p>",
            "faqs": [{"q": "Quand dois-je réciter la sourate Al-Kahf ?", "a": "Il est recommandé de la réciter à tout moment le vendredi, du coucher du soleil le jeudi jusqu'au coucher du soleil le vendredi."}],
            "refs": ["Sahih Muslim", "Sourate Al-Jumu'ah"]
        },
        "id": {
            "summary": "Keutamaan dan adab shalat Jumat.",
            "tldr": "Jumat adalah hari terbaik dalam seminggu, dan shalat Jumat wajib bagi laki-laki.",
            "body": "<p>Nabi Muhammad (SAW) bersabda: 'Hari terbaik di mana matahari terbit adalah hari Jumat.' (Sahih Muslim). Adabnya meliputi mandi (Ghusl), mengenakan pakaian bersih, datang lebih awal ke masjid, dan mendengarkan Khutbah dengan seksama.</p>",
            "faqs": [{"q": "Kapan sebaiknya membaca Surat Al-Kahfi?", "a": "Dianjurkan untuk membacanya kapan saja di hari Jumat, dari terbenamnya matahari di hari Kamis sampai terbenamnya matahari di hari Jumat."}],
            "refs": ["Sahih Muslim", "Surah Al-Jumu'ah"]
        }
    },
    "hajj-basics": {
        "en": {
            "summary": "A brief overview of the pillars of Hajj.",
            "tldr": "Hajj is the fifth pillar of Islam, performed once in a lifetime for those who are able.",
            "body": "<p>Hajj involves specific rituals in Mecca, Mina, Arafat, and Muzdalifah. The main pillars are: 1. Ihram, 2. Standing at Arafat, 3. Tawaf al-Ifadah, 4. Sa'i between Safa and Marwa.</p>",
            "faqs": [{"q": "When is Hajj performed?", "a": "In the month of Dhu al-Hijjah, the 12th month of the Islamic calendar."}],
            "refs": ["The Holy Quran", "Sahih Bukhari"]
        },
        "tr": {
            "summary": "Hac ibadetinin rükunlarına kısa bir bakış.",
            "tldr": "Hac, İslam'ın beşinci şartıdır ve gücü yetenler için ömürde bir kez farzdır.",
            "body": "<p>Hac; Mekke, Mina, Arafat ve Müzdelife'de belirli ritüelleri içerir. Ana rükunları: 1. İhram, 2. Arafat Vakfesi, 3. Ziyaret Tavafı, 4. Safa ve Merve arasında Sa'y.</p>",
            "faqs": [{"q": "Hac ne zaman yapılır?", "a": "İslami takvimin 12. ayı olan Zilhicce ayında yapılır."}],
            "refs": ["Kur'an-ı Kerim", "Sahih-i Buhari"]
        },
        "ar": {
            "summary": "نظرة موجزة على أركان الحج.",
            "tldr": "الحج هو الركن الخامس من أركان الإسلام، ويجب مرة واحدة في العمر لمن استطاع إليه سبيلاً.",
            "body": "<p>يتضمن الحج مناسك محددة في مكة ومنى وعرفات ومزدلفة. الأركان الأساسية هي: 1. الإحرام، 2. الوقوف بعرفة، 3. طواف الإفاضة، 4. السعي بين الصفا والمروة.</p>",
            "faqs": [{"q": "متى يكون الحج؟", "a": "في شهر ذي الحجة، الشهر الثاني عشر من التقويم الهجري."}],
            "refs": ["القرآن الكريم", "صحيح البخاري"]
        },
        "fr": {
            "summary": "Un bref aperçu des piliers du Hajj.",
            "tldr": "Le Hajj est le cinquième pilier de l'Islam, effectué une fois dans la vie pour ceux qui en ont la capacité.",
            "body": "<p>Le Hajj implique des rituels spécifiques à La Mecque, Mina, Arafat et Muzdalifah. Les principaux piliers sont : 1. Ihram, 2. Station à Arafat, 3. Tawaf al-Ifadah, 4. Sa'i entre Safa et Marwa.</p>",
            "faqs": [{"q": "Quand le Hajj est-il effectué ?", "a": "Au mois de Dhu al-Hijjah, le 12ème mois du calendrier islamique."}],
            "refs": ["Le Saint Coran", "Sahih Al-Bukhari"]
        },
        "id": {
            "summary": "Tinjauan singkat tentang rukun Haji.",
            "tldr": "Haji adalah rukun Islam kelima, dilakukan seumur hidup sekali bagi mereka yang mampu.",
            "body": "<p>Haji melibatkan ritual khusus di Mekah, Mina, Arafat, dan Muzdalifah. Rukun utamanya adalah: 1. Ihram, 2. Wukuf di Arafat, 3. Tawaf Ifadah, 4. Sa'i antara Safa dan Marwa.</p>",
            "faqs": [{"q": "Kapan Haji dilaksanakan?", "a": "Pada bulan Dzulhijjah, bulan ke-12 kalender Islam."}],
            "refs": ["Al-Quran", "Sahih Bukhari"]
        }
    },
    "istikhara-guide": {
        "en": {
            "summary": "How to perform Salat al-Istikhara for guidance.",
            "tldr": "Istikhara is a 2-rakat prayer followed by a specific dua to seek Allah's counsel in decisions.",
            "body": """
                <p>When facing a decision, perform two non-obligatory rakats. After finishing, recite the <strong>Istikhara Dua</strong> where you ask Allah to decree what is good for your religion and livelihood.</p>
                <p>You don't need a dream; rather, Allah will make the right choice easy and turn you away from the wrong one.</p>
            """,
            "faqs": [{"q": "Can I pray it for marriage?", "a": "Yes, it is highly recommended for all major life decisions including marriage."}],
            "refs": ["Sahih Bukhari", "Tirmidhi"]
        },
        "tr": {
            "summary": "İstihare namazının kılınışı ve önemi.",
            "tldr": "İstihare, kararsız kalınan konularda Allah'ın hayırlısını nasip etmesi için kılınan iki rekatlık bir namaz ve duadır.",
            "body": "<p>Bir kararla yüzleştiğinizde, farz olmayan iki rekat namaz kılın. Bitirdikten sonra, Allah'tan dininiz ve geçiminiz için hayırlı olanı takdir etmesini istediğiniz <strong>İstihare Duası</strong>nı okuyun.</p><p>Rüya görmeniz gerekmez; aksine, Allah doğru seçimi kolaylaştıracak ve sizi yanlış olandan uzaklaştıracaktır.</p>",
            "faqs": [{"q": "Evlilik için kılınabilir mi?", "a": "Evet, evlilik dahil tüm önemli hayat kararları için şiddetle tavsiye edilir."}],
            "refs": ["Sahih-i Buhari", "Tirmizi"]
        },
        "ar": {
            "summary": "كيفية صلاة الاستخارة لطلب الخيرة من الله.",
            "tldr": "الاستخارة هي صلاة ركعتين يتبعهما دعاء مخصوص لطلب العون من الله في اتخاذ القرار.",
            "body": "<p>عندما تواجه قراراً، صل ركعتين من غير الفريضة. بعد الانتهاء، اقرأ <strong>دعاء الاستخارة</strong> حيث تسأل الله أن يقدر لك الخير في دينك ومعاشك.</p><p>لا تحتاج إلى رؤية حلم؛ بل سييسر الله لك الخيار الصحيح ويصرفك عن الخاطئ.</p>",
            "faqs": [{"q": "هل يمكن صلاتها للزواج؟", "a": "نعم، يُستحب جداً لجميع قرارات الحياة الرئيسية بما في ذلك الزواج."}],
            "refs": ["صحيح البخاري", "سنن الترمذي"]
        },
        "fr": {
            "summary": "Comment accomplir la Salat al-Istikhara pour être guidé.",
            "tldr": "L'Istikhara est une prière de 2 rakats suivie d'une dua spécifique pour demander conseil à Allah dans les décisions.",
            "body": "<p>Face à une décision, accomplissez deux rakats non obligatoires. Après avoir fini, récitez la <strong>Dua de l'Istikhara</strong> où vous demandez à Allah de décréter ce qui est bon pour votre religion et votre subsistance.</p><p>Vous n'avez pas besoin de faire un rêve ; Allah facilitera plutôt le bon choix et vous détournera du mauvais.</p>",
            "faqs": [{"q": "Puis-je la prier pour le mariage ?", "a": "Oui, elle est fortement recommandée pour toutes les décisions majeures de la vie, y compris le mariage."}],
            "refs": ["Sahih Al-Bukhari", "Tirmidhi"]
        },
        "id": {
            "summary": "Cara melakukan Shalat Istikharah untuk memohon petunjuk.",
            "tldr": "Istikharah adalah shalat 2 rakaat yang diikuti dengan doa khusus untuk memohon petunjuk Allah dalam mengambil keputusan.",
            "body": "<p>Saat menghadapi keputusan, lakukan dua rakaat shalat sunnah. Setelah selesai, bacalah <strong>Doa Istikharah</strong> di mana Anda meminta Allah untuk menetapkan apa yang baik bagi agama dan penghidupan Anda.</p><p>Anda tidak perlu bermimpi; sebaliknya, Allah akan memudahkan pilihan yang benar dan memalingkan Anda dari yang salah.</p>",
            "faqs": [{"q": "Bisakah saya shalat untuk pernikahan?", "a": "Ya, sangat dianjurkan untuk semua keputusan besar dalam hidup termasuk pernikahan."}],
            "refs": ["Sahih Bukhari", "Tirmidhi"]
        }
    },
    "ramadan-patience": {
        "en": {
            "summary": "How to cultivate patience (Sabr) during the blessed month of Ramadan.",
            "tldr": "Ramadan is the month of patience, and patience is half of faith. It involves restraining the soul from desires and anger.",
            "body": "<p>Prophet Muhammad (PBUH) called Ramadan 'the month of patience'. Fasting is not just abstaining from food and drink, but also from anger, backbiting, and sin.</p><p>Sabr in Ramadan multiplies rewards without measure: 'Only those who are patient shall receive their rewards in full, without reckoning.' (Quran 39:10).</p>",
            "faqs": [{"q": "Does getting angry break the fast?", "a": "It does not invalidate the fast technically, but it diminishes its spiritual reward significantly."}],
            "refs": ["Quran 39:10", "Sahih Bukhari"]
        },
        "tr": {
            "summary": "Mübarek Ramazan ayında sabrı (Sabır) nasıl geliştirebilirsiniz?",
            "tldr": "Ramazan sabır ayıdır ve sabır imanın yarısıdır. Nefsi arzulardan ve öfkeden alıkoymayı içerir.",
            "body": "<p>Peygamber Efendimiz (S.A.V) Ramazan'ı 'sabır ayı' olarak adlandırmıştır. Oruç sadece yemekten ve içmekten değil, aynı zamanda öfkeden, gıybetten ve günahtan da uzak durmaktır.</p><p>Ramazan'da sabır, ödülleri hesapsızca çoğaltır: 'Ancak sabredenlere mükâfatları hesapsız ödenecektir.' (Zümer Suresi 39:10).</p>",
            "faqs": [{"q": "Sinirlenmek orucu bozar mı?", "a": "Orucu teknik olarak bozmaz ancak manevi sevabını önemli ölçüde azaltır."}],
            "refs": ["Zümer Suresi 39:10", "Sahih-i Buhari"]
        },
        "ar": {
            "summary": "كيف تنمي الصبر خلال شهر رمضان المبارك.",
            "tldr": "رمضان هو شهر الصبر، والصبر نصف الإيمان. يتضمن كبح النفس عن الشهوات والغضب.",
            "body": "<p>سمّى النبي محمد (صلى الله عليه وسلم) رمضان 'شهر الصبر'. الصيام ليس مجرد الامتناع عن الطعام والشراب، بل أيضاً عن الغضب والغيبة والمعاصي.</p><p>الصبر في رمضان يضاعف الأجر بغير حساب: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ' (الزمر 10).</p>",
            "faqs": [{"q": "هل الغضب يفسد الصيام؟", "a": "لا يبطل الصيام فقهياً، لكنه ينقص من أجره الروحي بشكل كبير."}],
            "refs": ["سورة الزمر 10", "صحيح البخاري"]
        },
        "fr": {
            "summary": "Comment cultiver la patience (Sabr) pendant le mois béni du Ramadan.",
            "tldr": "Le Ramadan est le mois de la patience, et la patience est la moitié de la foi. Elle implique de retenir l'âme des désirs et de la colère.",
            "body": "<p>Le Prophète Muhammad (PSL) a appelé le Ramadan 'le mois de la patience'. Le jeûne n'est pas seulement s'abstenir de manger et de boire, mais aussi de la colère, de la médisance et du péché.</p><p>Le Sabr pendant le Ramadan multiplie les récompenses sans mesure : 'Les endurants auront leur pleine récompense sans compter.' (Coran 39:10).</p>",
            "faqs": [{"q": "Se mettre en colère annule-t-il le jeûne ?", "a": "Cela n'invalide pas techniquement le jeûne, mais cela diminue considérablement sa récompense spirituelle."}],
            "refs": ["Coran 39:10", "Sahih Al-Bukhari"]
        },
        "id": {
            "summary": "Cara memupuk kesabaran (Sabr) selama bulan suci Ramadhan.",
            "tldr": "Ramadhan adalah bulan kesabaran, dan kesabaran adalah separuh dari iman. Ini melibatkan menahan diri dari keinginan dan kemarahan.",
            "body": "<p>Nabi Muhammad (SAW) menyebut Ramadhan sebagai 'bulan kesabaran'. Puasa bukan hanya menahan diri dari makan dan minum, tetapi juga dari kemarahan, ghibah, dan dosa.</p><p>Sabr di bulan Ramadhan melipatgandakan pahala tanpa batas: 'Sesungguhnya hanya orang-orang yang bersabarlah yang dicukupkan pahala mereka tanpa batas.' (Quran 39:10).</p>",
            "faqs": [{"q": "Apakah marah membatalkan puasa?", "a": "Itu tidak membatalkan puasa secara teknis, tetapi sangat mengurangi pahala spiritualnya."}],
            "refs": ["Quran 39:10", "Sahih Bukhari"]
        }
    },
    "zakat-calculator-meaning": {
        "en": {
            "summary": "Everything you need to know about Zakat: Calculation, Meaning, and Recipients.",
            "tldr": "Zakat is the third pillar of Islam, requiring 2.5% of annual savings to be given to specific categories of people like the poor and needy.",
            "body": "<p>Zakat purifies wealth. It is due on gold, silver, cash, business merchandise, and livestock if they reach the Nisab (minimum threshold) and are held for a lunar year.</p><p>Allah says: 'Take, [O, Muhammad], from their wealth a charity by which you purify them and cause them increase.' (Quran 9:103).</p>",
            "faqs": [{"q": "Can I give Zakat to my parents?", "a": "No, you cannot give Zakat to parents, children, or spouse as you are already obliged to support them."}],
            "refs": ["Quran 9:60", "Sahih Muslim"]
        },
        "tr": {
            "summary": "Zekat hakkında bilmeniz gereken her şey: Hesaplama, Anlam ve Verilecek Kişiler.",
            "tldr": "Zekat İslam'ın üçüncü şartıdır; yıllık birikimin %2,5'inin fakirler ve muhtaçlar gibi belirli kategorideki insanlara verilmesini gerektirir.",
            "body": "<p>Zekat malı temizler. Altın, gümüş, nakit, ticaret malları ve hayvanlar Nisab miktarına ulaşıp üzerlerinden bir kameri yıl geçerse zekat verilmesi gerekir.</p><p>Allah şöyle buyurur: 'Onların mallarından sadaka al; bununla onları (günahlardan) temizlersin, onları arıtıp yüceltirsin.' (Tevbe Suresi 9:103).</p>",
            "faqs": [{"q": "Anne babaya zekat verilir mi?", "a": "Hayır, bakmakla yükümlü olduğunuz anne, baba, eş ve çocuklara zekat verilemez."}],
            "refs": ["Tevbe Suresi 9:60", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "كل ما تحتاج معرفته عن الزكاة: حسابها، معناها، ومستحقيها.",
            "tldr": "الزكاة هي الركن الثالث من أركان الإسلام، وتوجب دفع 2.5% من المدخرات السنوية لفئات محددة مثل الفقراء والمساكين.",
            "body": "<p>الزكاة تطهر المال. تجب في الذهب والفضة والنقد وعروض التجارة والأنعام إذا بلغت النصاب وحال عليها الحول القمري.</p><p>قال الله تعالى: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا' (التوبة 103).</p>",
            "faqs": [{"q": "هل يجوز إعطاء الزكاة للوالدين؟", "a": "لا، لا يجوز دفع الزكاة للأصول (الوالدين) ولا للفروع (الأبناء) ولا للزوجة لأن نفقتهم واجبة عليك."}],
            "refs": ["سورة التوبة 60", "صحيح مسلم"]
        },
        "fr": {
            "summary": "Tout ce que vous devez savoir sur la Zakat : Calcul, Signification et Bénéficiaires.",
            "tldr": "La Zakat est le troisième pilier de l'Islam, nécessitant que 2,5 % de l'épargne annuelle soit donnée à des catégories spécifiques comme les pauvres et les nécessiteux.",
            "body": "<p>La Zakat purifie la richesse. Elle est due sur l'or, l'argent, l'argent liquide, les marchandises commerciales et le bétail s'ils atteignent le Nisab (seuil minimum) et sont détenus pendant une année lunaire.</p><p>Allah dit : 'Prélève de leurs biens une aumône par laquelle tu les purifies et les bénis.' (Coran 9:103).</p>",
            "faqs": [{"q": "Puis-je donner la Zakat à mes parents ?", "a": "Non, vous ne pouvez pas donner la Zakat aux parents, aux enfants ou au conjoint car vous êtes déjà obligé de subvenir à leurs besoins."}],
            "refs": ["Coran 9:60", "Sahih Muslim"]
        },
        "id": {
            "summary": "Segala hal yang perlu Anda ketahui tentang Zakat: Perhitungan, Makna, dan Penerima.",
            "tldr": "Zakat adalah rukun Islam ketiga, yang mewajibkan 2,5% dari tabungan tahunan diberikan kepada golongan tertentu seperti fakir dan miskin.",
            "body": "<p>Zakat menyucikan harta. Zakat wajib atas emas, perak, uang tunai, barang dagangan, dan ternak jika mencapai Nisab (batas minimum) dan dimiliki selama satu tahun hijriah.</p><p>Allah berfirman: 'Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka.' (Quran 9:103).</p>",
            "faqs": [{"q": "Bolehkah saya memberikan Zakat kepada orang tua saya?", "a": "Tidak, Anda tidak boleh memberikan Zakat kepada orang tua, anak, atau pasangan karena Anda sudah berkewajiban menafkahi mereka."}],
            "refs": ["Quran 9:60", "Sahih Muslim"]
        }
    },
    "quran-recitation-tips": {
        "en": {
            "summary": "Practical tips to improve your Quran recitation (Tajweed) and Tadabbur (Reflection).",
            "tldr": "Reciting the Quran with Tartil (measured recitation) is a command from Allah. It involves proper pronunciation, pause, and understanding.",
            "body": "<p>Allah says: 'And recite the Quran with measured recitation.' (73:4). To improve: 1. Learn basic Tajweed rules (Nun Sakina, Madd). 2. Listen to famous Qaris. 3. Recite designated portions daily.</p><p>Understanding the meaning (Tadabbur) is the ultimate goal of recitation.</p>",
            "faqs": [{"q": "Do I need Wudu to recite from memory?", "a": "No, Wudu is required for touching the Mushaf, but not for reciting from memory."}],
            "refs": ["Surah Al-Muzzammil", "Al-Jazari"]
        },
        "tr": {
            "summary": "Kuran tilavetinizi (Tecvid) ve Tedebbürünüzü (Tefekkür) geliştirmek için pratik ipuçları.",
            "tldr": "Kuran'ı Tertil ile (ölçülü okuma) okumak Allah'ın emridir. Doğru telaffuz, duraklama ve anlamayı içerir.",
            "body": "<p>Allah şöyle buyurur: 'Kuran'ı tane tane, hakkını vererek oku.' (Müzzemmil 73:4). Geliştirmek için: 1. Temel Tecvid kurallarını öğrenin. 2. Meşhur Hafızları dinleyin. 3. Günlük belirli bölümleri okuyun.</p><p>Manasını düşünmek (Tedebbür), tilavetin nihai amacıdır.</p>",
            "faqs": [{"q": "Ezberden okumak için abdest gerekir mi?", "a": "Hayır, Mushaf'a dokunmak için abdest gerekir, ancak ezberden okumak için gerekmez."}],
            "refs": ["Müzzemmil Suresi", "İbnü'l-Cezeri"]
        },
        "ar": {
            "summary": "نصائح عملية لتحسين تلاوة القرآن (التجويد) وتدبره.",
            "tldr": "تلاوة القرآن بالترتيل هي أمر إلهي. تتضمن النطق الصحيح، والوقوف، والفهم.",
            "body": "<p>قال الله تعالى: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا' (المزمل 4). للتحسين: 1. تعلم أحكام التجويد الأساسية (النون الساكنة، المد). 2. استمع إلى القراء المشاهير. 3. واظب على ورد يومي.</p><p>تدبر المعاني هو الغاية القصوى من التلاوة.</p>",
            "faqs": [{"q": "هل يجب الوضوء للقراءة من الذاكرة؟", "a": "لا، الوضوء واجب لمس المصحف، ولكن ليس للقراءة غيباً."}],
            "refs": ["سورة المزمل", "الجزرية"]
        },
        "fr": {
            "summary": "Conseils pratiques pour améliorer votre récitation du Coran (Tajweed) et votre Tadabbur (Méditation).",
            "tldr": "Réciter le Coran avec Tartil (récitation mesurée) est un ordre d'Allah. Cela implique une prononciation correcte, des pauses et une compréhension.",
            "body": "<p>Allah dit : 'Et récite le Coran, lentements et clairement.' (73:4). Pour améliorer : 1. Apprenez les règles de base du Tajweed. 2. Écoutez des Qaris célèbres. 3. Récitez quotidiennement des portions désignées.</p><p>Comprendre le sens (Tadabbur) est le but ultime de la récitation.</p>",
            "faqs": [{"q": "Ai-je besoin du Wudu pour réciter de mémoire ?", "a": "Non, le Wudu est requis pour toucher le Mushaf, mais pas pour réciter de mémoire."}],
            "refs": ["Sourate Al-Muzzammil", "Al-Jazari"]
        },
        "id": {
            "summary": "Tips praktis untuk meningkatkan tilawah Quran (Tajwid) dan Tadabbur (Perenungan).",
            "tldr": "Membaca Al-Quran dengan Tartil (perlahan dan jelas) adalah perintah Allah. Ini melibatkan pengucapan, jeda, dan pemahaman yang tepat.",
            "body": "<p>Allah berfirman: 'Dan bacalah Al-Quran itu dengan perlahan-lahan.' (73:4). Untuk meningkatkan: 1. Pelajari aturan dasar Tajwid. 2. Dengarkan Qari terkenal. 3. Baca bagian tertentu setiap hari.</p><p>Memahami makna (Tadabbur) adalah tujuan utama tilawah.</p>",
            "faqs": [{"q": "Apakah saya perlu Wudu untuk membaca dari hafalan?", "a": "Tidak, Wudu diperlukan untuk menyentuh Mushaf, tetapi tidak untuk membaca dari hafalan."}],
            "refs": ["Surah Al-Muzzammil", "Al-Jazari"]
        }
    }
}

# Dhikr and Dua Data
dhikr_data = {
    "evening-dhikr": {
        "en": {
            "summary": "Protecting the soul through evening remembrance.",
            "tldr": "Evening Adhkar (after Asr) provide a shield for the night ahead.",
            "body": "<p>Evening remembrance is essential for spiritual safety. The Prophet (PBUH) taught us to seek refuge from the evils of the night and to thank Allah for the blessings of the day.</p>",
            "faqs": [{"q": "When is the best time?", "a": "Between Asr and Maghrib."}],
            "refs": ["Sahih Muslim", "Hisnul Muslim"]
        },
        "tr": {
            "summary": "Akşam zikriyle ruhu korumak.",
            "tldr": "Akşam Zikirleri (İkindi'den sonra), önümüzdeki gece için bir kalkan sağlar.",
            "body": "<p>Akşam zikri manevi güvenlik için esastır. Peygamberimiz (S.A.V) bize gecenin kötülüklerinden Allah'a sığınmayı ve günün nimetleri için şükretmeyi öğretmiştir.</p>",
            "faqs": [{"q": "En iyi zaman ne zamandır?", "a": "İkindi ile Akşam arası."}],
            "refs": ["Sahih-i Müslim", "Hisnu'l Müslim"]
        },
        "ar": {
            "summary": "حماية النفس بأذكار المساء.",
            "tldr": "أذكار المساء (بعد العصر) توفر درعاً لليلة المقبلة.",
            "body": "<p>ذكر المساء ضروري للأمان الروحي. علمنا النبي (صلى الله عليه وسلم) أن نستعيذ بالله من شرور الليل وأن نشكر الله على نعم اليوم.</p>",
            "faqs": [{"q": "متى أفضل وقت؟", "a": "بين العصر والمغرب."}],
            "refs": ["صحيح مسلم", "حصن المسلم"]
        },
        "fr": {
            "summary": "Protéger l'âme par le rappel du soir.",
            "tldr": "Les Adhkar du soir (après l'Asr) fournissent un bouclier pour la nuit à venir.",
            "body": "<p>Le rappel du soir est essentiel pour la sécurité spirituelle. Le Prophète (PSL) nous a enseigné à chercher refuge contre les maux de la nuit et à remercier Allah pour les bénédictions du jour.</p>",
            "faqs": [{"q": "Quel est le meilleur moment ?", "a": "Entre l'Asr et le Maghrib."}],
            "refs": ["Sahih Muslim", "Hisnul Muslim"]
        },
        "id": {
            "summary": "Melindungi jiwa melalui dzikir petang.",
            "tldr": "Adzkar Petang (setelah Ashar) memberikan perisai untuk malam yang akan datang.",
            "body": "<p>Dzikir petang sangat penting untuk keselamatan spiritual. Nabi (SAW) mengajarkan kita untuk berlindung dari kejahatan malam dan bersyukur kepada Allah atas berkah hari itu.</p>",
            "faqs": [{"q": "Kapan waktu terbaik?", "a": "Antara Ashar dan Maghrib."}],
            "refs": ["Sahih Muslim", "Hisnul Muslim"]
        }
    },
    "tawheed-meaning": {
        "en": {
            "summary": "The core of Islamic belief: The Oneness of Allah.",
            "tldr": "Tawheed is the foundation of Islam and the purpose of creation.",
            "body": "<p>Tawheed involves believing in Allah's Oneness in His Lordship, His Worship, and His Names and Attributes. It is the message of all Prophets from Adam to Muhammad (PBUH).</p>",
            "faqs": [{"q": "What is Shirk?", "a": "Shirk is associating partners with Allah, which is the opposite of Tawheed."}],
            "refs": ["The Holy Quran", "Kitab at-Tawheed"]
        },
        "tr": {
            "summary": "İslam inancının özü: Allah'ın Birliği.",
            "tldr": "Tevhid, İslam'ın temelidir ve yaratılışın amacıdır.",
            "body": "<p>Tevhid, Allah'ın Rabliğinde, İbadetinde, İsim ve Sıfatlarında bir olduğuna inanmayı içerir. Adem'den Muhammed'e (S.A.V) kadar tüm peygamberlerin mesajıdır.</p>",
            "faqs": [{"q": "Şirk nedir?", "a": "Şirk, Allah'a ortak koşmaktır ve Tevhid'in zıddıdır."}],
            "refs": ["Kur'an-ı Kerim", "Kitabu't-Tevhid"]
        },
        "ar": {
            "summary": "جوهر العقيدة الإسلامية: توحيد الله.",
            "tldr": "التوحيد هو أساس الإسلام والغاية من الخلق.",
            "body": "<p>يتضمن التوحيد الإيمان بوحدانية الله في ربوبيته وألوهيته وأسمائه وصفاته. وهي رسالة جميع الأنبياء من آدم إلى محمد (صلى الله عليه وسلم).</p>",
            "faqs": [{"q": "ما هو الشرك؟", "a": "الشرك هو جعل شريك مع الله، وهو نقيض التوحيد."}],
            "refs": ["القرآن الكريم", "كتاب التوحيد"]
        },
        "fr": {
            "summary": "Le cœur de la croyance islamique : L'Unicité d'Allah.",
            "tldr": "Le Tawhid est le fondement de l'Islam et le but de la création.",
            "body": "<p>Le Tawhid implique de croire en l'Unicité d'Allah dans Sa Seigneurie, Son Adoration, et Ses Noms et Attributs. C'est le message de tous les prophètes, d'Adam à Muhammad (PSL).</p>",
            "faqs": [{"q": "Qu'est-ce que le Shirk ?", "a": "Le Shirk est l'association de partenaires à Allah, ce qui est l'opposé du Tawhid."}],
            "refs": ["Le Saint Coran", "Kitab at-Tawheed"]
        },
        "id": {
            "summary": "Inti dari keyakinan Islam: Keesaan Allah.",
            "tldr": "Tauhid adalah fondasi Islam dan tujuan penciptaan.",
            "body": "<p>Tauhid melibatkan keyakinan akan Keesaan Allah dalam Rububiyah-Nya, Ibadah-Nya, serta Nama dan Sifat-Nya. Ini adalah pesan semua Nabi dari Adam hingga Muhammad (SAW).</p>",
            "faqs": [{"q": "Apa itu Syirik?", "a": "Syirik menyekutukan Allah, yang merupakan lawan dari Tauhid."}],
            "refs": ["Al-Quran", "Kitab at-Tawheed"]
        }
    },
    "hasbunallah-trust": {
        "en": {
            "summary": "The power of relying solely on Allah.",
            "tldr": "Saying 'Hasbunallahu wa ni'mal wakeel' is the ultimate declaration of trust.",
            "body": "<p>When the believers were threatened, they said: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.' (3:173). This phrase brings peace during hardships.</p>",
            "faqs": [{"q": "Is it from the Quran?", "a": "Yes, it is mentioned in Surah Ali 'Imran, verse 173."}],
            "refs": ["Surah Ali 'Imran", "Sahih Bukhari"]
        },
        "tr": {
            "summary": "Sadece Allah'a güvenmenin gücü.",
            "tldr": "'Hasbunallahu ve ni'mel vekil' (Allah bize yeter, O ne güzel vekildir) demek, en büyük güven beyanıdır.",
            "body": "<p>Müminler tehdit edildiğinde şöyle dediler: 'Allah bize yeter, O ne güzel vekildir.' (Al-i İmran 173). Bu söz zorluklar sırasında huzur getirir.</p>",
            "faqs": [{"q": "Kuran'da geçiyor mu?", "a": "Evet, Al-i İmran suresi 173. ayette geçmektedir."}],
            "refs": ["Al-i İmran Suresi", "Sahih-i Buhari"]
        },
        "ar": {
            "summary": "قوة التوكل على الله وحده.",
            "tldr": "قول 'حسبنا الله ونعم الوكيل' هو إعلان الثقة المطلقة بالله.",
            "body": "<p>عندما هُدِّد المؤمنون، قالوا: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ' (آل عمران 173). هذه العبارة تجلب الطمأنينة في الشدائد.</p>",
            "faqs": [{"q": "هل هي من القرآن؟", "a": "نعم، ذكرت في سورة آل عمران، الآية 173."}],
            "refs": ["سورة آل عمران", "صحيح البخاري"]
        },
        "fr": {
            "summary": "Le pouvoir de s'en remettre uniquement à Allah.",
            "tldr": "Dire 'Hasbunallahu wa ni'mal wakeel' est la déclaration ultime de confiance.",
            "body": "<p>Lorsque les croyants ont été menacés, ils ont dit : 'Allah nous suffit ; et [Il est] le meilleur Garant.' (3:173). Cette phrase apporte la paix pendant les épreuves.</p>",
            "faqs": [{"q": "Est-ce dans le Coran ?", "a": "Oui, c'est mentionné dans la sourate Ali 'Imran, verset 173."}],
            "refs": ["Sourate Ali 'Imran", "Sahih Al-Bukhari"]
        },
        "id": {
            "summary": "Kekuatan hanya mengandalkan Allah.",
            "tldr": "Mengucapkan 'Hasbunallahu wa ni'mal wakeel' adalah pernyataan kepercayaan mutlak.",
            "body": "<p>Ketika orang-orang beriman diancam, mereka berkata: 'Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.' (3:173). Kalimat ini membawa kedamaian saat kesulitan.</p>",
            "faqs": [{"q": "Apakah itu dari Al-Quran?", "a": "Ya, itu disebutkan dalam Surah Ali 'Imran, ayat 173."}],
            "refs": ["Surah Ali 'Imran", "Sahih Bukhari"]
        }
    },
    "power-of-dua": {
        "en": {
            "summary": "Understanding Dua as the essence of worship.",
            "tldr": "Dua is a direct link to Allah and can change destiny.",
            "body": "<p>The Prophet (PBUH) said: 'Dua is the essence of worship' (Tirmidhi). It is the weapon of the believer. Whether answered immediately, delayed, or used to avert a calamity, no sincere Dua is ever lost.</p>",
            "faqs": [{"q": "When is the best time for Dua?", "a": "Between Adhan and Iqamah, during Sujood, and in the last third of the night."}],
            "refs": ["Tirmidhi", "Al-Adab Al-Mufrad"]
        },
        "tr": {
            "summary": "İbadetin özü olarak Dua'yı anlamak.",
            "tldr": "Dua, Allah ile doğrudan bir bağdır ve kaderi değiştirebilir.",
            "body": "<p>Peygamberimiz (S.A.V) şöyle buyurmuştur: 'Dua, ibadetin özüdür' (Tirmizi). O, müminin silahıdır. İster hemen kabul edilsin, ister ertelensin, isterse bir musibeti defetmek için kullanılsın, hiçbir samimi Dua asla boşa gitmez.</p>",
            "faqs": [{"q": "Dua için en iyi zaman ne zamandır?", "a": "Ezan ile Kamet arası, Secde anı ve gecenin son üçte biri."}],
            "refs": ["Tirmizi", "El-Edebü'l-Müfred"]
        },
        "ar": {
            "summary": "فهم الدعاء كمخ العبادة.",
            "tldr": "الدعاء هو صلة مباشرة بالله ويمكن أن يغير القدر.",
            "body": "<p>قال النبي صلى الله عليه وسلم: 'الدعاء مخ العبادة' (الترمذي). هو سلاح المؤمن. سواء استجيب فوراً، أو ادخر، أو دفع به بلاء، لا يضيع دعاء صادق أبداً.</p>",
            "faqs": [{"q": "متى أفضل وقت للدعاء؟", "a": "بين الأذان والإقامة، وفي السجود، وفي الثلث الأخير من الليل."}],
            "refs": ["سنن الترمذي", "الأدب المفرد"]
        },
        "fr": {
            "summary": "Comprendre la Dua comme l'essence de l'adoration.",
            "tldr": "La Dua est un lien direct avec Allah et peut changer le destin.",
            "body": "<p>Le Prophète (PSL) a dit : 'La Dua est l'essence de l'adoration' (Tirmidhi). C'est l'arme du croyant. Qu'elle soit exaucée immédiatement, retardée ou utilisée pour éviter une calamité, aucune Dua sincère n'est jamais perdue.</p>",
            "faqs": [{"q": "Quel est le meilleur moment pour la Dua ?", "a": "Entre l'Adhan et l'Iqamah, pendant le Sujood et dans le dernier tiers de la nuit."}],
            "refs": ["Tirmidhi", "Al-Adab Al-Mufrad"]
        },
        "id": {
            "summary": "Memahami Doa sebagai inti dari ibadah.",
            "tldr": "Doa adalah hubungan langsung dengan Allah dan dapat mengubah takdir.",
            "body": "<p>Nabi (SAW) bersabda: 'Doa adalah inti dari ibadah' (Tirmidzi). Itu adalah senjata orang mukmin. Baik dikabulkan segera, ditunda, atau digunakan untuk menolak musibah, tidak ada Doa yang tulus yang sia-sia.</p>",
            "faqs": [{"q": "Kapan waktu terbaik untuk berdoa?", "a": "Antara Adzan dan Iqamah, saat Sujud, dan di sepertiga malam terakhir."}],
            "refs": ["Tirmidzi", "Al-Adab Al-Mufrad"]
        }
    },
    "morning-dhikr": {
        "en": {
            "summary": "The importance of starting the day with remembrance.",
            "tldr": "Starting the day with Masnun Adhkar provides protection and barakah.",
            "body": "<p>Morning Adhkar (after Fajr) are a shield for the believer. Reciting 'Subhanallahi wa bihamdihi' 100 times wipes away sins even if they are like the foam of the sea.</p>",
            "faqs": [{"q": "What is the time frame?", "a": "From Fajr until sunrise is the optimal time."}],
            "refs": ["Hisnul Muslim", "Sahih Muslim"]
        },
        "tr": {
            "summary": "Güne zikirle başlamanın önemi.",
            "tldr": "Güne Sünnet olan Zikirlerle başlamak koruma ve bereket sağlar.",
            "body": "<p>Sabah Zikirleri (Sabah namazından sonra) mümin için bir kalkandır. 100 kere 'Sübhanallahi ve bihamdihi' demek, günahlar deniz köpüğü kadar olsa bile siler.</p>",
            "faqs": [{"q": "Zaman aralığı nedir?", "a": "Fecr'den (İmsak) güneş doğumuna kadar olan vakit en faziletlisidir."}],
            "refs": ["Hisnu'l Müslim", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "أهمية بدء اليوم بذكر الله.",
            "tldr": "بدء اليوم بالأذكار المسنونة يوفر الحفظ والبركة.",
            "body": "<p>أذكار الصباح (بعد الفجر) هي درع للمؤمن. قول 'سبحان الله وبحمده' 100 مرة يمحو الخطايا ولو كانت مثل زبد البحر.</p>",
            "faqs": [{"q": "ما هو وقتها؟", "a": "من الفجر حتى شروق الشمس هو الوقت الأمثل."}],
            "refs": ["حصن المسلم", "صحيح مسلم"]
        },
        "fr": {
            "summary": "L'importance de commencer la journée par le rappel.",
            "tldr": "Commencer la journée avec les Adhkar Masnun apporte protection et barakah.",
            "body": "<p>Les Adhkar du matin (après le Fajr) sont un bouclier pour le croyant. Réciter 'Subhanallahi wa bihamdihi' 100 fois efface les péchés même s'ils sont comme l'écume de la mer.</p>",
            "faqs": [{"q": "Quel est le créneau horaire ?", "a": "Du Fajr jusqu'au lever du soleil est le moment optimal."}],
            "refs": ["Hisnul Muslim", "Sahih Muslim"]
        },
        "id": {
            "summary": "Pentingnya memulai hari dengan dzikir.",
            "tldr": "Memulai hari dengan Dzikir Masnun memberikan perlindungan dan keberkahan.",
            "body": "<p>Dzikir Pagi (setelah Subuh) adalah perisai bagi orang mukmin. Membaca 'Subhanallahi wa bihamdihi' 100 kali menghapus dosa meskipun sebanyak buih di lautan.</p>",
            "faqs": [{"q": "Kapan waktunya?", "a": "Dari Subuh hingga matahari terbit adalah waktu yang optimal."}],
            "refs": ["Hisnul Muslim", "Sahih Muslim"]
        }
    },
    "istighfar-benefits": {
        "en": {
            "summary": "The amazing doors opened by seeking forgiveness (Istighfar).",
            "tldr": "Istighfar brings sustenance, strength, and joy to the heart by removing the burden of sins.",
            "body": "<p>Seeking forgiveness (Istighfar) is a powerful act that cleanses the soul and attracts Allah's mercy. Allah says in the Quran: 'Ask forgiveness of your Lord... He will send [rain from] the sky upon you in abundance and give you increase in wealth and children' (71:10-12). This verse highlights that spiritual repentance has physical manifestations in our daily lives, such as sustenance, strength, and ease. The Prophet (PBUH) used to seek forgiveness more than seventy times a day, teaching us that no matter our state, we are always in need of Allah's pardon. Constant Istighfar opens locked doors and provides a way out from every distress.</p>",
            "faqs": [
                {"q": "What is the best form of Istighfar?", "a": "Sayyid-ul-Istighfar is the most superior form. If recited with sincerity during the day and one dies before evening, or at night and one dies before morning, they will be among the people of Paradise (Sahih Bukhari)."},
                {"q": "When is the best time for Istighfar?", "a": "While it can be done anytime, the time before Fajr (Suhoor) is especially praised in the Quran."}
            ],
            "refs": ["Surah Nuh (71:10-12)", "Sahih Bukhari", "Sunan Ibn Majah"]
        },
        "tr": {
            "summary": "Bağışlanma dilemenin (İstiğfar) açtığı mucizevi kapılar.",
            "tldr": "İstiğfar, günahların yükünü kaldırarak rızık, güç ve kalbe ferahlık getirir.",
            "body": "<p>Bağışlanma dilemek (İstiğfar), ruhu temizleyen ve Allah'ın rahmetini celbeden güçlü bir ibadettir. Allah Kuran'da şöyle buyurur: 'Rabbinizden bağışlanma dileyin... Size gökten bol bol yağmur indirsin, mallarınızı ve oğullarınızı çoğaltsın' (Nuh 71:10-12). Bu ayet, manevi tövbenin günlük hayatımızda rızık, güç ve kolaylık gibi maddi yansımaları olduğunu vurgular. Peygamber Efendimiz (S.A.V), günde yetmişten fazla kez istiğfar ederek, durumumuz ne olursa olsun her zaman Allah'ın affına muhtaç olduğumuzu bize öğretmiştir. Sürekli istiğfar, kilitli kapıları açar ve her türlü sıkıntıdan bir çıkış yolu sağlar.</p>",
            "faqs": [
                {"q": "İstiğfarın en iyi şekli nedir?", "a": "Seyyidül İstiğfar duası en üstün olanıdır. Kim bunu inanarak gündüz okur da akşam olmadan ölürse veya gece okur da sabah olmadan ölürse cennetlik olur (Sahih-i Buhari)."},
                {"q": "İstiğfar için en faziletli vakit hangisidir?", "a": "Her zaman yapılabilir ancak seher vakitleri (Fecirden önce) Kuran'da özellikle övülmüştür."}
            ],
            "refs": ["Nuh Suresi (71:10-12)", "Sahih-i Buhari", "İbn Mace"]
        },
        "ar": {
            "summary": "الأبواب العجيبة التي يفتحها الاستغفار في حياة المؤمن.",
            "tldr": "الاستغفار يجلب الرزق والقوة والفرح للقلب ويزيل هموم الدنيا والآخرة.",
            "body": "<p>الاستغفار هو مفتاح الأمان وطريق الرزق الكريم. قال الله تعالى في محكم تنزيله: 'اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ وَيَجْعَل لَّكُمْ جَنَّاتٍ وَيَجْعَل لَّكُمْ أَنْهَارًا' (نوح 10-12). تبين هذه الآيات العظيمة أن التوبة الروحية لها آثار مادية ملموسة في حياتنا، من سعة في الرزق وقوة في البدن. وكان النبي صلى الله عليه وسلم يستغفر الله في اليوم أكثر من سبعين مرة، ليؤكد لنا أننا في حاجة دائمة لعفو الله. الاستغفار المستمر يفتح المغاليق ويجعل للمسلم من كل هم فرجاً ومن كل ضيق مخرجاً.</p>",
            "faqs": [
                {"q": "ما هي أفضل صيغة للاستغفار؟", "a": "سيد الاستغفار هو أفضل الصيغ قاطبة. من قاله موقناً به في النهار فمات قبل المساء، أو في الليل فمات قبل الصباح، فهو من أهل الجنة (رواه البخاري)."},
                {"q": "ما هو أفضل وقت للاستغفار؟", "a": "الاستغفار مشروع في كل وقت، لكن وقت السحر (قبل الفجر) له مزية خاصة ذكرها الله في كتابه."}
            ],
            "refs": ["سورة نوح (10-12)", "صحيح البخاري", "سنن ابن ماجه"]
        },
        "fr": {
            "summary": "Les portes étonnantes ouvertes par la demande de pardon (Istighfar).",
            "tldr": "L'Istighfar apporte subsistance, force et joie au cœur en éliminant le poids des péchés.",
            "body": "<p>La demande de pardon (Istighfar) est un acte puissant qui purifie l'âme et attire la miséricorde d'Allah. Allah dit dans le Coran : 'Implorez le pardon de votre Seigneur... Il enverra sur vous du ciel une pluie abondante et vous accordera une augmentation de richesses et d'enfants' (71:10-12). Ce verset souligne que le repentir spirituel a des manifestations physiques dans notre vie quotidienne, telles que la subsistance, la force et la facilité. Le Prophète (PSL) avait l'habitude de demander pardon plus de soixante-dix fois par jour, nous enseignant que quel que soit notre état nous avons toujours besoin du pardon d'Allah. Un Istighfar constant ouvre les portes verrouillées et offre une issue à toute détresse.</p>",
            "faqs": [
                {"q": "Quelle est la meilleure forme d'Istighfar ?", "a": "Sayyid-ul-Istighfar est la forme la plus supérieure. Si récité avec sincérité le jour et que l'on meurt avant le soir, ou la nuit et que l'on meurt avant le matin, on sera parmi les gens du Paradis (Sahih Al-Bukhari)."},
                {"q": "Quel est le meilleur moment pour l'Istighfar ?", "a": "Bien qu'il puisse être fait à tout moment, le moment avant le Fajr (Suhoor) est particulièrement loué dans le Coran."}
            ],
            "refs": ["Sourate Nuh (71:10-12)", "Sahih Al-Bukhari", "Ibn Majah"]
        },
        "id": {
            "summary": "Pintu-pintu menakjubkan yang dibuka dengan memohon ampunan (Istighfar).",
            "tldr": "Istighfar mendatangkan rezeki, kekuatan, dan kegembiraan di hati dengan menghapus beban dosa.",
            "body": "<p>Memohon ampunan (Istighfar) adalah amal mulia yang mensucikan jiwa dan menarik rahmat Allah. Allah berfirman dalam Al-Quran: 'Mohonlah ampun kepada Tuhanmu... Niscaya Dia akan mengirimkan hujan kepadamu dengan lebat, dan membanyakkan harta dan anak-anakmu' (71:10-12). Ayat ini menegaskan bahwa taubat secara spiritual memiliki dampak nyata dalam kehidupan kita sehari-hari, seperti kelapangan rezeki, kekuatan, dan kemudahan. Rasulullah (SAW) biasa beristighfar lebih dari tujuh puluh kali dalam sehari, mengajarkan kepada kita bahwa apa pun keadaan kita, kita selalu membutuhkan ampunan Allah. Istighfar yang terus-menerus akan membuka pintu yang terkunci dan memberikan jalan keluar dari setiap kesempitan.</p>",
            "faqs": [
                {"q": "Apa bentuk Istighfar yang terbaik?", "a": "Sayyidul Istighfar adalah bentuk yang paling utama. Jika dibaca dengan yakin di siang hari lalu meninggal sebelum sore, atau di malam hari lalu meninggal sebelum pagi, maka ia termasuk penduduk Surga (Sahih Bukhari)."},
                {"q": "Kapan waktu terbaik untuk Istighfar?", "a": "Istighfar bisa dilakukan kapan saja, namun waktu sepertiga malam terakhir (sebelum Subuh) sangat dipuji dalam Al-Quran."}
            ],
            "refs": ["Surah Nuh (71:10-12)", "Sahih Bukhari", "Sunan Ibnu Majah"]
        }
    },
    "salawat-importance": {
        "en": {
            "summary": "The immense blessings of sending peace and blessings upon Prophet Muhammad (PBUH).",
            "tldr": "Sending Salawat upon the Prophet (PBUH) is a direct command from Allah and a cause for divine mercy, forgiveness of sins, and elevation of status.",
            "body": "<p>Sending peace and blessings upon Prophet Muhammad (PBUH) is a unique command from Allah, where He Himself and His angels perform the act before commanding the believers. Allah says: 'Indeed, Allah and His angels send blessings upon the Prophet. O you who have believed, ask [Allah to confer] blessing upon him and ask [Allah to grant him] peace.' (33:56). The Prophet (PBUH) said: 'Whoever sends blessings upon me once, Allah will send blessings upon him tenfold, erase ten sins, and raise him ten degrees' (An-Nasa'i). It is a proven means of having one's needs met and removing grief from the heart.</p>",
            "faqs": [
                {"q": "What is the best form of Salawat?", "a": "Salat al-Ibrahimiyyah (the prayer recited during the Tashahhud in Salah) is considered the most complete and virtuous form."},
                {"q": "When is the most recommended time for Salawat?", "a": "Friday is the most recommended day, as the Prophet (PBUH) asked us to increase Salawat upon him on this day."}
            ],
            "refs": ["Surah Al-Ahzab (33:56)", "Sunan An-Nasa'i", "Sahih Muslim"]
        },
        "tr": {
            "summary": "Hz. Muhammed'e (S.A.V) salat ve selam getirmenin muazzam bereketi.",
            "tldr": "Efendimize (S.A.V) salavat getirmek Allah'ın emridir; ilahi rahmete, günahların affına ve manevi derecelerin yükselmesine vesiledir.",
            "body": "<p>Peygamber Efendimiz (S.A.V) üzerine salat ve selam getirmek, Allah'ın müminlere emretmeden önce Kendisinin ve meleklerinin bizzat yaptığı eşsiz bir ibadettir. Allah şöyle buyurur: 'Şüphesiz Allah ve melekleri Peygamber’e salât ediyorlar. Ey iman edenler! Siz de ona salât edin, selam edin.' (Ahzab 33:56). Peygamberimiz (S.A.V) şöyle buyurmuştur: 'Kim bana bir kez salâtüselâm getirirse, Allah ona on kez rahmet eder, on günahını siler ve derecesini on kat yükseltir' (Nesai). Salavat, duaların kabulüne, kederin giderilmesine ve dünya-ahiret ihtiyaçlarının karşılanmasına vesiledir.</p>",
            "faqs": [
                {"q": "En faziletli salavat hangisidir?", "a": "Namazlarda Tahiyyattan sonra okunan 'Salli-Barik' (Salat-ı İbrahimiyye) duaları en kamil ve en faziletli olanıdır."},
                {"q": "Salavat getirmek için en özel zaman ne zamandır?", "a": "Cuma günü en faziletli zamandır; Efendimiz bu günde kendisine salavatın artırılmasını istemiştir."}
            ],
            "refs": ["Ahzab Suresi (33:56)", "Nesai", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "البركات العظيمة والمزايا الجليلة للصلاة والسلام على النبي محمد (صلى الله عليه وسلم).",
            "tldr": "الصلاة على النبي (صلى الله عليه وسلم) أمر إلهي مباشر، وهي سبب لنزول الرحمات ومغفرة الذنوب ورفعة الدرجات في الدنيا والآخرة.",
            "body": "<p>الصلاة والسلام على النبي صلى الله عليه وسلم عبادة جليلة تفردت بأن الله سبحانه بدأ بها بنفسه وثنى بملائكته ثم أمر بها المؤمنين، فقال تعالى: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا' (الأحزاب 56). وقال النبي صلى الله عليه وسلم: 'من صلى عليّ صلاة واحدة صلى الله عليه بها عشراً، وحط عنه عشر خطيئات، ورفع له عشر درجات' (رواه النسائي). وهي من أعظم أسباب كفاية الهم وغفران الذنب واستجابة الدعاء.</p>",
            "faqs": [
                {"q": "ما هي أفضل صيغة للصلاة على النبي؟", "a": "الصلاة الإبراهيمية (التي تقرأ في التشهد الأخير من الصلاة) هي أكمل وأفضل الصيغ التي علمنا إياها النبي صلى الله عليه وسلم."},
                {"q": "متى يستحب الإكثار من الصلاة على النبي؟", "a": "يستحب في كل وقت، ويتأكد في يوم الجمعة وليلتها، وفي الصباح والمسا وحين ذكر اسمه الكريم."}
            ],
            "refs": ["سورة الأحزاب (56)", "سنن النسائي", "صحيح مسلم"]
        },
        "fr": {
            "summary": "Les immenses bénédictions d'envoyer la paix et les bénédictions sur le Prophète Muhammad (PSL).",
            "tldr": "Envoyer des Salawat sur le Prophète (PSL) est un commandement direct d'Allah et une cause de miséricorde divine, de pardon des péchés et d'élévation du statut.",
            "body": "<p>Envoyer la paix et les bénédictions sur le Prophète Muhammad (PSL) est un commandement unique d'Allah, où Lui-même et Ses anges accomplissent l'acte avant de l'ordonner aux croyants. Allah dit : 'Certes, Allah et Ses Anges prient sur le Prophète ; ô vous qui croyez priez sur lui et adressez [lui] vos salutations.' (33:56). Le Prophète (PSL) a dit : 'Quiconque prie sur moi une fois, Allah priera sur lui dix fois, lui effacera dix péchés et l'élèvera de dix degrés' (An-Nasa'i). C'est un moyen prouvé de voir ses besoins satisfaits et d'éliminer le chagrin du cœur.</p>",
            "faqs": [
                {"q": "Quelle est la meilleure forme de Salawat ?", "a": "La Salat al-Ibrahimiyyah (la prière récitée pendant le Tashahhud dans la Salah) est considérée comme la forme la plus complète et la plus vertueuse."},
                {"q": "Quel est le moment le plus recommandé pour la Salawat ?", "a": "Le vendredi est le jour le plus recommandé, car le Prophète (PSL) nous a demandé d'augmenter les Salawat sur lui ce jour-là."}
            ],
            "refs": ["Sourate Al-Ahzab (33:56)", "Sunan An-Nasa'i", "Sahih Muslim"]
        },
        "id": {
            "summary": "Berkah yang sangat besar dari bershalawat kepada Nabi Muhammad (SAW).",
            "tldr": "Bershalawat kepada Nabi (SAW) adalah perintah langsung dari Allah dan sebab datangnya rahmat ilahi, ampunan dosa, serta pengangkatan derajat.",
            "body": "<p>Bershalawat kepada Nabi Muhammad (SAW) adalah ibadah unik yang diperintahkan Allah, di mana Dia sendiri dan para malaikat-Nya melakukan amal tersebut sebelum memerintahkannya kepada orang-orang beriman. Allah berfirman: 'Sesungguhnya Allah dan malaikat-malaikat-Nya bershalawat untuk Nabi. Hai orang-orang yang beriman, bershalawatlah kamu untuk Nabi dan ucapkanlah salam penghormatan kepadanya.' (33:56). Nabi (SAW) bersabda: 'Barangsiapa bershalawat kepadaku satu kali, Allah akan bershalawat kepadanya sepuluh kali, menghapus sepuluh dosa, dan mengangkat sepuluh derajatnya' (An-Nasa'i). Shalawat adalah sarana terkabulnya hajat dan penghilang kesedihan di hati.</p>",
            "faqs": [
                {"q": "Apa bentuk shalawat yang terbaik?", "a": "Shalawat Ibrahimiyah (doa yang dibaca saat Tasyahud dalam shalat) dianggap sebagai bentuk yang paling sempurna dan utama."},
                {"q": "Kapan waktu yang paling dianjurkan untuk bershalawat?", "a": "Hari Jumat adalah hari yang paling dianjurkan, sebagaimana Nabi (SAW) meminta kita untuk memperbanyak shalawat kepadanya di hari tersebut."}
            ],
            "refs": ["Surah Al-Ahzab (33:56)", "Sunan An-Nasa'i", "Sahih Muslim"]
        }
    },
    "sleep-adhkar": {
        "en": {
            "summary": "Authentic Sunnah Adhkar to recite before sleeping for divine protection and inner peace.",
            "tldr": "Reciting Ayatul Kursi, the last two verses of Al-Baqarah, and the three Schutzsuras (Quls) provides protection from Shaytan and ensures a spiritually safe sleep.",
            "body": "<p>Following the Sunnah before sleeping ensures that your night is spent in the protection of Allah. The Prophet (PBUH) taught us to cup our hands together, recite Surah Al-Ikhlas, Al-Falaq, and An-Nas, blow into the hands, and then wipe over as much of the body as possible, starting with the head and face (repeating this 3 times). Additionally, reciting Ayatul Kursi before sleeping ensures a guardian from Allah stays with you, and no Shaytan can approach you until morning. The Prophet (PBUH) also said: 'Whoever recites the last two verses of Al-Baqarah at night, they will suffice him' (Sahih Bukhari), meaning they protect him from harm or represent a night's worth of worship.</p>",
            "faqs": [
                {"q": "What if I can't recite everything?", "a": "Start with the 'Three Quls' and 'Ayatul Kursi' as they are the primary means of protection mentioned in the Sunnah."},
                {"q": "Is it okay to recite while lying down?", "a": "Yes, it is permissible and encouraged to finish your Adhkar while lying on your right side, as was the practice of the Prophet (PBUH)."}
            ],
            "refs": ["Sahih Bukhari", "Sahih Muslim", "Hisnul Muslim"]
        },
        "tr": {
            "summary": "İlahi korunma ve iç huzur için uykudan önce okunacak Sünnet Zikirleri.",
            "tldr": "Ayetel Kürsi, Bakara'nın son iki ayeti ve üç ihlas-felak-nas surelerini okumak Şeytan'dan korur ve manevi olarak güvenli bir uyku sağlar.",
            "body": "<p>Uyumadan önce Sünneti takip etmek, gecenizin Allah'ın koruması altında geçmesini sağlar. Peygamber Efendimiz (S.A.V), ellerini birleştirip İhlas, Felak ve Nas surelerini okumayı, ellere üfleyip ardından baş ve yüzden başlayarak vücudun ulaşabildiği her yerine sürmeyi (bunu 3 kez tekrarlayarak) öğretmiştir. Ayrıca, uyumadan önce Ayetel Kürsi okumak, sabaha kadar Allah katından bir koruyucunun yanınızda kalmasını sağlar ve hiçbir Şeytan size yaklaşamaz. Peygamberimiz (S.A.V) ayrıca şöyle buyurmuştur: 'Kim gece Bakara suresinin son iki ayetini (Amenerrasulü) okursa, bunlar ona kafi gelir' (Sahih-i Buhari). Bu, hem kötülüklerden korunma hem de o geceki ibadet sevabı adına yeterli görüleceği anlamına gelir.</p>",
            "faqs": [
                {"q": "Hepsini okuyamazsam ne olur?", "a": "En azından 'Üç Kulu' (İhlas, Felak, Nas) ve 'Ayetel Kürsi' ile başlayın, çünkü bunlar Sünnette zikredilen temel korunma yollarıdır."},
                {"q": "Yatarak okumak caiz mi?", "a": "Evet, Peygamberimizin uygulaması olduğu üzere, sağ tarafınıza uzanmış halde zikirlerinizi tamamlamanız hem caiz hem de tavsiye edilir."}
            ],
            "refs": ["Sahih-i Buhari", "Sahih-i Müslim", "Hisnül Müslim"]
        },
        "ar": {
            "summary": "أذكار السنة الصحيحة قبل النوم للحفظ الإلهي والسكينة النفسية.",
            "tldr": "قراءة آية الكرسي، وخواتيم سورة البقرة، والمعوذات تجلب الحفظ من الشيطان وتضمن نوماً هانئاً في جوار الله.",
            "body": "<p>اتباع السنة قبل النوم يضمن أن تقضي ليلتك في حفظ الله ورعايته. كان النبي صلى الله عليه وسلم إذا أوى إلى فراشه كل ليلة جمع كفيه ثم نفث فيهما فقرأ فيهما: 'قل هو الله أحد' و'قل أعوذ برب الفلق' و'قل أعوذ برب الناس'، ثم يمسح بهما ما استطاع من جسده، يبدأ بهما على رأسه ووجهه وما أقبل من جسده (يفعل ذلك 3 مرات). كما أن قراءة آية الكرسي قبل النوم تجعل لك من الله حافظاً ولا يقربك شيطان حتى تصبح. وقال النبي صلى الله عليه وسلم: 'من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه' (رواه البخاري)، أي كفتاه من كل سوء أو كفتاه عن قيام الليل.</p>",
            "faqs": [
                {"q": "ماذا لو لم أستطع قراءة كل الأذكار؟", "a": "ابدأ بالمعوذات وآية الكرسي، فهي أهم ما ورد في السنة للحفظ قبل النوم."},
                {"q": "هل يجوز القراءة وأنا مستلقٍ؟", "a": "نعم، يجوز بل يستحب أن تختم أذكارك وأنت مضطجع على شقك الأيمن كما كان يفعل النبي صلى الله عليه وسلم."}
            ],
            "refs": ["صحيح البخاري", "صحيح مسلم", "حصن المسلم"]
        },
        "fr": {
            "summary": "Adhkar authentiques de la Sunna à réciter avant de dormir pour la protection divine et la paix intérieure.",
            "tldr": "Réciter Ayatul Kursi, les deux derniers versets d'Al-Baqarah et les trois sourates protectrices (Quls) apporte une protection contre Shaytan et assure un sommeil spirituellement sûr.",
            "body": "<p>Suivre la Sunna avant de dormir garantit que votre nuit se passe sous la protection d'Allah. Le Prophète (PSL) nous a enseigné de joindre nos mains, de réciter les sourates Al-Ikhlas, Al-Falaq et An-Nas, de souffler dedans, puis de les passer sur tout le corps, en commençant par la tête et le visage (en répétant cela 3 fois). De plus, réciter Ayatul Kursi avant de dormir assure qu'un gardien d'Allah reste avec vous, et aucun Shaytan ne peut vous approcher jusqu'au matin. Le Prophète (PSL) a aussi dit : 'Quiconque récite les deux derniers versets d'Al-Baqarah la nuit, ils lui suffiront' (Sahih Al-Bukhari), ce qui signifie qu'ils le protègent du mal ou représentent la valeur d'une nuit d'adoration.</p>",
            "faqs": [
                {"q": "Et si je ne peux pas tout réciter ?", "a": "Commencez par les 'Trois Quls' et 'Ayatul Kursi' car ce sont les principaux moyens de protection mentionnés dans la Sunna."},
                {"q": "Est-il permis de réciter en étant allongé ?", "a": "Oui, il est permis et encouragé de terminer vos Adhkar en étant allongé sur le côté droit, comme c'était la pratique du Prophète (PSL)."}
            ],
            "refs": ["Sahih Al-Bukhari", "Sahih Muslim", "La Citadelle du Musulman"]
        },
        "id": {
            "summary": "Dzikir Sunnah otentik sebelum tidur untuk perlindungan ilahi dan ketenangan batin.",
            "tldr": "Membaca Ayat Kursi, dua ayat terakhir Al-Baqarah, dan tiga surat perlindungan (Al-Ikhlas, Al-Falaq, An-Nas) memberikan perlindungan dari Setan dan menjamin tidur yang aman secara spiritual.",
            "body": "<p>Mengikuti Sunnah sebelum tidur memastikan malam Anda dilewati dalam perlindungan Allah. Rasulullah (SAW) mengajarkan kita untuk menangkupkan kedua tangan, membaca surat Al-Ikhlas, Al-Falaq, dan An-Nas, meniupkannya ke telapak tangan, lalu mengusapkannya ke seluruh tubuh yang dapat dijangkau, dimulai dari kepala dan wajah (ulangi 3 kali). Selain itu, membaca Ayat Kursi sebelum tidur memastikan ada penjaga dari Allah yang menyertai Anda, dan tidak ada Setan yang bisa mendekat hingga pagi hari. Nabi (SAW) juga bersabda: 'Barangsiapa membaca dua ayat terakhir surat Al-Baqarah di malam hari, maka itu sudah mencukupinya' (Sahih Bukhari), yang berarti melindunginya dari keburukan atau setara dengan ibadah sepanjang malam.</p>",
            "faqs": [
                {"q": "Bagaimana jika saya tidak bisa membaca semuanya?", "a": "Mulailah dengan 'Tiga Qul' dan 'Ayat Kursi' karena keduanya adalah sarana perlindungan utama yang disebutkan dalam Sunnah."},
                {"q": "Bolehkah berdzikir sambil berbaring?", "a": "Ya, diperbolehkan dan dianjurkan untuk menyelesaikan dzikir Anda sambil berbaring di sisi kanan, sebagaimana praktik Nabi (SAW)."}
            ],
            "refs": ["Sahih Bukhari", "Sahih Muslim", "Hisnul Muslim"]
        }
    },
    "dhikr-for-peace": {
        "en": {
            "summary": "Specific Dhikrs to calm the heart, remove anxiety, and restore inner tranquility.",
            "tldr": "The remembrance of Allah is the only true source of permanent peace. Reciting the Dua of Yunus (AS) removes deep distress.",
            "body": "<p>'Unquestionably, by the remembrance of Allah hearts are assured.' (13:28). In a world full of distractions and stress, Dhikr serves as a spiritual anchor. The Dua of Prophet Yunus (AS) inside the whale: 'La ilaha illa Anta Subhanaka inni kuntu minaz-zalimin' (There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers) is a powerful remedy. The Prophet (PBUH) stated that no Muslim supplicates with this Dua for anything except that Allah answers him. Focusing on 'Hasbunallahu wa ni'mal wakil' (Sufficient for us is Allah, and He is the best Disposer of affairs) also shifts the burden of worry from the believer to the Creator.</p>",
            "faqs": [
                {"q": "How many times should I repeat these?", "a": "There is no fixed limit for these general dhikrs. The most important thing is to say them with presence of heart and reflection on their meaning."},
                {"q": "Can Dhikr help with clinical anxiety?", "a": "Dhikr provides immense spiritual support, but seeking medical or psychological treatment is also a form of following the Sunnah (taking the means)."}
            ],
            "refs": ["Surah Ar-Ra'd (13:28)", "Sunan At-Tirmidhi", "Surah Al-Anbiya (21:87)"]
        },
        "tr": {
            "summary": "Kalbi sakinleştirmek, kaygıyı gidermek ve iç huzuru yeniden kazanmak için özel Zikirler.",
            "tldr": "Allah'ı zikretmek kalıcı huzurun tek gerçek kaynağıdır. Hz. Yunus'un (A.S) duasını okumak derin sıkıntıları giderir.",
            "body": "<p>'Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur.' (Ra'd 13:28). Dikkat dağıtıcı unsurlar ve stresle dolu bir dünyada zikir, manevi bir demirleme noktası görevi görür. Hz. Yunus'un (A.S) balığın karnındayken yaptığı: 'La ilahe illa Ente Sübhaneke inni küntü minezzalimin' (Senden başka ilah yoktur, Seni tenzih ederim. Şüphesiz ben zalimlerden oldum) duası güçlü bir şifadır. Peygamberimiz (S.A.V), bir Müslümanın bu dua ile yaptığı hiçbir talebin Allah tarafından geri çevrilmeyeceğini belirtmiştir. Ayrıca 'Hasbünallahu ve ni'mel vekil' (Allah bize yeter, O ne güzel vekildir) zikrine odaklanmak, endişe yükünü kuldan alıp Yaradan'a tevdi eder.</p>",
            "faqs": [
                {"q": "Bunları kaç kez tekrarlamalıyım?", "a": "Bu genel zikirler için sabit bir sınır yoktur. En önemli olan kalbi huzurla ve anlamını düşünerek söylemektir."},
                {"q": "Zikir klinik kaygıya yardımcı olur mu?", "a": "Zikir muazzam bir manevi destek sağlar, ancak tıbbi veya psikolojik tedavi aramak da Sünnete uygun bir şekilde sebeplere sarılmaktır."}
            ],
            "refs": ["Ra'd Suresi (13:28)", "Tirmizi", "Enbiya Suresi (21:87)"]
        },
        "ar": {
            "summary": "أذكار مخصوصة لتهدئة القلب ولطرد القلق واستعادة السكينة الداخلية.",
            "tldr": "ذكر الله هو المصدر الحقيقي الوحيد للسلام الدائم. قول دعاء ذي النون يزيل الكروب العظيمة.",
            "body": "<p>'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ' (الرعد 28). في عالم مليء بالمشوشات والضغوط، يعمل الذكر كمرساة روحية للنفس. دعاء نبي الله يونس عليه السلام (ذا النون) في بطن الحوت: 'لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ' هو علاج قوي للهم. فقد أخبر النبي صلى الله عليه وسلم أنه ما دعا بها رجل مسلم في شيء قط إلا استجاب الله له. كما أن التركيز على قول 'حسبنا الله ونعم الوكيل' ينقل عبء القلق من العبد إلى الخالق، مما يورث راحة وتسليماً لا مثيل لهما.</p>",
            "faqs": [
                {"q": "كم مرة يجب أن أكرر هذه الأذكار؟", "a": "لا يوجد عدد محدد لهذه الأذكار العامة، والأهم هو قولها بحضور قلب وتدبر في معانيها العميقة."},
                {"q": "هل يساعد الذكر في حالات القلق المرضي؟", "a": "يوفر الذكر دعماً روحياً هائلاً، لكن طلب العلاج الطبي أو النفسي هو أيضاً من اتباع السنة والأخذ بالأسباب."}
            ],
            "refs": ["سورة الرعد (28)", "سنن الترمذي", "سورة الأنبياء (87)"]
        },
        "fr": {
            "summary": "Dhikrs spécifiques pour calmer le cœur, éliminer l'anxiété et restaurer la tranquillité intérieure.",
            "tldr": "Le rappel d'Allah est la seule véritable source de paix permanente. Réciter la Doua de Yunus (AS) élimine la détresse profonde.",
            "body": "<p>'N'est-ce pas par l'évocation d'Allah que se tranquillisent les cœurs ?' (13:28). Dans un monde plein de distractions et de stress, le Dhikr sert d'ancre spirituelle. La Doua du Prophète Yunus (AS) à l'intérieur de la baleine : 'La ilaha illa Anta Subhanaka inni kuntu minaz-zalimin' (Pas de divinité à part Toi ! Pureté à Toi ! J'ai été vraiment du nombre des injustes) est un remède puissant. Le Prophète (PSL) a déclaré qu'aucun musulman ne supplie avec cette Doua pour quoi que ce soit sans qu'Allah ne l'exauce. Se concentrer sur 'Hasbunallahu wa ni'mal wakil' (Allah nous suffit; Il est notre meilleur garant) déplace également le fardeau de l'inquiétude du croyant vers le Créateur.</p>",
            "faqs": [
                {"q": "Combien de fois dois-je répéter cela ?", "a": "Il n'y a pas de limite fixe pour ces dhikrs généraux. L'essentiel est de les dire avec présence de cœur et réflexion sur leur sens."},
                {"q": "Le Dhikr peut-il aider contre l'anxiété clinique ?", "a": "Le Dhikr apporte un soutien spirituel immense, mais chercher un traitement médical ou psychologique est aussi une forme de suivi de la Sunna (prendre les moyens)."}
            ],
            "refs": ["Sourate Ar-Ra'd (13:28)", "Tirmidhi", "Sourate Al-Anbiya (21:87)"]
        },
        "id": {
            "summary": "Dzikir khusus untuk menenangkan hati, menghilangkan kecemasan, dan mengembalikan ketenangan batin.",
            "tldr": "Mengingat Allah adalah satu-satunya sumber kedamaian sejati yang kekal. Membaca Doa Yunus (AS) menghilangkan kesusahan yang mendalam.",
            "body": "<p>'Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram.' (13:28). Di dunia yang penuh dengan gangguan dan stres, Dzikir berfungsi sebagai sauh spiritual. Doa Nabi Yunus (AS) di dalam perut ikan: 'La ilaha illa Anta Subhanaka inni kuntu minaz-zalimin' (Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim) adalah obat yang ampuh. Nabi (SAW) menyatakan bahwa tidaklah seorang Muslim berdoa dengan doa ini kecuali Allah akan mengabulkannya. Berfokus pada 'Hasbunallahu wa ni'mal wakil' (Cukuplah Allah bagi kami dan Dia adalah sebaik-baik pelindung) juga memindahkan beban kekhawatiran dari hamba ke Sang Pencipta.</p>",
            "faqs": [
                {"q": "Berapa kali saya harus mengulanginya?", "a": "Tidak ada batasan pasti untuk dzikir umum ini. Yang terpenting adalah mengucapkannya dengan kehadiran hati dan perenungan maknanya."},
                {"q": "Apakah Dzikir bisa membantu kecemasan klinis?", "a": "Dzikir memberikan dukungan spiritual yang luar biasa, namun mencari pengobatan medis atau psikologis juga merupakan bentuk mengikuti Sunnah (berikhtiar)."}
            ],
            "refs": ["Surah Ar-Ra'd (13:28)", "Tirmidzi", "Surah Al-Anbiya (21:87)"]
        }
    },
    "ayatul-kursi-benefits": {
        "en": {
            "summary": "The greatest verse in the Quran and its profound protective benefits.",
            "tldr": "Ayatul Kursi (2:255) describes Allah's absolute authority. Reading it protects from devils, brings peace, and is a path to Paradise.",
            "body": "<p>The Prophet (PBUH) designated Ayatul Kursi as the greatest verse in the Book of Allah. It contains Allah's Greatest Name and describes His perfect attributes, such as Al-Hayy (The Living) and Al-Qayyum (The Sustainer). The Prophet (PBUH) said: 'Whoever recites Ayatul Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death' (An-Nasa'i). It is the strongest spiritual protection; when recited before sleep, a guardian from Allah is appointed for the person, and no devil can approach them until morning. Its recitation constanty reminds the believer of Allah's encompassing knowledge and power.</p>",
            "faqs": [
                {"q": "Why is it the greatest verse?", "a": "Because it purely describes the oneness (Tawheed) of Allah, His Names, and His absolute sovereignty over the heavens and the earth without any partner."},
                {"q": "When should I recite it?", "a": "Recommended times include after every Fard (obligatory) prayer, in the morning and evening Adhkar, and right before sleeping."}
            ],
            "refs": ["Sahih Muslim", "Sunan An-Nasa'i", "Surah Al-Baqarah (2:255)"]
        },
        "tr": {
            "summary": "Kuran'daki en büyük ayet ve onun derin koruyucu faziletleri.",
            "tldr": "Ayetel Kürsi (2:255) Allah'ın mutlak otoritesini anlatır. Okumak şeytanlardan korur, huzur verir ve Cennet'e giden bir yoldur.",
            "body": "<p>Peygamber Efendimiz (S.A.V), Ayetel Kürsi'yi Allah'ın Kitabı'ndaki en büyük ayet olarak nitelendirmiştir. İçinde Allah'ın İsm-i Azam'ını barındırır ve El-Hayy (Diri) ile El-Kayyum (Her şeyi ayakta tutan) gibi mükemmel sıfatlarını anlatır. Efendimiz (S.A.V) şöyle buyurmuştur: 'Kim her farz namazın ardından Ayetel Kürsi'yi okursa, onun Cennet'e girmesine ölümden başka bir engel kalmaz' (Nesai). Bu ayet en güçlü manevi korumadır; uykudan önce okunduğunda, Allah katından bir koruyucu görevlendirilir ve sabaha kadar hiçbir şeytan o kişiye yaklaşamaz. Sürekli okunması, müminlere Allah'ın kuşatıcı ilmini ve sonsuz gücünü hatırlatır.</p>",
            "faqs": [
                {"q": "Neden en büyük ayettir?", "a": "Çünkü tamamen Allah'ın birliğini (Tevhid), Esma-ül Hüsna'sını ve gökler ile yer üzerindeki mutlak egemenliğini hiçbir ortağı olmaksızın anlatır."},
                {"q": "Hangi vakitlerde okunmalıdır?", "a": "Her farz namazdan sonra, sabah ve akşam zikirlerinde ve uyumadan hemen önce okunması tavsiye edilmiştir."}
            ],
            "refs": ["Sahih-i Müslim", "Nesai", "Bakara Suresi (2:255)"]
        },
        "ar": {
            "summary": "أعظم آية في كتاب الله وفوائدها الوقائية والروحية العظيمة.",
            "tldr": "آية الكرسي (سورة البقرة: 255) تصف سلطة الله المطلقة وعظمته. قراءتها تحفظ من الشياطين وترفع الدرجات وهي طريق ممهد إلى الجنة.",
            "body": "<p>وصف النبي صلى الله عليه وسلم آية الكرسي بأنها أعظم آية في القرآن الكريم. فهي تشتمل على اسم الله الأعظم وتصف صفات كماله، كالحي والقيوم. قال النبي صلى الله عليه وسلم: 'من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا الموت' (رواه النسائي). وهي أقوى حرز روحي للمسلم؛ فمن قرأها عند النوم عين الله له حافظاً ولم يقربه شيطان حتى يصبح. إن مداومة قراءتها تغرس في نفس المؤمن تعظيم الله واليقين بإحاطة علمه وقدرته بكل شيء في السموات والأرض.</p>",
            "faqs": [
                {"q": "لماذا هي أعظم آية؟", "a": "لأنها تخلصت لوصف توحيد الله، وأسمائه وصفاته، وسلطانه المطلق الذي لا يشاركه فيه أحد."},
                {"q": "متى يستحب قراءتها؟", "a": "يستحب قراءتها دبر كل صلاة مفروضة، وضمن أذكار الصباح والمساء، وعند النوم."}
            ],
            "refs": ["صحيح مسلم", "سنن النسائي", "سورة البقرة (255)"]
        },
        "fr": {
            "summary": "Le plus grand verset du Coran et ses profonds bienfaits protecteurs.",
            "tldr": "Ayatul Kursi (2:255) décrit l'autorité absolue d'Allah. Le lire protège des démons, apporte la paix et est un chemin vers le Paradis.",
            "body": "<p>Le Prophète (PSL) a désigné Ayatul Kursi comme le plus grand verset du Livre d'Allah. Il contient le Plus Grand Nom d'Allah et décrit Ses attributs parfaits, tels que Al-Hayy (Le Vivant) et Al-Qayyum (Le Subsistant). Le Prophète (PSL) a dit : 'Quiconque récite Ayatul Kursi après chaque prière obligatoire, rien ne l'empêche d'entrer au Paradis sauf la mort' (An-Nasa'i). C'est la protection spirituelle la plus forte ; lorsqu'il est récité avant le sommeil, un gardien d'Allah est nommé pour la personne, et aucun diable ne peut l'approcher jusqu'au matin. Sa récitation constante rappelle au croyant la connaissance et la puissance englobantes d'Allah.</p>",
            "faqs": [
                {"q": "Pourquoi est-ce le plus grand verset ?", "a": "Parce qu'il décrit purement l'unicité (Tawheed) d'Allah, Ses Noms et Sa souveraineté absolue sur les cieux et la terre sans aucun associé."},
                {"q": "Quand dois-je le réciter ?", "a": "Les moments recommandés incluent après chaque prière obligatoire (Fard), dans les Adhkar du matin et du soir, et juste avant de dormir."}
            ],
            "refs": ["Sahih Muslim", "Sunan An-Nasa'i", "Sourate Al-Baqarah (2:255)"]
        },
        "id": {
            "summary": "Ayat teragung dalam Al-Quran dan manfaat perlindungannya yang mendalam.",
            "tldr": "Ayat Kursi (2:255) menjelaskan kekuasaan mutlak Allah. Membacanya melindungi dari setan, memberikan ketenangan, dan merupakan jalan menuju Surga.",
            "body": "<p>Rasulullah (SAW) menetapkan Ayat Kursi sebagai ayat paling agung dalam Kitabullah. Di dalamnya terkandung Nama Allah yang Paling Agung dan menjelaskan sifat-sifat-Nya yang sempurna, seperti Al-Hayy (Yang Maha Hidup) dan Al-Qayyum (Yang Maha Mandiri). Nabi (SAW) bersabda: 'Barangsiapa membaca Ayat Kursi setiap selesai shalat fardhu, tidak ada yang menghalanginya masuk Surga kecuali mati' (An-Nasa'i). Ini adalah perlindungan spiritual terkuat; jika dibaca sebelum tidur, Allah akan mengutus penjaga untuknya dan tidak ada Setan yang bisa mendekatinya hingga pagi. Membacanya secara rutin akan mengingatkan mukmin akan ilmu dan kekuasaan Allah yang meliputi segala sesuatu.</p>",
            "faqs": [
                {"q": "Mengapa ini merupakan ayat teragung?", "a": "Karena ayat ini secara murni menjelaskan tentang tauhid (keesaan) Allah, Nama-nama-Nya, dan kedaulatan mutlak-Nya atas langit dan bumi tanpa sekutu."},
                {"q": "Kapan waktu terbaik membacanya?", "a": "Waktu yang dianjurkan meliputi setiap selesai shalat fardhu, dalam dzikir pagi dan petang, serta sesaat sebelum tidur."}
            ],
            "refs": ["Sahih Muslim", "Sunan An-Nasa'i", "Surah Al-Baqarah (2:255)"]
        }
    }

}

# Lifestyle Data
lifestyle_data = {
    "sabr-patience": {
        "en": {
            "summary": "The spiritual art of cultivating patience (Sabr) in the face of life's trials.",
            "tldr": "Sabr is not merely waiting, but maintaining high character and trust in Allah during difficult times.",
            "body": "<p>Allah is with the patient (Innallaha ma'as-sabirin). Sabr is mentioned over 90 times in the Quran, emphasizing its central role in the life of a believer. Scholars categorize Sabr into three types: Sabr in obeying Allah's commands, Sabr in staying away from prohibited acts, and Sabr during difficult trials and calamities. It involves restraining the soul from despair, the tongue from complaining against Allah's decree, and the body from reacting in an un-Islamic manner. The Prophet (PBUH) taught that 'Patience is illumination' (Sahih Muslim), meaning it provides the light needed to navigate the darkness of hardships.</p>",
            "faqs": [
                {"q": "Is crying or feeling sad allowed during Sabr?", "a": "Yes, crying is a natural human emotion and a manifestation of mercy. Sabr is about the heart's submission to Allah's wisdom and not questioning His decree with anger or resentment."},
                {"q": "How can I increase my patience?", "a": "By reflecting on the rewards promised to the patient, reading the stories of the Prophets (like Ayub AS), and engaging in constant Dhikr to keep the heart tranquil."}
            ],
            "refs": ["Surah Al-Baqarah (2:153-155)", "Sahih Muslim", "Surah Az-Zumar (39:10)"]
        },
        "tr": {
            "summary": "Hayatın imtihanları karşısında sabrı (Sabr) geliştirmenin manevi sanatı.",
            "tldr": "Sabır sadece beklemek değil, zor zamanlarda güzel ahlakı ve Allah'a tevekkülü korumaktır.",
            "body": "<p>Allah sabredenlerle beraberdir (İnnallaha ma'as-sabirin). Sabır, Kuran'da 90'dan fazla kez geçerek müminin hayatındaki merkezi rolünü vurgular. Alimler sabrı üç kategoriye ayırır: Allah'ın emirlerine itaatte sabır, günahlardan kaçınmada sabır ve musibetler karşısında sabır. Sabır; nefsi umutsuzluktan, dili Allah'ın takdirine şikayet etmekten ve bedeni İslami olmayan tepkiler vermekten alıkoymayı içerir. Peygamber Efendimiz (S.A.V) 'Sabır ışıktır' (Sahih-i Müslim) buyurarak, sabrın zorlukların karanlığında yolumuzu aydınlatan bir nur olduğunu öğretmiştir.</p>",
            "faqs": [
                {"q": "Sabrederken ağlamak veya üzülmek caiz mi?", "a": "Evet, ağlamak insani bir duygu ve merhametin bir yansımasıdır. Sabır, kalbin Allah'ın hikmetine boyun eğmesi ve O'nun takdirini öfkeyle sorgulamamasıdır."},
                {"q": "Sabrımı nasıl artırabilirim?", "a": "Sabredenlere vaat edilen ödülleri tefekkür ederek, Peygamberlerin (Hz. Eyüp gibi) hayatlarını okuyarak ve kalbi huzurlu tutmak için sürekli zikirle meşgul olarak."}
            ],
            "refs": ["Bakara Suresi (2:153-155)", "Sahih-i Müslim", "Zümer Suresi (39:10)"]
        },
        "ar": {
            "summary": "الفن الروحي لتنمية الصبر الجميل في مواجهة ابتلاءات الحياة.",
            "tldr": "الصبر ليس مجرد الانتظار السلبي، بل هو الحفاظ على مكارم الأخلاق واليقين بالله خلال الأوقات الصعبة.",
            "body": "<p>إن الله مع الصابرين. لقد ورد ذكر الصبر في القرآن الكريم في أكثر من تسعين موضعاً، مما يؤكد مكانته المركزية في حياة المؤمن. يقسم العلماء الصبر إلى ثلاثة أنواع: صبر على طاعة الله، وصبر عن معصية الله، وصبر على الأقدار المؤلمة. والصدق في الصبر يتجلى في حبس النفس عن السخط، واللسان عن الشكوى لغير الله، والجوارح عن فعل ما لا يرضي الله. وقد علمنا النبي صلى الله عليه وسلم أن 'الصبر ضياء' (رواه مسلم)، أي أنه النور الذي يستضيء به المؤمن في ظلمات الكروب والشدائد.</p>",
            "faqs": [
                {"q": "هل البكاء أو الحزن ينافي الصبر؟", "a": "لا، البكاء رحمة فطرية وضعها الله في القلوب. الصبر هو الرضا القلبي وعدم الاعتراض على حكمة الله وحكمه باللسان أو الفعل."},
                {"q": "كيف أقوي ملكة الصبر عندي؟", "a": "عن طريق تدبر الأجر العظيم الذي وعد الله به الصابرين، وقراءة قصص الأنبياء (كأيوب عليه السلام)، والمداومة على ذكر الله لسكينة القلب."}
            ],
            "refs": ["سورة البقرة (153-155)", "صحيح مسلم", "سورة الزمر (10)"]
        },
        "fr": {
            "summary": "L'art spirituel de cultiver la patience (Sabr) face aux épreuves de la vie.",
            "tldr": "Le Sabr n'est pas simplement attendre, mais maintenir un caractère noble et une confiance en Allah pendant les moments difficiles.",
            "body": "<p>Allah est avec les patients (Innallaha ma'as-sabirin). Le Sabr est mentionné plus de 90 fois dans le Coran, soulignant son rôle central dans la vie d'un croyant. Les savants catégorisent le Sabr en trois types : le Sabr dans l'obéissance aux commandements d'Allah, le Sabr dans l'éloignement des actes interdits, et le Sabr pendant les épreuves difficiles et les calamités. Il implique de retenir l'âme du désespoir, la langue de se plaindre du décret d'Allah, et le corps de réagir de manière non islamique. Le Prophète (PSL) a enseigné que 'La patience est une lumière' (Sahih Muslim), signifiant qu'elle fournit la clarté nécessaire pour naviguer dans l'obscurité des épreuves.</p>",
            "faqs": [
                {"q": "Est-il permis de pleurer ou de se sentir triste pendant le Sabr ?", "a": "Oui, pleurer est une émotion humaine naturelle et une manifestation de miséricorde. Le Sabr consiste en la soumission du cœur à la sagesse d'Allah sans remettre en question Son décret avec colère."},
                {"q": "Comment puis-je augmenter ma patience ?", "a": "En réfléchissant aux récompenses promises aux patients, en lisant les histoires des Prophètes (comme Ayub AS), et en s'engageant dans un Dhikr constant pour apaiser le cœur."}
            ],
            "refs": ["Sourate Al-Baqarah (2:153-155)", "Sahih Muslim", "Sourate Az-Zumar (39:10)"]
        },
        "id": {
            "summary": "Seni spiritual dalam memupuk kesabaran (Sabr) menghadapi ujian hidup.",
            "tldr": "Sabar bukan sekadar menunggu, tetapi menjaga akhlak mulia dan tawakal kepada Allah di masa-masa sulit.",
            "body": "<p>Allah bersama orang-orang yang sabar (Innallaha ma'as-sabirin). Sabar disebutkan lebih dari 90 kali dalam Al-Quran, menekankan peran sentralnya dalam kehidupan seorang mukmin. Para ulama membagi sabar menjadi tiga jenis: sabar dalam menaati perintah Allah, sabar dalam menjauhi larangan-Nya, dan sabar menghadapi ujian serta musibah. Sabar melibatkan menahan jiwa dari keputusasaan, lisan dari mengeluh terhadap ketetapan Allah, dan anggota tubuh dari bereaksi dengan cara yang tidak Islami. Rasulullah (SAW) mengajarkan bahwa 'Sabar adalah cahaya' (Sahih Muslim), yang berarti memberikan cahaya yang dibutuhkan untuk melewati kegelapan kesulitan.</p>",
            "faqs": [
                {"q": "Apakah menangis atau merasa sedih diperbolehkan saat bersabar?", "a": "Ya, menangis adalah emosi manusia yang wajar dan perwujudan rahmat. Sabar adalah tentang ketundukan hati pada hikmah Allah dan tidak mempertanyakan ketetapan-Nya dengan kemarahan."},
                {"q": "Bagaimana cara meningkatkan kesabaran saya?", "a": "Dengan merenungkan pahala yang dijanjikan bagi orang yang sabar, membaca kisah para Nabi (seperti Nabi Ayub AS), dan senantiasa berdzikir agar hati tetap tenang."}
            ],
            "refs": ["Surah Al-Baqarah (2:153-155)", "Sahih Muslim", "Surah Az-Zumar (39:10)"]
        }
    },
    "parents-respect": {
        "en": {
            "summary": "The supreme status of parents in Islamic ethics and social harmony.",
            "tldr": "Kindness to parents (Birr al-Walidayn) is a divine obligation ranked immediately after the worship of Allah.",
            "body": "<p>The status of parents in Islam is exceptionally high. The Quran says: 'And your Lord has decreed that you worship none but Him, and that you be dutiful to your parents' (17:23). This commandment pairs the oneness of Allah with kindness to parents, showing its immense importance. We are forbidden from even saying a word of frustration like 'Uff' to them. The Prophet (PBUH) emphasized that the mother's status is three times that of the father due to her sacrifice. Serving parents is considered a path to Paradise, and their happiness is linked to the pleasure of Allah.</p>",
            "faqs": [
                {"q": "What if my parents are non-Muslim?", "a": "You are still obligated to treat them with the utmost kindness, respect, and care in worldly matters, even if you do not follow them in matters of faith."},
                {"q": "How to honor parents after they have passed away?", "a": "By making Du'a for them, giving Sadaqah Jariyah in their name, and maintaining ties with their friends and relatives."}
            ],
            "refs": ["Surah Al-Isra (17:23-24)", "Sahih Bukhari", "Sahih Muslim"]
        },
        "tr": {
            "summary": "İslami ahlak ve toplumsal huzurda anne ve babanın yüce makamı.",
            "tldr": "Anne ve babaya iyilik (Birr-ül Valideyn), Allah'a ibadetten hemen sonra gelen ilahi bir görevdir.",
            "body": "<p>İslam'da anne ve babanın konumu fevkalade yüksektir. Kuran şöyle buyurur: 'Rabbin, kendisinden başkasına kulluk etmemenizi ve ana babaya iyilik etmenizi kesin bir dille emretti' (İsra 17:23). Bu emir, Allah'ın birliği ile ebeveyne iyiliği yan yana getirerek konunun önemini gösterir. Onlara 'Öf' bile demekten sakınmamız emredilmiştir. Peygamber Efendimiz (S.A.V), annenin hakkının, yaptığı fedakarlıklar nedeniyle babadan üç kat daha fazla olduğunu vurgulamıştır. Anne babaya hizmet etmek Cennet'e giden bir yol olarak kabul edilir ve onların rızası Allah'ın rızasına bağlanmıştır.</p>",
            "faqs": [
                {"q": "Ebeveynlerim Müslüman değilse ne yapmalıyım?", "a": "İnanç konularında onlara uymasanız bile, dünya işlerinde onlara en üstün nezaket, saygı ve şefkatle davranmakla yükümlüsünüz."},
                {"q": "Vefatlarından sonra onlara nasıl iyilik edebilirim?", "a": "Onlar için dua ederek, adlarına sadaka-i cariye vererek ve onların dost ve akrabalarıyla bağları devam ettirerek."}
            ],
            "refs": ["İsra Suresi (17:23-24)", "Sahih-i Buhari", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "المكانة الأسمى للوالدين في الأخلاق الإسلامية وأثرها في التراحم الاجتماعي.",
            "tldr": "بر الوالدين واجب إلهي قرنه الله بعبادته وتوحيده في كتابه الكريم.",
            "body": "<p>مكانة الوالدين في الإسلام رفيعة جداً، فقد قال الله تعالى: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا' (الإسراء 23). لقد قرن الله سبحانه توحيده ببر الوالدين لعظم شأنهما. وقد نهانا الشرع عن قول أدنى كلمة تذمر لهما وهي 'أف'. وقد شدد النبي صلى الله عليه وسلم على حق الأم وجعلها أحق الناس بحسن الصحبة (ثلاث مرات) لعظم تضحياتها. إن خدمة الوالدين هي أقصر طريق للجنة، ورضا الله من رضا الوالدين وسخطه من سخطهما.</p>",
            "faqs": [
                {"q": "ما هي أفضل صيغة للصلاة على النبي؟", "a": "الصلاة الإبراهيمية (التي تقرأ في التشهد الأخير من الصلاة) هي أكمل وأفضل الصيغ التي علمنا إياها النبي صلى الله عليه وسلم."},
                {"q": "ماذا لو كان والداي غير مسلمين؟", "a": "أمرنا الله بمصاحبتهما في الدنيا معروفاً وبذل كل أنواع الإحسان والبر لهما، مع الحفاظ على الثبات على العقيدة."},
                {"q": "كيف أبر والدي بعد وفاتهما؟", "a": "بالدعاء والاستغفار لهما، وإنفاذ عهدهما، والصدقة عنهما، وصلة الرحم التي لا توصل إلا بهما."}
            ],
            "refs": ["سورة الإسراء (23-24)", "صحيح البخاري", "صحيح مسلم"]
        },
        "fr": {
            "summary": "Le statut suprême des parents dans l'éthique islamique et l'harmonie sociale.",
            "tldr": "La bonté envers les parents (Birr al-Walidayn) est une obligation divine classée immédiatement après l'adoration d'Allah.",
            "body": "<p>Le statut des parents en Islam est exceptionnellement élevé. Le Coran dit : 'Et ton Seigneur a décrété : N'adorez que Lui ; et (marquez) de la bonté envers les père et mère' (17:23). Ce commandement associe l'unicité d'Allah à la bonté envers les parents, montrant son immense importance. Il nous est interdit de leur dire ne serait-ce qu'un mot de frustration comme 'Ouf'. Le Prophète (PSL) a souligné que le statut de la mère est trois fois celui du père en raison de ses sacrifices. Servir les parents est considéré comme un chemin vers le Paradis, et leur bonheur est lié au plaisir d'Allah.</p>",
            "faqs": [
                {"q": "Et si mes parents ne sont pas musulmans ?", "a": "Vous êtes toujours obligé de les traiter avec la plus grande gentillesse, respect et soin dans les affaires mondaines, même si vous ne les suivez pas dans les questions de foi."},
                {"q": "Comment honorer les parents après leur décès ?", "a": "En faisant des Doua pour eux, en donnant la Sadaqah Jariyah en leur nom, et en maintenant des liens avec leurs amis et parents."}
            ],
            "refs": ["Sourate Al-Isra (17:23-24)", "Sahih Al-Bukhari", "Sahih Muslim"]
        },
        "id": {
            "summary": "Kedudukan tertinggi orang tua dalam etika Islam dan harmoni sosial.",
            "tldr": "Berbakti kepada orang tua (Birr al-Walidayn) adalah kewajiban ilahi yang ditempatkan tepat setelah beribadah kepada Allah.",
            "body": "<p>Kedudukan orang tua dalam Islam sangatlah tinggi. Al-Quran berfirman: 'Dan Tuhanmu telah memerintahkan supaya kamu jangan menyembah selain Dia dan hendaklah kamu berbuat baik pada ibu bapakmu' (17:23). Perintah ini menyandingkan keesaan Allah dengan bakti kepada orang tua, menunjukkan betapa pentingnya hal ini. Kita dilarang mengatakan kata-kata kasar meskipun sekadar 'Ah/Uff' kepada mereka. Rasulullah (SAW) menekankan bahwa kedudukan ibu tiga kali lebih utama daripada ayah karena pengorbanannya. Melayani orang tua dianggap sebagai jalan menuju Surga, dan keridhaan mereka dikaitkan dengan keridhaan Allah.</p>",
            "faqs": [
                {"q": "Bagaimana jika orang tua saya non-Muslim?", "a": "Anda tetap berkewajiban untuk memperlakukan mereka dengan sangat baik, hormat, dan penuh perhatian dalam urusan duniawi, meskipun Anda tidak mengikuti mereka dalam hal akidah."},
                {"q": "Bagaimana cara berbakti setelah mereka wafat?", "a": "Dengan mendoakan mereka, memberikan Sedekah Jariyah atas nama mereka, serta menyambung silaturahim dengan teman dan kerabat mereka."}
            ],
            "refs": ["Surah Al-Isra (17:23-24)", "Sahih Bukhari", "Sahih Muslim"]
        }
    },
    "finance-halal": {
        "en": {
            "summary": "Core principles of ethical and halal wealth acquisition in Islam.",
            "tldr": "Seeking halal sustenance is a mandatory act of worship for every Muslim, ensuring blessings in this life and the next.",
            "body": "<p>In Islamic ethics, the source of one's wealth is as important as how it is spent. Riba (usury/interest) is strictly forbidden as it facilitates exploitation. A believer must ensure their income is pure, avoiding Gharar (excessive uncertainty) and Maysir (gambling). The Prophet (PBUH) warned that a body nourished by haram will not have its Duas answered and is more susceptible to spiritual decline. Seeking halal sustenance is not just a financial choice but a profound act of worship that brings Barakah (divine blessing) into the home and provides peace of mind.</p>",
            "faqs": [
                {"q": "Is all type of investment allowed?", "a": "No, only shariah-compliant investments are allowed. This means the business must not involve Haraam activities (like alcohol or gambling) and the contract must not involve Riba."},
                {"q": "What should I do if my current job involves some haram elements?", "a": "You should actively seek a purely halal alternative while making Istighfar, as Allah is the ultimate Provider (Ar-Razzaq)."}
            ],
            "refs": ["Sahih Muslim", "Surah Al-Baqarah (2:275-279)", "Surah Al-Ma'idah (5:88)"]
        },
        "tr": {
            "summary": "İslam'da etik ve helal kazanç elde etmenin temel ilkeleri.",
            "tldr": "Helal rızık aramak her Müslüman için farz bir ibadettir; hem bu dünyada hem de ahirette bereketin anahtarıdır.",
            "body": "<p>İslam ahlakında, servetin kaynağı en az nasıl harcandığı kadar önemlidir. Faiz (Riba), sömürüye yol açtığı için kesinlikle yasaklanmıştır. Bir mümin, kazancının temiz olduğundan emin olmalı; Garar (aşırı belirsizlik) ve Meysir'den (kumar) kaçınmalıdır. Peygamber Efendimiz (S.A.V), haramla beslenen bir vücudun dualarının kabul olmayacağı ve manevi çöküşe daha açık hale geleceği konusunda uyarmıştır. Helal rızık aramak sadece finansal bir tercih değil, eve bereket (ilahi lütuf) getiren ve vicdan huzuru sağlayan derin bir ibadettir.</p>",
            "faqs": [
                {"q": "Her türlü yatırım caiz mi?", "a": "Hayır, sadece şeriata uygun yatırımlar caizdir. Bu, işin haram faaliyetler (alkol, kumar vb.) içermemesi ve sözleşmede faiz bulunmaması gerektiği anlamına gelir."},
                {"q": "İşimde bazı haram unsurlar varsa ne yapmalıyım?", "a": "Allah'ın Rezzak (rızık veren) olduğuna güvenerek, aktif olarak tamamen helal bir alternatif arayışına girmeli ve bu süreçte istiğfarda bulunmalısınız."}
            ],
            "refs": ["Sahih-i Müslim", "Bakara Suresi (2:275-279)", "Maide Suresi (5:88)"]
        },
        "ar": {
            "summary": "المبادئ الجوهرية لاكتساب الثروة الأخلاقية والحلال في الإسلام.",
            "tldr": "طلب الرزق الحلال عبادة مفروضة على كل مسلم، وهي باب البركة في الدنيا والنجاة في الآخرة.",
            "body": "<p>في الأخلاق الإسلامية، مصدر المال لا يقل أهمية عن كيفية إنفاقه. الربا محرم قطعاً لما فيه من استغلال وظلم. ويجب على المؤمن تحري طيب مأكله ومشربه، وتجنب الغرر (الجهالة الفاحشة) والميسر (القمار). وقد حذر النبي صلى الله عليه وسلم من أن الجسد الذي نبت من سحت لا يستجاب دعاؤه. إن السعي وراء الرزق الحلال ليس مجرد خيار مالي، بل هو عبادة جليلة تجلب البركة للبيت، وتورث القلب طمأنينة ويقيناً بأن الله هو الرزاق ذو القوة المتين.</p>",
            "faqs": [
                {"q": "هل كل أنواع الاستثمار جائزة شرعاً؟", "a": "لا، تجوز فقط الاستثمارات المتوافقة مع الشريعة، والتي تخلو من النشاطات المحرمة (كالخمور والقمار) ومن عقود الربا."},
                {"q": "ماذا أفعل إذا كان عملي الحالي يشوبه بعض الحرام؟", "a": "عليك البحث بجدية عن بديل حلال خالص مع الاستغفار المستمر، واليقين بأن من ترك شيئاً لله عوضه الله خيراً منه."}
            ],
            "refs": ["صحيح مسلم", "سورة البقرة (275-279)", "سورة المائدة (88)"]
        },
        "fr": {
            "summary": "Principes fondamentaux de l'acquisition d'une richesse éthique et halal en Islam.",
            "tldr": "Rechercher une subsistance halal est un acte d'adoration obligatoire pour tout musulman, garantissant des bénédictions ici-bas et dans l'au-delà.",
            "body": "<p>Dans l'éthique islamique, la source de sa richesse est aussi importante que la façon dont elle est dépensée. Le Riba (usure/intérêt) est strictement interdit car il facilite l'exploitation. Un croyant doit s'assurer que ses revenus sont purs, en évitant le Gharar (incertitude excessive) et le Maysir (jeux de hasard). Le Prophète (PSL) a averti qu'un corps nourri par le haram ne verra pas ses Duas exaucées et est plus susceptible au déclin spirituel. Rechercher une subsistance halal n'est pas seulement un choix financier mais un acte d'adoration profond qui apporte la Barakah (bénédiction divine) dans le foyer et procure une tranquillité d'esprit.</p>",
            "faqs": [
                {"q": "Est-ce que tout type d'investissement est autorisé ?", "a": "Non, seuls les investissements conformes à la charia sont autorisés. Cela signifie que l'entreprise ne doit pas impliquer d'activités illicites (comme l'alcool ou les jeux de hasard) et que le contrat ne doit pas inclure de Riba."},
                {"q": "Que dois-je faire si mon travail actuel comporte des éléments haram ?", "a": "Vous devriez activement chercher une alternative purement halal tout en faisant de l'Istighfar, car Allah est le pourvoyeur ultime (Ar-Razzaq)."}
            ],
            "refs": ["Sahih Muslim", "Sourate Al-Baqarah (2:275-279)", "Sourate Al-Ma'idah (5:88)"]
        },
        "id": {
            "summary": "Prinsip utama pemerolehan kekayaan yang etis dan halal dalam Islam.",
            "tldr": "Mencari rezeki yang halal adalah ibadah yang wajib bagi setiap Muslim, menjamin keberkahan di dunia dan akhirat.",
            "body": "<p>Dalam etika Islam, sumber kekayaan seseorang sama pentingnya dengan cara uang tersebut dibelanjakan. Riba (bunga/riba) sangat dilarang karena memfasilitasi eksploitasi. Seorang mukmin harus memastikan penghasilannya murni, menghindari Gharar (ketidakpastian yang berlebihan) dan Maysir (perjudian). Rasulullah (SAW) memperingatkan bahwa tubuh yang diberi makan dari harta haram tidak akan dikabulkan doanya dan lebih rentan terhadap penurunan spiritual. Mencari rezeki yang halal bukan sekadar pilihan finansial, melainkan ibadah mendalam yang mendatangkan Barakah (berkah ilahi) ke dalam rumah dan memberikan ketenangan pikiran.</p>",
            "faqs": [
                {"q": "Apakah semua jenis investasi diperbolehkan?", "a": "Tidak, hanya investasi syariah yang diperbolehkan. Ini berarti bisnis tidak boleh melibatkan kegiatan haram (seperti alkohol atau judi) dan akadnya tidak boleh mengandung riba."},
                {"q": "Apa yang harus saya lakukan jika pekerjaan saya saat ini ada unsur haramnya?", "a": "Anda harus aktif mencari alternatif yang murni halal sambil terus beristighfar, karena Allah adalah sebaik-baik Pemberi Rezeki (Ar-Razzaq)."}
            ],
            "refs": ["Sahih Muslim", "Surah Al-Baqarah (2:275-279)", "Surah Al-Ma'idah (5:88)"]
        }
    },
    "anxiety-islamic-tips": {
        "en": {
            "summary": "Finding inner peace and resilience through faith during anxious times.",
            "tldr": "Islamic practices such as Dhikr, Salah, and Tawakkul are powerful spiritual tools to manage anxiety and restore tranquility.",
            "body": "<p>Allah says in the Quran: 'Verily, in the remembrance of Allah do hearts find rest' (13:28). Anxiety often stems from a fear of the unknown or the future, both of which are firmly in the hands of Allah (Al-Latif). Islam teaches us to focus on the present moment and entrust our affairs to Al-Wakil (The Disposer of Affairs). The Prophet (PBUH) taught us Duas specifically for distress, such as 'Allahumma inni a'udhu bika minal-hammi wal-hazan' (O Allah, I seek refuge in You from anxiety and grief). Understanding that with every hardship comes ease (Inna ma'al 'usri yusra) helps build the resilience needed to face life's uncertainties.</p>",
            "faqs": [
                {"q": "Is it okay to seek professional mental health help?", "a": "Yes, absolutely. Seeking medical or psychological help is a form of taking the necessary means (Tawakkul), as the Prophet (PBUH) taught us to seek cures for every ailment."},
                {"q": "Which specific Dhikrs help with anxiety?", "a": "Constant Salawat, Sayyid-ul-Istighfar, and the Dua of Prophet Yunus (AS) are highly recommended for calming the heart."}
            ],
            "refs": ["Surah Ar-Ra'd (13:28)", "Sahih Bukhari", "Surah Ash-Sharh (94:5-6)"]
        },
        "tr": {
            "summary": "Kaygılı zamanlarda inanç yoluyla iç huzuru ve dayanıklılığı bulmak.",
            "tldr": "Zikir, Namaz ve Tevekkül gibi İslami uygulamalar, kaygıyı yönetmek ve huzuru yeniden tesis etmek için güçlü manevi araçlardır.",
            "body": "<p>Allah Kuran'da şöyle buyurur: 'Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur.' (Ra'd 13:28). Kaygı genellikle bilinmezlikten veya gelecek korkusundan kaynaklanır ki bunların her ikisi de El-Latif olan Allah'ın elindedir. İslam bize ana odaklanmayı ve işlerimizi El-Vekil'e (İşleri en iyi şekilde yoluna koyan) havale etmeyi öğretir. Peygamber Efendimiz (S.A.V) bize 'Allahümme inni euzü bike minel-hemmi vel-hazen' (Allah'ım, kederden ve hüzünden Sana sığınırım) gibi sıkıntı anları için özel dualar öğretmiştir. Her zorlukla beraber bir kolaylığın olduğunu (İnna me'al usri yüsra) anlamak, hayatın belirsizlikleriyle yüzleşmek için gereken direnci oluşturmaya yardımcı olur.</p>",
            "faqs": [
                {"q": "Profesyonel ruh sağlığı yardımı almak caiz mi?", "a": "Evet, kesinlikle. Tıbbi veya psikolojik yardım almak, bir nevi sebeplere sarılmaktır (Tevekkül). Peygamberimiz (S.A.V) her dert için derman aramamızı öğütlemiştir."},
                {"q": "Kaygıya hangi zikirler iyi gelir?", "a": "Sürekli salavat getirmek, Seyyidül İstiğfar okumak ve Hz. Yunus'un (A.S) duası kalbi sakinleştirmek için şiddetle tavsiye edilir."}
            ],
            "refs": ["Ra'd Suresi (13:28)", "Sahih-i Buhari", "İnşirah Suresi (94:5-6)"]
        },
        "ar": {
            "summary": "إيجاد السكينة الداخلية والمرونة من خلال الإيمان في أوقات القلق.",
            "tldr": "الممارسات الإسلامية كالذكر والصلاة والتوكل هي أدوات روحية فعالة لإدارة القلق واستعادة الطمأنينة.",
            "body": "<p>قال الله تعالى في القرآن الكريم: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ' (الرعد 28). غالباً ما ينبع القلق من الخوف من المجهول أو المستقبل، وكلاهما بيد الله اللطيف الخبير. يعلمنا الإسلام التركيز على اللحظة الحاضرة وتفويض الأمور للوكيل سبحانه. وقد علمنا النبي صلى الله عليه وسلم أدعية مخصوصة للكرب والهم، مثل: 'اللهم إني أعوذ بك من الهم والحزن'. إن اليقين بأن مع العسر يسراً (إن مع العسر يسراً) يساعد في بناء المرونة النفسية بداخلنا لمواجهة تقلبات الحياة بيقين وثبات.</p>",
            "faqs": [
                {"q": "هل يجوز طلب المساعدة من المختصين في الصحة النفسية؟", "a": "نعم، وبكل تأكيد. طلب المساعدة الطبية أو النفسية هو من الأخذ بالأسباب المشروعة (التوكل)، وقد أمرنا النبي صلى الله عليه وسلم بالتداوي."},
                {"q": "ما هي الأذكار التي تساعد في طرد القلق؟", "a": "الإكثار من الصلاة على النبي، وسيد الاستغفار، ودعاء ذي النون (لا إله إلا أنت سبحانك إني كنت من الظالمين) من أعظم ما تسكن به القلوب."},
            ],
            "refs": ["سورة الرعد (28)", "صحيح البخاري", "سورة الشرح (5-6)"]
        },
        "fr": {
            "summary": "Trouver la paix intérieure et la résilience par la foi pendant les moments d'anxiété.",
            "tldr": "Les pratiques islamiques telles que le Dhikr, la Salah et le Tawakkul sont des outils spirituels puissants pour gérer l'anxiété.",
            "body": "<p>Allah dit dans le Coran : 'N'est-ce pas par l'évocation d'Allah que se tranquillisent les cœurs ?' (13:28). L'anxiété provient souvent d'une peur de l'inconnu ou de l'avenir, qui sont tous deux fermement entre les mains d'Allah (Al-Latif). L'Islam nous enseigne à nous concentrer sur le moment présent et à confier nos affaires à Al-Wakil (Celui à qui on confie tout). Le Prophète (PSL) nous a enseigné des Douas spécifiquement pour la détresse, comme 'Allahumma inni a'udhu bika minal-hammi wal-hazan' (Ô Allah, je cherche refuge auprès de Toi contre l'anxiété et le chagrin). Comprendre qu'avec chaque difficulté vient une facilité (Inna ma'al 'usri yusra) aide à renforcer la résilience nécessaire.</p>",
            "faqs": [
                {"q": "Est-il acceptable de demander une aide professionnelle en santé mentale ?", "a": "Oui, absolument. Chercher une aide médicale ou psychologique est une forme de Tawakkul (confiance en Allah par l'action), car le Prophète (PSL) nous a enseigné de chercher des remèdes pour chaque mal."},
                {"q": "Quels Dhikrs spécifiques aident contre l'anxiété ?", "a": "La Salawat constante, le Sayyid-ul-Istighfar et la Doua du Prophète Yunus (AS) sont fortement recommandés pour calmer le cœur."}
            ],
            "refs": ["Sourate Ar-Ra'd (13:28)", "Sahih Al-Bukhari", "Sourate Ash-Sharh (94:5-6)"]
        },
        "id": {
            "summary": "Menemukan ketenangan batin dan ketangguhan melalui iman di saat-saat cemas.",
            "tldr": "Praktik Islami seperti Dzikir, Shalat, dan Tawakal adalah sarana spiritual yang kuat untuk mengelola kecemasan dan memulihkan ketenangan.",
            "body": "<p>Allah berfirman dalam Al-Quran: 'Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram' (13:28). Kecemasan sering kali bersumber dari rasa takut akan hal yang tidak diketahui atau masa depan, yang keduanya berada sepenuhnya di tangan Allah (Al-Latif). Islam mengajarkan kita untuk fokus pada saat ini dan menyerahkan segala urusan kita kepada Al-Wakil (Maha Pelindung). Rasulullah (SAW) mengajarkan doa-doa khusus saat dilanda kesulitan, seperti 'Allahumma inni a'udhu bika minal-hammi wal-hazan' (Ya Allah, aku berlindung kepada-Mu dari kecemasan dan kesedihan). Memahami bahwa sesungguhnya sesudah kesulitan itu ada kemudahan (Inna ma'al 'usri yusra) membantu membangun ketangguhan dalam menghadapi ketidakpastian hidup.</p>",
            "faqs": [
                {"q": "Bolehkah mencari bantuan profesional kesehatan mental?", "a": "Ya, tentu saja. Mencari bantuan medis atau psikologis adalah bentuk ikhtiar (Tawakkul), sebagaimana Nabi (SAW) mengajarkan kita untuk mencari obat bagi setiap penyakit."},
                {"q": "Dzikir apa yang membantu mengatasi kecemasan?", "a": "Memperbanyak Shalawat, Sayyidul Istighfar, dan Doa Nabi Yunus (AS) sangat dianjurkan untuk menenangkan hati."}
            ],
            "refs": ["Surah Ar-Ra'd (13:28)", "Sahih Bukhari", "Surah Ash-Sharh (94:5-6)"]
        }
    },
    "marriage-rights": {
        "en": {
            "summary": "The foundations of a healthy, tranquil Islamic marriage.",
            "tldr": "Marriage in Islam is built on the divine pillars of Mawaddah (love) and Rahmah (mercy).",
            "body": "<p>The Quran describes the relationship between spouses as a source of peace, stating: 'And He placed between you love and mercy' (30:21). An Islamic marriage is not just a legal contract but a spiritual partnership. Both husband and wife have specific rights and responsibilities designed to create a harmonious home environment based on mutual respect, kindness, and the fear of Allah. These include the husband's duty of financial maintenance and protection, and the wife's role in maintaining the home's tranquility, with both required to consult each other (Shura) in major decisions.</p>",
            "faqs": [
                {"q": "What is the key to a long-lasting Islamic marriage?", "a": "Patience, constant communication, forgiveness, and making the pleasure of Allah the ultimate goal of the household."},
                {"q": "How does Islam view conflict in marriage?", "a": "Conflict is a natural trial. Islam encourages reconciliation, patience, and involving wise elders from both sides if a resolution cannot be reached internally."}
            ],
            "refs": ["Surah Ar-Rum (30:21)", "Sahih Bukhari", "Sunan Tirmidhi"]
        },
        "tr": {
            "summary": "Huzurlu ve sağlıklı bir İslami evliliğin temelleri.",
            "tldr": "İslam'da evlilik, ilahi Meveddet (sevgi) ve Rahmet (merhamet) sütunları üzerine kuruludur.",
            "body": "<p>Kuran, eşler arasındaki ilişkiyi bir huzur kaynağı olarak tanımlar: 'O, aranıza sevgi ve merhamet yerleştirdi' (Rum 30:21). İslami bir evlilik sadece hukuki bir sözleşme değil, manevi bir ortaklıktır. Hem karı hem de kocanın; karşılıklı saygı, nezaket ve Allah korkusuna dayalı uyumlu bir ev ortamı yaratmak için özel hak ve sorumlulukları vardır. Bunlar arasında kocanın maddi geçim ve koruma yükümlülüğü, kadının evin huzurunu sağlama rolü yer alır. Her iki tarafın da önemli kararlarda birbirine danışması (İstişare) esastır.</p>",
            "faqs": [
                {"q": "Uzun ömürlü bir İslami evliliğin anahtarı nedir?", "a": "Sabır, sürekli iletişim, bağışlayıcılık ve Allah'ın rızasını evin nihai hedefi haline getirmektir."},
                {"q": "İslam evlilikteki çatışmalara nasıl bakar?", "a": "Çatışma doğal bir imtihandır. İslam; uzlaşmayı, sabrı ve şayet kendi aralarında bir çözüm bulamıyorlarsa her iki taraftan bilge kişilerce ara buluculuk yapılmasını teşvik eder."}
            ],
            "refs": ["Rum Suresi (30:21)", "Sahih-i Buhari", "Tirmizi"]
        },
        "ar": {
            "summary": "أسس الزواج الإسلامي الصحي القائم على السكينة والطمأنينة.",
            "tldr": "الزواج في الإسلام مبني على الأركان الربانية: المودة والرحمة.",
            "body": "<p>يصف القرآن الكريم العلاقة بين الزوجين بأنها مصدر للسكن النفسي، حيث قال تعالى: 'وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً' (الروم 21). الزواج في الإسلام ليس مجرد عقد قانوني، بل هو ميثاق غليظ وشراكة روحية. لكل من الزوج والزوجة حقوق وواجبات متكاملة تهدف إلى بناء بيت مسلم متناغم، قوامه الاحترام المتبادل، والرفق، وتقوى الله. ويشمل ذلك حق الزوجة في النفقة والرعاية، وحق الزوج في السكينة والتقدير، مع اشتراط التشاور (الشورى) بينهما في شؤون حياتهما الكبيرة.</p>",
            "faqs": [
                {"q": "ما هو مفتاح استمرار المودة في الزواج الإسلامي؟", "a": "الصبر، وحسن التواصل، والتغافل عن الزلات، وجعل مرضاة الله هي الغاية الأسمى لكل منهما."},
                {"q": "كيف يعالج الإسلام الخلافات الزوجية؟", "a": "الخلاف أمر طبيعي، ويحث الإسلام على الإصلاح، والصبر، والرفق، واللجوء إلى ذوي الحكمة من الأهل عند تعذر الحل الداخلي."}
            ],
            "refs": ["سورة الروم (21)", "صحيح البخاري", "سنن الترمذي"]
        },
        "fr": {
            "summary": "Les fondements d'un mariage islamique sain et tranquille.",
            "tldr": "Le mariage en Islam est construit sur les piliers divins de la Mawaddah (amour) et de la Rahmah (miséricorde).",
            "body": "<p>Le Coran décrit la relation entre les époux comme une source de paix, déclarant : 'Et He a placé entre vous de l'amour et de la miséricorde' (30:21). Un mariage islamique n'est pas seulement un contrat légal mais un partenariat spirituel. Le mari et la femme ont tous deux des droits et des responsabilités spécifiques conçus pour créer un environnement familial harmonieux basé sur le respect mutuel, la gentillesse et la crainte d'Allah. Cela inclut le devoir du mari de subvenir aux besoins financiers et de protection, et le rôle de la femme dans le maintien de la tranquillité du foyer, les deux devant se consulter (Shura) pour les décisions majeures.</p>",
            "faqs": [
                {"q": "Quelle est la clé d'un mariage islamique durable ?", "a": "La patience, une communication constante, le pardon et faire du plaisir d'Allah l'objectif ultime du foyer."},
                {"q": "Comment l'Islam perçoit-il les conflits dans le mariage ?", "a": "Le conflit est une épreuve naturelle. L'Islam encourage la réconciliation, la patience et l'implication de sages des deux familles si une résolution ne peut être trouvée en interne."}
            ],
            "refs": ["Sourate Ar-Rum (30:21)", "Sahih Al-Bukhari", "Sunan Tirmidhi"]
        },
        "id": {
            "summary": "Landasan pernikahan Islami yang sehat dan tenang.",
            "tldr": "Pernikahan dalam Islam dibangun di atas pilar ilahi Mawaddah (cinta) dan Rahmah (kasih sayang).",
            "body": "<p>Al-Quran menggambarkan hubungan antara suami istri sebagai sumber ketenangan, dengan berfirman: 'Dan dijadikan-Nya di antaramu rasa kasih dan sayang' (30:21). Pernikahan Islami bukan sekadar akad hukum, melainkan kemitraan spiritual. Baik suami maupun istri memiliki hak dan tanggung jawab khusus yang dirancang untuk menciptakan lingkungan rumah tangga yang harmonis berdasarkan rasa hormat, kasih sayang, dan ketaqwaan kepada Allah. Ini mencakup kewajiban suami dalam mendukung finansial dan perlindungan, serta peran istri dalam menjaga ketenangan rumah, di mana keduanya diharapkan saling bermusyawarah (Shura) dalam keputusan besar.</p>",
            "faqs": [
                {"q": "Apa kunci pernikahan Islami yang langgeng?", "a": "Kesabaran, komunikasi yang jujur, saling memaafkan, dan menjadikan ridha Allah sebagai tujuan utama rumah tangga."},
                {"q": "Bagaimana Islam memandang konflik dalam pernikahan?", "a": "Konflik adalah ujian yang wajar. Islam mendorong perdamaian (islah), kesabaran, dan melibatkan orang bijak dari kedua pihak jika solusi tidak dapat ditemukan secara internal."}
            ],
            "refs": ["Surah Ar-Rum (30:21)", "Sahih Bukhari", "Sunan Tirmidhi"]
        }
    },
    "seeking-knowledge": {
        "en": {
            "summary": "The divine obligation and spiritual virtues of seeking knowledge in Islam.",
            "tldr": "Seeking knowledge is a mandatory path to Paradise, elevating the status of a believer in both worlds.",
            "body": "<p>In Islam, knowledge is the key to true faith and righteous action. The Prophet (PBUH) famously stated: 'Seeking knowledge is an obligation upon every Muslim' (Ibn Majah). This includes 'Fard Ayn' (individual obligations like Aqidah and Fiqh of worship) and 'Fard Kifayah' (communal obligations in medicine, technology, and sciences). The Quran asks rhetorical questions such as 'Are those who know equal to those who do not know?' (39:9). Angels spread their wings over the seeker of knowledge, and all of creation, including the fish in the sea, prays for one who teaches others what is good.</p>",
            "faqs": [
                {"q": "Should I prioritize religious or worldly knowledge?", "a": "Both are important, but foundational religious knowledge (Aqidah, Salah) is an individual obligation. Worldly knowledge is a communal obligation to serve the Ummah's progress."},
                {"q": "How can I maintain consistency in learning?", "a": "By starting small, joining circles of knowledge, and always intentions (Niyyah) that your learning is for the sake of Allah."}
            ],
            "refs": ["Surah Az-Zumar (39:9)", "Sunan Ibn Majah", "Sahih Bukhari"]
        },
        "tr": {
            "summary": "İslam'da ilim talep etmenin ilahi yükümlülüğü ve manevi faziletleri.",
            "tldr": "İlim peşinde koşmak, Cennet'e giden mecburi bir yoldur ve müminin her iki dünyadaki derecesini yükseltir.",
            "body": "<p>İslam'da bilgi, gerçek imanın ve salih amelin anahtarıdır. Peygamber Efendimiz (S.A.V) meşhur hadisinde: 'İlim talep etmek her Müslüman üzerine farzdır' (İbn Mace) buyurmuştur. Bu, hem 'Farz-ı Ayn' (Akid ve ibadet fıkhı gibi bireysel yükümlülükler) hem de 'Farz-ı Kifaye' (tıp, teknoloji ve temel bilimler gibi toplumsal yükümlülükler) bilimlerini kapsar. Kuran-ı Kerim: 'Hiç bilenlerle bilmeyenler bir olur mu?' (Zümer 39:9) buyurarak ilmin üstünlüğünü vurgular. Melekler ilim talebeleri üzerine kanatlarını gerer ve denizdeki balıklara varıncaya kadar tüm mahlukat hayrı öğreten kişi için dua eder.</p>",
            "faqs": [
                {"q": "Dini bilgiye mi yoksa dünyevi bilgiye mi öncelik vermeliyim?", "a": "Her ikisi de önemlidir; ancak temel dini bilgiler (Akid, Namaz) bireysel bir yükümlülüktür. Dünyevi ilimler ise Ümmetin ilerlemesine hizmet etmek için toplumsal bir görevdir."},
                {"q": "Öğrenmede istikrarı nasıl sağlayabilirim?", "a": "Küçük adımlarla başlayarak, ilim meclislerine katılarak ve her zaman niyetinizi (Niyyah) Allah rızası için öğrenmek şeklinde tazeleyerek."}
            ],
            "refs": ["Zümer Suresi (39:9)", "İbn Mace", "Sahih-i Buhari"]
        },
        "ar": {
            "summary": "فرضية طلب العلم وفضائله الروحية في ميزان الإسلام.",
            "tldr": "طلب العلم طريق مفروض إلى الجنة، يرفع درجات المؤمن في الدنيا والآخرة.",
            "body": "<p>في الإسلام، العلم هو مفتاح الإيمان الحق والعمل الصالح. وقد قال النبي صلى الله عليه وسلم: 'طلب العلم فريضة على كل مسلم' (رواه ابن ماجه). ويشمل ذلك 'فرض العين' (كالعقيدة وفقه العبادات) و'فرض الكفاية' (كالطب والتقنية والعلوم النافعة للأمة). وقد سأل القرآن سؤالاً تقريرياً: 'هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ' (الزمر 9). إن الملائكة لتضع أجنحتها لطالب العلم رضاً بما يصنع، وإن العالم ليستغفر له من في السماوات ومن في الأرض حتى الحيتان في جوف الماء.</p>",
            "faqs": [
                {"q": "هل الأولوية للعلم الشرعي أم العلم الدنيوي؟", "a": "كلاهما مهم، لكن العلم الشرعي الضروري (عقيدة، صلاة) فرض عين. أما العلوم الدنيوية فهي فرض كفاية لخدمة الأمة ورقيها."},
                {"q": "كيف أحافظ على الاستمرارية في طلب العلم؟", "a": "بالبدء بالقليل المداوم عليه، وملازمة أهل العلم، وتجديد النية بأن يكون علمك خالصاً لوجه الله ونفعاً لخلقه."},
            ],
            "refs": ["سورة الزمر (9)", "سنن ابن ماجه", "صحيح البخاري"]
        },
        "fr": {
            "summary": "L'obligation divine et les vertus spirituelles de la recherche de la connaissance en Islam.",
            "tldr": "Chercher la connaissance est un chemin obligatoire vers le Paradis, élevant le statut du croyant dans les deux mondes.",
            "body": "<p>En Islam, la connaissance est la clé de la foi véritable et de l'action juste. Le Prophète (PSL) a déclaré : 'Chercher la connaissance est une obligation pour chaque musulman' (Ibn Majah). Cela inclut le 'Fard Ayn' (obligations individuelles comme l'Aqidah et le Fiqh de l'adoration) et le 'Fard Kifayah' (obligations communautaires en médecine, technologie et sciences). Le Coran pose des questions rhétoriques telles que 'Ceux qui savent sont-ils égaux à ceux qui ne savent pas ?' (39:9). Les anges déploient leurs ailes sur celui qui cherche la connaissance, et toute la création, y compris les poissons dans la mer, prie pour celui qui enseigne aux autres ce qui est bon.</p>",
            "faqs": [
                {"q": "Dois-je donner la priorité aux connaissances religieuses ou mondaines ?", "a": "Les deux sont importantes, mais les connaissances religieuses de base (Aqidah, Salah) sont une obligation individuelle. Les connaissances mondaines sont une obligation communautaire pour servir le progrès de l'Ummah."},
                {"q": "Comment puis-je maintenir la cohérence dans l'apprentissage ?", "a": "En commençant petit, en rejoignant des cercles de connaissance et en ayant toujours l'intention (Niyyah) que votre apprentissage soit pour l'amour d'Allah."}
            ],
            "refs": ["Sourate Az-Zumar (39:9)", "Sunan Ibn Majah", "Sahih Al-Bukhari"]
        },
        "id": {
            "summary": "Kewajiban ilahi dan keutamaan spiritual dalam menuntut ilmu dalam Islam.",
            "tldr": "Menuntut ilmu adalah jalan wajib menuju Surga, mengangkat derajat seorang mukmin di dunia dan akhirat.",
            "body": "<p>Dalam Islam, ilmu adalah kunci iman yang hakiki dan amal shaleh. Rasulullah (SAW) bersabda: 'Menuntut ilmu itu wajib atas setiap Muslim' (Ibn Majah). Ini mencakup 'Fardhu Ain' (kewajiban individu seperti Aqidah dan Fiqh ibadah) serta 'Fardhu Kifayah' (kewajiban kolektif dalam kedokteran, teknologi, dan sains). Al-Quran bertanya retoris: 'Adakah sama orang-orang yang mengetahui dengan orang-orang yang tidak mengetahui?' (39:9). Para malaikat membentangkan sayap mereka bagi para penuntut ilmu, dan seluruh makhluk, termasuk ikan di laut, memohonkan ampun bagi orang yang mengajarkan kebaikan kepada sesama.</p>",
            "faqs": [
                {"q": "Haruskah saya memprioritaskan ilmu agama atau ilmu dunia?", "a": "Keduanya penting, namun ilmu agama dasar (Aqidah, Shalat) adalah kewajiban individu. Ilmu dunia adalah kewajiban kolektif untuk menunjang kemajuan Ummat."},
                {"q": "Bagaimana cara menjaga istiqomah dalam belajar?", "a": "Dengan mulai dari hal kecil, bergabung dalam majelis ilmu, dan senantiasa meluruskan niat (Niyyah) bahwa belajar adalah lillahi ta'ala."}
            ],
            "refs": ["Surah Az-Zumar (39:9)", "Sunan Ibn Majah", "Sahih Bukhari"]
        }
    },
    "time-management": {
        "en": {
            "summary": "An Islamic perspective on the profound value of time and life's moments.",
            "tldr": "Our time is a trust (Amanah) from Allah that we will be questioned about on the Day of Judgment.",
            "body": "<p>In Islam, time is one of the most precious resources given to humanity. Surah Al-Asr reminds us: 'By time, indeed mankind is in loss, except those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.' A Muslim's life is naturally structured around the five daily prayers, which serve as a divine framework for time management, ensuring a balance between Dunya (worldly life) and Akhirah (hereafter). The Prophet (PBUH) taught us to 'Value five things before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your preoccupation, and your life before your death.'</p>",
            "faqs": [
                {"q": "How can I avoid procrastination in my daily life?", "a": "Start your tasks with Bismillah, utilize the early morning hours after Fajr (the time of Barakah), and set clear intentions for every action you take."},
                {"q": "What is the best way to balance work and worship?", "a": "By viewing your work as a means to provide halal sustenance (which itself is worship) and structuring your work schedule around the fixed times of the daily prayers."}
            ],
            "refs": ["Surah Al-Asr (103:1-3)", "Sunan Tirmidhi", "Sahih Bukhari"]
        },
        "tr": {
            "summary": "Zamanın derin değeri ve hayatın anları üzerine İslami bir bakış.",
            "tldr": "Zamanımız, Kıyamet Günü'nde hesabını vereceğimiz Allah'ın büyük bir emanetidir.",
            "body": "<p>İslam'da zaman, insanlığa verilen en kıymetli kaynaklardan biridir. Asr Suresi bize şunu hatırlatır: 'Zamana andolsun ki, insan ziyandadır. Ancak iman edip salih ameller işleyenler, birbirlerine hakkı ve sabrı tavsiye edenler müstesna.' Bir Müslümanın hayatı, doğal olarak beş vakit namaz etrafında şekillenir; bu, dünya ve ahiret arasındaki dengeyi sağlayan ilahi bir zaman yönetimi çerçevesidir. Peygamber Efendimiz (S.A.V) şöyle buyurmuştur: 'Beş şey gelmeden önce beş şeyin değerini bil: Yaşlılıktan önce gençliğin, hastalıktan önce sağlığın, fakirlikten önce zenginliğin, meşguliyetten önce boş vaktin ve ölümden önce hayatın.'</p>",
            "faqs": [
                {"q": "Günlük hayatta erteleme huyundan nasıl kurtulabilirim?", "a": "İşlerinize Besmele ile başlayın, bereket vakti olan sabah namazı sonrasını iyi değerlendirin ve her işinizde niyetinizi tazeleyin."},
                {"q": "Dünya işleri ile ibadet arasındaki dengeyi nasıl kurabilirim?", "a": "İşinizi helal rızık kazanma vesilesi (ki bu da bir ibadettir) olarak görerek ve çalışma programınızı günlük namaz vakitlerine göre düzenleyerek."}
            ],
            "refs": ["Asr Suresi (103:1-3)", "Tirmizi", "Sahih-i Buhari"]
        },
        "ar": {
            "summary": "منظور إسلامي عميق حول قيمة الوقت ولحظات العمر.",
            "tldr": "وقتنا أمانة غالية من الله سنسأل عنها وقوفاً بين يديه يوم القيامة.",
            "body": "<p>الوقت في الإسلام هو الوعاء الذي يملؤه المؤمن بالعمل الصالح. تذكرنا سورة العصر بهذه الحقيقة: 'وَالْعَصْرِ (1) إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ (2) إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ...'. إن حياة المسلم منظمة ربانياً حول الصلوات الخمس، وهي أعظم مدرسة لإدارة الوقت والتوازن بين عمارة الدنيا والعمل للآخرة. وقد أوصانا النبي صلى الله عليه وسلم باغتنام الفرص قبل فواتها فقال: 'اغتنم خمساً قبل خمس: شبابك قبل هرمك، وصحتك قبل سقمك، وغناك قبل فقرك، وفراغك قبل شغلك، وحياتك قبل موتك'.</p>",
            "faqs": [
                {"q": "كيف أتغلب على داء التسويف في حياتي اليومية؟", "a": "بالبدء دائماً بالبسملة، واستغلال وقت البكور (بعد الفجر) لقوله صلى الله عليه وسلم: 'بورك لأمتي في بكورها'، ووضع أهداف واضحة ومحددة."},
                {"q": "ما هي أفضل طريقة للموازنة بين العمل والعبادة؟", "a": "باعتبار العمل الصالح وسيلة لكسب الرزق الحلال (وهو عبادة) وتنظيم جدول الأعمال بما يتوافق مع مواقيت الصلاة المفروضة."},
            ],
            "refs": ["سورة العصر (103)", "سنن الترمذي", "صحيح البخاري"]
        },
        "fr": {
            "summary": "Une perspective islamique sur la valeur profonde du temps et des moments de la vie.",
            "tldr": "Notre temps est un dépôt (Amanah) d'Allah sur lequel nous serons interrogés le jour du Jugement.",
            "body": "<p>En Islam, le temps est l'une des ressources les plus précieuses données à l'humanité. La sourate Al-Asr nous rappelle : 'Par le Temps ! L'homme est certes, en perdition, sauf ceux qui croient et accomplissent les bonnes œuvres, s'enjoignent mutuellement la vérité et s'enjoignent mutuellement l'endurance.' La vie d'un musulman est naturellement structurée autour des cinq prières quotidiennes, qui servent de cadre divin pour la gestion du temps, assurant un équilibre entre Dunya (vie mondaine) et Akhirah (au-delà). Le Prophète (PSL) nous a enseigné : 'Profite de cinq choses avant cinq autres : ta jeunesse avant ta vieillesse, ta santé avant ta maladie, ta richesse avant ta pauvreté, ton temps libre avant ton occupation, et ta vie avant ta mort.'</p>",
            "faqs": [
                {"q": "Comment puis-je éviter la procrastination dans ma vie quotidienne ?", "a": "Commencez vos tâches par Bismillah, utilisez les premières heures de la matinée après le Fajr (le temps de la Barakah) et fixez des intentions claires pour chaque action."},
                {"q": "Quelle est la meilleure façon de concilier travail et adoration ?", "a": "En considérant votre travail comme un moyen de fournir une subsistance halal (qui est en soi une adoration) et en structurant votre emploi du temps autour des heures fixes des prières quotidiennes."}
            ],
            "refs": ["Sourate Al-Asr (103:1-3)", "Sunan Tirmidhi", "Sahih Al-Bukhari"]
        },
        "id": {
            "summary": "Perspektif Islam tentang nilai waktu yang mendalam dan momen-momen kehidupan.",
            "tldr": "Waktu kita adalah amanah dari Allah yang akan dimintai pertanggungjawabannya di Hari Kiamat.",
            "body": "<p>Dalam Islam, waktu adalah salah satu sumber daya paling berharga yang diberikan kepada manusia. Surah Al-Asr mengingatkan kita: 'Demi masa. Sesungguhnya manusia itu benar-benar dalam kerugian, kecuali orang-orang yang beriman dan mengerjakan amal saleh dan nasehat menasehati supaya mentaati kebenaran dan nasehat menasehati supaya menetapi kesabaran.' Kehidupan seorang Muslim secara alami tersusun di sekitar lima waktu shalat, yang berfungsi sebagai kerangka ilahi untuk manajemen waktu, memastikan keseimbangan antara Dunia dan Akhirat. Rasulullah (SAW) mengajarkan kita untuk 'Manfaatkan lima perkara sebelum lima perkara: mudamu sebelum tuamu, sehatmu sebelum sakitmu, kayamu sebelum miskinmu, waktu luangmu sebelum sibukmu, dan hidupmu sebelum matimu.'</p>",
            "faqs": [
                {"q": "Bagaimana cara menghindari kebiasaan menunda-nunda?", "a": "Mulailah tugas Anda dengan Bismillah, manfaatkan waktu pagi setelah Subuh (waktu keberkahan), dan tetapkan niat yang jelas untuk setiap tindakan Anda."},
                {"q": "Apa cara terbaik menyeimbangkan pekerjaan dan ibadah?", "a": "Dengan memandang pekerjaan sebagai sarana mencari nafkah halal (yang merupakan ibadah) dan menyusun jadwal kerja di sekitar waktu shalat fardu."}
            ],
            "refs": ["Surah Al-Asr (103:1-3)", "Sunan Tirmidzi", "Sahih Bukhari"]
        }
    },
    "modesty-hijab": {
        "en": {
            "summary": "Understanding the profound concept of Haya (Modesty) and Hijab in Islam.",
            "tldr": "Modesty is not just a dress code; it is a fundamental part of faith (Iman) that encompasses speech, behavior, and dress.",
            "body": "<p>Modesty (Haya) is described by the Prophet (PBUH) as a branch of faith that brings nothing but good. In Islam, modesty is required from both men and women. For men, it primarily involves 'lowering the gaze' and maintaining respectful conduct. For women, it includes the Hijab, which is an act of obedience to Allah and a means of being recognized for one's character rather than appearance. The Quran commands: 'And tell the believing women to lower their gaze and guard their chastity, and not to reveal their adornments except what is normally apparent' (24:31). True modesty is an internal state of being mindful of Allah's presence in all situations.</p>",
            "faqs": [
                {"q": "Is Hijab only about the headscarf?", "a": "No, Hijab encompasses the entire way a person carries themselves, including loose-fitting clothing that covers the body correctly, as well as modest speech and behavior."},
                {"q": "How does a man practice modesty (Haya)?", "a": "A man practices modesty by lowering his gaze, avoiding inappropriate interactions, and dressing in a way that is respectful and covers his 'Awrah' (from navel to knee)."}
            ],
            "refs": ["Surah An-Nur (24:30-31)", "Sahih Bukhari", "Sahih Muslim"]
        },
        "tr": {
            "summary": "İslam'da Haya (Edep) ve Tesettür kavramını derinlemesine anlamak.",
            "tldr": "Haya sadece bir kıyafet kuralı değildir; konuşmayı, davranışı ve giyimi kapsayan imanın temel bir parçasıdır.",
            "body": "<p>Haya, Peygamber Efendimiz (S.A.V) tarafından ancak hayır getiren bir iman şubesi olarak tanımlanmıştır. İslam'da haya hem erkekten hem de kadından istenir. Erkekler için bu, öncelikle 'gözlerini haramdan sakınmak' ve saygılı bir tutum sergilemekle ilgilidir. Kadınlar için ise, Allah'a bir itaat eylemi olan ve kişinin dış görünüşünden ziyade şahsiyetiyle tanınmasını sağlayan Tesettür'ü içerir. Kuran-ı Kerim şöyle emreder: 'Mümin kadınlara da söyle, gözlerini haramdan sakınsınlar ve iffetlerini korusunlar...' (Nur 31). Gerçek haya, her durumda Allah'ın huzurunda olduğunun bilincinde olma halidir.</p>",
            "faqs": [
                {"q": "Tesettür sadece başörtüsünden mi ibarettir?", "a": "Hayır, tesettür kişinin kendini taşıma biçiminin tamamını kapsar; vücut hatlarını belli etmeyen uygun giyimin yanı sıra edepli konuşma ve davranışı da içerir."},
                {"q": "Bir erkek haya ve edebi nasıl uygular?", "a": "Bir erkek, bakışlarını haramdan kaçırarak, uygunsuz ortamlardan uzak durarak ve avret mahallerini (göbekten diz kapağına kadar) örtecek şekilde vakur giyinerek hayayı yaşar."}
            ],
            "refs": ["Nur Suresi (24:30-31)", "Sahih-i Buhari", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "فهم مفهوم الحياء والحجاب العميق في ميزان الشريعة الإسلامية.",
            "tldr": "الحياء ليس مجرد مظهر خارجي، بل هو شعبة من الإيمان تشمل القول والفعل واللباس.",
            "body": "<p>وصف النبي صلى الله عليه وسلم الحياء بأنه 'لا يأتي إلا بخير' وأنه شعبة من شعب الإيمان. الحياء في الإسلام مطلب للرجل والمرأة على حد سواء. فبالنسبة للرجل، يتمثل الحياء أولاً في 'غض البصر' والالتزام بالسلوك الوقور. أما بالنسبة للمرأة، فيشمل الحجاب الذي هو طاعة لله ووسيلة لأن تُعرف بعقلها وخلقها لا بمفاتنها. يقول تعالى: 'وَقُل لِّلْمُؤْمِنَاتِ يَغْضُضْنَ مِنْ أَبْصَارِهِنَّ وَيَحْفَظْنَ فُرُوجَهُنَّ وَلَا يُبْدِينَ زِينَتَهُنَّ إِلَّا مَا ظَهَرَ مِنْهَا' (النور 31). إن الحياء الحقيقي هو استحضار مراقبة الله في السر والعلن.</p>",
            "faqs": [
                {"q": "هل الحجاب مجرد غطاء للرأس؟", "a": "لا، الحجاب مفهوم شامل يتضمن اللباس الساتر الواسع الذي لا يصف ولا يشف، بالإضافة إلى الحياء في الكلام والتعامل مع الآخرين."},
                {"q": "كيف يمارس الرجل خلق الحياء؟", "a": "يمارس الرجل الحياء بغض بصره عن المحرمات، وتجنب الخلوة المحرمة، والالتزام باللباس الذي يستر عورته (من السرة إلى الركبة) وبما يليق بوقار المسلم."},
            ],
            "refs": ["سورة النور (30-31)", "صحيح البخاري", "صحيح مسلم"]
        },
        "fr": {
            "summary": "Comprendre le concept profond de Haya (Pudeur) et de Hijab en Islam.",
            "tldr": "La pudeur n'est pas seulement un code vestimentaire ; c'est une partie fondamentale de la foi (Iman).",
            "body": "<p>La pudeur (Haya) est décrite par le Prophète (PSL) comme une branche de la foi qui n'apporte que du bien. En Islam, la pudeur est exigée tant des hommes que des femmes. Pour les hommes, cela implique principalement de 'baisser le regard' et de maintenir une conduite respectueuse. Pour les femmes, cela inclut le Hijab, qui est un acte d'obéissance à Allah et un moyen d'être reconnue pour son caractère plutôt que pour son apparence. Le Coran ordonne : 'Et dis aux croyantes de baisser leurs regards, de garder leur chasteté, et de ne montrer de leurs atours que ce qui en paraît' (24:31). La vraie pudeur est un état interne de conscience de la présence d'Allah.</p>",
            "faqs": [
                {"q": "Le Hijab se résume-t-il au foulard ?", "a": "Non, le Hijab englobe toute la façon dont une personne se présente, y compris des vêtements amples qui couvrent correctement le corps, ainsi qu'une parole et un comportement pudiques."},
                {"q": "Comment un homme pratique-t-il la pudeur (Haya) ?", "a": "Un homme pratique la pudeur en baissant son regard, en évitant les interactions inappropriées et en s'habillant de manière respectueuse en couvrant sa 'Awrah' (du nombril au genou)."}
            ],
            "refs": ["Sourate An-Nur (24:30-31)", "Sahih Al-Bukhari", "Sahih Muslim"]
        },
        "id": {
            "summary": "Memahami konsep mendalam Haya (Malu/Kesopanan) dan Hijab dalam Islam.",
            "tldr": "Malu bukan sekadar aturan berpakaian; ia adalah bagian mendasar dari iman yang mencakup ucapan, perilaku, dan pakaian.",
            "body": "<p>Malu (Haya) digambarkan oleh Rasulullah (SAW) sebagai cabang iman yang tidak mendatangkan apa-apa selain kebaikan. Dalam Islam, sifat malu dituntut baik dari pria maupun wanita. Bagi pria, hal ini terutama melibatkan 'menundukkan pandangan' dan menjaga perilaku yang hormat. Bagi wanita, ini mencakup Hijab, yang merupakan bentuk ketaatan kepada Allah dan sarana agar seseorang dikenal karena akhlaknya daripada penampilannya. Al-Quran memerintahkan: 'Katakanlah kepada wanita yang beriman: Hendaklah mereka menahan pandangannya, dan memelihara kemaluannya, dan janganlah mereka menampakkan perhiasannya, kecuali yang (biasa) nampak daripadanya' (24:31). Malu yang sejati adalah kesadaran batin akan kehadiran Allah dalam segala situasi.</p>",
            "faqs": [
                {"q": "Apakah Hijab hanya tentang kerudung saja?", "a": "Tidak, Hijab mencakup seluruh cara seseorang membawa diri, termasuk pakaian longgar yang menutup aurat dengan benar, serta ucapan dan perilaku yang sopan."},
                {"q": "Bagaimana seorang pria mempraktikkan rasa malu (Haya)?", "a": "Seorang pria mempraktikkan rasa malu dengan menundukkan pandangannya, menghindari interaksi yang tidak pantas, dan berpakaian sopan yang menutup auratnya (dari pusar hingga lutut)."}
            ],
            "refs": ["Surah An-Nur (24:30-31)", "Sahih Bukhari", "Sahih Muslim"]
        }
    },
    "animal-rights": {
        "en": {
            "summary": "Compassion towards animals as a manifestation of Islamic mercy.",
            "tldr": "Islam strictly forbids cruelty to animals and teaches that serving them can be a path to divine forgiveness.",
            "body": "<p>In Islam, animals are part of Allah's creation and must be treated with kindness. The Prophet (PBUH) told the famous story of a man who found a thirsty dog in the desert, climbed down a well to fetch water in his shoe, and quenched the dog's thirst; for this act, Allah forgave all his sins. Conversely, we are warned about a woman who was punished because she imprisoned a cat without feeding it. Islam also provides strict guidelines for animal slaughter to ensure the animal feels the least amount of pain, emphasizing that mercy should be the core of every interaction with a living soul.</p>",
            "faqs": [
                {"q": "Is it permissible to keep pets like cats or dogs?", "a": "Keeping cats is highly encouraged as they are clean animals. Dogs are generally kept for guarding or hunting purposes outside the living quarters, but they must always be treated with kindness and care."},
                {"q": "What does Islam say about animal welfare in modern industries?", "a": "Islam mandates that animals should not be overburdened, must be given adequate food and rest, and should not be mistreated for entertainment or profit."}
            ],
            "refs": ["Sahih Bukhari", "Sahih Muslim", "Musnad Ahmad"]
        },
        "tr": {
            "summary": "İslami merhametin bir tecellisi olarak hayvan hakları.",
            "tldr": "İslam, hayvanlara eziyeti kesinlikle yasaklar ve onlara hizmet etmenin ilahi bağışlanmaya vesile olabileceğini öğretir.",
            "body": "<p>İslam'da hayvanlar Allah'ın yarattığı canlılar olarak kabul edilir ve onlara şefkatle muamele edilmesi gerekir. Peygamber Efendimiz (S.A.V), çölde susuz kalmış bir köpek bulan, kuyudan ayakkabısıyla su çıkarıp köpeğin susuzluğunu gideren ve bu sayede Allah'ın affına mazhar olan bir adamın hikayesini anlatmıştır. Tam aksine, bir kediyi aç bırakarak hapseden ve bu yüzden azaba uğrayan bir kadından da bahsederek bizleri uyarmıştır. İslam ayrıca, hayvanın en az acı çekmesini sağlamak için kesim kuralları getirmiş, her canlıya karşı merhametin esas olduğunu vurgulamıştır.</p>",
            "faqs": [
                {"q": "Kedi veya köpek gibi evcil hayvan beslemek caiz mi?", "a": "Kedi beslemek temiz bir hayvan olduğu için teşvik edilmiştir. Köpekler genellikle koruma veya av amaçlı bahçede tutulur ancak onlara da her zaman merhamet ve ilgi gösterilmesi zorunludur."},
                {"q": "Modern endüstride hayvan hakları hakkında İslam ne der?", "a": "İslam, hayvanlara taşıyamayacakları yük vurulmamasını, yeterli gıda ve dinlenme imkanı sağlanmasını ve eğlence veya çıkar uğruna kötü muamele edilmemesini emreder."}
            ],
            "refs": ["Sahih-i Buhari", "Sahih-i Müslim", "Müsned-i Ahmed"]
        },
        "ar": {
            "summary": "الرفق بالحيوان كمظهر من مظاهر الرحمة الإسلامية.",
            "tldr": "يُحرم الإسلام القسوة على الحيوان ويجعل الإحسان إليه سبباً في نيل المغفرة الإلهية.",
            "body": "<p>الحيوانات في الإسلام أمم أمثالنا ولها حقوق يجب مراعاتها. روى النبي صلى الله عليه وسلم قصة رجل نزل بئراً فملأ خفه ماءً لسقاية كلب يلهث من العطش، فشكر الله له فغفر له. وفي المقابل، حذرنا من امرأة دخلت النار في هرّة حبستها فلا هي أطعمتها ولا هي تركتها تأكل من خشاش الأرض. كما وضع الإسلام ضوابط عند الذبح تضمن عدم تعذيب الحيوان، مؤكداً على أن الرحمة يجب أن تكون هي الأصل في التعامل مع كل ذي روح.</p>",
            "faqs": [
                {"q": "هل يجوز اقتناء الحيوانات الأليفة؟", "a": "اقتناء القطط مستحب لأنها من الطوافين علينا، أما الكلاب فتقتنى للحراسة أو الصيد خارج غرف السكن، ومع ذلك يجب إطعامها ورحمتها في كل حال."},
                {"q": "ماذا يقول الإسلام عن حقوق الحيوان في المزارع والعمل؟", "a": "يأمر الإسلام بعدم تحميل الحيوان ما لا يطيق، ووجوب توفير الطعام والراحة له، وتحريم اتخاذ الحيوانات غرضاً للرمي أو التسلية العنيفة."},
            ],
            "refs": ["صحيح البخاري", "صحيح مسلم", "مسند أحمد"]
        },
        "fr": {
            "summary": "La compassion envers les animaux comme manifestation de la miséricorde islamique.",
            "tldr": "L'Islam interdit strictement la cruauté envers les animaux et enseigne que les servir peut mener au pardon divin.",
            "body": "<p>En Islam, les animaux font partie de la création d'Allah et doivent être traités avec gentillesse. Le Prophète (PSL) a raconté l'histoire célèbre d'un homme qui a trouvé un chien assoiffé dans le désert et lui a donné à boire avec sa chaussure ; pour cet acte, Allah lui a pardonné ses péchés. À l'inverse, nous sommes mis en garde contre une femme punie pour avoir emprisonné un chat sans le nourrir. L'Islam fournit également des directives strictes pour l'abattage afin de minimiser la douleur, soulignant que la miséricorde doit être au cœur de chaque interaction avec une âme vivante.</p>",
            "faqs": [
                {"q": "Est-il permis de garder des animaux comme des chats ou des chiens ?", "a": "Garder des chats est encouragé car ce sont des animaux propres. Les chiens sont généralement gardés pour la garde ou la chasse à l'extérieur, mais ils doivent toujours être traités avec bonté."},
                {"q": "Que dit l'Islam sur le bien-être animal dans l'industrie moderne ?", "a": "L'Islam mandate que les animaux ne soient pas surchargés, reçoivent nourriture et repos adéquats, et ne soient pas maltraités pour le divertissement ou le profit."}
            ],
            "refs": ["Sourate Al-Hujurat", "Sahih Al-Bukhari", "Sahih Muslim", "Musnad Ahmad"]
        },
        "id": {
            "summary": "Kasih sayang terhadap hewan sebagai manifestasi rahmat Islami.",
            "tldr": "Islam melarang keras kekejaman terhadap hewan dan mengajarkan bahwa berbuat baik kepada mereka adalah jalan pengampunan.",
            "body": "<p>Dalam Islam, hewan adalah bagian dari makhluk Allah yang harus diperlakukan dengan penuh kasih sayang. Rasulullah (SAW) menceritakan kisah seorang pria yang memberi minum anjing yang haus di gurun pasir; atas perbuatannya itu, Allah mengampuni dosa-dosanya. Sebaliknya, kita diperingatkan tentang seorang wanita yang disiksa karena mengurung kucing tanpa memberinya makan. Islam juga memberikan pedoman ketat dalam penyembelihan untuk memastikan rasa sakit yang minimal, menekankan bahwa rahmat harus menjadi inti dari setiap interaksi dengan makhluk bernyawa.</p>",
            "faqs": [
                {"q": "Bolehkah memelihara hewan seperti kucing atau anjing?", "a": "Memelihara kucing sangat dianjurkan karena kesuciannya. Anjing biasanya dipelihara untuk menjaga rumah atau berburu di luar ruangan, namun tetap harus diperlakukan dengan kasih sayang dan dirawat dengan baik."},
                {"q": "Apa cara terbaik menyeimbangkan pekerjaan dan ibadah?", "a": "Di industri modern, Islam mewajibkan agar hewan tidak dibebani melampaui batas kemampuannya, harus diberi makan dan istirahat yang cukup, serta dilarang disiksa untuk hiburan."}
            ],
            "refs": ["Surah Al-Hujurat", "Sahih Bukhari", "Sahih Muslim", "Musnad Ahmad"]
        }
    },
    "halal-food": {
        "en": {
            "summary": "The vital importance of consuming Halal and Tayyib (Pure/Wholesome) food.",
            "tldr": "Eating Halal is not just a dietary choice but a spiritual necessity for the acceptance of prayers.",
            "body": "<p>Islam emphasizes that what we consume directly affects our spiritual health. Allah commands: 'Eat of what is on earth, lawful and good' (2:168). The term 'Tayyib' goes beyond mere 'Halal' (permissible) to mean pure, wholesome, and ethically sourced. Consuming 'Haram' darkens the heart and is cited by the Prophet (PBUH) as a primary reason why Duas are not answered. This includes avoiding not only pork and alcohol but also meat that has not been slaughtered in the name of Allah or food acquired through dishonest means.</p>",
            "faqs": [
                {"q": "How does 'Tayyib' differ from 'Halal'?", "a": "While 'Halal' refers to what is permissible under Islamic law, 'Tayyib' refers to the quality and ethical nature of the food, ensuring it is healthy, clean, and produced without exploitation."},
                {"q": "What should I do if I am unsure about a food product?", "a": "Islam teaches us to leave what is doubtful for what is certain. If a product's ingredients are unclear, it is better to avoid it or seek certification from a trusted Halal authority."}
            ],
            "refs": ["Surah Al-Baqarah (2:168)", "Surah Al-Ma'idah (5:88)", "Sahih Muslim"]
        },
        "tr": {
            "summary": "Helal ve Tayyib (Temiz/Hoş) gıda tüketmenin hayati önemi.",
            "tldr": "Helal yemek sadece bir diyet tercihi değil, duaların kabulü için manevi bir zorunluluktur.",
            "body": "<p>İslam, tükettiğimiz şeylerin manevi sağlığımızı doğrudan etkilediğini vurgular. Allah: 'Yeryüzündeki şeylerin helal ve temiz olanlarından yiyin' (Bakara 168) buyurur. 'Tayyib' terimi, sadece 'Helal' (izin verilen) olmanın ötesine geçerek; temiz, sağlıklı ve etik yollarla elde edilmiş anlamına gelir. Haram tüketmek kalbi köreltir ve Peygamber Efendimiz (S.A.V) tarafından duaların kabul edilmemesinin temel nedenlerinden biri olarak gösterilmiştir. Bu, sadece domuz eti ve alkolden kaçınmayı değil, aynı zamanda Allah'ın adı anılmadan kesilen etlerden ve dürüst olmayan yollarla kazanılan kazançlarla alınan gıdalardan da uzak durmayı kapsar.</p>",
            "faqs": [
                {"q": "'Tayyib' kavramının 'Helal'den farkı nedir?", "a": "Helal, İslami kurallara göre izin verilen gıdaları ifade ederken; Tayyib, gıdanın kalitesini, saflığını ve üretimindeki etik değerleri (sağlıklı olması, temizliği, sömürü olmaması) ifade eder."},
                {"q": "Bir gıda ürünü hakkında şüpheye düşersem ne yapmalıyım?", "a": "İslam bize 'şüpheliyi bırak, şüphesiz olana bak' ilkesini öğretir. Bir ürünün içeriği net değilse, ondan kaçınmak veya güvenilir bir helal sertifikası aramak en iyisidir."}
            ],
            "refs": ["Bakara Suresi (2:168)", "Maide Suresi (5:88)", "Sahih-i Müslim"]
        },
        "ar": {
            "summary": "الأهمية البالغة لتناول الطعام الحلال والطيّب في الإسلام.",
            "tldr": "أكل الحلال ليس مجرد نظام غذائي، بل هو ضرورة روحية لاستجابة الدعاء وصلاح القلب.",
            "body": "<p>يؤكد الإسلام أن ما نستهلكه يؤثر بشكل مباشر على صحتنا الروحية. قال تعالى: 'كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا' (البقرة 168). ومفهوم 'الطيّب' يتجاوز مجرد 'الحلال' ليعني النزاهة والجودة والعدالة في المصدر. إن أكل الحرام يظلم القلب، وقد ذكره النبي صلى الله عليه وسلم كسبب رئيسي لعدم استجابة الدعاء. يشمل ذلك تجنب الخنزير والخمر، وكذلك اللحوم التي لم تذبح بذكر اسم الله عليها، أو الطعام المكتسب بمال غير مشروع كالربا والغش.</p>",
            "faqs": [
                {"q": "ما الفرق بين 'الحلال' و 'الطيّب'؟", "a": "الحلال هو ما أباحه الشرع فعله وتناوله، أما الطيّب فهو ما كان نقياً، نافعاً، وخالياً من الخبث أو الظلم في المعاملة."},
                {"q": "ماذا أفعل إذا شككت في منتج غذائي؟", "a": "يعلمنا الإسلام مبدأ 'دع ما يريبك إلى ما لا يريبك'. فإذا كانت مكونات المنتج غامضة، فالأولى تركه أو التأكد من جهة موثوقة تمنح شهادات الحلال."},
            ],
            "refs": ["سورة البقرة (168)", "سورة المائدة (88)", "صحيح مسلم"]
        },
        "fr": {
            "summary": "L'importance vitale de consommer de la nourriture Halal et Tayyib (Pure/Saine).",
            "tldr": "Manger Halal n'est pas seulement un choix alimentaire mais une nécessité spirituelle pour l'exaucement des prières.",
            "body": "<p>L'Islam souligne que ce que nous consommons affecte directement notre santé spirituelle. Allah ordonne : 'Mangez de ce qui est sur terre, licite et bon' (2:168). Le terme 'Tayyib' va au-delà du simple 'Halal' (licite) pour signifier pur, sain et sourcé de manière éthique. Consommer du 'Haram' assombrit le cœur et est cité par le Prophète (PSL) comme une raison majeure pour laquelle les Duas ne sont pas exaucées. Cela inclut non seulement d'éviter le porc et l'alcool, mais aussi la viande qui n'a pas été abattue au nom d'Allah ou la nourriture acquise par des moyens malhonnêtes.</p>",
            "faqs": [
                {"q": "En quoi le 'Tayyib' diffère-t-il du 'Halal' ?", "a": "Alors que le 'Halal' se réfère à ce qui est permis par la loi islamique, le 'Tayyib' se réfère à la qualité et à la nature éthique de la nourriture, garantissant qu'elle est saine, propre et produite sans exploitation."},
                {"q": "Que dois-je faire si j'ai un doute sur un produit alimentaire ?", "a": "L'Islam nous enseigne de délaisser ce qui est douteux pour ce qui est certain. Si les ingrédients d'un produit ne sont pas clairs, il vaut mieux l'éviter ou chercher une certification d'une autorité Halal de confiance."}
            ],
            "refs": ["Sourate Al-Baqarah (2:168)", "Sourate Al-Ma'idah (5:88)", "Sahih Muslim"]
        },
        "id": {
            "summary": "Pentingnya mengonsumsi makanan Halal dan Tayyib (Baik/Murni).",
            "tldr": "Makan makanan Halal bukan sekadar pilihan diet, melainkan kebutuhan spiritual agar doa dikabulkan.",
            "body": "<p>Islam menekankan bahwa apa yang kita konsumsi berpengaruh langsung pada kesehatan spiritual kita. Allah memerintahkan: 'Makanlah makanan yang halal lagi baik dari apa yang terdapat di bumi' (2:168). Istilah 'Tayyib' bermakna lebih luas dari sekadar 'Halal' (diizinkan), yaitu murni, sehat, dan diperoleh dengan cara yang etis. Mengonsumsi 'Haram' dapat menggelapkan hati dan disebutkan oleh Rasulullah (SAW) sebagai penyebab utama doa tidak dikabulkan. Ini mencakup menghindari tidak hanya babi dan alkohol, tetapi juga daging yang tidak disembelih atas nama Allah atau makanan yang dibeli dari hasil menipu.</p>",
            "faqs": [
                {"q": "Apa perbedaan antara 'Tayyib' dan 'Halal'?", "a": "'Halal' mengacu pada apa yang diizinkan hukum syara, sedangkan 'Tayyib' mengacu pada kualitas dan kebaikan makanan tersebut, memastikan makanan itu sehat, bersih, dan diproduksi tanpa kezaliman."},
                {"q": "Apa yang harus saya lakukan jika ragu terhadap suatu produk makanan?", "a": "Islam mengajarkan untuk meninggalkan apa yang meragukan. Jika bahan suatu produk tidak jelas, lebih baik menghindarinya atau mencari sertifikasi dari lembaga Halal yang terpercaya."}
            ],
            "refs": ["Surah Al-Baqarah (2:168)", "Surah Al-Ma'idah (5:88)", "Sahih Muslim"]
        }
    },
    "social-media-ethics": {
        "en": {
            "summary": "Navigating the complex digital world with Islamic Adab (Etiquette).",
            "tldr": "Every word typed is a word spoken; a Muslim is responsible for their digital footprint before Allah.",
            "body": "<p>In the digital age, social media is an extension of our character. Allah warns us: 'O you who have believed, if there comes to you a disobedient one with information, investigate, lest you harm a people out of ignorance' (49:6). Islamic ethics on social media involve verifying news before sharing, avoiding backbiting (Gheebah) even in comments, and not wasting precious time in idle talk. A believer should use these platforms as a means to spread goodness (Dawah), benefit the community, and promote truth, while being mindful that our 'digital tongue' will also testify for or against us on the Day of Judgment.</p>",
            "faqs": [
                {"q": "How can I handle online arguments Islamically?", "a": "The Prophet (PBUH) promised a house in the outskirts of Paradise for one who gives up an argument even if they are right. It is better to leave peaceful advice and move on than to engage in toxicity."},
                {"q": "Is it okay to use an anonymous profile?", "a": "Anonymity does not lift the Islamic obligation of truthfulness and kindness. You are still responsible for your actions, and Allah is Always-Watching (Ar-Raqib)."}
            ],
            "refs": ["Surah Al-Hujurat (49:6-12)", "Sahih Muslim", "Surah Qaf (50:18)"]
        },
        "tr": {
            "summary": "Karmaşık dijital dünyada İslami Edep ile yol almak.",
            "tldr": "Yazılan her kelime söylenmiş bir sözdür; Müslüman dijital ayak izinden Allah katında sorumludur.",
            "body": "<p>Dijital çağda sosyal medya karakterimizin bir uzantısıdır. Allah bizleri şöyle uyarır: 'Ey iman edenler! Size bir fasık bir haber getirirse, bilmeyerek bir topluluğa zarar vermemek için onu iyice araştırın' (Hucurat 6). Sosyal medyadaki İslami ahlak; haberi paylaşmadan önce doğrulamayı, yorumlarda bile gıybetten kaçınmayı ve kıymetli vakti boş konuşmalarla israf etmemeyi gerektirir. Bir mümin bu platformları hayrı yaymak, topluma fayda sağlamak ve hakikati savunmak için bir vesile olarak kullanmalı, 'dijital dilimizin' de Kıyamet Günü lehine veya aleyhine şahitlik edeceğini unutmamalıdır.</p>",
            "faqs": [
                {"q": "İnternetteki tartışmalarla İslami olarak nasıl başa çıkabilirim?", "a": "Efendimiz (S.A.V), haklı olsa bile tartışmayı bırakan kimseye cennetin kenarında bir köşk sözü vermiştir. Zehirli bir dil yerine sakin bir nasihat bırakıp uzaklaşmak en iyisidir."},
                {"q": "Anonim bir profil kullanmak caiz mi?", "a": "Anonimlik, doğruluk ve nezaket gibi İslami yükümlülükleri ortadan kaldırmaz. Yaptıklarınızdan hala sorumlusunuz ve Allah her şeyi hakkıyla görendir (Er-Rakıb)."}
            ],
            "refs": ["Hucurat Suresi (49:6-12)", "Sahih-i Müslim", "Kaf Suresi (50:18)"]
        },
        "ar": {
            "summary": "التعامل مع العالم الرقمي المعقد بآداب الإسلام وأخلاقه.",
            "tldr": "كل كلمة تكتب هي كلمة تنطق؛ المسلم مسؤول عن أثره الرقمي أمام الله عز وجل.",
            "body": "<p>في العصر الرقمي، تعتبر وسائل التواصل الاجتماعي امتداداً لشخصيتنا وخلقنا. يقول تعالى: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا أَن تُصِيبُوا قَوْمًا بِجَهَالَةٍ' (الحجرات 6). آداب المسلم الرقمية تشمل التثبت من الأخبار قبل نشرها، واجتناب الغيبة حتى في التعليقات، وعدم إضاعة الوقت الثمين في اللغو. يجب على المؤمن استخدام هذه المنصات لنشر الخير، ونفع الناس، وإعلاء كلمة الحق، مستحضراً أن 'لسانه الرقمي' سيشهد له أو عليه يوم الحساب.</p>",
            "faqs": [
                {"q": "كيف أتعامل مع الجدال عبر الإنترنت بوعي إسلامي؟", "a": "ضمن النبي صلى الله عليه وسلم بيتاً في ربض الجنة لمن ترك المراء (الجدال) وإن كان محقاً. الأفضل تقديم النصيحة بالرفق ثم الانسحاب بدلاً من الانجرار خلف المهاترات."},
                {"q": "هل يجوز استخدام حساب بمؤثرات مجهولة (اسم مستعار)؟", "a": "التستر خلف اسم مستعار لا يعفي المسلم من الالتزام بالصدق وحسن الخلق. فأنت مسؤول عن كل حرف، والله تعالى هو الرقيب والخبير."}
            ],
            "refs": ["سورة الحجرات (6-12)", "صحيح مسلم", "سورة ق (18)"]
        },
        "fr": {
            "summary": "Naviguer dans le monde numérique complexe avec l'Adab (étiquette) islamique.",
            "tldr": "Chaque mot tapé est un mot prononcé ; un musulman est responsable de son empreinte numérique devant Allah.",
            "body": "<p>À l'ère du numérique, les réseaux sociaux sont une extension de notre caractère. Allah nous avertit : 'Ô vous qui avez cru ! Si un pervers vous apporte une nouvelle, voyez bien clair, de crainte que vous n'en fassiez regret à des gens par ignorance' (49:6). L'éthique islamique sur les réseaux sociaux implique de vérifier les informations avant de les partager, d'éviter la médisance (Gheebah) même dans les commentaires, et de ne pas perdre de temps précieux en bavardages futiles. Un croyant doit utiliser ces plateformes pour répandre le bien (Dawah), bénéficier à la communauté et promouvoir la vérité, tout en gardant à l'esprit que notre 'langue numérique' témoignera pour ou contre nous le jour du Jugement.</p>",
            "faqs": [
                {"q": "Comment puis-je gérer les disputes en ligne de manière islamique ?", "a": "Le Prophète (PSL) a promis une maison aux abords du Paradis à celui qui renonce à une dispute même s'il a raison. Il vaut mieux laisser un conseil paisible et passer à autre chose."},
                {"q": "Est-il acceptable d'utiliser un profil anonyme ?", "a": "L'anonymat ne lève pas l'obligation islamique de véracité et de gentillesse. Vous êtes toujours responsable de vos actes, et Allah est Celui qui observe tout (Ar-Raqib)."}
            ],
            "refs": ["Sourate Al-Hujurat (49:6-12)", "Sahih Muslim", "Sourate Qaf (50:18)"]
        },
        "id": {
            "summary": "Menavigasi dunia digital yang kompleks dengan Adab (Etika) Islam.",
            "tldr": "Setiap kata yang diketik adalah kata yang diucapkan; seorang Muslim bertanggung jawab atas jejak digitalnya di hadapan Allah.",
            "body": "<p>Di era digital, media sosial adalah perpanjangan dari karakter kita. Allah memperingatkan: 'Wahai orang-orang yang beriman, jika datang kepadamu orang fasik membawa suatu berita, maka periksalah dengan teliti agar kamu tidak menimpakan suatu musibah kepada suatu kaum tanpa mengetahui keadaannya' (49:6). Etika Islam di media sosial melibatkan verifikasi berita sebelum dibagikan, menghindari ghibah (gunjingan) bahkan dalam komentar, dan tidak membuang waktu berharga dalam pembicaraan sia-sia. Seorang mukmin harus menggunakan platform ini untuk menyebarkan kebaikan (Dakwah), memberikan manfaat bagi masyarakat, dan mempromosikan kebenaran, sambil menyadari bahwa 'lidah digital' kita juga akan bersaksi untuk atau melawan kita di Hari Kiamat.</p>",
            "faqs": [
                {"q": "Bagaimana cara menangani perdebatan di dunia maya secara Islami?", "a": "Rasulullah (SAW) menjamin sebuah rumah di pinggir surga bagi orang yang meninggalkan perdebatan meskipun ia benar. Lebih baik memberikan nasihat yang santun lalu meninggalkannya daripada terlibat dalam interaksi yang negatif."},
                {"q": "Bolehkah menggunakan profil anonim?", "a": "Anonimitas tidak menghapus kewajiban Islam untuk bersikap jujur dan santun. Anda tetap bertanggung jawab atas tindakan Anda, dan Allah Maha Mengawasi (Ar-Raqib)."}
            ],
            "refs": ["Surah Al-Hujurat (49:6-12)", "Sahih Muslim", "Surah Qaf (50:18)"]
        }
    },
    "best-apps-2026": {
        "en": {
            "summary": "Top Islamic Apps to boost your productivity, focus, and faith in 2026.",
            "tldr": "Technology is a tool for spiritual growth. Discover apps that help you stay consistent with your Deen.",
            "body": "<p>In 2026, technology has become an indispensable companion for the modern Muslim. While the digital world offers many distractions, dedicated Islamic apps provide a sanctuary for spiritual growth. Key categories to look for include: 1) Advanced Prayer Trackers that utilize precise local calculations, 2) Digital Dhikr and Zikirmatik counters with haptic feedback, 3) Interactive Quran platforms for Tajweed and Tafseer, and 4) Community Feeds for shared prayers and support. Apps like Islamvy are leading the way by integrating all these features into a single, beautiful user experience, helping believers maintain 'Istiqaamah' (steadfastness) in a busy world.</p>",
            "faqs": [
                {"q": "What makes an Islamic app reliable?", "a": "A reliable app uses verified sources for Quran and Hadith, offers precise prayer time calculations (like those found in Islamvy), and respects user privacy without selling data."},
                {"q": "How can I avoid distractions while using apps?", "a": "Use apps that have clean, ad-free interfaces and enable 'Focus Mode' or 'App Timers' to ensure your screen time is productive and mindful."}
            ],
            "refs": ["Digital Ethics in Islam", "Islamic Productivity Systems", "Islamvy User Guide"]
        },
        "tr": {
            "summary": "2026'da üretkenliğinizi, odağınızı ve imanınızı artıracak en iyi İslami Uygulamalar.",
            "tldr": "Teknoloji manevi gelişim için bir araçtır. Dininize bağlı kalmanıza yardımcı olan uygulamaları keşfedin.",
            "body": "<p>2026 yılında teknoloji, modern Müslüman için vazgeçilmez bir yol arkadaşı haline gelmiştir. Dijital dünya birçok dikkat dağıtıcı unsur sunsa da, özel İslami uygulamalar manevi gelişim için bir sığınak sağlar. Aranan temel kategoriler şunlardır: 1) Hassas yerel hesaplamalar kullanan gelişmiş Namaz Takipçileri, 2) Dokunsal geri bildirimli Dijital Zikirmatikler, 3) Tecvid ve Tefsir için etkileşimli Kuran platformları ve 4) Paylaşılan dualar ve destek için topluluk akışları. Islamvy gibi uygulamalar, tüm bu özellikleri tek bir estetik kullanıcı deneyiminde birleştirerek, inananların yoğun bir dünyada 'İstikametlerini' korumalarına yardımcı olmaktadır.</p>",
            "faqs": [
                {"q": "Bir İslami uygulamayı güvenilir kılan nedir?", "a": "Güvenilir bir uygulama Kuran ve Hadis için doğrulanmış kaynaklar kullanır, (Islamvy'de olduğu gibi) hassas namaz vakti hesaplamaları sunar ve kullanıcı verilerini satmadan gizliliğe saygı duyar."},
                {"q": "Uygulamaları kullanırken dikkat dağınıklığını nasıl önleyebilirim?", "a": "Temiz ve reklamsız arayüzü olan uygulamaları tercih edin ve ekran sürenizin verimli geçmesini sağlamak için 'Odak Modu' gibi araçları kullanın."}
            ],
            "refs": ["İslam'da Dijital Ahlak", "İslami Üretkenlik Sistemleri", "Islamvy Kullanım Kılavuzu"]
        },
        "ar": {
            "summary": "أفضل التطبيقات الإسلامية لتعزيز الإنتاجية والتركيز والإيمان في عام 2026.",
            "tldr": "التكنولوجيا أداة للنمو الروحي. اكتشف التطبيقات التي تساعدك على الثبات على دينك.",
            "body": "<p>في عام 2026، أصبحت التكنولوجيا رفيقاً لا غنى عنه للمسلم المعاصر. وبينما يقدم العالم الرقمي العديد من الملهيات، توفر التطبيقات الإسلامية المتخصصة ملاذاً للنمو الروحي. تشمل الفئات الرئيسية المتوفرة: 1) متتبعات الصلاة المتقدمة التي تستخدم حسابات محلية دقيقة، 2) عدادات الذكر الرقمية مع خاصية الاهتزاز، 3) منصات القرآن التفاعلية للتجويد والتفسير، و 4) منصات التواصل الاجتماعي للمشاركة في الدعاء والختمات. وتتصدر تطبيقات مثل Islamvy الطريق من خلال دمج كل هذه الميزات في تجربة مستخدم واحدة وجميلة، مما يساعد المؤمنين على الحفاظ على 'الاستقامة' في عالم مليء بالمشغلات.</p>",
            "faqs": [
                {"q": "ما الذي يجعل التطبيق الإسلامي موثوقاً؟", "a": "التطبيق الموثوق يستخدم مصادر معتمدة للقرآن والحديث، ويقدم حسابات دقيقة لمواقيت الصلاة (مثل تلك الموجودة في Islamvy)، ويحترم خصوصية المستخدمين."},
                {"q": "كيف أتجنب الملهيات أثناء استخدام التطبيقات؟", "a": "استخدم التطبيقات ذات الواجهات النظيفة والخالية من الإعلانات المزعجة، وفعل ميزات 'وضع التركيز' لضمان أن يكون وقت الشاشة مثمراً وذا مغزى."}
            ],
            "refs": ["الأخلاق الرقمية في الإسلام", "أنظمة الإنتاجية الإسلامية", "دليل مستخدم Islamvy"]
        },
        "fr": {
            "summary": "Les meilleures applications islamiques pour booster votre productivité, votre concentration et votre foi en 2026.",
            "tldr": "La technologie est un outil de croissance spirituelle. Découvrez les applications qui vous aident à rester constant dans votre Deen.",
            "body": "<p>En 2026, la technologie est devenue un compagnon indispensable pour le musulman moderne. Alors que le monde numérique offre de nombreuses distractions, les applications islamiques dédiées offrent un sanctuaire pour la croissance spirituelle. Les catégories clés à rechercher incluent : 1) Des traqueurs de prière avancés utilisant des calculs locaux précis, 2) Des compteurs de Dhikr et Zikirmatik numériques avec retour haptique, 3) Des plateformes de Coran interactives pour le Tajweed et le Tafseer, et 4) Des flux communautaires pour les prières partagées. Des applications like Islamvy ouvrent la voie en intégrant toutes ces fonctionnalités dans une expérience utilisateur unique et élégante, aidant les croyants à maintenir leur 'Istiqaamah' (fermeté) dans un monde occupé.</p>",
            "faqs": [
                {"q": "Qu'est-ce qui rend une application islamique fiable ?", "a": "Une application fiable utilise des sources vérifiées pour le Coran et le Hadith, offre des calculs précis des heures de prière (comme ceux d'Islamvy) et respecte la vie privée des utilisateurs."},
                {"q": "Comment éviter les distractions lors de l'utilisation des applications ?", "a": "Privilégiez les applications avec des interfaces propres et sans publicité, et utilisez des modes de concentration pour que votre temps d'écran soit productif."}
            ],
            "refs": ["Éthique numérique en Islam", "Systèmes de productivité islamiques", "Guide utilisateur Islamvy"]
        },
        "id": {
            "summary": "Aplikasi Islami Terbaik untuk meningkatkan produktivitas, fokus, dan iman Anda di tahun 2026.",
            "tldr": "Teknologi adalah alat untuk pertumbuhan spiritual. Temukan aplikasi yang membantu Anda tetap konsisten dengan agama Anda.",
            "body": "<p>Pada tahun 2026, teknologi telah menjadi pendamping yang tak terpisahkan bagi Muslim modern. Meskipun dunia digital menawarkan banyak gangguan, aplikasi Islami yang berdedikasi menyediakan tempat aman untuk pertumbuhan spiritual. Kategori utama yang perlu dicari meliputi: 1) Pelacak Shalat tingkat lanjut yang menggunakan perhitungan lokal yang presisi, 2) Penghitung Dzikir dan Zikirmatik digital dengan umpan balik haptik, 3) Platform Al-Quran interaktif untuk Tajwid dan Tafsir, serta 4) Fitur Komunitas untuk doa bersama dan dukungan. Aplikasi seperti Islamvy memimpin dengan mengintegrasikan semua fitur ini ke dalam satu pengalaman pengguna yang indah, membantu orang beriman menjaga 'Istiqaamah' di dunia yang sibuk.</p>",
            "faqs": [
                {"q": "Apa yang membuat aplikasi Islami dapat dipercaya?", "a": "Aplikasi yang andal menggunakan sumber terverifikasi untuk Al-Quran dan Hadist, menawarkan perhitungan waktu shalat yang presisi (seperti di Islamvy), dan menghormati privasi pengguna."},
                {"q": "Bagaimana cara menghindari gangguan saat menggunakan aplikasi?", "a": "Gunakan aplikasi yang memiliki antarmuka bersih dan bebas iklan, serta aktifkan fitur fokus untuk memastikan waktu layar Anda produktif dan bermakna."}
            ],
            "refs": ["Etika Digital dalam Islam", "Sistem Produktivitas Islami", "Panduan Pengguna Islamvy"]
        }
    },
    "ai-future-islam": {
        "en": {
            "summary": "How Artificial Intelligence is serving the Ummah while maintaining ethical boundaries.",
            "tldr": "AI is a powerful tool for knowledge preservation, translation, and personalized learning in the Muslim world.",
            "body": "<p>Artificial Intelligence is revolutionizing the way we engage with Islamic knowledge. From digitizing and translating ancient manuscripts to personalizing Quranic learning and automating Zakat calculations, AI is making the Deen more accessible than ever. However, Islam teaches us that progress must be guided by ethics and Taqwa. The future of AI in Islam lies in its ability to support, not replace, human scholarship. We must safeguard the 'Talaqqi' (face-to-face) tradition of learning while leveraging AI to handle complex data, detect misinformation, and provide tools for a more organized spiritual life.</p>",
            "faqs": [
                {"q": "Can AI replace the role of an Imam or Scholar?", "a": "No. Spiritual leadership and Fiqh require human context, empathy, and a living heart (Qalb) which machines lack. AI should be viewed as an assistant to scholars, not a replacement."},
                {"q": "Are there any ethical concerns with using AI for religious tasks?", "a": "Yes, concerns include the accuracy of AI-generated content and the potential for bias. It is crucial to use apps that rely on verified databases and human oversight."}
            ],
            "refs": ["Islamic Ethics in AI", "The Future of Digital Dawah", "Scholarship in the Digital Age"]
        },
        "tr": {
            "summary": "Yapay Zeka, etik sınırları koruyarak Ümmete nasıl hizmet ediyor?",
            "tldr": "Yapay Zeka; İslam dünyasında bilginin korunması, çeviri ve kişiselleştirilmiş öğrenme için güçlü bir araçtır.",
            "body": "<p>Yapay Zeka, İslami bilgiyle etkileşim kurma biçimimizde devrim yaratıyor. Kadim el yazmalarının dijitalleştirilmesinden Kuran öğreniminin kişiselleştirilmesine kadar YZ, dini bilgiye erişimi her zamankinden daha kolay hale getiriyor. Ancak İslam, ilerlemenin ahlak ve takva ile yönlendirilmesi gerektiğini öğretir. YZ'nin İslam'daki geleceği, insani alimliğin yerini almak değil, onu desteklemekten geçer. Karmaşık verileri işlemek ve yanlış bilgileri tespit etmek için YZ'den yararlanırken, yüz yüze eğitim (Telekki) geleneğini de korumalıyız.</p>",
            "faqs": [
                {"q": "Yapay Zeka bir İmamın veya Alimin rolünü üstlenebilir mi?", "a": "Hayır. Manevi rehberlik ve fıkıh; insani bağlam, empati ve makinelerin sahip olmadığı bir kalp (Kalb) gerektirir. YZ, alimler için bir asistan olarak görülmelidir."},
                {"q": "Dini görevlerde Yapay Zeka kullanmanın etik sakıncaları var mı?", "a": "Evet, üretilen içeriğin doğruluğu ve taraflılık gibi concern'ler bulunmaktadır. Doğrulanmış veri tabanlarına ve insan denetimine dayanan uygulamaları kullanmak kritiktir."}
            ],
            "refs": ["YZ'de İslami Etik", "Dijital Tebliğin Geleceği", "Dijital Çağda Alimlik"]
        },
        "ar": {
            "summary": "كيف يخدم الذكاء الاصطناعي الأمة الإسلامية مع الحفاظ على الحدود الأخلاقية والشرعية.",
            "tldr": "الذكاء الاصطناعي أداة قوية لحفظ المعرفة، والترجمة، والتعلم الشخصي في العالم الإسلامي.",
            "body": "<p>يحدث الذكاء الاصطناعي ثورة في كيفية تعاملنا مع العلوم الشرعية. من رقمنة وترجمة المخطوطات القديمة إلى تخصيص تعلم القرآن وأتمتة حسابات الزكاة، يجعل الذكاء الاصطناعي الوصول إلى الدين أسهل من أي وقت مضى. ومع ذلك، يعلمنا الإسلام أن التقدم يجب أن يسترشد بالأخلاق والتقوى. إن مستقبل الذكاء الاصطناعي في الإسلام يكمن في قدرته على دعم البحث العلمي البشري وليس استبداله. يجب علينا الحفاظ على تقليد 'التلقي' المباشر بينما نستفيد من الذكاء الاصطناعي لمعالجة البيانات المعقدة، وكشف المعلومات المضللة، وتوفير أدوات لحياة روحية أكثر تنظيماً.</p>",
            "faqs": [
                {"q": "هل يمكن للذكاء الاصطناعي استبدال دور الإمام أو العالم؟", "a": "لا، فالقيادة الروحية والفتوى تتطلبان سياقاً إنسانياً وتعاطفاً وقلباً حياً، وهو ما تفتقر إليه الآلات. يجب النظر إلى الذكاء الاصطناعي كمساعد للعلماء وليس بديلاً عنهم."},
                {"q": "هل هناك مخاوف أخلاقية من استخدام الذكاء الاصطناعي في المهام الدينية؟", "a": "نعم، تشمل المخاوف دقة المحتوى المولّد واحتمالية التحيز. من الضروري استخدام التطبيقات التي تعتمد على قواعد بيانات موثقة وإشراف بشري."},
            ],
            "refs": ["الأخلاق الإسلامية في الذكاء الاصطناعي", "مستقبل الدعوة الرقمية", "العلم في العصر الرقمي"]
        },
        "fr": {
            "summary": "Comment l'Intelligence Artificielle sert l'Ummah tout en respectant les limites éthiques.",
            "tldr": "L'IA est un outil puissant pour la préservation des connaissances, la traduction et l'apprentissage personnalisé.",
            "body": "<p>L'Intelligence Artificielle révolutionne notre façon d'interagir avec la connaissance islamique. De la numérisation et la traduction de manuscrits anciens à la personnalisation de l'apprentissage du Coran, l'IA rend le Deen plus accessible que jamais. Cependant, l'Islam nous enseigne que le progrès est guidé par l'éthique et la Taqwa. L'avenir de l'IA en Islam réside dans sa capacité à soutenir, et non à remplacer, l'érudition humaine. Nous devons sauvegarder la tradition du 'Talaqqi' (face à face) tout en utilisant l'IA pour traiter des données complexes et fournir des outils pour une vie spirituelle mieux organisée.</p>",
            "faqs": [
                {"q": "L'IA peut-elle remplacer le rôle d'un Imam ou d'un Savant ?", "a": "Non. Le leadership spirituel et le Fiqh nécessitent un contexte humain, de l'empathie et un cœur vivant dont les machines sont dépourvues. L'IA doit être vue comme un assistant."},
                {"q": "Existe-t-il des préoccupations éthiques à utiliser l'IA pour des tâches religieuses ?", "a": "Oui, notamment l'exactitude du contenu généré et le risque de biais. Il est crucial d'utiliser des applications basées sur des sources vérifiées."}
            ],
            "refs": ["Éthique islamique et IA", "L'avenir de la Dawah numérique", "L'érudition à l'ère numérique"]
        },
        "id": {
            "summary": "Bagaimana Kecerdasan Buatan melayani Umat sambil tetap menjaga batasan etika.",
            "tldr": "AI adalah alat yang ampuh untuk pelestarian pengetahuan, penerjemahan, dan pembelajaran yang dipersonalisasi.",
            "body": "<p>Kecerdasan Buatan (AI) merevolusi cara kita berinteraksi dengan pengetahuan Islam. Dari digitalisasi manuskrip kuno hingga personalisasi pembelajaran Al-Quran, AI membuat akses ke agama menjadi lebih mudah. Namun, Islam mengajarkan bahwa kemajuan harus dipandu oleh etika dan Taqwa. Masa depan AI dalam Islam terletak pada kemampuannya untuk mendukung, bukan menggantikan, peran ulama. Kita harus menjaga tradisi 'Talaqqi' (belajar langsung) sambil memanfaatkan AI untuk menangani data yang kompleks, mendeteksi misinformasi, dan menyediakan alat bantu spiritual yang lebih teratur.</p>",
            "faqs": [
                {"q": "Bisakah AI menggantikan peran Imam atau Ulama?", "a": "Tidak. Kepemimpinan spiritual dan Fikih membutuhkan konteks manusiawi, empati, dan hati yang hidup yang tidak dimiliki mesin. AI adalah asisten, bukan pengganti."},
                {"q": "Apakah ada kekhawatiran etis dalam menggunakan AI untuk tugas keagamaan?", "a": "Ya, termasuk akurasi konten yang dihasilkan dan potensi bias. Penting untuk menggunakan aplikasi yang mengandalkan database terverifikasi dan pengawasan manusia."}
            ],
            "refs": ["Etika Islam dalam AI", "Masa Depan Dakwah Digital", "Keilmuan di Era Digital"]
        }
    },
    "smart-rug-tech": {
        "en": {
            "summary": "Innovations in prayer rugs: From orthopedic comfort to digital Rakat counting.",
            "tldr": "Smart rugs use technology to support physical health and assist in focus during prayer.",
            "body": "<p>In recent years, the humble prayer rug has undergone a technological transformation. Orthopedic prayer rugs using memory foam and multi-layer support are now widely used to assist the elderly and those with joint pain, embodying the Islamic principle of removing hardship. Furthermore, 'Smart Rugs' equipped with sensors to count Rak'ahs and guide beginners through the motions of Salah have emerged as educational tools. While these innovations offer great benefit, scholars remind us that they should be used as aids to enhance Khushu (humility and focus), not as distractions that replace the spiritual presence required in prayer.</p>",
            "faqs": [
                {"q": "Is it permissible to use a prayer rug with a digital counter?", "a": "Yes, it is permissible as an aid for those who struggle with memory or are learning. However, the ultimate goal should be to achieve focus without external reliance."},
                {"q": "Are orthopedic rugs recommended in Islam?", "a": "Islam encourages taking care of one's health and making worship accessible. If a specialized rug helps you pray with more comfort and focus, it is highly beneficial."}
            ],
            "refs": ["Fiqh of Ease in Worship", "Advancements in Prayer Tech", "Scholarly Views on Smart Rugs"]
        },
        "tr": {
            "summary": "Seccadelerde yenilikler: Ortopedik konfordan dijital rekat sayımına.",
            "tldr": "Akıllı seccadeler, fiziksel sağlığı desteklemek ve namazda odaklanmaya yardımcı olmak için teknolojiyi kullanır.",
            "body": "<p>Son yıllarda seccadeler teknolojik bir dönüşümden geçmiştir. Hafızalı köpük ve çok katmanlı destek kullanan ortopedik seccadeler, eklem ağrısı çeken yaşlılara ve ihtiyaç sahiplerine yardımcı olmak için yaygın olarak kullanılmaktadır; bu durum 'zorluğun giderilmesi' İslami ilkesinin bir yansımasıdır. Ayrıca, rekatları sayan ve yeni başlayanlara namaz hareketlerinde rehberlik eden sensörlerle donatılmış 'Akıllı Seccadeler' eğitim araçları olarak ortaya çıkmıştır. Bu yenilikler büyük fayda sağlasa da, alimler bunların namazda gereken manevi huzurun yerini alan bir dikkat dağıtıcı değil, huşuyu artıran yardımcılar olarak kullanılması gerektiğini hatırlatmaktadır.</p>",
            "faqs": [
                {"q": "Dijital sayaçlı seccade kullanmak caiz mi?", "a": "Evet, hafıza sorunu yaşayanlar veya yeni öğrenenler için bir yardımcı olarak caizdir. Ancak nihai hedef, dış yardıma ihtiyaç duymadan odaklanmayı sağlamaktır."},
                {"q": "Ortopedik seccadeler İslam'da tavsiye edilir mi?", "a": "İslam, sağlığa dikkat etmeyi ve ibadeti kolaylaştırmayı teşvik eder. Uzmanlaşmış bir seccade daha rahat ve odaklanmış bir şekilde namaz kılmanıza yardımcı oluyorsa, bu çok faydalıdır."}
            ],
            "refs": ["İbadette Kolaylık Fıkhı", "Namaz Teknolojisindeki Gelişmeler", "Akıllı Seccadeler Hakkında Alim Görüşleri"]
        },
        "ar": {
            "summary": "ابتكارات في سجاد الصلاة: من الراحة الطبية إلى عد الركعات الرقمي.",
            "tldr": "تستخدم السجادات الذكية التكنولوجيا لدعم الصحة البدنية والمساعدة على التركيز أثناء الصلاة.",
            "body": "<p>في السنوات الأخيرة، شهدت سجادة الصلاة تحولاً تكنولوجياً ملحوظاً. السجادات الطبية التي تستخدم رغوة الذاكرة (Memory Foam) والدعم متعدد الطبقات تُستخدم الآن على نطاق واسع لمساعدة كبار السن ومن يعانون من آلام المفاصل، وهو ما يجسد القاعدة الفقهية 'المشقة تجلب التيسير'. علاوة على ذلك، ظهرت 'السجادات الذكية' المزودة بحساسات لعد الركعات وتوجيه المبتدئين في حركات الصلاة كأدوات تعليمية. وبينما تقدم هذه الابتكارات فوائد كبيرة، يذكرنا العلماء بضرورة استخدامها كعوامل مساعدة لتعزيز الخشوع، وليس كملهيات تشغل المصلي عن الروحانية المطلوبة.</p>",
            "faqs": [
                {"q": "هل يجوز استخدام سجادة صلاة بعداد رقمي؟", "a": "نعم، يجوز كوسيلة مساعدة لمن يعانون من مشاكل في الذاكرة أو للمبتدئين. ومع ذلك، يجب أن يكون الهدف النهائي هو الوصول للتركيز دون الاعتماد على وسائل خارجية."},
                {"q": "هل ينصح بالسجاد الطبي في الإسلام؟", "a": "يشجع الإسلام على الاهتمام بالصحة وتيسير العبادة. إذا كانت السجادة المتخصصة تساعدك على الصلاة براحة وتركيز أكبر، فهي مفيدة جداً."}
            ],
            "refs": ["فقه التيسير في العبادة", "تطور تقنيات الصلاة", "آراء العلماء في السجاد الذكي"]
        },
        "fr": {
            "summary": "Innovations dans les tapis de prière : Du confort orthopédique au comptage numérique des Rakats.",
            "tldr": "Les tapis intelligents utilisent la technologie pour soutenir la santé physique et aider à la concentration.",
            "body": "<p>Ces dernières années, le tapis de prière a connu une transformation technologique. Les tapis orthopédiques utilisant de la mousse à mémoire de forme sont désormais largement utilisés pour aider les personnes âgées et celles souffrant de douleurs articulaires, incarnant le principe islamique de facilité. De plus, des 'tapis intelligents' équipés de capteurs pour compter les Rak'ahs sont apparus comme outils pédagogiques. Bien que ces innovations soient bénéfiques, les savants rappellent qu'elles doivent être utilisées pour renforcer le Khushu (la concentration), et non comme une distraction.</p>",
            "faqs": [
                {"q": "Est-il permis d'utiliser un tapis avec un compteur numérique ?", "a": "Oui, c'est permis comme aide pour ceux qui ont des trous de mémoire ou qui apprennent. Cependant, l'objectif final reste d'atteindre la concentration par soi-même."},
                {"q": "Les tapis orthopédiques sont-ils recommandés ?", "a": "L'Islam encourage à prendre soin de sa santé. Si un tapis spécialisé vous aide à prier avec plus de confort et de concentration, c'est très bénéfique."}
            ],
            "refs": ["Fiqh de la facilité", "Progrès tech dans la prière", "Avis sur les tapis intelligents"]
        },
        "id": {
            "summary": "Inovasi sajadah: Dari kenyamanan ortopedi hingga penghitungan Rakaat digital.",
            "tldr": "Sajadah pintar menggunakan teknologi untuk mendukung kesehatan fisik dan membantu fokus dalam shalat.",
            "body": "<p>Dalam beberapa tahun terakhir, sajadah telah mengalami transformasi teknologi. Sajadah ortopedi yang menggunakan busa memori kini banyak digunakan untuk membantu lansia dan mereka yang memiliki nyeri sendi, mewujudkan prinsip Islam tentang kemudahan (Taysir). Selain itu, 'Sajadah Pintar' yang dilengkapi dengan sensor untuk menghitung Rakaat telah muncul sebagai alat edukasi. Meskipun inovasi ini menawarkan manfaat besar, para ulama mengingatkan bahwa alat ini harus digunakan sebagai bantuan untuk meningkatkan Khusyuk, bukan sebagai gangguan yang menggantikan kehadiran spiritual dalam shalat.</p>",
            "faqs": [
                {"q": "Apakah boleh menggunakan sajadah dengan penghitung digital?", "a": "Ya, diperbolehkan sebagai bantuan bagi mereka yang memiliki masalah ingatan atau sedang belajar. Namun, tujuan utamanya haruslah mencapai fokus tanpa ketergantungan eksternal."},
                {"q": "Apakah sajadah ortopedi direkomendasikan dalam Islam?", "a": "Islam mendorong umatnya untuk menjaga kesehatan. Jika sajadah khusus membantu Anda shalat dengan lebih nyaman dan fokus, itu sangat bermanfaat."}
            ],
            "refs": ["Fiqih Kemudahan dalam Ibadah", "Kemajuan Teknologi Shalat", "Pandangan Ulama tentang Sajadah Pintar"]
        }
    },
    "qibla-tools": {
        "en": {
            "summary": "How modern apps use GPS and AR to find the Qibla accurately.",
            "tldr": "Finding the Qibla is a condition for Salah. Technology makes it easier and more precise anywhere in the world.",
            "body": "<p>Facing the Kaaba in Mecca is a fundamental requirement for the validity of prayer. In the past, Muslims relied on the stars and complex sundials; today, we have high-precision digital tools. Modern apps like Islamvy use 1) GPS to determine your exact location, 2) Sensors to detect magnetic north, and 3) Augmented Reality (AR) to overlay the Qibla direction onto your surroundings. These tools use 'Great Circle' calculations to find the true shortest path to Mecca. To ensure accuracy, especially indoors, always move your device in a figure-eight pattern to calibrate the compass and keep it away from metals or electronics that cause magnetic interference.</p>",
            "faqs": [
                {"q": "Can I trust my phone's Qibla compass?", "a": "Yes, but it must be calibrated first. Most apps provide a 'Figure-8' calibration guide. If the result seems off, check for metallic objects nearby that might interfere with the magnetic sensor."},
                {"q": "What should I do if I can't find the Qibla and have no phone?", "a": "Islam teaches 'Taqwa' (God-consciousness). Try your best to estimate via the sun or moon, or ask a local. If you have made a sincere effort and later discover the direction was slightly wrong, your prayer is still valid according to the majority of scholars."}
            ],
            "refs": ["Astronomy in Islamic History", "Fiqh of Direction", "Islamvy Qibla Documentation"]
        },
        "tr": {
            "summary": "Modern uygulamalar Kıble'yi doğru bulmak için GPS ve AR'yi nasıl kullanıyor?",
            "tldr": "Kıbleyi bulmak namazın şartıdır. Teknoloji bunu dünyanın her yerinde daha kolay ve kesin hale getirir.",
            "body": "<p>Mekke'deki Kabe'ye yönelmek, namazın geçerliliği için temel bir şarttır. Geçmişte Müslümanlar yıldızlara ve güneş saatlerine güvenirken, bugün yüksek hassasiyetli dijital araçlara sahibiz. Islamvy gibi modern uygulamalar; 1) Konumunuzu belirlemek için GPS, 2) Manyetik kuzeyi tespit etmek için sensörler ve 3) Kıble yönünü çevrenize yansıtmak için Artırılmış Gerçeklik (AR) kullanır. Bu araçlar, Mekke'ye giden gerçek en kısa yolu bulmak için 'Büyük Daire' hesaplamalarını kullanır. Doğruluk sağlamak için, cihazınızı sekiz çizerek kalibre etmeyi ve manyetik parazit yapan metallerden uzak tutmayı unutmayın.</p>",
            "faqs": [
                {"q": "Telefonumun Kıble pusulasına güvenebilir miyim?", "a": "Evet, ancak önce kalibre edilmelidir. Sapan bir sonuç alıyorsanız, yakındaki metal nesneleri kontrol edin."},
                {"q": "Telefonum yoksa ve Kıbleyi bulamazsam ne yapmalıyım?", "a": "Elinizden gelen en iyi tahmini yapın (güneş veya ay yardımıyla). Samimi bir çaba sarf ettiyseniz ve sonra yönün biraz hatalı olduğunu fark ederseniz, alimlerin çoğuna göre namazınız geçerlidir."}
            ],
            "refs": ["İslam Tarihinde Astronomi", "İstikbal-i Kıble Fıkhı", "Islamvy Kıble Rehberi"]
        },
        "ar": {
            "summary": "كيف تستخدم التطبيقات الحديثة نظام GPS والواقع المعزز (AR) لتحديد القبلة بدقة.",
            "tldr": "استقبال القبلة شرط من شروط صحة الصلاة. التكنولوجيا تجعل الأمر أسهل وأكثر دقة في أي مكان في العالم.",
            "body": "<p>التوجه نحو الكعبة المشرفة في مكة المكرمة مطلب أساسي لصحة الصلاة. في الماضي، اعتمد المسلمون على النجوم والمزولات الشمسية؛ أما اليوم، فلدينا أدوات رقمية عالية الدقة. تستخدم التطبيقات الحديثة مثل Islamvy: 1) نظام GPS لتحديد موقعك، 2) حساسات لاكتشاف الشمال المغناطيسي، 3) والواقع المعزز (AR) لإظهار اتجاه القبلة في محيطك مباشرة. تستخدم هذه الأدوات حسابات 'الدائرة العظمى' لإيجاد المسار الأقصر الحقيقي لمكة. ولضمان الدقة، خاصة داخل المباني، يفضل دائماً معايرة البوصلة بالتحريك على شكل رقم 8 والابتعاد عن المعادن أو الإلكترونيات التي قد تسبب تداخلاً مغناطيسياً.</p>",
            "faqs": [
                {"q": "هل يمكنني الوثوق ببوصلة القبلة في هاتفي؟", "a": "نعم، ولكن يجب معايرتها أولاً. إذا كانت النتيجة تبدو غير دقيقة، تحقق من وجود أجسام معدنية قريبة قد تؤثر على الحساس المغناطيسي."},
                {"q": "ماذا أفعل إذا لم أجد القبلة ولم يكن معي هاتف؟", "a": "ابذل قصارى جهدك في تحديدها عبر الشمس أو القمر أو بسؤال أهل المكان. إذا اجتهدت ثم اكتشفت لاحقاً أن الاتجاه كان خاطئاً قليلاً، فصلاتك صحيحة عند جمهور العلماء."}
            ],
            "refs": ["علم الفلك في التاريخ الإسلامي", "فقه استقبال القبلة", "توثيق القبلة في Islamvy"]
        },
        "fr": {
            "summary": "Comment les applications modernes utilisent le GPS et la RA pour trouver la Qibla avec précision.",
            "tldr": "Trouver la Qibla est une condition pour la prière. La technologie rend cela plus facile et précis partout dans le monde.",
            "body": "<p>S'orienter vers la Kaaba est une exigence fondamentale. Les applications modernes comme Islamvy utilisent le GPS pour votre position et la réalité augmentée (RA) pour visualiser la direction. Elles utilisent des calculs de 'Grand Cercle' pour trouver le chemin le plus court vers La Mecque. Pour assurer la précision, calibrez toujours votre appareil en faisant un mouvement en '8' et éloignez-le des objets métalliques.</p>",
            "faqs": [
                {"q": "Puis-je faire confiance à la boussole de mon téléphone ?", "a": "Oui, mais calibrez-la d'abord. Si le résultat semble erroné, vérifiez les interférences magnétiques à proximité."},
                {"q": "Que faire si je n'ai pas de téléphone et que je ne trouve pas la Qibla ?", "a": "Faites de votre mieux pour estimer la direction à l'aide du soleil ou de la lune. Si vous avez fait un effort sincère, votre prière est valide selon la majorité des savants."}
            ],
            "refs": ["L'astronomie dans l'histoire islamique", "Fiqh de l'orientation", "Documentation Islamvy"]
        },
        "id": {
            "summary": "Bagaimana aplikasi modern menggunakan GPS dan AR untuk menemukan Kiblat secara akurat.",
            "tldr": "Menemukan Kiblat adalah syarat sah Shalat. Teknologi membuatnya lebih mudah dan presisi di mana pun di dunia.",
            "body": "<p>Menghadap Ka'bah adalah syarat utama sahnya shalat. Aplikasi modern seperti Islamvy menggunakan GPS untuk lokasi dan Augmented Reality (AR) untuk memvisualisasikan arah Kiblat. Alat ini menggunakan perhitungan 'Lingkaran Besar' untuk menemukan jalur terpendek ke Mekkah. Untuk akurasi, selalu kalibrasi perangkat Anda dengan gerakan angka '8' dan jauhkan dari gangguan magnetik logam.</p>",
            "faqs": [
                {"q": "Bisakah saya mempercayai kompas Kiblat di ponsel saya?", "a": "Ya, tapi harus dikalibrasi dulu. Jika hasilnya tampak meleset, periksa benda logam di sekitar yang mungkin mengganggu sensor magnetik."},
                {"q": "Apa yang harus dilakukan jika tidak bisa menemukan Kiblat dan tidak ada ponsel?", "a": "Lakukan usaha terbaik untuk memperkirakan arah melalui matahari atau bulan. Jika sudah berusaha sungguh-sungguh, shalat Anda tetap sah menurut mayoritas ulama."}
            ],
            "refs": ["Astronomi dalam Sejarah Islam", "Fiqih Arah Kiblat", "Dokumentasi Kiblat Islamvy"]
        }
    },
}

# Dream interpretations based on Ibn Sirin
dream_interpretations = {
    "dream-cat": {
        "en": "In Islamic dream interpretation, a cat often represents a thief from within the household or a servant. According to Ibn Sirin, a calm cat suggests a peaceful year, while a wild or aggressive cat warns of a stressful year ahead filled with potential betrayal or envy. If the cat bites or scratches, it signifies sickness or a long period of hardship. However, some scholars also associate cats with a deceitful person who appears friendly but hides malice.",
        "tr": "İslami rüya tabirlerinde kedi genellikle hane içinden bir hırsızı veya bir hizmetçiyi temsil eder. İbn-i Şirin'e göre uysal bir kedi huzurlu bir yılı, vahşi veya saldırgan bir kedi ise ihanet ve hasetle dolu stresli bir yılı simgeler. Kedinin ısırması veya tırmalaması hastalık veya uzun süreli zorluklara işarettir. Bazı alimler kediyi, dost görünen ancak içinde kötülük saklayan hilekar bir kimseyle de ilişkilendirir.",
        "ar": "في تفسير الأحلام الإسلامي، غالباً ما تمثل القطة لصاً من أهل البيت أو خادماً. وفقاً لابن سيرين، فإن القطة الهادئة تبشر بسنة سلمية، بينما القطة الوحشية أو العدوانية تحذر من سنة مليئة بالتوتر والخيانة أو الحسد. إذا عضت القطة أو خدشت الحالم، فقد يدل ذلك على مرض أو فترة طويلة من المشقة. كما يربط بعض العلماء القطة بشخص مخادع يظهر الود ويخفي الضغينة.",
        "fr": "Dans l'interprétation islamique des rêves, un chat représente souvent un voleur domestique ou un serviteur. Selon Ibn Sirin, un chat calme suggère une année paisible, tandis qu'un chat sauvage ou agressif avertit d'une année stressante marquée par la trahison ou l'envie. Si le chat mord ou griffe, cela signifie une maladie ou une longue période de difficulté. Certains savants l'associent également à une personne trompeuse qui cache sa malveillance.",
        "id": "Dalam tafsir mimpi Islam, kucing seringkali melambangkan pencuri dari dalam rumah atau seorang pelayan. Menurut Ibnu Sirin, kucing yang tenang menandakan tahun yang damai, sedangkan kucing liar atau agresif memperingatkan tahun yang penuh tekanan, pengkhianatan, atau rasa iri. Jika kucing menggigit atau mencakar, itu menandakan penyakit atau masa sulit yang panjang. Beberapa ulama juga mengaitkan kucing dengan orang licik yang berpura-pura baik."
    },
    "dream-snake": {
        "en": "A snake is a classic symbol of an enemy. The strength and size of the snake reflect the power of the enemy in waking life. If the snake is in your house, the enemy is a relative; if it's outside, it's a stranger. Killing the snake symbolizes ultimate victory over your adversaries. Being bitten by a snake warns of harm or temptation that you must avoid. Seeing many snakes may represent a widespread fitna (discord) or hidden plots against you.",
        "tr": "Yılan, düşmanın klasik bir sembolüdür. Yılanın gücü ve boyutu, gerçek hayattaki düşmanın gücünü yansıtır. Yılan evinizdeyse düşman bir akrabadır; dışarıdaysa yabancıdır. Yılanı öldürmek, rakiplerinize karşı mutlak zaferi simgeler. Yılan tarafından ısırılmak, kaçınmanız gereken bir zarar veya fitne konusunda uyarıdır. Çok sayıda yılan görmek, yaygın bir fitneyi veya size karşı kurulan gizli komploları temsil edebilir.",
        "ar": "الثعبان رمز كلاسيكي للعدو. تعكس قوة وحجم الثعبان قوة العدو في الحياة الواقعية. إذا كان الثعبان في منزلك، فالعدو قريب أو من الأقارب؛ وإذا كان في الخارج، فهو غريب. قتل الثعبان يرمز إلى النصر النهائي على الخصوم. أما لدغة الثعبان فتحذر من ضرر أو فتنة يجب تجنبها. رؤية العديد من الثعابين قد تمثل فتنة واسعة النطاق أو مؤامرات خفية تُحاك ضدك.",
        "fr": "Le serpent est un symbole classique de l'ennemi. Sa force et sa taille reflètent la puissance de l'adversaire dans la vie réelle. Si le serpent est dans la maison, l'ennemi est un proche ; s'il est dehors, c'est un étranger. Tuer le serpent symbolise une victoire totale. Être mordu avertit d'un préjudice ou d'une tentation à éviter. Voir de nombreux serpents peut représenter une fitna (discorde) généralisée ou des complots cachés.",
        "id": "Ular adalah simbol klasik dari musuh. Kekuatan dan ukuran ular mencerminkan kekuatan musuh di dunia nyata. Jika ular ada di dalam rumah, musuhnya adalah kerabat; jika di luar, musuhnya adalah orang asing. Membunuh ular melambangkan kemenangan mutlak atas lawan. Digigit ular memperingatkan bahaya atau godaan yang harus dihindari. Melihat banyak ular bisa mewakili fitnah yang meluas atau rencana tersembunyi melawan Anda."
    },
    "dream-gold": {
        "en": "In Islamic tradition, gold is interpreted differently based on its form. Finding gold coins (Dinars) or ornaments represents wealth, joy, and success. However, finding raw, unformed gold or large quantities of it can symbolize heavy burdens, worries, or loss of property, as the color yellow is sometimes associated with sickness or sadness. For women, wearing gold is generally a positive sign of beauty and blessing. If you give gold to someone, it means you will resolve a conflict.",
        "tr": "İslami gelenekte altın, formuna göre farklı yorumlanır. Altın para (Dinar) veya takı bulmak zenginlik, sevinç ve başarıyı temsil eder. Ancak işlenmemiş altın veya büyük miktarda altın bulmak; sarı rengin bazen hastalık veya üzüntüyle ilişkilendirilmesi nedeniyle ağır yükleri, endişeleri veya mal kaybını simgeleyebilir. Kadınlar için altın takmak genellikle güzellik ve bereketin olumlu bir işaretidir. Birine altın vermek, bir anlaşmazlığı çözeceğiniz anlamına gelir.",
        "ar": "في التقاليد الإسلامية، يُفسر الذهب بشكل مختلف بناءً على شكله. فالعثور على عملات ذهبية (دنانير) أو حلي يمثل الثروة والفرح والنجاح. ومع ذلك، فإن العثور على ذهب خام أو كميات كبيرة منه قد يرمز إلى أعباء ثقيلة أو هموم أو فقدان للممتلكات، حيث يرتبط اللون الأصفر أحياناً بالمرض أو الحزن. بالنسبة للنساء، يعتبر لبس الذهب علامة إيجابية على الجمال والبركة. وإذا أعطيت الذهب لشخص ما، فهذا يعني أنك ستحل صراعاً.",
        "fr": "Dans la tradition islamique, l'or est interprété différemment selon sa forme. Trouver des pièces d'or ou des ornements représente la richesse et la joie. Cependant, trouver de l'or brut ou en grande quantité peut symboliser de lourds fardeaux ou des soucis, car la couleur jaune est parfois associée à la maladie. Pour les femmes, porter de l'or est un signe positif de beauté et de bénédiction. Donner de l'or à quelqu'un signifie que vous allez résoudre un conflit.",
        "id": "Dalam tradisi Islam, emas ditafsirkan secara berbeda berdasarkan bentuknya. Menemukan koin emas (Dinar) atau perhiasan melambangkan kekayaan dan kesuksesan. Namun, menemukan emas mentah atau dalam jumlah besar bisa melambangkan beban berat atau kekhawatiran, karena warna kuning terkadang dikaitkan dengan penyakit. Bagi wanita, memakai emas umumnya merupakan pertanda positif. Jika Anda memberikan emas kepada seseorang, itu berarti Anda akan menyelesaikan konflik."
    },
    "dream-water": {
        "en": "Water is the essence of life and represents knowledge, faith, and purity. Drinking clear, cool water signifies gaining wisdom and spiritual growth. However, drowning in water can represent being overwhelmed by worldly affairs or sins. Turbulent or muddy water is a warning of trials, sickness, or injustice. If you see water flooding your house, it represents family disputes. Moving from stagnant water to running water symbolizes a transition from depression to activity and hope.",
        "tr": "Su hayatın özüdür; ilim, iman ve safiyeti temsil eder. Berrak ve serin su içmek, hikmet kazanmaya ve manevi büyümeye işarettir. Ancak suda boğulmak, dünyevi işler veya günahlar altında ezilmeyi temsil edebilir. Bulanık veya türbülanslı su; imtihan, hastalık veya adaletsizlik konusunda bir uyarıdır. Evinizi su bastığını görmek ailevi huzursuzlukları simgeler. Durgun sudan akan suya geçmek, karamsarlıktan umuda ve harekete geçişi sembolize eder.",
        "ar": "الماء هو جوهر الحياة ويمثل العلم والإيمان والطهارة. شرب الماء الصافي البارد يدل على نيل الحكمة والنمو الروحي. ومع ذلك، فإن الغرق في الماء قد يمثل الانغماس في أمور الدنيا أو الذنوب. الماء العكر أو المضطرب تحذير من الفتن أو المرض أو الظلم. إذا رأيت الماء يغمر منزلك، فقد يمثل ذلك خلافات عائلية. الانتقال من الماء الراكد إلى الماء الجاري يرمز إلى التحول من ركود الهموم إلى النشاط والأمل.",
        "fr": "L'eau est l'essence de la vie et représente la connaissance, la foi et la pureté. Boire de l'eau claire signifie acquérir de la sagesse. Cependant, se noyer peut représenter le fait d'être submergé par les affaires mondaines ou les péchés. L'eau boueuse est un avertissement d'épreuves ou d'injustice. Si l'eau inonde votre maison, cela représente des disputes familiales. Passer d'une eau stagnante à une eau courante symbolise une transition vers l'espoir.",
        "id": "Air adalah esensi kehidupan dan melambangkan ilmu, iman, dan kemurnian. Minum air yang jernih dan sejuk menandakan mendapatkan hikmah. Namun, tenggelam bisa melambangkan kewalahan oleh urusan dunia atau dosa. Air yang keruh atau bergolak adalah peringatan akan ujian atau ketidakadilan. Jika Anda melihat air membanjiri rumah, itu mewakili perselisihan keluarga. Beralih dari air yang tenang ke air yang mengalir melambangkan transisi menuju harapan."
    },
    "dream-flying": {
        "en": "Flying in a dream is generally a positive sign of freedom, travel, and elevated status. If you fly with wings, it signifies a physical journey or a new opportunity. Flying without wings suggests a spiritual rise or achieving a high rank through personal merit. If you reach your destination safely, your goals will be fulfilled. However, flying and then falling indicates a temporary setback. Flying away from home can represent a major life change, such as moving to a new country or starting a significant new chapter.",
        "tr": "Rüyada uçmak genellikle özgürlük, yolculuk ve yükselen statünün olumlu bir işaretidir. Kanatlarla uçmak, fiziksel bir yolculuğu veya yeni bir fırsatı simgeler. Kanatsız uçmak ise manevi bir yükselişi veya kişisel liyakatle yüksek bir mertebeye ulaşmayı ifade eder. Hedefinize güvenle ulaşırsanız, amaçlarınız gerçekleşecektir. Ancak uçup sonra düşmek geçici bir aksiliğe işarettir. Evden uzaklaşmak; yeni bir ülkeye taşınmak veya önemli bir sayfa açmak gibi büyük bir hayat değişikliğini temsil edebilir.",
        "ar": "الطيران في الحلم بشكل عام علامة إيجابية على الحرية والسفر وارتفاع المكانة. إذا كنت تطير بأجنحة، فهذا يدل على سفر مادي أو فرصة جديدة. أما الطيران بدون أجنحة فيشير إلى الارتفاع الروحي أو نيل مرتبة عالية بفضل الجدارة الشخصية. إذا وصلت إلى وجهتك بسلام، فستتحقق أهدافك. ومع ذلك، فإن الطيران ثم السقوط يشير إلى نكسة مؤقتة. الطيران بعيداً عن المنزل قد يمثل تغييراً كبيراً في الحياة، مثل الانتقال لبلد جديد أو بدء مرحلة مهمة.",
        "fr": "Voler dans un rêve est généralement un signe positif de liberté, de voyage et d'élévation sociale. Voler avec des ailes signifie un voyage physique ou une opportunité. Voler sans ailes suggère une ascension spirituelle. Si vous atteignez votre destination, vos objectifs seront accomplis. Cependant, voler puis tomber indique un revers temporaire. S'envoler loin de chez soi peut représenter un changement majeur, comme un déménagement dans un nouveau pays.",
        "id": "Terbang dalam mimpi umumnya merupakan pertanda positif tentang kebebasan, perjalanan, dan status yang tinggi. Terbang dengan sayap menandakan perjalanan fisik atau peluang baru. Terbang tanpa sayap menunjukkan peningkatan spiritual. Jika Anda mencapai tujuan dengan selamat, cita-cita Anda akan tercapai. Namun, terbang lalu jatuh menandakan hambatan sementara. Terbang jauh dari rumah bisa mewakili perubahan hidup yang besar, seperti pindah ke negara baru."
    },
    "dream-baby": {
        "en": "A baby in a dream often signifies a new beginning, a creative project, or a significant responsibility coming your way. In Islamic tradition, a baby girl is generally seen as a harbinger of joy, ease, and worldly success (Dunya). On the other hand, a baby boy may represent a heavy responsibility or a trial that requires patience. Seeing yourself carrying a baby suggests you are bearing a burden that will lead to ultimate reward. A crying baby warns of potential distress or a need for closer attention to your personal affairs.",
        "tr": "Rüyada bebek genellikle yeni bir başlangıcı, yaratıcı bir projeyi veya yolda olan önemli bir sorumluluğu simgeler. İslami gelenekte kız bebek genellikle neşe, kolaylık ve dünyevi başarının (Dünya) habercisi olarak görülür. Öte yandan erkek bebek, ağır bir sorumluluğu veya sabır gerektiren bir imtihanı temsil edebilir. Kendinizi bebek taşırken görmek, sonunda mükafata götürecek bir yükü omuzladığınızı gösterir. Ağlayan bir bebek, potansiyel bir sıkıntıya veya kişisel işlerinize daha fazla dikkat etmeniz gerektiğine dair bir uyarıdır.",
        "ar": "الطفل في الحلم غالباً ما يرمز إلى بداية جديدة، أو مشروع إبداعي، أو مسؤولية كبيرة قادمة في طريقك. في التقاليد الإسلامية، تُعتبر الطفلة الأنثى عموماً بشرى بالفرح واليسر والنجاح في الدنيا. من ناحية أخرى، قد يمثل الطفل الذكر مسؤولية ثقيلة أو ابتلاء يتطلب الصبر. رؤية نفسك تحمل طفلاً تشير إلى أنك تتحمل عبئاً سيؤدي في النهاية إلى أجر عظيم. أما الطفل الباكي فيحذر من ضيق محتمل أو حاجة لمزيد من الاهتمام بشؤونك الشخصية.",
        "fr": "Un bébé signifie souvent un nouveau départ, un projet ou une responsabilité à venir. Dans la tradition islamique, une petite fille est vue comme un signe de joie, de facilité et de succès mondain (Dunya). Un petit garçon peut représenter une responsabilité lourde ou une épreuve exigeant de la patience. Porter un bébé suggère que vous portez un fardeau qui mènera à une récompense. Un bébé qui pleure avertit d'une détresse potentielle ou d'un besoin d'attention.",
        "id": "Bayi melambangkan awal yang baru, proyek kreatif, atau tanggung jawab besar di depan mata. Dalam tradisi Islam, bayi perempuan umumnya dipandang sebagai pembawa kegembiraan, kemudahan, dan kesuksesan duniawi. Di sisi lain, bayi laki-laki mewakili tanggung jawab berat atau ujian yang membutuhkan kesabaran. Melihat diri sendiri menggendong bayi berarti Anda memikul beban yang akan membuahkan pahala. Bayi menangis memperingatkan kesulitan."
    },
    "dream-teeth": {
        "en": "Teeth represent your family and close relatives. The upper teeth symbolize male relatives from the father's side, while the lower teeth represent female relatives from the mother's side. The front teeth specifically represent your siblings and children. If a tooth falls out into your lap or hand, it can signify longevity or a new birth in the family. However, if a tooth is lost or causes pain, it may warn of family disputes or the sickness of a relative. Sparkling white teeth reflect high character and family unity.",
        "tr": "Dişler ailenizi ve yakın akrabalarınızı temsil eder. Üst dişler baba tarafındaki erkek akrabaları, alt dişler ise anne tarafındaki kadın akrabaları simgeler. Ön dişler özellikle kardeşleri ve çocukları temsil eder. Bir dişin kucağınıza veya elinize düşmesi, uzun ömre veya ailede yeni bir doğuma işarettir. Ancak dişin kaybolması veya acı vermesi, ailevi anlaşmazlıklar veya bir akrabanın hastalığı konusunda uyarı olabilir. Parlayan beyaz dişler ise asil bir karakteri ve aile birliğini yansıtır.",
        "ar": "الأسنان تمثل عائلتك وأقاربك المقربين. ترمز الأسنان العليا إلى الأقارب الذكور من جهة الأب، بينما تمثل الأسنان السفلى الأقارب الإناث من جهة الأم. وتمثل الأسنان الأمامية تحديداً الإخوة والأبناء. إذا سقطت سن في حجرك أو يدك، فقد يدل ذلك على طول العمر أو مولود جديد في العائلة. ومع ذلك، إذا ضاعت السن أو سببت ألماً، فقد تحذر من خلافات عائلية أو مرض قريب. أما الأسنان البيضاء الناصعة فتعكس حسن الخلق والترابط الأسري.",
        "fr": "Les dents représentent votre famille et vos proches. Les dents du haut symbolisent les parents masculins du côté paternel, et celles du bas les femmes du côté maternel. Les dents de devant représentent vos frères, sœurs et enfants. Si une dent tombe dans votre main, cela peut signifier la longévité ou une naissance. Cependant, si une dent est perdue, cela peut avertir de disputes familiales. Des dents blanches reflètent un bon caractère et l'unité familiale.",
        "id": "Gigi melambangkan keluarga dan kerabat dekat. Gigi atas melambangkan kerabat laki-laki dari pihak ayah, sedangkan gigi bawah melambangkan kerabat perempuan dari pihak ibu. Gigi depan melambangkan saudara kandung dan anak-anak. Jika gigi tanggal ke tangan Anda, itu bisa berarti umur panjang atau kelahiran baru di keluarga. Namun, jika gigi hilang atau terasa sakit, itu memperingatkan perselisihan keluarga. Gigi putih menandakan kemuliaan karakter."
    },
    "dream-falling": {
        "en": "Falling from a height symbolizes a significant change in one's state or status. According to classical interpretations, it often signifies moving from a position of honor to a lower state, or moving from wealth to financial difficulty. However, context matters: if you fall into a mosque or a garden, it represents a transition toward repentance and a better spiritual life. If you are injured during the fall, it warns of an upcoming trial. Landing safely without injury indicates that you will overcome your current anxieties and find stability.",
        "tr": "Yüksekten düşmek, birinin durumunda veya statüsünde meydana gelen önemli bir değişikliği simgeler. Klasik tabirlere göre bu genellikle onurlu bir konumdan daha aşağı bir duruma veya zenginlikten maddi zorluğa geçişi ifade eder. Ancak bağlam önemlidir: Bir camiye veya bahçeye düşerseniz, bu tövbeye ve daha iyi bir manevi hayata yönelmeyi temsil eder. Düşerken yaralanmak, yaklaşan bir imtihan konusunda uyarıdır. Yaralanmadan güvenli bir şekilde inmek ise mevcut endişelerinizin üstesinden geleceğinizi ve istikrar bulacağınızı gösterir.",
        "ar": "السقوط من مكان مرتفع يرمز إلى تغير كبير في حال الشخص أو مكانته. وفقاً للتفسيرات الكلاسيكية، فإنه غالباً ما يشير إلى الانتقال من منصب رفيع إلى حال أقل، أو من الثروة إلى ضيق مادي. ومع ذلك، فإن السياق مهم: فإذا سقطت في مسجد أو بستان، فهذا يمثل تحولاً نحو التوبة وحياة روحية أفضل. وإذا أصبت بجروح أثناء السقوط، فهو تحذير من فتن قادمة. أما الهبوط بسلام دون إصابة فيدل على أنك ستتجاوز قلقك الحالي وتجد الاستقرار.",
        "fr": "Tomber d'une hauteur symbolise un changement important dans l'état ou le statut d'une personne. Selon les interprétations classiques, cela signifie souvent passer d'une position d'honneur à un état inférieur. Cependant, si vous tombez dans une mosquée ou un jardin, cela représente une transition vers le repentir. Si vous êtes blessé, cela avertit d'une épreuve. Atterrir en toute sécurité indique que vous surmonterez vos anxiétés actuelles et trouverez la stabilité.",
        "id": "Jatuh dari tempat tinggi melambangkan perubahan signifikan dalam keadaan atau status seseorang. Menurut tafsir klasik, ini sering berarti pindah dari posisi terhormat ke keadaan yang lebih rendah. Namun, konteks sangat penting: jika Anda jatuh ke masjid atau taman, itu melambangkan taubat. Jika Anda terluka saat jatuh, itu memperingatkan adanya ujian. Mendarat dengan selamat menandakan bahwa Anda akan mengatasi kecemasan dan menemukan stabilitas."
    },
    "dream-marriage": {
        "en": "Marriage in a dream is a profound symbol of providence, honor, and protection from God. For a single person, it often foretells an actual marriage or a significant new contract. For someone already married, it can represent a rise in rank or new sources of income. Marrying an unknown person can sometimes symbolize a major transition or a new heavy responsibility. Overall, it reflects a state of tranquility and the start of a partnership that brings stability and spiritual growth into your life.",
        "tr": "Rüyada evlenmek; ilahi inayet, onur ve Allah'ın korumasının derin bir sembolüdür. Bekar bir kişi için genellikle gerçek bir evliliği veya önemli bir yeni sözleşmeyi müjdeler. Zaten evli olan biri için mertebe artışını veya yeni gelir kaynaklarını temsil edebilir. Tanınmayan bir kişiyle evlenmek ise bazen büyük bir geçişi veya yeni ve ağır bir sorumluluğu simgeleyebilir. Genel olarak huzur dolu bir durumu ve hayatınıza istikrar ile manevi gelişim getirecek bir ortaklığın başlangıcını yansıtır.",
        "ar": "الزواج في الحلم رمز عميق للعناية الإلهية والشرف والحفظ من الله. بالنسبة للأعزب، غالباً ما يبشر بزواج حقيقي أو عقد جديد مهم. وبالنسبة للمتزوج بالفعل، قد يمثل رفعة في الشأن أو مصادر دخل جديدة. الزواج من شخص مجهول قد يرمز أحياناً إلى انتقال كبير أو مسؤولية ثقيلة جديدة. وبشكل عام، يعكس الزواج حالة من الطمأنينة وبداية شراكة تجلب الاستقرار والنمو الروحي إلى حياتك.",
        "fr": "Le mariage est un symbole profond de providence, d'honneur et de protection divine. Pour un célibataire, il annonce souvent un mariage réel ou un nouveau contrat important. Pour quelqu'un déjà marié, il peut représenter une ascension ou de nouveaux revenus. Se marier avec une personne inconnue peut parfois symboliser une transition majeure. Dans l'ensemble, cela reflète un état de tranquillité et le début d'un partenariat apportant stabilité et croissance spirituelle.",
        "id": "Pernikahan melambangkan inayah (perlindungan) Ilahi, kehormatan, dan perlindungan dari Allah. Bagi lajang, ini sering meramalkan pernikahan yang nyata atau kontrak baru. Bagi yang sudah menikah, ini bisa mewakili kenaikan pangkat atau sumber penghasilan baru. Menikah dengan orang yang tidak dikenal bisa melambangkan tanggung jawab baru yang berat. Secara keseluruhan, ini mencerminkan ketenangan dan dimulainya kemitraan yang stabil."
    },
    "dream-prayer": {
        "en": "Witnessing yourself praying (Salah) in a dream is one of the most positive visions. It signifies the fulfillment of obligations, the answering of long-awaited duas, and proximity to the Creator. If you are praying towards the Qibla, it reflects steadfastness in faith. If you are leading others in prayer (Imam), it suggests you will bear a responsibility of guidance. Finishing the prayer with Taslim (Salam) indicates the successful completion of a major life task and the arrival of peace into your heart.",
        "tr": "Rüyada kendinizi namaz kılarken (Salat) görmek, en olumlu vizyonlardan biridir. Sorumlulukların yerine getirilmesini, uzun zamandır beklenen duaların kabulünü ve Yaratıcıya yakınlığı simgeler. Kıbleye yönelerek namaz kılmak, imanda sebatı yansıtır. Başkalarına namaz kıldırdığınızı (İmam) görmek, hidayet ve rehberlik sorumluluğu taşıyacağınızı gösterir. Namazı selam vererek bitirmek, büyük bir hayat görevinin başarıyla tamamlandığına ve kalbinize huzurun geldiğine işarettir.",
        "ar": "رؤية نفسك تصلي في المنام هي من أكثر الرؤى إيجابية. فهي ترمز إلى أداء الواجبات، واستجابة الدعوات التي طال انتظارها، والقرب من الخالق سبحانه. إذا كنت تصلي باتجاه القبلة، فهذا يعكس الثبات في الإيمان. وإذا كنت تؤم الآخرين في الصلاة، فهذا يشير إلى أنك ستتحمل مسؤولية في الهداية والإرشاد. إنهاء الصلاة بالتسليم يدل على إتمام مهمة حياتية كبرى بنجاح وحلول السلام في قلبك.",
        "fr": "Se voir prier est l'une des visions les plus positives. Cela signifie l'accomplissement des obligations, l'exaucement des douas et la proximité avec le Créateur. Prier vers la Qibla reflète la fermeté dans la foi. Si vous dirigez la prière (Imam), cela suggère que vous porterez une responsabilité de guide. Terminer la prière par le Taslim (Salam) indique l'achèvement réussi d'une tâche majeure de la vie et l'arrivée de la paix dans votre cœur.",
        "id": "Melihat diri sendiri Sholat dalam mimpi adalah salah satu visi yang paling positif. Ini menandakan penunaian kewajiban, terkabulnya doa yang telah lama dinanti, dan kedekatan dengan Sang Pencipta. Jika Anda sholat menghadap Kiblat, itu mencerminkan keteguhan iman. Jika Anda menjadi Imam bagi orang lain, itu menunjukkan tanggung jawab kepemimpinan. Mengakhiri sholat dengan Salam menunjukkan selesainya tugas besar."
    },
    "dream-rain": {
        "en": "Rain in a dream is a powerful symbol of divine mercy, knowledge, and relief from distress. In Islamic tradition, if the rain is gentle and timely, it foretells a season of blessing and abundance for the land and the dreamer. Drinking rainwater is a sign of gaining beneficial knowledge and healing from physical or spiritual ailments. However, if the rain is a destructive storm with thunder and lightning, it may warn of an upcoming trial or divine displeasure. Seeing rain inside a house specifically can indicate localized mercy or, if the water is muddy, potential family concerns.",
        "tr": "Rüyada yağmur; ilahi rahmetin, ilmin ve sıkıntıdan kurtuluşun güçlü bir sembolüdür. İslami gelenekte yağmur yumuşak ve zamanındaysa, hem toprak hem de rüya sahibi için bir bereket ve bolluk dönemini müjdeler. Yağmur suyu içmek, faydalı ilim öğrenmeye ve bedensel veya manevi hastalıklardan şifaya işarettir. Ancak yağmur gök gürültülü ve şimşekli yıkıcı bir fırtına şeklindeyse, yaklaşan bir imtihan veya ilahi hoşnutsuzluk konusunda uyarı olabilir. Evin içine yağmur yağdığını görmek, o haneye özel bir rahmeti veya su bulanıksa ailevi endişeleri gösterebilir.",
        "ar": "المطر في المنام رمز قوي للرحمة الإلهية والعلم والفرج من الكرب. في التقاليد الإسلامية، إذا كان المطر لطيفاً وفي وقته، فإنه يبشر بموسم من البركة والوفرة للأرض وللرائي. شرب ماء المطر علامة على نيل علم نافع والشفاء من الأمراض البدنية أو الروحية. ومع ذلك، إذا كان المطر عاصفة مدمرة مع رعد وبرق، فقد يحذر من فتنة قادمة أو سخط إلهي. رؤية المطر داخل المنزل تحديداً قد تشير إلى رحمة خاصة بتلك الأسرة، أو إلى هموم عائلية إذا كان الماء كدراً.",
        "fr": "La pluie est un symbole puissant de miséricorde divine, de connaissance et de soulagement. Dans la tradition islamique, une pluie douce annonce une saison de bénédiction et d'abondance. Boire de l'eau de pluie est un signe d'acquisition de savoir bénéfique et de guérison. Cependant, si la pluie est une tempête destructrice, elle peut avertir d'une épreuve. Voir la pluie tomber à l'intérieur d'une maison peut indiquer une miséricorde locale ou, si l'eau est boueuse, des soucis familiaux.",
        "id": "Hujan melambangkan rahmat Ilahi, ilmu, dan kelegaan dari kesusahan. Dalam tradisi Islam, jika hujan turun dengan lembut, itu meramalkan datangnya berkah dan kelimpahan. Minum air hujan adalah tanda mendapatkan ilmu yang bermanfaat dan kesembuhan dari penyakit. Namun, jika hujan berupa badai yang merusak, itu bisa memperingatkan adanya ujian. Melihat hujan di dalam rumah bisa menunjukkan rahmat bagi keluarga tersebut, atau kekhawatiran jika airnya keruh."
    },
    "dream-death": {
        "en": "Death in a dream is a complex symbol that rarely signifies actual physical death. Instead, it often represents a major transition, the end of a difficult phase, or a spiritual awakening. According to Ibn Sirin, death can represent the repayment of a debt or the return of a trust (Amanah). If you see yourself die and then come back to life, it signifies sincere repentance (Tawbah) after committing a mistake. Witnessing the death of a parent may suggest a loss of support, while the death of a child can sometimes represent relief from a persistent enemy or worry.",
        "tr": "Rüyada ölüm, nadiren fiziksel ölümü simgeleyen karmaşık bir semboldür. Bunun yerine genellikle büyük bir geçişi, zor bir evrenin sonlanmasını veya manevi bir uyanışı temsil eder. İbn-i Şirin'e göre ölüm, bir borcun ödenmesini veya bir emanetin iadesini temsil edebilir. Kendinizin öldüğünü ve sonra hayata döndüğünüzü görmek, bir hatadan sonra samimi bir tövbeye işarettir. Bir ebeveynin ölümünü görmek destek kaybını; bir çocuğun ölümü ise bazen kalıcı bir düşmandan veya endişeden kurtuluşu temsil edebilir.",
        "ar": "الموت في المنام رمز معقد نادراً ما يشير إلى الموت الفيزيائي الحقيقي. بدلاً من ذلك، غالباً ما يمثل انتقالاً كبيراً، أو نهاية مرحلة صعبة، أو يقظة روحية. وفقاً لابن سيرين، يمكن أن يمثل الموت قضاء الدين أو رد الأمانة. إذا رأيت نفسك تموت ثم تعود للحياة، فهذا يدل على توبة نصوح بعد ارتكاب خطأ. رؤية موت الوالدين قد توحي بفقدان السند، بينما قد يمثل موت الطفل أحياناً الفرج من عدو لدود أو همّ ملازم.",
        "fr": "La mort dans un rêve est un symbole complexe qui signifie rarement la mort physique. Elle représente souvent une transition majeure, la fin d'une phase difficile ou un réveil spirituel. Selon Ibn Sirin, la mort peut représenter le remboursement d'une dette. Si vous mourez puis revenez à la vie, cela signifie un repentir sincère (Tawbah). Voir la mort d'un parent suggère une perte de soutien, tandis que celle d'un enfant peut représenter le soulagement d'un souci persistant.",
        "id": "Kematian dalam mimpi adalah simbol kompleks yang jarang berarti kematian fisik. Sebaliknya, ini sering mewakili transisi besar, akhir dari fase sulit, atau kebangkitan spiritual. Menurut Ibnu Sirin, kematian bisa berarti pelunasan utang. Jika Anda melihat diri sendiri mati lalu hidup kembali, itu menandakan taubat nasuha. Melihat kematian orang tua mungkin menunjukkan hilangnya dukungan, sedangkan kematian anak bisa mewakili kelegaan dari musuh atau kekhawatiran."
    },
    "dream-shoes": {
        "en": "Shoes in a dream represent your career path, your travels, or your marital relationship. New, comfortable shoes signify prosperity, a stable job, or a compatible partner. Losing your shoes or walking barefoot can indicate a temporary loss of support, financial struggle, or uncertainty about your direction in life. Buying new shoes often foretells a new journey or a new professional opportunity. The color also matters: black shoes signify authority and status, while green shoes represent a journey for spiritual or religious purposes.",
        "tr": "Rüyada ayakkabı; kariyer yolunuzu, yolculuklarınızı veya evlilik ilişkinizi temsil eder. Yeni ve rahat ayakkabılar refahı, istikrarlı bir işi veya uyumlu bir eştir. Ayakkabılarınızı kaybetmek veya çıplak ayakla yürümek; geçici bir destek kaybını, maddi sıkıntıyı veya hayattaki yönünüz konusundaki belirsizliği gösterebilir. Yeni ayakkabı almak genellikle yeni bir yolculuğu veya profesyonel bir fırsatı müjdeler. Renk de önemlidir: Siyah ayakkabı otorite ve statüyü, yeşil ayakkabı ise manevi veya dini amaçlı bir yolculuğu temsil eder.",
        "ar": "الحذاء في المنام يمثل مسار حياتك المهنية، أو أسفارك، أو علاقتك الزوجية. الحذاء الجديد المريح يدل على سعة الرزق، أو وظيفة مستقرة، أو شريك متوافق. فقدان الحذاء أو المشي حافياً قد يشير إلى فقدان مؤقت للسند، أو ضيق مادي، أو حيرة في اتجاهك في الحياة. شراء حذاء جديد غالباً ما يبشر بسفر جديد أو فرصة مهنية جديدة. وللونه دلالة أيضاً: فالأسود يرمز للسلطة والمكانة، والأخضر يمثل رحلة لأغراض روحية أو دينية.",
        "fr": "Les chaussures représentent votre carrière, vos voyages ou votre relation conjugale. Des chaussures neuves et confortables signifient la prospérité ou un partenaire compatible. Perdre ses chaussures peut indiquer une perte temporaire de soutien ou une incertitude. Acheter de nouvelles chaussures annonce souvent un nouveau voyage ou une opportunité professionnelle. La couleur compte : le noir signifie l'autorité, tandis que le vert représente un voyage spirituel ou religieux.",
        "id": "Sepatu melambangkan jalur karir, perjalanan, atau hubungan pernikahan. Sepatu baru yang nyaman menandakan kemakmuran atau pasangan yang cocok. Kehilangan sepatu bisa menunjukkan hilangnya dukungan sementara atau ketidakpastian arah hidup. Membeli sepatu baru meramalkan perjalanan atau peluang profesional baru. Warna hitam melambangkan otoritas, sedangkan hijau melambangkan perjalanan spiritual atau tujuan keagamaan."
    },
    "dream-crying": {
        "en": "Crying in a dream, contrary to what one might expect, often symbolizes upcoming joy and relief (Faraj) from a difficult situation. It represents the shedding of burdens and the purification of the heart. However, there is a distinction: if the crying is silent or involves only tears, it is a very positive omen of blessings. If the crying is accompanied by loud wailing, screaming, or tearing of clothes, it may warn of a trial or a period of grief. Seeing others cry suggests they may need your support or that a communal hardship is about to end.",
        "tr": "Rüyada ağlamak, beklenenin aksine genellikle yaklaşan bir sevinci ve zor bir durumdan kurtuluşu (Ferec) simgeler. Yüklerin atılmasını ve kalbin arınmasını temsil eder. Ancak bir ayrım vardır: Eğer ağlama sessizse veya sadece gözyaşı dökülüyorsa, bu bereketin çok olumlu bir işaretidir. Eğer ağlamaya feryat figan, çığlık veya üst baş yırtma eşlik ediyorsa, bir imtihan veya kederli bir dönem konusunda uyarı olabilir. Başkalarının ağladığını görmek, onların desteğinize ihtiyacı olduğunu veya toplumsal bir sıkıntının bitmek üzere olduğunu gösterebilir.",
        "ar": "البكاء في المنام، على عكس المتوقع، غالباً ما يرمز إلى الفرح القادم والفرج من ضيق. إنه يمثل التخلص من الأعباء وطهارة القلب. ومع ذلك، هناك فرق: فإذا كان البكاء صامتاً أو مجرد دموع، فهو بشرى طيبة بالبركة. أما إذا كان البكاء مصحوباً بعويل أو صراخ أو لطم، فقد يحذر من فتنة أو فترة حزن. رؤية الآخرين يبكون توحي بأنهم قد يحتاجون إلى دعمك أو أن ضائقة عامة على وشك الانتهاء.",
        "fr": "Pleurer dans un rêve, contrairement aux attentes, symbolise souvent la joie à venir et le soulagement (Faraj). Cela représente la libération des fardeaux. Cependant, si les pleurs sont silencieux ou ne sont que des larmes, c'est un très bon présage. Si les pleurs sont accompagnés de gémissements ou de cris, cela peut avertir d'une épreuve. Voir les autres pleurer suggère qu'ils pourraient avoir besoin de votre soutien ou qu'une épreuve collective va prendre fin.",
        "id": "Menangis dalam mimpi seringkali melambangkan kegembiraan yang akan datang dan kelegaan dari kesulitan. Ini mewakili pelepasan beban dan pembersihan hati. Jika tangisan itu diam atau hanya air mata, itu adalah pertanda berkah yang sangat positif. Namun, jika disertai ratapan atau teriakan, itu bisa memperingatkan masa ujian atau kesedihan. Melihat orang lain menangis menunjukkan bahwa mereka mungkin butuh dukungan Anda."
    },
    "dream-car": {
        "en": "A car in a dream represents your movement through life and the level of control you have over your destiny. Driving a car smoothly on a straight road indicates progress, discipline, and success in achieving your goals. If the car is luxury, it signifies a rise in status or honor. However, losing control of the car or being in an accident warns of obstacles or impulsive decisions that may lead to regret. Being a passenger suggests you are relying on someone else's leadership or guidance in a particular area of your life.",
        "tr": "Rüyada araba; hayattaki ilerleyişinizi ve kaderiniz üzerindeki kontrolünüzü temsil eder. Düz bir yolda sorunsuz bir şekilde araba sürmek ilerlemeyi, disiplini ve hedeflerinize ulaşmadaki başarıyı gösterir. Araba lüks ise statü veya onurda bir artışa işarettir. Ancak arabanın kontrolünü kaybetmek veya kaza yapmak, engellere veya pişmanlığa yol açabilecek düşüncesiz kararlara karşı uyarıdır. Yolcu olmak, hayatınızın belirli bir alanında başkasının liderliğine veya rehberliğine güvendiğinizi gösterir.",
        "ar": "السيارة في المنام تمثل حركتك في الحياة ومستوى سيطرتك على مصيرك. قيادة السيارة بسلاسة على طريق مستقيم تدل على التقدم والانضباط والنجاح في تحقيق أهدافك. إذا كانت السيارة فاخرة، فهذا يشير إلى رفعة في الشأن أو المكانة. ومع ذلك، فإن فقدان السيطرة على السيارة أو الوقوع في حادث يحذر من عقبات أو قرارات متهورة قد تؤدي إلى الندم. أما كونك راكباً فيوحي بأنك تعتمد على قيادة شخص آخر أو توجيهه في مجال معين من حياتك.",
        "fr": "Une voiture représente votre mouvement dans la vie et le contrôle que vous avez sur votre destin. Conduire en douceur sur une route droite indique le progrès. Si la voiture est de luxe, cela signifie une ascension sociale. Cependant, perdre le contrôle ou avoir un accident avertit d'obstacles ou de décisions impulsives. Être passager suggère que vous vous appuyez sur le leadership ou les conseils de quelqu'un d'autre dans un domaine de votre vie.",
        "id": "Mobil melambangkan pergerakan hidup Anda dan tingkat kendali Anda atas masa depan. Mengemudi dengan mulus di jalan lurus menunjukkan kemajuan, disiplin, dan kesuksesan. Jika mobilnya mewah, itu menandakan kenaikan pangkat. Namun, kehilangan kendali atau kecelakaan memperingatkan adanya hambatan atau keputusan impulsif yang membawa penyesalan. Menjadi penumpang menunjukkan Anda bergantung pada arahan orang lain."
    },
    "dream-money": {
        "en": "Money in a dream is a symbol that requires careful analysis of its form. Finding paper money often suggests a worldly trial, a heavy responsibility, or stress that will eventually pass. In contrast, finding gold or silver coins is a sign of dignity, high status, and spiritual success. Giving money to others represents resolving a debt or fulfilling a promise. However, losing money or seeing it stolen warns of potential gossip or a loss of trust. If you are counting money, it suggests you are currently pre-occupied with worldly calculations and should perhaps focus more on your spiritual investments.",
        "tr": "Rüyada para, formuna göre dikkatli analiz edilmesi gereken bir semboldür. Kağıt para bulmak genellikle dünyevi bir imtihanı, ağır bir sorumluluğu veya sonunda geçecek bir stresi işaret eder. Buna karşılık, altın veya gümüş para bulmak onur, yüksek statü ve manevi başarının işaretidir. Başkalarına para vermek bir borcun ödeneceğini veya bir sözün tutulacağını temsil eder. Ancak para kaybetmek veya çalındığını görmek, potansiyel dedikodu veya güven kaybı konusunda uyarıdır. Para sayıyorsanız, şu anda dünyevi hesaplarla çok meşgul olduğunuzu ve belki de manevi yatırımlarınıza daha fazla odakmanmanız gerektiğini gösterir.",
        "ar": "المال في المنام رمز يتطلب تحليلاً دقيقاً لشكله. العثور على نقود ورقية غالباً ما يوحي بابتلاء دنيوي، أو مسؤولية ثقيلة، أو هم سيأتي ثم يزول. وفي المقابل، فإن العثور على عملات ذهبية أو فضية علامة على الشرف والمكانة الرفيعة والنجاح الروحي. إعطاء المال للآخرين يمثل قضاء دين أو الوفاء بوعد. ومع ذلك، فإن فقدان المال أو رؤيته يُسرق يحذر من غيبة محتملة أو فقدان للثقة. وإذا كنت تعدّ المال، فهذا يشير إلى أنك مشغول حالياً بالحسابات الدنيوية وربما ينبغي عليك التركيز أكثر على استثماراتك الروحية.",
        "fr": "L'money dans un rêve nécessite une analyse de sa forme. Trouver du papier-monnaie suggère une épreuve mondaine ou un stress qui passera. En revanche, trouver des pièces d'or ou d'argent est un signe de dignité et de succès spirituel. Donner de l'money représente le remboursement d'une dette. Cependant, perdre de l'money avertit de commérages. Compter de l'money suggère que vous êtes trop préoccupé par les calculs matériels.",
        "id": "Uang dalam mimpi adalah simbol yang membutuhkan analisis bentuknya. Menemukan uang kertas menunjukkan ujian duniawi atau stres yang akan berlalu. Sebaliknya, menemukan koin emas atau perak adalah tanda martabat dan kesuksesan spiritual. Memberi uang melambangkan pelunasan utang. Namun, kehilangan uang memperingatkan adanya gosip. Menghitung uang menunjukkan Anda terlalu sibuk dengan urusan duniawi."
    },
    "dream-sea": {
        "en": "The sea is a majestic symbol representing power, vast knowledge, and the depths of the human heart. A calm, clear sea signifies peace of mind, divine favor, and a stable relationship with authority or one's inner self. Walking on the surface of the sea indicates strong faith and the overcoming of impossible odds. However, a stormy or dark sea warns of social unrest, personal conflict, or falling under the displeasure of a powerful individual. If you see yourself drinking from the sea, it foretells gaining immense wealth or deep scholarly wisdom that will benefit many.",
        "tr": "Deniz; gücü, engin ilmi ve insan kalbinin derinliklerini temsil eden görkemli bir semboldür. Sakin ve berrak bir deniz; zihin huzurunu, ilahi inayeti ve otoriteyle veya kişinin iç dünyasıyla olan istikrarlı ilişkisini simgeler. Denizin üstünde yürümek güçlü imana ve imkansız gibi görünen zorlukların üstesinden gelmeye işarettir. Ancak fırtınalı veya karanlık bir deniz; toplumsal huzursuzluk, kişisel çatışma veya güçlü birinin hoşnutsuzluğunu kazanma konusunda uyarıdır. Kendinizi denizden su içerken görmek, büyük bir zenginlik veya birçok kişiye fayda sağlayacak derin bir alimlik hikmeti kazanacağınızı müjdeler.",
        "ar": "البحر رمز مهيب يمثل القوة والعلم الواسع وأعماق قلب الإنسان. البحر الهادئ الصافي يدل على راحة البال، وتوفيق الله، وعلاقة مستقرة مع أصحاب السلطة أو مع النفس. المشي على سطح البحر يشير إلى قوة الإيمان والتغلب على الصعاب المستحيلة. ومع ذلك، فإن البحر الهائج أو المظلم يحذر من اضطراب اجتماعي، أو صراع شخصي، أو الوقوع تحت غضب صاحب نفوذ. إذا رأيت نفسك تشرب من ماء البحر، فهذا يبشر بنيل ثروة هائلة أو علم غزير ينفع الناس.",
        "fr": "La mer est un symbole majestueux représentant le pouvoir, le savoir vaste et les profondeurs du cœur humain. Une mer calme signifie la paix de l'esprit et la faveur divine. Marcher sur l'eau indique une foi solide. Cependant, une mer tempétueuse avertit d'un conflit personnel ou social. Boire de l'eau de mer annonce l'acquisition d'une grande richesse ou d'une profonde sagesse savante.",
        "id": "Laut melambangkan kekuatan, ilmu yang luas, dan kedalaman hati manusia. Laut yang tenang menandakan ketenangan pikiran dan pertolongan Ilahi. Berjalan di atas air menunjukkan iman yang kuat. Namun, laut yang badai memperingatkan adanya konflik. Minum air laut meramalkan perolehan kekayaan besar atau hikmah mendalam yang bermanfaat bagi banyak orang."
    },
    "dream-house": {
        "en": "A house in a dream is a reflection of the dreamer's inner state, spiritual health, and family life. Entering a new, spacious house signifies a positive transition, such as marriage, a new job, or recovery from sickness. A well-built, strong house represents stability and protection from harm. Conversely, a collapsing or dark house warns of family disputes or a decline in one's spiritual condition. Building a house suggests you are working on a long-term goal that will bring lasting security. Cleaning a house symbolizes removing worries and purifying one's environment from negative influences.",
        "tr": "Rüyada ev; rüya sahibinin iç dünyasının, manevi sağlığının ve aile hayatının bir yansımasıdır. Yeni ve ferah bir eve girmek; evlilik, yeni bir iş veya hastalıktan şifa bulmak gibi olumlu bir geçişe işarettir. Sağlam inşa edilmiş güçlü bir ev, istikrarı ve zararlardan korunmayı temsil eder. Aksine, çöken veya karanlık bir ev; ailevi anlaşmazlıklar veya manevi durumdaki bir gerileme konusunda uyarıdır. Ev inşa etmek, kalıcı güvenlik getirecek uzun vadeli bir hedef üzerinde çalıştığınızı gösterir. Ev temizlemek ise endişeleri gidermeyi ve çevresini negatif etkilerden arındırmayı simgeler.",
        "ar": "البيت في المنام هو انعكاس لحال الرائي الباطني، وصحته الروحية، وحياته الأسرية. دخول بيت جديد واسع يدل على تحول إيجابي، كالزواج، أو وظيفة جديدة، أو الشفاء من مرض. البيت القوي المتين يمثل الاستقرار والتحصن من الأذى. وعلى العكس، فإن البيت المنهار أو المظلم يحذر من خلافات عائلية أو تراجع في الحالة الروحية. بناء بيت يوحي بأنك تعمل على هدف طويل الأمد سيجلب لك أماناً مستداماً. وتنظيف البيت يرمز إلى زوال الهموم وتطهير المحيط من التأثيرات السلبية.",
        "fr": "Une maison reflète l'état intérieur, la santé spirituelle et la vie familiale. Entrer dans une nouvelle maison spacieuse signifie une transition positive. Une maison solide représente la stabilité. À l'inverse, une maison sombre avertit de disputes familiales. Construire une maison suggère que vous travaillez sur un objectif à long terme. Nettoyer une maison symbolise l'élimination des soucis.",
        "id": "Rumah mencerminkan keadaan batin, kesehatan spiritual, dan kehidupan keluarga. Memasuki rumah baru yang luas menandakan transisi positif. Rumah yang kokoh melambangkan stabilitas. Sebaliknya, rumah yang gelap memperingatkan adanya perselisihan. Membangun rumah menunjukkan Anda sedang mengerjakan tujuan jangka panjang. Membersihkan rumah melambangkan penghilangan kekhawatiran."
    },
    "dream-fish": {
        "en": "Fish in a dream are primarily symbols of sustenance (Rizq) and profit. If the fish are seen in clear water and can be counted, they represent specific financial gains or blessings that are headed your way. Large fish symbolize wealth and authority, while small fish may indicate minor worries combined with small gains. Catching a fish with your hands signifies hard work leading to a well-deserved reward. If the fish have soft scales, it's a warning to be cautious of those who may use deceit to gain your trust. Seeing fish in a dry area warns of a misplaced effort or an unstable situation.",
        "tr": "Rüyada balık, birincil olarak rızık ve kazanç sembolüdür. Berrak suda görülen ve sayılabilen balıklar, yolunuza çıkan belirli maddi kazançları veya bereketleri temsil eder. Büyük balıklar zenginlik ve otoriteyi simgelerken, küçük balıklar küçük kazançlarla birlikte ufak tefek endişelere işaret edebilir. Elleriyle balık tutmak, hak edilmiş bir ödüle götüren sıkı çalışmayı ifade eder. Balıkların pulları yumuşaksa, güveninizi kazanmak için hile yapabilecek kişilere karşı dikkatli olmanız konusunda bir uyarıdır. Susuz bir yerde balık görmek ise yanlış yere harcanan çabaya veya istikrarsız bir duruma işarettir.",
        "ar": "السمك في المنام هو في المقام الأول رمز للرزق والربح. إذا شوهد السمك في ماء صافٍ وكان معدوداً، فهو يمثل مكاسب مادية محددة أو بركات في طريقها إليك. السمك الكبير يرمز إلى الثروة والسلطة، بينما قد يشير السمك الصغير إلى هموم بسيطة مختلطة بمكاسب قليلة. صيد السمك باليد يدل على عمل دؤوب يؤدي إلى مكافأة مستحقة. وإذا كان السمك ناعم القشر، فهو تحذير لتوخي الحذر ممن قد يستخدم الخداع لنيل ثقتك. رؤية السمك في مكان جاف تحذر من جهد ضائع أو وضع غير مستقر.",
        "fr": "Le poisson est principalement un symbole de subsistance (Rizq) et de profit. Des poissons dans une eau claire représentent des gains financiers ou des bénédictions. Les gros poissons symbolisent la richesse, tandis que les petits peuvent indiquer de légers soucis. Pêcher à la main signifie un travail acharné récompensé. Si les écailles sont molles, méfiez-vous de la tromperie. Voir des poissons sur la terre ferme avertit d'un effort mal placé.",
        "id": "Ikan adalah simbol rezeki dan keuntungan. Ikan di air jernih yang bisa dihitung melambangkan keuntungan finansial. Ikan besar melambangkan kekayaan, sedangkan ikan kecil menunjukkan sedikit kekhawatiran. Menangkap ikan dengan tangan berarti kerja keras yang membuahkan hasil. Jika sisiknya halus, waspadalah terhadap tipu daya. Melihat ikan di darat memperingatkan usaha yang sia-sia."
    },
    "dream-fire": {
        "en": "Fire is a dual symbol representing both guidance and trial. If the fire is used to light a path, to provide warmth, or for cooking, it is a very positive sign of knowledge, wisdom, and hospitality. Witnessing a glowing fire from a distance suggests you will receive good news soon. However, a fire that consumes property, causes injury, or produces thick black smoke warns of conflict (Fitna), loss, or impulsive anger. Being burnt by fire suggests a period of hardship that will ultimately purify your character and lead to a more conscious spiritual life.",
        "tr": "Ateş, hem hidayeti hem de imtihanı temsil eden çift yönlü bir semboldür. Eğer ateş bir yolu aydınlatmak, ısınmak veya yemek pişirmek için kullanılıyorsa; ilim, hikmet ve misafirperverlik adına çok olumlu bir işarettir. Uzaktan parlayan bir ateş görmek, yakında iyi haberler alacağınızı gösterir. Ancak malı mülkü kül eden, yaralanmaya sebep olan veya yoğun siyah duman çıkaran bir ateş; fitneye, kayıplara veya pişmanlık getirecek öfkeye karşı uyarıdır. Ateşte yanmak, sonunda karakterinizi arındıracak ve daha bilinçli bir manevi hayata götüreceü bir zorluk dönemine işarettir.",
        "ar": "النار رمز مزدوج يمثل الهداية والابتلاء معاً. إذا كانت النار تُستخدم لإنارة طريق، أو للدفء، أو للطهي، فهي علامة إيجابية جداً على العلم والحكمة والكرم. رؤية نار متوهجة من بعيد تشير إلى أنك ستتلقى أخباراً طيبة قريباً. ومع ذلك، فإن النار التي تأكل الممتلكات أو تسبب إصابات أو يخرج منها دخان أسود كثيف تحذر من الفتنة أو الخسارة أو الغضب المتهور. الإصابة بحرق من النار توحي بفترة من المشقة التي ستطهر شخصيتك في النهاية وتؤدي إلى حياة روحية أكثر وعياً.",
        "fr": "Le feu est un double symbole représentant la guidance et l'épreuve. S'il sert à éclairer ou réchauffer, c'est un signe positif de sagesse. Voir un feu au loin suggère de bonnes nouvelles. Cependant, un feu destructeur avertit d'un conflit (Fitna) ou d'une perte. Être brûlé suggère une période de difficulté qui purifiera votre caractère et mènera à une vie spirituelle plus consciente.",
        "id": "Api adalah simbol ganda yang mewakili petunjuk dan ujian. Jika api digunakan untuk penerangan atau kehangatan, itu tanda positif. Melihat api dari kejauhan meramalkan berita baik. Namun, api yang merusak memperingatkan adanya konflik (Fitnah) atau kerugian. Terbakar oleh api menunjukkan masa sulit yang akan memurnikan karakter Anda dan membawa kesadaran spiritual."
    },
    "dream-sun": {
        "en": "The sun is a majestic symbol representing a leader, a father figure, or clarity of truth in your life. Witnessing the sun shine brightly signifies a period of guidance, victory over falsehood, and divine favor. If the sun rises from the East as usual, it predicts success in your endeavors and a bright future. However, a clouded or darkened sun warns of potential difficulties for the authorities or the head of the family. Seeing the sun rising from the West is a profound warning from Islamic eschatology, reminding the dreamer to reflect on their ultimate return to God and to hasten toward sincere repentance.",
        "tr": "Güneş; hayatınızdaki bir lideri, babayı veya hakikatin berraklığını temsil eden görkemli bir semboldür. Güneşin parlak bir şekilde doğduğunu görmek; hidayet dönemini, batıla karşı zaferi ve ilahi inayeti simgeler. Güneş her zamanki gibi doğudan yükseliyorsa, girişimlerinizde başarıyı ve parlak bir geleceği müjdeler. Ancak bulutlu veya kararmış bir güneş, otoriteler veya aile reisi için potansiyel zorluklara karşı uyarıdır. Güneşin batıdan doğduğunu görmek ise İslami eskatolojiden (ahiret bilimi) derin bir uyarıdır; rüya sahibine Allah'a nihai dönüşünü hatırlatır ve samimi tövbeye acele etmeye çağırır.",
        "ar": "الشمس رمز مهيب يمثل القائد، أو الأب، أو وضوح الحق في حياتك. رؤية الشمس تشرق بوضوح تدل على فترة من الهداية والنصر على الباطل وتوفيق الله. إذا طلعت الشمس من المشرق كالمعتاد، فهي تبشر بالنجاح في مساعيك ومستقبل مشرق. ومع ذلك، فإن الشمس المحجوبة بالغيوم أو المظلمة تحذر من صعوبات قد تواجه أصحاب السلطة أو رب الأسرة. أما رؤية طلوع الشمس من مغربها فهي تحذير شديد من علامات الساعة، يذكر الرائي بالرجوع إلى الله والمسارعة إلى التوبة النصوح.",
        "fr": "Le soleil représente un leader, le père ou la clarté de la vérité. Un soleil brillant signifie une période de guidance et de victoire. S'il se lève à l'Est, il prédit le succès. Cependant, un soleil obscurci avertit de difficultés. Voir le soleil se lever à l'Ouest est un avertissement majeur de l'eschatologie islamique, rappelant au rêveur de se repentir sincèrement.",
        "id": "Matahari melambangkan pemimpin, ayah, atau kejelasan kebenaran. Melihat matahari bersinar terang menandakan petunjuk dan kemenangan. Jika matahari terbit dari Timur, itu meramalkan kesukesan. Namun, matahari yang mendung memperingatkan kesulitan. Melihat matahari terbit dari Barat adalah peringatan akhir zaman, mengingatkan pemimpi untuk segera bertaubat."
    },
    "dream-prophet": {
        "en": "Seeing the Blessed Prophet Muhammad (PBUH) in a dream is considered a 'Truthful Vision' (Ru'ya Sadiqah), as Shaytan cannot take his form. It is one of the greatest blessings a believer can receive, signifying divine approval, victory for the oppressed, and immense relief for those in distress. If the Prophet (PBUH) appears happy, it reflects the dreamer's good spiritual standing. If he provides advice or a gift, it is a direct guidance to be followed. This vision indicates that mercy is descending upon the dreamer and that their prayers are being heard by the Almighty.",
        "tr": "Rüyada Alemlere Rahmet Hazreti Muhammed (S.A.V)'i görmek, Şeytan O'nun suretine giremeyeceği için 'Sadık Rüya' (Hak Rüya) kabul edilir. Bir müminin alabileceği en büyük lütuflardan biridir; ilahi rızayı, mazlumun zaferini ve darda olanlar için büyük bir ferahlığı simgeler. Efendimiz (S.A.V) mutlu görünüyorsa, bu rüya sahibinin manevi durumunun iyiliğine işarettir. Eğer bir nasihat veya hediye verirse, bu doğrudan uyulması gereken bir rehberliktir. Bu vizyon, rüya sahibinin üzerine rahmet indiğini ve dualarının Yüce Allah tarafından işitildiğini gösterir.",
        "ar": "رؤية النبي المصطفى محمد (صلى الله عليه وسلم) في المنام تُعد 'رؤيا صادقة'، لأن الشيطان لا يتمثل في صورته. وهي من أعظم البشارات التي قد ينالها المؤمن، وتدل على الرضا الإلهي، والنصر للمظلوم، والفرج القريب للمكروب. إذا ظهر النبي (صلى الله عليه وسلم) مبتسماً، فهذا يعكس صلاح حال الرائي الروحي. وإذا قدم نصيحة أو هدية، فهي هداية مباشرة يجب اتباعها. تشير هذه الرؤية إلى أن الرحمة تتنزل على الرائي وأن دعاءه مسموع عند المولى عز وجل.",
        "fr": "Voir le Prophète Muhammad (PSL) est une 'Vision Véridique', car Satan ne peut prendre sa forme. C'est l'une des plus grandes bénédictions, signifiant l'approbation divine, la victoire pour l'opprimé et un soulagement immense. Si le Prophète apparaît heureux, cela reflète la bonne spiritualité du rêveur. S'il donne un conseil, c'est une guidance à suivre. Cette vision indique que la miséricorde descend sur le rêveur.",
        "id": "Melihat Nabi Muhammad (SAW) dianggap sebagai 'Mimpi yang Nyata' karena Setan tidak dapat menyerupai beliau. Ini adalah berkah terbesar, menandakan keridhaan Ilahi, kemenangan bagi yang tertindas, dan kelegaan. Jika Nabi tampak bahagia, itu mencerminkan spiritualitas pemimpi yang baik. Jika beliau memberi nasihat, itu adalah petunjuk yang harus diikuti. Visi ini menunjukkan bahwa rahmat sedang turun."
    }
}

# Fallback and common content
fallbacks = {
    "en": {
        "summary": "Authentic Islamic perspective on {title}.",
        "tldr": "{title} provides essential guidance for a balanced spiritual life.",
        "body": "<p>{title} is explored through the lenses of Quran and authentic Sunnah. Understanding this helps strengthen your Iman.</p>",
        "faqs": [{"q": "What is the significance of {title}?", "a": "It is a key concept defined by scholars based on prophetic traditions."}],
        "refs": ["The Holy Quran", "Sahih Al-Bukhari", "Sahih Muslim"]
    },
    "tr": {
        "summary": "{title} hakkında İslami bilgiler.",
        "tldr": "{title} manevi hayat için önemli rehberlik sunar.",
        "body": "<p>{title} konusu Kur'an ve Sünnet ışığında ele alınmıştır. Bu konuyu anlamak inancınızı güçlendirmeye yardımcı olur.</p>",
        "faqs": [{"q": "{title} nedir?", "a": "İslami kaynaklara göre önemli bir kavramdır."}],
        "refs": ["Kur'an-ı Kerim", "Hadis Kaynakları"]
    },
    "ar": {
        "summary": "منظور إسلامي أصيل حول {title}.",
        "tldr": "يوفر {title} إرشادات أساسية لحياة روحية متوازنة.",
        "body": "<p>يتم استكشاف {title} من خلال عدسات القرآن والسنة الصحيحة. فهم هذا يساعد في تقوية الإيمان.</p>",
        "faqs": [{"q": "ما هي أهمية {title}؟", "a": "إنه مفهوم أساسي حدده العلماء بناءً على التقاليد النبوية."}],
        "refs": ["القرآن الكريم", "صحيح البخاري", "صحيح مسلم"]
    },
    "fr": {
        "summary": "Perspective islamique authentique sur {title}.",
        "tldr": "{title} fournit des conseils essentiels pour une vie spirituelle équilibrée.",
        "body": "<p>{title} est exploré à travers le Coran et la Sunna authentique. Comprendre cela aide à renforcer votre foi.</p>",
        "faqs": [{"q": "Quelle est la signification de {title}?", "a": "C'est un concept clé défini par les savants sur la base des traditions prophétiques."}],
        "refs": ["Le Saint Coran", "Sahih Al-Bukhari", "Sahih Muslim"]
    },
    "id": {
        "summary": "Perspektif Islam otentik tentang {title}.",
        "tldr": "{title} memberikan panduan penting untuk kehidupan spiritual yang seimbang.",
        "body": "<p>{title} dijelajahi melalui lensa Al-Quran dan Sunnah otentik. Memahami hal ini membantu memperkuat Iman Anda.</p>",
        "faqs": [{"q": "Apa pentingnya {title}?", "a": "Ini adalah konsep kunci yang didefinisikan oleh para ulama berdasarkan tradisi kenabian."}],
        "refs": ["Al-Quran", "Sahih Al-Bukhari", "Sahih Muslim"]
    }
}
