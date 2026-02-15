import { ArrowLeft, BookOpen, CheckCircle2, Circle, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getHatimSlots, notifyHatimParticipants, takeHatimSlot } from '../services/CommunityService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const HatimDetailScreen = ({ route, navigation }) => {
    const { hatimId, title } = route.params;
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { nightModeEnabled } = useTheme();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const allCompleted = slots.length > 0 && slots.every(s => s.status !== 'available');

    useEffect(() => {
        loadSlots();
    }, []);

    const loadSlots = async () => {
        setLoading(true);
        const data = await getHatimSlots(hatimId);
        setSlots(data);
        setLoading(false);

        // Auto-repair status if all slots are taken but still marked open
        if (data.length > 0 && data.every(s => s.status !== 'available')) {
            const { data: group } = await supabase.from('hatim_groups').select('status').eq('id', hatimId).single();
            if (group && group.status === 'open') {
                await supabase.from('hatim_groups').update({ status: 'completed' }).eq('id', hatimId);
            }
        }
    };

    const handleTakeSlot = async (slot) => {
        if (slot.status !== 'available') return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            return;
        }

        Alert.alert(
            t('community.hatim_group'),
            t('community.take_juz_confirm', { number: slot.slot_number }),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('yes'),
                    onPress: async () => {
                        const success = await takeHatimSlot(hatimId, slot.slot_number, user.id);
                        if (success) {
                            Alert.alert(t('success_title'), t('community.juz_taken_success'));
                            const updatedSlots = await getHatimSlots(hatimId);
                            setSlots(updatedSlots);

                            // Check if completion was reached (triggered by DB)
                            if (updatedSlots.length > 0 && updatedSlots.every(s => s.status !== 'available')) {
                                // Notify all participants
                                await notifyHatimParticipants(hatimId, title);
                            }
                        } else {
                            Alert.alert(t('error'), t('community.report_error'));
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const cityName = route.params.city || '';
            const locationName = route.params.location || '';
            const combinedLocation = [cityName, locationName].filter(Boolean).join(', ');

            const shareMsg = t('community.share_hatim_msg', {
                title: title,
                name: route.params.userName || t('common.someone'),
                location: combinedLocation || t('common.location_missing')
            });
            await Share.share({
                message: shareMsg,
            });
        } catch (error) {
            console.error('Share Error:', error.message);
        }
    };

    const renderSlot = ({ item }) => {
        const isTaken = item.status !== 'available';

        return (
            <TouchableOpacity
                style={[styles.slotCard, isTaken && styles.slotTaken, nightModeEnabled && { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, elevation: 0 }]}
                onPress={() => handleTakeSlot(item)}
                disabled={isTaken}
            >
                <View style={styles.slotLeft}>
                    <View style={[styles.slotNumberBg, isTaken && styles.slotNumberBgTaken, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                        <Text style={[styles.slotNumber, nightModeEnabled && { color: '#FFD700' }]}>{item.slot_number}</Text>
                    </View>
                    <View>
                        <Text style={[styles.slotLabel, nightModeEnabled && { color: '#FFF' }]}>{item.slot_number}. {t('common.juz')}</Text>
                        {isTaken && item.userName && (
                            <View style={styles.takerContainer}>
                                <View style={[styles.takerBadge, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                                    {item.avatar_url ? (
                                        <Image source={{ uri: item.avatar_url }} style={styles.takerAvatar} />
                                    ) : (
                                        <Text style={[styles.takerInitial, nightModeEnabled && { color: '#FFD700' }]}>{item.userName.charAt(0)}</Text>
                                    )}
                                </View>
                                <View style={styles.takerInfo}>
                                    <View style={styles.takerNameRow}>
                                        <Text style={[styles.takerName, nightModeEnabled && { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={1}>{item.userName}</Text>
                                    </View>
                                    {(item.city || item.location) && (
                                        <Text style={[styles.takerLocation, nightModeEnabled && { color: 'rgba(255,255,255,0.5)' }]} numberOfLines={1}>
                                            {item.city}{item.city && item.location ? ', ' : ''}{item.location}
                                        </Text>
                                    )}
                                    {item.taken_at && (
                                        <Text style={[styles.takerTime, nightModeEnabled && { color: 'rgba(255,255,255,0.4)' }]}>
                                            {new Date(item.taken_at).toLocaleString([], {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.slotRight}>
                    {isTaken ? (
                        <View style={styles.takenInfo}>
                            <CheckCircle2 size={16} color="#4CAF50" />
                            <Text style={styles.takenText}>{t('community.hatim_completed')}</Text>
                        </View>
                    ) : (
                        <View style={styles.availableInfo}>
                            <Circle size={16} color={COLORS.primary} />
                            <Text style={styles.availableText}>{t('community.hatim_open')}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <RamadanBackground>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, nightModeEnabled && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <ArrowLeft size={24} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, nightModeEnabled && { color: '#FFF' }]} numberOfLines={1}>
                        {title}
                    </Text>
                    <TouchableOpacity onPress={handleShare} style={[styles.iconBtn, nightModeEnabled && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <Share2 size={24} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoCard, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                    <BookOpen size={24} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                    <Text style={[styles.infoText, nightModeEnabled && { color: '#FFF' }]}>{t('community.hatim_slots_desc')}</Text>
                </View>

                {allCompleted && (
                    <View style={styles.allCompletedBanner}>
                        <CheckCircle2 size={32} color="#FFF" />
                        <Text style={styles.allCompletedText}>{t('community.all_completed')}</Text>
                    </View>
                )}

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={slots}
                        renderItem={renderSlot}
                        keyExtractor={item => item.id}
                        numColumns={1}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },
    title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif' },
    infoCard: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: COLORS.primary + '10', margin: 20, padding: 20, borderRadius: 20 },
    infoText: { flex: 1, fontSize: 13, color: COLORS.matteBlack, lineHeight: 18 },
    listContent: { paddingHorizontal: 20, paddingBottom: 50 },
    slotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1
    },
    slotTaken: { opacity: 0.7, backgroundColor: '#FAFAFA' },
    slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    slotNumberBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
    slotNumberBgTaken: { backgroundColor: '#EEE' },
    slotNumber: { fontWeight: 'bold', color: COLORS.primary },
    slotLabel: { fontSize: 16, fontWeight: '600', color: COLORS.matteBlack },
    slotRight: {},
    takenInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    takenText: { fontSize: 12, color: '#4CAF50', fontWeight: '700' },
    availableInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    availableText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    takerContainer: { flexDirection: 'column', marginTop: 8, gap: 5 },
    takerBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    takerAvatar: { width: '100%', height: '100%' },
    takerInitial: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
    takerInfo: { gap: 2 },
    takerNameRow: { flexDirection: 'row', alignItems: 'center' },
    takerName: { fontSize: 13, fontWeight: '700', color: '#333' },
    takerLocation: { fontSize: 10, color: '#666' },
    takerTime: { fontSize: 10, color: '#999' },
    allCompletedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        backgroundColor: '#27ae60',
        marginHorizontal: 0,
        marginBottom: 20,
        padding: 20,
        borderRadius: 0,
        borderBottomWidth: 4,
        borderBottomColor: '#1e8449',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5
    },
    allCompletedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        flex: 1
    }
});

export default HatimDetailScreen;
