import { useNavigation } from '@react-navigation/native';
import { Book, Pause, Play, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next'; // Assuming typical react-i18next or custom hook
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import '../i18n/i18n'; // Ensure i18n is initialized
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

const MiniPlayer = ({ currentRouteName }) => {
    const { t } = useTranslation();
    const { isPlaying, currentAyah, playAyah, pause, resume, stop, isLoading, playlistPosition } = useAudio();
    const { ramadanModeEnabled } = useTheme();
    const { position, duration } = useProgress(200);
    const navigation = useNavigation();

    // Conditional Bottom Positioning
    // Default: 85 (Above TabBar)
    // Screens with no TabBar: 30 (Bottom of screen)
    const screensWithNoTabBar = ['Shop', 'QiblaCompass', 'KaabaLive', 'ZakatCalculator', 'Community', 'HatimDetail', 'InfluencerDashboard', 'ReferralList', 'Premium', 'Auth'];
    const bottomPosition = screensWithNoTabBar.includes(currentRouteName) ? 30 : 85;
    // Note: 'Shop' logic already handled but made explicit for clarity.

    const widthStyle = isTablet ? 450 : '94%';

    if (!currentAyah) return null;

    // Theme values
    const bgColor = ramadanModeEnabled ? 'rgba(15, 12, 41, 0.98)' : 'rgba(255, 255, 255, 0.85)';
    const borderColor = ramadanModeEnabled ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0,0,0,0.05)';
    const primaryColor = ramadanModeEnabled ? '#FFD700' : COLORS.primary;
    const textColor = ramadanModeEnabled ? '#FFFFFF' : COLORS.textPrimary;
    const subTextColor = ramadanModeEnabled ? 'rgba(255,255,255,0.6)' : COLORS.textSecondary;

    // Calculate time-based progress percentage (Net Verse Progress)
    const timeProgressPercent = (duration > 0 && position >= 0)
        ? Math.min((position / duration) * 100, 100)
        : 0;

    // Format seconds to mm:ss
    const formatTime = (seconds) => {
        const totalSeconds = Math.floor(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTime = formatTime(position);
    const totalTime = duration > 0 ? formatTime(duration) : '--:--';

    const handlePress = () => {
        navigation.navigate('Main', {
            screen: 'Quran',
            params: {
                targetSurahNumber: currentAyah.surahNumber || (currentAyah.surah && currentAyah.surah.number),
                targetAyahNumber: currentAyah.number
            }
        });
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    bottom: bottomPosition,
                    width: widthStyle,
                    backgroundColor: bgColor,
                    borderColor: borderColor
                }
            ]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Time-based Progress Bar */}
            <View style={[styles.progressBar, ramadanModeEnabled && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.progressIndicator, { width: `${timeProgressPercent}%`, backgroundColor: primaryColor }]} />
            </View>

            <View style={styles.content}>
                <View style={[styles.iconBox, ramadanModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                    <Book color={primaryColor} size={20} />
                </View>

                <View style={styles.info}>
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                        {String(currentAyah.surahName || t('common.surah'))}
                    </Text>
                    <View style={styles.timeRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={[styles.subtitle, { color: subTextColor }]} numberOfLines={1}>
                                {currentAyah.juz ? `${t('common.juz')} ${currentAyah.juz} • ` : ''}
                                {String(t('common.ayah'))} {String(currentAyah.numberInSurah)} / {String(currentAyah.surah?.numberOfAyahs || currentAyah.totalAyahs || currentAyah.surahTotalAyahs || '–')}
                            </Text>
                        </View>
                        <View style={{ minWidth: 60, alignItems: 'flex-end' }}>
                            <Text style={[styles.timeText, { color: subTextColor }]} numberOfLines={1}>
                                {String(currentTime)} / {String(totalTime)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={isPlaying ? pause : resume}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={primaryColor} />
                        ) : isPlaying ? (
                            <Pause size={24} color={primaryColor} fill={primaryColor} />
                        ) : (
                            <Play size={24} color={primaryColor} fill={primaryColor} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.controlBtn, { marginLeft: 10 }]} onPress={stop}>
                        <X size={20} color={subTextColor} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // Bottom is dynamic
        // Width is dynamic
        maxWidth: TABLET_MAX_WIDTH,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    progressBar: {
        height: 2,
        backgroundColor: '#F0F0F0',
        width: '100%',
    },
    progressIndicator: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light primary tint
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    timeText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlBtn: {
        padding: 10,
    }
});

export default MiniPlayer;
