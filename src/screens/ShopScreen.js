import { useScrollToTop } from '@react-navigation/native';

import * as Localization from 'expo-localization';
import { Book, ChevronLeft, ExternalLink, Heart, ShoppingBag, Star, User, Users } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import { COLORS, FONTS } from '../utils/theme';

const CATEGORIES = [
    { id: 'books', name: 'shop.categories.books', icon: Book },
    { id: 'worship', name: 'shop.categories.worship', icon: Heart },
    { id: 'clothing', name: 'shop.categories.clothing', icon: ShoppingBag, hasSub: true },
    { id: 'health_fragrance', name: 'shop.categories.health_fragrance', icon: Heart },
    { id: 'home', name: 'shop.categories.home', icon: ShoppingBag },
    { id: 'food', name: 'shop.categories.food', icon: ShoppingBag },
];

const SUB_CATEGORIES = {
    clothing: [
        { id: 'women', name: 'shop.categories.women', icon: User },
        { id: 'men', name: 'shop.categories.men', icon: Users },
    ]
};

// Helper to get region safely
const getRegion = () => {
    try {
        const locales = Localization.getLocales();
        return locales && locales[0] ? locales[0].regionCode : 'US';
    } catch (e) {
        return 'US';
    }
};

const getRegionalUrl = (item, language) => {
    const region = getRegion();
    const langCode = language?.split('-')[0] || 'en';

    // 0. SEARCH LINK LOGIC (New Feature)
    // If item has 'search_keyword', generate a localized Amazon Search URL directly
    if (item.search_keyword) {
        let domain = 'amazon.com';
        switch (region) {
            case 'TR': domain = 'amazon.com.tr'; break;
            case 'AE': domain = 'amazon.ae'; break;
            case 'SA': domain = 'amazon.sa'; break;
            case 'DE': domain = 'amazon.de'; break;
            case 'GB': domain = 'amazon.co.uk'; break;
            case 'FR': domain = 'amazon.fr'; break;
            case 'ES': domain = 'amazon.es'; break;
            case 'IT': domain = 'amazon.it'; break;
            case 'NL': domain = 'amazon.nl'; break;
            case 'JP': domain = 'amazon.co.jp'; break;
            case 'CA': domain = 'amazon.ca'; break;
            default: domain = 'amazon.com'; break;
        }
        // Encode the keyword
        const query = encodeURIComponent(item.search_keyword);
        return `https://www.${domain}/s?k=${query}&tag=islamvy-20`;
    }

    // 1. Check for database column overrides (e.g. link_tr, link_us)
    if (region === 'TR' && item.link_tr) return item.link_tr;
    if (region === 'US' && item.link_us) return item.link_us;

    // 2. Fallback to generic link parsing
    let url = item.product_url || item.link;
    if (!url) return '';

    if (url.includes('amazon.')) {
        let domain = 'amazon.com'; // Default

        // Region-based domain mapping
        switch (region) {
            case 'TR': domain = 'amazon.com.tr'; break;
            case 'AE': domain = 'amazon.ae'; break;
            case 'SA': domain = 'amazon.sa'; break;
            case 'DE': domain = 'amazon.de'; break;
            case 'GB': domain = 'amazon.co.uk'; break;
            default:
                if (langCode === 'tr') domain = 'amazon.com.tr';
                break;
        }

        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
        const asin = asinMatch ? asinMatch[1] : null;

        if (asin) {
            return `https://www.${domain}/dp/${asin}?tag=islamvy-20`;
        }
    }

    return url;
};

const getLocalizedName = (item, t, language) => {
    if (!item) return '';
    if (item.name && item.name.includes('.')) return t(item.name);
    const lang = language?.split('-')[0] || 'tr';
    return item[`name_${lang}`] || item.name_tr || item.name_en || item.name;
};

const ProductCard = memo(({ item, nightModeEnabled, language, handlePress, t }) => (
    <TouchableOpacity
        style={[styles.card, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}
        activeOpacity={0.9}
        onPress={() => handlePress(item)}
    >
        <View style={styles.imageContainer}>
            <Image
                source={item.image_url || item.image}
                style={styles.image}
                contentFit="contain"
                transition={500}
                onError={(e) => console.log("Image Load Error:", item.id, e.error)}
                onLoad={() => console.log("Image Loaded Success:", item.id)}
            />
            <View style={styles.ratingBadge}>
                <Star size={10} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.linkOverlay}>
                <ExternalLink size={14} color="#FFF" />
            </View>
        </View>
        <View style={[styles.cardContent, nightModeEnabled && { backgroundColor: 'transparent' }]}>
            <Text style={styles.category}>{t(CATEGORIES.find(c => c.id === item.category)?.name || '').toUpperCase()}</Text>
            <Text style={[styles.productName, nightModeEnabled && { color: '#FFF' }]} numberOfLines={2}>
                {getLocalizedName(item, t, language)}
            </Text>
            <View style={styles.priceRow}>
                <View style={[styles.shopBtn, { flex: 1 }, nightModeEnabled && { backgroundColor: '#E67E22' }]}>
                    <Text style={[styles.shopBtnText, { textAlign: 'center' }, nightModeEnabled && { color: '#FFF' }]}>{t('shop.buy_now')}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
));

const ShopScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { nightModeEnabled } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('books');
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isTr = i18n.language.startsWith('tr');
    const buyNowText = t('shop.buy_now') || (isTr ? 'Satın Al' : 'Buy Now');

    const scrollRef = useRef(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    useScrollToTop(scrollRef);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (isRefreshing = false) => {
        try {
            if (isRefreshing) setRefreshing(true);
            else setLoading(true);

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('fetchProducts Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        fetchProducts(true);
    }, []);

    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [40, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const topTitleOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const filteredProducts = useMemo(() =>
        products.filter(p => {
            const matchesCat = p.category === selectedCategory;
            const matchesSub = !selectedSubCategory || p.sub_category === selectedSubCategory || p.sub === selectedSubCategory;
            return matchesCat && matchesSub;
        }),
        [products, selectedCategory, selectedSubCategory]);

    const handlePress = useCallback(async (item) => {
        try {
            const url = getRegionalUrl(item, i18n.language);
            if (!url) return;

            // TRACKING ANALYTICS
            // Fire and forget - don't await to keep UI snappy
            const region = getRegion();
            supabase.from('shop_analytics').insert({
                product_id: item.id,
                product_name: getLocalizedName(item, t, i18n.language),
                destination_url: url,
                region_code: region,
                click_type: item.search_keyword ? 'search' : 'product'
            }).then(({ error }) => {
                if (error) if (__DEV__) console.log("Analytics Error:", error);
            });

            await Linking.openURL(url);
        } catch (err) {
            console.error("Couldn't load page", err);
        }
    }, [i18n.language, t]);

    const handleCategorySelect = useCallback((id) => {
        setSelectedCategory(id);
        setSelectedSubCategory(null);
    }, []);

    const renderItem = useCallback(({ item }) => {
        // Debugging ShopScreen Image
        if (item.id === '24ba9dbf-9a90-4602-a22a-4b7717bec276') {
            console.log("ShopScreen Render - Tested Product:", item.id);
            console.log("   image_url:", item.image_url);
            console.log("   image:", item.image);
        }

        return (
            <ProductCard
                item={item}
                nightModeEnabled={nightModeEnabled}
                language={i18n.language}
                handlePress={handlePress}
                t={t}
            />
        );
    }, [nightModeEnabled, i18n.language, handlePress, t]);

    return (
        <RamadanBackground>
            <Animated.View style={[
                styles.header,
                {
                    paddingTop: insets.top + 10,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                }
            ]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <ChevronLeft size={28} color={nightModeEnabled ? '#FFF' : COLORS.matteBlack} />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.headerTitle, { opacity: headerTitleOpacity }, nightModeEnabled && { color: '#FFF' }]}>
                        {t('shop.islamvy_shop')}
                    </Animated.Text>
                    <View style={[styles.backButton, { opacity: 0 }]} />
                </View>
            </Animated.View>

            <View style={[styles.header, {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 5,
                paddingTop: insets.top + 10,
            }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, nightModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <ChevronLeft size={28} color={nightModeEnabled ? '#FFF' : COLORS.matteBlack} />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.headerTitle, { opacity: topTitleOpacity }, nightModeEnabled && { color: '#FFF' }]}>
                        {t('shop.islamvy_shop')}
                    </Animated.Text>
                    <View style={[styles.backButton, { opacity: 0 }]} />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    ref={scrollRef}
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 60 }]}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    initialNumToRender={6}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListHeaderComponent={
                        <View style={styles.banner}>
                            <View style={styles.elegantLabelContainer}>
                                <View style={styles.elegantLine} />
                                <Text style={styles.elegantLabel}>{t('shop.quality_elegance')}</Text>
                                <View style={styles.elegantLine} />
                            </View>
                            <Text style={[styles.bannerTitle, nightModeEnabled && { color: '#E67E22' }]}>{t('shop.exclusive_lifestyle')}</Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoryList}
                                contentContainerStyle={styles.categoryListContent}
                            >
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryItem,
                                            selectedCategory === cat.id && styles.categoryItemActive,
                                            nightModeEnabled && selectedCategory !== cat.id && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                                            nightModeEnabled && selectedCategory === cat.id && { backgroundColor: '#E67E22', borderColor: '#E67E22' }
                                        ]}
                                        onPress={() => handleCategorySelect(cat.id)}
                                    >
                                        <cat.icon
                                            size={16}
                                            color={selectedCategory === cat.id ? (nightModeEnabled ? '#FFF' : '#FFF') : (nightModeEnabled ? 'rgba(255,255,255,0.6)' : COLORS.textSecondary)}
                                        />
                                        <Text style={[
                                            styles.categoryItemText,
                                            selectedCategory === cat.id && styles.categoryItemTextActive,
                                            nightModeEnabled && selectedCategory !== cat.id && { color: 'rgba(255, 255, 255, 0.6)' },
                                            nightModeEnabled && selectedCategory === cat.id && { color: '#FFF' }
                                        ]}>
                                            {t(cat.name)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {selectedCategory === 'clothing' && (
                                <View style={styles.subCategoryContainer}>
                                    {SUB_CATEGORIES.clothing.map((sub) => (
                                        <TouchableOpacity
                                            key={sub.id}
                                            style={[
                                                styles.subCategoryItem,
                                                selectedSubCategory === sub.id && styles.subCategoryItemActive,
                                                nightModeEnabled && selectedSubCategory !== sub.id && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                nightModeEnabled && selectedSubCategory === sub.id && { backgroundColor: 'rgba(230, 126, 34, 0.2)', borderColor: '#E67E22' }
                                            ]}
                                            onPress={() => setSelectedSubCategory(selectedSubCategory === sub.id ? null : sub.id)}
                                        >
                                            <sub.icon
                                                size={14}
                                                color={selectedSubCategory === sub.id ? (nightModeEnabled ? '#E67E22' : COLORS.warning) : (nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)}
                                            />
                                            <Text style={[
                                                styles.subCategoryItemText,
                                                selectedSubCategory === sub.id && styles.subCategoryItemTextActive,
                                                nightModeEnabled && selectedSubCategory !== sub.id && { color: 'rgba(255, 255, 255, 0.4)' },
                                                nightModeEnabled && selectedSubCategory === sub.id && { color: '#E67E22' }
                                            ]}>
                                                {t(sub.name)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    }
                />
            )}
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        ...FONTS.h3,
        color: '#E67E22', // Orange for Islamvy Shop
        fontSize: 20,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 12,
    },
    banner: {
        marginBottom: 20,
        marginTop: 10,
        paddingHorizontal: 4,
    },
    elegantLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'center',
    },
    elegantLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.matteGreen,
        opacity: 0.3,
    },
    elegantLabel: {
        marginHorizontal: 10,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.matteGreen,
        letterSpacing: 2,
    },
    bannerTitle: {
        ...FONTS.h2,
        fontSize: 24,
        color: COLORS.matteBlack,
        marginBottom: 20,
        textAlign: 'center',
    },
    categoryList: {
        marginBottom: 10,
    },
    categoryListContent: {
        paddingRight: 20,
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EEE',
        gap: 6,
    },
    categoryItemActive: {
        backgroundColor: COLORS.matteBlack,
        borderColor: COLORS.matteBlack,
    },
    categoryItemText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    categoryItemTextActive: {
        color: '#FFF',
    },
    subCategoryContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
        marginBottom: 15,
        justifyContent: 'center',
    },
    subCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#DDD',
        gap: 5,
    },
    subCategoryItemActive: {
        borderColor: COLORS.warning,
        backgroundColor: '#FFF',
    },
    subCategoryItemText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    subCategoryItemTextActive: {
        color: COLORS.warning,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        maxWidth: '48%',
        shadowColor: "rgba(0,0,0,0.08)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 3,
    },
    imageContainer: {
        height: 180,
        width: '100%',
        backgroundColor: '#fff',
        position: 'relative',
        padding: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        zIndex: 2,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.matteBlack,
    },
    linkOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 6,
        borderRadius: 20,
    },
    cardContent: {
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    category: {
        fontSize: 9,
        color: COLORS.warning,
        marginBottom: 4,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    productName: {
        ...FONTS.body,
        fontSize: 13,
        color: COLORS.matteBlack,
        marginBottom: 8,
        fontWeight: '600',
        minHeight: 36,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    shopBtn: {
        backgroundColor: COLORS.matteBlack,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    shopBtnText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ShopScreen;
