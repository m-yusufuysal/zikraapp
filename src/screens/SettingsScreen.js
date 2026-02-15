import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import {
    Bell,
    Camera,
    ChevronRight,
    Crown,
    Download,
    FileText,
    Globe,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    MapPin,
    Monitor,
    MoonStar,
    Shield,
    Star,
    Trash2,
    Wallet,
    X
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, I18nManager, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { moderateImage } from '../services/ModerationService';
import { supabase } from '../services/supabase';
import { getCurrentProfile } from '../services/userService';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { setLanguage as saveLanguage } from '../utils/storage';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const SettingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const isTr = i18n.language.startsWith('tr');
    const queryClient = useQueryClient();

    const [session, setSession] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [premiumTier, setPremiumTier] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const { nightModeEnabled, toggleNightMode } = useTheme();
    const [isExporting, setIsExporting] = useState(false);
    const [isInfluencer, setIsInfluencer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [uploading, setUploading] = useState(false);

    // 1. Session Management (Still Auth Listener)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. React Query for Profile (Caches data!)
    const { data: profile, refetch: refetchProfile } = useQuery({
        queryKey: ['profile', session?.user?.id],
        queryFn: getCurrentProfile,
        enabled: !!session?.user?.id,
        staleTime: 1000 * 60 * 60, // 1 hour (Profile rarely changes)
    });

    useFocusEffect(
        useCallback(() => {
            checkPremium();
            loadSettings();
            checkInfluencerStatus();
            checkAdminStatus();
        }, [])
    );

    const checkAdminStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check if user is in 'admins' table
                const { data, error } = await supabase
                    .from('admins')
                    .select('role')
                    .eq('email', user.email)
                    .single();

                if (data && !error) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            }
        } catch (error) {
            console.log("Admin check error:", error);
            setIsAdmin(false);
        }
    };

    const checkInfluencerStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('influencers')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                setIsInfluencer(!!data && !error);
            }
        } catch (error) {
            setIsInfluencer(false);
        }
    };

    const loadSettings = async () => {
        try {
            const notif = await AsyncStorage.getItem('notifications_enabled');
            const haptic = await AsyncStorage.getItem('haptic_enabled');
            setNotificationsEnabled(notif !== 'false'); // Default true
            setHapticEnabled(haptic !== 'false');       // Default true
        } catch (e) {
            console.error(e);
        }
    };

    const checkPremium = async () => {
        const premium = await AsyncStorage.getItem('isPremium');
        const tier = await AsyncStorage.getItem('premiumTier');
        setIsPremium(premium === 'true');
        setPremiumTier(tier);
    };

    const toggleSwitch = async (value, setter, key) => {
        if (key === 'night_mode_enabled') {
            toggleNightMode(value);
            return;
        }

        setter(value);
        await AsyncStorage.setItem(key, String(value));

        if (key === 'notifications_enabled') {
            if (!value) {
                // If turned off, cancel everything
                await Notifications.cancelAllScheduledNotificationsAsync();
            } else {
                // If turned on, we rely on the Home Screen or App re-start to re-schedule 
                // because we need location/prayer time data which isn't available here easily.
                // However, we can at least schedule the static ones (promotional).
                const { schedulePromotionalNotifications } = require('../utils/notifications');
                await schedulePromotionalNotifications(i18n.language);
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await TrackPlayer.reset(); // Stop Audio immediately
            await AsyncStorage.clear(); // Clear all local data on logout for safety
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Explicitly force state update or navigation if listener is slow
            // navigation.reset({ index: 0, routes: [{ name: 'Auth' }] }); // navigation might not be available here depending on stack
        } catch (error) {
            Alert.alert(t('error'), error.message);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('settings.delete_account'),
            t('settings.delete_account_confirm_msg'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('settings.delete_permanently') || t('settings.delete_account'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (user) {
                                // 1. Delete avatars from storage (Privacy)
                                try {
                                    const { data: files } = await supabase.storage.from('avatars').list(user.id);
                                    if (files && files.length > 0) {
                                        const paths = files.map(f => `${user.id}/${f.name}`);
                                        await supabase.storage.from('avatars').remove(paths);
                                    }
                                } catch (storageError) {
                                    console.error("Storage cleanup failed:", storageError);
                                }

                                // 2. Delete user data from database (Cascades handle posts, likes, etc.)
                                await supabase.from('profiles').delete().eq('id', user.id);

                                // Note: Other data like dhikr_sessions and dreams are deleted via ON DELETE CASCADE
                            }
                            // Clear local storage
                            await AsyncStorage.clear();
                            // Sign out
                            await supabase.auth.signOut();
                            Alert.alert(
                                t('settings.account_deleted'),
                                t('settings.account_deleted_message')
                            );
                        } catch (error) {
                            Alert.alert(t('error'), error.message);
                        }
                    }
                }
            ]
        );
    };

    // --- AVATAR HANDLING ---
    const handleAvatarPress = () => {
        Alert.alert(
            t('settings.profile_photo'),
            t('settings.profile_photo_msg'),
            [
                {
                    text: t('settings.camera'),
                    onPress: () => pickImage(true)
                },
                {
                    text: t('settings.gallery'),
                    onPress: () => pickImage(false)
                },
                profile?.avatar_url ? {
                    text: t('settings.remove_photo'),
                    style: 'destructive',
                    onPress: removeAvatar
                } : null,
                {
                    text: t('cancel'),
                    style: 'cancel'
                }
            ].filter(Boolean)
        );
    };

    const pickImage = async (useCamera) => {
        try {
            // Request permissions
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('error'), t('settings.camera_permission_required'));
                    return;
                }
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('error'), t('settings.gallery_permission_required'));
                    return;
                }
            }

            const options = {
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            };

            const result = useCamera
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

            if (!result.canceled && result.assets[0]) {
                uploadAvatar(result.assets[0]);
            }
        } catch (error) {
            Alert.alert(t('error'), error.message);
        }
    };

    const uploadAvatar = async (image) => {
        try {
            setUploading(true);
            if (__DEV__) console.log("[SettingsScreen] Starting avatar upload. Base64 present:", !!image.base64);

            // AI Moderation Check
            // We MUST have base64 to moderate. If missing, we block for safety.
            if (!image.base64) {
                console.error("[SettingsScreen] Critical: Image base64 data missing!");
                Alert.alert(t('error'), "Görüntü işlenemedi. Lütfen tekrar deneyin.");
                setUploading(false);
                return;
            }

            const moderation = await moderateImage(image.base64, i18n.language);
            if (__DEV__) console.log("[SettingsScreen] Moderation result in screen:", moderation);

            if (!moderation.isSafe) {
                const reasonStr = moderation.reason ? (moderation.reason.startsWith('community.') || moderation.reason.startsWith('settings.') ? t(moderation.reason) : moderation.reason) : t('settings.moderation_failed');
                Alert.alert(
                    t('settings.moderation_failed'),
                    reasonStr
                );
                setUploading(false);
                return;
            }

            if (__DEV__) console.log("[SettingsScreen] Moderation passed. Proceeding to upload...");

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const ext = image.uri.substring(image.uri.lastIndexOf('.') + 1) || 'jpg';
            const fileName = `${user.id}/${Date.now()}.${ext}`;

            // Convert to arrayBuffer for Supabase Storage
            const arrayBuffer = await fetch(image.uri).then(res => res.arrayBuffer());

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, arrayBuffer, {
                    contentType: image.mimeType || `image/${ext}`,
                    upsert: true
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // CLEAR INTERNAL CACHE
            await AsyncStorage.removeItem(`profile_${user.id}`);

            // Wait for the data to be fresh before alerting
            await refetchProfile();

            Alert.alert(t('success'), t('settings.photo_updated'));

        } catch (error) {
            Alert.alert(t('error'), t('settings.upload_failed') + ": " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeAvatar = async () => {
        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Delete existing files in storage
                const { data: files } = await supabase.storage.from('avatars').list(user.id);
                if (files && files.length > 0) {
                    const paths = files.map(f => `${user.id}/${f.name}`);
                    await supabase.storage.from('avatars').remove(paths);
                }

                const { error } = await supabase
                    .from('profiles')
                    .update({ avatar_url: null })
                    .eq('id', user.id);

                if (error) throw error;

                // CLEAR INTERNAL CACHE
                await AsyncStorage.removeItem(`profile_${user.id}`);
            }

            // Wait for the data to be fresh before alerting
            await refetchProfile();

            Alert.alert(t('success'), t('settings.photo_removed'));
        } catch (error) {
            Alert.alert(t('error'), error.message);
        } finally {
            setUploading(false);
        }
    };
    // ----------------------

    // KVKK/GDPR: Data Export Function
    const handleExportData = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert(t('error'), t('auth.required'));
                setIsExporting(false);
                return;
            }

            // Fetch all user data
            const [profileRes, dhikrRes, dreamRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('dhikr_sessions').select('*').eq('user_id', user.id),
                supabase.from('dream_interpretations').select('*').eq('user_id', user.id)
            ]);

            // Show data summary to user
            const summary = `
📧 ${t('auth.email')}: ${user.email}
👤 ${t('settings.profile')}: ${profileRes.data ? t('yes') : t('no')}
📿 ${t('dhikr.title')}: ${dhikrRes.data?.length || 0}
🌙 ${t('dream.title')}: ${dreamRes.data?.length || 0}

${t('settings.data_export_info')}`;

            Alert.alert(
                t('settings.my_data'),
                summary,
                [
                    {
                        text: t('common.ok'),
                        style: 'default',
                        onPress: () => setIsExporting(false)
                    },
                    {
                        text: t('settings.request_export'),
                        onPress: () => {
                            Linking.openURL('mailto:privacy@islamvy.com?subject=Veri%20Dışa%20Aktarma%20Talebi&body=Kullanıcı%20ID:%20' + user.id);
                            setIsExporting(false);
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert(t('error'), error.message);
            setIsExporting(false);
        }
    };

    const handlePrivacyPolicy = () => {
        // Language-specific privacy policy URLs
        const privacyUrls = {
            tr: 'https://islamvy.com/?modal=privacy',
            en: 'https://islamvy.com/?modal=privacy',
            ar: 'https://islamvy.com/?modal=privacy',
            id: 'https://islamvy.com/?modal=privacy',
            fr: 'https://islamvy.com/?modal=privacy'
        };

        const lang = (i18n.language || 'en').split('-')[0];
        const privacyUrl = (privacyUrls[lang] || privacyUrls.en) + `&lang=${lang}`;

        Alert.alert(
            t('settings.privacy_title'),
            t('settings.privacy_policy_summary'),
            [
                { text: t('common.ok'), style: 'default' },
                {
                    text: t('settings.full_policy'),
                    onPress: () => Linking.openURL(privacyUrl)
                }
            ]
        );
    };

    const handleTermsOfService = () => {
        const termsUrls = {
            tr: 'https://islamvy.com/?modal=terms',
            en: 'https://islamvy.com/?modal=terms',
            ar: 'https://islamvy.com/?modal=terms',
            id: 'https://islamvy.com/?modal=terms'
        };

        const lang = (i18n.language || 'en').split('-')[0];
        const termsUrl = (termsUrls[lang] || termsUrls.en) + `&lang=${lang}`;

        Alert.alert(
            t('settings.terms_title'),
            t('settings.terms_summary'),
            [
                { text: t('common.ok'), style: 'default' },
                {
                    text: t('settings.full_terms'),
                    onPress: () => Linking.openURL(termsUrl)
                }
            ]
        );
    };

    const handleLanguageChange = () => {
        Alert.alert(
            t('settings.language_select'),
            '',
            [
                { text: 'Türkçe', onPress: () => changeLanguage('tr') },
                { text: 'English', onPress: () => changeLanguage('en') },
                { text: 'Français', onPress: () => changeLanguage('fr') },
                { text: 'العربية', onPress: () => changeLanguage('ar') },
                { text: 'Indonesia', onPress: () => changeLanguage('id') },
                { text: t('cancel'), style: 'cancel' }
            ]
        );
    };

    const changeLanguage = async (lang) => {
        await saveLanguage(lang);
        await i18n.changeLanguage(lang);

        if (lang === 'ar') {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
        } else {
            I18nManager.allowRTL(false);
            I18nManager.forceRTL(false);
        }

        // Show restart alert for all language changes to ensure full application
        Alert.alert(
            i18n.t('settings.language_changed_title', { lng: lang }),
            i18n.t('settings.restart_required_msg', { lng: lang })
        );
    };

    // Location Permission Handler
    const handleLocationPermission = async () => {
        try {
            const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

            if (currentStatus === 'granted') {
                Alert.alert(
                    t('settings.location_granted_title'),
                    t('settings.location_granted_msg')
                );
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                Alert.alert(
                    t('settings.location_success_title'),
                    t('settings.location_success_msg')
                );
            } else {
                // Permission denied - show instructions to enable from settings
                Alert.alert(
                    t('settings.location_denied_title'),
                    t('settings.location_denied_msg'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        {
                            text: t('notifications.open_settings'),
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert(t('error'), error.message);
        }
    };

    const getLanguageLabel = (code) => {
        switch (code) {
            case 'tr': return 'Türkçe';
            case 'en': return 'English';
            case 'ar': return 'العربية';
            case 'id': return 'Indonesia';
            case 'fr': return 'Français';
            default: return code.toLocaleUpperCase();
        }
    };

    const renderSettingItem = ({ icon: Icon, label, value, onPress, rightElement, isDestructive }) => (
        <TouchableOpacity
            style={styles.itemRow}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon, nightModeEnabled && !isDestructive && { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                    <Icon size={20} color={isDestructive ? '#FF453A' : (nightModeEnabled ? '#FFD700' : COLORS.primary)} />
                </View>
                <Text style={[styles.itemLabel, isDestructive && styles.destructiveText, nightModeEnabled && !isDestructive && { color: '#FFF' }]}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                {rightElement ? rightElement : (
                    <>
                        {value && <Text style={[styles.itemValue, nightModeEnabled && { color: 'rgba(255,255,255,0.6)' }]}>{value}</Text>}
                        {onPress && <ChevronRight size={20} color={nightModeEnabled ? '#FFD700' : COLORS.textSecondary} />}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <RamadanBackground>
            <ScrollView contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 20 },
                isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }
            ]}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
                        <View style={styles.avatarContainer}>
                            {profile?.avatar_url ? (
                                <Image
                                    key={profile.avatar_url}
                                    source={{ uri: profile.avatar_url }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <View style={[styles.avatarImage, { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={styles.avatarText}>
                                        {(profile?.full_name && profile.full_name.trim().length > 0)
                                            ? profile.full_name.trim().charAt(0).toLocaleUpperCase(i18n.language)
                                            : (session?.user?.email?.charAt(0).toLocaleUpperCase(i18n.language) || 'I')}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.cameraBadge}>
                                <Camera size={12} color="#FFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, nightModeEnabled && { color: '#FFF' }]}>
                            {profile?.full_name || session?.user?.email?.split('@')[0] || t('settings.guest_user')}
                        </Text>
                        <View style={[styles.badgeContainer, isPremium ? styles.premiumBadgeBg : styles.freeBadgeBg]}>
                            {isPremium && <Crown size={12} color="#FFF" style={{ marginRight: 4 }} />}
                            <Text style={styles.badgeText}>
                                {isPremium
                                    ? (premiumTier ? t(`premium.tiers.${premiumTier}`) : t('settings.premium_member'))
                                    : t('settings.free_member')
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {/* PROMINENT ADMIN DASHBOARD - REFERENCE PANEL */}
                {isAdmin && (
                    <TouchableOpacity
                        style={[styles.premiumBanner, { backgroundColor: COLORS.matteBlack, borderColor: '#333' }]}
                        onPress={() => navigation.navigate('AdminDashboard')}
                        activeOpacity={0.95}
                    >
                        <View style={styles.premiumBannerContent}>
                            <View style={[styles.premiumIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                                <Crown size={24} color="#FFF" />
                            </View>
                            <View style={styles.premiumTextContainer}>
                                <Text style={[styles.premiumTitle, { color: '#FFF' }]}>Yönetici Paneli</Text>
                                <Text style={styles.premiumSubtitle}>Mağaza, Analitik ve Kullanıcı Yönetimi</Text>
                            </View>
                            <ChevronRight size={24} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Premium Banner (Only if not premium) */}
                {!isPremium && (
                    <TouchableOpacity
                        style={[styles.premiumBanner, isTablet && { width: '100%', maxWidth: TABLET_MAX_WIDTH }]}
                        onPress={() => navigation.navigate('Premium')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.premiumBannerContent}>
                            <View style={styles.premiumIconCircle}>
                                <Crown size={24} color="#FFD700" />
                            </View>
                            <View style={styles.premiumTextContainer}>
                                <Text style={styles.premiumTitle}>{t('premium.banner_title')}</Text>
                                <Text style={styles.premiumSubtitle}>{t('premium.banner_subtitle')}</Text>
                            </View>
                            <ChevronRight size={24} color="#FFD700" />
                        </View>
                        <View style={styles.shineElement} />
                    </TouchableOpacity>
                )}

                {/* App Sections */}
                {isInfluencer && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionHeader, nightModeEnabled && { color: '#FFD700' }]}>{t('settings.referral_tools')}</Text>
                        <View style={[styles.card, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                            {renderSettingItem({
                                icon: LayoutDashboard,
                                label: t('settings.referral_panel'),
                                onPress: () => navigation.navigate('InfluencerDashboard')
                            })}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, nightModeEnabled && { color: '#FFD700' }]}>{t('settings.title')}</Text>
                    <View style={[styles.card, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        {renderSettingItem({
                            icon: Globe,
                            label: t('settings.language'),
                            value: getLanguageLabel(i18n.language),
                            onPress: handleLanguageChange
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Bell,
                            label: t('settings.notifications'),
                            rightElement: (
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={(val) => toggleSwitch(val, setNotificationsEnabled, 'notifications_enabled')}
                                    trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
                                    thumbColor={'#fff'}
                                />
                            )
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Monitor, // Using Monitor as proxy for Haptic/Vibration icon
                            label: t('settings.haptic'),
                            rightElement: (
                                <Switch
                                    value={hapticEnabled}
                                    onValueChange={(val) => toggleSwitch(val, setHapticEnabled, 'haptic_enabled')}
                                    trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
                                    thumbColor={'#fff'}
                                />
                            )
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: MapPin,
                            label: t('settings.location_permission'),
                            onPress: handleLocationPermission
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Crown,
                            label: t('premium.title'),
                            onPress: () => navigation.navigate('Premium')
                        })}
                        <View style={styles.divider} />

                        <View style={styles.divider} />

                        {renderSettingItem({
                            icon: Wallet,
                            label: t('settings.zakat_calculator'),
                            onPress: () => navigation.navigate('ZakatCalculator')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: MoonStar,
                            label: t('settings.night_mode'),
                            rightElement: (
                                <Switch
                                    value={nightModeEnabled}
                                    onValueChange={(val) => toggleSwitch(val, null, 'night_mode_enabled')}
                                    trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
                                    thumbColor={'#fff'}
                                />
                            )
                        })}
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, nightModeEnabled && { color: '#FFD700' }]}>{t('settings.about')}</Text>
                    <View style={[styles.card, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        {renderSettingItem({
                            icon: LifeBuoy,
                            label: t('settings.support_faq'),
                            onPress: () => navigation.navigate('Support')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Shield,
                            label: t('settings.privacy'),
                            onPress: handlePrivacyPolicy
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: FileText,
                            label: t('settings.terms'),
                            onPress: handleTermsOfService
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Download,
                            label: t('settings.export_data'),
                            onPress: handleExportData
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Star,
                            label: t('settings.rate_app'),
                            onPress: () => {
                                const storeUrl = Platform.OS === 'ios'
                                    ? 'https://apps.apple.com/app/islamvy/id123456789'
                                    : 'https://play.google.com/store/apps/details?id=com.yusuf.islamvy';
                                Linking.openURL(storeUrl);
                            }
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, nightModeEnabled && { color: '#FFD700' }]}>{t('settings.account')}</Text>
                    <View style={[styles.card, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        {renderSettingItem({
                            icon: LogOut,
                            label: t('settings.logout'),
                            onPress: handleSignOut,
                            isDestructive: false
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Trash2,
                            label: t('settings.delete_account'),
                            onPress: () => {
                                Alert.alert(
                                    t('settings.delete_account_confirm_title'),
                                    t('settings.delete_account_confirm_msg'),
                                    [
                                        { text: t('common.cancel'), style: 'cancel' },
                                        {
                                            text: t('settings.delete_account'),
                                            style: 'destructive',
                                            onPress: handleDeleteAccount
                                        }
                                    ]
                                );
                            },
                            isDestructive: true
                        })}
                    </View>
                </View>



            </ScrollView>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        position: 'relative', // For badge positioning
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    premiumBadgeBg: {
        backgroundColor: '#D4AF37', // Gold
    },
    freeBadgeBg: {
        backgroundColor: '#95a5a6', // Gray
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    premiumBanner: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    premiumBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
    },
    premiumIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    premiumTextContainer: {
        flex: 1,
    },
    premiumTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#D4AF37',
        marginBottom: 4,
    },
    premiumSubtitle: {
        fontSize: 13,
        color: '#CCC',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F7F4', // Soft mint surface for classic look
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    destructiveIcon: {
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
    },
    itemLabel: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    destructiveText: {
        color: '#FF453A',
        fontWeight: '600',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemValue: {
        fontSize: 15,
        color: COLORS.textSecondary,
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginLeft: 64,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    modalOverlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContentBottom: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10
    },
    modalHeaderBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.matteBlack
    },
    closeButton: {
        padding: 4,
    },
    iconGrid: {
        flexDirection: 'column',
        gap: 12
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 8
    },
    iconOption: {
        alignItems: 'center',
        width: (width - 88) / 3, // Precise 3-column alignment
    },
    iconPreview: {
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginBottom: 8,
    },
    iconPreviewSelected: {
        borderWidth: 3,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    iconLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24
    },
    applyButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.7
    },
    applyButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16
    }
});

export default SettingsScreen;
