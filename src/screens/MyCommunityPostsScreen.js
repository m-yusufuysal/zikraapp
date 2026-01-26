import { BookOpen, ChevronLeft, Heart, History, Share2, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { deleteCommunityPost, getUserCommunityPosts, getUserParticipationStats } from '../services/CommunityService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const MyCommunityPostsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({ prayers: 0, dhikrs: 0, hatims: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const [postsData, statsData] = await Promise.all([
                getUserCommunityPosts(user.id),
                getUserParticipationStats(user.id)
            ]);
            setPosts(postsData);
            setStats(statsData);
        }
        setLoading(false);
    };

    const handleDelete = async (post) => {
        Alert.alert(
            t('common.confirm'),
            t('community.confirm_delete'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteCommunityPost(post.id, post.type);
                        if (success) {
                            setPosts(prev => prev.filter(p => p.id !== post.id));
                        } else {
                            Alert.alert(t('error'), t('community.save_error'));
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async (post) => {
        try {
            const shareMsg = post.type === 'hatim'
                ? t('community.share_hatim_msg', { title: post.title })
                : t('community.share_post_msg', { title: post.title });

            await Share.share({
                message: shareMsg,
            });
        } catch (error) {
            console.error('Share Error:', error.message);
        }
    };

    const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.type === filter);

    const renderHeader = () => (
        <View>
            {/* Participation Stats (Existing) */}
            <Text style={styles.sectionTitle}>{t('community.my_participation')}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Heart size={20} color="#e74c3c" fill="#e74c3c" />
                    <Text style={styles.statVal}>{stats.prayers}</Text>
                    <Text style={styles.statLab}>{t('community.prayers')}</Text>
                </View>
                <View style={styles.statBox}>
                    <History size={20} color="#f1c40f" />
                    <Text style={styles.statVal}>{stats.dhikrs}</Text>
                    <Text style={styles.statLab}>{t('community.dhikrs')}</Text>
                </View>
                <View style={styles.statBox}>
                    <BookOpen size={20} color={COLORS.primary} />
                    <Text style={styles.statVal}>{stats.hatims}</Text>
                    <Text style={styles.statLab}>{t('community.hatims')}</Text>
                </View>
            </View>

            {/* Filters */}
            <Text style={styles.sectionTitle}>{t('community.my_creations')}</Text>
            <View style={styles.tabBar}>
                {['all', 'dua', 'dhikr', 'hatim'].map(tkey => (
                    <TouchableOpacity
                        key={tkey}
                        style={[styles.tab, filter === tkey && styles.activeTab]}
                        onPress={() => setFilter(tkey)}
                    >
                        <Text style={[styles.tabText, filter === tkey && styles.activeTabText]}>
                            {tkey === 'all' ? t('common.all') : t(`community.type_${tkey}`)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'dua' ? '#3498db20' : (item.type === 'hatim' ? COLORS.primary + '20' : '#f1c40f20') }]}>
                    <Text style={[styles.typeBadgeText, { color: item.type === 'dua' ? '#3498db' : (item.type === 'hatim' ? COLORS.primary : '#f39c12') }]}>
                        {t(`community.type_${item.type}`).toUpperCase()}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareBtn}>
                        <Share2 size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                        <Trash2 size={18} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent}>{item.content || item.description}</Text>

            <View style={styles.postFooter}>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <View style={styles.stats}>
                    <Heart size={14} color="#e74c3c" fill="#e74c3c" />
                    <Text style={styles.statText}>{item.current_count}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('community.my_posts')}</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <History size={60} color="#DDD" />
                            <Text style={styles.emptyText}>{t('community.no_posts_yet')}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    list: { padding: 15 },
    postCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeBadgeText: { fontSize: 10, fontWeight: 'bold' },
    deleteBtn: { padding: 5 },
    shareBtn: { padding: 5 },
    postTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
    postContent: { fontSize: 14, color: '#666', lineHeight: 20 },
    postFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: 'center' },
    time: { fontSize: 11, color: '#999' },
    stats: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statText: { fontSize: 12, color: '#666', fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#999' },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#000',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'space-around'
    },
    statBox: { alignItems: 'center' },
    statVal: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
    statLab: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginLeft: 5, marginBottom: 10, marginTop: 20 },
    tabBar: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.05)' },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
    activeTabText: { color: '#FFF' },
});

export default MyCommunityPostsScreen;
