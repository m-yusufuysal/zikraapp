-- ============================================
-- Zikra App - Add Shop Products (Affiliate Verified)
-- Targeted products with Amazon Affiliate friendly links
-- Lütfen 'YOUR_TAG_HERE' kısımlarını kendi Amazon Associate ID'nizle değiştirin.
-- ============================================

-- Clear existing if any
DELETE FROM public.products;

-- 1. Quran-i Kerim
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Kur''an-ı Kerim - Orta Boy', 
    'The Holy Quran - Medium Size', 
    'القرآن الكريم - حجم متوسط', 
    'Al-Qur''an - Ukuran Sedang', 
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400', 
    'books', 
    5.0, 
    'https://www.amazon.com.tr/dp/B07KWX9PB6?tag=YOUR_TAG_HERE'
);

-- 2. Luxury Prayer Mat
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Lüks Kadife Seccade', 
    'Luxury Velvet Prayer Mat', 
    'سجادة صلاة مخملية فاخرة', 
    'Sajadah Beludru Mewah', 
    'https://images.unsplash.com/photo-1609599006353-e629e1d90f9a?auto=format&fit=crop&q=80&w=400', 
    'worship', 
    4.9, 
    'https://www.amazon.com.tr/dp/B08L7V7Y6N?tag=YOUR_TAG_HERE'
);

-- 3. Digital Dhikr Counter
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Dijital Zikirmatik', 
    'Digital Dhikr Counter', 
    'مسبحة إلكترونية رقمية', 
    'Tasbih Digital', 
    'https://m.media-amazon.com/images/I/61K-qF8ZqSL._AC_SL1000_.jpg', 
    'worship', 
    4.8, 
    'https://www.amazon.com.tr/dp/B07YDB2H7Y?tag=YOUR_TAG_HERE'
);

-- 4. Riyad-us Saliheen
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Riyazus Salihin (Tam Metin)', 
    'Riyad-us Saliheen', 
    'رياض الصالحين', 
    'Riyadhus Shalihin', 
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', 
    'books', 
    5.0, 
    'https://www.amazon.com.tr/dp/9752621743?tag=YOUR_TAG_HERE'
);

-- 5. Kuka Prayer Beads
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Hakiki Kuka Tesbih', 
    'Authentic Kuka Wood Tasbih', 
    'سبحة كوكا أصلية', 
    'Tasbih Kayu Kuka Asli', 
    'https://m.media-amazon.com/images/I/61L9z9X6-HL._AC_SL1000_.jpg', 
    'worship', 
    4.7, 
    'https://www.amazon.com.tr/dp/B08W5G5XJR?tag=YOUR_TAG_HERE'
);

-- 6. Amber Fragrance
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Saf Amber Esansı', 
    'Pure Amber Fragrance', 
    'عطر العنبر الصافي', 
    'Wewangian Amber Murni', 
    'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=400', 
    'health_fragrance', 
    4.9, 
    'https://www.amazon.com.tr/dp/B07H8NXZ6S?tag=YOUR_TAG_HERE'
);

-- 7. Medine Mebrum Dates
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Medine Mebrum Hurma', 
    'Medina Mebrum Dates', 
    'تمور المدينة مبروك', 
    'Kurma Mebrum Madinah', 
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=400', 
    'food', 
    4.8, 
    'https://www.amazon.com.tr/dp/B08P2CDXW3?tag=YOUR_TAG_HERE'
);

-- 8. Wooden Book Rest (Rahle)
INSERT INTO public.products (name_tr, name_en, name_ar, name_id, image_url, category, rating, product_url)
VALUES (
    'Oymalı Ahşap Rahle', 
    'Carved Wooden Quran Stand', 
    'حامل قرآن خشبي منحوت', 
    'Rahle Kayu Ukir', 
    'https://m.media-amazon.com/images/I/71YyN7f0lZL._AC_SL1500_.jpg', 
    'home', 
    5.0, 
    'https://www.amazon.com.tr/dp/B07K6RLZ3N?tag=YOUR_TAG_HERE'
);

