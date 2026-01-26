import { supabase } from './supabase';

/**
 * Community Notification Service
 * Handles fetching and real-time listening for community alerts.
 */
export const getCommunityNotifications = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('community_notifications')
            .select(`
                *,
                sender:sender_id (
                    full_name,
                    avatar_url,
                    location
                ),
                post:post_id (
                    title,
                    type
                ),
                hatim:hatim_id (
                    title
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('getCommunityNotifications Error:', error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const { error } = await supabase
            .from('community_notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('markNotificationAsRead Error:', error);
        return false;
    }
};

export const getUnreadNotificationCount = async (userId) => {
    try {
        const { count, error } = await supabase
            .from('community_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('getUnreadNotificationCount Error:', error);
        return 0;
    }
};

export const markAllNotificationsAsRead = async (userId) => {
    try {
        const { error } = await supabase
            .from('community_notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('markAllNotificationsAsRead Error:', error);
        return false;
    }
};

export const subscribeToNotifications = (userId, onNotification) => {
    return supabase
        .channel(`public:community_notifications:user_id=eq.${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'community_notifications',
            filter: `user_id=eq.${userId}`
        }, (payload) => {
            onNotification(payload.new);
        })
        .subscribe();
};
