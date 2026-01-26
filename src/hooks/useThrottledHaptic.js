/**
 * Throttled Haptic Feedback Hook
 * 
 * Purpose: Prevents UI freezing when user taps rapidly (e.g., 10+ taps/second on Zikir counter).
 * Uses lodash.throttle to rate-limit haptic feedback calls.
 */
import * as Haptics from 'expo-haptics';
import throttle from 'lodash.throttle';
import { useRef } from 'react';
import { Platform, Vibration } from 'react-native';

const THROTTLE_MS = 80; // Minimum interval between haptic triggers

/**
 * Returns a memoized, throttled haptic trigger function.
 * Prevents overwhelming the haptic engine on rapid taps.
 */
export const useThrottledHaptic = () => {
    const throttledHapticRef = useRef(
        throttle(() => {
            if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
                Vibration.vibrate(10);
            }
        }, THROTTLE_MS, { leading: true, trailing: false })
    );

    return throttledHapticRef.current;
};

/**
 * Throttled Medium Impact (for step completion)
 */
export const useThrottledMediumHaptic = () => {
    const throttledHapticRef = useRef(
        throttle(() => {
            if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else {
                Vibration.vibrate(25);
            }
        }, THROTTLE_MS * 2, { leading: true, trailing: false })
    );

    return throttledHapticRef.current;
};

/**
 * Throttled Success Notification (for completion)
 */
export const useThrottledSuccessHaptic = () => {
    const throttledHapticRef = useRef(
        throttle(() => {
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Vibration.vibrate([0, 50, 50, 100]);
            }
        }, 500, { leading: true, trailing: false })
    );

    return throttledHapticRef.current;
};
