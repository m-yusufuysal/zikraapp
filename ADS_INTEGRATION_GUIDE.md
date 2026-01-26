# Zikra App - AdMob Integration Guide

This guide details how to integrate Google AdMob (Banner, Interstitial, and Rewarded Ads) into the Zikra app using usage of `react-native-google-mobile-ads`.

## 1. AdMob Account Setup

1.  **Create Account**: Go to [apps.admob.com](https://apps.admob.com) and sign up.
2.  **Create App**:
    *   Click **Apps > Add App**.
    *   Platform: **Android** (do again for **iOS**).
    *   Is the app listed on a supported app store? **No** (select Yes later when published).
    *   Name: `Zikra Android` / `Zikra iOS`.
3.  **Get App IDs**:
    *   Go to **App Settings**.
    *   Copy the **App ID** (e.g., `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`).

## 2. Create Ad Units

For each platform (Android/iOS), create 3 ad units:

1.  **Banner Ad**:
    *   Type: **Banner**.
    *   Name: `Home_Banner` or `Quran_Banner`.
    *   Copy **Ad Unit ID** (e.g., `ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz`).
2.  **Interstitial Ad**:
    *   Type: **Interstitial**.
    *   Name: `Transition_Ad`.
    *   *Usage*: Show when switching major tabs or finishing a long surah.
3.  **Rewarded Ad**:
    *   Type: **Rewarded**.
    *   Name: `Premium_Feature_Reward`.
    *   *Usage*: Allow users to unlock 1 extra dream interpretation or dhikr by watching.

## 3. Configuration in `app.json`

You must add your App IDs to `app.json` before building.

```json
// app.json
{
  "expo": {
    "plugins": [
        [
          "react-native-google-mobile-ads",
          {
            "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
            "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
          }
        ]
    ]
  }
}
```

> [!WARNING]
> Do NOT use real Ad Unit IDs while developing. Use **Test IDs** to avoid account bans.

### Test IDs (Safe to use during Dev)
*   **Banner**: `ca-app-pub-3940256099942544/6300978111`
*   **Interstitial**: `ca-app-pub-3940256099942544/1033173712`
*   **Rewarded**: `ca-app-pub-3940256099942544/5224354917`

## 4. Implementation Steps

### A. Banner Ad (e.g., in `HomeScreen.js`)
Place this where you want the ad (usually bottom or top).

```javascript
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use TestIds.BANNER for dev, real ID for prod
const adUnitId = __DEV__ ? TestIds.BANNER : 'YOUR-REAL-BANNER-ID';

function HomeScreen() {
  return (
    <View>
      {/* Content */}
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
```

### B. Interstitial Ad (e.g., Navigate to Quran)

```javascript
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'YOUR-REAL-INTERSTITIAL-ID';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

// Load on mount
useEffect(() => {
    interstitial.load();
}, []);

// Show when ready
const handleNavigation = () => {
    if (interstitial.loaded) {
        interstitial.show();
    } else {
        navigation.navigate('TargetScreen');
    }
};
```

### C. Rewarded Ad (Unlocking Features)

```javascript
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'YOUR-REAL-REWARDED-ID';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setLoaded(true);
    });
    const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
        console.log('User earned reward of ', reward);
        // UNLOCK FEATURE HERE (e.g. setLimit(limit + 1))
    });

    rewarded.load();

    return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
    };
}, []);

const showRewardAd = () => {
    if (loaded) {
        rewarded.show();
    }
};
```

## 5. Publishing Checklist
1.  [ ] Replace all `TestIds` with Real Ad Unit IDs.
2.  [ ] Update `app.json` with Real App IDs.
3.  [ ] Link your app in AdMob console once published to Play Store/App Store.
4.  [ ] Add `app-ads.txt` to your website (zikra.app/app-ads.txt) for verification.
