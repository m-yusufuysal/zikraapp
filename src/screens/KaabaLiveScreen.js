import * as ScreenOrientation from 'expo-screen-orientation';
import { ChevronLeft } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import RamadanBackground from '../components/RamadanBackground';
import { COLORS, FONTS } from '../utils/theme';

// Backup Live Stream IDs (Makkah Live 24/7)
// We rotate through these if one fails or ends
const LIVE_STREAMS = [
    '7-Qf3g-0xEI', // Makkah Live 1
    'Lq1r-JEko9s', // Makkah Live 2
    'Cm1v4bteXbI', // Makkah Live 3
    'hJXdc9MRC2A', // Backup 1
    '21X5lGlDOfg', // Backup 2
];

const KaabaLiveScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [playing, setPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
    const [errorCount, setErrorCount] = useState(0); // Track errors to prevent infinite loops

    useEffect(() => {
        // Unlock orientation for full screen viewing experience
        const unlockOrientation = async () => {
            await ScreenOrientation.unlockAsync();
        };
        unlockOrientation();

        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, []);

    const handleStreamError = useCallback(() => {
        // Stream failed/ended - switching to next

        if (errorCount > LIVE_STREAMS.length * 2) {
            // If we cycled through all streams twice and they all failed, stop.
            setPlaying(false);
            setLoading(false);
            Alert.alert(t('kaaba.stream_ended_title'), t('kaaba.stream_connection_error'));
            return;
        }

        setLoading(true);
        setErrorCount(prev => prev + 1);
        setCurrentStreamIndex(prev => (prev + 1) % LIVE_STREAMS.length);
    }, [currentStreamIndex, errorCount, t]);

    const onStateChange = useCallback((state) => {
        if (state === "ended") {
            handleStreamError();
        } else if (state === "buffering" || state === "unstarted") {
            setLoading(true);
        } else if (state === "playing") {
            setLoading(false);
            setErrorCount(0); // Reset error count on successful play
        }
    }, [handleStreamError]);

    return (
        <RamadanBackground forceNormalMode={true} customStandardGradient={['#000', '#000']}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('quran.kaaba_live')}</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Live Stream Container */}
            <View style={styles.streamContainer}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>
                            {errorCount > 0 ? t('kaaba.reconnecting') : t('loading')}
                        </Text>
                    </View>
                )}

                <View style={styles.videoWrapper}>
                    <YoutubePlayer
                        height={240} // 16:9 Aspect Ratio for standard width
                        play={playing}
                        videoId={LIVE_STREAMS[currentStreamIndex]}
                        onChangeState={onStateChange}
                        onReady={() => setLoading(false)}
                        onError={handleStreamError} // Catch playback errors
                        initialPlayerParams={{
                            modestbranding: true,
                            rel: false,
                            showinfo: false,
                            iv_load_policy: 3, // Hide annotations
                            controls: 1,
                        }}
                        webViewProps={{
                            allowsFullscreenVideo: true,
                            javaScriptEnabled: true,
                            domStorageEnabled: true,
                            mediaPlaybackRequiresUserAction: false,
                            startInLoadingState: true,
                        }}
                    />
                </View>
            </View>

            {/* Info Section - Moved to bottom */}
            <View style={styles.infoContainer}>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{t('kaaba.live_badge')}</Text>
                </View>
                <Text style={styles.streamTitle}>{t('kaaba.stream_title')}</Text>
                <Text style={styles.streamSubtitle}>{t('kaaba.stream_subtitle')}</Text>
            </View>
        </RamadanBackground >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Black background for cinematic feel
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#000',
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        ...FONTS.h3,
        color: '#FFF', // Ensure white overrides FONTS.h3 color
    },
    streamContainer: {
        flex: 1,
        justifyContent: 'center', // Center the video slightly/vertically
        backgroundColor: '#000',
    },
    videoWrapper: {
        width: '100%',
        backgroundColor: '#000',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: COLORS.primary,
        marginTop: 10,
        fontSize: 14,
    },
    infoContainer: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#111',
        borderTopLeftRadius: 30, // More rounded "liquid" feel like the buttons
        borderTopRightRadius: 30,
        paddingBottom: 50, // More space at bottom
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.5)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
        marginRight: 6,
    },
    liveText: {
        color: '#FFF', // Changed to white as requested ("canli kabe yazisini beyaz yap")
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    streamTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    streamSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    noteText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default KaabaLiveScreen;
