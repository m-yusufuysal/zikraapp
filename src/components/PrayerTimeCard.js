import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../utils/theme';

const PrayerTimeCard = ({ prayerName, time, isNext }) => {
    return (
        <BlurView intensity={isNext ? 80 : 30} style={[styles.card, isNext && styles.activeCard]}>
            <Text style={[styles.name, isNext && styles.activeText]}>{prayerName}</Text>
            <Text style={[styles.time, isNext && styles.activeText]}>{time}</Text>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeCard: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.accent,
    },
    name: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    time: {
        fontSize: 18,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    activeText: {
        color: '#FFFFFF',
    },
});

export default PrayerTimeCard;
