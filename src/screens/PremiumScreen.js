import { LinearGradient } from 'expo-linear-gradient';
import * as Localization from 'expo-localization';
import { Check, Crown, ExternalLink, Heart, Shield, Star, X, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { useRevenueCat } from '../providers/RevenueCatProvider';

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
    const { nightModeEnabled } = useTheme();
    const { purchasePackage, restorePurchases, isPro, currentOffering, loading } = useRevenueCat();
    const [selectedTier, setSelectedTier] = useState('pro');
    const [currency, setCurrency] = useState('$');
    const [isProcessing, setIsProcessing] = useState(false);

    // For UI highliting only
    const [currentTier, setCurrentTier] = useState(null);

    useEffect(() => {
        const loadStoredTier = async () => {
            const tier = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('premiumTier'));
            if (tier) setCurrentTier(tier);
        };
        loadStoredTier();
    }, [isPro]);

    useEffect(() => {
        detectRegion();
    }, []);

    const detectRegion = () => {
        const region = Localization.getLocales()[0]?.regionCode;
        if (region === 'TR') {
            setCurrency('₺');
        } else {
            setCurrency('$');
        }
    };

    const handlePurchase = async () => {
        if (isProcessing) return;

        // If we have products, allow purchase even if 'loading' is true (background refresh)
        // If we have products, allow purchase even if 'loading' is true (background refresh)
        if (!currentOffering && loading) {
            Alert.alert(t('error'), t('premium.market_loading_error'));
            return;
        }

        setIsProcessing(true);
        try {
            // Find the package in currentOffering that matches selectedTier
            const packageToBuy = currentOffering?.availablePackages?.find((pkg) => {
                const id = (pkg.identifier || '').toLowerCase();
                const productId = (pkg.product?.identifier || '').toLowerCase();
                const tier = selectedTier.toLowerCase();

                // Match by package identifier OR by full App Store product ID
                return id === tier
                    || id.includes(tier)
                    || productId === `com.esat.islamvy.${tier}`
                    || productId === tier
                    || productId.includes(tier);
            });

            if (!packageToBuy) {
                const pkgList = currentOffering?.availablePackages?.map(p => `${p.identifier}(${p.product?.identifier})`).join(", ") || "EMPTY";
                console.error("Product mismatch! Looking for:", selectedTier, "Available:", pkgList);
                Alert.alert(
                    t('error'),
                    t('premium.package_not_found_desc')
                );
                setIsProcessing(false);
                return;
            }

            const success = await purchasePackage(packageToBuy);

            if (success) {
                Alert.alert(
                    t('premium.title'),
                    t('premium.test_mode_success', { tier: selectedTier }),
                    [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Premium purchase error:', error);
            Alert.alert(t('error'), t('community.save_error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const success = await restorePurchases();
            if (success) {
                Alert.alert(t('premium.title'), t('premium.restore_success'));
            }
        } catch (error) {
            console.error('Restore error:', error);
            Alert.alert(t('error'), error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const getPrice = (tierKey) => {
        // Try to fetch from RevenueCat packages
        if (currentOffering?.availablePackages) {
            const pkg = currentOffering.availablePackages.find((p) => {
                const id = (p.identifier || '').toLowerCase();
                const productId = (p.product?.identifier || '').toLowerCase();
                const tier = tierKey.toLowerCase();
                return id === tier || id.includes(tier)
                    || productId === `com.esat.islamvy.${tier}`
                    || productId === tier
                    || productId.includes(tier);
            });
            if (pkg) {
                return pkg.product.priceString;
            }
        }

        // Fallback to hardcoded
        const tier = TIERS[tierKey.toUpperCase()];
        return currency === '₺' ? tier.price_try : tier.price_usd;
    };

    const renderTierCard = (tierKey) => {
        const tier = TIERS[tierKey.toUpperCase()];
        const isSelected = selectedTier === tierKey;
        const isCurrent = isPro && selectedTier === tierKey; // Simplified assumption: if Pro, currently selected is active? No, we don't know exact tier from bool.
        // Actually, RevenueCat `isPro` just says if entitlement is active. 
        // For UI, if `isPro` is true, we might just show "Active" on the tier they previously bought, OR just show "You are Premium" generally.
        // For now, let's just use `isPro` to hide the specific "Active" badge unless we store the tier locally too.
        // We can check AsyncStorage 'premiumTier' if we want.

        // Let's stick to old logic for `isCurrent` if possible, but we don't have `currentTier` state anymore.
        // Let's bring back reading `premiumTier` from storage for UI purpose only.


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
                        <Text style={styles.badgeText} maxFontSizeMultiplier={1.3}>{t('premium.best_value')}</Text>
                    </View>
                )}

                {isCurrent && (
                    <View style={[styles.badgeContainer, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.badgeText} maxFontSizeMultiplier={1.3}>{t('premium.active_status')}</Text>
                    </View>
                )}

                <View style={styles.tierHeader}>
                    <Text style={[styles.tierName, isSelected && styles.tierNameActive]} maxFontSizeMultiplier={1.3}>
                        {t(`premium.tiers.${tierKey}`)}
                    </Text>
                    {tierKey === 'unlimited' && <Crown size={20} color={isSelected ? '#D4AF37' : '#888'} />}
                </View>

                <View style={styles.priceRow}>
                    <Text style={[styles.currency, isSelected && styles.textActive]} maxFontSizeMultiplier={1.3}>{currency}</Text>
                    <Text style={[styles.price, isSelected && styles.textActive]} maxFontSizeMultiplier={1.3}>{getPrice(tierKey)}</Text>
                    <Text style={[styles.period, isSelected && styles.textActive]} maxFontSizeMultiplier={1.3}>{t('premium.per_month')}</Text>
                </View>

                {/* Feature Summary */}
                <View style={styles.miniFeatures}>
                    {tierKey === 'starter' && <Text style={styles.miniFeatureText} maxFontSizeMultiplier={1.3}>{t('premium.tier_features.starter')}</Text>}
                    {tierKey === 'pro' && <Text style={styles.miniFeatureText} maxFontSizeMultiplier={1.3}>{t('premium.tier_features.pro')}</Text>}
                    {tierKey === 'unlimited' && <Text style={styles.miniFeatureText} maxFontSizeMultiplier={1.3}>{t('premium.tier_features.unlimited')}</Text>}
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
        <RamadanBackground customStandardGradient={!nightModeEnabled ? ['#000', '#121212'] : null}>

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
                    <Text style={styles.title} maxFontSizeMultiplier={1.3}>Reklamsız Premium Deneyim</Text>
                    <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>{t('premium.subtitle')}</Text>
                </View>

                {/* Feature List (Based on Selected Tier) */}
                <View style={styles.featuresList}>

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
                        <>
                            <FeatureItem icon={<Crown size={20} color="#D4AF37" />} text={t('premium.features.unlimited_all')} />
                            <FeatureItem icon={<Star size={20} color="#D4AF37" />} text={t('premium.features.priority')} />
                        </>
                    )}
                </View>

                {/* Tiers Selector */}
                <View style={styles.tiersContainer}>
                    {renderTierCard('starter')}
                    {renderTierCard('pro')}
                    {renderTierCard('unlimited')}
                </View>

                {/* Charity Notice Section */}
                <View style={styles.charityCard}>
                    <LinearGradient
                        colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
                        style={styles.charityGradient}
                    >
                        <View style={styles.charityIconContainer}>
                            <Heart size={20} color="#D4AF37" fill="#D4AF37" />
                        </View>
                        <View style={styles.charityTextContainer}>
                            <Text style={styles.charityTitle} maxFontSizeMultiplier={1.3}>{t('premium.charity_notice')}</Text>
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://youtube.com/@islamvy')}
                                style={styles.charityLink}
                            >
                                <Text style={styles.charityLinkText} maxFontSizeMultiplier={1.3}>{t('premium.charity_watch_youtube')}</Text>
                                <ExternalLink size={12} color="#D4AF37" style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                <View style={{ height: 10 }} />

                {/* Action Button logic:
                    - If disabled (loading): Show Spinner
                    - If selected == current: Show "Active Plan" (Disabled)
                    - If selected != current: Show "Upgrade/Switch" (Enabled) 
                */}
                <TouchableOpacity
                    style={[styles.actionButton, isProcessing && { opacity: 0.7 }]}
                    onPress={(currentTier === selectedTier) ? null : handlePurchase}
                    disabled={currentTier === selectedTier || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#000" />
                    ) : (currentTier === selectedTier) ? (
                        <View style={styles.activeBtnContent}>
                            <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.3}>
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
                            <Text style={styles.actionButtonText} maxFontSizeMultiplier={1.3}>
                                {currentTier ? t('premium.subscribe') : (selectedTier === 'starter' ? t('premium.start_now') : t('premium.subscribe'))}
                            </Text>
                        </LinearGradient>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.restoreBtn, isProcessing && { opacity: 0.5 }]}
                    onPress={handleRestore}
                    disabled={isProcessing}
                >
                    <Text style={styles.restoreText} maxFontSizeMultiplier={1.3}>{t('premium.restore')}</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer} maxFontSizeMultiplier={1.3}>{t('premium.cancel_anytime')}</Text>

                <View style={styles.legalLinksContainer}>
                    <TouchableOpacity onPress={() => Linking.openURL('https://islamvy.com/?modal=privacy')}>
                        <Text style={styles.legalLinkText} maxFontSizeMultiplier={1.3}>{t('settings.privacy')}</Text>
                    </TouchableOpacity>
                    <View style={styles.legalDivider} />
                    <TouchableOpacity onPress={() => Linking.openURL('https://islamvy.com/?modal=terms')}>
                        <Text style={styles.legalLinkText} maxFontSizeMultiplier={1.3}>{t('settings.terms')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </RamadanBackground>
    );
};

const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIcon}>{icon}</View>
        <Text style={styles.featureText} maxFontSizeMultiplier={1.3}>{text}</Text>
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
        paddingVertical: 12,
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
        paddingVertical: 12,
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
    },
    charityCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    charityGradient: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    charityIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    charityTextContainer: {
        flex: 1,
    },
    charityTitle: {
        fontSize: 13,
        lineHeight: 18,
        color: '#EEE',
        fontWeight: '600',
        marginBottom: 6,
    },
    charityLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    charityLinkText: {
        fontSize: 12,
        color: '#D4AF37',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    legalLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    legalLinkText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        textDecorationLine: 'underline',
    },
    legalDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 15,
    },
});

export default PremiumScreen;
