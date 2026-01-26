import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP_ID = 'group.com.yusuf.zikraapp';

export const WidgetService = {
    async updateWidgetData(prayerTimes, dailyVerse, locationName) {
        try {
            if (!prayerTimes) return;

            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();

            const getMins = (str) => {
                const [h, m] = str.split(':');
                return parseInt(h) * 60 + parseInt(m);
            };

            const prayers = [
                { name: 'Fajr', time: getMins(prayerTimes.Fajr), display: prayerTimes.Fajr },
                { name: 'Dhuhr', time: getMins(prayerTimes.Dhuhr), display: prayerTimes.Dhuhr },
                { name: 'Asr', time: getMins(prayerTimes.Asr), display: prayerTimes.Asr },
                { name: 'Maghrib', time: getMins(prayerTimes.Maghrib), display: prayerTimes.Maghrib },
                { name: 'Isha', time: getMins(prayerTimes.Isha), display: prayerTimes.Isha }
            ];

            let next = prayers.find(p => p.time > currentMins);
            if (!next) {
                next = { ...prayers[0], time: prayers[0].time + 1440 }; // Next day Fajr
            }

            const diff = next.time - currentMins - (next.time > 1440 && currentMins > 1440 ? 1440 : 0);
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            const timeLeft = `${h}h ${m}m`;

            const widgetData = {
                nextPrayerName: next.name,
                nextPrayerTime: next.display,
                prayerTimeLeft: timeLeft,
                dailyQuote: dailyVerse?.verse?.text || "Zikra App",
                dailyQuoteSource: dailyVerse?.verse?.sourceDisplay || "Open App",
                location: locationName || "Zikra"
            };

            if (SharedGroupPreferences && SharedGroupPreferences.setItem) {
                await SharedGroupPreferences.setItem('widgetData', widgetData, APP_GROUP_ID);
                console.log('[Widget] Data updated successfully');
            } else {
                console.log('[Widget] SharedGroupPreferences not available');
            }
        } catch (error) {
            console.warn('[Widget] Failed to update:', error);
        }
    }
};
