import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';
import { ChevronLeft, ChevronRight, Search, Users, Activity, UserPlus, Star, X, Plus } from 'lucide-react-native';

const InfluencerListScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [influencers, setInfluencers] = useState([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        activeUsers: 0,
        totalRegistrations: 0,
        influencerCount: 0
    });

    useEffect(() => {
        fetchInfluencers();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // 1. Get Active Users (Online within last 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count: activeCount, error: activeError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('last_seen', fiveMinutesAgo);

            // 2. Get Influencer Count & Total Registrations
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_stats');

            const { count: totalReg, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({
                ...prev,
                activeUsers: activeCount || 0,
                totalRegistrations: totalReg || 0,
                influencerCount: rpcData?.influencers_count || 0
            }));

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchInfluencers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_all_influencers');

            if (error) throw error;
            setInfluencers(data || []);
            setFilteredInfluencers(data || []);
        } catch (error) {
            console.error('Error fetching influencers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredInfluencers(influencers);
            return;
        }

        const lowerText = text.toLowerCase();
        const filtered = influencers.filter(inf =>
            (inf.full_name && inf.full_name.toLowerCase().includes(lowerText)) ||
            (inf.referral_code && inf.referral_code.toLowerCase().includes(lowerText))
        );
        setFilteredInfluencers(filtered);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('InfluencerDashboard', { userId: item.user_id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {item.full_name ? item.full_name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.full_name || 'Bilinmeyen Kullanıcı'}</Text>
                        <Text style={styles.userCode}>Code: {item.referral_code}</Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#CCC" />
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Kayıt</Text>
                    <Text style={[styles.statValue, { color: COLORS.primary }]}>{item.registration_count}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Tıklama</Text>
                    <Text style={styles.statValue}>{item.click_count}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Kazanç</Text>
                    <Text style={[styles.statValue, { color: '#2ecc71' }]}>${item.total_earnings}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Kullanıcılar</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.gridStats}>
                <View style={styles.gridItem}>
                    <Activity size={20} color={COLORS.primary} style={{ marginBottom: 8 }} />
                    <Text style={styles.gridValue}>{stats.activeUsers}</Text>
                    <Text style={styles.gridLabel}>Aktif Kullanıcı</Text>
                </View>
                <View style={styles.gridItem}>
                    <UserPlus size={20} color="#2ecc71" style={{ marginBottom: 8 }} />
                    <Text style={styles.gridValue}>{stats.totalRegistrations}</Text>
                    <Text style={styles.gridLabel}>Toplam Kayıt</Text>
                </View>
                <View style={styles.gridItem}>
                    <Star size={20} color="#f1c40f" style={{ marginBottom: 8 }} />
                    <Text style={styles.gridValue}>{stats.influencerCount}</Text>
                    <Text style={styles.gridLabel}>İnf Sayısı</Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="İsim veya kod ara..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredInfluencers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.influencer_id || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Users size={48} color="#DDD" />
                            <Text style={styles.emptyText}>İnfluencer bulunamadı.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
    backBtn: { padding: 8 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333' },

    gridStats: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
    gridItem: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    gridValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    gridLabel: { fontSize: 11, color: '#666' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, paddingHorizontal: 12, height: 44, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: '100%', fontSize: 15, color: '#333' },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#999', marginTop: 16, fontSize: 16 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    userCode: { fontSize: 12, color: '#666', marginTop: 2 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12 },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
    statValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    statDivider: { width: 1, height: 24, backgroundColor: '#EEE' }
});

export default InfluencerListScreen;
