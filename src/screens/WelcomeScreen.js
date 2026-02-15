import { ArrowRight, MapPin, Users, Compass, BookOpen, ShoppingBag, Scroll, Sparkles, HandCoins } from 'lucide-react-native';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Image, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, Path, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import RamadanBackground from '../components/RamadanBackground';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

// Premium AI Spiritual Icon Component - meaningful design with sparkle star and accents
const AISparkleIcon = ({ size = 100, color = COLORS.accent }) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
            <SvgLinearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity="1" />
                <Stop offset="100%" stopColor="#C4A052" stopOpacity="1" />
            </SvgLinearGradient>
        </Defs>
        {/* Main 4-pointed star - spiritual sparkle representing divine guidance */}
        <Path
            d="M50 5 L55 40 L90 50 L55 60 L50 95 L45 60 L10 50 L45 40 Z"
            fill="url(#sparkleGrad)"
        />
        {/* Small decorative stars representing AI intelligence */}
        <G opacity="0.8">
            <Path
                d="M75 15 L77 22 L84 24 L77 26 L75 33 L73 26 L66 24 L73 22 Z"
                fill={color}
            />
            {/* Added more stars as requested */}
            <Path
                d="M15 75 L17 82 L24 84 L17 86 L15 93 L13 86 L6 84 L13 82 Z"
                fill={color}
                opacity="0.7"
            />
            <Path
                d="M85 75 L86 78 L89 79 L86 80 L85 83 L84 80 L81 79 L84 78 Z"
                fill={color}
                opacity="0.6"
            />
            <Circle cx="25" cy="20" r="3" fill={color} opacity="0.6" />
            <Circle cx="30" cy="75" r="2" fill={color} opacity="0.5" />
            <Circle cx="80" cy="30" r="1.5" fill={color} opacity="0.4" />
            <Circle cx="10" cy="50" r="1" fill={color} opacity="0.3" />
        </G>
        {/* Central glow */}
        <Circle cx="50" cy="50" r="8" fill={color} opacity="0.15" />
    </Svg>
);

// Scalable 3-Person Community Icon from App.js
const CommunityIcon = ({ size = 120, color = COLORS.accent }) => {
    const scale = size / 28; // Base size in App.js is 28
    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ position: 'relative', width: size, height: size }}>
                {/* Left Person (Background) */}
                <View style={{
                    position: 'absolute', top: 6 * scale, left: 0,
                    width: 7 * scale, height: 7 * scale, borderRadius: 3.5 * scale,
                    borderWidth: 1.5 * scale, borderColor: color, opacity: 0.6,
                    backgroundColor: 'transparent'
                }} />
                <View style={{
                    position: 'absolute', top: 14 * scale, left: -3 * scale,
                    width: 12 * scale, height: 7 * scale,
                    borderTopLeftRadius: 7 * scale, borderTopRightRadius: 7 * scale,
                    borderLeftWidth: 1.5 * scale, borderRightWidth: 1.5 * scale, borderTopWidth: 1.5 * scale,
                    borderColor: color, opacity: 0.6,
                    backgroundColor: 'transparent'
                }} />

                {/* Right Person (Background) */}
                <View style={{
                    position: 'absolute', top: 6 * scale, left: 20 * scale,
                    width: 7 * scale, height: 7 * scale, borderRadius: 3.5 * scale,
                    borderWidth: 1.5 * scale, borderColor: color, opacity: 0.6,
                    backgroundColor: 'transparent'
                }} />
                <View style={{
                    position: 'absolute', top: 14 * scale, left: 18 * scale,
                    width: 12 * scale, height: 7 * scale,
                    borderTopLeftRadius: 7 * scale, borderTopRightRadius: 7 * scale,
                    borderLeftWidth: 1.5 * scale, borderRightWidth: 1.5 * scale, borderTopWidth: 1.5 * scale,
                    borderColor: color, opacity: 0.6,
                    backgroundColor: 'transparent'
                }} />

                {/* Center Person (Foreground) */}
                <View style={{
                    position: 'absolute', top: 2 * scale, left: 9 * scale,
                    width: 9 * scale, height: 9 * scale, borderRadius: 4.5 * scale,
                    borderWidth: 1.8 * scale, borderColor: color,
                    backgroundColor: '#FFF' // Always white background for center person in onboarding
                }} />
                <View style={{
                    position: 'absolute', top: 12 * scale, left: 4 * scale,
                    width: 20 * scale, height: 10 * scale,
                    borderTopLeftRadius: 10 * scale, borderTopRightRadius: 10 * scale,
                    borderLeftWidth: 1.8 * scale, borderRightWidth: 1.8 * scale, borderTopWidth: 1.8 * scale,
                    borderColor: color,
                    backgroundColor: '#FFF' // Always white background for center person in onboarding
                }} />
            </View>
        </View>
    );
};

// Dhikr & Dua Icon - Final Image Asset from User
const DhikrDuaIcon = ({ size = 120 }) => (
    <Image
        source={require('../../assets/images/dhikr_dua_icon.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
    />
);

const WelcomeScreen = ({ navigation, onFinish }) => {
    const { t } = useTranslation();
    const { nightModeEnabled } = useTheme();
    const insets = useSafeAreaInsets();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const slides = [
        {
            id: 1,
            titleKey: 'onboarding.slide1_title',
            descKey: 'onboarding.slide1_desc',
            icon: <Image
                source={require('../../assets/images/onboardslogo.png')}
                style={{ width: 288, height: 288 }}
                resizeMode="contain"
            />
        },
        {
            id: 2,
            titleKey: 'onboarding.slide2_title', // Dream
            descKey: 'onboarding.slide2_desc',
            icon: <AISparkleIcon size={120} color={COLORS.accent} />
        },
        {
            id: 3,
            titleKey: 'onboarding.slide3_title', // Dhikr & Dua
            descKey: 'onboarding.slide3_desc',
            icon: <DhikrDuaIcon size={120} color={COLORS.accent} />
        },
        {
            id: 4,
            titleKey: 'onboarding.slide4_title', // Community
            descKey: 'onboarding.slide4_desc',
            icon: <CommunityIcon size={120} color={COLORS.accent} />
        },
        {
            id: 5,
            titleKey: 'onboarding.slide5_title', // Daily Content
            descKey: 'onboarding.slide5_desc',
            icon: <View style={{ alignItems: 'center' }}>
                {/* "Meaningless pen and paper style thing" - Made bolder */}
                <Scroll size={110} color={COLORS.accent} strokeWidth={2} />
            </View>
        },
        {
            id: 6,
            titleKey: 'onboarding.slide6_title', // Prayer & Kaaba
            descKey: 'onboarding.slide6_desc',
            icon: <MapPin color={COLORS.accent} size={100} />
        },
        {
            id: 7,
            titleKey: 'onboarding.slide7_title', // Qibla & Mosque
            descKey: 'onboarding.slide7_desc',
            icon: <Compass color={COLORS.accent} size={110} strokeWidth={1.2} />
        },
        {
            id: 8,
            titleKey: 'onboarding.slide8_title', // Quran
            descKey: 'onboarding.slide8_desc',
            icon: <BookOpen color={COLORS.accent} size={110} strokeWidth={1.2} />
        },
        {
            id: 9,
            titleKey: 'onboarding.slide9_title', // Zakat
            descKey: 'onboarding.slide9_desc',
            icon: <HandCoins color={COLORS.accent} size={110} strokeWidth={1.2} />
        },
        {
            id: 10,
            titleKey: 'onboarding.slide10_title', // Shop
            descKey: 'onboarding.slide10_desc',
            icon: <ShoppingBag color={COLORS.accent} size={100} strokeWidth={1.5} />
        }
    ];

    const handleNextRef = useRef(null);
    const handlePrevRef = useRef(null);

    useEffect(() => {
        handleNextRef.current = handleNext;
        handlePrevRef.current = handlePrev;
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // More sensitive: trigger pan handling even on smaller movements
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderRelease: (_, gestureState) => {
                // Lower threshold for navigation trigger (30px instead of 50px)
                if (gestureState.dx > 30) {
                    // Swipe Right -> Go Back
                    if (handlePrevRef.current) handlePrevRef.current();
                } else if (gestureState.dx < -30) {
                    // Swipe Left -> Go Forward
                    if (handleNextRef.current) handleNextRef.current();
                }
            },
        })
    ).current;

    const handleNext = async () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            // Finish onboarding
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                await AsyncStorage.setItem('hasLaunched', 'true');
                onFinish();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handlePrev = () => {
        setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <RamadanBackground>
            <View
                style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
                {...panResponder.panHandlers}
            >
                {/* Slide Content */}
                <View style={styles.slideContainer}>
                    <View style={styles.iconContainer}>
                        {slides[currentSlide].icon}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{t(slides[currentSlide].titleKey)}</Text>
                        <Text style={styles.description}>{t(slides[currentSlide].descKey)}</Text>
                    </View>
                </View>

                {/* Aesthetic Segmented Progress Bar */}
                <View style={styles.progressBarContainer}>
                    {slides.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => goToSlide(index)}
                            activeOpacity={0.8}
                            style={[
                                styles.progressSegment,
                                currentSlide === index ? styles.activeSegment : styles.inactiveSegment,
                                // Add a subtle gap-less look by matching colors or using small margins
                                { marginLeft: index === 0 ? 0 : 6 }
                            ]}
                        >
                            {currentSlide === index && <View style={styles.activeGlow} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentSlide === slides.length - 1 ? t('onboarding.button_start') : t('onboarding.button_next')}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                </TouchableOpacity>

            </View>
        </RamadanBackground>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },
    headerRow: {
        height: 44,
        justifyContent: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    iconContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    textContainer: {
        minHeight: 180, // Anchored height for text to prevent jitter
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
    },
    title: {
        fontSize: 34,
        fontWeight: '700', // Changed from 300 to match CommunityScreen header
        color: COLORS.primary,
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
        letterSpacing: -0.5, // Matches CommunityScreen header look
    },
    description: {
        fontSize: 17,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
    },
    progressBarContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 40,
    },
    progressSegment: {
        height: 6,
        borderRadius: 3,
        flex: 1, // Equal width for all
    },
    inactiveSegment: {
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    activeSegment: {
        backgroundColor: COLORS.primary,
        flex: 1.5, // Slightly wider for focus
    },
    activeGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    }
});

export default WelcomeScreen;
