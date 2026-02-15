import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';
import { ChevronLeft, BarChart2, TrendingUp, Users, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { nightModeEnabled } = useTheme();
    const [loading, setLoading] = useState(true);
    const [shopStats, setShopStats] = useState(null);
    const [userGrowth, setUserGrowth] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Shop Stats
            const { data: shopData, error: shopError } = await supabase.rpc('get_shop_stats');
            if (shopError) throw shopError;
            setShopStats(shopData);

            // Fetch User Growth
            const { data: userData, error: userError } = await supabase.rpc('get_user_stats_history');
            if (userError) throw userError;
            setUserGrowth(userData || []);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderBarChart = () => {
        if (!userGrowth.length) return <Text style={styles.noDataText}>Veri yok</Text>;

        const maxCount = Math.max(...userGrowth.map(d => d.user_count), 1);

        return (
            <View style={styles.chartContainer}>
                {userGrowth.map((item, index) => {
                    const height = (item.user_count / maxCount) * 100; // Percentage height
                    return (
                        <View key={index} style={styles.barWrapper}>
                            <Text style={styles.barLabel}>{item.user_count}</Text>
                            <View style={[styles.bar, { height: `${height}%`, backgroundColor: COLORS.primary }]} />
                            <Text style={styles.barDate}>{item.date_label}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Analitik & Gelir</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <View style={styles.summaryGrid}>
                            <View style={[styles.card, styles.halfCard]}>
                                <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                                    <ShoppingBag size={20} color="#2ecc71" />
                                </View>
                                <Text style={styles.cardLabel}>Toplam Tıklama</Text>
                                <Text style={styles.cardValue}>{shopStats?.total_clicks || 0}</Text>
                            </View>
                            <View style={[styles.card, styles.halfCard]}>
                                <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
                                    <TrendingUp size={20} color="#f39c12" />
                                </View>
                                <Text style={styles.cardLabel}>Bugünkü Tıklama</Text>
                                <Text style={styles.cardValue}>{shopStats?.clicks_today || 0}</Text>
                            </View>
                        </View>

                        {/* User Growth Chart */}
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Users size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>Kullanıcı Büyümesi (Son 7 Gün)</Text>
                            </View>
                            <View style={styles.chartBox}>
                                {renderBarChart()}
                            </View>
                        </View>

                        {/* Top Products */}
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <BarChart2 size={20} color="#9b59b6" style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>En Çok Tıklanan Ürünler</Text>
                            </View>
                            {shopStats?.top_products?.length > 0 ? (
                                shopStats.top_products.map((product, index) => (
                                    <View key={index} style={styles.productRow}>
                                        <View style={styles.rankBadge}>
                                            <Text style={styles.rankText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.productName} numberOfLines={1}>
                                            {product.product_name}
                                        </Text>
                                        <Text style={styles.productClicks}>{product.clicks} tık</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noDataText}>Henüz veri yok.</Text>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
    backBtn: { padding: 8 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    content: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },

    summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    halfCard: { width: '48%' },

    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    cardLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
    cardValue: { fontSize: 22, fontWeight: '800', color: '#333' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },

    chartBox: { height: 180, justifyContent: 'flex-end' },
    chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, paddingHorizontal: 8 },
    barWrapper: { alignItems: 'center', width: 30 },
    bar: { width: 12, borderRadius: 6, marginBottom: 8, minHeight: 4 },
    barLabel: { fontSize: 10, color: '#666', marginBottom: 4 },
    barDate: { fontSize: 10, color: '#999' },

    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 12 },
    rankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#eceff1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { fontSize: 12, fontWeight: 'bold', color: '#546e7a' },
    productName: { flex: 1, fontSize: 14, color: '#333', marginRight: 8 },
    productClicks: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

    noDataText: { color: '#999', textAlign: 'center', marginVertical: 10 }
});

export default AnalyticsScreen;
