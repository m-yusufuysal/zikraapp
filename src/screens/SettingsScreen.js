import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import {
    Bell,
    ChevronRight,
    Crown,
    Download,
    Globe,
    LayoutDashboard,
    LogOut,
    Mail,
    MapPin,
    Monitor,
    Moon,
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
import { supabase } from '../services/supabase';
import { getUserProfile } from '../services/userService';
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

    const [session, setSession] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [premiumTier, setPremiumTier] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const { ramadanModeEnabled, toggleRamadanMode } = useTheme();
    const [isExporting, setIsExporting] = useState(false);
    const [showIconSelector, setShowIconSelector] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [isInfluencer, setIsInfluencer] = useState(false);

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
    const { data: profile } = useQuery({
        queryKey: ['profile', session?.user?.id],
        queryFn: () => getUserProfile(session.user.id),
        enabled: !!session?.user?.id,
        staleTime: 1000 * 60 * 60, // 1 hour (Profile rarely changes)
    });

    useFocusEffect(
        useCallback(() => {
            checkPremium();
            loadSettings();
            checkInfluencerStatus();
        }, [])
    );

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
        if (key === 'ramadan_mode_enabled') {
            toggleRamadanMode(value);
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
                                // Delete user data from database
                                await supabase.from('profiles').delete().eq('id', user.id);
                                await supabase.from('dhikr_sessions').delete().eq('user_id', user.id);
                                await supabase.from('dream_interpretations').delete().eq('user_id', user.id);
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

    // KVKK/GDPR: Data Export Function
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
                            Linking.openURL('mailto:privacy@zikraapp.com?subject=Veri%20Dışa%20Aktarma%20Talebi&body=Kullanıcı%20ID:%20' + user.id);
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
            tr: 'https://zikraapp.com/privacy',
            en: 'https://zikraapp.com/privacy/en',
            ar: 'https://zikraapp.com/privacy/ar',
            id: 'https://zikraapp.com/privacy/id'
        };

        const lang = (i18n.language || 'en').split('-')[0];
        const privacyUrl = privacyUrls[lang] || privacyUrls.en;

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

    const handleLanguageChange = () => {
        Alert.alert(
            t('settings.language_select'),
            '',
            [
                { text: 'Türkçe', onPress: () => changeLanguage('tr') },
                { text: 'English', onPress: () => changeLanguage('en') },
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
                <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon, ramadanModeEnabled && !isDestructive && { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                    <Icon size={20} color={isDestructive ? '#FF453A' : (ramadanModeEnabled ? '#FFD700' : COLORS.primary)} />
                </View>
                <Text style={[styles.itemLabel, isDestructive && styles.destructiveText, ramadanModeEnabled && !isDestructive && { color: '#FFF' }]}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                {rightElement ? rightElement : (
                    <>
                        {value && <Text style={[styles.itemValue, ramadanModeEnabled && { color: 'rgba(255,255,255,0.6)' }]}>{value}</Text>}
                        {onPress && <ChevronRight size={20} color={ramadanModeEnabled ? '#FFD700' : COLORS.textSecondary} />}
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
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name ? profile.full_name.charAt(0).toLocaleUpperCase(i18n.language) : (session?.user?.email?.charAt(0).toLocaleUpperCase(i18n.language) || 'Z')}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, ramadanModeEnabled && { color: '#FFF' }]}>
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
                        <Text style={[styles.sectionHeader, ramadanModeEnabled && { color: '#FFD700' }]}>{t('settings.referral_tools')}</Text>
                        <View style={[styles.card, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                            {renderSettingItem({
                                icon: LayoutDashboard,
                                label: t('settings.referral_panel'),
                                onPress: () => navigation.navigate('InfluencerDashboard')
                            })}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, ramadanModeEnabled && { color: '#FFD700' }]}>{t('settings.title')}</Text>
                    <View style={[styles.card, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
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

                        {/* App Icon Changer */}
                        {/* App Icon Changer Item */}
                        {renderSettingItem({
                            icon: Star,
                            label: t('settings.app_icon'),
                            onPress: () => {
                                // Reset selection to current state or default when opening
                                setSelectedIcon(null);
                                setShowIconSelector(true);
                            },
                            rightElement: (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.itemValue, ramadanModeEnabled && { color: 'rgba(255,255,255,0.6)' }]}>
                                        {t('settings.change')}
                                    </Text>
                                    <ChevronRight size={20} color={ramadanModeEnabled ? '#FFD700' : COLORS.textSecondary} />
                                </View>
                            )
                        })}

                        {/* Icon Selection Bottom Sheet Modal */}
                        <Modal
                            visible={showIconSelector}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowIconSelector(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalOverlayBottom}
                                activeOpacity={1}
                                onPress={() => setShowIconSelector(false)}
                            >
                                <View style={[styles.modalContentBottom, ramadanModeEnabled && { backgroundColor: '#1a1a1a', borderColor: '#333', borderWidth: 1 }]}>
                                    <View style={styles.modalHeaderBottom}>
                                        <Text style={[styles.modalTitle, ramadanModeEnabled && { color: '#FFD700' }]}>
                                            {t('settings.choose_app_icon')}
                                        </Text>
                                        <TouchableOpacity onPress={() => setShowIconSelector(false)} style={styles.closeButton}>
                                            <X size={24} color={ramadanModeEnabled ? '#FFF' : COLORS.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.iconGrid}>
                                        {/* Row 1 */}
                                        <View style={styles.iconRow}>
                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('default')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'default' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_default')}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('light')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_light.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'light' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_cream_gold')}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('dark')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_dark.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'dark' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_midnight_blue')}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Row 2 */}
                                        <View style={[styles.iconRow, { marginTop: 12 }]}>
                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('blue_gold')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_blue_gold.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'blue_gold' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_gold_navy')}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('sage')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_sage.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'sage' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_sage')}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('silver')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_silver.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'silver' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_silver')}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Row 3 */}
                                        <View style={[styles.iconRow, { marginTop: 12 }]}>
                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('burgundy')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_burgundy.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'burgundy' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_burgundy')}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.iconOption}
                                                onPress={() => setSelectedIcon('navy_red')}
                                            >
                                                <Image
                                                    source={require('../../assets/images/icon_navy_red.png')}
                                                    style={[
                                                        styles.iconPreview,
                                                        selectedIcon === 'navy_red' && styles.iconPreviewSelected
                                                    ]}
                                                />
                                                <Text style={[styles.iconLabel, ramadanModeEnabled && { color: '#CCC' }]}>{t('settings.icon_navy_red')}</Text>
                                            </TouchableOpacity>
                                            <View style={styles.iconOption} />
                                        </View>
                                    </View>

                                    {/* Action Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.applyButton,
                                            !selectedIcon && styles.applyButtonDisabled
                                        ]}
                                        disabled={!selectedIcon}
                                        onPress={async () => {
                                            try {
                                                const { setAppIcon } = require('expo-dynamic-app-icon');
                                                const iconName = selectedIcon === 'default' ? null : selectedIcon;
                                                await setAppIcon(iconName);
                                                Alert.alert(t('settings.location_success_title'), t('settings.icon_updated'));
                                                setShowIconSelector(false);
                                            } catch (e) {
                                                Alert.alert('Info', t('settings.production_only'));
                                            }
                                        }}
                                    >
                                        <Text style={styles.applyButtonText}>{t('settings.apply')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                        <View style={styles.divider} />

                        {renderSettingItem({
                            icon: Wallet,
                            label: t('settings.zakat_calculator'),
                            onPress: () => navigation.navigate('ZakatCalculator')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Moon,
                            label: t('settings.ramadan_mode'),
                            rightElement: (
                                <Switch
                                    value={ramadanModeEnabled}
                                    onValueChange={(val) => toggleSwitch(val, null, 'ramadan_mode_enabled')}
                                    trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
                                    thumbColor={'#fff'}
                                />
                            )
                        })}
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, ramadanModeEnabled && { color: '#FFD700' }]}>{t('settings.about')}</Text>
                    <View style={[styles.card, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        {renderSettingItem({
                            icon: Shield,
                            label: t('settings.privacy'),
                            onPress: handlePrivacyPolicy
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Download,
                            label: t('settings.export_data'),
                            onPress: handleExportData
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Mail,
                            label: t('settings.contact'),
                            onPress: () => Linking.openURL('mailto:support@zikraapp.com')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: Star,
                            label: t('settings.rate_app'),
                            onPress: () => {
                                const storeUrl = Platform.OS === 'ios'
                                    ? 'https://apps.apple.com/app/zikra/id123456789'
                                    : 'https://play.google.com/store/apps/details?id=com.yusuf.zikraapp';
                                Linking.openURL(storeUrl);
                            }
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, ramadanModeEnabled && { color: '#FFD700' }]}>{t('settings.account')}</Text>
                    <View style={[styles.card, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
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
