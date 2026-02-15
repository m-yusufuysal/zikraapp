import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react-native';

const InfluencerListScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [influencers, setInfluencers] = useState([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInfluencers();
    }, []);

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
                <Text style={styles.title}>İnfluencer Listesi</Text>
                <View style={{ width: 40 }} />
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
                    keyExtractor={(item) => item.influencer_id}
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
