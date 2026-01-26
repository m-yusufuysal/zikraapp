import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n/i18n';
import { scheduleAllPrayerNotifications, schedulePromotionalNotifications, scheduleSpecialDayNotifications } from '../utils/notifications';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Zikra Notification Service
 * Handles initialization and centralized notification scheduling
 * 
 * NOTE: This is the ONLY place where cancelAllScheduledNotificationsAsync 
 * and full re-scheduling should be called.
 */
const NotificationService = {

    /**
     * Initialize notifications and request permissions
     */
    init: async () => {
        if (Platform.OS === 'android') {
            // Adhan channel with MAX importance (to bypass battery optimizations/DND)
            await Notifications.setNotificationChannelAsync('adhan', {
                name: 'Ezan Bildirimleri',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10B981',
                sound: 'adhan.mp3',
            });

            // Engagement channel for reminders
            await Notifications.setNotificationChannelAsync('engagement', {
                name: 'Günlük Hatırlatmalar',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10B981',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('[NotificationService] Status: Not granted');
            return false;
        }

        return true;
    },

    /**
     * UNIFIED SCHEDULER
     * Clears all old notifications and sets up EVERYTHING fresh.
     */
    scheduleAllNotifications: async (timings = null, language = 'tr') => {
        try {
            console.log('[NotificationService] --- STARTING UNIFIED SCHEDULING ---');

            // 1. FULL CLEANUP (Crucial to prevent ID collisions or ghost notifications)
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('[NotificationService] 1. Cancelled all existing notifications');

            // 2. Schedule Prayer Times (if available)
            if (timings) {
                await scheduleAllPrayerNotifications(timings, language);
                console.log('[NotificationService] 2. Rescheduled Prayer Notifications');
            } else {
                console.log('[NotificationService] 2. Skipped Prayers (no timings provided)');
            }

            // 3. Schedule Special Islamic Days
            await scheduleSpecialDayNotifications(language);
            console.log('[NotificationService] 3. Rescheduled Special Day Notifications');

            // 4. Schedule Promotional/Engagement Reminders
            await schedulePromotionalNotifications(language);
            console.log('[NotificationService] 4. Rescheduled Promotional Notifications');

            console.log('[NotificationService] --- UNIFIED SCHEDULING COMPLETE ---');
        } catch (error) {
            console.error('[NotificationService] Full scheduling error:', error);
        }
    },

    /**
     * Schedule the daily engagement notifications ONLY (fallback if timings not known yet)
     */
    scheduleDailyNotifications: async () => {
        const language = i18n.language?.split('-')[0] || 'tr';
        await NotificationService.scheduleAllNotifications(null, language);
    },

    /**
     * Test notification (for debug)
     */
    sendTestNotification: async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Zikra Test",
                body: "Bildirimler sorunsuz çalışıyor! 🔔",
            },
            trigger: null, // Send immediately
        });
    }
};

export default NotificationService;
