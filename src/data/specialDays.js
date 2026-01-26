/**
 * Logic for Special Day Quotes
 * Supports Gregorian (Month-Day) and Hijri (calculated/fixed for 2026)
 */

// Global Special Days (Gregorian)
const SPECIAL_GREGORIAN = {
    // Mother's Day (Approx May 10-14, fixed for demo/2026)
    "05-10": {
        tr: { title: "🎁 Anneler Günü", body: "\"Cennet annelerin ayakları altındadır.\" (Hadis-i Şerif)" },
        en: { title: "🎁 Mother's Day", body: "\"Paradise lies under the feet of mothers.\" (Hadith)" },
        ar: { title: "🎁 عيد الأم", body: "\"الجنة تحت أقدام الأمهات.\" (حديث شريف)" },
        id: { title: "🎁 Hari Ibu", body: "\"Surga berada di bawah telapak kaki ibu.\" (Hadis)" }
    },
    // Father's Day (June 21)
    "06-21": {
        tr: { title: "🎁 Babalar Günü", body: "\"Baba, cennetin orta kapısıdır.\" (Hadis-i Şerif)" },
        en: { title: "🎁 Father's Day", body: "\"The father is the middle gate of Paradise.\" (Hadith)" },
        ar: { title: "🎁 عيد الأب", body: "\"الوالد أوسط أبواب الجنة.\" (حديث شريف)" },
        id: { title: "🎁 Hari Ayah", body: "\"Ayah adalah pintu tengah surga.\" (Hadis)" }
    },
    // New Year (Jan 1)
    "01-01": {
        tr: { title: "📅 Yeni Yıl", body: "\"İki günü eşit olan ziyandadır.\" (Hadis-i Şerif)" },
        en: { title: "📅 New Year", body: "\"He whose two days are equal is a loser.\" (Hadith)" },
        ar: { title: "📅 العام الجديد", body: "\"من استوى يوماه فهو مغبون.\" (حديث شريف)" },
        id: { title: "📅 Tahun Baru", body: "\"Barangsiapa yang dua harinya sama, maka ia merugi.\" (Hadis)" }
    },
    "03-08": { // Women's Day
        tr: { title: "🌸 Dünya Kadınlar Günü", body: "\"Sizin en hayırlınız, kadınlarına karşı en hayırlı olanınızdır.\" (Hadis-i Şerif)" },
        en: { title: "🌸 Women's Day", body: "\"The best of you are those who are best to their women.\" (Hadith)" },
        ar: { title: "🌸 يوم المرأة", body: "\"خياركم خياركم لنسائهم.\" (حديث شريف)" },
        id: { title: "🌸 Hari Wanita", body: "\"Sebaik-baik kalian adalah yang paling baik terhadap wanitanya.\" (Hadis)" }
    }
};

// Islamic Special Days (Fixed for 2026)
// Note: In production, these should be calculated dynamically if possible.
const SPECIAL_ISLAMIC_2026 = {
    // Regaip Kandili (Jan 15, 2026)
    "2026-01-15": {
        tr: { title: "🕯️ Regaip Kandili", body: "\"Allah'ım! Recep ve Şaban'ı bize mübarek kıl ve bizi Ramazan'a ulaştır.\" (Hadis-i Şerif)" },
        en: { title: "🕯️ Regaip Kandili", body: "\"O Allah! Bless us in Rajab and Sha'ban and let us reach Ramadan.\" (Hadith)" },
        ar: { title: "🕯️ ليلة الرغائب", body: "\"اللهم بارك لنا في رجب وشعبان وبلغنا رمضان.\"" },
        id: { title: "🕯️ Malam Regaip", body: "\"Ya Allah! Berkahilah kami di bulan Rajab dan Sya'ban dan sampaikanlah kami ke bulan Ramadhan.\"" }
    },
    // Miraç Kandili (Feb 6, 2026)
    "2026-02-06": {
        tr: { title: "🕌 Miraç Kandili", body: "\"Namaz müminin miracıdır.\"" },
        en: { title: "🕌 Isra and Mi'raj", body: "\"Prayer is the ascension of the believer.\"" },
        ar: { title: "🕌 الإسراء والمعراج", body: "\"الصلاة معراج المؤمن.\"" },
        id: { title: "🕌 Isra Mi'raj", body: "\"Shalat adalah mi'rajnya orang mukmin.\"" }
    },
    // Berat Kandili (Feb 23, 2026)
    "2026-02-23": {
        tr: { title: "📜 Berat Kandili", body: "\"Şaban'ın yarısı (Berat Gecesi) gelince gecesini ibadetle, gündüzünü oruçla geçirin.\" (Hadis-i Şerif)" },
        en: { title: "📜 Shab-e-Barat", body: "\"When it is the night of the middle of Sha'ban, spend its night in prayer and observe a fast on its day.\" (Hadith)" },
        ar: { title: "📜 ليلة البراءة", body: "\"إذا كانت ليلة النصف من شعبان فقوموا ليلها وصوموا نهارها.\"" },
        id: { title: "📜 Nisfu Sya'ban", body: "\"Apabila tiba malam Nisfu Sya'ban, maka hidupkanlah malamnya dan puasalah di siang harinya.\"" }
    },
    // Ramadan Start (Feb 18, 2026 - *Correction from plan which said Sept*)
    // Note: Hijri dates shift. 2026 Ramadan starts approx Feb 17/18.
    "2026-02-18": {
        tr: { title: "🌙 Ramazan-ı Şerif", body: "\"Ey iman edenler! Allah'a karşı gelmekten sakınmanız için oruç, sizden öncekilere farz kılındığı gibi size de farz kılındı.\" (Bakara, 183)" },
        en: { title: "🌙 Ramadan Mubarak", body: "\"O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.\" (Al-Baqara, 183)" },
        ar: { title: "🌙 رمضان مبارك", body: "\"يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ\" (البقرة, 183)" },
        id: { title: "🌙 Ramadan Mubarak", body: "\"Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang sebelum kamu agar kamu bertakwa.\" (Al-Baqara, 183)" }
    },
    // Kadir Gecesi / Laylat al-Qadr (Approx Mar 15, 2026)
    "2026-03-15": {
        tr: { title: "✨ Kadir Gecesi", body: "\"Şüphesiz, biz onu Kadir gecesinde indirdik. Kadir gecesi bin aydan daha hayırlıdır.\" (Kadir Suresi, 1-3)" },
        en: { title: "✨ Laylat al-Qadr", body: "\"Indeed, We sent the Qur'an down during the Night of Decree. The Night of Decree is better than a thousand months.\" (Al-Qadr, 1-3)" },
        ar: { title: "✨ ليلة القدر", body: "\"إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ... لَيْلَةُ ٱلْقَدْرِ خَيْرٌۭ مِّنْ أَلْفِ شَهْرٍۢ\"" },
        id: { title: "✨ Lailatul Qadar", body: "\"Sesungguhnya Kami telah menurunkannya (Al Quran) pada malam kemuliaan... Malam kemuliaan itu lebih baik dari seribu bulan.\"" }
    },
    // Eid al-Fitr (Mar 20, 2026)
    "2026-03-20": {
        tr: { title: "🎉 Ramazan Bayramı", body: "\"Bu günümüzde yapacağımız ilk iş namaz kılmaktır.\" (Hadis-i Şerif)" },
        en: { title: "🎉 Eid al-Fitr", body: "\"The first thing we do on this day of ours is to pray.\" (Hadith)" },
        ar: { title: "🎉 عيد الفطر", body: "\"إن أول ما نبدأ به في يومنا هذا أن نصلي.\"" },
        id: { title: "🎉 Idul Fitri", body: "\"Yang pertama kali kita lakukan pada hari ini adalah shalat.\"" }
    },
    // Eid al-Adha (May 27, 2026)
    "2026-05-27": {
        tr: { title: "🐑 Kurban Bayramı", body: "\"Ademoğlu kurban günü Allah katında kurban kanı akıtmaktan daha sevimli bir amel işlememiştir.\" (Hadis-i Şerif)" },
        en: { title: "🐑 Eid al-Adha", body: "\"The son of Adam does not do any deed on the Day of Sacrifice that is dearer to Allah than shedding blood (of sacrifice).\" (Hadith)" },
        ar: { title: "🐑 عيد الأضحى", body: "\"ما عمل آدمي من عمل يوم النحر أحب إلى الله من إهراق الدم.\"" },
        id: { title: "🐑 Idul Adha", body: "\"Tidak ada amalan anak Adam pada hari raya kurban yang lebih dicintai Allah daripada mengalirkan darah (kurban).\"" }
    },
    // Ashura (Jun 25, 2026)
    "2026-06-25": {
        tr: { title: "🥣 Aşure Günü", body: "\"Ramazan orucundan sonra en faziletli oruç, Allah'ın ayı olan Muharrem ayında tutulan oruçtur.\" (Hadis-i Şerif)" },
        en: { title: "🥣 Day of Ashura", body: "\"The most excellent fast after Ramadan is God's month al-Muharram.\" (Hadith)" },
        ar: { title: "🥣 يوم عاشوراء", body: "\"أفضل الصيام بعد رمضان شهر الله المحرم.\"" },
        id: { title: "🥣 Hari Asyura", body: "\"Puasa yang paling utama setelah Ramadhan adalah puasa di bulan Allah, Muharram.\"" }
    }
};

export const getSpecialQuote = (lang = 'en') => {
    const now = new Date();
    // Format: MM-DD
    const gKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    // Format: YYYY-MM-DD (for specific Islamic dates in 2026)
    const yKey = now.toISOString().split('T')[0];

    // 1. Check Specific Date (Islamic Priority)
    if (SPECIAL_ISLAMIC_2026[yKey]) {
        return SPECIAL_ISLAMIC_2026[yKey][lang] || SPECIAL_ISLAMIC_2026[yKey]['en'];
    }

    // 2. Check Recurring Gregorian Date
    if (SPECIAL_GREGORIAN[gKey]) {
        return SPECIAL_GREGORIAN[gKey][lang] || SPECIAL_GREGORIAN[gKey]['en'];
    }

    return null;
};
