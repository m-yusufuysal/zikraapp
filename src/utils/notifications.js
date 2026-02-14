import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { WidgetService } from '../services/WidgetService';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { State } from 'react-native-track-player';

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
let wasPlayingBeforeAdhan = false;
let adhanAppStateSubscription = null;

export const playAdhanSound = async () => {
    try {
        try {
            const state = await TrackPlayer.getPlaybackState();
            if (state.state === State.Playing || state === State.Playing) {
                wasPlayingBeforeAdhan = true;
                await TrackPlayer.pause();
                if (__DEV__) console.log('[Adhan] Paused Quran playback');
            } else {
                wasPlayingBeforeAdhan = false;
            }
        } catch (e) {
            if (__DEV__) console.log('[Adhan] TrackPlayer check failed:', e);
        }

        if (adhanSound) {
            await adhanSound.unloadAsync();
            adhanSound = null;
        }

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

        sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.didJustFinish) {
                await stopAdhanSound();
            }
        });

        adhanAppStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                if (__DEV__) console.log('[Adhan] App backgrounded/locked - Stopping Adhan');
                await stopAdhanSound();
            }
        });
    } catch (error) {
        if (__DEV__) console.log('[Adhan] Playback error:', error);
    }
};

export const stopAdhanSound = async () => {
    if (adhanAppStateSubscription) {
        adhanAppStateSubscription.remove();
        adhanAppStateSubscription = null;
    }

    if (adhanSound) {
        try {
            await adhanSound.stopAsync();
            await adhanSound.unloadAsync();
        } catch (e) { }
        adhanSound = null;

        if (wasPlayingBeforeAdhan) {
            try {
                setTimeout(async () => {
                    await TrackPlayer.play();
                    if (__DEV__) console.log('[Adhan] Resumed Quran playback');
                    wasPlayingBeforeAdhan = false;
                }, 500);
            } catch (e) {
                if (__DEV__) console.log('[Adhan] Failed to resume Quran:', e);
            }
        }
    }
};

// --- PERMISSION REGISTRATION ---
export const registerForPushNotificationsAsync = async () => {
    if (Constants.appOwnership === 'expo') return;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('adhan', {
            name: 'Ezan Bildirimleri',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'adhan.mp3',
        });

        await Notifications.setNotificationChannelAsync('default', {
            name: 'Genel Bildirimler',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'islamvyappnotification.wav',
        });

        await Notifications.setNotificationChannelAsync('engagement', {
            name: 'Günlük Hatırlatmalar',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'islamvyappnotification.wav',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') return finalStatus;

    try {
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;

        if (__DEV__) console.log('[notifications] Token acquired:', token);

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

// --- PRAYER TIME NOTIFICATIONS DATA ---
const PRAYER_NAMES_DATA = {
    tr: { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' },
    en: { Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
    fr: { Fajr: 'Imsak', Sunrise: 'Lever du soleil', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' },
    ar: { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' },
    id: { Fajr: 'Subuh', Sunrise: 'Syuruq', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya' },
};

const WARNING_TEXTS_DATA = {
    tr: (name) => `${name} vaktine 15 dakika kaldı.`,
    en: (name) => `${name} prayer in 15 minutes.`,
    fr: (name) => `${name} commence dans 15 minutes.`,
    ar: (name) => `باقي 15 دقيقة على ${name}.`,
    id: (name) => `${name} dalam 15 menit.`,
};

const ADHAN_TEXTS_DATA = {
    tr: (name, key) => key === 'Sunrise' ? `☀️ ${name} vakti girdi. Güneş doğuyor.` : `🕌 ${name} vakti girdi. Ezan okunuyor...`,
    en: (name, key) => key === 'Sunrise' ? `☀️ ${name} time. The sun is rising.` : `🕌 ${name} time. Adhan is being called...`,
    fr: (name, key) => key === 'Sunrise' ? `☀️ Heure de ${name}. Le soleil se lève.` : `🕌 Heure de ${name}. L'Adhan est appelé...`,
    ar: (name, key) => key === 'Sunrise' ? `☀️ حان وقت ${name}. الشمس تشرق.` : `🕌 حan وقت ${name}. الأذان...`,
    id: (name, key) => key === 'Sunrise' ? `☀️ Waktu ${name}. Matahari terbit.` : `🕌 Waktu ${name}. Adzan berkumandang...`,
};

const WARNING_TITLE_DATA = {
    tr: '⏰ Vakit Yaklaşıyor',
    en: '⏰ Time Approaching',
    fr: '⏰ L\'heure approche',
    ar: '⏰ اقترب الوقت',
    id: '⏰ Waktu Mendekat'
};

const PRAYER_SUFFIX_DATA = {
    tr: 'Vakti',
    en: 'Time',
    fr: 'Heure',
    ar: 'وقت',
    id: 'Waktu'
};

const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

// --- CORE PRAYER SCHEDULER ---
export const scheduleAllPrayerNotifications = async (timings, language = 'tr') => {
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    const prayerNames = PRAYER_NAMES_DATA[language] || PRAYER_NAMES_DATA.tr;
    const getWarning = WARNING_TEXTS_DATA[language] || WARNING_TEXTS_DATA.tr;
    const getAdhan = ADHAN_TEXTS_DATA[language] || ADHAN_TEXTS_DATA.tr;
    const warningTitle = WARNING_TITLE_DATA[language] || WARNING_TITLE_DATA.tr;
    const suffix = PRAYER_SUFFIX_DATA[language] || PRAYER_SUFFIX_DATA.tr;

    const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const nextPrayerCandidates = [];

    const { getDailyQuote } = require('../services/dailyContentService');
    const todayQuoteData = await getDailyQuote(language);

    for (const key of keys) {
        if (!timings[key]) continue;
        const timeStr = timings[key];
        let prayerDate = parseTime(timeStr);
        if (!prayerDate || isNaN(prayerDate.getTime())) continue;

        if (prayerDate <= new Date()) {
            prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const prayerName = prayerNames[key];

        // 1. Warning Notification (15 mins before)
        const warningDate = new Date(prayerDate.getTime() - 15 * 60 * 1000);
        if (warningDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: warningTitle,
                    body: getWarning(prayerName),
                    sound: 'islamvyappnotification.wav',
                    data: { type: 'warning', prayer: key },
                    ...(Platform.OS === 'android' && { channelId: 'default' }),
                },
                trigger: { type: SchedulableTriggerInputTypes.DATE, date: warningDate },
            });
        }

        nextPrayerCandidates.push({ name: prayerName, date: prayerDate, time: timeStr });

        // 2. Exact Time Notification (Adhan)
        const isNotSunrise = key !== 'Sunrise';
        let notificationBody = getAdhan(prayerName, key);

        if (key === 'Dhuhr') {
            try {
                const { getDailyQuote: getQuote } = require('../services/dailyContentService');
                const dateStr = prayerDate.toISOString().split('T')[0];
                const targetQuote = await getQuote(language, dateStr);
                if (targetQuote) {
                    notificationBody = `${targetQuote.body} (${targetQuote.citation || targetQuote.title})`;
                }
            } catch (e) { }
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${prayerName} ${suffix}`,
                body: notificationBody,
                sound: isNotSunrise ? 'adhan.mp3' : true,
                data: { type: key === 'Dhuhr' ? 'daily_quote' : (key === 'Sunrise' ? 'sunrise' : 'adhan'), prayer: key },
                ...(Platform.OS === 'android' && { channelId: isNotSunrise ? 'adhan' : 'default' }),
            },
            trigger: { type: SchedulableTriggerInputTypes.DATE, date: prayerDate },
        });
    }

    if (nextPrayerCandidates.length > 0) {
        try {
            nextPrayerCandidates.sort((a, b) => a.date - b.date);
            const nextPrayer = nextPrayerCandidates[0];
            await WidgetService.updateWidgetData({
                prayerName: nextPrayer.name,
                prayerTime: nextPrayer.time,
                quote: todayQuoteData?.body || '',
                quoteSource: todayQuoteData?.title || ''
            });
        } catch (wErr) { }
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
    fr: [
        { date: '2026-02-18', title: '🌙 Début du Ramadan', body: 'Bon Ramadan ! Que votre jeûne soit accepté.' },
        { date: '2026-03-14', title: '🌟 Laylat al-Qadr', body: 'La Nuit du Destin - meilleure que mille mois.' },
        { date: '2026-03-20', title: '🎉 Aïd el-Fitr', body: 'Aïd Moubarak ! Que votre Aïd soit béni.' },
        { date: '2026-05-27', title: '🐑 Aïd el-Adha', body: 'Aïd Moubarak ! Que votre sacrifice soit accepté.' },
        { date: '2026-06-16', title: '📖 Nouvel An Islamique', body: 'Bonne Année Islamique !' },
        { date: '2026-08-25', title: '💚 Mawlid', body: 'Célébration de la naissance du Prophète Mahomet (PSL).' },
    ],
};

export const scheduleSpecialDayNotifications = async (language = 'tr') => {
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    const today = new Date();
    const days = ISLAMIC_SPECIAL_DAYS[language] || ISLAMIC_SPECIAL_DAYS.tr;

    for (const day of days) {
        const [year, month, date] = day.date.split('-').map(Number);
        const notificationDate = new Date(year, month - 1, date, 9, 0, 0);
        if (notificationDate > today) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: day.title,
                    body: day.body,
                    sound: 'islamvyappnotification.wav',
                    data: { type: 'special_day' },
                    ...(Platform.OS === 'android' && { channelId: 'engagement' }),
                },
                trigger: { type: SchedulableTriggerInputTypes.DATE, date: notificationDate },
            });
        }
    }
};

// --- PROMOTIONAL ---
export const schedulePromotionalNotifications = async (language = 'tr') => {
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.content.data?.type === 'promotional') {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }
    } catch (e) { }

    const dreamTitle = {
        tr: '💭 Rüya Tabiri', en: '💭 Dream Interpretation', fr: '💭 Interprétation des rêves', ar: '💭 تفسير الأحلام', id: '💭 Tafsir Mimpi'
    };
    const dreamBody = {
        tr: 'Bugün rüyanda ne gördün? Nasıl bir yol görünüyor?',
        en: 'What did you see in your dream today? How does the path appear?',
        fr: 'Qu\'avez-vous vu dans votre rêve aujourd\'hui ? Quel chemin apparaît ?',
        ar: 'ماذا رأيت في حلمك اليوم؟ وكيف يبدو الطريق؟',
        id: 'Apa yang kamu lihat dalam mimpimu hari ini? Bagaimana jalan itu terlihat?'
    };

    await Notifications.scheduleNotificationAsync({
        content: {
            title: dreamTitle[language] || dreamTitle.tr,
            body: dreamBody[language] || dreamBody.tr,
            sound: 'islamvyappnotification.wav',
            data: { type: 'promotional', action: 'dream' },
            ...(Platform.OS === 'android' && { channelId: 'engagement' }),
        },
        trigger: { type: SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
    });

    const eveningDhikrTitle = {
        tr: '🌙 Günün Zikri', en: '🌙 Daily Dhikr', fr: '🌙 Dhikr du jour', ar: '🌙 ذكر اليوم', id: '🌙 Dzikir Harian'
    };
    const eveningDhikrBody = {
        tr: 'Bugün yaşadıklarına veya niyetine göre sana özgün zikir oluşturalim mi?',
        en: 'Shall we create a unique dhikr for you based on your day or intention?',
        fr: 'Souhaitez-vous créer un dhikr unique pour vous en fonction de votre journée ou de votre intention ?',
        ar: 'هل ننشئ لك ذكرًا فريدًا بناءً على يومك أو نيتك؟',
        id: 'Bolehkah kami buatkan dzikir unik untukmu berdasarkan harimu atau niatmu?'
    };

    await Notifications.scheduleNotificationAsync({
        content: {
            title: eveningDhikrTitle[language] || eveningDhikrTitle.tr,
            body: eveningDhikrBody[language] || eveningDhikrBody.tr,
            sound: 'islamvyappnotification.wav',
            data: { type: 'promotional', action: 'dhikr_evening' },
            ...(Platform.OS === 'android' && { channelId: 'engagement' }),
        },
        trigger: { type: SchedulableTriggerInputTypes.DAILY, hour: 22, minute: 0 },
    });

    try {
        const { getDailyQuote: getQuote } = require('../services/dailyContentService');
        const quote = await getQuote(language);
        const quoteTitle = {
            tr: '📖 Günün Sözü', en: '📖 Quote of the Day', fr: '📖 Citation du Jour', ar: '📖 حكمة اليوم', id: '📖 Kata-kata Hari Ini'
        };
        await Notifications.scheduleNotificationAsync({
            content: {
                title: quoteTitle[language] || quoteTitle.tr,
                body: `"${quote.body}" — ${quote.citation || quote.title}`,
                sound: 'islamvyappnotification.wav',
                data: { type: 'promotional', action: 'daily_quote' },
                ...(Platform.OS === 'android' && { channelId: 'engagement' }),
            },
            trigger: { type: SchedulableTriggerInputTypes.DAILY, hour: 12, minute: 45 },
        });
    } catch (e) { }
};

export const testNotification = async () => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Bildirim izni verilmedi!');
            return;
        }
        await playAdhanSound();
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
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false },
        });
        alert('Test bildirimi 5 saniye içinde gelecek.');
    } catch (error) {
        alert('Test başarısız: ' + error.message);
    }
};
