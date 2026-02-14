import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { BookOpen, Compass, Handshake, MapPin, Moon, ShoppingBag, Tv } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Easing, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';
import RamadanBackground from '../components/RamadanBackground';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import '../i18n/i18n';
import { translateText } from '../services/CommunityService';
import { getPrayerTimes } from '../services/prayerService';
import { supabase } from '../services/supabase';
import { isTablet } from '../utils/responsive';
import { getLocationCache, getPrayerTimesCache, setLocationCache, setPrayerTimesCache } from '../utils/storage';
import { COLORS, FONTS } from '../utils/theme';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * (isTablet ? 0.4 : 0.65);
const STROKE_WIDTH = 2;

const HomeScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const isTr = i18n.language.startsWith('tr');
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef(null);
    const { unreadCount, clearUnreadCount } = useNotifications();

    const handleCommunityPress = async () => {
        navigation.navigate('Community');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { markAllNotificationsAsRead } = require('../services/CommunityNotificationService');
                await markAllNotificationsAsRead(user.id);
            }
        } catch (e) { }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            if (navigation.isFocused()) {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }
        });
        return unsubscribe;
    }, [navigation]);

    const [loading, setLoading] = useState(true);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [locationName, setLocationName] = useState(t('location_finding'));
    const [nextPrayer, setNextPrayer] = useState(null);
    const [dailyVerse, setDailyVerse] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [ramadanTimerData, setRamadanTimerData] = useState(null); // Memoized Ramadan calculations
    const [sound, setSound] = useState(null);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const prayerNames = { Fajr: 'fajr', Sunrise: 'sunrise', Dhuhr: 'dhuhr', Asr: 'asr', Maghrib: 'maghrib', Isha: 'isha' };
    const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);

    const playAdhan = async () => {
        try {
            if (sound) await sound.unloadAsync();
            const { sound: playbackObject } = await Audio.Sound.createAsync(require('../assets/sounds/adhan.mp3'), { shouldPlay: true });
            setSound(playbackObject);
            setIsAdhanPlaying(true);
            setTimeout(async () => {
                if (playbackObject) {
                    await playbackObject.stopAsync();
                    await playbackObject.unloadAsync();
                    setIsAdhanPlaying(false);
                }
            }, 30000);
        } catch (error) {
            setIsAdhanPlaying(false);
        }
    };

    const stopAdhan = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
            } catch (error) { }
        }
        setIsAdhanPlaying(false);
    };

    useEffect(() => {
        if (Constants.appOwnership === 'expo') return;
        try {
            const sub1 = Notifications.addNotificationReceivedListener(notification => {
                if (notification.request.content.data?.type === 'adhan') playAdhan();
            });
            const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
                if (response.notification.request.content.data?.type === 'adhan') playAdhan();
            });
            return () => {
                sub1.remove();
                sub2.remove();
            };
        } catch (error) { }
    }, []);

    const fetchingRef = useRef(false);

    const fetchData = async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            // 1. Load Caches Immediately
            const cachedLocation = await getLocationCache();
            const cachedPrayerTimes = await getPrayerTimesCache();

            if (cachedLocation) setLocationName(cachedLocation);
            if (cachedPrayerTimes) {
                setPrayerTimes(cachedPrayerTimes);
                setLoading(false);
            }

            // 2. Request Permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationName(t('location_permission_denied'));
                setLoading(false);
                fetchingRef.current = false;
                return;
            }

            // 3. Get Coordinates (10s Timeout)
            const location = await Promise.race([
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
            ]).catch(() => null);

            if (!location) {
                console.warn("[HomeScreen] Location acquisition failed or timed out.");
                setLoading(false);
                fetchingRef.current = false;
                return;
            }

            const { latitude, longitude } = location.coords;

            // 4. Fetch Fresh Prayer Times (DO THIS FIRST)
            try {
                const times = await getPrayerTimes(latitude, longitude);
                if (times) {
                    setPrayerTimes(times);
                    setPrayerTimesCache(times);
                    // Update notifications in background
                    const NotificationService = require('../services/NotificationService').default;
                    NotificationService.scheduleAllNotifications(times, i18n.language);
                }
            } catch (e) {
                console.warn("[HomeScreen] Prayer times fetch failed:", e);
            }

            // 5. Update Location Name (Non-blocking geocoding and translation)
            Location.reverseGeocodeAsync({ latitude, longitude }).then(async (results) => {
                try {
                    if (results && results[0]) {
                        const { country, city, district, subregion } = results[0];
                        const localName = city || district || subregion;
                        const rawLocation = localName ? `${localName}, ${country}` : country;

                        // Set raw first
                        setLocationName(rawLocation);
                        setLocationCache(rawLocation);

                        // Localize for non-Turkish languages
                        if (i18n.language && !i18n.language.startsWith('tr')) {
                            const translated = await translateText(rawLocation, i18n.language, 'auto');
                            if (translated && translated !== rawLocation) {
                                setLocationName(translated);
                                setLocationCache(translated);
                            }
                        }
                    }
                } catch (e) { }
            }).catch(() => { });

        } catch (error) {
            console.error("[HomeScreen] Critical fetchData error:", error);
            if (!locationName) setLocationName(t('location_error'));
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    };

    const getDailyVerseLocal = async () => {
        try {
            const { getDailyQuote } = require('../services/dailyContentService');
            const lang = (i18n.language || 'en').split('-')[0];
            const data = await getDailyQuote(lang);

            if (data && !data.error) {
                setDailyVerse({
                    verse: {
                        text: data.body,
                        sourceDisplay: data.citation || data.title
                    }
                });
            }
        } catch (e) {
            console.error("Error fetching daily quote:", e);
        }
    };

    useEffect(() => {
        // Trigger widget update whenever key data changes
        if (prayerTimes && dailyVerse && locationName) {
            const { WidgetService } = require('../services/WidgetService');
            WidgetService.updateWidgetData(prayerTimes, dailyVerse, locationName);
        }
    }, [prayerTimes, dailyVerse, locationName]);

    useEffect(() => {
        fetchData();
        getDailyVerseLocal();
    }, [i18n.language]);

    useEffect(() => {
        if (!prayerTimes) return;
        const updateTimer = () => {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            const getMins = (str) => {
                if (!str) return 0;
                const [h, m] = str.split(':');
                return parseInt(h) * 60 + parseInt(m);
            };
            const prayers = [
                { name: 'Fajr', time: getMins(prayerTimes.Fajr) },
                { name: 'Sunrise', time: getMins(prayerTimes.Sunrise) },
                { name: 'Dhuhr', time: getMins(prayerTimes.Dhuhr) },
                { name: 'Asr', time: getMins(prayerTimes.Asr) },
                { name: 'Maghrib', time: getMins(prayerTimes.Maghrib) },
                { name: 'Isha', time: getMins(prayerTimes.Isha) }
            ];
            let next = prayers.find(p => p.time > currentMins);
            let prev = prayers[prayers.length - 1];
            if (!next) {
                next = { ...prayers[0], time: prayers[0].time + 1440 };
                prev = prayers[prayers.length - 1];
            } else {
                const idx = prayers.indexOf(next);
                if (idx > 0) prev = prayers[idx - 1];
            }
            setNextPrayer(next.name);
            const diff = next.time - currentMins - (next.time > 1440 && currentMins > 1440 ? 1440 : 0);
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            const s = 59 - now.getSeconds();
            setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            let totalInterval = next.time - prev.time;
            if (totalInterval < 0) totalInterval += 1440;
            let elapsed = currentMins - prev.time;
            if (elapsed < 0) elapsed += 1440;
            const progress = elapsed / totalInterval;
            Animated.timing(progressAnim, { toValue: progress, duration: 1000, useNativeDriver: false, easing: Easing.linear }).start();

            // Ramadan Timer Calculations (computed once per second, not inline)
            if (ramadanModeEnabled) {
                const fajr = getMins(prayerTimes.Fajr);
                const maghrib = getMins(prayerTimes.Maghrib);
                let label = t('ramadan.time_to_iftar');
                let targetMins = maghrib;
                const ramadanStart = new Date(2026, 1, 18);
                const diffMs = now - ramadanStart;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
                let spiritualLabel = "";
                let spiritualCount = 0;
                const isNight = currentMins >= maghrib || currentMins < fajr;
                if (isNight) {
                    label = t('ramadan.time_to_sahur');
                    targetMins = currentMins >= maghrib ? fajr + 1440 : fajr;
                    spiritualLabel = t('ramadan.tarawih');
                    spiritualCount = diffDays >= 0 ? diffDays + 1 : 0;
                } else {
                    spiritualLabel = t('ramadan.day');
                    spiritualCount = diffDays > 0 ? diffDays : 0;
                }
                const ramadanDiff = targetMins - currentMins;
                const rH = Math.floor(ramadanDiff / 60);
                const rM = ramadanDiff % 60;
                const rS = 59 - now.getSeconds();
                setRamadanTimerData({
                    label,
                    spiritualLabel,
                    spiritualCount,
                    time: `${rH.toString().padStart(2, '0')}:${rM.toString().padStart(2, '0')}:${rS.toString().padStart(2, '0')}`
                });
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [prayerTimes, ramadanModeEnabled]);

    return (
        <RamadanBackground starCount={120}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, alignItems: 'center' }]}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { fetchData(); getDailyVerseLocal(); }} />}
            >
                <View style={{ width: '100%', maxWidth: isTablet ? 600 : '100%' }}>
                    <View style={[styles.header, { marginTop: 20 }]}>
                        <View>
                            <Text style={[styles.dateText, ramadanModeEnabled && { color: '#FFF' }]}>
                                {new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                            </Text>
                            <Text style={[styles.hijriDateText, ramadanModeEnabled && { color: '#FFD700' }]}>
                                {new Intl.DateTimeFormat(i18n.language + '-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                            </Text>
                            <View style={styles.locationRow}>
                                <MapPin size={14} color={ramadanModeEnabled ? '#FFD700' : COLORS.matteGreen} />
                                <Text style={[styles.locationText, ramadanModeEnabled && { color: '#FFD700' }]}>{locationName}</Text>
                            </View>
                        </View>
                        <View style={styles.headerRightButtons}>
                            <TouchableOpacity onPress={() => navigation.navigate('QiblaCompass')} style={styles.iconBtn}><Compass size={24} color={COLORS.matteGreen} strokeWidth={1.5} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('KaabaLive')} style={[styles.iconBtn, { marginTop: 10 }]}><Tv size={24} color="#000" strokeWidth={1.5} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Shop')} style={[styles.iconBtn, { marginTop: 10 }]}><ShoppingBag size={24} color="#E67E22" strokeWidth={1.5} /></TouchableOpacity>
                            <TouchableOpacity onPress={handleCommunityPress} style={[styles.iconBtn, { marginTop: 10 }]}>
                                <Handshake size={24} color="#e74c3c" strokeWidth={1.5} />
                                {unreadCount > 0 && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {ramadanModeEnabled && prayerTimes && ramadanTimerData && (
                        <View style={styles.ramadanCard}>
                            <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ramadanGradient} />
                            <View style={styles.ramadanOverlay}>
                                <View style={styles.ramadanHeader}>
                                    <View style={{ flex: 1, height: 1.5, backgroundColor: 'rgba(255, 215, 0, 0.3)', borderRadius: 1 }} />
                                    <Moon size={18} color="#FFD700" fill="#FFD700" style={{ marginHorizontal: 12 }} />
                                    <View style={{ flex: 1, height: 1.5, backgroundColor: 'rgba(255, 215, 0, 0.3)', borderRadius: 1 }} />
                                </View>
                                <View style={styles.ramadanContent}>
                                    {ramadanTimerData.spiritualCount > 0 && ramadanTimerData.spiritualCount <= 30 && (
                                        <Text style={styles.ramadanDayLabel}>
                                            {isTr ? `${ramadanTimerData.spiritualCount}. ${ramadanTimerData.spiritualLabel}` : `${ramadanTimerData.spiritualLabel} ${ramadanTimerData.spiritualCount}`}
                                        </Text>
                                    )}
                                    <Text style={styles.ramadanLabel}>{ramadanTimerData.label.toUpperCase()}</Text>
                                    <Text style={[styles.ramadanTimer, { color: '#FFD700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>
                                        {ramadanTimerData.time}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.heroContainer}>
                        <View style={styles.circleOuter}>
                            <View style={styles.circleInner}>
                                <Text style={[styles.labelRemaining, ramadanModeEnabled && { color: 'rgba(255,255,255,0.7)' }]}>{t('home.remaining_time')}</Text>
                                <Text style={[styles.timeRemaining, ramadanModeEnabled && { color: '#FFF' }]}>{timeRemaining || "00:00:00"}</Text>
                                <View style={[styles.nextPrayerBadge, ramadanModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                                    <Text style={[styles.nextPrayerText, ramadanModeEnabled && { color: '#FFD700' }]}>{nextPrayer ? t(`prayers.${nextPrayer.toLowerCase()}`) : '...'}</Text>
                                </View>
                            </View>
                            <View style={[styles.progressRing, { transform: [{ rotate: '-90deg' }] }, ramadanModeEnabled && { borderColor: '#FFD700', opacity: 0.4 }]} />
                        </View>
                    </View>

                    <View style={styles.gridContainer}>
                        {prayerTimes && Object.keys(prayerNames).map((key) => {
                            const isActive = key === nextPrayer;
                            const isRamadanInactive = ramadanModeEnabled && !isActive;
                            return (
                                <View
                                    key={key}
                                    style={[
                                        styles.gridItem,
                                        isRamadanInactive && { backgroundColor: 'rgba(0, 0, 0, 0.05)', borderColor: 'rgba(255,255,255,0.1)' },
                                        isActive && (ramadanModeEnabled ? styles.gridItemActiveRamadan : styles.gridItemActive)
                                    ]}
                                >
                                    <Text style={[
                                        styles.gridLabel,
                                        isRamadanInactive && { color: 'rgba(255,255,255,0.9)' },
                                        isActive && (ramadanModeEnabled ? styles.textActiveRamadan : styles.textActive)
                                    ]}>{t(`prayers.${key.toLowerCase()}`)}</Text>
                                    <Text style={[
                                        styles.gridTime,
                                        isRamadanInactive && { color: '#FFFFFF' },
                                        isActive && (ramadanModeEnabled ? styles.textActiveRamadan : styles.textActive)
                                    ]}>{prayerTimes[key]}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {dailyVerse && (
                        <View
                            style={[
                                styles.verseCard,
                                ramadanModeEnabled && {
                                    borderLeftColor: '#FFD700',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    borderLeftWidth: 4
                                }
                            ]}
                        >
                            <View style={styles.verseHeader}>
                                <BookOpen size={18} color={ramadanModeEnabled ? '#FFD700' : COLORS.matteGreen} />
                                <Text style={[styles.verseLabel, ramadanModeEnabled && { color: '#FFD700' }]}>{t('home.daily_quote')}</Text>
                            </View>
                            <Text style={[styles.verseText, ramadanModeEnabled && { color: '#FFFFFF' }]}>"{dailyVerse.verse.text}"</Text>
                            <Text style={[styles.verseSource, ramadanModeEnabled && { color: '#FFD700' }]}>{dailyVerse.verse.sourceDisplay || t('home.daily_quote')}</Text>
                        </View>
                    )}

                    <AdBanner />
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
            {isAdhanPlaying && (
                <TouchableOpacity style={styles.stopOverlay} onPress={stopAdhan} activeOpacity={0.9}>
                    <View style={styles.stopContent}><BellOff color="#FFF" size={48} strokeWidth={1.5} /><Text style={styles.stopText}>{t('home.stop_adhan')}</Text><Text style={styles.stopSubText}>{t('home.tap_to_stop')}</Text></View>
                </TouchableOpacity>
            )}
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 30 },
    dateText: { ...FONTS.h2, fontSize: 24, color: COLORS.matteBlack, marginBottom: 2 },
    hijriDateText: { ...FONTS.body, fontSize: 14, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { ...FONTS.caption, color: COLORS.matteGreen, letterSpacing: 0.5, fontSize: 12 },
    ramadanCard: { marginHorizontal: 24, height: 140, borderRadius: 24, overflow: 'hidden', marginBottom: 30, backgroundColor: '#1a1a1a', shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    ramadanGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
    ramadanOverlay: { flex: 1, padding: 20, justifyContent: 'center' },
    ramadanHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    ramadanContent: { alignItems: 'center' },
    ramadanLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    ramadanTimer: { color: '#FFF', fontSize: 32, fontWeight: '700', fontVariant: ['tabular-nums'] },
    iconBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.cardBg, justifyContent: 'center', alignItems: 'center', shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
    heroContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
    circleOuter: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, borderWidth: 1, borderColor: 'rgba(46, 89, 74, 0.1)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)' },
    circleInner: { alignItems: 'center' },
    labelRemaining: { ...FONTS.caption, color: COLORS.textSecondary, marginBottom: 8 },
    timeRemaining: { fontSize: 48, fontWeight: '200', color: COLORS.matteBlack, fontVariant: ['tabular-nums'], letterSpacing: -2, marginBottom: 12 },
    nextPrayerBadge: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: 'rgba(46, 89, 74, 0.1)', borderRadius: 20 },
    nextPrayerText: { ...FONTS.caption, color: COLORS.matteGreen, fontSize: 12, fontWeight: '700' },
    progressRing: { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, borderRadius: CIRCLE_SIZE / 2, borderWidth: 2, borderColor: COLORS.matteGreen, opacity: 0.2 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, justifyContent: 'space-between', marginBottom: 30 },
    gridItem: { width: '31%', overflow: 'hidden', paddingVertical: 16, alignItems: 'center', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', backgroundColor: 'transparent' },
    gridItemActive: { backgroundColor: COLORS.matteGreen, borderColor: COLORS.matteGreen },
    gridItemActiveRamadan: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    gridLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '500' },
    gridTime: { fontSize: 16, color: COLORS.matteBlack, fontWeight: '600' },
    textActive: { color: '#FFFFFF' },
    textActiveRamadan: { color: '#000000', fontWeight: '700' },
    ramadanDayLabel: { fontSize: 12, fontWeight: '900', color: '#FFD700', letterSpacing: 2, marginBottom: 4, opacity: 0.9 },
    verseCard: { marginHorizontal: 24, overflow: 'hidden', backgroundColor: 'transparent', borderColor: 'rgba(0, 0, 0, 0.1)', borderWidth: 1, padding: 24, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: COLORS.matteGreen, marginBottom: 30, shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
    verseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    verseLabel: { ...FONTS.caption, color: COLORS.matteGreen },
    verseText: { ...FONTS.body, fontSize: 16, fontStyle: 'italic', color: COLORS.textPrimary, marginBottom: 12 },
    verseSource: { ...FONTS.caption, textAlign: 'right', color: COLORS.matteGreen },
    headerRightButtons: { flexDirection: 'column', alignItems: 'center' },
    stopOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', padding: 40 },
    stopContent: { alignItems: 'center', justifyContent: 'center' },
    stopText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
    stopSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8, textAlign: 'center' },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#e74c3c',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
