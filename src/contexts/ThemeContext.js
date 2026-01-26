import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [ramadanModeEnabled, setRamadanModeEnabled] = useState(false);
    const [isThemeLoading, setIsThemeLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const val = await AsyncStorage.getItem('ramadan_mode_enabled');
                setRamadanModeEnabled(val === 'true');
            } catch (e) {
                console.error('ThemeContext: Error loading theme', e);
            } finally {
                setIsThemeLoading(false);
            }
        };
        loadTheme();
    }, []);

    // Memoized toggle function to prevent re-renders
    const toggleRamadanMode = useCallback(async (enabled) => {
        try {
            // Use InteractionManager to defer state change until animations complete
            InteractionManager.runAfterInteractions(() => {
                setRamadanModeEnabled(enabled);
            });
            await AsyncStorage.setItem('ramadan_mode_enabled', String(enabled));
        } catch (e) {
            console.error('ThemeContext: Error toggling theme', e);
        }
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        ramadanModeEnabled,
        toggleRamadanMode,
        isThemeLoading
    }), [ramadanModeEnabled, toggleRamadanMode, isThemeLoading]);

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
