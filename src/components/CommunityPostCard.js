import { BookOpen, ChevronRight, Flag, Heart, Languages, Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../utils/theme';

const CommunityPostCard = ({
    item,
    onPressHatim,
    onInteract,
    onReport,
    onTranslate
}) => {
    const { t, i18n } = useTranslation();

    const currentAppLang = (i18n.language || 'tr').split('-')[0];
    const postLang = (item.language_code || 'tr').split('-')[0];
    const needsTranslation = postLang !== currentAppLang;
    const displayTitle = item.isShowingTranslated ? (item.translatedTitle || item.title) : item.title;
    const displayContent = item.isShowingTranslated ? (item.translatedContent || item.description) : (item.content || item.description);
    const buttonText = item.isShowingTranslated ? t('community.show_original') : t('community.translate');

    const handleShare = async () => {
        try {
            const shareMsg = item.type === 'hatim'
                ? t('community.share_hatim_msg', { title: displayTitle })
                : t('community.share_post_msg', { title: displayTitle });

            await Share.share({
                message: shareMsg,
            });
        } catch (error) {
            console.error('Share Error:', error.message);
        }
    };

    if (item.type === 'hatim') {
        return (
            <TouchableOpacity
                style={[styles.postCard, styles.hatimCard]}
                onPress={() => onPressHatim(item)}
            >
                <View style={styles.hatimHeader}>
                    <BookOpen size={24} color={COLORS.primary} />
                    <Text style={styles.hatimLabel}>{t('community.kollektif_hatim')}</Text>
                </View>
                <Text style={styles.postTitle}>{displayTitle}</Text>
                <Text style={styles.postContent}>{displayContent}</Text>

                <View style={styles.postActionsRow}>
                    {needsTranslation && (
                        <TouchableOpacity style={styles.translateBtn} onPress={() => onTranslate(item)}>
                            <Languages size={14} color={COLORS.primary} />
                            <Text style={styles.translateText}>{buttonText}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.shareBtnInline} onPress={handleShare}>
                        <Share2 size={14} color={COLORS.primary} />
                        <Text style={styles.translateText}>{t('common.share')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.hatimFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Text style={styles.hatimStatus}>
                            {item.status === 'open' ? t('community.hatim_open') : t('community.hatim_completed')}
                        </Text>
                        <TouchableOpacity onPress={() => onReport(item.id)} style={styles.miniReportBtn}>
                            <Flag size={14} color="#f1c40f" fill="#f1c40f" />
                            <Text style={styles.miniReportText}>{t('community.report')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ChevronRight size={20} color={COLORS.primary} />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.userBadge}>
                        <Text style={styles.userInitial}>{item.userName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.postUserName} numberOfLines={1}>{item.userName}</Text>
                        {item.city && <Text style={styles.postLocation} numberOfLines={1}>{item.city}</Text>}
                        <Text style={styles.postTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'dua' ? '#3498db20' : '#f1c40f20' }]}>
                    <Text style={[styles.typeBadgeText, { color: item.type === 'dua' ? '#3498db' : '#f39c12' }]}>
                        {item.type === 'dua' ? t('community.type_dua').toUpperCase() : t('community.type_dhikr').toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text style={styles.postTitle}>{displayTitle}</Text>
            <Text style={styles.postContent}>{displayContent}</Text>

            <View style={styles.postActionsRow}>
                {needsTranslation && (
                    <TouchableOpacity style={styles.translateBtn} onPress={() => onTranslate(item)}>
                        <Languages size={14} color={COLORS.primary} />
                        <Text style={styles.translateText}>{buttonText}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.shareBtnInline} onPress={handleShare}>
                    <Share2 size={14} color={COLORS.primary} />
                    <Text style={styles.translateText}>{t('common.share')}</Text>
                </TouchableOpacity>
            </View>

            {item.type === 'dhikr' && item.target_count > 0 && (
                <View style={styles.dhikrProgressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>{t('dhikr.step')}</Text>
                        <Text style={styles.progressValues}>{item.current_count} / {item.target_count}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, (item.current_count / item.target_count) * 100)}%` }]} />
                    </View>
                </View>
            )}

            <View style={styles.postFooter}>
                <TouchableOpacity
                    style={styles.amenBtn}
                    onPress={() => onInteract(item.id)}
                >
                    <Heart size={18} color="#e74c3c" fill={item.current_count > 0 ? "#e74c3c" : "transparent"} />
                    <Text style={styles.amenText}>{item.type === 'dua' ? t('community.amen') : t('community.support')}</Text>
                    <Text style={styles.countBadge}>{item.current_count}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onReport(item.id)} style={styles.miniReportBtn}>
                    <Flag size={14} color="#f1c40f" fill="#f1c40f" />
                    <Text style={styles.miniReportText}>{t('community.report')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    postCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    hatimCard: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    hatimHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    hatimLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
    hatimStatus: { fontSize: 12, color: '#27ae60', fontWeight: 'bold', backgroundColor: '#27ae6015', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    hatimFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    postHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 15 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
    typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', minWidth: 60, alignItems: 'center' },
    typeBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    userBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
    userInitial: { color: COLORS.primary, fontWeight: 'bold' },
    postUserName: { fontSize: 14, fontWeight: '700', color: COLORS.matteBlack },
    postLocation: { fontSize: 11, color: '#666', marginTop: 1 },
    postTime: { fontSize: 10, color: '#999', marginTop: 1 },
    postTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
    postContent: { fontSize: 15, color: '#555', lineHeight: 22 },
    dhikrProgressContainer: { marginTop: 15, backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 12, color: '#777', fontWeight: '600' },
    progressValues: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold' },
    progressBarBg: { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
    postFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    amenBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    amenText: { fontSize: 14, fontWeight: '700', color: '#555' },
    countBadge: { fontSize: 12, color: COLORS.primary, backgroundColor: COLORS.primary + '10', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
    miniReportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    miniReportText: { fontSize: 11, color: '#f1c40f', fontWeight: '800' },
    translateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start', padding: 4 },
    translateText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    postActionsRow: { flexDirection: 'row', gap: 15, alignItems: 'center' },
    shareBtnInline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start', padding: 4 },
});

export default CommunityPostCard;
