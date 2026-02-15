import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeepProcessingModal from '../components/DeepProcessingModal';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { showRewardedAd } from '../utils/AdManager';
import { checkLimit, incrementUsage } from '../services/LimitService';
import { supabase } from '../services/supabase';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { useRevenueCat } from '../providers/RevenueCatProvider';
import { invokeEdgeFunction } from '../utils/apiClient';
import { COLORS } from '../utils/theme';

const DhikrOnboarding = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { nightModeEnabled } = useTheme();
    const { isPro } = useRevenueCat();
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [birthTime, setBirthTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [intention, setIntention] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset loading state when navigating away
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            // Delay slightly to prevent flash during transition
            setTimeout(() => setLoading(false), 300);
        });
        return unsubscribe;
    }, [navigation]);

    // Idempotency: Keep track of the current request hash to prevent duplicates
    const [requestHash, setRequestHash] = useState(null);

    useEffect(() => {
        loadUserProfile();
        // Generate initial request hash
        setRequestHash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

        // Preload Ad
        import('../utils/AdManager').then(module => module.loadRewardedAd());
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (route?.params?.clearIntention) {
                setIntention('');
                navigation.setParams({ clearIntention: false });
                // Also reset hash to be safe
                setRequestHash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
            }
        }, [route?.params?.clearIntention])
    );

    const loadUserProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const profile = await getUserProfile(user.id);
            if (profile) {
                if (profile.full_name) setName(profile.full_name);

                if (profile.birth_date) {
                    const [day, month, year] = profile.birth_date.split('/');
                    if (day && month && year) setBirthDate(new Date(year, month - 1, day));
                }

                if (profile.birth_time) {
                    const [hours, minutes] = profile.birth_time.split(':');
                    if (hours && minutes) {
                        const newTime = new Date();
                        newTime.setHours(parseInt(hours));
                        newTime.setMinutes(parseInt(minutes));
                        setBirthTime(newTime);
                    }
                }
            }
        }
    };

    const getFormattedDate = (dateObj) => {
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getFormattedTime = (dateObj) => {
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || birthDate;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        setBirthDate(currentDate);
    };

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || birthTime;
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        setBirthTime(currentTime);
    };

    // Quick Dhikr States
    const [selectedDhikr, setSelectedDhikr] = useState(null);
    const [customDhikr, setCustomDhikr] = useState('');
    const [targetCount, setTargetCount] = useState('33');

    const commonDhikrs = [
        { id: 'subhanallah', name: 'سُبْحَانَ اللّٰهِ', meaning: 'Subhanallah' },
        { id: 'alhamdulillah', name: 'اَلْحَمْدُ لِلّٰهِ', meaning: 'Alhamdulillah' },
        { id: 'allahuakbar', name: 'اللّٰهُ أَكْبَرُ', meaning: 'Allahu Akbar' },
        { id: 'lailaha', name: 'لَا إِلٰهَ إِلَّا اللّٰهُ', meaning: 'La ilahe illallah' },
        { id: 'estagfirullah', name: '\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0627\u0647\u064e', meaning: t('dhikr.estagfirullah') },
        { id: 'custom', name: '✏️', meaning: t('dhikr.custom_label') },
    ];

    const executeGeneration = async () => {
        setLoading(true);
        const formattedDate = getFormattedDate(birthDate);
        const formattedTime = getFormattedTime(birthTime);

        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert(t('error'), t('auth.required'));
                setLoading(false);
                return;
            }


            // 2. Generate Plan with Supabase Edge Function
            const response = await invokeEdgeFunction('generate-dhikr', {
                body: {
                    user_id: user.id,
                    name,
                    birth_date: formattedDate,
                    birth_time: formattedTime,
                    intention: intention || t('dhikr.general_intention'),
                    language: (i18n.language || 'tr').split('-')[0],
                    request_hash: requestHash
                }
            });

            // Handle response errors
            if (!response || response.error) {
                throw new Error(response?.error || t('dhikr.error_generating'));
            }

            // Handle response
            const prescription = response?.prescription || response;

            if (!prescription || !prescription.dhikr_list) {
                throw new Error(response?.error || t('dhikr.error_generating'));
            }

            // Include session_id in the plan object for feedback functionality
            const plan = {
                ...prescription,
                session_id: response?.session_id
            };

            // 3. Update user profile
            if (user) {
                try {
                    await updateUserProfile(user.id, {
                        full_name: name,
                        birth_date: formattedDate,
                        birth_time: formattedTime,
                    });
                    setRequestHash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
                } catch (saveError) {
                    console.warn("Profile update failed:", saveError);
                }
            }

            // 4. Increment Usage & Navigate
            await incrementUsage('dhikr');
            navigation.navigate('DhikrCounter', { plan: plan });

        } catch (error) {
            console.error(error);
            setLoading(false); // Stop loading on error so user can retry
            Alert.alert(t('error'), error.message || t('dhikr.error_generating'));
        }
    };

    const handleGenerate = async () => {
        if (!name) {
            Alert.alert(t('missing_info'), t('dhikr.missing_fields'));
            return;
        }

        // Check Premium Status
        const isPremium = isPro;

        if (!isPremium) {
            // FORCE AD FOR AI GENERATION
            // User must watch ad to proceed
            Alert.alert(
                t('common.watch_ad_title'),
                t('common.watch_ad_message'),
                [
                    { text: t('cancel'), style: "cancel" },
                    {
                        text: t('common.watch_ad'),
                        onPress: async () => {
                            const watched = await showRewardedAd();
                            if (watched) {
                                executeGeneration();
                            }
                        }
                    },
                    { text: t('dream.go_premium'), onPress: () => navigation.navigate('Premium') }
                ]
            );
            return;
        }

        executeGeneration();
    };

    // ... (Quick Dhikr Handler removed/kept as is) ...

    return (
        <RamadanBackground forceNormalMode={true} customStandardGradient={['#0a1f1a', '#1a332a']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}>

                    <View style={{ marginBottom: 30, alignItems: 'center' }}>
                        <Text style={[styles.title, { color: '#FFF' }]}>{t('dhikr.title')}</Text>
                        <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>{t('dhikr.create_custom_subtitle')}</Text>
                    </View>

                    <View style={[styles.glassCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: 'rgba(255,255,255,0.6)' }]}>{t('dhikr.name')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: 'rgba(0,0,0,0.2)', color: '#FFF', borderColor: 'rgba(255,255,255,0.1)' }]}
                                placeholder={t('dhikr.name_placeholder')}
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="rgba(255,255,255,0.4)"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: 'rgba(255,255,255,0.6)' }]}>{t('dhikr.birth_date')}</Text>
                                {Platform.OS === 'android' ? (
                                    <TouchableOpacity
                                        style={[styles.pickerButton, { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }]}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[styles.pickerButtonText, { color: '#FFF' }]}>{getFormattedDate(birthDate)}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={[styles.iosPickerWrapper, { backgroundColor: 'transparent', borderRadius: 16 }]}>
                                        <DateTimePicker
                                            value={birthDate}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeDate}
                                            locale={i18n.language}
                                            themeVariant="dark"
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={[styles.inputGroup, { width: 140 }]}>
                                <Text style={[styles.label, { color: 'rgba(255,255,255,0.6)' }]}>{t('dhikr.birth_time')}</Text>
                                {Platform.OS === 'android' ? (
                                    <TouchableOpacity
                                        style={[styles.pickerButton, { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }]}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={[styles.pickerButtonText, { color: '#FFF' }]}>{getFormattedTime(birthTime)}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={[styles.iosPickerWrapper, { backgroundColor: 'transparent', borderRadius: 16 }]}>
                                        <DateTimePicker
                                            value={birthTime}
                                            mode="time"
                                            is24Hour={true}
                                            display="default"
                                            onChange={onChangeTime}
                                            locale={i18n.language}
                                            themeVariant="dark"
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        {Platform.OS === 'android' && showDatePicker && (
                            <DateTimePicker
                                value={birthDate}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                            />
                        )}
                        {Platform.OS === 'android' && showTimePicker && (
                            <DateTimePicker
                                value={birthTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onChangeTime}
                            />
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: 'rgba(255,255,255,0.6)' }]}>{t('dhikr.intention')}</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { height: 130, textAlignVertical: 'top', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16, lineHeight: 22 },
                                    { backgroundColor: 'rgba(0,0,0,0.2)', color: '#FFF', borderColor: 'rgba(255,255,255,0.1)' }
                                ]}
                                placeholder={t('dhikr.intention_placeholder')}
                                value={intention}
                                onChangeText={setIntention}
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                multiline
                                numberOfLines={6}
                                underlineColorAndroid="transparent"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleGenerate}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[COLORS.accentLight, '#ffffff']}
                                style={styles.submitGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.matteGreen} />
                                ) : (
                                    <Text style={styles.submitButtonText}>{t('dhikr.create_custom')}</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('auth.or')}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Zikirmatik Entry (Moved to Bottom) */}
                    <View style={styles.entryButtonContainer}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Zikirmatik')}
                            style={styles.fingerRingButton}
                        >
                            {/* Finger Strap */}
                            <View style={styles.ringStrap} />

                            {/* Main Body */}
                            <LinearGradient
                                colors={['#333', '#111']}
                                style={[styles.ringBody, { borderColor: 'rgba(255,255,255,0.2)' }]}
                            >
                                {/* Screen Area */}
                                <View style={styles.ringScreen}>
                                    <View style={styles.lcdContent}>
                                        <Text style={[styles.lcdTitle, { color: '#000' }]}>{t('dhikr.title').toLocaleUpperCase(i18n.language)}</Text>
                                        <Text style={[styles.lcdZeros, { color: '#000' }]}>00000</Text>
                                    </View>
                                </View>

                                {/* Big Button */}
                                <View style={styles.ringBtnOuter}>
                                    <LinearGradient
                                        colors={['#2e7d32', '#1b5e20']}
                                        style={styles.ringBtnInner}
                                    />
                                </View>

                                {/* Reset Button (Small dot) */}
                                <View style={styles.ringResetBtn} />
                            </LinearGradient>

                            {/* Label below */}
                            <View style={styles.ringLabelContainer}>
                                <Text style={[styles.ringLabelTitle, { color: '#FFF' }]}>{t('dhikr.zikirmatik')}</Text>
                                <Text style={[styles.ringLabelSubtitle, { color: 'rgba(255,255,255,0.6)' }]}>{t('dhikr.zikirmatik_subtitle')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>



                </ScrollView>
            </KeyboardAvoidingView>
            <DeepProcessingModal visible={loading} type="dhikr" userName={name} />
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 24,
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '300',
        color: COLORS.primary,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: '400',
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        shadowColor: COLORS.accentLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitGradient: {
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    submitButtonText: {
        color: COLORS.matteGreen,
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    buttonText: {
        color: '#FFFFFF', // High contrast on Primary Green
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    },
    // Finger Ring Entry Button Styles
    entryButtonContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 0,
    },
    fingerRingButton: {
        alignItems: 'center',
        justifyContent: 'center',
        // Increased touch area
        padding: 10,
    },
    ringBody: {
        width: 140,
        height: 180,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#333',
        alignItems: 'center',
        paddingTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 2,
    },
    ringStrap: {
        position: 'absolute',
        top: 40,
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 12,
        borderColor: '#222',
        zIndex: 1,
        backgroundColor: 'transparent',
    },
    ringScreen: {
        width: 100,
        height: 50,
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    lcdContent: {
        flex: 1,
        backgroundColor: '#b0bec5',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lcdTitle: {
        fontSize: 6,
        color: '#444',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    lcdZeros: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 18,
        color: '#263238',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    ringBtnOuter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
    ringBtnInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    ringResetBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#555',
    },
    ringLabelContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    ringLabelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    ringLabelSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },


    pickerButton: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },
    pickerButtonText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    iosPickerWrapper: {
        backgroundColor: 'transparent', // Transparent background
        // Removed border and radius for cleaner look
        padding: 4,
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 56,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
        gap: 15,
    },
    dividerLine: {
        height: 1,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});

export default DhikrOnboarding;
