import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        active_users_count: 0,
        products_count: 0,
        influencers_count: 0,
        shop_clicks_count: 0
    });
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchStats();
        }, [])
    );

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_admin_stats');
            if (error) throw error;
            if (data) {
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const adminModules = [
        {
            id: 'shop',
            title: 'Mağaza Yönetimi',
            subtitle: 'Ürün ekle, düzenle, fotoğraf yükle',
            icon: 'basket',
            color: '#2ecc71',
            route: 'ShopAdmin'
        },
        {
            id: 'analytics',
            title: 'Analitik & Gelir',
            subtitle: 'Çok Yakında',
            icon: 'pie-chart',
            color: '#3498db',
            route: 'Analytics'
        },
        {
            id: 'users',
            title: 'Kullanıcılar',
            subtitle: 'İnfluencer Listesi',
            icon: 'people',
            color: '#9b59b6',
            route: 'InfluencerList'
        },
        {
            id: 'settings',
            title: 'Admin Ayarları',
            subtitle: 'Sistem yapılandırması',
            icon: 'settings',
            color: '#95a5a6',
            route: null
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Dashboard ♛</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.welcomeText}>Hoşgeldin, Yönetici</Text>
                <Text style={styles.subText}>İstatistikler ve yönetim paneli</Text>

                <View style={styles.grid}>
                    {adminModules.map((module) => (
                        <TouchableOpacity
                            key={module.id}
                            style={styles.card}
                            onPress={() => module.route ? navigation.navigate(module.route) : null}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: module.color + '20' }]}>
                                <Ionicons name={module.icon} size={32} color={module.color} />
                            </View>
                            <Text style={styles.cardTitle}>{module.title}</Text>
                            <Text style={styles.cardSubtitle}>{module.subtitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Hızlı Bakış</Text>
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : (
                        <View style={styles.statRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{stats.active_users_count}</Text>
                                <Text style={styles.statLabel}>Aktif Kullanıcı</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{stats.influencers_count}</Text>
                                <Text style={styles.statLabel}>İnfluencer</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{stats.shop_clicks_count || 0}</Text>
                                <Text style={styles.statLabel}>Mağaza Tık</Text>
                            </View>
                        </View>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 8 },
    content: { padding: 20 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', color: COLORS.matteBlack, marginBottom: 4 },
    subText: { fontSize: 14, color: '#666', marginBottom: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
    card: {
        width: (width - 56) / 2,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
    },
    iconContainer: {
        width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12
    },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#333' },
    cardSubtitle: { fontSize: 12, color: '#999' },
    statsContainer: { marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: {
        backgroundColor: '#FFF', flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 12, alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    statValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
    statLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase' }
});

export default AdminDashboardScreen;
