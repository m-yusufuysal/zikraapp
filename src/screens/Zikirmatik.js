import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View, AppState } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThrottledHaptic } from '../hooks/useThrottledHaptic';
import { COLORS, COMMON_STYLES } from '../utils/theme';

const { width } = Dimensions.get('window');
const ZIKIRMATIK_STORAGE_KEY = 'zikirmatik_free_count';

const Zikirmatik = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // === WORKLET-BASED STATE (UI Thread) ===
    const count = useSharedValue(0);
    const scale = useSharedValue(1);

    // Display state (JS thread) - synced from worklet
    const [displayCount, setDisplayCount] = React.useState(0);

    // Ref to track if we need to save
    const lastSavedCount = useRef(0);
    const saveTimeout = useRef(null);

    // Throttled haptic for performance
    const triggerHaptic = useThrottledHaptic();

    // Load initial count
    useEffect(() => {
        const loadCount = async () => {
            try {
                const saved = await AsyncStorage.getItem(ZIKIRMATIK_STORAGE_KEY);
                if (saved) {
                    const parsed = parseInt(saved, 10);
                    if (!isNaN(parsed)) {
                        count.value = parsed;
                        setDisplayCount(parsed);
                        lastSavedCount.current = parsed;
                    }
                }
            } catch (e) {
                console.warn('Failed to load Zikirmatik count', e);
            }
        };
        loadCount();

        // AppState listener to save on background
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState.match(/inactive|background/)) {
                saveCountNow();
            }
        });

        return () => {
            subscription.remove();
            saveCountNow(); // Save on unmount
        };
    }, []);

    // Save helper
    const saveCountNow = async () => {
        // We can't easily read sharedValue from JS synchronously if rely on it, 
        // but displayCount is synced.
        // However, inside this closure 'displayCount' might be stale if used directly in useEffect cleanup?
        // Actually, best to use a ref that updates on every sync.
        // But let's use the 'displayCount' state effect approach for saving?
    };

    // Better Save Logic: Update storage when displayCount changes (debounced)
    useEffect(() => {
        if (displayCount === lastSavedCount.current) return;

        // Debounce save (e.g. every 1 second or 500ms of inactivity)
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await AsyncStorage.setItem(ZIKIRMATIK_STORAGE_KEY, displayCount.toString());
                lastSavedCount.current = displayCount;
            } catch (e) {
                // ignore
            }
        }, 1000);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [displayCount]);


    // === TAP GESTURE (Runs on UI Thread via Gesture Handler) ===
    const tapGesture = Gesture.Tap()
        .onStart(() => {
            'worklet';
            // Increment on UI thread (instant, no bridge)
            count.value = count.value + 1;

            // Capture value immediately for sync
            const newCount = count.value;

            // Instant mechanical response (30ms attack)
            scale.value = withSequence(
                withTiming(0.88, { duration: 30, easing: Easing.linear }),
                withTiming(1, { duration: 60, easing: Easing.linear })
            );

            // Sync to JS thread for display (non-blocking)
            runOnJS(setDisplayCount)(newCount);
            runOnJS(triggerHaptic)();
        });

    const handleReset = () => {
        count.value = 0;
        setDisplayCount(0);
        triggerHaptic();
        // Clear storage immediately
        AsyncStorage.setItem(ZIKIRMATIK_STORAGE_KEY, '0').catch(() => { });
    };

    // === ANIMATED STYLES (UI Thread) ===
    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={COMMON_STYLES.container}>
                <LinearGradient
                    colors={[COLORS.primaryDark, '#001a0d']}
                    style={COMMON_STYLES.container}
                >
                    {/* Header */}
                    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft size={24} color={COLORS.accentLight} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('dhikr.zikirmatik')}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>

                        {/* ZIKIRMATIK DEVICE */}
                        <View style={styles.zikirmatikContainer}>
                            <View style={styles.zikirmatikBody}>
                                {/* Display Screen */}
                                <View style={styles.screenFrame}>
                                    <View style={styles.lcdScreen}>
                                        <Text style={styles.digitalCount}>{displayCount}</Text>
                                        <Text style={styles.targetLabel}>{t('dhikr.free_mode')}</Text>
                                    </View>
                                </View>

                                {/* Main Button - Animated with Gesture Handler */}
                                <GestureDetector gesture={tapGesture}>
                                    <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
                                        <View style={styles.bigButton}>
                                            <View style={styles.buttonInnerShine} />
                                        </View>
                                    </Animated.View>
                                </GestureDetector>

                                {/* Reset/Small Button */}
                                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                    <RotateCcw size={16} color="#000" strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>

                            {/* Finger Strap Visual */}
                            <View style={styles.strap} />
                        </View>

                        <Text style={styles.instructions}>
                            {t('dhikr.reset_instruction')}
                        </Text>

                    </View>
                </LinearGradient>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
    },
    zikirmatikContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    zikirmatikBody: {
        width: 180,
        height: 280,
        backgroundColor: '#1A1A1A',
        borderRadius: 90,
        borderWidth: 2,
        borderColor: '#333',
        alignItems: 'center',
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 15,
        overflow: 'hidden',
        zIndex: 2,
    },
    screenFrame: {
        width: 130,
        height: 70,
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 4,
        marginBottom: 30,
        borderWidth: 2,
        borderColor: '#444',
    },
    lcdScreen: {
        flex: 1,
        backgroundColor: '#1E2621',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    digitalCount: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 32,
        color: '#00FF41',
        fontWeight: '700',
        letterSpacing: 1,
    },
    targetLabel: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '900',
        fontSize: 8,
        color: 'rgba(0, 255, 65, 0.3)',
        position: 'absolute',
        top: 4,
        letterSpacing: 0.5,
    },
    buttonContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D6D6D6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    bigButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.matteGreen,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#222',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonInnerShine: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.05)',
        transform: [{ translateY: -12 }, { translateX: -12 }]
    },
    resetButton: {
        position: 'absolute',
        bottom: 30,
        right: 40,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    strap: {
        position: 'absolute',
        bottom: -40,
        width: 120,
        height: 100,
        borderRadius: 60,
        borderWidth: 15,
        borderColor: '#111',
        zIndex: 1,
        opacity: 0.5
    },
    instructions: {
        marginTop: 60,
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.8,
        textAlign: 'center'
    }
});

export default Zikirmatik;
