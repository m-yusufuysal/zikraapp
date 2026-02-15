import { Pause, Play } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../utils/theme';

const AyahItem = React.memo(function AyahItem({ item, isActive, isPlaying, onPlayPause, onShare, theme = 'tr', nightModeEnabled }) {
    // Determine if we should show translation
    const isArabicMode = theme.startsWith('ar');
    const showTranslation = !isArabicMode && item.translation;

    // Logic to show Bismillah Header
    // Show if it's the 1st ayah of a Surah, BUT NOT for Surah 1 (Fatiha) or 9 (Tawbah)
    const showBismillah = item.numberInSurah === 1 && item.surahNumber !== 1 && item.surahNumber !== 9;

    return (
        <View style={[
            styles.container,
            nightModeEnabled && {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                shadowOpacity: 0, // Disable shadows in night mode for performance
                elevation: 0      // Disable elevation in night mode
            },
            isActive && (nightModeEnabled ? { backgroundColor: 'rgba(255, 215, 0, 0.08)', borderColor: '#FFD700', borderWidth: 1 } : styles.activeContainer)
        ]}>
            {/* Bismillah Header */}
            {showBismillah && (
                <View style={styles.bismillahContainer}>
                    <Text style={styles.bismillahText}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
                </View>
            )}

            {/* Header: Number & Actions */}
            <View style={styles.header}>
                <View style={[styles.numberBadge, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                    <Text style={[styles.numberText, nightModeEnabled && { color: '#FFD700' }]}>{item.numberInSurah}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => onPlayPause(item)} style={styles.actionButton}>
                        {isActive && isPlaying ? (
                            <Pause size={20} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                        ) : (
                            <Play size={20} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Arabic Text */}
            <Text style={[styles.arabicText, nightModeEnabled && { color: '#FFF' }]}>{item.text}</Text>

            {/* Translation (Conditional) */}
            {showTranslation && item.translation && (
                <Text style={[styles.translationText, nightModeEnabled && { color: 'rgba(255, 255, 255, 0.85)' }]}>
                    {item.translation
                        .replace(/&quot;/g, '"')
                        .replace(/&apos;/g, "'")
                        .replace(/&#39;/g, "'")
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')}
                </Text>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBg,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0, // Removed for performance
        shadowRadius: 0,
        elevation: 0,
    },
    activeContainer: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0FFF4', // Light green tint
        borderWidth: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    numberBadge: {
        backgroundColor: COLORS.accent,
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 12,
        marginLeft: 8,
    },
    arabicText: {
        fontSize: 32, // Increased from 28
        color: COLORS.primaryDark,
        textAlign: 'right',
        marginBottom: 12,
        fontFamily: 'Amiri-Regular', // Use specialized font for correct Quranic rendering
        lineHeight: 60, // Increased from 52
        writingDirection: 'rtl',
        paddingVertical: 2,
    },
    translationText: {
        fontSize: 18, // Decreased from 20 for better hierarchy
        color: COLORS.textPrimary,
        lineHeight: 26, // Decreased from 30
        textAlign: 'left',
        marginBottom: 8,
    },
    bismillahContainer: {
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    bismillahText: {
        fontSize: 24,
        color: '#FFD700', // Gold Bismillah during Ramadan
        fontFamily: 'Amiri-Regular',
    },
});

export default AyahItem;
