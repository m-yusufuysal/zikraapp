import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    RepeatMode,
    State,
    useProgress,
    useTrackPlayerEvents
} from 'react-native-track-player';

const AudioContext = createContext();
const AudioProgressContext = createContext();
// Removed problematic artwork require to fix Metro resolution error
// const appLogo = require('../../assets/images/splash-icon.png');

export const useAudio = () => useContext(AudioContext);
export const useAudioProgress = () => useContext(AudioProgressContext);

export const AudioProvider = ({ children }) => {
    const { t } = useTranslation();
    const [isSetup, setIsSetup] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyah, setCurrentAyah] = useState(null);
    const [playbackContext, setPlaybackContext] = useState(null); // { type: 'surah' | 'juz', id: number }
    const [isLoading, setIsLoading] = useState(false);

    // Store original ayahs list to map back from Track ID
    const playlistRef = useRef([]);
    const appStateRef = useRef(AppState.currentState);
    const setupAttempted = useRef(false);

    // Initialize TrackPlayer once
    useEffect(() => {
        const setupPlayer = async () => {
            // Prevent multiple setup attempts
            if (setupAttempted.current) return;
            setupAttempted.current = true;

            try {
                // Configure Expo Audio for background playback
                // CRITICAL: This ensures the audio session stays active in background/lock screen
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                    playThroughEarpieceAndroid: false
                });

                if (__DEV__) console.log('[AudioContext] Setting up TrackPlayer...');

                // Check if player is already setup
                try {
                    const state = await TrackPlayer.getPlaybackState();
                    if (state) {
                        if (__DEV__) console.log('[AudioContext] TrackPlayer already initialized');
                        setIsSetup(true);
                        return;
                    }
                } catch (e) {
                    // Player not initialized, continue with setup
                }

                await TrackPlayer.setupPlayer({
                    // AGGRESSIVE BUFFER: Drastically reduced minBuffer to prevent stalling
                    minBuffer: 5,        // Reduced from 15s -> 5s (prevents blocking on slow connections)
                    maxBuffer: 300,      // Increased to allow massive lookahead
                    playBuffer: 1.5,     // Reduced to 1.5s for instant start
                    backBuffer: 60,      // Keep previous audio
                    waitForBuffer: false, // Don't block playback waiting for full buffer
                });

                // Configure player options for background playback
                await TrackPlayer.updateOptions({
                    // CRITICAL: Continue playback when app is killed
                    android: {
                        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
                        stopForegroundOnPause: false, // Keep notification when paused (prevents service kill)
                        alwaysPauseOnInterruption: false,
                    },
                    // CRITICAL: iOS Background Audio Category
                    ios: {
                        category: 'playback',
                        categoryMode: 'default',
                        categoryOptions: ['allowAirPlay', 'allowBluetooth', 'allowBluetoothA2DP'],
                    },
                    // Control center capabilities
                    capabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                        Capability.Stop,
                        Capability.SeekTo,
                    ],
                    compactCapabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                    ],
                    notificationCapabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                        Capability.Stop,
                    ],
                    // Progress update interval (for lock screen)
                    progressUpdateEventInterval: 2,
                });

                if (__DEV__) console.log('[AudioContext] TrackPlayer setup complete');
                setIsSetup(true);

            } catch (error) {
                // Handle common initialization errors
                if (error.message?.includes('already') || error.code === 'player_already_initialized') {
                    if (__DEV__) console.log('[AudioContext] Player already initialized (checking state)');
                    setIsSetup(true);
                } else {
                    console.error('[AudioContext] TrackPlayer Setup Error:', error);
                }
            }
        };

        const preloadRemainingQueue = async () => {
            try {
                if (!playlistRef.current?.length) return;

                const currentQueueSize = (await TrackPlayer.getQueue()).length;
                // LIMIT: Only preload next 20 tracks to prevent memory pressure
                const MAX_PRELOAD = 20;
                const remaining = playlistRef.current.slice(currentQueueSize, currentQueueSize + MAX_PRELOAD);

                if (remaining.length > 0) {
                    const tracksToAdd = remaining.map(buildTrack).filter(t => t.url);

                    if (tracksToAdd.length > 0) {
                        if (__DEV__) console.log(`[AudioContext] Preloading next ${tracksToAdd.length} tracks (limited)`);
                        await TrackPlayer.add(tracksToAdd);
                    }
                }
            } catch (e) {
                console.warn('[AudioContext] Preload queue error:', e);
            }
        };

        setupPlayer();

        // Handle app state changes
        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                if (__DEV__) console.log('[AudioContext] App came to foreground');
                syncPlaybackState();
            }
            if (nextAppState === 'background') {
                preloadRemainingQueue();
            }
            appStateRef.current = nextAppState;
        });

        return () => {
            // Clean up if needed, but DO NOT destroy player as we want bg audio
            appStateSubscription?.remove();
        };
    }, []);

    // Sync playback state (useful when returning from background)
    const syncPlaybackState = async () => {
        try {
            const state = await TrackPlayer.getPlaybackState();
            setIsPlaying(state.state === State.Playing);
            setIsLoading(state.state === State.Buffering || state.state === State.Loading);

            const currentIndex = await TrackPlayer.getActiveTrackIndex();
            if (currentIndex !== undefined && currentIndex !== null && playlistRef.current[currentIndex]) {
                setCurrentAyah(playlistRef.current[currentIndex]);
            }
        } catch (e) {
            console.warn('[AudioContext] Sync state failed:', e);
        }
    };

    // Sync Playback State Events
    useTrackPlayerEvents(
        [Event.PlaybackState, Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded, Event.PlaybackError],
        async (event) => {
            if (event.type === Event.PlaybackState) {
                const playing = event.state === State.Playing;
                const loading = event.state === State.Buffering || event.state === State.Loading;
                setIsPlaying(playing);
                setIsLoading(loading);
            }

            if (event.type === Event.PlaybackActiveTrackChanged) {
                if (event.index !== undefined && event.index !== null) {
                    const index = event.index;
                    if (playlistRef.current && playlistRef.current[index]) {
                        setCurrentAyah(playlistRef.current[index]);
                        setPlaylistPosition({
                            current: index + 1,
                            total: playlistRef.current.length
                        });
                    }
                }
            }

            if (event.type === Event.PlaybackQueueEnded) {
                if (__DEV__) console.log('[AudioContext] Queue ended, resetting state');
                setCurrentAyah(null);
                setIsPlaying(false);
                setPlaylistPosition({ current: 0, total: 0 });
            }

            if (event.type === Event.PlaybackError) {
                console.warn('[AudioContext] Playback Error:', event);
                // Let TrackPlayerService handle recovery
            }
        }
    );

    // Window Size for Queue Batching
    const WINDOW_SIZE = 5;

    // ... (inside AudioProvider)

    const buildTrack = (item) => {
        // Title: Surah Name
        const title = item.surahName || `${t('quran.surah_label')} ${item.surahNumber}`;

        // Subtitle (Artist): Juz X • Ayah Y / Z
        const juzLabel = item.juz ? t('quran.juz_title', { number: item.juz }) : '';
        const totalAyahs = item.surah?.numberOfAyahs || item.totalAyahs || item.surahTotalAyahs || '–';
        const ayahLabel = `${t('common.ayah') || 'Ayah'} ${item.numberInSurah} / ${totalAyahs}`;

        // Combine for Artist/Subtitle
        const artist = juzLabel ? `${juzLabel} • ${ayahLabel}` : ayahLabel;

        return {
            id: String(item.number),
            url: item.audio,
            title: title,
            artist: artist,
            album: title, // Use Surah name as album too for consistency
            description: artist,
            // artwork: appLogo, // Re-enable once the asset path is confirmed
            contentType: 'audio/mpeg',
            duration: item.duration ? item.duration / 1000 : undefined,
        };
    };

    // Main Play Function - Windowed Implementation
    const playAyah = async (ayah, list = [], context = null) => {
        if (!isSetup) return;

        // Sync local reference
        playlistRef.current = list;
        if (context) setPlaybackContext(context);
        setIsLoading(true);

        try {
            await TrackPlayer.reset();

            // 1. Find start index
            const startIndex = list.findIndex(item => item.number === ayah.number);
            if (startIndex === -1) {
                setIsLoading(false);
                return;
            }

            // 2. Load ENTIRE list at once (Full Queue Strategy)
            // This ensures native thread handles all transitions without JS intervention
            const tracks = list.map(buildTrack).filter(t => t.url);

            if (tracks.length === 0) {
                setIsLoading(false);
                return;
            }

            await TrackPlayer.add(tracks);

            // 3. Skip to the requested verse immediately
            if (startIndex > 0) {
                await TrackPlayer.skip(startIndex);
            }

            await TrackPlayer.play();
            await TrackPlayer.setRepeatMode(RepeatMode.Off);

        } catch (e) {
            console.error('[AudioContext] Play Error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const pause = async () => {
        try {
            await TrackPlayer.pause();
        } catch (e) {
            console.warn('[AudioContext] Pause error:', e);
        }
    };

    const resume = async () => {
        try {
            await TrackPlayer.play();
        } catch (e) {
            console.warn('[AudioContext] Resume error:', e);
        }
    };

    const stop = async () => {
        try {
            await TrackPlayer.reset();
            setCurrentAyah(null);
            setIsPlaying(false);
        } catch (e) {
            console.warn('[AudioContext] Stop error:', e);
        }
    };

    // Track Progress Hook (updates every 200ms)
    const progress = useProgress(200);

    // Calculate Playlist Position
    const [playlistPosition, setPlaylistPosition] = useState({ current: 0, total: 0 });

    return (
        <AudioContext.Provider value={{
            isPlaying,
            currentAyah,
            isLoading,
            playAyah,
            pause,
            resume,
            stop,
            playlistPosition,
            playbackContext
        }}>
            <AudioProgressContext.Provider value={progress}>
                {children}
            </AudioProgressContext.Provider>
        </AudioContext.Provider>
    );
};
