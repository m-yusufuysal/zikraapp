import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Bell, HeartHandshake, Lock, Plus, ShieldCheck, Trophy, User, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Animated,
    DeviceEventEmitter,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommunityPostCard from '../components/CommunityPostCard';
import RamadanBackground from '../components/RamadanBackground';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAudio } from '../contexts/AudioContext';
import { useThrottledHaptic } from '../hooks/useThrottledHaptic';
import { createCommunityHatim, createCommunityPost, getCommunityPosts, getHatimGroups, getWeeklyLeaderboard, interactWithPost, reportPost, translateText } from '../services/CommunityService';

import { moderateContent, moderateTextAI } from '../services/ModerationService';
import { supabase } from '../services/supabase';
import { getLocationCache } from '../utils/storage';
import { COLORS } from '../utils/theme';


const CommunityScreen = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { nightModeEnabled } = useTheme();

    // Audio Context for MiniPlayer awareness
    const { isPlaying, currentAyah, isLoading } = useAudio();
    const { position } = require('react-native-track-player').useProgress(1000); // Poll less frequently for UI check

    // Determine if MiniPlayer is visible
    const isPlayerVisible = !!currentAyah && (isPlaying || isLoading || position > 0);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Pagination State
    const [lastCreatedAt, setLastCreatedAt] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEulaModal, setShowEulaModal] = useState(false);
    const [hasAcceptedEula, setHasAcceptedEula] = useState(false);

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
    const [showName, setShowName] = useState(true);

    const [interactionHistory, setInteractionHistory] = useState([]);
    const [warningCount, setWarningCount] = useState(0);
    const [bannedUntil, setBannedUntil] = useState(null);

    // Leaderboard State
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    // Dhikr Support (Mini Zikirmatik) State
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportCount, setSupportCount] = useState(0);
    const [activeSupportPostId, setActiveSupportPostId] = useState(null);
    const [submittingSupport, setSubmittingSupport] = useState(false);
    const [interactedPosts, setInteractedPosts] = useState(new Set());
    const [currentUserId, setCurrentUserId] = useState(null);

    // Support Modal Swipe State
    const panYSupport = useRef(new Animated.Value(0)).current;
    const resetPanSupport = () => Animated.spring(panYSupport, { toValue: 0, useNativeDriver: true }).start();
    const closeSupportModal = () => {
        Animated.timing(panYSupport, { toValue: 1000, duration: 300, useNativeDriver: true }).start(() => {
            setShowSupportModal(false);
            panYSupport.setValue(0);
        });
    };

    const panResponderSupport = PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            // Recognize a downward swipe (dy > 10)
            return Math.abs(gestureState.dy) > 10 && gestureState.dy > 0;
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) panYSupport.setValue(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 100) closeSupportModal();
            else resetPanSupport();
        },
        // Important: allow touches to pass to children if it's not a swipe
        onPanResponderTerminationRequest: () => true,
    });

    const triggerHaptic = useThrottledHaptic();


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
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkPremium();
            loadEulaStatus();
            loadBanStatus();
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    setCurrentUserId(user.id);
                    const { markAllNotificationsAsRead } = require('../services/CommunityNotificationService');
                    markAllNotificationsAsRead(user.id).then(() => {
                        clearUnreadCount();
                    });
                }
            });
            if (filter === 'leaderboard') {
                loadLeaderboard();
            } else {
                loadPosts(true);
            }
        }, [filter, i18n.language])
    );

    // Explicit Tab Press Listener for Refresh & Scroll to Top
    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            if (navigation.isFocused()) {
                // If already focused, scroll to top and refresh
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                loadPosts(true);
            }
        });
        return unsubscribe;
    }, [navigation, filter]);

    useEffect(() => {
        detectCity();
    }, [filter]);

    // Highlight Logic and Event Listener
    useEffect(() => {
        if (route.params?.highlightPostId && posts.length > 0) {
            const index = posts.findIndex(p => p.id === route.params.highlightPostId);
            if (index !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
                }, 600);
            }
        }

        // Listen for updates from Detail Screen
        const subscription = DeviceEventEmitter.addListener('communityPostUpdate', ({ postId, increment }) => {
            setPosts(prev => prev.map(p =>
                String(p.id) === String(postId)
                    ? { ...p, current_count: (parseInt(p.current_count) || 0) + increment }
                    : p
            ));
        });

        return () => {
            subscription.remove();
        };
    }, [route.params?.highlightPostId]);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('refreshCommunity', () => {
            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }
            loadPosts(true);
        });
        return () => subscription.remove();
    }, []);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase.channel('public:community_posts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'community_posts' },
                (payload) => {
                    const newPost = payload.new;
                    // Only add if it matches current filter or 'all'
                    // For 'hatim', we might need separate logic, but for general posts:
                    if (filter === 'all' || filter === newPost.type) {
                        // Optimistically normalize the post structure if needed (e.g. user info might be missing but we can add placeholders)
                        const formattedPost = {
                            ...newPost,
                            // If we don't have join profile data yet, we can use defaults or fetch it.
                            // For instant feel, we use what we have.
                            userName: t('community.someone'), // Placeholder until refresh
                            user_id: newPost.created_by || newPost.user_id, // ensure ID is set
                            avatar_url: null
                        };

                        // Check if we already added it (e.g. via our own optmistic create)
                        setPosts(prev => {
                            if (prev.find(p => p.id === newPost.id)) return prev;
                            return [formattedPost, ...prev];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [filter]);

    const loadLeaderboard = async () => {
        setLeaderboardLoading(true);
        try {
            const data = await getWeeklyLeaderboard(20);
            setLeaderboardData(data);
        } catch (e) {
            console.error('loadLeaderboard Error:', e);
        } finally {
            setLeaderboardLoading(false);
        }
    };

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
                            if (error) if (__DEV__) console.log('Location update failed:', error.message);
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

    const loadEulaStatus = async () => {
        const accepted = await AsyncStorage.getItem('eula_accepted');
        setHasAcceptedEula(accepted === 'true');
    };

    const handleAcceptEula = async () => {
        await AsyncStorage.setItem('eula_accepted', 'true');
        setHasAcceptedEula(true);
        setShowEulaModal(false);
        setShowCreateModal(true);
    };

    const loadPosts = async (isRefresh = false, isLoadMore = false, isSilent = false) => {
        if (!isRefresh && !isLoadMore && loading) return;
        if (isLoadMore && (!hasMore || loadingMore)) return;

        if (isRefresh) {
            if (!isSilent) setLoading(true);
            setLastCreatedAt(null);
            setHasMore(true);
        } else if (isLoadMore) {
            setLoadingMore(true);
        }

        try {
            const cursor = isRefresh ? null : lastCreatedAt;
            const limit = 15;

            let newPosts = [];
            if (filter === 'hatim') {
                newPosts = await getHatimGroups(cursor, limit);
                newPosts = newPosts.map(h => ({ ...h, type: 'hatim', user_id: h.created_by }));
            } else if (filter === 'all') {
                const [postsData, hatimsData] = await Promise.all([
                    getCommunityPosts('all', cursor, limit),
                    getHatimGroups(cursor, limit)
                ]);
                const combined = [
                    ...postsData,
                    ...hatimsData.map(h => ({
                        ...h,
                        type: 'hatim',
                        content: h.description,
                        user_id: h.created_by
                    }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                newPosts = combined;
            } else {
                newPosts = await getCommunityPosts(filter, cursor, limit);
            }

            if (isRefresh) {
                setPosts(newPosts);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
            }

            if (newPosts.length > 0) {
                setLastCreatedAt(newPosts[newPosts.length - 1].created_at);
            }

            if (newPosts.length < limit) {
                setHasMore(false);
            }

        } catch (e) {
            console.error('loadPosts Error:', e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
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

        // If it's a dhikr with a target, show the mini zikirmatik modal
        if (post?.type === 'dhikr' && post.target_count > 0) {
            setInteractionHistory(prev => [...prev.filter(time => now - time < 5000), now]);
            setActiveSupportPostId(postId);
            setSupportCount(0);
            setShowSupportModal(true);
            return;
        }

        // Otherwise proceed with standard +1 interaction
        if (interactedPosts.has(postId)) return;

        setInteractionHistory(prev => [...prev.filter(time => now - time < 5000), now]);
        const interactionType = post?.type === "dhikr" ? "prayed" : "amen";
        const success = await interactWithPost(postId, user.id, interactionType);
        if (success) {
            setInteractedPosts(prev => new Set(prev).add(postId));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, current_count: (p.current_count || 0) + 1 } : p));

            // Smart Review Trigger - First Amen/Interaction
            import('../services/StoreReviewService').then(module => {
                module.default.checkAmenReview();
            });
        }
    };

    const handleSupportIncrement = () => {
        triggerHaptic();
        setSupportCount(prev => prev + 1);
    };

    const handleSupportSubmit = async () => {
        if (submittingSupport) return;
        if (supportCount <= 0) {
            setShowSupportModal(false);
            return;
        }

        setSubmittingSupport(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert(t('error'), t('auth.required'));
            setSubmittingSupport(false);
            return;
        }

        const success = await interactWithPost(activeSupportPostId, user.id, 'prayed', supportCount);

        if (success) {
            setPosts(prev => prev.map(p => p.id === activeSupportPostId ? { ...p, current_count: (p.current_count || 0) + supportCount } : p));
            setShowSupportModal(false);

            // Show success feedback
            setTimeout(() => {
                Alert.alert(
                    t('community.support_success_title'),
                    t('community.support_success_msg')
                );
            }, 600);
        } else {
            Alert.alert(t('error'), t('community.report_error'));
        }
        setSubmittingSupport(false);
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

        // 1. Quick Client-side Safety Checks (IBAN, Phone, Email, etc.)
        const titleMod = moderateContent(newTitle);
        if (!titleMod.isSafe) {
            Alert.alert(t('community.warning'), t(titleMod.reason), [{ text: t('common.ok') }]);
            return;
        }

        const contentMod = moderateContent(newContent);
        if (!contentMod.isSafe) {
            Alert.alert(t('community.warning'), t(contentMod.reason), [{ text: t('common.ok') }]);
            return;
        }

        setCreating(true);

        try {
            // 2. Comprehensive AI Moderation (Context, Meaning, Tone, Islamic Suitability)
            const combinedText = `Title: ${newTitle}\nContent: ${newContent}`;
            const aiMod = await moderateTextAI(combinedText, postType, i18n.language);

            if (!aiMod.isSafe) {
                setCreating(false);
                const reasonStr = aiMod.reason ? (aiMod.reason.startsWith('community.') ? t(aiMod.reason) : aiMod.reason) : t('community.moderation_failed');
                Alert.alert(t('community.warning'), reasonStr, [{ text: t('common.ok') }]);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (postType === 'hatim') {
                await createCommunityHatim(newTitle, newContent, user.id, selectedSlots, i18n.language, userCity, true);
                loadPosts(true, false, true); // Silent refresh for Hatim for now
            } else {
                const newPostData = await createCommunityPost({
                    user_id: user.id,
                    title: newTitle,
                    content: newContent,
                    type: postType,
                    target_count: postType === 'dhikr' ? parseInt(dhikrTarget) || 0 : 0,
                    current_count: postType === 'dhikr' ? parseInt(myInitialCount) || 0 : 0,
                    language_code: (i18n.language || 'tr').split('-')[0],
                    city: userCity,
                    show_full_name: true
                });

                // Optimistic Update
                const optimisticPost = {
                    ...newPostData,
                    avatar_url: null, // or fetch if available locally
                    city: userCity,
                    userName: user.user_metadata?.full_name || t('community.me') || 'Ben',
                    created_at: new Date().toISOString()
                };

                setPosts(prev => [optimisticPost, ...prev]);

                // Silent background refresh to ensure consistency
                loadPosts(true, false, true);
            }

            closeBottomSheet();
            resetForm();

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
                { text: t('community.block_user'), style: 'destructive', onPress: () => handleBlockUser(postId) },
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

    const handleBlockUser = async (postId) => {
        Alert.alert(
            t('community.block_confirm_title'),
            t('community.block_confirm_msg'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('community.block_user'),
                    style: 'destructive',
                    onPress: async () => {
                        const post = posts.find(p => p.id === postId);
                        if (!post) return;

                        const userIdToBlock = post.user_id || post.created_by;
                        if (!userIdToBlock) return;

                        const success = await blockUser(userIdToBlock);
                        if (success) {
                            // Immediately remove all posts from this user from the UI
                            setPosts(prev => prev.filter(p => (p.user_id || p.created_by) !== userIdToBlock));
                            Alert.alert(t('success'), t('community.user_blocked'));
                        } else {
                            Alert.alert(t('error'), t('community.report_error'));
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setNewTitle('');
        setNewContent('');
        setPostType('dua');
        setDhikrTarget('');
        setMyInitialCount('');
        setSelectedSlots([]);
        setShowName(true);
    };

    const toggleSlot = (num) => {
        setSelectedSlots(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
    };

    const handleTranslate = async (post) => {
        // If already translated and showing, just toggle visibility
        if (post.isTranslated && post.translatedLanguage === i18n.language) {
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isShowingTranslated: !p.isShowingTranslated } : p));
            return;
        }

        // Force fresh translation if language changed or first time
        const currentLang = i18n.language || 'en';
        const targetLang = currentLang.split('-')[0];

        try {
            const [tTitle, tContent, tCity] = await Promise.all([
                translateText(post.title, targetLang, post.language_code),
                translateText(post.content || post.description, targetLang, post.language_code),
                post.city ? translateText(post.city, targetLang, 'auto') : Promise.resolve(null)
            ]);

            if ((tTitle && tTitle !== post.title) || (tContent && tContent !== (post.content || post.description))) {
                setPosts(prev => prev.map(p => p.id === post.id ? {
                    ...p,
                    translatedTitle: tTitle || post.title,
                    translatedContent: tContent || (post.content || post.description),
                    translatedCity: tCity || post.city,
                    isTranslated: true,
                    isShowingTranslated: true,
                    translatedLanguage: currentLang // Store which language we translated to
                } : p));
            } else {
                // If translation returned same text (or failed silently), just show original but mark as tried
                Alert.alert(t('community.translate_error'), t('community.translate_same_language'));
            }
        } catch (error) {
            console.error("Translation error:", error);
            Alert.alert(t('error'), t('community.translate_failed'));
        }
    };

    return (
        <RamadanBackground>
            <View style={[styles.container, { paddingTop: Math.max(0, insets.top - 15) }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 44 }} />
                    <Text style={[styles.title, { fontFamily: 'KaushanScript_400Regular', fontSize: 32, lineHeight: 55, paddingBottom: 15, paddingTop: 5, paddingHorizontal: 20 }, nightModeEnabled && { color: '#FFD700' }]}>Islamvy</Text>
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
                    {['all', 'dua', 'dhikr', 'hatim', 'leaderboard'].map(tkey => (
                        <TouchableOpacity
                            key={tkey}
                            style={[styles.tab, filter === tkey && styles.activeTab]}
                            onPress={() => setFilter(tkey)}
                        >
                            {tkey === 'leaderboard' ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 40 }}>
                                    <Trophy size={20} color={filter === tkey ? '#FFF' : '#7f8c8d'} />
                                </View>
                            ) : (
                                <Text style={[styles.tabText, filter === tkey && styles.activeTabText]}>
                                    {tkey === 'all' ? t('common.all') : t(`community.filter_${tkey}`)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {filter === 'leaderboard' ? (
                    leaderboardLoading ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={COLORS.primary} size="large" />
                        </View>
                    ) : (
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.leaderboardHeader}>
                                <Text style={styles.leaderboardTitle}>{t('community.leaderboard_title') || 'Haftanın Yıldızları'}</Text>
                                <Text style={styles.leaderboardSubtitle}>{t('community.this_week') || 'Bu hafta en çok paylaşım yapanlar'}</Text>
                            </View>
                            {leaderboardData.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Trophy size={60} color="#DDD" />
                                    <Text style={styles.emptyText}>{t('community.no_leaderboard') || 'Henüz veri yok'}</Text>
                                </View>
                            ) : (
                                leaderboardData.map((user, index) => (
                                    <View key={user.user_id || index} style={[
                                        styles.leaderboardCard,
                                        index === 0 && styles.leaderboardGold, // 1st Place Enhanced
                                        index === 1 && styles.leaderboardSilver,
                                        // index === 2 && styles.leaderboardBronze // 3rd Place Normalized (removed bronze style)
                                    ]}>
                                        <View style={styles.leaderboardRank}>
                                            <Text style={[
                                                styles.rankText,
                                                index === 0 && { fontSize: 32, transform: [{ scale: 1.2 }] }, // Bigger for 1st
                                                index === 1 && { fontSize: 22 }
                                            ]}>
                                                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                            </Text>
                                        </View>
                                        <View style={styles.leaderboardInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                {/* Avatar */}
                                                <View style={[
                                                    { borderRadius: 25, overflow: 'hidden', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
                                                    index === 0 && { borderWidth: 2, borderColor: '#FFD700', width: 54, height: 54 }, // Bigger border for 1st
                                                    index !== 0 && { width: 40, height: 40 }
                                                ]}>
                                                    {user.avatar_url ? (
                                                        <Image
                                                            source={{ uri: user.avatar_url }}
                                                            style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}
                                                        />
                                                    ) : (
                                                        <Text style={{
                                                            fontSize: index === 0 ? 24 : 18,
                                                            fontWeight: 'bold',
                                                            color: '#555'
                                                        }}>
                                                            {(user.full_name && user.full_name.trim()) ? user.full_name.trim().charAt(0).toUpperCase() : '?'}
                                                        </Text>
                                                    )}
                                                </View>

                                                <View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <Text style={[styles.leaderboardName, index === 0 && { fontSize: 18, color: '#d35400' }]}>
                                                            {(user.full_name && user.full_name.trim()) ? user.full_name : '...'}
                                                        </Text>
                                                        <Text style={{ fontSize: 14 }}>{user.badge_emoji}</Text>
                                                    </View>

                                                    {/* Always show location if available, enhanced for 1st place */}
                                                    {(user.city && user.city.trim()) ? (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                                            <Text style={{ fontSize: 10 }}>📍</Text>
                                                            <Text style={[styles.leaderboardCity, index === 0 && { color: '#e67e22', fontWeight: 'bold' }]}>{user.city}</Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
                                            {/* Amens */}
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
                                                {/* 1. Dhikrs (Zikir) */}
                                                <View style={{ alignItems: 'center', flex: 1 }}>
                                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.accent }}>📿 {user.completed_dhikrs || 0}</Text>
                                                    <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{t('community.completed_dhikrs_short') || 'Zikir'}</Text>
                                                </View>

                                                {/* 2. Amens (Dua) */}
                                                <View style={{ alignItems: 'center', flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
                                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary }}>🤲 {user.total_amens || 0}</Text>
                                                    <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{t('community.total_amens_short') || 'Dua (Amin)'}</Text>
                                                </View>

                                                {/* 3. Hatims */}
                                                <View style={{ alignItems: 'center', flex: 1 }}>
                                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#8e44ad' }}>📖 {user.completed_hatims || 0}</Text>
                                                    <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{t('community.completed_hatims_short') || 'Hatim'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )
                ) : loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                ) : (
                    <FlashList
                        ref={flatListRef}
                        data={posts}
                        onEndReached={() => loadPosts(false, true)}
                        onEndReachedThreshold={0.5}
                        estimatedItemSize={200}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        ListFooterComponent={
                            loadingMore ? (
                                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                            ) : (
                                <View style={{ height: 80 }} />
                            )
                        }
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={() => loadPosts(true)} tintColor={COLORS.primary} />
                        }
                        renderItem={({ item }) => (
                            <View style={item.id === route.params?.highlightPostId ? styles.highlightedCard : null}>
                                <CommunityPostCard
                                    item={item}
                                    nightModeEnabled={nightModeEnabled}
                                    onPressHatim={(hatim) => navigation.navigate('HatimDetail', {
                                        hatimId: hatim.id,
                                        title: hatim.title,
                                        city: hatim.city,
                                        userName: hatim.userName
                                    })}
                                    onInteract={handleInteract}
                                    onReport={handleReport}
                                    onTranslate={handleTranslate}
                                    isInteracted={interactedPosts.has(item.id)}
                                    currentUserId={currentUserId}
                                />
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <HeartHandshake size={60} color="#DDD" />
                                <Text style={styles.emptyText}>{t('community.no_posts')}</Text>
                            </View>
                        }
                    />
                )}

                {/* FAB - Only show if NOT on Leaderboard */}
                {filter !== 'leaderboard' && (
                    <TouchableOpacity
                        style={[styles.fab, isPlayerVisible && { bottom: 120 }]}
                        onPress={() => {
                            if (hasAcceptedEula) {
                                setShowCreateModal(true);
                            } else {
                                setShowEulaModal(true);
                            }
                        }}
                    >
                        <Plus size={30} color="#FFF" />
                    </TouchableOpacity>
                )}

                {/* Create Modal */}
                <Modal visible={showCreateModal} animationType="fade" transparent>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
                                <Animated.View
                                    style={[styles.modalContent, { transform: [{ translateY: panY }] }, nightModeEnabled && { backgroundColor: '#1A1A1A' }]}
                                    {...panResponder.panHandlers}
                                >
                                    <View style={styles.modalHandle} />
                                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                                        <Text style={[styles.modalTitle, nightModeEnabled && { color: '#FFF' }]}>{t('community.create_title')}</Text>

                                        {/* Identity Toggle Removed as per request */}

                                        <View style={styles.typeSelector}>
                                            {['dua', 'dhikr', 'hatim'].map(type => (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[
                                                        styles.typeBtn,
                                                        postType === type && styles.activeTypeBtn,
                                                        nightModeEnabled && postType !== type && { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1 }
                                                    ]}
                                                    onPress={() => setPostType(type)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.typeBtnText,
                                                            postType === type && styles.activeTypeBtnText,
                                                            nightModeEnabled && postType !== type && { color: 'rgba(255, 255, 255, 0.7)' }
                                                        ]}
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={0.7}
                                                    >
                                                        {t(`community.type_${type}`)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={
                                                postType === 'hatim' ? t('community.input_hatim_title') :
                                                    postType === 'dua' ? (t('community.input_title_dua') || "Başlık (Örn: Hastamıza Şifa)") :
                                                        postType === 'dhikr' ? (t('community.input_title_dhikr') || "Zikir Adı (Örn: Ya Şafi)") :
                                                            t('community.input_title')
                                            }
                                            value={newTitle}
                                            onChangeText={setNewTitle}
                                            placeholderTextColor="#999"
                                        />
                                        <TextInput
                                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                            placeholder={
                                                postType === 'hatim' ? t('community.input_hatim_desc') :
                                                    postType === 'dua' ? (t('community.input_desc_dua') || "Durumu anlatacak şekilde detaylı açıklama...") :
                                                        postType === 'dhikr' ? (t('community.input_desc_dhikr') || "Zikir çekme niyetinizi yazın...") :
                                                            t('community.input_desc')
                                            }
                                            value={newContent}
                                            onChangeText={setNewContent}
                                            multiline
                                            placeholderTextColor="#999"
                                        />
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
                                    <View style={[styles.modalFooter, nightModeEnabled && { backgroundColor: '#1A1A1A', borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                                        <TouchableOpacity style={[styles.confirmBtn, !isPremium && { opacity: 0.5 }]} onPress={handleCreate} disabled={creating || !isPremium}>
                                            {creating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>{t('community.share')}</Text>}
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </KeyboardAvoidingView>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* Mini Zikirmatik Support Modal */}
                <Modal visible={showSupportModal} animationType="fade" transparent>
                    <TouchableWithoutFeedback onPress={() => setShowSupportModal(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => {/* empty to prevent closing card when clicking ring area directly */ }}>
                                <Animated.View
                                    {...panResponderSupport.panHandlers}
                                    style={[
                                        styles.supportModalContent,
                                        nightModeEnabled && { backgroundColor: '#1A1A1A' },
                                        { transform: [{ translateY: panYSupport }] }
                                    ]}
                                >
                                    {/* Close if clicked on empty background area inside card as requested */}
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={StyleSheet.absoluteFill}
                                        onPress={() => setShowSupportModal(false)}
                                    />

                                    <View style={styles.modalHandle} />

                                    <Text style={[styles.supportModalTitle, nightModeEnabled && { color: '#FFF' }]}>
                                        {posts.find(p => p.id === activeSupportPostId)?.title || t('community.pledge_title')}
                                    </Text>
                                    <Text style={styles.supportModalSubtitle}>{t('community.pledge_desc')}</Text>

                                    <View style={styles.miniRingContainer}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={handleSupportIncrement}
                                            style={styles.miniRingButton}
                                        >
                                            <LinearGradient
                                                colors={['#333', '#111']}
                                                style={styles.miniRingBody}
                                            >
                                                <View style={styles.miniRingScreen}>
                                                    <View style={styles.miniLcdContent}>
                                                        <Text style={styles.miniLcdZeros}>
                                                            {supportCount.toString().padStart(5, '0')}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={styles.miniRingBtnOuter}>
                                                    <LinearGradient
                                                        colors={[COLORS.primary, '#1b5e20']}
                                                        style={styles.miniRingBtnInner}
                                                    />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.supportModalFooter}>
                                        <TouchableOpacity
                                            style={[styles.supportCancelBtn]}
                                            onPress={() => setShowSupportModal(false)}
                                        >
                                            <Text style={styles.supportCancelText}>{t('common.cancel')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.supportConfirmBtn, submittingSupport && { opacity: 0.7 }]}
                                            onPress={handleSupportSubmit}
                                            disabled={submittingSupport}
                                        >
                                            <Text style={styles.supportConfirmText}>
                                                {submittingSupport ? <ActivityIndicator color="#FFF" /> : t('common.done')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* EULA Modal */}
                <Modal
                    visible={showEulaModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowEulaModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { maxHeight: '80%', paddingBottom: insets.bottom + 20 }]}>
                            <View style={styles.modalHeader}>
                                <ShieldCheck size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
                                <Text style={styles.modalTitle}>{t('community.eula_title')}</Text>
                                <TouchableOpacity onPress={() => setShowEulaModal(false)} style={styles.closeBtn}>
                                    <X size={24} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.eulaScroll} showsVerticalScrollIndicator={false}>
                                <Text style={styles.eulaText}>{t('community.eula_message')}</Text>
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleAcceptEula}
                            >
                                <Text style={styles.submitBtnText}>{t('community.eula_accept')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </RamadanBackground >

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
    tabBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10, marginTop: -28, flexWrap: 'wrap' },
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
    fab: { position: 'absolute', bottom: 110, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    keyboardAvoidingView: { width: '100%', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 0, maxHeight: '96%', width: '100%', marginBottom: 0, overflow: 'hidden' },
    modalFooter: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 44 : 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalScroll: { paddingBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
    typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    typeBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
    activeTypeBtn: { backgroundColor: COLORS.primary },
    typeBtnText: { fontSize: 13, color: '#999', fontWeight: 'bold', textAlign: 'center' },
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
    eulaScroll: {
        marginVertical: 15,
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 15,
        borderRadius: 12,
    },
    eulaText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
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
    hatimStatus: { fontSize: 13, fontWeight: '700', color: COLORS.matteGreen },

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
    submitBtn: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        width: '100%',
        marginTop: 10,
    },
    submitBtnText: {
        fontWeight: 'bold',
        color: '#FFF',
        fontSize: 16,
    },

    // Leaderboard Styles
    leaderboardHeader: { alignItems: 'center', marginBottom: 20, paddingTop: 10 },
    leaderboardTitle: { fontSize: 24, fontWeight: '800', color: '#2c3e50', letterSpacing: -0.5 },
    leaderboardSubtitle: { fontSize: 13, color: '#7f8c8d', marginTop: 4 },
    leaderboardCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        borderRadius: 16, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    leaderboardGold: { backgroundColor: '#FFF9E6', borderWidth: 1.5, borderColor: '#FFD700' },
    leaderboardSilver: { backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#C0C0C0' },
    leaderboardBronze: { backgroundColor: '#FFF5EE', borderWidth: 1.5, borderColor: '#CD7F32' },
    leaderboardRank: { width: 40, alignItems: 'center', justifyContent: 'center' },
    rankText: { fontSize: 16, fontWeight: '700', color: '#7f8c8d' },
    leaderboardInfo: { flex: 1, marginLeft: 12 },
    leaderboardName: { fontSize: 15, fontWeight: '700', color: '#2c3e50' },
    leaderboardCity: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
    leaderboardStats: { alignItems: 'center', paddingLeft: 12 },
    leaderboardCount: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
    leaderboardLabel: { fontSize: 10, color: '#95a5a6', fontWeight: '600', textTransform: 'uppercase' },
    leaderboardAmens: { fontSize: 12, color: '#f39c12', marginTop: 4, fontWeight: '600' },
});

export default CommunityScreen;
