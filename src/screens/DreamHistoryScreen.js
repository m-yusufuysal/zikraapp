import { useIsFocused } from '@react-navigation/native';
import { ChevronLeft, Moon, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

const DreamHistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { nightModeEnabled } = useTheme();
    const isFocused = useIsFocused();

    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDream, setSelectedDream] = useState(null);

    const fetchDreams = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('dream_interpretations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setDreams(data || []);
        } catch (error) {
            console.error('[DreamHistory] Fetch error:', error);
            Alert.alert(t('error'), error.message);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (isFocused) fetchDreams();
    }, [isFocused, fetchDreams]);

    const handleDelete = (dreamId) => {
        Alert.alert(
            t('dream.history_delete_title') || 'Sil',
            t('dream.history_delete_confirm') || 'Bu rüya yorumunu silmek istediğinize emin misiniz?',
            [
                { text: t('cancel') || 'İptal', style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('dream_interpretations')
                                .delete()
                                .eq('id', dreamId);
                            if (error) throw error;
                            setDreams(prev => prev.filter(d => d.id !== dreamId));
                            if (selectedDream?.id === dreamId) setSelectedDream(null);
                        } catch (error) {
                            Alert.alert(t('error'), error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleViewDream = (dream) => {
        if (selectedDream?.id === dream.id) {
            setSelectedDream(null);
        } else {
            setSelectedDream(dream);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDreamTitle = (dreamText) => {
        if (!dreamText) return '...';
        // Take first 60 characters as title
        const cleaned = dreamText.replace(/\n/g, ' ').trim();
        return cleaned.length > 60 ? cleaned.substring(0, 60) + '...' : cleaned;
    };

    const renderDreamItem = ({ item }) => {
        const isSelected = selectedDream?.id === item.id;
        const isCompleted = item.status === 'completed';

        return (
            <TouchableOpacity
                style={[styles.dreamCard, isSelected && styles.dreamCardSelected]}
                onPress={() => handleViewDream(item)}
                activeOpacity={0.7}
            >
                <View style={styles.dreamCardHeader}>
                    <View style={styles.dreamCardIcon}>
                        <Moon size={16} color="#FFD700" fill="#FFD700" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.dreamTitle} numberOfLines={2}>
                            {getDreamTitle(item.dream_text)}
                        </Text>
                        <Text style={styles.dreamDate}>{formatDate(item.created_at)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 size={16} color="rgba(255,100,100,0.7)" />
                    </TouchableOpacity>
                </View>

                {/* Expanded Detail */}
                {isSelected && isCompleted && (
                    <View style={styles.dreamDetail}>
                        {/* Symbols */}
                        {item.symbols && item.symbols.length > 0 && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>
                                    {t('dream.symbols') || '🔮 Semboller'}
                                </Text>
                                {item.symbols.map((sym, idx) => (
                                    <View key={idx} style={styles.symbolItem}>
                                        <Text style={styles.symbolName}>• {sym.symbol}</Text>
                                        <Text style={styles.symbolMeaning}>{sym.meaning}</Text>
                                        {sym.source && (
                                            <Text style={styles.symbolSource}>📖 {sym.source}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Interpretation */}
                        {item.interpretation && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>
                                    {t('dream.interpretation') || '📜 Yorum'}
                                </Text>
                                <Text style={styles.detailText}>{item.interpretation}</Text>
                            </View>
                        )}

                        {/* Personal Message */}
                        {item.personal_message && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>
                                    {t('dream.personal_message') || '💫 Kişisel Mesaj'}
                                </Text>
                                <Text style={styles.detailText}>{item.personal_message}</Text>
                            </View>
                        )}

                        {/* Warning */}
                        {item.warning && (
                            <View style={[styles.detailSection, styles.warningSection]}>
                                <Text style={styles.detailLabel}>
                                    {t('dream.warning') || '⚠️ Uyarı'}
                                </Text>
                                <Text style={styles.detailText}>{item.warning}</Text>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <RamadanBackground forceRamadanAppearance={true} customStandardGradient={['#0f0c29', '#302b63', '#24243e']}>
            <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
                {/* Header */}
                <View style={[styles.header, isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={28} color="#FFD700" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {t('dream.history_title') || '📖 Rüya Geçmişim'}
                    </Text>
                    <View style={{ width: 36 }} />
                </View>

                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#FFD700" />
                    </View>
                ) : dreams.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Moon size={48} color="rgba(255,255,255,0.2)" />
                        <Text style={styles.emptyText}>
                            {t('dream.history_empty') || 'Henüz rüya yorumun yok.\nİlk rüyanı yorumlamak için geri dön!'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={dreams}
                        renderItem={renderDreamItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[
                            styles.listContent,
                            isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }
                        ]}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    dreamCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    dreamCardSelected: {
        borderColor: 'rgba(255,215,0,0.3)',
        backgroundColor: 'rgba(255,215,0,0.05)',
    },
    dreamCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dreamCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,215,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dreamTitle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    dreamDate: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 4,
    },
    deleteBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    dreamDetail: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    detailSection: {
        marginBottom: 16,
    },
    detailLabel: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    detailText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        lineHeight: 22,
    },
    symbolItem: {
        marginBottom: 10,
        paddingLeft: 4,
    },
    symbolName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    symbolMeaning: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        lineHeight: 20,
        marginTop: 2,
        paddingLeft: 12,
    },
    symbolSource: {
        color: 'rgba(255,215,0,0.5)',
        fontSize: 12,
        marginTop: 2,
        paddingLeft: 12,
        fontStyle: 'italic',
    },
    warningSection: {
        backgroundColor: 'rgba(255,150,0,0.05)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,150,0,0.15)',
    },
});

export default DreamHistoryScreen;
