import { Bell, BookOpen, CheckCircle2, ChevronLeft, Heart, ShoppingBag, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { getCommunityNotifications, markNotificationAsRead } from '../services/CommunityNotificationService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const CommunityNotificationsScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const { clearUnreadCount } = useNotifications();

    useEffect(() => {
        fetchNotifications();
        clearUnreadCount();

        // Mark all as read on server
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                const { markAllNotificationsAsRead } = require('../services/CommunityNotificationService');
                markAllNotificationsAsRead(user.id);
            }
        });
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const data = await getCommunityNotifications(user.id);
            setNotifications(data);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (notification) => {
        if (!notification.is_read) {
            const success = await markNotificationAsRead(notification.id);
            if (success) {
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                ));
            }
        }

        // Navigate to related content if needed
        if (notification.type === 'new_product') {
            navigation.navigate('Shop');
        } else if (notification.post_id) {
            navigation.navigate('PostDetail', { postId: notification.post_id });
        } else if (notification.hatim_id) {
            navigation.navigate('HatimDetail', { hatimId: notification.hatim_id });
        }
    };

    const renderIcon = (type) => {
        switch (type) {
            case 'amen': return <Heart size={20} color={COLORS.primary} />;
            case 'prayed': return <Heart size={20} color={COLORS.matteGreen} fill={COLORS.matteGreen} />;
            case 'support': return <Users size={20} color={COLORS.primary} />;
            case 'hatim_slot_taken': return <BookOpen size={20} color="#3498db" />;
            case 'hatim_completed': return <CheckCircle2 size={20} color={COLORS.matteGreen} />;
            case 'new_product': return <ShoppingBag size={20} color="#E67E22" />;
            default: return <Bell size={20} color="#999" />;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => handleMarkAsRead(item)}
        >
            <View style={styles.iconContainer}>
                {renderIcon(item.type)}
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.senderName}>
                    {item.sender?.full_name || t('common.someone')}
                    {item.sender?.location && <Text style={{ fontWeight: '400', fontSize: 13, color: '#666' }}> ({item.sender.location})</Text>}
                </Text>
                <Text style={styles.message}>
                    {item.type === 'amen' && t('community.amen_desc')}
                    {item.type === 'prayed' && t('community.prayed_desc')}
                    {item.type === 'support' && t('community.support_desc')}
                    {item.type === 'new_product' && t('community.new_product_desc')}
                    {item.type === 'hatim_slot_taken' && `${t('community.hatim_slot_taken_desc')}${item.hatim?.title ? ` (${item.hatim.title})` : ''}`}
                    {item.type === 'hatim_completed' && `${t('community.hatim_completed_desc')}${item.hatim?.title ? ` (${item.hatim.title})` : ''}`}
                </Text>
                <Text style={styles.time}>
                    {new Date(item.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('community.notifications')}</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Bell size={60} color="#DDD" />
                            <Text style={styles.emptyText}>{t('community.no_notifications')}</Text>
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
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    unreadCard: { backgroundColor: COLORS.primary + '05' },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    contentContainer: { flex: 1 },
    senderName: { fontSize: 14, fontWeight: '700', color: COLORS.matteBlack },
    message: { fontSize: 13, color: '#666', marginTop: 2 },
    time: { fontSize: 11, color: '#999', marginTop: 5 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#999' }
});

export default CommunityNotificationsScreen;
