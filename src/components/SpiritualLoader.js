import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../utils/theme';

const SpiritualLoader = ({ size = 120, color = COLORS.accentLight }) => {
    // Shared Values for animations
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);
    const innerRotation = useSharedValue(0);

    useEffect(() => {
        // Continuous slow rotation for the outer ring
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 8000,
                easing: Easing.linear,
            }),
            -1, // Infinite
            false
        );

        // Counter-rotation for the inner star
        innerRotation.value = withRepeat(
            withTiming(-360, {
                duration: 12000,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Breathing effect (Pulse)
        scale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Glimmer/Opacity effect
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.6, { duration: 1500 })
            ),
            -1, // Infinite
            true
        );

        return () => {
            cancelAnimation(rotation);
            cancelAnimation(innerRotation);
            cancelAnimation(scale);
            cancelAnimation(opacity);
        };
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
        };
    });

    const animatedInnerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${innerRotation.value}deg` }],
            opacity: opacity.value,
        };
    });

    // Geometric Star Path (8-pointed Islamic Star - Rub el Hizb style simplified)
    // M 50 0 L 61 35 L 97 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 3 35 L 39 35 Z (Approximate)
    // Clean Rub el Hizb path centered at 50,50, size 100x100
    const starPath = "M50 10 L60 35 L85 35 L65 55 L75 80 L50 65 L25 80 L35 55 L15 35 L40 35 Z";

    // Crescent Path
    // A simple crescent shape centered
    const crescentPath = "M50,20 A30,30 0 1,0 50,80 A25,25 0 1,1 50,30";


    return (
        <View style={styles.container}>
            {/* Outer Glow / Halo */}
            <Animated.View style={[styles.layer, { opacity: 0.3, transform: [{ scale: 1.2 }] }]}>
                <Svg height={size} width={size} viewBox="0 0 100 100">
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50"
                            cy="50"
                            rx="50"
                            ry="50"
                            fx="50"
                            fy="50"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0" stopColor={color} stopOpacity="0.8" />
                            <Stop offset="1" stopColor={color} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx="50" cy="50" r="45" fill="url(#grad)" />
                </Svg>
            </Animated.View>

            {/* Rotating Outer Geometric Ring */}
            <Animated.View style={[styles.layer, animatedContainerStyle]}>
                <Svg height={size} width={size} viewBox="0 0 100 100">
                    {/* Ring of Dots */}
                    <Circle cx="50" cy="5" r="3" fill={color} />
                    <Circle cx="95" cy="50" r="3" fill={color} />
                    <Circle cx="50" cy="95" r="3" fill={color} />
                    <Circle cx="5" cy="50" r="3" fill={color} />

                    <Circle cx="82" cy="18" r="2" fill={color} opacity="0.7" />
                    <Circle cx="82" cy="82" r="2" fill={color} opacity="0.7" />
                    <Circle cx="18" cy="82" r="2" fill={color} opacity="0.7" />
                    <Circle cx="18" cy="18" r="2" fill={color} opacity="0.7" />

                    {/* Thin Circle Line */}
                    <Circle cx="50" cy="50" r="42" stroke={color} strokeWidth="1" strokeOpacity="0.5" fill="none" />
                </Svg>
            </Animated.View>

            {/* Counter-Rotating Inner Star */}
            <Animated.View style={[styles.layer, animatedInnerStyle]}>
                <Svg height={size * 0.7} width={size * 0.7} viewBox="0 0 100 100">
                    {/* Two Squares Rotated to form Star */}
                    <G origin="50, 50" rotation="0">
                        <Path
                            d="M50 10 L90 50 L50 90 L10 50 Z"
                            stroke={color}
                            strokeWidth="2"
                            fill="none"
                        />
                    </G>
                    <G origin="50, 50" rotation="45">
                        <Path
                            d="M50 10 L90 50 L50 90 L10 50 Z"
                            stroke={color}
                            strokeWidth="2"
                            fill={color}
                            fillOpacity="0.1"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Center Pulse Core */}
            <View style={styles.centerDot}>
                <Svg height={16} width={16} viewBox="0 0 20 20">
                    <Circle cx="10" cy="10" r="8" fill={color} />
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    layer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerDot: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    }
});

export default SpiritualLoader;
