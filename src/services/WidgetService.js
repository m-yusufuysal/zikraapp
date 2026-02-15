import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { Platform } from 'react-native';

const APP_GROUP_IDENTIFIER = 'group.com.esat.islamvy';

export const WidgetService = {
    /**
     * Updates the iOS Widget with the latest data
     * @param {Object} data - The data to share
     * @param {Object} data.prayerTimes - Next prayer time info
     * @param {string} data.prayerTimes.nextPrayerName - e.g. "İkindi"
     * @param {string} data.prayerTimes.nextPrayerTime - e.g. "17:42"
     * @param {string} data.prayerTimes.remainingMinutes - e.g. "45"
     * @param {string} data.quote - Daily quote text
     * @param {string} data.quoteSource - Quote source/author
     */
    updateWidgetData: async (data) => {
        if (Platform.OS !== 'ios') return;

        try {
            // We save the data as a JSON string under a specific key that the Swift code will read
            // The Swift widget will read from UserDefaults(suiteName: "group.com.esat.islamvy")
            // Key: "widgetData"

            await SharedGroupPreferences.setItem('widgetData', data, APP_GROUP_IDENTIFIER);

            // Note: To force a reload of the widget, we might need to use a native module
            // or rely on the widget's own timeline policy.
            // Ideally, we would reload the timeline here using WidgetCenter.
            // For now, we just save the data.

            if (__DEV__) console.log('[WidgetService] Data saved to App Group:', data);
        } catch (error) {
            console.error('[WidgetService] Error saving data:', error);
        }
    },

    /**
     * Helper to format and save current app state to widget
     * Should be called whenever prayer times or quote changes
     */
    refreshWidget: async (nextPrayer, quote) => {
        const data = {
            prayerName: nextPrayer?.name || '',
            prayerTime: nextPrayer?.time || '',
            quote: quote?.body || '',
            quoteSource: quote?.title || ''
        };
        await WidgetService.updateWidgetData(data);
    }
};
