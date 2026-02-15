import { registerRootComponent } from 'expo';
import { LogBox, Text, TextInput } from 'react-native';

// Disable infinite font scaling
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = 1.3;

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.3;
import TrackPlayer from 'react-native-track-player';

// Suppress known warnings
LogBox.ignoreLogs([
    'Expo AV has been deprecated', // Migration planned for SDK 55
    'The objective-c', // TrackPlayer sleep timer warnings (feature not used)
]);

import App from './App';

// Register the service first to ensure it is active for background events
TrackPlayer.registerPlaybackService(() => require('./src/services/TrackPlayerService'));

registerRootComponent(App);
