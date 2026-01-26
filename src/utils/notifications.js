import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// --- ADHAN AUDIO PLAYBACK ---
let adhanSound = null;

export const playAdhanSound = async () => {
    try {
        // Stop any existing adhan
        if (adhanSound) {
            await adhanSound.unloadAsync();
            adhanSound = null;
        }

        // Configure audio for playback
        await Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/adhan.mp3'),
            { shouldPlay: true }
        );
        adhanSound = sound;

        // Auto-stop after 10 seconds (short clip for notification)
        setTimeout(async () => {
            if (adhanSound) {
                await adhanSound.stopAsync();
                await adhanSound.unloadAsync();
                adhanSound = null;
            }
        }, 10000);

    } catch (error) {
        // Adhan playback error - ignore
    }
};

export const stopAdhanSound = async () => {
    if (adhanSound) {
        await adhanSound.stopAsync();
        await adhanSound.unloadAsync();
        adhanSound = null;
    }
};

// --- PERMISSION REGISTRATION ---
export const registerForPushNotificationsAsync = async () => {
    // Check for Expo Go
    if (Constants.appOwnership === 'expo') {
        // Push notifications are not fully supported in Expo Go
        return;
    }

    if (Platform.OS === 'android') {
        // Adhan channel with custom sound
        await Notifications.setNotificationChannelAsync('adhan', {
            name: 'Ezan Bildirimleri',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'adhan.mp3', // Custom sound file
        });

        // Default channel
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Genel Bildirimler',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: true,
        });

        // Engagement channel for promotional notifications (dream, dhikr, verse)
        await Notifications.setNotificationChannelAsync('engagement', {
            name: 'Günlük Hatırlatmalar',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: true,
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return finalStatus;
    }

    // 2. Get the token
    try {
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;

        console.log('[notifications] Token acquired:', token);

        // 3. Save to Supabase (if logged in)
        const { supabase } = require('../services/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (user && token) {
            const { error } = await supabase
                .from('profiles')
                .update({ expo_push_token: token })
                .eq('id', user.id);

            if (error) console.error('[notifications] Failed to save token to DB:', error.message);
        }

        return token;
    } catch (e) {
        console.warn('[notifications] Error getting push token:', e.message);
        return finalStatus;
    }
};

// --- PRAYER TIME NOTIFICATIONS ---
const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    // If time has passed for today, leave it as today. 
    // The scheduling logic handles the "if in past, don't schedule" or "schedule for tomorrow" check.
    // However, here we just want the Time Object for today.
    return date;
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const scheduleAllPrayerNotifications = async (timings, language = 'tr') => {
    // Check global setting
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') {
        console.log('[notifications] Notifications disabled by user settings.');
        return;
    }

    console.log('[notifications] Internal: Scheduling individual prayer slots...');

    const prayerNamesByLang = {
        tr: { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' },
        en: { Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
        ar: { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' },
        id: { Fajr: 'Subuh', Sunrise: 'Syuruq', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya' },
    };

    const { getDailyQuote } = require('../services/dailyContentService');
    const todayQuote = await getDailyQuote(language);

    const warningTexts = {
        tr: (name) => `${name} vaktine 15 dakika kaldı.`,
        en: (name) => `${name} prayer in 15 minutes.`,
        ar: (name) => `باقي 15 دقيقة على ${name}.`,
        id: (name) => `${name} dalam 15 menit.`,
    };

    const adhanTexts = {
        tr: (name, key) => key === 'Sunrise' ? `☀️ ${name} vakti girdi. Güneş doğuyor.` : `🕌 ${name} vakti girdi. Ezan okunuyor...`,
        en: (name, key) => key === 'Sunrise' ? `☀️ ${name} time. The sun is rising.` : `🕌 ${name} time. Adhan is being called...`,
        ar: (name, key) => key === 'Sunrise' ? `☀️ حان وقت ${name}. الشمس تشرق.` : `🕌 حان وقت ${name}. الأذان...`,
        id: (name, key) => key === 'Sunrise' ? `☀️ Waktu ${name}. Matahari terbit.` : `🕌 Waktu ${name}. Adzan berkumandang...`,
    };

    const prayerNames = prayerNamesByLang[language] || prayerNamesByLang.tr;
    const getWarning = warningTexts[language] || warningTexts.tr;
    const getAdhan = adhanTexts[language] || adhanTexts.tr;

    const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const key of keys) {
        if (!timings[key]) continue;

        const timeStr = timings[key];
        let prayerDate = parseTime(timeStr);
        if (!prayerDate || isNaN(prayerDate.getTime())) continue;

        // If time has passed today, schedule for TOMORROW
        if (prayerDate <= new Date()) {
            prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const prayerName = prayerNames[key];

        // 1. Warning Notification (15 mins before)
        // We calculate warning time based on the adjust prayerDate
        const warningDate = new Date(prayerDate.getTime() - 15 * 60 * 1000);
        // Only schedule if warning time hasn't passed (which shouldn't happen if we moved prayer to tomorrow, unless it's < 15 mins to midnight and fajr is very early... logic holds)
        if (warningDate > new Date()) {
            const warningTitle = {
                tr: '⏰ Vakit Yaklaşıyor',
                en: '⏰ Time Approaching',
                ar: '⏰ اقترب الوقت',
                id: '⏰ Waktu Mendekat'
            };
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: warningTitle[language] || warningTitle.tr,
                    body: getWarning(prayerName),
                    sound: true,
                    data: { type: 'warning', prayer: key },
                },
                trigger: {
                    type: 'calendar',
                    date: warningDate
                },
            });
        }

        // 2. Exact Time Notification (Adhan)
        // Always schedule since we adjusted date to be future
        const isNotSunrise = key !== 'Sunrise';
        const suffix = {
            tr: 'Vakti',
            en: 'Time',
            ar: 'وقت',
            id: 'Waktu'
        };

        let notificationBody = getAdhan(prayerName, key);
        if (key === 'Sunrise') {
            try {
                const { getDailyQuote } = require('../services/dailyContentService');
                const dateStr = prayerDate.toISOString().split('T')[0];
                const targetQuote = await getDailyQuote(language, dateStr);
                if (targetQuote) {
                    notificationBody = `${targetQuote.body} (${targetQuote.citation || targetQuote.title})`;
                }
            } catch (e) {
                console.error("Failed to fetch quote for notification:", e);
            }
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${prayerName} ${suffix[language] || suffix.tr}`,
                body: notificationBody,
                sound: isNotSunrise ? 'adhan.mp3' : true,
                data: { type: key === 'Sunrise' ? 'daily_quote' : 'adhan', prayer: key },
                ...(Platform.OS === 'android' && { channelId: isNotSunrise ? 'adhan' : 'default' }),
            },
            trigger: {
                type: 'calendar',
                date: prayerDate
            },
        });
    }
};

// --- SPECIAL ISLAMIC DAYS ---
const ISLAMIC_SPECIAL_DAYS = {
    tr: [
        { date: '2026-02-18', title: '🌙 Ramazan Başlangıcı', body: 'Mübarek Ramazan ayınız hayırlı olsun!' },
        { date: '2026-03-14', title: '🌟 Kadir Gecesi', body: 'Bu gece bin aydan hayırlı Kadir Gecesi. Dualarınız kabul olsun.' },
        { date: '2026-03-20', title: '🎉 Ramazan Bayramı', body: 'Ramazan Bayramınız mübarek olsun!' },
        { date: '2026-05-27', title: '🐑 Kurban Bayramı', body: 'Kurban Bayramınız mübarek olsun!' },
        { date: '2026-06-16', title: '📖 Hicri Yılbaşı', body: 'Hicri yeni yılınız hayırlı olsun!' },
        { date: '2026-08-25', title: '💚 Mevlid Kandili', body: 'Mevlid Kandiliniz mübarek olsun!' },
        { date: '2026-01-16', title: '🌙 Regaib Kandili', body: 'Regaib Kandiliniz mübarek olsun!' },
        { date: '2026-02-06', title: '🌙 Miraç Kandili', body: 'Miraç Kandiliniz mübarek olsun!' },
        { date: '2026-02-03', title: '🌙 Berat Kandili', body: 'Berat Kandiliniz mübarek olsun!' },
    ],
    en: [
        { date: '2026-02-18', title: '🌙 Ramadan Begins', body: 'Blessed Ramadan! May your fasting be accepted.' },
        { date: '2026-03-14', title: '🌟 Laylat al-Qadr', body: 'The Night of Power - better than a thousand months.' },
        { date: '2026-03-20', title: '🎉 Eid al-Fitr', body: 'Eid Mubarak! May your Eid be blessed.' },
        { date: '2026-05-27', title: '🐑 Eid al-Adha', body: 'Eid Mubarak! May your sacrifice be accepted.' },
        { date: '2026-06-16', title: '📖 Islamic New Year', body: 'Happy Islamic New Year!' },
        { date: '2026-08-25', title: '💚 Mawlid', body: 'Celebrating the birth of Prophet Muhammad (PBUH).' },
    ],
    ar: [
        { date: '2026-02-18', title: '🌙 بداية رمضان', body: 'رمضان مبارك! تقبل الله صيامكم.' },
        { date: '2026-03-14', title: '🌟 ليلة القدر', body: 'هذه الليلة خير من ألف شهر.' },
        { date: '2026-03-20', title: '🎉 عيد الفطر', body: 'عيد مبارك!' },
        { date: '2026-05-27', title: '🐑 عيد الأضحى', body: 'عيد مبارك! تقبل الله أضحيتكم.' },
        { date: '2026-06-16', title: '📖 رأس السنة الهجرية', body: 'كل عام وأنتم بخير!' },
        { date: '2026-08-25', title: '💚 المولد النبوي', body: 'ذكرى مولد النبي صلى الله عليه وسلم.' },
    ],
    id: [
        { date: '2026-02-18', title: '🌙 Awal Ramadhan', body: 'Selamat menjalankan ibadah puasa!' },
        { date: '2026-03-14', title: '🌟 Lailatul Qadr', body: 'Malam yang lebih baik dari seribu bulan.' },
        { date: '2026-03-20', title: '🎉 Idul Fitri', body: 'Selamat Hari Raya Idul Fitri!' },
        { date: '2026-05-27', title: '🐑 Idul Adha', body: 'Selamat Hari Raya Idul Adha!' },
        { date: '2026-06-16', title: '📖 Tahun Baru Hijriah', body: 'Selamat Tahun Baru Hijriah!' },
        { date: '2026-08-25', title: '💚 Maulid Nabi', body: 'Memperingati kelahiran Nabi Muhammad SAW.' },
    ],
};

export const scheduleSpecialDayNotifications = async (language = 'tr') => {
    // Check global setting
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    const today = new Date();
    const days = ISLAMIC_SPECIAL_DAYS[language] || ISLAMIC_SPECIAL_DAYS.tr;

    for (const day of days) {
        const [year, month, date] = day.date.split('-').map(Number);
        const notificationDate = new Date(year, month - 1, date, 9, 0, 0); // 9 AM

        if (notificationDate > today) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: day.title,
                    body: day.body,
                    sound: true,
                    data: { type: 'special_day' },
                    ...(Platform.OS === 'android' && { channelId: 'engagement' }),
                },
                trigger: {
                    type: 'calendar',
                    date: notificationDate
                },
            });
        }
    }
};

// --- PROMOTIONAL / ENGAGEMENT NOTIFICATIONS ---

export const schedulePromotionalNotifications = async (language = 'tr') => {
    // Check global setting
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    // 1. Morning Dream Notification - 09:00
    // "Rüyada ne gördün?"
    const dreamTitle = {
        tr: '💭 Rüya Tabiri',
        en: '💭 Dream Interpretation',
        ar: '💭 تفسير الأحلام',
        id: '💭 Tafsir Mimpi'
    };
    const dreamBody = {
        tr: 'Bugün rüyanda ne gördün? Nasıl bir yol görünüyor?',
        en: 'What did you see in your dream today? How does the path appear?',
        ar: 'ماذا رأيت في حلمك اليوم؟ وكيف يبدو الطريق؟',
        id: 'Apa yang kamu lihat dalam mimpimu hari ini? Bagaimana jalan itu terlihat?'
    };

    await Notifications.scheduleNotificationAsync({
        content: {
            title: dreamTitle[language] || dreamTitle.tr,
            body: dreamBody[language] || dreamBody.tr,
            sound: true,
            data: { type: 'promotional', action: 'dream' },
            ...(Platform.OS === 'android' && { channelId: 'engagement' }),
        },
        trigger: {
            type: 'daily',
            hour: 9,
            minute: 0,
            repeats: true,
        },
    });

    // 2. Evening Intention/Dhikr Notification - 22:00
    // "Zikir oluşturalım mı?"
    const eveningDhikrTitle = {
        tr: '🌙 Günün Zikri',
        en: '🌙 Daily Dhikr',
        ar: '🌙 ذكر اليوم',
        id: '🌙 Dzikir Harian'
    };
    const eveningDhikrBody = {
        tr: 'Bugün yaşadıklarına veya niyetine göre sana özgün zikir oluşturalim mi?',
        en: 'Shall we create a unique dhikr for you based on your day or intention?',
        ar: 'هل ننشئ لك ذكرًا فريدًا بناءً على يومك أو نيتك؟',
        id: 'Bolehkah kami buatkan dzikir unik untukmu berdasarkan harimu atau niatmu?'
    };

    await Notifications.scheduleNotificationAsync({
        content: {
            title: eveningDhikrTitle[language] || eveningDhikrTitle.tr,
            body: eveningDhikrBody[language] || eveningDhikrBody.tr,
            sound: true,
            data: { type: 'promotional', action: 'dhikr_evening' },
            ...(Platform.OS === 'android' && { channelId: 'engagement' }),
        },
        trigger: {
            type: 'daily',
            hour: 22,
            minute: 0,
            repeats: true,
        },
    });

    // 3. Daily Morning Verse - Removed (Handled by Sunrise Prayer Notification)

    // 4. Friday Reminder (Jummah) - Fridays 10:00
    const fridayMessages = {
        tr: { title: '🤲 Cuma Mübarek', body: 'Bugün Cuma! Günlük zikrini yapmayı unutma.' },
        en: { title: '🤲 Blessed Friday', body: 'It\'s Friday! Don\'t forget your daily dhikr.' },
        ar: { title: '🤲 جمعة مباركة', body: 'اليوم الجمعة! لا تنس ذكرك اليومي.' },
        id: { title: '🤲 Jumat Berkah', body: 'Hari Jumat! Jangan lupa dzikir harianmu.' },
    };
    const fridayMsg = fridayMessages[language] || fridayMessages.tr;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: fridayMsg.title,
            body: fridayMsg.body,
            sound: true,
            data: { type: 'promotional', action: 'dhikr' },
            ...(Platform.OS === 'android' && { channelId: 'engagement' }),
        },
        trigger: {
            type: 'weekly',
            weekday: 6, // Friday
            hour: 10,
            minute: 0,
            repeats: true,
        },
    });
};

export const testNotification = async () => {
    try {
        // 1. Ensure permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Bildirim izni verilmedi! Lütfen ayarlardan izin verin.');
            return;
        }

        // 2. Play Sound Immediately (Foreground Test)
        await playAdhanSound();

        // 3. Schedule Notification (Background Test)
        // Schedule for 5 seconds from now
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔔 Test Bildirimi",
                body: "Bu bir test bildirimidir. Ezan sesi ve titreşim kontrolü yapılıyor.",
                sound: 'adhan.mp3',
                data: { type: 'test' },
                priority: Notifications.AndroidNotificationPriority.MAX,
                vibrate: [0, 250, 250, 250],
                ...(Platform.OS === 'android' && { channelId: 'adhan' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 5,
                repeats: false,
            },
        });

        alert('Test bildirimi 5 saniye içinde gelecek. Lütfen uygulamayı arka plana atın.');

    } catch (error) {
        console.error("Test notification failed:", error);
        alert('Test başarısız: ' + error.message);
    }
};
