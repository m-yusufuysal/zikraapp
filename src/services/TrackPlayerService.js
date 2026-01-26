import TrackPlayer, { Event, State } from 'react-native-track-player';

/**
 * TrackPlayerService - Background Playback Service
 * 
 * This module handles audio playback events when the app is in the background
 * or the screen is locked. Critical for continuous Quran recitation.
 * 
 * IMPORTANT: This service runs in a separate JS thread (headless task)
 */

let isServiceRegistered = false;
let lastRecoveryAt = 0;
let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_COOLDOWN_MS = 30000; // 30 seconds

module.exports = async function () {
    // Prevent duplicate registrations
    if (isServiceRegistered) {
        console.log('[TrackPlayerService] Service already registered, skipping');
        return;
    }
    isServiceRegistered = true;
    console.log('[TrackPlayerService] Registering playback service...');

    // Remote Control Events (Lock Screen / Notification Controls)
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        console.log('[TrackPlayerService] RemotePlay received');
        try {
            await TrackPlayer.play();
        } catch (e) {
            console.warn('[TrackPlayerService] RemotePlay error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
        console.log('[TrackPlayerService] RemotePause received');
        try {
            await TrackPlayer.pause();
        } catch (e) {
            console.warn('[TrackPlayerService] RemotePause error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        console.log('[TrackPlayerService] RemoteStop received');
        try {
            await TrackPlayer.reset();
        } catch (e) {
            console.warn('[TrackPlayerService] RemoteStop error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        console.log('[TrackPlayerService] RemoteNext received');
        try {
            await TrackPlayer.skipToNext();
        } catch (e) {
            console.warn('[TrackPlayerService] RemoteNext error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        console.log('[TrackPlayerService] RemotePrevious received');
        try {
            await TrackPlayer.skipToPrevious();
        } catch (e) {
            console.warn('[TrackPlayerService] RemotePrevious error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
        console.log('[TrackPlayerService] RemoteSeek received:', event.position);
        try {
            await TrackPlayer.seekTo(event.position);
        } catch (e) {
            console.warn('[TrackPlayerService] RemoteSeek error:', e);
        }
    });

    // Audio Focus / Ducking (when phone call comes in, etc.)
    TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
        console.log('[TrackPlayerService] RemoteDuck received:', event);
        try {
            if (event.paused) {
                // Another app requested audio focus
                await TrackPlayer.pause();
            } else if (event.permanent) {
                // Permanent audio focus loss (e.g., phone call)
                await TrackPlayer.pause();
            } else {
                // Temporary ducking ended, resume playback
                await TrackPlayer.play();
            }
        } catch (e) {
            console.warn('[TrackPlayerService] RemoteDuck error:', e);
        }
    });

    // Playback Error Handling with Auto-Recovery
    TrackPlayer.addEventListener(Event.PlaybackError, async (event) => {
        console.error('[TrackPlayerService] Playback Error:', event);
        // Recovery is now handled centrally in PlaybackState handler
    });

    // Track Changed Event
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
        console.log('[TrackPlayerService] Active track changed:', event.index);
    });

    // Queue Ended Event
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
        console.log('[TrackPlayerService] Queue ended');
        // Do not auto-play here, respect the user's choice to stop at the end of surah/juz
    });

    // Playback State Changes - with Auto-Recovery for Premium Users
    TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
        console.log('[TrackPlayerService] Playback state changed:', event.state);

        // Auto-recovery for unexpected stops (buffer underrun, iOS interruption, etc.)
        if (event.state === State.Stopped || event.state === State.None || event.state === State.Error) {
            const now = Date.now();

            // Rate limit + max attempts to prevent endless loops
            if (now - lastRecoveryAt < RECOVERY_COOLDOWN_MS) {
                console.log('[TrackPlayerService] Skipping recovery (cooldown active)');
                return;
            }

            if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
                console.log('[TrackPlayerService] Max recovery attempts reached, stopping');
                return;
            }

            try {
                const queue = await TrackPlayer.getQueue();
                const currentIndex = await TrackPlayer.getActiveTrackIndex();

                // Only attempt recovery if we have tracks in queue
                if (queue.length > 0 && currentIndex !== undefined && currentIndex !== null) {
                    console.log(`[TrackPlayerService] Attempting auto-recovery (attempt ${recoveryAttempts + 1}/${MAX_RECOVERY_ATTEMPTS})...`);
                    lastRecoveryAt = now;
                    recoveryAttempts++;

                    // Wait a moment for any ongoing audio session issues to resolve
                    setTimeout(async () => {
                        try {
                            const state = await TrackPlayer.getPlaybackState();
                            if (state.state !== State.Playing) {
                                await TrackPlayer.play();
                                console.log('[TrackPlayerService] Auto-recovery successful');
                            }
                        } catch (e) {
                            console.warn('[TrackPlayerService] Auto-recovery play failed:', e);
                        }
                    }, 3000);
                }
            } catch (e) {
                console.warn('[TrackPlayerService] Auto-recovery check failed:', e);
            }
        }

        // Reset recovery counter on successful playback
        if (event.state === State.Playing) {
            recoveryAttempts = 0;
        }
    });

    console.log('[TrackPlayerService] Service registration complete');
};
