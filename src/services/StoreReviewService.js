import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_LAST_REVIEW = 'last_store_review_request';
const STORAGE_KEY_AMEN_COUNT = 'review_amen_count';
const STORAGE_KEY_LAUNCH_COUNT = 'review_launch_count';

// Minimum days to wait between requests (to avoid annoying users)
const MIN_DAYS_BETWEEN_REQUESTS = 120; // ~4 months

/**
 * Smart Review Service
 * Triggers StoreReview based on high-satisfaction user moments.
 */
class StoreReviewService {

    /**
     * Check if we can request a review based on time constraint
     */
    async _canRequestReview() {
        try {
            if (!(await StoreReview.hasAction())) {
                return false;
            }

            const lastRequestStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_REVIEW);
            if (!lastRequestStr) return true;

            const lastRequestDate = new Date(parseInt(lastRequestStr));
            const now = new Date();
            const daysSinceOnly = (now - lastRequestDate) / (1000 * 60 * 60 * 24);

            return daysSinceOnly >= MIN_DAYS_BETWEEN_REQUESTS;
        } catch (error) {
            console.error('StoreReviewService check error:', error);
            return false;
        }
    }

    /**
     * Record that we just requested a review
     */
    async _markReviewRequested() {
        await AsyncStorage.setItem(STORAGE_KEY_LAST_REVIEW, Date.now().toString());
    }

    /**
     * Trigger: First Dream Interpretation
     * "Users are happiest when they get value (a dream interpreted)."
     */
    async checkDreamReview() {
        try {
            const hasRequested = await AsyncStorage.getItem('review_dream_trigger');
            if (hasRequested === 'true') return;

            if (await this._canRequestReview()) {
                // Small delay to let them read the header/first sentence
                setTimeout(async () => {
                    await StoreReview.requestReview();
                    await this._markReviewRequested();
                    await AsyncStorage.setItem('review_dream_trigger', 'true');
                }, 2000);
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Trigger: First Community Interaction (Amen)
     * "Social proof and contribution makes users feel part of the community."
     */
    async checkAmenReview() {
        try {
            const hasRequested = await AsyncStorage.getItem('review_amen_trigger');
            if (hasRequested === 'true') return;

            // Count amens to ensure they are actually engaged (e.g., after 3rd amen)
            const currentCountStr = await AsyncStorage.getItem(STORAGE_KEY_AMEN_COUNT) || '0';
            let count = parseInt(currentCountStr) + 1;
            await AsyncStorage.setItem(STORAGE_KEY_AMEN_COUNT, count.toString());

            if (count >= 3 && await this._canRequestReview()) {
                await StoreReview.requestReview();
                await this._markReviewRequested();
                await AsyncStorage.setItem('review_amen_trigger', 'true');
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Trigger: Hatim or Dhikr Completed
     * "Completion creates a sense of achievement."
     */
    async checkCompletionReview() {
        try {
            const hasRequested = await AsyncStorage.getItem('review_completion_trigger');
            // We can ask again for completions if enough time passed, so we might not block strictly on 'true'
            // But for now, let's track it loosely.

            if (await this._canRequestReview()) {
                await StoreReview.requestReview();
                await this._markReviewRequested();
                await AsyncStorage.setItem('review_completion_trigger', 'true');
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Trigger: 7-Day Active Streak (via Notification or App Open)
     * "Loyal users are most likely to rate highly."
     */
    async checkNotificationReview() {
        try {
            // Logic to track streaks would go here, simplified to "Launch Count" for now
            const currentLaunches = await AsyncStorage.getItem(STORAGE_KEY_LAUNCH_COUNT) || '0';
            let count = parseInt(currentLaunches) + 1;
            await AsyncStorage.setItem(STORAGE_KEY_LAUNCH_COUNT, count.toString());

            // If they opened the app 10 times, they are likely retained
            if (count === 10 && await this._canRequestReview()) {
                await StoreReview.requestReview();
                await this._markReviewRequested();
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export default new StoreReviewService();
