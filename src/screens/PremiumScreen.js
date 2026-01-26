import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Localization from 'expo-localization';
import { Check, Crown, Shield, Star, X, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { updateUserProfile } from '../services/userService';

const { width } = Dimensions.get('window');

// 3 TIERS Logic
const TIERS = {
    STARTER: { id: 'starter', price_usd: 3.99, price_try: 69.99, features: ['no_ads', 'bg_audio', 'community_requests', 'limit_starter'] },
    PRO: { id: 'pro', price_usd: 7.99, price_try: 129.99, features: ['no_ads', 'bg_audio', 'community_requests', 'limit_pro', 'priority'], recommended: true },
    UNLIMITED: { id: 'unlimited', price_usd: 14.99, price_try: 249.99, features: ['no_ads', 'bg_audio', 'community_requests', 'unlimited_all', 'priority'] }
};

const PremiumScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const [selectedTier, setSelectedTier] = useState('pro');
    const [currency, setCurrency] = useState('$');
    const [isPremium, setIsPremium] = useState(false);
    const [currentTier, setCurrentTier] = useState(null);

    useEffect(() => {
        detectRegion();
        loadPremiumStatus();
    }, []);

    const detectRegion = () => {
        const region = Localization.getLocales()[0]?.regionCode;
        if (region === 'TR') {
            setCurrency('₺');
        } else {
            setCurrency('$');
        }
    };

    const loadPremiumStatus = async () => {
        const premium = await AsyncStorage.getItem('isPremium') === 'true';
        const tier = await AsyncStorage.getItem('premiumTier');
        setIsPremium(premium);
        setCurrentTier(premium ? tier : null);
        if (premium && tier) {
            setSelectedTier(tier);
        }
    };

    const handlePurchase = async () => {
        // TEST MODE: Directly activate premium without payment
        try {
            await AsyncStorage.setItem('isPremium', 'true');
            await AsyncStorage.setItem('premiumTier', selectedTier);
            setIsPremium(true);
            setCurrentTier(selectedTier);

            // SYNC TO SUPABASE
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await updateUserProfile(user.id, {
                    is_premium: true,
                    premium_tier: selectedTier
                });
            }

            Alert.alert(
                t('premium.test_mode_title'),
                t('premium.test_mode_success', { tier: selectedTier }),
                [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Premium activation error:', error);
            Alert.alert(t('error'), t('community.save_error'));
        }
    };

    const handleRestore = async () => {
        // Mock Restore
        Alert.alert(t('premium.title'), "Restore functionality is currently disabled.");
    };

    const getPrice = (tierKey) => {
        const tier = TIERS[tierKey.toUpperCase()];
        return currency === '₺' ? tier.price_try : tier.price_usd;
    };

    const renderTierCard = (tierKey) => {
        const tier = TIERS[tierKey.toUpperCase()];
        const isSelected = selectedTier === tierKey;
        const isCurrent = currentTier === tierKey;

        return (
            <TouchableOpacity
                key={tierKey}
                style={[
                    styles.tierCard,
                    isSelected && styles.tierCardActive,
                    isCurrent && { borderColor: '#4CAF50' } // Green border for current plan
                ]}
                onPress={() => setSelectedTier(tierKey)}
                activeOpacity={0.9}
            >
                {tier.recommended && !isCurrent && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{t('premium.best_value')}</Text>
                    </View>
                )}

                {isCurrent && (
                    <View style={[styles.badgeContainer, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.badgeText}>{t('premium.active_status')}</Text>
                    </View>
                )}

                <View style={styles.tierHeader}>
                    <Text style={[styles.tierName, isSelected && styles.tierNameActive]}>
                        {t(`premium.tiers.${tierKey}`)}
                    </Text>
                    {tierKey === 'unlimited' && <Crown size={20} color={isSelected ? '#D4AF37' : '#888'} />}
                </View>

                <View style={styles.priceRow}>
                    <Text style={[styles.currency, isSelected && styles.textActive]}>{currency}</Text>
                    <Text style={[styles.price, isSelected && styles.textActive]}>{getPrice(tierKey)}</Text>
                    <Text style={[styles.period, isSelected && styles.textActive]}>{t('premium.per_month')}</Text>
                </View>

                {/* Feature Summary */}
                <View style={styles.miniFeatures}>
                    {tierKey === 'starter' && <Text style={styles.miniFeatureText}>{t('premium.tier_features.starter')}</Text>}
                    {tierKey === 'pro' && <Text style={styles.miniFeatureText}>{t('premium.tier_features.pro')}</Text>}
                    {tierKey === 'unlimited' && <Text style={styles.miniFeatureText}>{t('premium.tier_features.unlimited')}</Text>}
                </View>

                {isSelected && (
                    <View style={styles.checkCircle}>
                        <Check size={16} color="#FFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <RamadanBackground customStandardGradient={!ramadanModeEnabled ? ['#000', '#121212'] : null}>

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <X size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.iconContainer}>
                        <LinearGradient colors={['#FFD700', '#D4AF37']} style={styles.iconBg}>
                            <Crown size={48} color="#000" fill="#000" />
                        </LinearGradient>
                        <View style={styles.glow} />
                    </View>
                    <Text style={styles.title}>{t('premium.title')}</Text>
                    <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
                </View>

                {/* Feature List (Based on Selected Tier) */}
                <View style={styles.featuresList}>
                    <FeatureItem
                        icon={<Zap size={20} color="#D4AF37" />}
                        text={t('premium.features.no_ads')}
                    />
                    <FeatureItem
                        icon={<Star size={20} color="#D4AF37" />}
                        text={t('premium.features.bg_audio')}
                    />
                    <FeatureItem
                        icon={<Check size={20} color="#D4AF37" />}
                        text={t('premium.features.community_requests')}
                    />

                    {selectedTier === 'starter' && (
                        <>
                            <FeatureItem icon={<Shield size={20} color="#D4AF37" />} text={t('premium.features.dream_limit', { count: 3 })} />
                            <FeatureItem icon={<Shield size={20} color="#D4AF37" />} text={t('premium.features.dhikr_limit', { count: 3 })} />
                        </>
                    )}
                    {selectedTier === 'pro' && (
                        <>
                            <FeatureItem icon={<Shield size={20} color="#D4AF37" />} text={t('premium.features.dream_limit', { count: 10 })} />
                            <FeatureItem icon={<Shield size={20} color="#D4AF37" />} text={t('premium.features.dhikr_limit', { count: 10 })} />
                        </>
                    )}
                    {selectedTier === 'unlimited' && (
                        <FeatureItem icon={<Crown size={20} color="#D4AF37" />} text={t('premium.features.unlimited_all')} />
                    )}
                </View>

                {/* Tiers Selector */}
                <View style={styles.tiersContainer}>
                    {renderTierCard('starter')}
                    {renderTierCard('pro')}
                    {renderTierCard('unlimited')}
                </View>

                <View style={{ height: 20 }} />

                {/* Action Button logic:
                    - If disabled (loading): Show Spinner
                    - If selected == current: Show "Active Plan" (Disabled)
                    - If selected != current: Show "Upgrade/Switch" (Enabled) 
                */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(currentTier === selectedTier) ? null : handlePurchase}
                    disabled={currentTier === selectedTier}
                >
                    {(currentTier === selectedTier) ? (
                        <View style={styles.activeBtnContent}>
                            <Text style={styles.actionButtonText}>
                                {t('premium.active_status').toUpperCase()}
                            </Text>
                            <Check size={20} color="#000" />
                        </View>
                    ) : (
                        <LinearGradient
                            colors={['#FFD700', '#D4AF37', '#C59132']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.actionButtonText}>
                                {/* Reuse keys or just say Subscribe/Upgrade */}
                                {currentTier ? t('premium.subscribe') : (selectedTier === 'starter' ? t('premium.start_now') : t('premium.subscribe'))}
                            </Text>
                        </LinearGradient>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                    <Text style={styles.restoreText}>{t('premium.restore')}</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>{t('premium.cancel_anytime')}</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </RamadanBackground>
    );
};

const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIcon}>{icon}</View>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        paddingHorizontal: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
    },
    hero: {
        alignItems: 'center',
        marginVertical: 20,
    },
    iconContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    glow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(212, 175, 55, 0.3)',
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    featuresList: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        marginRight: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#EEE',
        fontWeight: '500',
    },
    tiersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    tierCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    tierCardActive: {
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
    },
    tierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 4,
    },
    tierName: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    tierNameActive: {
        color: '#D4AF37',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    currency: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 3,
        marginRight: 2,
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
    },
    period: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
    },
    textActive: {
        color: '#D4AF37',
    },
    miniFeatures: {
        height: 20,
        justifyContent: 'center',
    },
    miniFeatureText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },
    checkCircle: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#D4AF37',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#D4AF37',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
    },
    actionButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    gradientBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 0.5,
    },
    activeBtnContent: {
        backgroundColor: '#D4AF37',
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    restoreBtn: {
        marginTop: 15,
        padding: 10,
    },
    restoreText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    disclaimer: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        marginTop: 5,
    }
});

export default PremiumScreen;
