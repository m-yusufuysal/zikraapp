import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const DHIKR_STEPS = (t, name) => [
    { text: t('deep_processing.dhikr_step_1') },
    { text: t('deep_processing.dhikr_step_2') },
    { text: t('deep_processing.dhikr_step_3', { name: name || '' }) },
    { text: t('deep_processing.dhikr_step_4') },
    { text: t('deep_processing.dhikr_step_5') },
    { text: t('deep_processing.dhikr_step_6') },
    { text: t('deep_processing.dhikr_step_7') },
];

const DREAM_STEPS = (t, name) => [
    { text: t('deep_processing.dream_step_1') },
    { text: t('deep_processing.dream_step_2') },
    { text: t('deep_processing.dream_step_3', { name: name || '' }) },
    { text: t('deep_processing.dream_step_4') },
    { text: t('deep_processing.dream_step_5') },
    { text: t('deep_processing.dream_step_6') },
];

const DeepProcessingModal = ({ visible, type = 'dhikr', userName }) => {
    const { t } = useTranslation();
    const displayName = userName || t('common.someone');
    const { ramadanModeEnabled } = useTheme();
    const [stepIndex, setStepIndex] = useState(0);
    const animation = useRef(null);


    const steps = type === 'dhikr' ? DHIKR_STEPS(t, displayName) : DREAM_STEPS(t, displayName);

    useEffect(() => {
        if (visible) {
            if (animation.current) animation.current.play();



            // Step Cycling
            const interval = setInterval(() => {
                setStepIndex((prev) => (prev + 1) % steps.length);
            }, 3000); // Slightly slower for readability

            return () => clearInterval(interval);
        } else {
            setStepIndex(0);
            if (animation.current) animation.current.reset();
        }
    }, [visible]);



    // Theme Configuration
    const isDreamType = type === 'dream';
    let theme;

    if (ramadanModeEnabled || isDreamType) {
        theme = {
            blurIntensity: 20,
            blurTint: "systemMaterialDark",
            bg: 'rgba(0,0,0,0.8)',
            text: '#FFFFFF',
            barBg: 'rgba(255,215,0,0.1)',
            barFill: '#FFD700'
        };
    } else {
        theme = {
            blurIntensity: 30,
            blurTint: "systemMaterialLight",
            bg: 'rgba(255,255,255,0.6)',
            text: COLORS.matteBlack,
            barBg: 'rgba(46, 89, 74, 0.1)',
            barFill: COLORS.matteGreen
        };
    }

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {/* Reduced Blur to see background */}
            <BlurView
                intensity={theme.blurIntensity}
                tint={theme.blurTint}
                style={styles.absolute}
            />

            <View style={[styles.overlayBg, { backgroundColor: theme.bg }]} />



            {/* Central Animation Container - Enlarged */}
            <View style={styles.centerContent}>

                {/* 1. Large Lottie Animation */}
                <LottieView
                    ref={animation}
                    source={require('../assets/animations/spiritual-loader.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                    resizeMode="cover"
                />

                {/* 2. Content Overlay */}
                <View style={styles.overlayContainer}>
                    <Animated.View
                        key={stepIndex}
                        entering={FadeIn.duration(800)}
                        exiting={FadeOut.duration(500)}
                        style={styles.textContainer}
                    >
                        <Text style={[styles.loadingText, { color: theme.text }]}>
                            {steps[stepIndex].text}
                        </Text>
                    </Animated.View>

                    <View style={[styles.progressBar, { backgroundColor: theme.barBg }]}>
                        <View style={[styles.progressFill, {
                            width: `${((stepIndex + 1) / steps.length) * 100}%`,
                            backgroundColor: theme.barFill
                        }]} />
                    </View>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    absolute: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    overlayBg: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    // Scanning styles removed
    centerContent: {
        width: width * 1.5, // DOUBLED SIZE: Giant breathing circle
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 3,
    },
    lottie: {
        width: '120%', // Fill the giant container
        height: '120%',
        position: 'absolute',
        opacity: 0.9,
    },
    overlayContainer: {
        width: width * 0.85, // Constrain to safe width of device screen
        maxWidth: 400,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    textContainer: {
        minHeight: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    loadingText: {
        fontSize: 18, // Larger text
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 26,
        fontFamily: 'System',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    progressBar: {
        width: 80,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    }
});

export default DeepProcessingModal;
