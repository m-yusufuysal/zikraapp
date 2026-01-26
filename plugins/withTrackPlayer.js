const { withAndroidManifest, withInfoPlist, AndroidConfig } = require('@expo/config-plugins');

const withTrackPlayer = (config) => {
    // 1. Android Manifest Configuration
    config = withAndroidManifest(config, (config) => {
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

        // Add valid TrackPlayerService if not present
        // This is the native service required for background playback
        // The class name must match 'com.doublesymmetry.trackplayer.service.MusicService' as defined in the library
        const serviceName = 'com.doublesymmetry.trackplayer.service.MusicService';

        // Check if service exists
        const service = mainApplication.service?.find(
            (s) => s.$['android:name'] === serviceName
        );

        if (!service) {
            mainApplication.service = [
                ...(mainApplication.service || []),
                {
                    $: {
                        'android:name': serviceName,
                        'android:enabled': 'true',
                        'android:exported': 'true',
                        'android:foregroundServiceType': 'mediaPlayback',
                    },
                    'intent-filter': [
                        {
                            action: [
                                { $: { 'android:name': 'android.intent.action.MEDIA_BUTTON' } },
                            ],
                        },
                    ],
                },
            ];
        }

        return config;
    });

    // 2. iOS Info.plist Configuration
    config = withInfoPlist(config, (config) => {
        if (!config.modResults.UIBackgroundModes) {
            config.modResults.UIBackgroundModes = [];
        }
        if (!config.modResults.UIBackgroundModes.includes('audio')) {
            config.modResults.UIBackgroundModes.push('audio');
        }
        return config;
    });

    return config;
};

module.exports = withTrackPlayer;
