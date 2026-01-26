import { ArrowRight, MapPin, Users } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Image, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
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
            <Circle cx="25" cy="20" r="3" fill={color} opacity="0.6" />
            <Circle cx="30" cy="75" r="2" fill={color} opacity="0.5" />
        </G>
        {/* Central glow */}
        <Circle cx="50" cy="50" r="8" fill={color} opacity="0.15" />
    </Svg>
);

const WelcomeScreen = ({ navigation, onFinish }) => {
    const { t } = useTranslation();
    const { ramadanModeEnabled } = useTheme();
    const insets = useSafeAreaInsets();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const slides = [
        {
            id: 1,
            titleKey: 'onboarding.slide1_title',
            descKey: 'onboarding.slide1_desc',
            icon: <Image
                source={ramadanModeEnabled ? require('../../assets/images/ramadan-icon.png') : require('../../assets/images/icon.png')}
                style={{ width: 150, height: 150, borderRadius: 30 }}
                resizeMode="contain"
            />
        },
        {
            id: 2,
            titleKey: 'onboarding.slide_ai_title',
            descKey: 'onboarding.slide_ai_desc',
            icon: <AISparkleIcon size={120} color={COLORS.accent} />
        },
        {
            id: 3,
            titleKey: 'onboarding.slide_community_title',
            descKey: 'onboarding.slide_community_desc',
            icon: <Users color={COLORS.accent} size={100} />
        },
        {
            id: 4,
            titleKey: 'onboarding.slide2_title', // Prayer & Adhan
            descKey: 'onboarding.slide2_desc',
            icon: <MapPin color={COLORS.accent} size={100} />
        }
    ];

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 20;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 50) {
                    // Swipe Right -> Go Back
                    handlePrev();
                } else if (gestureState.dx < -50) {
                    // Swipe Left -> Go Forward
                    handleNext();
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
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
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
        fontWeight: '300',
        color: COLORS.primary,
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
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
