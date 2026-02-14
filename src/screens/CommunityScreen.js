import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ArrowLeft, Bell, HeartHandshake, Lock, Plus, User } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommunityPostCard from '../components/CommunityPostCard';
import RamadanBackground from '../components/RamadanBackground';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { createCommunityHatim, createCommunityPost, getCommunityPosts, getHatimGroups, interactWithPost, reportPost, translateText } from '../services/CommunityService';
import { moderateContent } from '../services/ModerationService';
import { supabase } from '../services/supabase';
import { getLocationCache } from '../utils/storage';
import { COLORS } from '../utils/theme';

const CommunityScreen = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { ramadanModeEnabled } = useTheme();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create form state
    const [postType, setPostType] = useState('dua');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [dhikrTarget, setDhikrTarget] = useState('');
    const [myInitialCount, setMyInitialCount] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([]);

    const [creating, setCreating] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [userCity, setUserCity] = useState(null);
    const [showName, setShowName] = useState(false);

    const [interactionHistory, setInteractionHistory] = useState([]);
    const [warningCount, setWarningCount] = useState(0);
    const [bannedUntil, setBannedUntil] = useState(null);

    // Pledge State
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [pledgeAmount, setPledgeAmount] = useState('100');
    const [activePledgePostId, setActivePledgePostId] = useState(null);
    const [pledging, setPledging] = useState(false);

    const flatListRef = useRef(null);

    // Animation & Gesture for Bottom Sheet
    const panY = useRef(new Animated.Value(0)).current;
    const resetPan = () => Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
    const closeBottomSheet = () => {
        Animated.timing(panY, { toValue: 1000, duration: 300, useNativeDriver: true }).start(() => {
            setShowCreateModal(false);
            panY.setValue(0);
        });
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) panY.setValue(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 100) closeBottomSheet();
            else resetPan();
        }
    });

    const { unreadCount, clearUnreadCount } = useNotifications();

    useFocusEffect(
        useCallback(() => {
            checkPremium();
            loadBanStatus();
            loadPosts();
        }, [filter])
    );

    useEffect(() => {
        loadPosts();
        detectCity();
    }, [filter]);

    // Highlight Logic
    useEffect(() => {
        if (route.params?.highlightPostId && posts.length > 0) {
            const index = posts.findIndex(p => p.id === route.params.highlightPostId);
            if (index !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
                }, 600);
            }
        }
    }, [route.params?.highlightPostId, posts]);

    const detectCity = async () => {
        try {
            const cached = await getLocationCache();
            if (cached) {
                setUserCity(cached);
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const rev = await Location.reverseGeocodeAsync(location.coords);
                if (rev && rev[0]) {
                    const city = rev[0].city || rev[0].district || rev[0].subregion;
                    const country = rev[0].country;
                    const rawCity = city ? `${city} / ${country}` : country;

                    // Set raw city immediately
                    setUserCity(rawCity);

                    // Translate to app language if not in Turkish (non-blocking)
                    if (i18n.language && !i18n.language.startsWith('tr')) {
                        translateText(rawCity, i18n.language, 'auto')
                            .then(translated => { if (translated) setUserCity(translated); })
                            .catch(() => { });
                    }

                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        supabase.from('profiles').update({ location: rawCity }).eq('id', user.id).then(({ error }) => {
                            if (error) console.log('Location update failed:', error.message);
                        });
                    }
                }
            }
        } catch (e) {
            console.error('City detection error:', e);
        }
    };

    const loadBanStatus = async () => {
        const until = await AsyncStorage.getItem('community_banned_until');
        if (until) {
            const banDate = new Date(until);
            if (banDate > new Date()) {
                setBannedUntil(banDate);
            } else {
                await AsyncStorage.removeItem('community_banned_until');
            }
        }
    };

    const checkPremium = async () => {
        const premium = await AsyncStorage.getItem('isPremium');
        setIsPremium(premium === 'true');
    };

    const loadPosts = async () => {
        setLoading(true);
        try {
            if (filter === 'hatim') {
                const hatims = await getHatimGroups();
                setPosts(hatims.map(h => ({ ...h, type: 'hatim' })));
            } else if (filter === 'all') {
                const [postsData, hatimsData] = await Promise.all([
                    getCommunityPosts('all'),
                    getHatimGroups()
                ]);
                const combined = [
                    ...postsData,
                    ...hatimsData.map(h => ({
                        ...h,
                        type: 'hatim',
                        userName: t('community.hatim_group'),
                        content: h.description
                    }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setPosts(combined);
            } else {
                const data = await getCommunityPosts(filter);
                setPosts(data);
            }
        } catch (e) {
            console.error('loadPosts Error:', e);
        }
        setLoading(false);
    };

    const handleInteract = async (postId) => {
        const now = Date.now();
        if (bannedUntil && new Date(bannedUntil) > new Date()) {
            const remainingMins = Math.ceil((new Date(bannedUntil) - new Date()) / 60000);
            Alert.alert(t('community.access_restricted'), t('community.ban_msg', { minutes: remainingMins }));
            return;
        }

        const recentInteractions = interactionHistory.filter(time => now - time < 3000);
        if (recentInteractions.length >= 3) {
            const newWarningCount = warningCount + 1;
            setWarningCount(newWarningCount);
            if (newWarningCount >= 3) {
                const banExpiry = new Date(now + 15 * 60000);
                setBannedUntil(banExpiry);
                await AsyncStorage.setItem('community_banned_until', banExpiry.toISOString());
                Alert.alert(t('community.account_restricted'), t('community.ban_triggered_msg'));
            } else {
                Alert.alert(t('community.slow_down'), t('community.rate_limit_warning', { count: newWarningCount }));
            }
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            return;
        }

        const post = posts.find(p => p.id === postId);

        // If it's a dhikr with a target, show the pledge modal
        if (post?.type === 'dhikr' && post.target_count > 0) {
            setInteractionHistory(prev => [...prev.filter(time => now - time < 5000), now]);
            setActivePledgePostId(postId);
            setPledgeAmount('100');
            setShowPledgeModal(true);
            return;
        }

        // Otherwise proceed with standard +1 interaction
        setInteractionHistory(prev => [...prev.filter(time => now - time < 5000), now]);
        const interactionType = post?.type === "dhikr" ? "prayed" : "amen";
        const success = await interactWithPost(postId, user.id, interactionType);
        if (success) {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, current_count: p.current_count + 1 } : p));
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

        const success = await interactWithPost(activePledgePostId, user.id, 'prayed', amount);

        if (success) {
            setPosts(prev => prev.map(p => p.id === activePledgePostId ? { ...p, current_count: (p.current_count || 0) + amount } : p));
            setShowPledgeModal(false);
            Alert.alert(t('thanks'), t('community.juz_taken_success'));
        } else {
            Alert.alert(t('error'), t('community.report_error'));
        }
        setPledging(false);
    };

    const handleCreate = async () => {
        if (!isPremium) {
            Alert.alert(t('community.premium_required'), t('community.premium_alert_msg'));
            return;
        }
        if (!newTitle || (postType !== 'hatim' && !newContent)) {
            Alert.alert(t('error'), t('auth.fill_all_fields'));
            return;
        }

        const titleMod = moderateContent(newTitle);
        if (!titleMod.isSafe) {
            Alert.alert(t('community.warning'), `${t('community.input_title')}: ${titleMod.reason}`);
            return;
        }

        const contentMod = moderateContent(newContent);
        if (!contentMod.isSafe) {
            Alert.alert(t('community.warning'), `${t('community.input_desc')}: ${contentMod.reason}`);
            return;
        }

        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (postType === 'hatim') {
                await createCommunityHatim(newTitle, newContent, user.id, selectedSlots, i18n.language, userCity, showName);
            } else {
                await createCommunityPost({
                    user_id: user.id,
                    title: newTitle,
                    content: newContent,
                    type: postType,
                    target_count: postType === 'dhikr' ? parseInt(dhikrTarget) || 0 : 0,
                    current_count: postType === 'dhikr' ? parseInt(myInitialCount) || 0 : 0,
                    language_code: (i18n.language || 'tr').split('-')[0],
                    city: userCity,
                    show_full_name: showName
                });
            }

            closeBottomSheet();
            resetForm();
            loadPosts();

            // Prompt to share externally
            setTimeout(() => {
                Alert.alert(
                    t('community.creation_share_title'),
                    t('community.creation_share_msg'),
                    [
                        { text: t('common.no'), style: 'cancel' },
                        {
                            text: t('common.yes'),
                            onPress: () => {
                                const Share = require('react-native').Share;
                                const msg = postType === 'hatim'
                                    ? t('community.share_hatim_msg', { title: newTitle })
                                    : t('community.share_post_msg', { title: newTitle });
                                Share.share({ message: msg });
                            }
                        }
                    ]
                );
            }, 800);
        } catch (error) {
            Alert.alert(t('error'), t('community.save_error'));
        } finally {
            setCreating(false);
        }
    };

    const handleReport = (postId) => {
        Alert.alert(
            t('community.report_title'),
            t('community.report_question'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('community.report_reason_inappropriate'), onPress: () => submitReport(postId, t('community.report_reason_inappropriate')) },
                { text: t('community.report_reason_spam'), onPress: () => submitReport(postId, t('community.report_reason_spam')) },
                { text: t('community.report_reason_toxic'), onPress: () => submitReport(postId, t('community.report_reason_toxic')) }
            ]
        );
    };

    const submitReport = async (postId, reason) => {
        const { data: { user } } = await supabase.auth.getUser();
        const success = await reportPost(postId, user.id, reason);
        if (success) {
            Alert.alert(t('thanks'), t('community.report_success'));
        } else {
            Alert.alert(t('error'), t('community.report_error'));
        }
    };

    const resetForm = () => {
        setNewTitle('');
        setNewContent('');
        setPostType('dua');
        setDhikrTarget('');
        setMyInitialCount('');
        setSelectedSlots([]);
        setShowName(false);
    };

    const toggleSlot = (num) => {
        setSelectedSlots(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
    };

    const handleTranslate = async (post) => {
        if (post.isTranslated) {
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isShowingTranslated: !p.isShowingTranslated } : p));
            return;
        }
        const targetLang = (i18n.language || 'en').split('-')[0];
        const [tTitle, tContent] = await Promise.all([
            translateText(post.title, targetLang, post.language_code),
            translateText(post.content || post.description, targetLang, post.language_code)
        ]);
        if ((tTitle && tTitle !== post.title) || (tContent && tContent !== (post.content || post.description))) {
            setPosts(prev => prev.map(p => p.id === post.id ? {
                ...p,
                translatedTitle: tTitle || post.title,
                translatedContent: tContent || (post.content || post.description),
                isTranslated: true,
                isShowingTranslated: true
            } : p));
        }
    };

    return (
        <RamadanBackground>
            <View style={[styles.container, { paddingTop: Math.max(0, insets.top - 15) }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, ramadanModeEnabled && { color: '#FFD700' }]}>{t('community.title')}</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CommunityNotifications')}
                            style={[styles.iconBtn, { backgroundColor: '#000' }]}
                        >
                            <Bell size={24} color="#f39c12" />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => isPremium ? navigation.navigate('MyCommunityPosts') : navigation.navigate('Premium')}
                            style={[styles.iconBtn, { marginTop: 8, backgroundColor: isPremium ? '#000' : 'rgba(0,0,0,0.03)' }]}
                        >
                            {isPremium ? (
                                <User size={22} color="#FFF" />
                            ) : (
                                <View style={styles.lockedContainer}>
                                    <User size={20} color="#999" />
                                    <View style={styles.miniLock}>
                                        <Lock size={8} color="#FFF" />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.tabBar}>
                    {['all', 'dua', 'dhikr', 'hatim'].map(tkey => (
                        <TouchableOpacity
                            key={tkey}
                            style={[styles.tab, filter === tkey && styles.activeTab]}
                            onPress={() => setFilter(tkey)}
                        >
                            <Text style={[styles.tabText, filter === tkey && styles.activeTabText]}>
                                {tkey === 'all' ? t('common.all') : t(`community.filter_${tkey}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={posts}
                        renderItem={({ item }) => (
                            <View style={item.id === route.params?.highlightPostId ? styles.highlightedCard : null}>
                                <CommunityPostCard
                                    item={item}
                                    onPressHatim={(hatim) => navigation.navigate('HatimDetail', { hatimId: hatim.id, title: hatim.title, city: hatim.city })}
                                    onInteract={handleInteract}
                                    onReport={handleReport}
                                    onTranslate={handleTranslate}
                                />
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onScrollToIndexFailed={(info) => {
                            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <HeartHandshake size={60} color="#DDD" />
                                <Text style={styles.emptyText}>{t('community.no_posts')}</Text>
                            </View>
                        }
                    />
                )}

                {/* FAB */}
                <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
                    <Plus size={30} color="#FFF" />
                </TouchableOpacity>

                {/* Create Modal */}
                <Modal visible={showCreateModal} animationType="fade" transparent>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
                                <Animated.View
                                    style={[styles.modalContent, { transform: [{ translateY: panY }] }, ramadanModeEnabled && { backgroundColor: '#1A1A1A' }]}
                                    {...panResponder.panHandlers}
                                >
                                    <View style={styles.modalHandle} />
                                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                                        <Text style={[styles.modalTitle, ramadanModeEnabled && { color: '#FFF' }]}>{t('community.create_title')}</Text>

                                        {isPremium && (
                                            <TouchableOpacity
                                                style={styles.identityToggle}
                                                onPress={() => setShowName(!showName)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[styles.identityText, ramadanModeEnabled && { color: '#CCC' }]}>{t('community.share_with_name')}</Text>
                                                <View style={[styles.switchTrack, showName ? styles.switchTrackActive : styles.switchTrackInactive]}>
                                                    <Animated.View style={[
                                                        styles.switchThumb,
                                                        { transform: [{ translateX: showName ? 18 : 0 }] }
                                                    ]} />
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        <View style={styles.typeSelector}>
                                            {['dua', 'dhikr', 'hatim'].map(type => (
                                                <TouchableOpacity key={type} style={[styles.typeBtn, postType === type && styles.activeTypeBtn]} onPress={() => setPostType(type)}>
                                                    <Text
                                                        style={[styles.typeBtnText, postType === type && styles.activeTypeBtnText]}
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={0.7}
                                                    >
                                                        {t(`community.type_${type}`)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <TextInput style={styles.input} placeholder={postType === 'hatim' ? t('community.input_hatim_title') : t('community.input_title')} value={newTitle} onChangeText={setNewTitle} placeholderTextColor="#999" />
                                        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder={postType === 'hatim' ? t('community.input_hatim_desc') : t('community.input_desc')} value={newContent} onChangeText={setNewContent} multiline placeholderTextColor="#999" />
                                        {postType === 'dhikr' && (
                                            <View style={styles.rowInputs}>
                                                <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder={t('community.input_target')} value={dhikrTarget} onChangeText={setDhikrTarget} keyboardType="numeric" placeholderTextColor="#999" />
                                                <TextInput style={[styles.input, { flex: 1 }]} placeholder={t('community.input_my_count')} value={myInitialCount} onChangeText={setMyInitialCount} keyboardType="numeric" placeholderTextColor="#999" />
                                            </View>
                                        )}
                                        {postType === 'hatim' && (
                                            <View style={styles.hatimCreationSection}>
                                                <Text style={styles.sectionLabel}>{t('community.hatim_slots_desc')}</Text>
                                                <View style={styles.cuzGrid}>
                                                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                                                        <TouchableOpacity key={num} style={[styles.cuzBox, selectedSlots.includes(num) && styles.activeCuzBox]} onPress={() => toggleSlot(num)}>
                                                            <Text style={[styles.cuzBoxText, selectedSlots.includes(num) && styles.activeCuzBoxText]}>{num}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                        {!isPremium && (
                                            <View style={styles.premiumWarningContainer}>
                                                <Text style={styles.warningText}>{t('community.premium_warning')}</Text>
                                                <TouchableOpacity onPress={() => { setShowCreateModal(false); navigation.navigate('Premium'); }} style={styles.premiumLink}>
                                                    <Text style={styles.premiumLinkText}>{t('community.go_premium')} →</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </ScrollView>
                                    <View style={styles.modalFooter}>
                                        <TouchableOpacity style={[styles.confirmBtn, !isPremium && { opacity: 0.5 }]} onPress={handleCreate} disabled={creating || !isPremium}>
                                            {creating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>{t('community.share')}</Text>}
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </KeyboardAvoidingView>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

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
            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 4 },
    headerRight: { alignItems: 'center', paddingTop: 10 },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    lockedContainer: { position: 'relative' },
    miniLock: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#f39c12', width: 12, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFF' },
    badge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#e74c3c', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#000', paddingHorizontal: 2 },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
    title: { fontSize: 22, fontWeight: '700', color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif' },
    tabBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 10, marginTop: -28 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { fontSize: 13, color: '#7f8c8d', fontWeight: '600' },
    activeTabText: { color: '#FFF' },
    listContent: { padding: 20, paddingBottom: 100 },
    postCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
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
    fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    keyboardAvoidingView: { width: '100%', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 0, maxHeight: '96%', width: '100%', marginBottom: 0, overflow: 'hidden' },
    modalFooter: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 44 : 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalScroll: { paddingBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
    typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
    activeTypeBtn: { backgroundColor: COLORS.primary },
    typeBtnText: { fontSize: 13, color: '#999', fontWeight: 'bold' },
    activeTypeBtnText: { color: '#FFF' },
    input: { backgroundColor: '#F8F8F8', borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 12, color: '#333' },
    rowInputs: { flexDirection: 'row', marginBottom: 12 },
    hatimCreationSection: { marginBottom: 20 },
    sectionLabel: { fontSize: 13, color: '#777', fontWeight: '700', marginBottom: 12 },
    cuzGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cuzBox: { width: '18%', height: 40, borderRadius: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    activeCuzBox: { backgroundColor: COLORS.primary },
    cuzBoxText: { fontSize: 13, fontWeight: 'bold', color: '#999' },
    activeCuzBoxText: { color: '#FFF' },
    confirmBtn: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: COLORS.primary, width: '100%' },
    confirmBtnText: { fontWeight: 'bold', color: '#FFF', fontSize: 16 },
    premiumWarningContainer: { backgroundColor: '#fdf7e3', padding: 15, borderRadius: 16, marginVertical: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#f1c40f' },
    premiumLink: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#000', borderRadius: 25 },
    premiumLinkText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyBox: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: '#999', fontSize: 16 },
    highlightedCard: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 24, marginBottom: 16, padding: 2 },
    identityToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.02)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    identityText: {
        fontSize: 15,
        color: '#444',
        fontWeight: '600',
    },
    switchTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
    },
    switchTrackActive: {
        backgroundColor: COLORS.primary,
    },
    switchTrackInactive: {
        backgroundColor: '#D1D1D6',
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    hatimCard: { borderLeftWidth: 6, borderLeftColor: COLORS.primary },
    hatimHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    hatimLabel: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
    hatimFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    hatimStatus: { fontSize: 13, fontWeight: '700', color: COLORS.matteGreen }
});

export default CommunityScreen;
