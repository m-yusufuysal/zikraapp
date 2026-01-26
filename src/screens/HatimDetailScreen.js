import { ArrowLeft, BookOpen, CheckCircle2, Circle, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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
import { getHatimSlots, takeHatimSlot } from '../services/CommunityService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const HatimDetailScreen = ({ route, navigation }) => {
    const { hatimId, title } = route.params;
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { ramadanModeEnabled } = useTheme();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSlots();
    }, []);

    const loadSlots = async () => {
        setLoading(true);
        const data = await getHatimSlots(hatimId);
        setSlots(data);
        setLoading(false);
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
                            loadSlots();
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
            const shareMsg = t('community.share_hatim_msg', { title: title });
            await Share.share({
                message: shareMsg,
            });
        } catch (error) {
            console.error('Share Error:', error.message);
        }
    };

    const renderSlot = ({ item }) => {
        const isTaken = item.status !== 'available';
        const isMine = item.user_id === supabase.auth.user?.id; // Note: simplified check

        return (
            <TouchableOpacity
                style={[styles.slotCard, isTaken && styles.slotTaken]}
                onPress={() => handleTakeSlot(item)}
                disabled={isTaken}
            >
                <View style={styles.slotLeft}>
                    <View style={[styles.slotNumberBg, isTaken && styles.slotNumberBgTaken]}>
                        <Text style={styles.slotNumber}>{item.slot_number}</Text>
                    </View>
                    <Text style={styles.slotLabel}>{item.slot_number}. {t('common.juz')}</Text>
                </View>

                <View style={styles.slotRight}>
                    {isTaken ? (
                        <View style={styles.takenInfo}>
                            <CheckCircle2 size={16} color="#4CAF50" />
                            <Text style={styles.takenText}>{t('completed')}</Text>
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, ramadanModeEnabled && { color: '#FFF' }]} numberOfLines={1}>
                        {title}
                    </Text>
                    <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                        <Share2 size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    <BookOpen size={24} color={COLORS.primary} />
                    <Text style={styles.infoText}>{t('community.hatim_slots_desc')}</Text>
                </View>

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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default HatimDetailScreen;
