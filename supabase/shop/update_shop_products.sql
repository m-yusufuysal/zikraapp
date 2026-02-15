-- 1. SCHEMA FIXES
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'price_display') then
        alter table public.products add column price_display text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'search_keyword') then
        alter table public.products add column search_keyword text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'rating') then
        alter table public.products add column rating numeric;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'name_id') then
        alter table public.products add column name_id text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'name_ar') then
        alter table public.products add column name_ar text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'name_fr') then
        alter table public.products add column name_fr text;
    end if;
    alter table public.products alter column product_url drop not null;
    alter table public.products alter column image_url drop not null;
end $$;

-- 2. Clear existing products
delete from public.products;

-- 3. Insert Products with Localizations (AR, ID, FR)
insert into public.products 
(id, name_en, name_tr, name_ar, name_id, name_fr, category, sub_category, image_url, price_display, search_keyword, rating)
values

-- BOOKS & EDUCATION
(gen_random_uuid(), 'The Holy Quran (Velvet)', 'Kadife Kaplı Kuran-ı Kerim', 'القرآن الكريم (مخمل)', 'Al Quran Mushaf (Beludru)', 'Le Saint Coran (Velours)', 'books', null, null, null, 'Velvet Quran', 4.9),
(gen_random_uuid(), 'Sahih Al-Bukhari Set', 'Sahihi Buhari Külliyatı', 'صحيح البخاري كامل', 'Set Lengkap Sahih Al-Bukhari', 'Collection Sahih Al-Bukhari', 'books', null, null, null, 'Sahih Al Bukhari Set', 4.9),
(gen_random_uuid(), 'Fortress of the Muslim', 'Hisnul Müslim (Dua Kitabı)', 'حصن المسلم', 'Hisnul Muslim (Buku Doa)', 'La Citadelle du Musulman', 'books', null, null, null, 'Hisnul Muslim Fortress of the Muslim', 4.8),
(gen_random_uuid(), 'Stories of the Prophets', 'Peygamberler Tarihi', 'قصص الأنبياء', 'Kisah Para Nabi', 'Histoires des Prophètes', 'books', null, null, null, 'Stories of the Prophets Ibn Kathir', 4.8),
(gen_random_uuid(), 'Tajweed Quran (Color Coded)', 'Tecvidli Kuran-ı Kerim', 'مصحف التجويد الملون', 'Al Quran Tajwid Berwarna', 'Coran Tajwid (Code Couleur)', 'books', null, null, null, 'Color Coded Tajweed Quran', 4.9),
(gen_random_uuid(), 'The Sealed Nectar (Biography)', 'Hz. Muhammedin Hayatı (Siyer)', 'الرحيق المختوم', 'Sirah Nabawiyah (Ar-Raheeq Al-Makhtum)', 'Le Nectar Cacheté', 'books', null, null, null, 'The Sealed Nectar Ar-Raheeq Al-Makhtum', 4.9),
(gen_random_uuid(), 'Islamic Governance', 'İslam Hukuku Kitapları', 'كتب الفقه الإسلامي', 'Buku Fiqih Islam', 'Gouvernance Islamique', 'books', null, null, null, 'Islamic Law Books', 4.6),
(gen_random_uuid(), 'Children''s Islamic Bedtime Stories', 'Çocuklar İçin İslami Masallar', 'قصص إسلامية للأطفال قبل النوم', 'Cerita Islami Sebelum Tidur untuk Anak', 'Histoires Islamiques pour Enfants', 'books', null, null, null, 'Islamic Bedtime Stories Kids', 4.7),
(gen_random_uuid(), 'Riyad us-Saliheen', 'Riyazüs Salihin', 'رياض الصالحين', 'Riyadush Shalihin', 'Le Jardin des Vertueux', 'books', null, null, null, 'Riyad us Saliheen', 4.8),
(gen_random_uuid(), 'Basic Duas for Kids', 'Çocuklar İçin Temel Dualar', 'أدعية أساسية للأطفال', 'Doa Harian Dasar untuk Anak', 'Douas de Base pour Enfants', 'books', null, null, null, 'Basic Duas for Kids Book', 4.5),
(gen_random_uuid(), 'Quran with English Translation', 'İngilizce Mealli Kuran', 'القرآن الكريم مع ترجمة إنجليزية', 'Al Quran Terjemahan Inggris', 'Coran avec Traduction Anglaise', 'books', null, null, null, 'Quran English Translation', 4.8),
(gen_random_uuid(), 'Islamic Notebook / Journal', 'İslami Planlayıcı Defter', 'دفتر / يوميات إسلامية', 'Buku Catatan / Jurnal Islami', 'Carnet / Journal Islamique', 'books', null, null, null, 'Islamic Journal Notebook', 4.6),
(gen_random_uuid(), 'Vocabulary of the Holy Quran', 'Kuran kelimesi Sözlüğü', 'مفردات القرآن الكريم', 'Kosa Kata Al Quran', 'Vocabulaire du Saint Coran', 'books', null, null, null, 'Vocabulary of the Holy Quran', 4.7),

-- WORSHIP
(gen_random_uuid(), 'Luxury Prayer Rug (Thick)', 'Lüks Kadife Seccade', 'سجادة صلاة فاخرة (سميكة)', 'Sajadah Mewah (Tebal)', 'Tapis de Prière de Luxe (Épais)', 'worship', null, null, null, 'Luxury Thick Prayer Rug', 4.9),
(gen_random_uuid(), 'Travel Prayer Mat (Pocket)', 'Cep Tipi Seyahat Seccadesi', 'سجادة صلاة للسفر', 'Sajadah Travel (Saku)', 'Tapis de Prière de Voyage', 'worship', null, null, null, 'Portable Travel Prayer Mat', 4.7),
(gen_random_uuid(), 'Smart Zikir Ring Counter', 'Akıllı Zikir Yüzüğü', 'خاتم التسبيح الذكي', 'Tasbih Digital Smart Ring', 'Bague de Zikir Intelligente', 'worship', null, null, null, 'Smart Zikr Ring Counter', 4.5),
(gen_random_uuid(), 'Wooden Quran Rehal', 'Ahşap Rahle', 'رحال قرآن خشبي', 'Rehal Al-Quran Kayu', 'Rehal de Coran en Bois', 'worship', null, null, null, 'Wooden Quran Stand Hand Carved', 4.8),
(gen_random_uuid(), 'Crystal Prayer Beads (99)', 'Kristal Tesbih (99''lu)', 'سبحة كريستال (99)', 'Tasbih Kristal (99 Butir)', 'Chapelet en Cristal (99)', 'worship', null, null, null, 'Crystal Prayer Beads 99', 4.7),
(gen_random_uuid(), 'Kids Prayer Mat (Interactive)', 'Sesli Çocuk Seccadesi', 'سجادة صلاة تفاعلية للأطفال', 'Sajadah Anak Interaktif', 'Tapis de Prière Interactif pour Enfants', 'worship', null, null, null, 'Interactive Kids Prayer Mat', 4.9),

-- CLOTHING - WOMEN
(gen_random_uuid(), 'Prayer Dress (One Piece)', 'Tek Parça Namaz Elbisesi', 'ملابس الصلاة (قطعة واحدة)', 'Mukena Terusan (Satu Potong)', 'Robe de Prière (Une Pièce)', 'clothing', 'women', null, null, 'Prayer Dress for Women One Piece', 4.8),
(gen_random_uuid(), 'Elegant Abaya', 'Şık Ferace / Abaya', 'عباية أنيقة', 'Abaya Elegan', 'Abaya Élégant', 'clothing', 'women', null, null, 'Abaya Dress for Women', 4.7),
(gen_random_uuid(), 'Chiffon Hijab Set', 'Şifon Şal Seti', 'طقم حجاب شيفون', 'Set Hijab Sifon', 'Ensemble Hijab en Mousseline', 'clothing', 'women', null, null, 'Chiffon Hijab Scarf', 4.8),
(gen_random_uuid(), 'Bonnet Underscarf', 'Bone (Eşarp Altı)', 'بندانا تحت الحجاب', 'Ciput Hijab (Inner)', 'Bonnet Sous-Hijab', 'clothing', 'women', null, null, 'Hijab Underscarf Cap', 4.6),
(gen_random_uuid(), 'Instant Hijab', 'Pratik Hazır Şal', 'حجاب جاهز سريع', 'Hijab Instan', 'Hijab Instantané', 'clothing', 'women', null, null, 'Instant Hijab Scarf', 4.7),
(gen_random_uuid(), 'Modest Swimwear (Burkini)', 'Tam Kapalı Mayo (Haşema)', 'ملابس سباحة محتشمة (بوركيني)', 'Baju Renang Muslimah (Burkini)', 'Maillot de Bain Modeste (Burkini)', 'clothing', 'women', null, null, 'Modest Swimwear Burkini', 4.6),
(gen_random_uuid(), 'Maxi Skirt', 'Uzun Etek', 'تنورة ماكسي', 'Rok Maxi', 'Jupe Maxi', 'clothing', 'women', null, null, 'Modest Maxi Skirt Women', 4.7),

-- CLOTHING - MEN
(gen_random_uuid(), 'Classic White Thobe', 'Beyaz Namaz Cübbesi', 'ثوب أبيض كلاسيكي', 'Gamis Putih Klasik', 'Qamis Blanc Classique', 'clothing', 'men', null, null, 'Men Thobe Jubba White', 4.7),
(gen_random_uuid(), 'Embroidered Kufi Cap', 'Nakışlı Takke', 'طاقية كوفية مطرزة', 'Peci / Kopiah Bordir', 'Kufi Brodé', 'clothing', 'men', null, null, 'Men Kufi Prayer Cap', 4.6),
(gen_random_uuid(), 'Shemagh Scarf', 'Puşi / Shemagh', 'شماغ', 'Surban Shemagh', 'Écharpe Shemagh', 'clothing', 'men', null, null, 'Shemagh Scarf Men', 4.7),
(gen_random_uuid(), 'Bisht Cloak', 'Bişt (Arap Pelerini)', 'بشت', 'Bisht (Jubah Arab)', 'Manteau Bisht', 'clothing', 'men', null, null, 'Bisht Cloak Arab', 4.8),
(gen_random_uuid(), 'Sandals (Leather)', 'Deri Sandalet', 'صنادل جلدية', 'Sandal Kulit', 'Sandales en Cuir', 'clothing', 'men', null, null, 'Mens Leather Sandals Slides', 4.6),

-- HEALTH & FRAGRANCE
(gen_random_uuid(), 'Natural Miswak (Pack)', 'Doğal Misvak (Paket)', 'مسواك طبيعي', 'Miswak Alami (Paket)', 'Siwak Naturel (Paquet)', 'health_fragrance', null, null, null, 'Natural Miswak Stick Pack', 4.9),
(gen_random_uuid(), 'Black Seed Oil (Organic)', 'Çörek Otu Yağı (Organik)', 'زيت الحبة السوداء العضوي', 'Minyak Habbatussauda Organik', 'Huile de Graine Noire (Biologique)', 'health_fragrance', null, null, null, 'Organic Black Seed Oil Cold Pressed', 4.8),
(gen_random_uuid(), 'Alcohol-Free Musk Oil', 'Alkolsüz Misk Kokusu', 'زيت المسك الخالي من الكحول', 'Minyak Misik Non-Alkohol', 'Huile de Musc sans Alcool', 'health_fragrance', null, null, null, 'Alcohol Free Musk Perfume Oil', 4.7),
(gen_random_uuid(), 'Bakhoor Burner (Electric)', 'Elektrikli Buhurdanlık', 'مبخرة كهربائية', 'Pembakar Bakhoor Elektrik', 'Encensoir Électrique (Bakhoor)', 'health_fragrance', null, null, null, 'Electric Bakhoor Incense Burner', 4.6),
(gen_random_uuid(), 'Oud Wood Chips', 'Ud Ağacı Tütsüsü', 'خشب العود', 'Kayu Gaharu (Oud)', 'Copeaux de Bois d''Oud', 'health_fragrance', null, null, null, 'Natural Oud Wood Chips', 4.9),

-- HOME & DECOR
(gen_random_uuid(), 'Ayatul Kursi Metal Art', 'Ayetel Kürsi Metal Tablo', 'لوحة آية الكرسي معدنية', 'Hiasan Dinding Logam Ayat Kursi', 'Art Mural Métallique Ayat al-Kursi', 'home', null, null, null, 'Islamic Metal Wall Art Ayatul Kursi', 4.9),
(gen_random_uuid(), 'Ramadan Lanterns', 'Ramazan Fenerleri', 'فوانيس رمضان', 'Lampion Ramadhan', 'Lanternes de Ramadan', 'home', null, null, null, 'Ramadan Lantern Decoration', 4.8),
(gen_random_uuid(), 'Kaaba Model Trinket', 'Kabe Maketi Biblo', 'مجسم الكعبة المشرفة', 'Miniatur Kabah', 'Figurine Modèle de la Kaaba', 'home', null, null, null, 'Kaaba Replica Model', 4.7),

-- FOOD
(gen_random_uuid(), 'Ajwa Dates (Premium)', 'Acve Hurması (Lüks)', 'تمر عجوة فاخر', 'Kurma Ajwa (Premium)', 'Dattes Ajwa (Premium)', 'food', null, null, null, 'Ajwa Dates Premium', 4.9),
(gen_random_uuid(), 'Medjool Dates (Jumbo)', 'Kudüs Hurması (Jumbo)', 'تمر مجدول جامبو', 'Kurma Medjool (Jumbo)', 'Dattes Medjool (Jumbo)', 'food', null, null, null, 'Medjool Dates Jumbo Organic', 4.8),
(gen_random_uuid(), 'Yemeni Sidr Honey', 'Yemen Sedir Balı', 'عسل السدر اليمني', 'Madu Sidr Yaman', 'Miel de Sidr du Yémen', 'food', null, null, null, 'Royal Sidr Honey Yemen', 4.9),
(gen_random_uuid(), 'Organic Dried Figs', 'Kuru İncir (Organik)', 'تين مجفف عضوي', 'Ara Kering Organik', 'Figues Séchées Biologiques', 'food', null, null, null, 'Organic Dried Figs', 4.7),
(gen_random_uuid(), 'Zamzam Water', 'Zemzem Suyu (İzinli)', 'ماء زمزم', 'Air Zamzam', 'Eau de Zamzam', 'food', null, null, null, 'Zamzam Water Bottle', 4.9);
