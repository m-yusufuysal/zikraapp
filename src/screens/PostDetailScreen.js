import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CommunityPostCard from '../components/CommunityPostCard';
import RamadanBackground from '../components/RamadanBackground';
import { getPostById, interactWithPost, reportPost, translateText } from '../services/CommunityService';
import { supabase } from '../services/supabase';
import { COLORS } from '../utils/theme';

const PostDetailScreen = ({ navigation, route }) => {
    const { postId } = route.params;
    const { t, i18n } = useTranslation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pledge State
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [pledgeAmount, setPledgeAmount] = useState('100');
    const [pledging, setPledging] = useState(false);

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

    const handleInteract = async (postId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            return;
        }

        // If it's a dhikr with a target, show the pledge modal
        if (post?.type === 'dhikr' && post.target_count > 0) {
            setPledgeAmount('100');
            setShowPledgeModal(true);
            return;
        }

        const interactionType = post?.type === "dhikr" ? "prayed" : "amen";
        const success = await interactWithPost(postId, user.id, interactionType);

        if (success) {
            setPost(prev => ({ ...prev, current_count: (prev.current_count || 0) + 1 }));
        }
    };

    const handlePledge = async () => {
        if (pledging) return;
        const amount = parseInt(pledgeAmount) || 0;
        if (amount <= 0) {
            Alert.alert(t('error'), t('dhikr.select_msg'));
            return;
        }

        setPledging(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            setPledging(false);
            return;
        }

        const success = await interactWithPost(postId, user.id, 'prayed', amount);

        if (success) {
            setPost(prev => ({ ...prev, current_count: (prev.current_count || 0) + amount }));
            setShowPledgeModal(false);
            Alert.alert(t('thanks'), t('community.juz_taken_success'));
        } else {
            Alert.alert(t('error'), t('community.report_error'));
        }
        setPledging(false);
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
                            />
                        )}
                    </ScrollView>
                )}

                {/* Pledge Modal */}
                <Modal visible={showPledgeModal} animationType="fade" transparent>
                    <TouchableWithoutFeedback onPress={() => setShowPledgeModal(false)}>
                        <View style={styles.modalOverlay}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
                                <View style={[styles.modalContent, { paddingBottom: Platform.OS === 'ios' ? 40 : 20 }, ramadanModeEnabled && { backgroundColor: '#1A1A1A' }]}>
                                    <View style={styles.modalHandle} />
                                    <Text style={[styles.modalTitle, ramadanModeEnabled && { color: '#FFF' }]}>{t('community.pledge_title')}</Text>
                                    <Text style={[styles.sectionLabel, { textAlign: 'center', marginBottom: 20 }]}>{t('community.pledge_desc')}</Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('community.input_pledge')}
                                        value={pledgeAmount}
                                        onChangeText={setPledgeAmount}
                                        keyboardType="numeric"
                                        autoFocus
                                        placeholderTextColor="#999"
                                    />

                                    <TouchableOpacity
                                        style={[styles.confirmBtn, pledging && { opacity: 0.7 }]}
                                        onPress={handlePledge}
                                        disabled={pledging}
                                    >
                                        {pledging ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>{t('community.confirm_pledge')}</Text>}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ marginTop: 15, alignItems: 'center', padding: 10 }}
                                        onPress={() => setShowPledgeModal(false)}
                                    >
                                        <Text style={{ color: '#999', fontWeight: '600' }}>{t('common.cancel')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                    </TouchableWithoutFeedback>
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
    content: { padding: 20 }
});

export default PostDetailScreen;
