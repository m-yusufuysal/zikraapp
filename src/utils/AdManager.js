import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

// Production Ad Unit ID
const PRODUCTION_AD_UNIT_ID = 'ca-app-pub-7375934958502426/4348540513';

// Use Test ID if in development, otherwise use Production ID
const adUnitId = __DEV__ ? TestIds.REWARDED : PRODUCTION_AD_UNIT_ID;

let rewarded = null;
let adLoaded = false;

export const loadRewardedAd = () => {
    // If already loaded, don't reload to avoid unnecessary requests
    if (adLoaded && rewarded) return;

    // Create a new RewardedAd instance
    rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
    });

    // Event Listener: Ad Loaded
    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        adLoaded = true;
        console.log('Rewarded Ad loaded');
    });

    // Event Listener: Ad Earned Reward (Handled globally here for debugging/tracking if needed)
    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('User earned reward:', reward);
    });

    // Event Listener: Ad Closed (Load a new one for next time)
    rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        console.log('Ad closed');
        adLoaded = false;
        rewarded = null; // Cleanup
        loadRewardedAd(); // Preload next ad
    });

    // Event Listener: Ad Error
    rewarded.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
        console.warn('Ad load error:', error);
        adLoaded = false;
        rewarded = null;
    });

    rewarded.load();
};

export const showRewardedAd = () => {
    return new Promise((resolve, reject) => {
        if (adLoaded && rewarded) {
            let userEarnedReward = false;

            // Track if user earned reward
            const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
                userEarnedReward = true;
            });

            // Resolve promise when ad closes
            const unsubscribeClosed = rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
                // Cleanup local listeners
                if (unsubscribeEarned) unsubscribeEarned();
                if (unsubscribeClosed) unsubscribeClosed();

                resolve(userEarnedReward);
            });

            rewarded.show();
        } else {
            // Ad not ready - try to load for next time
            console.log("Ad not ready, attempting reload...");
            loadRewardedAd();

            // Fail gracefully (or optionally return true to not block user if acceptable policy)
            // For rigorous monetization, return false. For better UX on weak connection, return true?
            // User requested: "revenue usually covers OpenAI cost". 
            // Better to return false and ask user to try again if ad is mandatory.
            // BUT `DreamInterpretation.js` logic expects `true` to proceed. 
            // Let's return false so the "Watch Ad" prompt stays or alerts "Ad not ready".
            resolve(false);
        }
    });
};
