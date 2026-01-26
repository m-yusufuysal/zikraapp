import { useScrollToTop } from '@react-navigation/native';
import { Book, ChevronLeft, ExternalLink, Heart, ShoppingBag, Star, User, Users } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const getRegionalAmazonUrl = (url, language) => {
    if (!url || !url.includes('amazon.')) return url;

    const lang = language?.split('-')[0] || 'en';
    let domain = 'amazon.com'; // Default

    // Domain Mapping
    if (lang === 'tr') domain = 'amazon.com.tr';
    else if (lang === 'ar') domain = 'amazon.sa'; // Could also be .ae, let's use .sa as main
    else if (lang === 'en') domain = 'amazon.com';
    else if (lang === 'id') domain = 'amazon.com'; // Amazon doesn't have ID store, use Global

    // Extract ASIN (Amazon Product ID)
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    const asin = asinMatch ? asinMatch[1] : null;

    if (asin) {
        // Build regional affiliate link
        // Note: For multi-region affiliate, ideally you'd have different TAGS for each,
        // but for now we keep the structure and user can replace tags if needed.
        return `https://www.${domain}/dp/${asin}?tag=YOUR_TAG_HERE`;
    }

    // Fallback if not an ASIN link (like a search link)
    try {
        const urlObj = new URL(url);
        urlObj.hostname = `www.${domain}`;
        return urlObj.toString();
    } catch (e) {
        return url.replace(/amazon\.[a-z\.]+/i, domain);
    }
};

const getLocalizedName = (item, t, language) => {
    if (!item) return '';
    if (item.name && item.name.includes('.')) return t(item.name);
    const lang = language?.split('-')[0] || 'tr';
    return item[`name_${lang}`] || item.name_tr || item.name_en || item.name;
};

const ProductCard = memo(({ item, ramadanModeEnabled, language, handlePress, t }) => (
    <TouchableOpacity
        style={[styles.card, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}
        activeOpacity={0.9}
        onPress={() => handlePress(getRegionalAmazonUrl(item.product_url || item.link, language))}
    >
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: item.image_url || item.image }}
                style={styles.image}
                resizeMode="contain"
                fadeDuration={0}
            />
            <View style={styles.ratingBadge}>
                <Star size={10} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.linkOverlay}>
                <ExternalLink size={14} color="#FFF" />
            </View>
        </View>
        <View style={[styles.cardContent, ramadanModeEnabled && { backgroundColor: 'transparent' }]}>
            <Text style={styles.category}>{t(CATEGORIES.find(c => c.id === item.category)?.name || '').toUpperCase()}</Text>
            <Text style={[styles.productName, ramadanModeEnabled && { color: '#FFF' }]} numberOfLines={2}>
                {getLocalizedName(item, t, language)}
            </Text>
            <View style={styles.priceRow}>
                <View style={[styles.shopBtn, { flex: 1 }, ramadanModeEnabled && { backgroundColor: '#E67E22' }]}>
                    <Text style={[styles.shopBtnText, { textAlign: 'center' }, ramadanModeEnabled && { color: '#FFF' }]}>{t('shop.buy_now')}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
));

const ShopScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('books');
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const isTr = i18n.language.startsWith('tr');
    const buyNowText = t('shop.buy_now') || (isTr ? 'Satın Al' : 'Buy Now');

    const scrollRef = useRef(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    useScrollToTop(scrollRef);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
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
        }
    };

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

    const handlePress = useCallback(async (url) => {
        try {
            // Standard affiliate links automatically trigger Universal Links / App Links
            // which open the Amazon app if it's installed.
            await Linking.openURL(url);
        } catch (err) {
            console.error("Couldn't load page", err);
            // Fallback for simple cases
            Linking.openURL(url).catch(e => console.warn("Final fallback failed", e));
        }
    }, []);

    const handleCategorySelect = useCallback((id) => {
        setSelectedCategory(id);
        setSelectedSubCategory(null);
    }, []);

    const renderItem = useCallback(({ item }) => (
        <ProductCard
            item={item}
            ramadanModeEnabled={ramadanModeEnabled}
            language={i18n.language}
            handlePress={handlePress}
            t={t}
        />
    ), [ramadanModeEnabled, i18n.language, handlePress, t]);

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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <ChevronLeft size={28} color={ramadanModeEnabled ? '#FFF' : COLORS.matteBlack} />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.headerTitle, { opacity: headerTitleOpacity }, ramadanModeEnabled && { color: '#FFF' }]}>
                        {t('shop.zikra_shop')}
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <ChevronLeft size={28} color={ramadanModeEnabled ? '#FFF' : COLORS.matteBlack} />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.headerTitle, { opacity: topTitleOpacity }, ramadanModeEnabled && { color: '#FFF' }]}>
                        {t('shop.zikra_shop')}
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
                    ListHeaderComponent={
                        <View style={styles.banner}>
                            <View style={styles.elegantLabelContainer}>
                                <View style={styles.elegantLine} />
                                <Text style={styles.elegantLabel}>{t('shop.quality_elegance')}</Text>
                                <View style={styles.elegantLine} />
                            </View>
                            <Text style={[styles.bannerTitle, ramadanModeEnabled && { color: '#E67E22' }]}>{t('shop.exclusive_lifestyle')}</Text>

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
                                            ramadanModeEnabled && selectedCategory !== cat.id && { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                                            ramadanModeEnabled && selectedCategory === cat.id && { backgroundColor: '#E67E22', borderColor: '#E67E22' }
                                        ]}
                                        onPress={() => handleCategorySelect(cat.id)}
                                    >
                                        <cat.icon
                                            size={16}
                                            color={selectedCategory === cat.id ? (ramadanModeEnabled ? '#FFF' : '#FFF') : (ramadanModeEnabled ? 'rgba(255,255,255,0.6)' : COLORS.textSecondary)}
                                        />
                                        <Text style={[
                                            styles.categoryItemText,
                                            selectedCategory === cat.id && styles.categoryItemTextActive,
                                            ramadanModeEnabled && selectedCategory !== cat.id && { color: 'rgba(255, 255, 255, 0.6)' },
                                            ramadanModeEnabled && selectedCategory === cat.id && { color: '#FFF' }
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
                                                ramadanModeEnabled && selectedSubCategory !== sub.id && { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                ramadanModeEnabled && selectedSubCategory === sub.id && { backgroundColor: 'rgba(230, 126, 34, 0.2)', borderColor: '#E67E22' }
                                            ]}
                                            onPress={() => setSelectedSubCategory(selectedSubCategory === sub.id ? null : sub.id)}
                                        >
                                            <sub.icon
                                                size={14}
                                                color={selectedSubCategory === sub.id ? (ramadanModeEnabled ? '#E67E22' : COLORS.warning) : (ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)}
                                            />
                                            <Text style={[
                                                styles.subCategoryItemText,
                                                selectedSubCategory === sub.id && styles.subCategoryItemTextActive,
                                                ramadanModeEnabled && selectedSubCategory !== sub.id && { color: 'rgba(255, 255, 255, 0.4)' },
                                                ramadanModeEnabled && selectedSubCategory === sub.id && { color: '#E67E22' }
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
        color: '#E67E22', // Orange for Zikra Shop
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
