import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getReferralCode, linkUserToReferral } from '../services/ReferralService';
import { supabase } from '../services/supabase';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

const AuthScreen = () => {
    const { t } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP State
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isFirstLogin, setIsFirstLogin] = useState(false);

    useEffect(() => {
        checkFirstLogin();
    }, []);

    const checkFirstLogin = async () => {
        try {
            const value = await AsyncStorage.getItem('auth_has_entered');
            if (value === null) {
                setIsFirstLogin(true);
                await AsyncStorage.setItem('auth_has_entered', 'true');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !fullName)) {
            Alert.alert(t('error'), t('auth.fill_all_fields'));
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                // Sign up - Supabase will send OTP email
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        // This tells Supabase to send OTP instead of magic link
                        emailRedirectTo: undefined,
                    },
                });
                if (error) throw error;

                // Show OTP input screen
                setShowOtpInput(true);
                Alert.alert(
                    t('auth.verification_sent'),
                    t('auth.code_sent')
                );
            }
        } catch (error) {
            Alert.alert(t('error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 6) {
            Alert.alert(t('error'), t('auth.verify_label'));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'signup',
            });

            if (error) throw error;

            // --- REFERRAL LINKING ---
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const pendingCode = await getReferralCode();
                if (pendingCode) {
                    await linkUserToReferral(user.id, pendingCode);
                }
            }
            // ------------------------

            Alert.alert(t('auth.success_title'), t('auth.success_msg'));
            // Auth state will automatically update via onAuthStateChange in App.js
        } catch (error) {
            Alert.alert(t('error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
            });
            if (error) throw error;
            Alert.alert(t('auth.resend_success_title'), t('auth.resend_success_msg'));
        } catch (error) {
            Alert.alert(t('error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showOtpInput) {
        return (
            <RamadanBackground>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setShowOtpInput(false)}
                        >
                            <ArrowLeft size={24} color={COLORS.primary} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <KeyRound size={60} color={COLORS.primary} />
                            <Text style={styles.title}>{t('auth.verify_title')}</Text>
                            <Text style={styles.subtitle}>
                                {t('auth.verify_subtitle')} {email}
                            </Text>
                        </View>

                        <View style={styles.glassCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t('auth.verify_label')}</Text>
                                <View style={styles.inputWrapper}>
                                    <KeyRound size={20} color={COLORS.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.otpInput]}
                                        placeholder="000000"
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholderTextColor="#A0A0A0"
                                        textAlign="center"
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleVerifyOtp}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>{t('auth.verify_btn')}</Text>
                                        <ArrowRight size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={handleResendOtp}
                                disabled={loading}
                            >
                                <Text style={styles.resendText}>
                                    {t('auth.resend_btn')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </RamadanBackground>
        );
    }

    // Main Auth Screen (Login / Register)
    return (
        <RamadanBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Image
                            source={ramadanModeEnabled ? require('../../assets/images/ramadan-icon.png') : require('../../assets/images/icon.png')}
                            style={[styles.logo, { borderRadius: 24 }]}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>
                            {isLogin ? t('auth.login') : t('auth.register')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isLogin
                                ? (isFirstLogin ? t('auth.welcome_subtitle') : t('auth.login_subtitle'))
                                : t('auth.register_subtitle')}
                        </Text>
                    </View>

                    <View style={styles.glassCard}>
                        {!isLogin && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t('dhikr.name')}</Text>
                                <View style={styles.inputWrapper}>
                                    <User size={20} color={COLORS.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('dhikr.name_placeholder')}
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholderTextColor="#A0A0A0"
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.email')}</Text>
                            <View style={styles.inputWrapper}>
                                <Mail size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholderTextColor="#A0A0A0"
                                    underlineColorAndroid="transparent"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.password')}</Text>
                            <View style={styles.inputWrapper}>
                                <Lock size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    placeholderTextColor="#A0A0A0"
                                    underlineColorAndroid="transparent"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>
                                        {isLogin ? t('auth.login') : t('auth.register')}
                                    </Text>
                                    <ArrowRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.switchText}>
                            {isLogin
                                ? t('auth.no_account')
                                : t('auth.have_account')}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        padding: 10,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        color: COLORS.primary,
        letterSpacing: -1,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    glassCard: {
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: Platform.OS === 'android' ? 0 : 5, // Elevation causes opaque background on some Android versions
        ...(isTablet && { width: Math.min(500, TABLET_MAX_WIDTH), alignSelf: 'center' }),
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent', // Perfectly blends with card background
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    inputIcon: {
        marginLeft: 15,
        opacity: 0.6,
    },
    input: {
        flex: 1,
        padding: 16,
        color: COLORS.textPrimary,
        fontSize: 16,
        backgroundColor: 'transparent', // Android fix - remove white background inside
        ...(Platform.OS === 'android' && {
            textAlignVertical: 'center', // Android fix
        }),
    },
    otpInput: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 10,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    switchButton: {
        marginTop: 40,
        alignItems: 'center',
    },
    switchText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '600',
    },
});

export default AuthScreen;
