import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    // Load initial count from storage
    useEffect(() => {
        const loadCount = async () => {
            try {
                const savedCount = await AsyncStorage.getItem('unreadNotificationCount');
                if (savedCount !== null) {
                    setUnreadCount(parseInt(savedCount, 10));
                }
            } catch (e) {
                console.error('[NotificationContext] Failed to load count:', e);
            }
        };
        loadCount();
    }, []);

    // Persist count when it changes
    const updateCount = useCallback(async (newCount) => {
        try {
            setUnreadCount(newCount);
            await AsyncStorage.setItem('unreadNotificationCount', newCount.toString());
        } catch (e) {
            console.error('[NotificationContext] Failed to save count:', e);
        }
    }, []);

    const syncWithServer = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const { getUnreadNotificationCount } = require('../services/CommunityNotificationService');
            const count = await getUnreadNotificationCount(userId);
            updateCount(count);
        } catch (e) {
            console.error('[NotificationContext] Sync error:', e);
        }
    }, [updateCount]);

    const incrementUnreadCount = useCallback(() => {
        setUnreadCount(prev => {
            const next = prev + 1;
            AsyncStorage.setItem('unreadNotificationCount', next.toString()).catch(e =>
                console.error('[NotificationContext] Save error:', e)
            );
            return next;
        });
    }, []);

    const clearUnreadCount = useCallback(() => {
        setUnreadCount(0);
        AsyncStorage.setItem('unreadNotificationCount', '0').catch(e =>
            console.error('[NotificationContext] Save error:', e)
        );
    }, []);

    return (
        <NotificationContext.Provider value={{ unreadCount, incrementUnreadCount, clearUnreadCount, syncWithServer }}>
            {children}
        </NotificationContext.Provider>
    );
};
