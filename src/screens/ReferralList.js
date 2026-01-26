import { Calendar, ChevronLeft, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getDetailedReferrals } from '../services/ReferralService';
import { COLORS } from '../utils/theme';

const ReferralList = ({ route, navigation }) => {
    const { influencerId } = route.params;
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { ramadanModeEnabled } = useTheme();
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState([]);

    useEffect(() => {
        loadReferrals();
    }, []);

    const loadReferrals = async () => {
        setLoading(true);
        try {
            const data = await getDetailedReferrals(influencerId);
            setReferrals(data);
        } catch (error) {
            console.error('Error loading referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.referralCard}>
            <View style={styles.cardLeft}>
                <View style={styles.userIconBg}>
                    <User size={20} color={COLORS.primary} />
                </View>
                <View>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <View style={styles.dateRow}>
                        <Calendar size={12} color="#999" />
                        <Text style={styles.dateText}>
                            {new Date(item.created_at).toLocaleDateString(i18n.language)}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[
                styles.statusBadge,
                item.status === 'converted' ? styles.statusPremium : styles.statusRegistered
            ]}>
                <Text style={[
                    styles.statusText,
                    item.status === 'converted' ? styles.statusTextPremium : styles.statusTextRegistered
                ]}>
                    {item.status === 'converted' ? t('referral.status_premium') : t('referral.status_registered')}
                </Text>
            </View>
        </View>
    );

    return (
        <RamadanBackground>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, ramadanModeEnabled && { color: '#FFF' }]}>{t('referral.list_title')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={referrals}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>{t('referral.no_referrals')}</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif' },
    listContent: { padding: 20, paddingBottom: 100 },
    referralCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    userIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(46, 89, 74, 0.08)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    userName: { fontSize: 16, fontWeight: '600', color: COLORS.matteBlack },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    dateText: { fontSize: 12, color: '#999' },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
    statusRegistered: { backgroundColor: '#F0F0F0' },
    statusPremium: { backgroundColor: 'rgba(212, 175, 55, 0.15)' },
    statusText: { fontSize: 11, fontWeight: '700' },
    statusTextRegistered: { color: '#7f8c8d' },
    statusTextPremium: { color: '#D4AF37' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', fontSize: 16 }
});

export default ReferralList;
