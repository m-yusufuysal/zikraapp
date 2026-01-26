import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, Fingerprint, Home, Moon, Settings as SettingsIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, AppState, Linking, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { saveReferralCode } from './src/services/ReferralService';
import { analytics } from './src/services/analyticsService';


// Screens
import DhikrCounter from './src/screens/DhikrCounter';
import DhikrOnboarding from './src/screens/DhikrOnboarding';
import DreamInterpretation from './src/screens/DreamInterpretation';
import HomeScreen from './src/screens/HomeScreen';
import KaabaLiveScreen from './src/screens/KaabaLiveScreen';
import MosqueFinderScreen from './src/screens/MosqueFinderScreen';
import QiblaCompass from './src/screens/QiblaCompass';
import QuranScreen from './src/screens/QuranScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShopScreen from './src/screens/ShopScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ZakatCalculator from './src/screens/ZakatCalculator';
import Zikirmatik from './src/screens/Zikirmatik';


import AuthScreen from './src/screens/AuthScreen';
import CommunityNotificationsScreen from './src/screens/CommunityNotificationsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import HatimDetailScreen from './src/screens/HatimDetailScreen';
import InfluencerDashboard from './src/screens/InfluencerDashboard';
import MyCommunityPostsScreen from './src/screens/MyCommunityPostsScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import ReferralList from './src/screens/ReferralList';
import { supabase } from './src/services/supabase';
// Lazy loaded below: import mobileAds from 'react-native-google-mobile-ads';

// Theme
import MiniPlayer from './src/components/MiniPlayer';
import { AudioProvider } from './src/contexts/AudioContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
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

// Main App Tabs
const TabNavigator = ({ ramadanModeEnabled }) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    ramadanModeEnabled && styles.tabBarRamadan
                ],
                tabBarBackground: () => (
                    <BlurView
                        tint={ramadanModeEnabled ? "dark" : "light"}
                        intensity={ramadanModeEnabled ? 100 : 90}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarActiveTintColor: ramadanModeEnabled ? '#FFD700' : COLORS.primary,
                tabBarInactiveTintColor: ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary,
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
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && (ramadanModeEnabled ? styles.activeIconRamadan : styles.activeIcon)
                        ]}>
                            <Home color={focused ? (ramadanModeEnabled ? '#FFD700' : COLORS.primary) : (ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Quran"
                component={QuranScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && (ramadanModeEnabled ? styles.activeIconRamadan : styles.activeIcon)
                        ]}>
                            <BookOpen color={focused ? (ramadanModeEnabled ? '#FFD700' : COLORS.primary) : (ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Dhikr"
                component={DhikrStack}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && (ramadanModeEnabled ? styles.activeIconRamadan : styles.activeIcon)
                        ]}>
                            <Fingerprint color={focused ? (ramadanModeEnabled ? '#FFD700' : COLORS.primary) : (ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Dream"
                component={DreamInterpretation}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && (ramadanModeEnabled ? styles.activeIconRamadan : styles.activeIcon)
                        ]}>
                            <Moon color={focused ? (ramadanModeEnabled ? '#FFD700' : COLORS.primary) : (ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && (ramadanModeEnabled ? styles.activeIconRamadan : styles.activeIcon)
                        ]}>
                            <SettingsIcon color={focused ? (ramadanModeEnabled ? '#FFD700' : COLORS.primary) : (ramadanModeEnabled ? 'rgba(255,255,255,0.4)' : COLORS.textSecondary)} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';

// Register the service first to ensure it is active for background events
// TrackPlayer.registerPlaybackService(() => require('./src/services/TrackPlayerService')); // Already in index.js

import InAppNotificationService from './src/services/InAppNotificationService';
import NotificationService from './src/services/NotificationService';

import { NotificationProvider, useNotifications } from './src/contexts/NotificationContext';

export default function App() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <AppContent />
            </NotificationProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);
    const [session, setSession] = useState(null);
    const [currentRouteName, setCurrentRouteName] = useState('Home');
    const { ramadanModeEnabled } = useTheme();
    const { incrementUnreadCount, syncWithServer } = useNotifications();
    const navigationRef = useNavigationContainerRef();
    const routeNameRef = useRef();
    const appStateRef = useRef(AppState.currentState);

    const { t } = useTranslation();

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                /* try {
                    await Font.loadAsync({
                        'Amiri-Regular': require('./assets/fonts/Amiri-Regular.ttf'),
                    });
                } catch (fontError) {
                    console.warn('[App] Font loading failed:', fontError.message);
                } */

                // One-time migration: Clear old Quran API cache (v1 -> v4 migration)
                const migrationKey = 'quran_api_v4_migrated';
                const hasMigrated = await AsyncStorage.getItem(migrationKey);
                if (!hasMigrated) {
                    const { clearQuranCache } = require('./src/services/quranService');
                    await clearQuranCache();
                    await AsyncStorage.setItem(migrationKey, 'true');
                    console.log('[App] Quran API v4 migration completed');
                }

                // Initialize i18n (Language detection & setup)
                const { initI18n } = require('./src/i18n/i18n');
                await initI18n();

                // Check other initializations
                await checkFirstLaunch();

                // Track Ramadan Mode - MOVED TO CONTEXT

            } catch (e) {
                console.warn(e);
            } finally {
                setIsLoading(false);

                setTimeout(async () => {
                    try {
                        const hasPermission = await NotificationService.init();
                        if (hasPermission) {
                            // Unified scheduling (Fallack mode: timings=null)
                            await NotificationService.scheduleDailyNotifications();
                        }
                    } catch (e) {
                        console.warn('[App] Notification init failed:', e);
                    }
                }, 1000);
            }
        }

        prepare();

        // Register in-app notification listener to update badge count
        InAppNotificationService.onNotification = () => {
            incrementUnreadCount();
        };

        // AdMob removed for now - will add back in production build

        const handleSessionInit = (session) => {
            const userId = session?.user?.id;
            if (userId) {
                InAppNotificationService.init(userId);
                syncWithServer(userId);
            } else {
                InAppNotificationService.stop();
            }
        };

        // Listen for auth state changes
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
        // --- DEEP LINK HANDLING (REFERRALS) ---
        const handleDeepLink = async (url) => {
            if (!url) return;
            try {
                const parsed = Linking.parse(url);
                if (parsed.queryParams?.code) {
                    await saveReferralCode(parsed.queryParams.code);
                    console.log('[App] Referral code captured:', parsed.queryParams.code);
                }
            } catch (e) {
                console.error('[App] Deep Link Error:', e);
            }
        };

        // Handle initial URL (cold start)
        Linking.getInitialURL().then(handleDeepLink);

        // Handle foreground URLs
        const subscription = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });

        return () => subscription.remove();
    }, []);

    const checkNotificationPermissions = async () => {
        const status = await registerForPushNotificationsAsync();
        // If status is undefined (e.g. Expo Go limitation or error) we ignore
        if (status && status !== 'granted') {
            Alert.alert(
                t('notifications.perm_title'),
                t('notifications.perm_msg'),
                [
                    { text: t('cancel'), style: 'cancel' },
                    {
                        text: t('notifications.open_settings'),
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        }
                    }
                ]
            );
        }
    };

    const checkFirstLaunch = async () => {
        try {
            const hasLaunched = await AsyncStorage.getItem('hasLaunched');
            if (hasLaunched === null) {
                setIsFirstLaunch(true);
            } else {
                setIsFirstLaunch(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundStart }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
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
                                // Log Screen View for Analytics
                                await analytics.logScreenView(currentRouteName, {
                                    params: currentRoute.params
                                });
                            }
                            routeNameRef.current = currentRouteName;
                            setCurrentRouteName(currentRouteName);
                        }}
                    >
                        <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            {isFirstLaunch ? (
                                <Stack.Screen name="Welcome">
                                    {(props) => <WelcomeScreen {...props} onFinish={() => setIsFirstLaunch(false)} />}
                                </Stack.Screen>
                            ) : !session ? (
                                <Stack.Screen name="Auth" component={AuthScreen} />
                            ) : (
                                <>
                                    <Stack.Screen name="Main">
                                        {(props) => <TabNavigator {...props} ramadanModeEnabled={ramadanModeEnabled} />}
                                    </Stack.Screen>
                                    <Stack.Screen name="QiblaCompass" component={QiblaCompass} />
                                    <Stack.Screen name="MosqueFinder" component={MosqueFinderScreen} />
                                    <Stack.Screen name="KaabaLive" component={KaabaLiveScreen} />
                                    <Stack.Screen name="Shop" component={ShopScreen} />
                                    <Stack.Screen name="ZakatCalculator" component={ZakatCalculator} />
                                    <Stack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="InfluencerDashboard" component={InfluencerDashboard} />
                                    <Stack.Screen name="ReferralList" component={ReferralList} />
                                    <Stack.Screen name="Community" component={CommunityScreen} />
                                    <Stack.Screen name="HatimDetail" component={HatimDetailScreen} />
                                    <Stack.Screen name="CommunityNotifications" component={CommunityNotificationsScreen} />
                                    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                                    <Stack.Screen name="MyCommunityPosts" component={MyCommunityPostsScreen} />
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
        height: 85, // Architectural height
        elevation: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Solid frost
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 20, // Lift icons slightly
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 12, // Architectural soft square (Squircle-ish)
    },
    activeIcon: {
        backgroundColor: 'rgba(0, 77, 64, 0.08)', // Very subtle Emerald tint
    },
    activeIconRamadan: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)', // Golden tint
    },
    tabBarRamadan: {
        backgroundColor: 'rgba(15, 12, 41, 0.95)', // Deep space
        borderTopColor: 'rgba(255, 215, 0, 0.2)', // Golden hair-line
    }
});



