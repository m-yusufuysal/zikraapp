/**
 * Zikirmatik - Production-Grade Finger Dhikr Counter
 * 
 * Architecture: Reanimated Worklets (UI Thread)
 * - Counter state uses useSharedValue (no JS bridge crossing)
 * - Tap animation uses useAnimatedStyle (C++ speed)
 * - Haptic feedback is throttled (prevents UI freezing)
 */
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThrottledHaptic } from '../hooks/useThrottledHaptic';
import { COLORS, COMMON_STYLES } from '../utils/theme';

const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Zikirmatik = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // === WORKLET-BASED STATE (UI Thread) ===
    const count = useSharedValue(0);
    const scale = useSharedValue(1);

    // Display state (JS thread) - synced from worklet
    const [displayCount, setDisplayCount] = React.useState(0);

    // Throttled haptic for performance
    const triggerHaptic = useThrottledHaptic();

    // === TAP HANDLER (Runs on UI Thread) ===
    const handlePress = () => {
        'worklet';
        // Increment on UI thread (instant, no bridge)
        count.value = count.value + 1;

        // Instant mechanical response (30ms attack)
        scale.value = withSequence(
            withTiming(0.88, { duration: 30, easing: Easing.linear }),
            withTiming(1, { duration: 60, easing: Easing.linear })
        );

        // Sync to JS thread for display (non-blocking)
        runOnJS(setDisplayCount)(count.value);
        runOnJS(triggerHaptic)();
    };

    const handleReset = () => {
        count.value = 0;
        setDisplayCount(0);
        triggerHaptic();
    };

    // === ANIMATED STYLES (UI Thread) ===
    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
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

                            {/* Main Button - Animated with Worklets */}
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={handlePress}
                                style={styles.buttonContainer}
                            >
                                <Animated.View style={[styles.bigButton, animatedButtonStyle]}>
                                    <View style={styles.buttonInnerShine} />
                                </Animated.View>
                            </TouchableOpacity>

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
        color: COLORS.textSecondary,
        fontSize: 12,
        opacity: 0.6
    }
});

export default Zikirmatik;
