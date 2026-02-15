import { ArrowLeft, ChevronDown, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    LayoutAnimation,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { COLORS } from '../utils/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }) => {
    const [expanded, setExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
        Animated.timing(animation, {
            toValue: expanded ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const rotateInterpolate = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <TouchableOpacity
            style={[styles.faqCard, expanded && styles.faqCardExpanded]}
            onPress={toggleExpand}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <Text style={styles.questionText}>{question}</Text>
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                    <ChevronDown size={20} color={COLORS.textSecondary} />
                </Animated.View>
            </View>
            {expanded && (
                <View style={styles.answerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.answerText}>{answer}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const SupportScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const faqs = t('support.faqs', { returnObjects: true });

    const handleContact = () => {
        Linking.openURL('mailto:support@islamvy.com');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.matteBlack} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('support.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('support.faq_title')}</Text>
                    {Array.isArray(faqs) && faqs.map((item, index) => (
                        <FAQItem key={index} question={item.q} answer={item.a} />
                    ))}
                </View>

                <View style={styles.contactCard}>
                    <View style={styles.contactIconContainer}>
                        <Mail size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.contactTitle}>{t('support.contact_title')}</Text>
                    <Text style={styles.contactDesc}>{t('support.contact_desc')}</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                        <Text style={styles.contactButtonText}>{t('support.email_us')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundStart,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    faqCardExpanded: {
        borderColor: COLORS.primary + '30',
        backgroundColor: COLORS.primary + '05',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    questionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 20,
        marginRight: 12,
    },
    answerContainer: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 12,
    },
    answerText: {
        fontSize: 14,
        lineHeight: 22,
        color: COLORS.textSecondary,
    },
    contactCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    contactIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    contactTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    contactDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    contactButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
});

export default SupportScreen;
