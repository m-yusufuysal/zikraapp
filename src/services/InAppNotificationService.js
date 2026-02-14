import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n/i18n';
import { supabase } from './supabase';

/**
 * InAppNotificationService
 * Listens for Supabase interaction events and triggers LOCAL Phone Notifications.
 * This ensures notifications are always in the current app language.
 */
class InAppNotificationService {
    subscription = null;
    onNotification = null;

    init(userId) {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        console.log('[InAppNotification] Starting listener for user:', userId);

        this.subscription = supabase
            .channel(`public:community_notifications:user_id=eq.${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'community_notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                console.log('[InAppNotification] REALTIME INSERT detected:', payload.new);
                this.handleNewNotification(payload.new);
            })
            .subscribe((status) => {
                console.log('[InAppNotification] Subscription status for', userId, ':', status);
            });
    }

    handleNewNotification = async (notification) => {
        try {
            const { type } = notification;
            const t = i18n.t.bind(i18n);

            let title = t('community.notifications');
            let body = '';

            // Map type to localized message
            switch (type) {
                case 'amen':
                    body = t('community.amen_desc');
                    break;
                case 'prayed':
                    body = t('community.prayed_desc');
                    break;
                case 'support':
                    body = t('community.support_desc');
                    break;
                case 'new_product':
                    body = t('community.new_product_desc');
                    title = '🛍️ Zikra Shop';
                    break;
                case 'hatim_slot_taken':
                    body = t('community.hatim_slot_taken_desc');
                    break;
                case 'hatim_completed':
                    body = t('community.hatim_completed_desc') || "Allah kabul etsin! Hatim tamamlandı. 🌟";
                    title = '📖 Hatim Tamamlandı';
                    break;
                case 'dhikr_completed':
                    body = t('dhikr.completed_msg') || "Allah kabul etsin! Zikriniz tamamlandı. ✨";
                    title = '📿 Zikir Tamamlandı';
                    break;
                default:
                    return; // Ignore unknown types
            }

            // Trigger standard Phone Notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    body: body,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    ...(Platform.OS === 'android' && { channelId: 'engagement' }),
                },
                trigger: null, // Send immediately
            });

            // Trigger internal listener for UI updates (like badges)
            if (this.onNotification) {
                this.onNotification(notification);
            }

        } catch (error) {
            console.error('[InAppNotification] Trigger Error:', error);
        }
    };

    stop() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

export default new InAppNotificationService();
