import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/theme';

// Memoized star component to prevent unnecessary re-renders
const ShimmerStar = memo(({ size, style }) => {
    const opacity = useRef(new Animated.Value(0.1 + Math.random() * 0.4)).current;

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.6 + Math.random() * 0.4,
                    duration: 3000 + Math.random() * 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.2 + Math.random() * 0.2,
                    duration: 3000 + Math.random() * 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };
        animate();
    }, []);

    return (
        <Animated.View style={[style, { opacity }]}>
            <View
                style={{
                    width: size,
                    height: size,
                    backgroundColor: '#FFF',
                    borderRadius: size / 2,
                    // Shadow removed for performance
                }}
            />
        </Animated.View>
    );
});

const RamadanBackground = ({
    children,
    style,
    starCount = 10, // Reduced from 15 (originally 25) for maximum smoothness
    forceNormalMode = false,
    forceRamadanAppearance = false,
    customStandardGradient = null
}) => {
    const { nightModeEnabled } = useTheme();
    // Prioritize force props, otherwise use global setting
    const isRamadanMode = forceRamadanAppearance ? true : (forceNormalMode ? false : nightModeEnabled);

    const fadeAnim = useRef(new Animated.Value(isRamadanMode ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isRamadanMode ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isRamadanMode]);

    // Only generate stars when Ramadan mode is enabled
    const stars = useMemo(() => {
        if (!isRamadanMode) return [];
        return [...Array(starCount)].map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
        }));
    }, [starCount, isRamadanMode]);

    // Standard Gradient Colors
    const standardColors = customStandardGradient || [COLORS.backgroundStart, COLORS.backgroundEnd];
    // Ramadan Gradient Colors
    const ramadanColors = ['#0f0c29', '#302b63', '#24243e'];

    return (
        <View style={[styles.container, style]}>
            {/* Base Layer: Standard Background - Only render if not in Ramadan mode or during transition */}
            {!isRamadanMode && (
                <LinearGradient
                    colors={standardColors}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* Overlay Layer: Ramadan Background (Fades in/out) - Only render when active */}
            {isRamadanMode && (
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]} pointerEvents="none">
                    <LinearGradient
                        colors={ramadanColors}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={StyleSheet.absoluteFill}>
                        {stars.map((star) => (
                            <ShimmerStar
                                key={star.id}
                                size={star.size}
                                style={{ position: 'absolute', top: star.top, left: star.left }}
                            />
                        ))}
                    </View>
                </Animated.View>
            )}

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

export default memo(RamadanBackground);
