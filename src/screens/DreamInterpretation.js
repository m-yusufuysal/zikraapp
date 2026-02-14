import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlertCircle, BookOpen, Calendar, Clock, MapPin, Moon, Share2, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';
import DeepProcessingModal from '../components/DeepProcessingModal';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { showRewarded } from '../services/adService';
import { checkLimit, incrementUsage } from '../services/LimitService';
import { supabase } from '../services/supabase';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

const DustStar = ({ size = 1.5, top, left, duration }) => {
    const opacity = useSharedValue(0.1 + Math.random() * 0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: duration || 1500 + Math.random() * 1000 }),
                withTiming(0.2, { duration: duration || 1500 + Math.random() * 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[animatedStyle, {
            position: 'absolute',
            top: top,
            left: left,
            width: size,
            height: size,
            backgroundColor: '#FFF',
            borderRadius: size / 2,
            shadowColor: '#FFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 1,
        }]} />
    );
};

const StardustButtonOverlay = memo(() => {
    const stars = useMemo(() => {
        return [...Array(15)].map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 0.5,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            duration: 1000 + Math.random() * 2000,
        }));
    }, []);

    return (
        <View style={StyleSheet.absoluteFill}>
            {stars.map((star) => (
                <DustStar
                    key={star.id}
                    size={star.size}
                    top={star.top}
                    left={star.left}
                    duration={star.duration}
                />
            ))}
        </View>
    );
});

const DreamInterpretation = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { ramadanModeEnabled } = useTheme();

    const [name, setName] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [dreamDescription, setDreamDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [interpretation, setInterpretation] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'good' or 'bad'

    // Date/Time States
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Idempotency: Keep track of the current request hash to prevent duplicates
    const [requestHash, setRequestHash] = useState(null);

    useEffect(() => {
        loadUserProfile();
        // Generate initial request hash
        setRequestHash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    }, []);

    const loadUserProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const profile = await getUserProfile(user.id);
            if (profile) {
                if (profile.full_name) setName(profile.full_name);

                if (profile.birth_date) {
                    const [day, month, year] = profile.birth_date.split('/');
                    if (day && month && year) setDate(new Date(year, month - 1, day));
                }

                if (profile.birth_time) {
                    const [hours, minutes] = profile.birth_time.split(':');
                    if (hours && minutes) {
                        const newTime = new Date();
                        newTime.setHours(parseInt(hours));
                        newTime.setMinutes(parseInt(minutes));
                        setTime(newTime);
                    }
                }

                if (profile.birth_place) setBirthPlace(profile.birth_place);
            }
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        setDate(currentDate);
    };

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        setTime(currentTime);
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

    const handleInterpret = async () => {
        if (!name || !dreamDescription) {
            Alert.alert(t('dream.error_title'), t('dream.error_missing'));
            return;
        }

        if (dreamDescription.length < 20) {
            Alert.alert(t('dream.error_title'), t('dream.error_short'));
            return;
        }

        // 1. Check Limits
        try {
            const limitCheck = await checkLimit('dream');
            if (!limitCheck.allowed) {
                Alert.alert(
                    t('dream.limit_title'),
                    t('premium.features.dream_limit', { count: limitCheck.limit }) + "\n" + t('dream.limit_message'),
                    [
                        { text: t('ok'), style: "cancel" },
                        { text: t('dream.go_premium'), onPress: () => navigation.navigate('Premium') }
                    ]
                );
                return;
            }
        } catch (limitError) {
            console.warn("Limit check failed, proceeding anyway:", limitError);
        }

        // 2. Show Ad (if not premium)
        try {
            const isPremium = await AsyncStorage.getItem('isPremium') === 'true';
            if (!isPremium) {
                const watched = await showRewarded();
                if (!watched) {
                    // User cancelled or ad failed
                    return;
                }
            }
        } catch (adError) {
            console.warn("Ad service error:", adError);
        }

        setLoading(true);
        setInterpretation(null);

        // Security Timeout: Reset loading after 45 seconds no matter what
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                Alert.alert(t('error'), t('quran.generic_error') + " (Timeout)");
            }
        }, 45000);

        try {
            // 3. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User session not found");

            const formattedDate = getFormattedDate(date);
            const formattedTime = getFormattedTime(time);

            // 4. Interpret Dream with Supabase Edge Function
            const { data: result, error: functionError } = await supabase.functions.invoke('interpret-dream', {
                body: {
                    user_id: user.id,
                    name,
                    dream_text: dreamDescription,
                    birth_date: formattedDate,
                    birth_time: formattedTime,
                    birth_place: birthPlace || t('location_unknown'),
                    language: (i18n.language || 'tr').split('-')[0],
                    request_hash: requestHash
                }
            });

            clearTimeout(loadingTimeout);

            if (functionError) {
                console.error("Function Error:", functionError);
                throw new Error(functionError.message || "Cloud function failed");
            }

            if (!result || result.error) {
                throw new Error(result?.error || "Invalid response from server");
            }

            // 5. Update Profile & Increment Usage
            try {
                await updateUserProfile(user.id, {
                    full_name: name,
                    birth_date: formattedDate,
                    birth_time: formattedTime,
                    birth_place: birthPlace
                });
                setRequestHash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
            } catch (saveError) {
                console.warn("Profile update failed:", saveError);
            }

            // Increment usage
            await incrementUsage('dream');

            setInterpretation(result);
        } catch (error) {
            clearTimeout(loadingTimeout);
            console.error("DREAM INTERPRET ERROR:", error);
            Alert.alert(t('error'), error.message || t('quran.generic_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFeedback = async (rating) => {
        if (!interpretation?.interpretation_id) return;

        try {
            setFeedback(rating);
            await supabase
                .from('dream_interpretations')
                .update({ feedback: rating })
                .eq('id', interpretation.interpretation_id);

            Alert.alert(t('thanks'), t('feedback_saved'));
        } catch (error) {
            // Feedback error - ignore
        }
    };

    const resetForm = () => {
        setInterpretation(null);
        setDreamDescription('');
    };

    // Viral Share Feature
    const handleShare = async () => {
        if (!interpretation) return;

        const shareMessage = `✨ ${t('dream.share_title')} - Zikra App

🌙 ${t('dream.advice')}:
"${interpretation.spiritual_advice?.substring(0, 150)}..."

✨ ${t('dream.recommended_action')}:
${interpretation.recommended_action}

📲 ${t('dream.share_app_link')}:
https://zikraapp.com/download

#ZikraApp #Zikra #Spiritual`;

        try {
            await Share.share({
                message: shareMessage,
                title: 'Zikra - Dream Interpretation'
            });
        } catch (error) {
            // Share error - ignore
        }
    };
    // City Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleCitySearch = async (text) => {
        setBirthPlace(text);
        if (text.length > 2) {
            try {
                const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${text}&count=5&language=en&format=json`);
                const data = await response.json();
                if (data.results) {
                    setSuggestions(data.results);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                // City search error - ignore
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectCity = (city) => {
        const fullLocation = city.country ? `${city.name}, ${city.country}` : city.name;
        setBirthPlace(fullLocation);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <RamadanBackground forceRamadanAppearance={true} customStandardGradient={['#0f0c29', '#302b63', '#24243e']}>
            <DeepProcessingModal visible={loading} type="dream" userName={name} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        { paddingTop: insets.top + 20, paddingBottom: 120 },
                        isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Moon size={28} color={'#FFD700'} fill={'#FFD700'} />
                        </View>
                        <Text style={[styles.title, { color: '#FFF' }]}>{t('dream.title')}</Text>
                        <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>{t('dream.subtitle')}</Text>
                    </View>

                    {!interpretation ? (
                        <>
                            {/* Personal Info Card */}
                            <View style={[styles.glassCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: '#FFF' }]}>{t('dream.personal_info')}</Text>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={styles.inputContainerFull}>
                                        <Text style={styles.label}>{t('dream.name')}</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('dream.name_placeholder')}
                                            value={name}
                                            onChangeText={setName}
                                            placeholderTextColor="rgba(255,255,255,0.4)"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={styles.inputContainerHalf}>
                                        <Text style={styles.label}>{t('dream.birth_date')}</Text>
                                        {Platform.OS === 'android' ? (
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => setShowDatePicker(true)}
                                            >
                                                <Calendar size={18} color="#FFD700" />
                                                <Text style={styles.pickerButtonText}>{getFormattedDate(date)}</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={styles.iosPickerWrapper}>
                                                <DateTimePicker
                                                    testID="dateTimePicker"
                                                    value={date}
                                                    mode="date"
                                                    is24Hour={true}
                                                    display="default"
                                                    onChange={onChangeDate}
                                                    locale={i18n.language}
                                                    themeVariant="dark"
                                                    style={{ width: 120 }}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.inputContainerHalf}>
                                        <Text style={styles.label}>{t('dream.birth_time')}</Text>
                                        {Platform.OS === 'android' ? (
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => setShowTimePicker(true)}
                                            >
                                                <Clock size={18} color="#FFD700" />
                                                <Text style={styles.pickerButtonText}>{getFormattedTime(time)}</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={styles.iosPickerWrapper}>
                                                <DateTimePicker
                                                    testID="timePicker"
                                                    value={time}
                                                    mode="time"
                                                    is24Hour={true}
                                                    display="default"
                                                    onChange={onChangeTime}
                                                    locale={i18n.language}
                                                    themeVariant="dark"
                                                    style={{ width: 100 }}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={[styles.formRow, { zIndex: 10 }]}>
                                    {/* Added zIndex for suggestions overlay */}
                                    <View style={styles.inputContainerFull}>
                                        <Text style={styles.label}>{t('dream.birth_place')}</Text>
                                        <View style={styles.iconInputWrapper}>
                                            <MapPin size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { paddingLeft: 40 }]}
                                                placeholder={t('dream.birth_place_placeholder')}
                                                value={birthPlace}
                                                onChangeText={handleCitySearch}
                                                placeholderTextColor="rgba(255,255,255,0.4)"
                                            />
                                            {showSuggestions && suggestions.length > 0 && (
                                                <View style={styles.suggestionsContainer}>
                                                    {suggestions.map((item, index) => (
                                                        <TouchableOpacity
                                                            key={item.id || index}
                                                            style={styles.suggestionItem}
                                                            onPress={() => selectCity(item)}
                                                        >
                                                            <Text style={styles.suggestionText}>
                                                                {item.name}, {item.country}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Dream Description Card */}
                            <View style={[styles.glassCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: '#FFF' }]}>{t('dream.your_dream')}</Text>
                                </View>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder={t('dream.dream_placeholder')}
                                    value={dreamDescription}
                                    onChangeText={setDreamDescription}
                                    multiline
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, shadowColor: '#FFF', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }]}
                                onPress={handleInterpret}
                                disabled={loading}
                            >
                                <View style={{ padding: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <StardustButtonOverlay />
                                    <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>{t('dream.interpret')}</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* Interpretation Results */
                        <View style={styles.resultsContainer}>


                            {/* Symbols Card */}
                            {interpretation.symbols && interpretation.symbols.length > 0 && (
                                <View style={styles.resultCard}>
                                    <View style={styles.resultHeader}>
                                        <BookOpen size={20} color={COLORS.accentLight} />
                                        <Text style={styles.resultCardTitle}>{t('dream.symbols')}</Text>
                                    </View>
                                    {interpretation.symbols.map((item, index) => (
                                        <View key={index} style={styles.symbolItem}>
                                            <Text style={styles.symbolName}>{item.symbol}:</Text>
                                            <Text style={styles.symbolMeaning}>{item.meaning}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Personal Interpretation */}
                            <View style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Text style={[styles.resultCardTitle, { color: '#FFFFFF' }]}>{t('dream.personal')}</Text>
                                </View>
                                <Text style={styles.resultText}>{interpretation.personal_interpretation}</Text>
                            </View>

                            {/* Spiritual Advice */}
                            <View style={[styles.resultCard, styles.greenBorder]}>
                                <Text style={[styles.resultCardTitle, { color: COLORS.accentLight, marginBottom: 10 }]}>{t('dream.advice')}</Text>
                                <Text style={styles.adviceText}>"{interpretation.spiritual_advice}"</Text>
                            </View>

                            {/* Warning */}
                            {interpretation.warning && (
                                <View style={[styles.resultCard, styles.redBorder]}>
                                    <View style={styles.resultHeader}>
                                        <AlertCircle size={20} color={COLORS.error} />
                                        <Text style={[styles.resultCardTitle, { color: COLORS.error }]}>{t('dream.warning')}</Text>
                                    </View>
                                    <Text style={styles.resultText}>{interpretation.warning}</Text>
                                </View>
                            )}

                            {/* Recommended Action */}
                            {interpretation.recommended_action && (
                                <View style={[styles.resultCard, styles.actionBorder]}>
                                    <View style={styles.resultHeader}>
                                        <Text style={[styles.resultCardTitle, { color: '#FFFFFF' }]}>{t('dream.recommended_action')}</Text>
                                    </View>
                                    <Text style={styles.actionText}>{interpretation.recommended_action}</Text>
                                </View>
                            )}

                            {/* AI Disclaimer */}
                            <View style={styles.disclaimerContainer}>
                                <AlertCircle size={14} color="rgba(255,255,255,0.4)" />
                                <Text style={styles.disclaimerText}>{t('common.ai_disclaimer')}</Text>
                            </View>

                            {/* Feedback Section */}

                            {/* Feedback Section - Minimal */}
                            <View style={styles.feedbackContainer}>
                                <View style={styles.feedbackButtons}>
                                    <TouchableOpacity
                                        style={[styles.feedbackBtn, feedback === 'good' && styles.feedbackBtnActive]}
                                        onPress={() => handleFeedback('good')}
                                    >
                                        <ThumbsUp size={20} color={feedback === 'good' ? COLORS.matteGreen : 'rgba(255,255,255,0.6)'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.feedbackBtn, feedback === 'bad' && styles.feedbackBtnActive]}
                                        onPress={() => handleFeedback('bad')}
                                    >
                                        <ThumbsDown size={20} color={feedback === 'bad' ? '#FF453A' : 'rgba(255,255,255,0.6)'} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Share & New Dream Buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                                    <Share2 size={20} color="#FFF" />
                                    <Text style={styles.shareButtonText}>{t('dream.share_button')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
                                    <Text style={styles.resetButtonText}>{t('dream.new_dream')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                    }

                    {/* Spacer */}
                    <View style={{ height: 40 }} />

                    {/* Ad Banner */}
                    <View style={{ marginTop: 20, marginBottom: 40, alignItems: 'center' }}>
                        <AdBanner />
                    </View>

                    {/* Android Pickers (Visible only when needed) */}
                    {
                        Platform.OS === 'android' && showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                            />
                        )
                    }
                    {
                        Platform.OS === 'android' && showTimePicker && (
                            <DateTimePicker
                                testID="timePicker"
                                value={time}
                                mode="time"
                                is24Hour={true}
                                notification="default"
                                onChange={onChangeTime}
                            />
                        )
                    }

                </ScrollView >
            </KeyboardAvoidingView>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        fontSize: 28,
        fontWeight: '300', // Thin, elegant font
        color: '#ffffff',
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 6,
        textAlign: 'center',
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1.5,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    inputContainerFull: {
        flex: 1,
    },
    inputContainerHalf: {
        width: '48%',
    },
    label: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    disclaimerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 16,
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 52,
    },
    iconInputWrapper: {
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 14,
        zIndex: 1,
    },
    textArea: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 150,
        textAlignVertical: 'top',
        lineHeight: 24,
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
        color: '#FFF',
        fontSize: 14,
    },
    iosPickerWrapper: {
        alignItems: 'flex-start',
    },
    submitButton: {
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: COLORS.matteGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: COLORS.matteBlack,
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    // Result Styles
    resultsContainer: {
        marginTop: 10,
    },
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    matteBorder: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(46, 89, 74, 0.1)', // Matte Green tint
    },
    greenBorder: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
    },
    redBorder: {
        borderColor: '#FF453A',
        backgroundColor: 'rgba(255, 69, 58, 0.05)',
    },
    actionBorder: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    actionText: {
        fontSize: 18,
        color: '#FFFFFF',
        lineHeight: 28,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Hoefler Text' : 'serif',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    resultIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    resultText: {
        fontSize: 16,
        color: '#F0F0F0',
        lineHeight: 26,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    adviceText: {
        fontSize: 18,
        color: '#F0F0F0',
        lineHeight: 28,
        fontStyle: 'italic',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Hoefler Text' : 'serif',
    },

    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    shareButton: {
        flex: 1, // Equal width
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.05)', // Slight background for liquid feel
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 30, // Liquid/Curved
        gap: 10,
    },
    resetButton: {
        flex: 1, // Equal width
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.05)', // Slight background for liquid feel
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 30, // Liquid/Curved
    },
    shareButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    resetButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    // Feedback - Minimal
    feedbackContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    feedbackButtons: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    feedbackBtn: {
        padding: 8,
        borderRadius: 12,
    },
    feedbackBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.15)',
    },

    symbolItem: {
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 12,
        borderRadius: 12,
    },
    symbolName: {
        color: COLORS.accentLight,
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    symbolMeaning: {
        color: '#F0F0F0',
        fontSize: 14,
        lineHeight: 20,
    },

    // Autocomplete Styles
    suggestionsContainer: {
        position: 'absolute',
        top: 54, // Below input
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    suggestionText: {
        color: '#EEE',
        fontSize: 14,
    },
});

export default DreamInterpretation;
