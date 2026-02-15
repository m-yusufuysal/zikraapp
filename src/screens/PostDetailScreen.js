import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CommunityPostCard from '../components/CommunityPostCard';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { getPostById, interactWithPost, reportPost, translateText } from '../services/CommunityService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

import { LinearGradient } from 'expo-linear-gradient';
import { useThrottledHaptic } from '../hooks/useThrottledHaptic';

const PostDetailScreen = ({ navigation, route }) => {
    const { postId } = route.params;
    const { t, i18n } = useTranslation();
    const { nightModeEnabled } = useTheme();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // Zikirmatik State
    const [supportCount, setSupportCount] = useState(0);
    const [submittingSupport, setSubmittingSupport] = useState(false);
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [isInteracted, setIsInteracted] = useState(false); // Track session interaction

    const triggerHaptic = useThrottledHaptic();

    useEffect(() => {
        loadPost();
    }, [postId]);

    const loadPost = async () => {
        setLoading(true);
        const data = await getPostById(postId);
        if (data) {
            setPost(data);
        } else {
            Alert.alert(t('error'), t('community.post_not_found'));
            navigation.goBack();
        }
        setLoading(false);
    };

    const handleInteract = async () => {
        if (isInteracted) return; // Prevent double click in session

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            return;
        }

        // If it's a dhikr with a target, show the pledge/support modal
        if (post?.type === 'dhikr' && post.target_count > 0) {
            setSupportCount(0);
            setShowPledgeModal(true);
            return;
        }

        const interactionType = post?.type === "dhikr" ? "prayed" : "amen";
        const success = await interactWithPost(postId, user.id, interactionType);

        if (success) {
            const increment = 1;
            setPost(prev => ({ ...prev, current_count: (parseInt(prev.current_count) || 0) + increment }));
            setIsInteracted(true); // Disable button locally
            // Notify other screens
            DeviceEventEmitter.emit('communityPostUpdate', { postId, increment });
        }
    };

    const handleSupportIncrement = () => {
        triggerHaptic();
        setSupportCount(prev => prev + 1);
    };

    const handleSupportSubmit = async () => {
        if (submittingSupport) return;
        if (supportCount <= 0) {
            setShowPledgeModal(false);
            return;
        }

        setSubmittingSupport(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            setSubmittingSupport(false);
            return;
        }

        const success = await interactWithPost(postId, user.id, 'prayed', supportCount);

        if (success) {
            setPost(prev => ({ ...prev, current_count: (parseInt(prev.current_count) || 0) + supportCount }));
            setIsInteracted(true);

            // Notify other screens
            DeviceEventEmitter.emit('communityPostUpdate', { postId, increment: supportCount });

            setShowPledgeModal(false);
            setTimeout(() => {
                Alert.alert(t('thanks'), t('community.pledge_success'));
            }, 500);
        } else {
            Alert.alert(t('error'), t('community.report_error'));
        }
        setSubmittingSupport(false);
    };

    const handleReport = (postId) => {
        Alert.alert(
            t('community.report_title'),
            t('community.report_question'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('community.report_reason_inappropriate'), onPress: () => submitReport(postId, t('community.report_reason_inappropriate')) },
                { text: t('community.report_reason_spam'), onPress: () => submitReport(postId, t('community.report_reason_spam')) },
            ]
        );
    };

    const submitReport = async (postId, reason) => {
        const { data: { user } } = await supabase.auth.getUser();
        const success = await reportPost(postId, user.id, reason);
        if (success) Alert.alert(t('thanks'), t('community.report_success'));
        else Alert.alert(t('error'), t('community.report_error'));
    };

    const handleTranslate = async (postItem) => {
        if (postItem.isTranslated) {
            setPost(prev => ({ ...prev, isShowingTranslated: !prev.isShowingTranslated }));
            return;
        }

        const targetLang = (i18n.language || 'en').split('-')[0];
        const [tTitle, tContent] = await Promise.all([
            translateText(postItem.title, targetLang, postItem.language_code),
            translateText(postItem.content || postItem.description, targetLang, postItem.language_code)
        ]);

        if (tTitle || tContent) {
            setPost(prev => ({
                ...prev,
                translatedTitle: tTitle || prev.title,
                translatedContent: tContent || (prev.content || prev.description),
                isTranslated: true,
                isShowingTranslated: true
            }));
        }
    };

    return (
        <RamadanBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('community.post_detail')}</Text>
                    <View style={{ width: 44 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        {post && (
                            <CommunityPostCard
                                item={post}
                                onPressHatim={(hatim) => navigation.navigate('HatimDetail', { hatimId: hatim.id, title: hatim.title, city: hatim.city })}
                                onInteract={handleInteract}
                                onReport={handleReport}
                                onTranslate={handleTranslate}
                                isInteracted={isInteracted} // Pass interaction state to card
                            />
                        )}
                    </ScrollView>
                )}

                {/* New Zikirmatik Support Modal */}
                <Modal visible={showPledgeModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.supportModalContent, nightModeEnabled && { backgroundColor: '#1A1A1A' }]}>
                            <View style={styles.modalHandle} />
                            <Text style={[styles.supportModalTitle, nightModeEnabled && { color: '#FFF' }]}>{t('community.support_title')}</Text>
                            <Text style={styles.supportModalSubtitle}>{t('community.support_subtitle')}</Text>

                            <View style={styles.miniRingContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[styles.miniRingButton, { backgroundColor: COLORS.primary }]}
                                    onPress={handleSupportIncrement}
                                >
                                    <View style={styles.miniRingBody}>
                                        <View style={styles.miniRingScreen}>
                                            <View style={styles.miniLcdContent}>
                                                <Text style={styles.miniLcdZeros}>
                                                    {supportCount.toString().padStart(3, '0')}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.miniRingBtnOuter}>
                                            <LinearGradient
                                                colors={['#333', '#000']}
                                                style={styles.miniRingBtnInner}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.supportModalFooter}>
                                <TouchableOpacity
                                    style={styles.supportCancelBtn}
                                    onPress={() => setShowPledgeModal(false)}
                                >
                                    <Text style={styles.supportCancelText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.supportConfirmBtn, (supportCount === 0 || submittingSupport) && { opacity: 0.6 }]}
                                    onPress={handleSupportSubmit}
                                    disabled={supportCount === 0 || submittingSupport}
                                >
                                    {submittingSupport ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.supportConfirmText}>{t('community.confirm_pledge')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalHandle: {
        width: 40,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    // Mini Zikirmatik Support Styles
    supportModalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        width: '100%',
    },
    supportModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    supportModalSubtitle: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 24,
    },
    miniRingContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    miniRingButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniRingBody: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    miniRingScreen: {
        width: 90,
        height: 40,
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 2,
        marginBottom: 12,
    },
    miniLcdContent: {
        flex: 1,
        backgroundColor: '#b0bec5',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniLcdZeros: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 18,
        color: '#263238',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    miniRingBtnOuter: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    miniRingBtnInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    supportModalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    supportCancelBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
    },
    supportCancelText: {
        color: '#999',
        fontWeight: 'bold',
        fontSize: 16,
    },
    supportConfirmBtn: {
        flex: 2,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: COLORS.primary,
    },
    supportConfirmText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default PostDetailScreen;
