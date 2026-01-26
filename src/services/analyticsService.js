import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Zikra Analytics Service
 * 
 * Provides tracking for user behavior to identify churn points and improve engagement.
 * Designed to be easily swappable with Mixpanel, Amplitude, or Google Analytics.
 */

const ANALYTICS_ENABLED_KEY = 'analytics_enabled';

class AnalyticsService {
    constructor() {
        this.enabled = true;
        this.user_id = null;
        this.init();
    }

    async init() {
        // Check local consent
        const consent = await AsyncStorage.getItem(ANALYTICS_ENABLED_KEY);
        // Default to true if not set (implied consent until opted out)
        this.enabled = consent !== 'false';
    }

    async setUserId(id) {
        this.user_id = id;
    }

    async logScreenView(screenName, params = {}) {
        if (!this.enabled) return;

        const event = {
            type: 'screen_view',
            screen: screenName,
            timestamp: new Date().toISOString(),
            ...params
        };

        // Development logging removed for production
        this._sendEvent(event);
    }

    async logEvent(eventName, properties = {}) {
        if (!this.enabled) return;

        const event = {
            type: 'event',
            name: eventName,
            timestamp: new Date().toISOString(),
            ...properties
        };

        // Development logging removed for production
        this._sendEvent(event);
    }

    async _sendEvent(eventPayload) {
        // Here we would send to Mixpanel/GA
        // For now, we optionally log to Supabase if you want persistence
        // or just keep it client-side for debugging / future implementation.

        /* 
        // Example Supabase logging (optional, can be enabled later)
        try {
            await supabase.from('analytics_logs').insert({
                user_id: this.user_id,
                event_type: eventPayload.type,
                event_name: eventPayload.name || eventPayload.screen,
                metadata: eventPayload
            });
        } catch (e) {
            // diverse analytics errors shouldn't crash app
        }
        */
    }

    async setEnabled(enabled) {
        this.enabled = enabled;
        await AsyncStorage.setItem(ANALYTICS_ENABLED_KEY, enabled.toString());
    }
}

export const analytics = new AnalyticsService();
