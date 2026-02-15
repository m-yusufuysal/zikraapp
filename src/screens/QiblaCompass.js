import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { ArrowLeft, Map as MapIcon, MapPin, WifiOff } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getLocationCache } from '../utils/storage';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const QiblaCompass = ({ navigation }) => {
    const { t } = useTranslation();
    const { nightModeEnabled } = useTheme();
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [isAligned, setIsAligned] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [calibrationNeeded, setCalibrationNeeded] = useState(false);
    const [isFlat, setIsFlat] = useState(true);
    const [tiltAngle, setTiltAngle] = useState(0);
    const [usingCachedLocation, setUsingCachedLocation] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    // === REANIMATED STATE (UI Thread) ===
    const rotation = useSharedValue(0);

    // JS side ref to calculate shortest path
    const currentRotation = useRef(0);

    // Mecca Coordinates
    const KAABA_LAT = 21.422487;
    const KAABA_LONG = 39.826206;

    const lastHeading = useRef(null);
    const ALPHA = 0.15; // Smoothing factor for EMA

    useEffect(() => {
        let headingSubscription = null;
        let accelSubscription = null;
        let isMounted = true;

        const startSensors = async () => {
            try {
                setIsLoading(true);
                setErrorMsg(null);
                setUsingCachedLocation(false);

                // 1. Check Location Permission
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    // Try to use cache if permission denied (maybe previously granted?)
                    // Unlikely, but let's check cache logic below if we want to be robust. 
                    // For now, respect permission denial.
                    if (isMounted) setErrorMsg(t('location_permission'));
                    setIsLoading(false);
                    return;
                }

                // 2. Get Location with Timeout (10 seconds)
                let location = null;
                try {
                    location = await Promise.race([
                        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
                    ]);
                } catch (locError) {
                    console.warn("Location fetch failed:", locError);

                    // RETRY LOGIC OR FALLBACK TO CACHE
                    if (isMounted) {
                        if (retryCount < MAX_RETRIES) {
                            setRetryCount(prev => prev + 1);
                            // Verify if we have cache before showing specific retry message?
                            // Just retry normally first.
                            setErrorMsg(t('compass.location_retry') || 'Konum alınamadı, tekrar deneniyor...');
                            setTimeout(() => startSensors(), 2000);
                            return;
                        }

                        // Retries exhausted - Try Cache
                        console.log("Retries exhausted, checking cache...");
                        const cachedLoc = await getLocationCache();
                        console.log("Cached location:", cachedLoc);

                        // getLocationCache returns a string name unfortunately in storage.js...
                        // Wait, looking at storage.js: 
                        // setLocationCache = async (data) => AsyncStorage.setItem(CACHE_KEYS.LOCATION, JSON.stringify(data));
                        // But in HomeScreen.js: setLocationCache(rawLocation); -> rawLocation is a STRING name?
                        // Oh no. HomeScreen.js line 202: setLocationCache(rawLocation);
                        // storage.js line 41: JSON.parse(data).
                        // If it's a string, JSON.parse might fail or work if it's quoted.
                        // HomeScreen.js usage implies it stores the NAME of the location, not coordinates!
                        // "setLocationCache(rawLocation)" where rawLocation = "Istanbul, Turkey".

                        // CRITICAL: We need COORDINATES for Qibla.
                        // HomeScreen.js does NOT seem to cache coordinates in `CACHE_KEYS.LOCATION`.
                        // storage.js: `CACHE_KEYS.LOCATION = 'cached_location'`
                        // HomeScreen.js stores the *text address* there.

                        // I need to update HomeScreen.js or storage.js to store COORDINATES too?
                        // Or maybe `CACHE_KEYS.PRAYER_TIMES` implies we have them? No, that's times.

                        // Actually, I should probably check if `getLocationCache` returns coordinates. 
                        // Let's re-read `src/utils/storage.js` and `HomeScreen.js`.
                        // HomeScreen.js Line 202: `setLocationCache(rawLocation);` -> String.

                        // Wait, `getPrayerTimesCache` helps? No.

                        // I need to Implement COORDINATE CACHING in HomeScreen.js first or handle it here?
                        // Since I can't easily change HomeScreen running logic without user interaction, 
                        // I might be stuck if the USER hasn't run the *new* code yet.
                        // But I can implement the coordinate saving in THIS file (QiblaCompass) if they use it once successfully.

                        // Plan B: I will check if I can get last known position from Expo Location?
                        const lastKnown = await Location.getLastKnownPositionAsync();
                        if (lastKnown) {
                            location = lastKnown;
                            setUsingCachedLocation(true);
                        } else {
                            // Fallback failed
                            setErrorMsg(t('compass.location_failed') || 'Konum alınamadı. Lütfen GPS açık olduğundan emin olun.');
                            setIsLoading(false);
                            return;
                        }
                    }
                }

                if (!location || !location.coords) {
                    if (isMounted) setErrorMsg(t('compass.location_failed') || 'Konum verisi alınamadı. Lütfen GPS ve pusula iznini kontrol edin.');
                    setIsLoading(false);
                    return;
                }

                calculateQibla(location.coords.latitude, location.coords.longitude);

                // 3. Check Accelerometer Availability and Subscribe
                try {
                    const isAvailable = await Accelerometer.isAvailableAsync();
                    if (isAvailable) {
                        accelSubscription = Accelerometer.addListener(data => {
                            if (!isMounted) return;
                            const { x, y, z } = data;
                            const magnitude = Math.sqrt(x * x + y * y + z * z);
                            const tilt = Math.acos(z / magnitude) * (180 / Math.PI);
                            setTiltAngle(Math.round(tilt));
                            setIsFlat(tilt < 20);
                        });
                        Accelerometer.setUpdateInterval(100);
                    } else {
                        // Device doesn't have accelerometer, assume flat
                        if (isMounted) setIsFlat(true);
                    }
                } catch (accelError) {
                    console.warn("Accelerometer error:", accelError);
                    // Continue without tilt detection
                    if (isMounted) setIsFlat(true);
                }

                // 4. Heading Tracking with Error Handling
                try {
                    headingSubscription = await Location.watchHeadingAsync((newHeading) => {
                        if (!isMounted) return;

                        const { trueHeading, magHeading, accuracy } = newHeading;
                        let rawHeading = trueHeading >= 0 ? trueHeading : magHeading;

                        // Platform specific accuracy check
                        if (Platform.OS === 'ios') {
                            setCalibrationNeeded(accuracy < 0 || accuracy > 20);
                        } else {
                            setCalibrationNeeded(accuracy < 2);
                        }

                        // Apply Low-Pass Filter (EMA) with circular wrapping
                        let filteredHeading = rawHeading;
                        if (lastHeading.current !== null) {
                            let diff = rawHeading - lastHeading.current;
                            if (diff > 180) diff -= 360;
                            if (diff < -180) diff += 360;
                            filteredHeading = lastHeading.current + ALPHA * diff;
                            filteredHeading = (filteredHeading + 360) % 360;
                        }

                        lastHeading.current = filteredHeading;
                        setHeading(filteredHeading);

                        // Shortest path logic for Animation
                        let targetRot = (360 - filteredHeading);
                        let animDiff = targetRot - (currentRotation.current % 360);

                        if (animDiff > 180) animDiff -= 360;
                        if (animDiff < -180) animDiff += 360;

                        const nextRot = currentRotation.current + animDiff;
                        currentRotation.current = nextRot;

                        rotation.value = withTiming(nextRot, {
                            duration: 200,
                            easing: Easing.out(Easing.quad)
                        });
                    });
                } catch (headingError) {
                    console.error("Heading subscription error:", headingError);
                    if (isMounted) {
                        setErrorMsg(t('compass.heading_error') || 'Pusula sensörü başlatılamadı. Cihazınızı kalibre etmeyi deneyin.');
                    }
                }

                if (isMounted) setIsLoading(false);

            } catch (error) {
                console.error("QiblaCompass sensor error:", error);
                if (isMounted) {
                    setErrorMsg(t('compass.general_error') || 'Bir hata oluştu. Lütfen tekrar deneyin.');
                    setIsLoading(false);
                }
            }
        };

        startSensors();

        return () => {
            isMounted = false;
            // Safe subscription cleanup
            if (headingSubscription && typeof headingSubscription.remove === 'function') {
                try { headingSubscription.remove(); } catch (e) { }
            }
            if (accelSubscription && typeof accelSubscription.remove === 'function') {
                try { accelSubscription.remove(); } catch (e) { }
            }
        };
    }, [retryCount]);

    const calculateQibla = (lat, long) => {
        const PI = Math.PI;
        let latk = (KAABA_LAT * PI) / 180.0;
        let longk = (KAABA_LONG * PI) / 180.0;
        let phi = (lat * PI) / 180.0;
        let lambda = (long * PI) / 180.0;
        let qibla =
            (180.0 / PI) *
            Math.atan2(
                Math.sin(longk - lambda),
                Math.cos(phi) * Math.tan(latk) - Math.sin(phi) * Math.cos(longk - lambda)
            );

        if (qibla < 0) qibla += 360;
        setQiblaDirection(qibla);
    };

    const getAngleDiff = (a, b) => {
        let normA = ((a % 360) + 360) % 360;
        let normB = ((b % 360) + 360) % 360;
        let diff = Math.abs(normA - normB);
        if (diff > 180) diff = 360 - diff;
        return diff;
    };

    const wasAlignedRef = useRef(false);

    useEffect(() => {
        const angleDiff = getAngleDiff(heading, qiblaDirection);
        const nowAligned = angleDiff < 3;

        if (nowAligned && !wasAlignedRef.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Vibration.vibrate(500);
        }
        wasAlignedRef.current = nowAligned;
        setIsAligned(nowAligned);
    }, [heading, qiblaDirection]);

    useEffect(() => {
        if (!isAligned) return;
        const interval = setInterval(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 800);
        return () => clearInterval(interval);
    }, [isAligned]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });

    return (
        <RamadanBackground customStandardGradient={isAligned ? [COLORS.matteGreen, COLORS.primaryDark] : null}>
            <StatusBar barStyle={isAligned ? "light-content" : "dark-content"} />
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, isAligned && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <ArrowLeft size={24} color={isAligned ? '#FFF' : COLORS.matteBlack} />
                    </TouchableOpacity>
                    <Text style={[styles.title, (isAligned || nightModeEnabled) && { color: '#FFF' }]}>{t('qibla_compass')}</Text>
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MosqueFinder')}
                            style={[styles.backButton, isAligned && { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        >
                            <MapIcon size={24} color={isAligned ? '#FFF' : COLORS.matteBlack} />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 9,
                            marginTop: 4,
                            fontWeight: '600',
                            color: (isAligned || nightModeEnabled) ? '#FFF' : COLORS.matteBlack,
                            textAlign: 'center'
                        }}>
                            {t('mosque_finder.title')}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {isLoading && !errorMsg && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>{t('compass.loading') || 'Pusula yükleniyor...'}</Text>
                            {retryCount > 0 && (
                                <Text style={styles.retryText}>
                                    {t('compass.retry_attempt') || 'Deneme'}: {retryCount}/{MAX_RETRIES}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Offline / Cached Location Indicator */}
                    {usingCachedLocation && !isLoading && (
                        <View style={styles.offlineBanner}>
                            <WifiOff size={14} color="#FFF" />
                            <Text style={styles.offlineText}>Offline Mode - Using Last Known Location</Text>
                        </View>
                    )}

                    <View style={[styles.compassContainer, isAligned && styles.compassAligned, isLoading && { opacity: 0.5 }]}>
                        <View style={styles.centerLine} />

                        <Animated.View style={[styles.dial, animatedStyle]}>
                            <Text style={[styles.cardinal, { top: 45, alignSelf: 'center', color: '#E74C3C' }]}>{t('compass.cardinals.N')}</Text>
                            <Text style={[styles.cardinal, { bottom: 45, alignSelf: 'center' }]}>{t('compass.cardinals.S')}</Text>
                            <Text style={[styles.cardinal, { right: 45, top: '50%', marginTop: -13 }]}>{t('compass.cardinals.E')}</Text>
                            <Text style={[styles.cardinal, { left: 45, top: '50%', marginTop: -13 }]}>{t('compass.cardinals.W')}</Text>

                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                                <View key={deg} style={[styles.tickContainer, { transform: [{ rotate: `${deg}deg` }] }]}>
                                    <View style={[styles.tick, deg % 90 === 0 ? { height: 15, width: 3 } : {}]} />
                                </View>
                            ))}

                            <View style={[styles.qiblaMarkerContainer, { transform: [{ rotate: `${qiblaDirection}deg` }] }]}>
                                <View style={styles.qiblaIconShell}>
                                    <View style={styles.kaabaCube} />
                                </View>
                                <View style={styles.qiblaLine} />
                            </View>
                        </Animated.View>

                        <View style={styles.centerHub}>
                            <MapPin size={24} color={isAligned ? COLORS.matteGreen : COLORS.textSecondary} />
                        </View>
                    </View>

                    <View style={styles.readoutContainer}>
                        <View style={styles.readoutBox}>
                            <Text style={styles.readoutLabel}>{t('compass.heading')}</Text>
                            <Text style={styles.readoutValue}>{Math.round(heading)}°</Text>
                        </View>
                        <View style={styles.readoutBox}>
                            <Text style={styles.readoutLabel}>{t('compass.qibla')}</Text>
                            <Text style={[styles.readoutValue, { color: COLORS.matteGreen }]}>
                                {Math.round(qiblaDirection)}°
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.successBanner, { opacity: isAligned ? 1 : 0 }]}>
                        <Text style={styles.successText}>{t('compass.facing_qibla')}</Text>
                    </View>

                    {!isFlat && !isAligned && (
                        <View style={styles.tiltBanner}>
                            <Text style={styles.calibrationText}>{t('compass.hold_flat')}</Text>
                            <Text style={{ fontSize: 10, color: '#FFF', textAlign: 'center' }}>{tiltAngle}°</Text>
                        </View>
                    )}

                    {calibrationNeeded && !isAligned && isFlat && (
                        <View style={styles.calibrationBanner}>
                            <Text style={styles.calibrationText}>{t('compass.calibrate')}</Text>
                        </View>
                    )}

                    {errorMsg && <Text style={{ color: 'red', marginTop: 20 }}>{errorMsg}</Text>}
                </View>
            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.matteBlack,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
    },
    compassContainer: {
        width: width * 0.85,
        height: width * 0.85,
        backgroundColor: '#FFF',
        borderRadius: width * 0.425,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 8,
        borderColor: '#F0F0F0',
    },
    compassAligned: {
        borderColor: COLORS.matteGreen,
        shadowColor: COLORS.matteGreen,
        shadowOpacity: 0.3,
    },
    dial: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    cardinal: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.matteGreen,
    },
    tickContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    tick: {
        width: 2,
        height: 10,
        backgroundColor: COLORS.matteGreen,
        marginTop: 20, // Offset from edge
    },
    centerHub: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    centerLine: {
        position: 'absolute',
        top: 0,
        width: 4,
        height: 40,
        backgroundColor: COLORS.matteBlack, // The phone's heading indicator
        zIndex: 10,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    qiblaMarkerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    qiblaIconShell: {
        marginTop: 50, // Position on the ring
        alignItems: 'center',
    },
    kaabaCube: {
        width: 24,
        height: 24,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: 'gold',
        transform: [{ rotate: '45deg' }], // Diamond shape for style
    },
    qiblaLine: {
        position: 'absolute',
        top: 74,
        bottom: '50%',
        width: 1,
        backgroundColor: 'rgba(46, 89, 74, 0.3)', // Subtle line to center
    },
    readoutContainer: {
        flexDirection: 'row',
        marginTop: 50,
        gap: 20,
    },
    readoutBox: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
        elevation: 2,
        minWidth: 100,
    },
    readoutLabel: {
        fontSize: 10,
        color: '#95A5A6',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    readoutValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.matteBlack,
        fontVariant: ['tabular-nums'],
    },
    successBanner: {
        position: 'absolute',
        bottom: 80, // Positioned at bottom of content area
        backgroundColor: COLORS.matteGreen,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        elevation: 4,
    },
    successText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    calibrationBanner: {
        position: 'absolute',
        bottom: 130,
        backgroundColor: '#F39C12',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 16,
        elevation: 3,
    },
    calibrationText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center'
    },
    tiltBanner: {
        position: 'absolute',
        bottom: 130,
        backgroundColor: COLORS.error || '#E74C3C',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 16,
        elevation: 3,
        alignItems: 'center',
        width: width * 0.7
    },
    loadingContainer: {
        position: 'absolute',
        top: 60,
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    retryText: {
        fontSize: 12,
        color: '#F39C12',
        marginTop: 4,
    },
    offlineBanner: {
        position: 'absolute',
        top: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(230, 126, 34, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        zIndex: 20,
    },
    offlineText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    }
});

export default QiblaCompass;
