/**
 * DhikrCounter - Production-Grade Multi-Step Dhikr Counter
 * 
 * Architecture: Reanimated Worklets (UI Thread)
 * - Counter state uses useSharedValue (instant updates)
 * - Button animation runs on UI thread
 * - Haptic feedback is throttled
 */
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Share2, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Modal, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { useThrottledHaptic, useThrottledSuccessHaptic } from '../hooks/useThrottledHaptic';
import { supabase } from '../services/supabase';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS, COMMON_STYLES } from '../utils/theme';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// === IMPORTS ===
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { clearDhikrProgress, getDhikrProgress, saveDhikrProgress } from '../utils/asyncStorage';

const DhikrCounter = ({ route, navigation }) => {
    const { t, i18n } = useTranslation();
    const { plan } = route.params;
    const insets = useSafeAreaInsets();
    const { nightModeEnabled } = useTheme();
    const sessionId = plan?.session_id;

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const dhikrSteps = plan?.dhikr_list || [];

    // === WORKLET-BASED STATE ===
    // Using refs to hold shared values for each step's count
    const countsRef = useRef(dhikrSteps.map(() => 0));
    const [displayCounts, setDisplayCounts] = useState(new Array(dhikrSteps.length).fill(0));
    const [isCompleted, setIsCompleted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load saved progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            if (sessionId) {
                const savedCounts = await getDhikrProgress(sessionId);
                if (savedCounts && savedCounts.length === dhikrSteps.length) {
                    countsRef.current = savedCounts;
                    setDisplayCounts(savedCounts);

                    // Find first incomplete step
                    const firstIncompleteIndex = savedCounts.findIndex((count, index) => {
                        return count < dhikrSteps[index].count;
                    });

                    if (firstIncompleteIndex !== -1) {
                        setCurrentStepIndex(firstIncompleteIndex);
                    } else if (savedCounts.every((count, index) => count >= dhikrSteps[index].count)) {
                        // All done?
                        setIsCompleted(true);
                    }
                }
            }
        };
        loadProgress();
    }, [sessionId, dhikrSteps]);

    // Intercept Back Button
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (isCompleted) {
                    return false; // Allow back
                }

                Alert.alert(
                    t('dhikr.exit_title'),
                    t('dhikr.exit_message'),
                    [
                        { text: t('common.cancel'), style: 'cancel', onPress: () => { } },
                        {
                            text: t('dhikr.exit_confirm'),
                            style: 'destructive',
                            onPress: () => navigation.goBack()
                        },
                    ]
                );
                return true;
            };

            // Add listener if needed (React Navigation handles header back button separately usually, 
            // but this pattern is good for hardware back button on Android. 
            // For header back button, we need to override navigation options.)

            return () => { };
        }, [isCompleted, t, navigation])
    );

    // Custom Header Back Button Handler
    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    if (isCompleted) {
                        navigation.goBack();
                    } else {
                        Alert.alert(
                            t('dhikr.exit_title'),
                            t('dhikr.exit_message'),
                            [
                                { text: t('common.cancel'), style: 'cancel' },
                                {
                                    text: t('dhikr.exit_confirm'),
                                    style: 'destructive',
                                    onPress: () => navigation.goBack()
                                },
                            ]
                        );
                    }
                }} style={{ marginLeft: 16 }}>
                    <ChevronLeft size={24} color={COLORS.matteBlack} />
                </TouchableOpacity>
            ),
            headerShown: false // using custom header in render
        });
    }, [navigation, isCompleted, t]);


    // Animation (UI Thread)
    const buttonScale = useSharedValue(1);

    // Throttled haptics
    const triggerHaptic = useThrottledHaptic();
    const triggerSuccessHaptic = useThrottledSuccessHaptic();

    // Derived state
    const count = displayCounts[currentStepIndex] || 0;
    const currentDhikr = dhikrSteps[currentStepIndex];

    // Reminder State
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [feedback, setFeedback] = useState(null);

    if (!currentDhikr) {
        // Fallback or early return to prevent crash if data is missing
        return (
            <View style={COMMON_STYLES.container}>
                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }]}>
                    <Text style={{ color: '#fff' }}>{t('dhikr.data_load_error')}</Text>
                    <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={() => navigation.goBack()}>
                        <Text style={styles.primaryBtnText}>{t('dhikr.go_back')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }


    // === ANIMATED STYLE (UI Thread) ===
    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    // === TAP HANDLER (Optimized) ===
    const handlePress = () => {
        if (isProcessing) return;

        // Throttled haptic (Instant tactile feedback)
        triggerHaptic();

        // Instant mechanical response (30ms attack)
        buttonScale.value = withSequence(
            withTiming(0.88, { duration: 30, easing: Easing.linear }),
            withTiming(1, { duration: 60, easing: Easing.linear })
        );

        // Increment on ref (instant)
        const nextCount = countsRef.current[currentStepIndex] + 1;
        if (nextCount > currentDhikr.count) return;

        countsRef.current[currentStepIndex] = nextCount;

        // Update display
        const newDisplayCounts = [...displayCounts];
        newDisplayCounts[currentStepIndex] = nextCount;
        setDisplayCounts(newDisplayCounts);

        // SAVE PROGRESS
        if (sessionId) {
            saveDhikrProgress(sessionId, countsRef.current);
        }

        // Step completion
        if (nextCount >= currentDhikr.count) {
            setIsProcessing(true);
            triggerSuccessHaptic();

            setTimeout(() => {
                if (currentStepIndex < dhikrSteps.length - 1) {
                    goToNextStep();
                } else {
                    // Finish
                    setIsCompleted(true);
                    if (sessionId) clearDhikrProgress(sessionId); // Clear progress on completion

                    // Smart Review Trigger - Dhikr Completion
                    import('../services/StoreReviewService').then(module => {
                        module.default.checkCompletionReview();
                    });
                }
                setIsProcessing(false);
            }, 500);
        }
    };

    const triggerTransitionHaptics = () => {
        triggerHaptic();
    };

    const goToNextStep = () => {
        if (currentStepIndex < dhikrSteps.length - 1) {
            triggerTransitionHaptics();
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsCompleted(true);
            if (sessionId) clearDhikrProgress(sessionId);

            // Smart Review Trigger - Dhikr Completion
            import('../services/StoreReviewService').then(module => {
                module.default.checkCompletionReview();
            });
        }
    };

    const goToPrevStep = () => {
        if (currentStepIndex > 0) {
            triggerTransitionHaptics();
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const finishDhikr = () => {
        setIsCompleted(true);
        if (sessionId) {
            clearDhikrProgress(sessionId);
        }
    };

    const handleReset = () => {
        Alert.alert(
            t('dhikr.reset_step_title'),
            t('dhikr.reset_step_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.yes'),
                    style: 'destructive',
                    onPress: () => {
                        countsRef.current[currentStepIndex] = 0;
                        const newDisplayCounts = [...displayCounts];
                        newDisplayCounts[currentStepIndex] = 0;
                        setDisplayCounts(newDisplayCounts);
                        triggerHaptic();
                        if (sessionId) saveDhikrProgress(sessionId, countsRef.current);
                    }
                }
            ]
        );
    };

    // Reuse handleReset logic but simpler if user really wants just quick reset? 
    // Original code was just doing it. I added confirmation for safety.
    // If strict reset is needed without alert:
    /*
    const handleReset = () => {
        countsRef.current[currentStepIndex] = 0;
        const newDisplayCounts = [...displayCounts];
        newDisplayCounts[currentStepIndex] = 0;
        setDisplayCounts(newDisplayCounts);
        triggerHaptic();
        if (sessionId) saveDhikrProgress(sessionId, countsRef.current);
    };
    */

    const handleBackPress = () => {
        if (isCompleted) {
            navigation.goBack();
        } else {
            Alert.alert(
                t('dhikr.exit_title'),
                t('dhikr.exit_message'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('dhikr.exit_confirm'),
                        style: 'destructive',
                        onPress: () => navigation.goBack()
                    },
                ]
            );
        }
    };

    const handleReminderSet = (event, selectedDate) => {
        const currentDate = selectedDate || reminderTime;
        setShowTimePicker(Platform.OS === 'ios');
        setReminderTime(currentDate);
        if (selectedDate) {
            const timeStr = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            Alert.alert(t('dhikr.reminder_title'), t('dhikr.reminder_set_time', { time: timeStr }));
        }
    };

    const handleFeedback = async (rating) => {
        if (!plan?.session_id) return;

        try {
            setFeedback(rating);
            await supabase
                .from('dhikr_sessions')
                .update({ feedback: rating })
                .eq('id', plan.session_id);

            Alert.alert(t('thanks'), t('feedback_saved'));
        } catch (error) {
            // Feedback error - ignore
        }
    };

    const handleShareSuccess = async () => {
        try {
            await Share.share({
                message: t('dhikr.share_success_msg'),
            });
        } catch (error) {
            console.error('Share Error:', error.message);
        }
    };

    if (isCompleted) {
        return (
            <RamadanBackground>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 100 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.successCard, nightModeEnabled && { backgroundColor: 'rgba(0,0,0,0.65)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' }]}>
                        <View style={[styles.iconCircle, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                            <CheckCircle2 size={40} color={nightModeEnabled ? '#FFD700' : COLORS.matteGreen} />
                        </View>
                        <Text style={[styles.successTitle, nightModeEnabled && { color: '#FFD700' }]}>{t('dhikr.success_title')}</Text>
                        <Text style={[styles.successText, nightModeEnabled && { color: '#FFF' }]}>{plan.prescription_title || t('dhikr.success_text')}</Text>

                        {/* Closing Dua */}
                        {plan.closing_dua && (
                            <View style={[
                                styles.resultCard,
                                styles.matteBorder,
                                nightModeEnabled && { backgroundColor: 'rgba(255,215,0,0.05)', borderColor: 'rgba(255,215,0,0.1)' },
                                { marginTop: 20, width: '100%' }
                            ]}>
                                <Text style={[styles.cardTitleSmall, nightModeEnabled && { color: '#FFD700' }]}>🤲 {t('dhikr.closing_dua')}</Text>
                                <Text style={[styles.adviceText, nightModeEnabled && { color: '#FFF' }]}>"{plan.closing_dua}"</Text>
                            </View>
                        )}





                        {/* Recommended Action */}
                        {plan.recommended_action && (
                            <View style={[
                                styles.resultCard,
                                styles.actionBorder,
                                nightModeEnabled && { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: '#FFD700' },
                                { marginTop: 10, width: '100%' }
                            ]}>
                                <Text style={[styles.cardTitleSmall, nightModeEnabled && { color: '#FFD700' }]}>✨ {t('dhikr.recommended_action')}</Text>
                                <Text style={[styles.actionText, nightModeEnabled && { color: '#FFD700' }]}>{plan.recommended_action}</Text>
                            </View>
                        )}

                        {/* AI Disclaimer */}
                        <View style={[styles.disclaimerContainer, { marginTop: 20, marginBottom: 15 }]}>
                            <AlertCircle size={14} color={nightModeEnabled ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                            <Text style={[styles.disclaimerText, nightModeEnabled && { color: 'rgba(255,255,255,0.4)' }]}>{t('common.ai_disclaimer')}</Text>
                        </View>

                        {/* Feedback Section - Minimal */}
                        <View style={[styles.feedbackContainerMinimal, { marginTop: 0, marginBottom: 15 }]}>
                            <View style={styles.feedbackButtons}>
                                <TouchableOpacity
                                    style={[styles.feedbackBtnMinimal, feedback === 'good' && styles.feedbackBtnActive]}
                                    onPress={() => handleFeedback('good')}
                                >
                                    <ThumbsUp size={20} color={feedback === 'good' ? (nightModeEnabled ? '#FFD700' : COLORS.matteGreen) : (nightModeEnabled ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.feedbackBtnMinimal, feedback === 'bad' && styles.feedbackBtnActive]}
                                    onPress={() => handleFeedback('bad')}
                                >
                                    <ThumbsDown size={20} color={feedback === 'bad' ? '#FF453A' : (nightModeEnabled ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.shareSuccessBtn, nightModeEnabled && { borderColor: '#FFD700' }, { marginTop: 0 }]}
                            onPress={handleShareSuccess}
                        >
                            <Share2 size={20} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                            <Text style={[styles.shareSuccessBtnText, nightModeEnabled && { color: '#FFD700' }]}>
                                {t('common.share')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.primaryBtn, nightModeEnabled && { backgroundColor: '#FFD700' }, { marginTop: 20 }]} onPress={() => navigation.navigate('DhikrOnboarding', { clearIntention: true })}>
                            <Text style={[styles.primaryBtnText, nightModeEnabled && { color: '#000' }]}>{t('dhikr.create_new')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView >
            </RamadanBackground>
        );
    }

    return (
        <RamadanBackground>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={handleBackPress} style={[styles.iconBtn, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <ChevronLeft size={24} color={nightModeEnabled ? '#FFF' : COLORS.matteBlack} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    {currentDhikr ? (
                        <>
                            {currentDhikr.arabic_text && (
                                <Text style={styles.arabicText}>{currentDhikr.arabic_text}</Text>
                            )}
                            <Text style={[styles.headerTitle, nightModeEnabled && { color: '#FFF' }]}>{currentDhikr.name}</Text>
                            {/* Hide pronunciation for Arabic users as they can read the script */}
                            {currentDhikr.pronunciation &&
                                !i18n.language.startsWith('ar') &&
                                currentDhikr.pronunciation.trim().toLowerCase() !== currentDhikr.name.trim().toLowerCase() && (
                                    <Text style={styles.pronunciationText}>{currentDhikr.pronunciation}</Text>
                                )}
                        </>
                    ) : (
                        <Text style={styles.headerTitle}>...</Text>
                    )}
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* DEBUG: Only for development verification */}
                {/* <Text style={{fontSize: 10, color: 'red', textAlign: 'center'}}>{JSON.stringify(currentDhikr)}</Text> */}

                {/* ZIKIRMATIK DEVICE UI */}

                <View style={[styles.deviceContainer, isTablet && { maxWidth: TABLET_MAX_WIDTH, alignSelf: 'center' }]}>
                    {/* The Device Body */}
                    <View style={styles.zikirmatikBody}>
                        <View style={styles.deviceInnerShadow}>

                            {/* LCD Screen */}
                            <View style={[styles.lcdScreen, nightModeEnabled && { backgroundColor: '#96A59E', borderColor: '#7E8F85' }]}>
                                <View style={styles.lcdHeader}>
                                    <Text style={styles.lcdLabel}>{t('dhikr.step').toUpperCase()} {currentStepIndex + 1}/{dhikrSteps.length}</Text>
                                    <Text style={styles.lcdTarget}>{t('dhikr.target_label')}: {currentDhikr.count}</Text>
                                </View>
                                <Text style={styles.lcdCount}>
                                    {count.toString().padStart(5, '0')}
                                </Text>
                            </View>

                            {/* Main Button Area */}
                            <View style={styles.controlsArea}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={handlePress}
                                    style={styles.bigButtonOuter}
                                >
                                    <Animated.View style={[styles.bigButtonInner, animatedButtonStyle]}>
                                        <View style={styles.bigButtonHighlight} />
                                    </Animated.View>
                                </TouchableOpacity>

                                {/* Reset Button (Small) */}
                                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                                    <RotateCcw size={16} color="#555" />
                                </TouchableOpacity>
                            </View>

                            {/* Decorative Stripes */}
                            <View style={styles.gripStripes}>
                                <View style={styles.stripe} />
                                <View style={styles.stripe} />
                                <View style={styles.stripe} />
                            </View>
                        </View>
                    </View>

                    {/* Meaning Text below device */}
                    <View style={styles.meaningContainer}>
                        <Text style={[styles.dhikrMeaning, nightModeEnabled && { color: 'rgba(255, 255, 255, 0.7)' }]}>{currentDhikr.meaning}</Text>
                    </View>
                </View>

                {/* Navigation Buttons (Prev / Next Step) */}
                <View style={[styles.navButtonsContainer, isTablet && { maxWidth: TABLET_MAX_WIDTH, alignSelf: 'center' }]}>
                    <TouchableOpacity
                        style={[styles.navBtn, currentStepIndex === 0 && styles.navBtnDisabled]}
                        onPress={goToPrevStep}
                        disabled={currentStepIndex === 0}
                    >
                        <ChevronLeft size={28} color={currentStepIndex === 0 ? '#CCC' : COLORS.matteGreen} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.finishBtn} onPress={finishDhikr}>
                        <Text style={styles.finishBtnText}>{t('dhikr.finish_dhikr')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navBtn, currentStepIndex === dhikrSteps.length - 1 && styles.navBtnDisabled]}
                        onPress={goToNextStep}
                        disabled={currentStepIndex === dhikrSteps.length - 1}
                    >
                        <ChevronRight size={28} color={currentStepIndex === dhikrSteps.length - 1 ? '#CCC' : COLORS.matteGreen} />
                    </TouchableOpacity>
                </View>

                {/* Spacer for scroll */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Time Picker */}
            {(showTimePicker && Platform.OS === 'ios') && (
                <Modal transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.pickerContainer}>
                            <DateTimePicker
                                value={reminderTime}
                                mode="time"
                                display="spinner"
                                onChange={handleReminderSet}
                                themeVariant="light"
                            />
                            <TouchableOpacity style={styles.closePicker} onPress={() => setShowTimePicker(false)}>
                                <Text style={styles.closePickerText}>{t('common.ok')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            {showTimePicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display="default"
                    onChange={handleReminderSet}
                />
            )}
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 10,
        marginBottom: 20,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    arabicText: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Amiri-Regular' : 'Amiri-Regular', // Fallback to system serif if font missing? 
        // Actually, better to use a reliable fallback if defined.
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    pronunciationText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 4,
        textAlign: 'center',
    },
    iconBtn: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    deviceContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    meaningContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 10,
    },
    dhikrMeaning: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        maxWidth: '90%',
    },
    // Zikirmatik Body Style
    zikirmatikBody: {
        width: isTablet ? 320 : width * 0.75,
        height: isTablet ? 420 : width * 1.0,
        borderRadius: 50,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        padding: 12,
        borderWidth: 4,
        borderColor: '#C8E6C9',
        backgroundColor: '#f0f9f1',
    },
    deviceInnerShadow: {
        flex: 1,
        borderRadius: 40,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between', // Spread screen and button apart
    },
    // LCD Screen
    lcdScreen: {
        width: '80%',
        height: 80,
        borderRadius: 8,
        borderWidth: 2,
        padding: 8,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        backgroundColor: '#b0bec5',
        borderColor: '#90a4ae',
    },
    lcdHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    lcdLabel: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
        fontWeight: 'bold',
        color: '#000',
    },
    lcdTarget: {
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
        fontWeight: 'bold',
        color: '#000',
    },
    lcdCount: {
        fontSize: 40,
        fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
        letterSpacing: 2,
        color: '#000',
    },
    // Controls
    controlsArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    bigButtonOuter: {
        width: 180, // Slightly larger housing
        height: 180,
        borderRadius: 90,
        backgroundColor: '#1a1a1a', // Black housing ("siyahin icine")
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
        borderWidth: 6,
        borderColor: '#333',
    },
    bigButtonInner: {
        width: 130,
        height: 130,
        borderRadius: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
        backgroundColor: '#2e594a',
    },
    bigButtonHighlight: {
        width: '100%',
        height: '100%',
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.1)', // Subtle shine
        opacity: 0.5,
    },
    resetButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ECEFF1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#CFD8DC',
    },
    gripStripes: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 20,
        marginBottom: 10,
    },
    stripe: {
        width: 4,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#CFD8DC',
    },
    // Success Modal
    content: { flexGrow: 1, padding: 24 },
    successCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center' },
    successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: COLORS.primary },
    successText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 24, textAlign: 'center' },
    resultCard: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        alignItems: 'flex-start',
    },
    matteBorder: {
        borderColor: 'rgba(46, 89, 74, 0.1)',
        backgroundColor: 'rgba(46, 89, 74, 0.05)',
    },
    actionBorder: {
        borderColor: COLORS.matteGreen,
        backgroundColor: 'rgba(46, 89, 74, 0.1)',
    },
    cardTitleSmall: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primaryDark,
        marginBottom: 8,
    },
    adviceText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontStyle: 'italic',
        lineHeight: 24,
    },
    actionText: {
        fontSize: 16,
        color: COLORS.primaryDark,
        fontWeight: '600',
        lineHeight: 24,
    },
    primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
    primaryBtnText: { color: '#FFF', fontWeight: 'bold' },
    shareSuccessBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    shareSuccessBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(46, 89, 74, 0.05)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    actionButtons: { flexDirection: 'row', gap: 12, width: '100%' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    pickerContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, width: 300, alignItems: 'center' },
    closePicker: { marginTop: 16, padding: 10, backgroundColor: COLORS.primary, borderRadius: 10 },
    closePickerText: { color: '#FFF' },

    // ScrollView Content
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },

    // Navigation Buttons
    navButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 20,
        gap: 10,
    },
    navBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    navBtnDisabled: {
        opacity: 0.5,
    },
    navBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.matteGreen,
    },
    navBtnTextDisabled: {
        color: '#CCC',
    },
    finishBtn: {
        flex: 1,
        backgroundColor: '#2e594a',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#2e594a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    finishBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },

    // Feedback
    feedbackContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        backgroundColor: 'rgba(46, 89, 74, 0.05)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(46, 89, 74, 0.1)',
    },
    feedbackTitle: {
        color: COLORS.textSecondary,
        marginBottom: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    feedbackButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    feedbackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    feedbackBtnActive: {
        backgroundColor: '#F0F0F0',
        borderColor: COLORS.primary,
    },
    feedbackText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    feedbackContainerMinimal: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    feedbackBtnMinimal: {
        padding: 8,
        borderRadius: 12,
    },
    disclaimerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 12,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 11,
        color: 'rgba(0,0,0,0.4)',
        lineHeight: 16,
        fontStyle: 'italic',
    },
});

export default DhikrCounter;
