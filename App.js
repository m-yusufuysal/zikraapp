import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
// TODO: Uncomment after native rebuild (npx expo prebuild --clean)
// import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Fingerprint, Moon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, AppState, DeviceEventEmitter, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Path, Svg } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize Google Sign-In
GoogleSignin.configure({
    // webClientId: '...', // Bu alan boş bırakılırsa ID Token dönmeyebilir ancak native login çalışır.
    iosClientId: '419270836391-e995d4kaja9kf8d1aqi7cahig00nnue4.apps.googleusercontent.com',
});
import { saveReferralCode } from './src/services/ReferralService';
import { analytics } from './src/services/analyticsService';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import CommunityNotificationsScreen from './src/screens/CommunityNotificationsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import DhikrCounter from './src/screens/DhikrCounter';
import DhikrOnboarding from './src/screens/DhikrOnboarding';
import DreamInterpretation from './src/screens/DreamInterpretation';
import HatimDetailScreen from './src/screens/HatimDetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import InfluencerDashboard from './src/screens/InfluencerDashboard';
import KaabaLiveScreen from './src/screens/KaabaLiveScreen';
import MosqueFinderScreen from './src/screens/MosqueFinderScreen';
import MyCommunityPostsScreen from './src/screens/MyCommunityPostsScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import QiblaCompass from './src/screens/QiblaCompass';
import QuranScreen from './src/screens/QuranScreen';
import ReferralList from './src/screens/ReferralList';
import SettingsScreen from './src/screens/SettingsScreen';
import ShopScreen from './src/screens/ShopScreen';
import SupportScreen from './src/screens/SupportScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ZakatCalculator from './src/screens/ZakatCalculator';
import Zikirmatik from './src/screens/Zikirmatik';

import MiniPlayer from './src/components/MiniPlayer';
import { AudioProvider } from './src/contexts/AudioContext';
import { NotificationProvider, useNotifications } from './src/contexts/NotificationContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { supabase } from './src/services/supabase';
import { COLORS } from './src/utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dhikr Stack
const DhikrStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DhikrOnboarding" component={DhikrOnboarding} />
            <Stack.Screen name="DhikrCounter" component={DhikrCounter} />
            <Stack.Screen name="Zikirmatik" component={Zikirmatik} />
        </Stack.Navigator>
    );
};

// Community Stack to keep Tab Bar visible
const CommunityStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CommunityMain" component={CommunityScreen} />
            <Stack.Screen name="HatimDetail" component={HatimDetailScreen} />
            <Stack.Screen name="CommunityNotifications" component={CommunityNotificationsScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="MyCommunityPosts" component={MyCommunityPostsScreen} />
        </Stack.Navigator>
    );
};

// Main App Tabs
const TabNavigator = () => {
    const { unreadCount } = useNotifications();
    const { nightModeEnabled } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    nightModeEnabled && styles.tabBarNight
                ],
                tabBarBackground: () => (
                    <BlurView
                        tint={nightModeEnabled ? "dark" : "light"}
                        intensity={nightModeEnabled ? 100 : 90}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarActiveTintColor: nightModeEnabled ? '#FFD700' : COLORS.primary,
                tabBarInactiveTintColor: nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary,
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    paddingVertical: 12,
                }
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => {
                        const iconColor = focused ? (nightModeEnabled ? '#FFD700' : COLORS.primary) : (nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary);
                        return (
                            <View style={styles.iconContainer}>
                                <Svg width={26} height={26} viewBox="0 0 24 24" fill={focused ? iconColor : "none"} stroke={iconColor} strokeWidth={focused ? 2.5 : 2.2} strokeLinecap="round" strokeLinejoin="round">
                                    <Path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H15V12H9V22H5C3.89543 22 3 21.1046 3 20V9Z"
                                    />
                                </Svg>
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Dream"
                component={DreamInterpretation}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.iconContainer}>
                            <Moon
                                color={focused ? (nightModeEnabled ? '#FFD700' : COLORS.primary) : (nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)}
                                size={26}
                                strokeWidth={focused ? 2.5 : 2.2}
                                fill={focused ? (nightModeEnabled ? '#FFD700' : COLORS.primary) : "none"}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityStack}
                options={{
                    tabBarIcon: ({ color, size, focused }) => {
                        const { unreadCount } = useNotifications();
                        const iconColor = focused ? (nightModeEnabled ? '#FFD700' : COLORS.primary) : (nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary);
                        return (
                            <View style={styles.iconContainer}>
                                <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        {/* Left Person (Background) */}
                                        <View style={{ position: 'absolute', top: 6, left: 0, width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5, borderColor: iconColor, opacity: focused ? 1 : 0.6, backgroundColor: focused ? iconColor : 'transparent' }} />
                                        <View style={{ position: 'absolute', top: 14, left: -3, width: 12, height: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderTopWidth: 1.5, borderColor: iconColor, opacity: focused ? 1 : 0.6, backgroundColor: focused ? iconColor : 'transparent' }} />

                                        {/* Right Person (Background) */}
                                        <View style={{ position: 'absolute', top: 6, left: 20, width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5, borderColor: iconColor, opacity: focused ? 1 : 0.6, backgroundColor: focused ? iconColor : 'transparent' }} />
                                        <View style={{ position: 'absolute', top: 14, left: 18, width: 12, height: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderTopWidth: 1.5, borderColor: iconColor, opacity: focused ? 1 : 0.6, backgroundColor: focused ? iconColor : 'transparent' }} />

                                        {/* Center Person (Foreground) */}
                                        <View style={{ position: 'absolute', top: 2, left: 9, width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.8, borderColor: iconColor, backgroundColor: focused ? iconColor : (nightModeEnabled ? '#0F0C29' : '#FFF') }} />
                                        <View style={{ position: 'absolute', top: 12, left: 4, width: 20, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderLeftWidth: 1.8, borderRightWidth: 1.8, borderTopWidth: 1.8, borderColor: iconColor, backgroundColor: focused ? iconColor : (nightModeEnabled ? '#0F0C29' : '#FFF') }} />
                                    </View>
                                </View>
                                {unreadCount > 0 && (
                                    <View style={styles.tabBadgeContainer}>
                                        <Text style={styles.tabBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (navigation.isFocused()) {
                            DeviceEventEmitter.emit('refreshCommunity');
                        }
                    },
                })}
            />
            <Tab.Screen
                name="Dhikr"
                component={DhikrStack}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.iconContainer}>
                            <Fingerprint color={focused ? (nightModeEnabled ? '#FFD700' : COLORS.primary) : (nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)} size={26} strokeWidth={focused ? 2.5 : 2.2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => {
                        const iconColor = focused ? (nightModeEnabled ? '#FFD700' : COLORS.primary) : (nightModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary);
                        return (
                            <View style={styles.iconContainer}>
                                <Svg width={26} height={26} viewBox="0 0 24 24" fill={focused ? iconColor : "none"} stroke={iconColor} strokeWidth={focused ? 2.5 : 2.2} strokeLinecap="round" strokeLinejoin="round">
                                    <Path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                                    />
                                </Svg>
                            </View>
                        );
                    },
                }}
            />
        </Tab.Navigator>
    );
};

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import InAppNotificationService from './src/services/InAppNotificationService';
import NotificationService from './src/services/NotificationService';

import { RevenueCatProvider } from './src/providers/RevenueCatProvider';

export default function App() {
    return (
        <ThemeProvider>
            <RevenueCatProvider>
                <NotificationProvider>
                    <AppContent />
                </NotificationProvider>
            </RevenueCatProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);
    const [session, setSession] = useState(null);
    const [currentRouteName, setCurrentRouteName] = useState('Home');
    const { nightModeEnabled } = useTheme();
    const { incrementUnreadCount, syncWithServer } = useNotifications();
    const navigationRef = useNavigationContainerRef();
    const routeNameRef = useRef();
    const appStateRef = useRef(AppState.currentState);

    const { t } = useTranslation();

    useEffect(() => {
        async function prepare() {
            try {
                // One-time migration: Clear old Quran API cache (v1 -> v4 migration)
                const migrationKey = 'quran_api_v4_migrated';
                const hasMigrated = await AsyncStorage.getItem(migrationKey);
                if (!hasMigrated) {
                    const { clearQuranCache } = require('./src/services/quranService');
                    await clearQuranCache();
                    await AsyncStorage.setItem(migrationKey, 'true');
                }

                const { initI18n } = require('./src/i18n/i18n');
                await initI18n();

                // Load Fonts
                const Font = require('expo-font');
                const { KaushanScript_400Regular } = require('@expo-google-fonts/kaushan-script');
                await Font.loadAsync({ KaushanScript_400Regular });

                const { preloadMetalPrices } = require('./src/services/FinanceService');
                preloadMetalPrices();

                await checkFirstLaunch();

                // Smart Review Check (Active User)
                import('./src/services/StoreReviewService').then(module => {
                    module.default.checkNotificationReview();
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setIsLoading(false);
                // We wait for the splash video to finish before hiding the native splash.
            }
        }

        prepare();

        // TODO: Uncomment after native rebuild (npx expo prebuild --clean)
        // const requestTrackingPermission = async () => {
        //     if (Platform.OS === 'ios') {
        //         try {
        //             const { status } = await requestTrackingPermissionsAsync();
        //             console.log('[App] ATT Permission status:', status);
        //         } catch (e) {
        //             console.warn('[App] ATT Permission request failed:', e);
        //         }
        //     }
        // };
        // setTimeout(requestTrackingPermission, 2000);

        InAppNotificationService.onNotification = () => {
            incrementUnreadCount();
        };

        const handleSessionInit = async (session) => {
            const userId = session?.user?.id;
            if (userId) {
                InAppNotificationService.init(userId);
                syncWithServer(userId);
                try {
                    const { getMachineId } = require('./src/services/deviceService');
                    const { syncMachineId, updateLastSeen } = require('./src/services/userService');
                    const machineId = await getMachineId();
                    await syncMachineId(userId, machineId);

                    // Initial update
                    updateLastSeen(userId);

                    // Periodic update (every 5 minutes)
                    const intervalId = setInterval(() => {
                        if (AppState.currentState === 'active') {
                            updateLastSeen(userId);
                        }
                    }, 5 * 60 * 1000);

                    // Store interval ID in a way to clear it later if needed (simple implementation for now)
                    // In a more robust solution, we'd use a ref or effect cleanup, but handleSessionInit is called once per session change.
                } catch (e) {
                    console.warn('[App] Machine ID sync failed:', e);
                }
            } else {
                InAppNotificationService.stop();
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            handleSessionInit(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(prev => {
                if (prev?.user?.id !== session?.user?.id) {
                    handleSessionInit(session);
                }
                return session;
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleDeepLink = async (url) => {
            if (!url) return;
            try {
                const parsed = Linking.parse(url);
                if (parsed.queryParams?.code) {
                    await saveReferralCode(parsed.queryParams.code);
                }
            } catch (e) {
                console.error('[App] Deep Link Error:', e);
            }
        };
        Linking.getInitialURL().then(handleDeepLink);
        const subscription = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });
        return () => subscription.remove();
    }, []);

    const checkFirstLaunch = async () => {
        try {
            const hasLaunched = await AsyncStorage.getItem('hasLaunched');
            setIsFirstLaunch(true); // Forced true for review
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Hide native splash screen immediately when JS loads so Video component can be seen
        // Ideally we wait for video to load, but hiding here is better than waiting for video to FINISH
        async function hideNativeSplash() {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn(e);
            }
        }
        hideNativeSplash();
    }, []);

    const onSplashFinish = async () => {
        setIsSplashAnimationFinished(true);
        // Initialize notifications after splash
        setTimeout(async () => {
            try {
                const hasPermission = await NotificationService.init();
                if (hasPermission) {
                    await NotificationService.scheduleDailyNotifications();
                }
            } catch (e) {
                console.warn('[App] Notification init failed:', e);
            }
        }, 500);
    };

    if (!isSplashAnimationFinished) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000000' }}>
                <StatusBar style="light" hidden={true} />
                <Video
                    source={require('./assets/splash-video.mp4')}
                    style={StyleSheet.absoluteFill}
                    // ResizeMode.CONTAIN ensures the whole video is visible letterboxed (zoomed out) if needed
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={true}
                    isLooping={false}
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            onSplashFinish();
                        }
                    }}
                    onError={(e) => {
                        console.warn('Splash video error:', e);
                        onSplashFinish();
                    }}
                />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <AudioProvider>
                    <NavigationContainer
                        ref={navigationRef}
                        onReady={() => {
                            routeNameRef.current = navigationRef.getCurrentRoute().name;
                        }}
                        onStateChange={async () => {
                            const previousRouteName = routeNameRef.current;
                            const currentRoute = navigationRef.getCurrentRoute();
                            const currentRouteName = currentRoute.name;
                            if (previousRouteName !== currentRouteName) {
                                await analytics.logScreenView(currentRouteName, { params: currentRoute.params });
                            }
                            routeNameRef.current = currentRouteName;
                            setCurrentRouteName(currentRouteName);
                        }}
                    >
                        <StatusBar style={nightModeEnabled ? "light" : "dark"} translucent={true} backgroundColor="transparent" />
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            {isFirstLaunch ? (
                                <Stack.Screen name="Welcome">
                                    {(props) => <WelcomeScreen {...props} onFinish={() => setIsFirstLaunch(false)} />}
                                </Stack.Screen>
                            ) : !session ? (
                                <Stack.Screen name="Auth" component={AuthScreen} />
                            ) : (
                                <>
                                    <Stack.Screen name="Main" component={TabNavigator} />
                                    <Stack.Screen name="QiblaCompass" component={QiblaCompass} />
                                    <Stack.Screen name="MosqueFinder" component={MosqueFinderScreen} />
                                    <Stack.Screen name="KaabaLive" component={KaabaLiveScreen} />
                                    <Stack.Screen name="Shop" component={ShopScreen} />
                                    <Stack.Screen name="ShopAdmin" component={require('./src/screens/ShopAdminScreen').default} />
                                    <Stack.Screen name="AdminDashboard" component={require('./src/screens/AdminDashboardScreen').default} />
                                    <Stack.Screen name="AdminSettings" component={require('./src/screens/AdminSettingsScreen').default} />
                                    <Stack.Screen name="ZakatCalculator" component={ZakatCalculator} />
                                    <Stack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="InfluencerDashboard" component={InfluencerDashboard} />
                                    <Stack.Screen name="InfluencerList" component={require('./src/screens/InfluencerListScreen').default} />
                                    <Stack.Screen name="Analytics" component={require('./src/screens/AnalyticsScreen').default} />
                                    <Stack.Screen name="ReferralList" component={ReferralList} />
                                    {/* Community screens are now nested in CommunityStack within TabNavigator to keep bottom bar visible */}
                                    <Stack.Screen name="DreamHistory" component={require('./src/screens/DreamHistoryScreen').default} />
                                    <Stack.Screen name="Quran" component={QuranScreen} />
                                    <Stack.Screen name="Support" component={SupportScreen} />
                                </>
                            )}
                        </Stack.Navigator>
                        {session && <MiniPlayer currentRouteName={currentRouteName} />}
                    </NavigationContainer>
                </AudioProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        elevation: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 12,
    },
    tabBarNight: {
        backgroundColor: 'rgba(15, 12, 41, 0.95)',
        borderTopColor: 'rgba(255, 215, 0, 0.2)',
    },
    tabBadgeContainer: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#e74c3c',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    tabBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
