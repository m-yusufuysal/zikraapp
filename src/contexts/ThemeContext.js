import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [nightModeEnabled, setNightModeEnabled] = useState(false);
    const [isThemeLoading, setIsThemeLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                let val = await AsyncStorage.getItem('night_mode_enabled');

                // Backward compatibility: check for old key if new key doesn't exist
                if (val === null) {
                    val = await AsyncStorage.getItem('ramadan_mode_enabled');
                    if (val !== null) {
                        // Migrate to new key
                        await AsyncStorage.setItem('night_mode_enabled', val);
                    }
                }

                setNightModeEnabled(val === 'true');
            } catch (e) {
                console.error('ThemeContext: Error loading theme', e);
            } finally {
                setIsThemeLoading(false);
            }
        };
        loadTheme();
    }, []);

    // Memoized toggle function to prevent re-renders
    const toggleNightMode = useCallback(async (enabled) => {
        try {
            // Use InteractionManager to defer state change until animations complete
            InteractionManager.runAfterInteractions(() => {
                setNightModeEnabled(enabled);
            });
            await AsyncStorage.setItem('night_mode_enabled', String(enabled));
        } catch (e) {
            console.error('ThemeContext: Error toggling theme', e);
        }
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        nightModeEnabled,
        toggleNightMode,
        isThemeLoading
    }), [nightModeEnabled, toggleNightMode, isThemeLoading]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
