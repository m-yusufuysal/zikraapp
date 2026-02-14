import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { ArrowLeft, Map as MapIcon, MapPin } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const QiblaCompass = ({ navigation }) => {
    const { t } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [isAligned, setIsAligned] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [calibrationNeeded, setCalibrationNeeded] = useState(false);

    // === REANIMATED STATE (UI Thread) ===
    const rotation = useSharedValue(0);

    // JS side ref to calculate shortest path
    const currentRotation = useRef(0);

    // Mecca Coordinates
    const KAABA_LAT = 21.422487;
    const KAABA_LONG = 39.826206;

    useEffect(() => {
        let headingSubscription;

        const startCompass = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg(t('location_permission'));
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            calculateQibla(location.coords.latitude, location.coords.longitude);

            // Start Watch Heading
            headingSubscription = await Location.watchHeadingAsync((newHeading) => {
                const { trueHeading, magHeading, accuracy } = newHeading;
                const headingVal = trueHeading >= 0 ? trueHeading : magHeading;

                if (accuracy !== undefined && accuracy < 2) {
                    setCalibrationNeeded(true);
                } else {
                    setCalibrationNeeded(false);
                }

                setHeading(headingVal);

                // Shortest path logic
                let targetRot = (360 - headingVal);
                let diff = targetRot - (currentRotation.current % 360);

                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;

                const nextRot = currentRotation.current + diff;
                currentRotation.current = nextRot;

                // Smooth update on UI thread
                rotation.value = withTiming(nextRot, {
                    duration: 300,
                    easing: Easing.out(Easing.quad)
                });
            });
        };

        startCompass();

        return () => {
            if (headingSubscription) {
                headingSubscription.remove();
            }
        };
    }, []);

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
                    <Text style={[styles.title, (isAligned || ramadanModeEnabled) && { color: '#FFF' }]}>{t('qibla_compass')}</Text>
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
                            color: (isAligned || ramadanModeEnabled) ? '#FFF' : COLORS.matteBlack,
                            textAlign: 'center'
                        }}>
                            {t('mosque_finder.title')}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={[styles.compassContainer, isAligned && styles.compassAligned]}>
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

                    {calibrationNeeded && !isAligned && (
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
    }
});

export default QiblaCompass;
