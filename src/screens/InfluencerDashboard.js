import { BarChart3, ChevronLeft, ChevronRight, Copy, Share2, Users, Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getInfluencerDashboardData } from '../services/ReferralService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const InfluencerDashboard = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { nightModeEnabled } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Params for Admin View
    const { userId } = route.params || {};

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            let targetUserId = userId;

            // If no userId passed, get current logged in user
            if (!targetUserId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) targetUserId = user.id;
            }

            if (targetUserId) {
                const data = await getInfluencerDashboardData(targetUserId);
                setStats(data);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!stats?.referral_code) return;
        const link = `islamvy://refer?code=${stats.referral_code}`;
        Clipboard.setString(link);
        Alert.alert(t('thanks'), t('referral.link_copied'));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: 'USD', // Or dynamic based on setup
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <RamadanBackground>
                <View style={[styles.center, { paddingTop: insets.top }]}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            </RamadanBackground>
        );
    }

    if (!stats) {
        return (
            <RamadanBackground>
                <View style={[styles.center, { paddingTop: insets.top }]}>
                    <Text style={styles.errorText}>{t('referral.no_record')}</Text>
                </View>
            </RamadanBackground>
        );
    }

    return (
        <RamadanBackground>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, nightModeEnabled && { color: '#FFF' }]}>{t('referral.title')}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.headerSub}>
                    <Text style={styles.subtitle}>{t('referral.subtitle')}</Text>
                </View>

                {/* Main Stats */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon={BarChart3}
                        label={t('referral.clicks')}
                        value={stats.click_count}
                        color="#3498db"
                    />
                    <StatCard
                        icon={Users}
                        label={t('referral.registrations')}
                        value={stats.registration_count}
                        color="#9b59b6"
                    />
                    <StatCard
                        icon={Wallet}
                        label={t('referral.conversions')}
                        value={stats.conversion_count}
                        color="#2ecc71"
                    />
                    <StatCard
                        icon={Wallet}
                        label={t('referral.pending')}
                        value={formatCurrency(stats.pending_payout)}
                        color={COLORS.primary}
                    />
                </View>

                {/* Referral Link Card */}
                <View style={styles.glassCard}>
                    <Text style={styles.cardLabel}>{t('referral.share_link')}</Text>
                    <View style={styles.linkWrapper}>
                        <Text style={styles.linkText} numberOfLines={1}>
                            islamvy://refer?code={stats.referral_code}
                        </Text>
                        <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
                            <Copy size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Share2 size={20} color="#FFF" />
                        <Text style={styles.shareBtnText}>{t('referral.share_button')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Detailed List Access */}
                <TouchableOpacity
                    style={styles.listLink}
                    onPress={() => navigation.navigate('ReferralList', { influencerId: stats.influencer_id })}
                >
                    <View style={styles.listLinkLeft}>
                        <Users size={24} color={COLORS.primary} />
                        <View style={styles.listLinkTextWrapper}>
                            <Text style={styles.listLinkTitle}>{t('referral.detailed_list')}</Text>
                            <Text style={styles.listLinkDesc}>{t('referral.detailed_list_desc')}</Text>
                        </View>
                    </View>
                    <ChevronRight size={24} color="#CCC" />
                </TouchableOpacity>

            </ScrollView>
        </RamadanBackground>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            <Icon size={20} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    content: { paddingHorizontal: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    headerSub: {
        marginBottom: 30,
        paddingLeft: 4
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.primary, fontFamily: 'Optima' },
    subtitle: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
    glassCard: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 24, padding: 24, marginBottom: 24 },
    cardLabel: { fontSize: 11, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: 12 },
    linkWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, paddingLeft: 16, height: 50, marginBottom: 16 },
    linkText: { flex: 1, fontSize: 14, color: '#555', fontWeight: '600' },
    copyBtn: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
    shareBtn: { backgroundColor: COLORS.primary, borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    shareBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    listLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 12 },
    listLinkLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    listLinkTextWrapper: {},
    listLinkTitle: { fontSize: 16, fontWeight: '700', color: COLORS.matteBlack },
    listLinkDesc: { fontSize: 13, color: '#7f8c8d' },
    errorText: { color: COLORS.error, fontSize: 16, fontWeight: '600' }
});

export default InfluencerDashboard;
