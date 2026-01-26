import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

let InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, TestIds;

// Safe import for Native Module
if (!isExpoGo) {
    try {
        const MobileAds = require('react-native-google-mobile-ads');
        InterstitialAd = MobileAds.InterstitialAd;
        RewardedAd = MobileAds.RewardedAd;
        AdEventType = MobileAds.AdEventType;
        RewardedAdEventType = MobileAds.RewardedAdEventType;
        TestIds = MobileAds.TestIds;
    } catch (e) {
        console.warn("AdMob module not found, using mocks.");
    }
}

const INTERSTITIAL_ID = (!isExpoGo && TestIds) ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxx/mock-id';
const REWARDED_ID = (!isExpoGo && TestIds) ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxx/mock-id';

let interstitial = null;
let rewarded = null;
let interstitialLoaded = false;
let rewardedLoaded = false;

export const loadInterstitial = () => {
    if (isExpoGo || !InterstitialAd) {
        interstitialLoaded = true;
        return;
    }
    AsyncStorage.getItem('isPremium').then(isPremium => {
        if (isPremium === 'true') return;
        interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
            requestNonPersonalizedAdsOnly: true,
        });
        interstitial.addAdEventListener(AdEventType.LOADED, () => { interstitialLoaded = true; });
        interstitial.load();
    });
};

export const loadRewarded = () => {
    if (isExpoGo || !RewardedAd) {
        rewardedLoaded = true;
        return;
    }
    AsyncStorage.getItem('isPremium').then(isPremium => {
        if (isPremium === 'true') return;
        rewarded = RewardedAd.createForAdRequest(REWARDED_ID, {
            requestNonPersonalizedAdsOnly: true,
        });
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => { rewardedLoaded = true; });
        rewarded.load();
    });
};

export const showInterstitial = async () => {
    const isPremium = await AsyncStorage.getItem('isPremium') === 'true';
    if (isPremium) return true;

    if (isExpoGo || !InterstitialAd) {
        return new Promise(resolve => {
            Alert.alert("Ad Placeholder", "Interstitial Ad would show here.", [{ text: "Close", onPress: () => resolve(true) }]);
        });
    }

    if (interstitialLoaded && interstitial) {
        return new Promise((resolve) => {
            interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                interstitialLoaded = false;
                loadInterstitial();
                resolve(true);
            });
            interstitial.show();
        });
    } else {
        loadInterstitial();
        return true;
    }
};

export const showRewarded = async () => {
    const isPremium = await AsyncStorage.getItem('isPremium') === 'true';
    if (isPremium) return true;

    if (isExpoGo || !RewardedAd) {
        return new Promise(resolve => {
            Alert.alert(
                "Watch Ad to Continue",
                "This is a mocked Rewarded Ad for Expo Go.",
                [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Watch (Mock)", onPress: () => resolve(true) }
                ]
            );
        });
    }

    if (rewardedLoaded && rewarded) {
        return new Promise((resolve) => {
            let earnedReward = false;
            rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                earnedReward = true;
            });
            rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
                rewardedLoaded = false;
                loadRewarded();
                resolve(earnedReward);
            });
            rewarded.show();
        });
    } else {
        // Ad not ready yet. Reloading and allowing user to proceed to avoid blocker.
        loadRewarded();
        // Fallback: If ad isn't ready, let them pass for now to prevent app appearing "broken"
        // In production, you might want to show a strict "Loading..." alert, but for now we unblock.
        return true;
    }
};

// Start loading on import (if not premium check handles itself inside)
setTimeout(() => {
    loadInterstitial();
    loadRewarded();
}, 2000);
