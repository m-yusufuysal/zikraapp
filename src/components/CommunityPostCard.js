import { BookOpen, CheckCircle2, ChevronRight, Flag, Heart, Languages, Share2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../utils/theme';

const CommunityPostCard = ({
    item,
    onPressHatim,
    onInteract,
    onReport,
    onTranslate,
    isInteracted,
    currentUserId,
    nightModeEnabled
}) => {
    const { t, i18n } = useTranslation();

    const currentAppLang = (i18n.language || 'tr').split('-')[0];
    const postLang = (item.language_code || 'tr').split('-')[0];
    const needsTranslation = postLang !== currentAppLang;
    const displayTitle = item.isShowingTranslated ? (item.translatedTitle || item.title) : item.title;
    const displayContent = item.isShowingTranslated ? (item.translatedContent || item.description) : (item.content || item.description);
    const displayCity = item.isShowingTranslated ? (item.translatedCity || item.city) : item.city;
    const buttonText = item.isShowingTranslated ? t('community.show_original') : t('community.translate');
    const isCompleted = item.type === 'hatim' ? item.status === 'completed' :
        (item.type === 'dhikr' && item.target_count > 0 && item.current_count >= item.target_count);

    const handleShare = async () => {
        try {
            const location = [item.city, item.location].filter(Boolean).join(', ');
            const shareMsg = item.type === 'hatim'
                ? t('community.share_hatim_msg', {
                    title: displayTitle,
                    name: item.userName || t('common.someone'),
                    location: location || t('common.location_missing')
                })
                : t('community.share_post_msg', {
                    title: displayTitle,
                    name: item.userName || t('common.someone'),
                    location: location || t('common.location_missing')
                });

            await Share.share({
                message: shareMsg,
            });
        } catch (error) {
            console.error('Share Error:', error.message);
        }
    };

    const renderHeader = () => (
        <View style={styles.postHeader}>
            <View style={styles.headerLeft}>
                <View style={[styles.userBadge, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                    {item.avatar_url ? (
                        <Image
                            source={{ uri: item.avatar_url }}
                            style={styles.userAvatar}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={[styles.userInitial, nightModeEnabled && { color: '#FFD700' }]}>{item.userName?.charAt(0) || '?'}</Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.postUserName, nightModeEnabled && { color: '#FFF' }]} numberOfLines={1}>{item.userName}</Text>
                        {item.badge_emoji && <Text style={{ fontSize: 14 }}>{item.badge_emoji}</Text>}
                    </View>
                    {displayCity && <Text style={[styles.postLocation, nightModeEnabled && { color: 'rgba(255, 255, 255, 0.5)' }]} numberOfLines={1}>{displayCity}</Text>}
                    <Text style={[styles.postTime, nightModeEnabled && { color: 'rgba(255, 255, 255, 0.4)' }]}>
                        {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
            <View style={[styles.typeBadge, {
                backgroundColor: nightModeEnabled ? 'rgba(255, 255, 255, 0.05)' : (
                    item.type === 'dua' ? '#3498db20' :
                        item.type === 'dhikr' ? '#f1c40f20' : '#2ecc7120'
                ),
                borderColor: nightModeEnabled ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderWidth: nightModeEnabled ? 1 : 0
            }]}>
                <Text style={[styles.typeBadgeText, {
                    color: nightModeEnabled ? '#FFD700' : (
                        item.type === 'dua' ? '#3498db' :
                            item.type === 'dhikr' ? '#f39c12' : '#27ae60'
                    )
                }]}>
                    {t(`community.type_${item.type}`).toUpperCase()}
                </Text>
            </View>
        </View>
    );

    if (item.type === 'hatim') {
        return (
            <TouchableOpacity
                style={[
                    styles.postCard,
                    styles.hatimCard,
                    nightModeEnabled && {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        shadowOpacity: 0,
                        elevation: 0,
                        borderLeftColor: '#FFD700'
                    }
                ]}
                onPress={() => onPressHatim(item)}
            >
                {renderHeader()}

                <View style={styles.hatimHeader}>
                    <BookOpen size={20} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                    <Text style={[styles.hatimLabel, nightModeEnabled && { color: '#FFD700' }]}>{t('community.kollektif_hatim')}</Text>
                </View>
                <Text style={[styles.postTitle, nightModeEnabled && { color: '#FFF' }]}>{displayTitle}</Text>
                <Text style={[styles.postContent, nightModeEnabled && { color: 'rgba(255, 255, 255, 0.8)' }]}>{displayContent}</Text>

                <View style={styles.postActionsRow}>
                    {needsTranslation && (
                        <TouchableOpacity style={styles.translateBtn} onPress={() => onTranslate(item)}>
                            <Languages size={14} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                            <Text style={[styles.translateText, nightModeEnabled && { color: '#FFD700' }]}>{buttonText}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.shareBtnInline} onPress={handleShare}>
                        <Share2 size={14} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                        <Text style={[styles.translateText, nightModeEnabled && { color: '#FFD700' }]}>{t('common.share')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.hatimFooter, nightModeEnabled && { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        {isCompleted ? (
                            <View style={[styles.completedBadgeLarge, nightModeEnabled && { backgroundColor: 'rgba(39, 174, 96, 0.1)', borderColor: 'rgba(39, 174, 96, 0.2)' }]}>
                                <CheckCircle2 size={16} color="#27ae60" />
                                <Text style={styles.completedBadgeText}>{t('community.hatim_completed')}</Text>
                            </View>
                        ) : (
                            <Text style={[styles.hatimStatus, nightModeEnabled && { backgroundColor: 'rgba(39, 174, 96, 0.1)', color: '#2ecc71' }]}>
                                {t('community.hatim_open')}
                            </Text>
                        )}
                        {currentUserId !== item.user_id && currentUserId !== item.created_by && (
                            <TouchableOpacity onPress={() => onReport(item.id)} style={styles.miniReportBtn}>
                                <Flag size={14} color="#f1c40f" fill="#f1c40f" />
                                <Text style={styles.miniReportText}>{t('community.report')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ChevronRight size={20} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                </View>

                {isCompleted && (
                    <View style={styles.checkmarkOverlay}>
                        <CheckCircle2 size={70} color="#27ae60" />
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[
            styles.postCard,
            nightModeEnabled && {
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                shadowOpacity: 0,
                elevation: 0,
                borderWidth: 1
            }
        ]}>
            {renderHeader()}

            <Text style={[styles.postTitle, nightModeEnabled && { color: '#FFD700' }]}>{displayTitle}</Text>
            <Text style={[styles.postContent, nightModeEnabled && { color: '#FFF' }]}>{displayContent}</Text>

            <View style={styles.postActionsRow}>
                {needsTranslation && (
                    <TouchableOpacity style={styles.translateBtn} onPress={() => onTranslate(item)}>
                        <Languages size={14} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                        <Text style={[styles.translateText, nightModeEnabled && { color: '#FFD700' }]}>{buttonText}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.shareBtnInline} onPress={handleShare}>
                    <Share2 size={14} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                    <Text style={[styles.translateText, nightModeEnabled && { color: '#FFD700' }]}>{t('common.share')}</Text>
                </TouchableOpacity>
            </View>

            {item.type === 'dhikr' && item.target_count > 0 && (
                <View style={[styles.dhikrProgressContainer, nightModeEnabled && { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, nightModeEnabled && { color: 'rgba(255,255,255,0.5)' }]}>{t('dhikr.step')}</Text>
                        <Text style={[styles.progressValues, nightModeEnabled && { color: '#FFD700' }]}>{Math.min(item.current_count, item.target_count)} / {item.target_count}</Text>
                    </View>
                    <View style={[styles.progressBarBg, nightModeEnabled && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, (item.current_count / item.target_count) * 100)}%` }, nightModeEnabled && { backgroundColor: '#FFD700' }]} />
                    </View>
                </View>
            )}

            <View style={[styles.postFooter, isCompleted && { opacity: 0.6 }, nightModeEnabled && { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                {isCompleted ? (
                    <View style={[styles.completedBadgeLarge, nightModeEnabled && { backgroundColor: 'rgba(39, 174, 96, 0.1)', borderColor: 'rgba(39, 174, 96, 0.2)' }]}>
                        <CheckCircle2 size={18} color="#27ae60" />
                        <Text style={styles.completedBadgeText}>{t('community.hatim_completed')}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.amenBtn, (isInteracted && item.type === 'dua') && { opacity: 0.6 }]}
                        onPress={() => onInteract(item.id)}
                        disabled={isInteracted && item.type === 'dua'}
                    >
                        {item.type === 'dhikr' ? (
                            <Text style={{ fontSize: 18 }}>📿</Text>
                        ) : (
                            <Heart
                                size={18}
                                color={isInteracted || item.current_count > 0 ? "#e74c3c" : (nightModeEnabled ? "rgba(255,255,255,0.3)" : "#e74c3c")}
                                fill={isInteracted || item.current_count > 0 ? "#e74c3c" : "transparent"}
                            />
                        )}

                        <Text style={[styles.amenText, nightModeEnabled && { color: 'rgba(255,255,255,0.7)' }]}>
                            {item.type === 'dua'
                                ? t('community.amen')
                                : t('community.support')}
                        </Text>
                        <Text style={[styles.countBadge, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' }]}>{item.current_count}</Text>
                    </TouchableOpacity>
                )}

                {currentUserId !== item.user_id && currentUserId !== item.created_by && (
                    <TouchableOpacity onPress={() => onReport(item.id)} style={styles.miniReportBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Flag size={14} color="#f1c40f" fill="#f1c40f" />
                    </TouchableOpacity>
                )}
            </View>

            {isCompleted && (
                <View style={styles.checkmarkOverlay}>
                    <CheckCircle2 size={70} color="#27ae60" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    postCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    hatimCard: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    hatimHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    hatimLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
    hatimStatus: { fontSize: 12, color: '#27ae60', fontWeight: 'bold', backgroundColor: '#27ae6015', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    hatimFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 15 },
    postHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 15 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
    typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', minWidth: 60, alignItems: 'center' },
    typeBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    userBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    userAvatar: { width: '100%', height: '100%' },
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
    completedBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#27ae6015',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27ae6030'
    },
    checkmarkOverlay: {
        position: 'absolute',
        right: 20,
        top: '35%',
        opacity: 0.6,
        zIndex: 100
    },
    completedBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#27ae60'
    }
});

export default React.memo(CommunityPostCard, (prevProps, nextProps) => {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.current_count === nextProps.item.current_count &&
        prevProps.isInteracted === nextProps.isInteracted &&
        prevProps.item.is_hatim_completed === nextProps.item.is_hatim_completed &&
        prevProps.item.isShowingTranslated === nextProps.item.isShowingTranslated &&
        prevProps.item.translatedTitle === nextProps.item.translatedTitle &&
        prevProps.item.translatedContent === nextProps.item.translatedContent &&
        prevProps.item.translatedCity === nextProps.item.translatedCity
    );
});
