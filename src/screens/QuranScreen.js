import { FlashList } from '@shopify/flash-list';
import { ChevronLeft, Pause, Play } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

import AdBanner from '../components/AdBanner';
import AyahItem from '../components/AyahItem';
import JuzList from '../components/JuzList';
import RamadanBackground from '../components/RamadanBackground';
import SurahList from '../components/SurahList';
import { useTheme } from '../contexts/ThemeContext';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS, COMMON_STYLES } from '../utils/theme';

import { useTranslation } from 'react-i18next';
import { useAudio } from '../contexts/AudioContext';
import { SURAH_NAMES } from '../data/surahNames';
import { getJuzDetails, getSurahDetails, getSurahs } from '../services/quranService';

const QuranScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('surah');

    // View State
    const [selectedContext, setSelectedContext] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [loadingContext, setLoadingContext] = useState(false);

    // Audio Context
    const { isPlaying, currentAyah, playAyah, pause, resume, isLoading: isAudioLoading } = useAudio();

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [40, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const topHeaderOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const flashListRef = useRef(null);

    // Explicit Tab Press Listener
    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            if (navigation.isFocused()) {
                flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
        });
        return unsubscribe;
    }, [navigation]);

    // Initialize Data (Surah List)
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const data = await getSurahs(i18n.language);
            setSurahs(data);
            setLoading(false);
        };
        loadInitialData();
    }, [i18n.language]);

    // Handle Deep Link / Navigation Props
    useEffect(() => {
        if (route.params?.targetSurahNumber) {
            const { targetSurahNumber, targetAyahNumber } = route.params;

            const handleDeepLink = async () => {
                navigation.setParams({ targetSurahNumber: null, targetAyahNumber: null });

                const data = await getSurahs(i18n.language);
                const surah = data.find(s => s.number === targetSurahNumber);
                if (surah) {
                    await openSurah(surah);
                }
            };
            handleDeepLink();
        }
    }, [route.params]);

    // Auto-scroll to currently playing ayah
    useEffect(() => {
        if (currentAyah && ayahs.length > 0 && flashListRef.current) {
            const index = ayahs.findIndex(a => a.number === currentAyah.number);
            if (index !== -1) {
                requestAnimationFrame(() => {
                    try {
                        if (flashListRef.current) {
                            flashListRef.current.scrollToIndex({
                                index,
                                animated: true,
                                viewPosition: 0.5
                            });
                        }
                    } catch (e) {
                        // Ignore scroll errors
                    }
                });
            }
        }
    }, [currentAyah, ayahs]);

    const openSurah = async (surah, scrollToAyahNumber = null) => {
        setLoadingContext(true);
        setAyahs([]);
        const langCode = (i18n.language || 'tr').split('-')[0];
        const localizedName = SURAH_NAMES[surah.number]?.[langCode] || surah.englishName;

        setSelectedContext({
            type: 'surah',
            title: localizedName,
            subtitle: surah.name,
            data: surah
        });

        try {
            const details = await getSurahDetails(surah.number, i18n.language);
            if (details) {
                setAyahs(details.ayahs);

                if (scrollToAyahNumber) {
                    setTimeout(() => {
                        const index = details.ayahs.findIndex(a => a.number === scrollToAyahNumber || a.numberInSurah === scrollToAyahNumber);
                        if (index !== -1 && flashListRef.current) {
                            flashListRef.current.scrollToIndex({ index, animated: true });
                        }
                    }, 500);
                }
            } else {
                Alert.alert(t('error'), t('quran.load_error'));
                setSelectedContext(null);
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('quran.generic_error'));
            setSelectedContext(null);
        } finally {
            setLoadingContext(false);
        }
    };

    const openJuz = async (juzNumber) => {
        setLoadingContext(true);
        setAyahs([]);
        setSelectedContext({
            type: 'juz',
            title: t('quran.juz_title', { number: juzNumber }),
            subtitle: t('quran.holy_quran'),
            data: juzNumber
        });

        try {
            const juzAyahs = await getJuzDetails(juzNumber, i18n.language);
            if (juzAyahs && juzAyahs.length > 0) {
                setAyahs(juzAyahs);
            } else {
                Alert.alert(t('error'), t('quran.juz_load_error'));
                setSelectedContext(null);
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('quran.generic_error'));
            setSelectedContext(null);
        } finally {
            setLoadingContext(false);
        }
    };

    const closeDetail = () => {
        setSelectedContext(null);
        setAyahs([]);
    };

    const isContextActive = useMemo(() => {
        if (!currentAyah || !selectedContext) return false;

        if (selectedContext.type === 'surah') {
            return currentAyah.surahNumber === selectedContext.data.number;
        } else if (selectedContext.type === 'juz') {
            return currentAyah.juz === selectedContext.data;
        }
        return false;
    }, [currentAyah, selectedContext]);

    const handlePlayPause = (ayah) => {
        if (currentAyah && currentAyah.number === ayah.number) {
            if (isPlaying) {
                pause();
            } else {
                resume();
            }
        } else {
            playAyah(ayah, ayahs);
        }
    };

    const handleContextPlay = () => {
        if (isContextActive && currentAyah) {
            if (isPlaying) {
                pause();
            } else {
                resume();
            }
        } else {
            if (ayahs.length > 0) {
                handlePlayPause(ayahs[0]);
            }
        }
    };

    return (
        <RamadanBackground>
            <View style={[styles.content, { paddingTop: insets.top }]}>

                {selectedContext ? (
                    <View style={{ flex: 1, width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%', alignSelf: 'center' }}>

                        {/* Floating Transparent Header */}
                        <View style={[styles.floatingHeader, { paddingTop: insets.top + 0 }]}>
                            <TouchableOpacity
                                onPress={closeDetail}
                                style={[
                                    styles.roundButtonSmall,
                                    ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.05)', shadowOpacity: 0, elevation: 0 }
                                ]}
                            >
                                <ChevronLeft color={ramadanModeEnabled ? '#FFF' : COLORS.matteBlack} size={24} />
                            </TouchableOpacity>

                            <View style={styles.headerTitleContainer}>
                                <Animated.Text style={[styles.headerTitleSticky, { opacity: headerTitleOpacity, position: 'absolute' }, ramadanModeEnabled && { color: '#FFF' }]}>
                                    {selectedContext.title}
                                </Animated.Text>
                            </View>

                            <View style={{ width: 36 }} />
                        </View>

                        {loadingContext ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>{t('loading')}</Text>
                            </View>
                        ) : (
                            <AnimatedFlashList
                                ref={flashListRef}
                                data={ayahs}
                                estimatedItemSize={150}
                                keyExtractor={(item) => `ayah-${item.verseKey}-${item.number}`}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: true }
                                )}
                                scrollEventThrottle={16}
                                renderItem={({ item }) => (
                                    <AyahItem
                                        item={item}
                                        isActive={currentAyah?.number === item.number}
                                        isPlaying={isPlaying && currentAyah?.number === item.number}
                                        onPlayPause={handlePlayPause}
                                        theme={i18n.language}
                                        ramadanModeEnabled={ramadanModeEnabled}
                                    />
                                )}
                                contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 50 }]}
                                ListHeaderComponent={
                                    <View style={styles.detailHeader}>
                                        <Animated.Text style={[styles.detailTitle, { opacity: topHeaderOpacity }, ramadanModeEnabled && { color: '#FFF' }]}>
                                            {selectedContext.title}
                                        </Animated.Text>
                                        {selectedContext.subtitle && selectedContext.title !== selectedContext.subtitle && i18n.language.split('-')[0] !== 'ar' && (
                                            <Animated.Text style={[styles.detailSubtitle, { opacity: topHeaderOpacity }, ramadanModeEnabled && { color: 'rgba(255,255,255,0.7)' }]}>
                                                {selectedContext.subtitle}
                                            </Animated.Text>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.floatingPlayBtn, (isContextActive && isPlaying) && styles.activeControlGreen]}
                                            onPress={handleContextPlay}
                                        >
                                            {(isContextActive && isPlaying) ? <Pause color="white" size={32} /> : <Play color="white" size={32} />}
                                        </TouchableOpacity>
                                    </View>
                                }
                            />
                        )}
                    </View>
                ) : (
                    <>
                        <Text style={[COMMON_STYLES.headerTitle, { marginHorizontal: 24, marginTop: 10, alignSelf: isTablet ? 'center' : 'flex-start' }, ramadanModeEnabled && { color: '#FFF' }]}>{t('quran.title')}</Text>

                        <View style={[styles.tabContainer, isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1 }]}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'surah' && styles.activeTab, ramadanModeEnabled && activeTab === 'surah' && { backgroundColor: '#FFD700', borderColor: '#FFD700' }]}
                                onPress={() => setActiveTab('surah')}
                            >
                                <Text style={[styles.tabText, activeTab === 'surah' && styles.activeTabText, ramadanModeEnabled && activeTab !== 'surah' && { color: 'rgba(255, 255, 255, 0.6)' }, ramadanModeEnabled && activeTab === 'surah' && { color: '#000' }]}>{t('quran.surahs')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'juz' && styles.activeTab, ramadanModeEnabled && activeTab === 'juz' && { backgroundColor: '#FFD700', borderColor: '#FFD700' }]}
                                onPress={() => setActiveTab('juz')}
                            >
                                <Text style={[styles.tabText, activeTab === 'juz' && styles.activeTabText, ramadanModeEnabled && activeTab !== 'juz' && { color: 'rgba(255, 255, 255, 0.6)' }, ramadanModeEnabled && activeTab === 'juz' && { color: '#000' }]}>{t('quran.juzs')}</Text>
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                        ) : (
                            <View style={{ flex: 1 }}>
                                {activeTab === 'surah' ? (
                                    <SurahList data={surahs} onSurahPress={openSurah} ramadanModeEnabled={ramadanModeEnabled} />
                                ) : (
                                    <JuzList onJuzPress={openJuz} ramadanModeEnabled={ramadanModeEnabled} />
                                )}
                            </View>
                        )}
                    </>
                )}

                {!selectedContext && <AdBanner />}
            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 140,
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    roundButtonSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitleSticky: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    detailHeader: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    detailTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    detailSubtitle: {
        fontSize: 18,
        color: COLORS.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    floatingPlayBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.matteBlack,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    activeControlGreen: {
        backgroundColor: COLORS.matteGreen,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: 'rgba(0,0,0,0.15)',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
});

export default QuranScreen;
