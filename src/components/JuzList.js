import { FlashList } from '@shopify/flash-list';
import { BookOpen } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

const JuzItem = memo(({ item, onPress, t, nightModeEnabled }) => (
    <TouchableOpacity
        style={[
            styles.itemContainer,
            isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' },
            nightModeEnabled && {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                shadowOpacity: 0,
                elevation: 0
            }
        ]}
        onPress={() => onPress(item)}
    >
        <View style={[styles.iconContainer, nightModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
            <BookOpen size={24} color={nightModeEnabled ? '#FFD700' : COLORS.primary} />
        </View>
        <View style={styles.info}>
            <Text style={[styles.juzTitle, nightModeEnabled && { color: '#FFF' }]}>{t('quran.juz_title', { number: item })}</Text>
            <Text style={[styles.juzSubtitle, nightModeEnabled && { color: 'rgba(255, 255, 255, 0.6)' }]}>{t('quran.tap_to_read_juz')}</Text>
        </View>
        <View style={[styles.badge, nightModeEnabled && { backgroundColor: '#FFD700' }]}>
            <Text style={[styles.badgeText, nightModeEnabled && { color: '#000' }]}>{item}</Text>
        </View>
    </TouchableOpacity>
));

const JuzList = React.memo(({ onJuzPress, nightModeEnabled }) => {
    const { t } = useTranslation();
    // Generate array [1, 2, ..., 30]
    const juzData = Array.from({ length: 30 }, (_, i) => i + 1);

    const renderJuzItem = useCallback(({ item }) => (
        <JuzItem item={item} onPress={onJuzPress} t={t} nightModeEnabled={nightModeEnabled} />
    ), [onJuzPress, t, nightModeEnabled]);

    return (
        <FlashList
            data={juzData}
            renderItem={renderJuzItem}
            estimatedItemSize={80}
            contentContainerStyle={styles.listContent}
            keyExtractor={item => item.toString()}
        />
    );
});

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0, // Removed for performance
        shadowRadius: 0,
        elevation: 0,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    juzTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    juzSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    badge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default JuzList;
