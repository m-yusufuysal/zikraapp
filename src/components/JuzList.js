import { FlashList } from '@shopify/flash-list';
import { BookOpen } from 'lucide-react-native';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

const JuzItem = memo(({ item, onPress, t, ramadanModeEnabled }) => (
    <TouchableOpacity
        style={[styles.itemContainer, isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.08)' }]}
        onPress={() => onPress(item)}
    >
        <View style={[styles.iconContainer, ramadanModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
            <BookOpen size={24} color={ramadanModeEnabled ? '#FFD700' : COLORS.primary} />
        </View>
        <View style={styles.info}>
            <Text style={[styles.juzTitle, ramadanModeEnabled && { color: '#FFF' }]}>{t('quran.juz_title', { number: item })}</Text>
            <Text style={[styles.juzSubtitle, ramadanModeEnabled && { color: 'rgba(255, 255, 255, 0.6)' }]}>{t('quran.tap_to_read_juz')}</Text>
        </View>
        <View style={[styles.badge, ramadanModeEnabled && { backgroundColor: '#FFD700' }]}>
            <Text style={[styles.badgeText, ramadanModeEnabled && { color: '#000' }]}>{item}</Text>
        </View>
    </TouchableOpacity>
));

const JuzList = React.memo(({ onJuzPress, ramadanModeEnabled }) => {
    const { t } = useTranslation();
    // Generate array [1, 2, ..., 30]
    const juzData = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <FlashList
            data={juzData}
            renderItem={({ item }) => <JuzItem item={item} onPress={onJuzPress} t={t} ramadanModeEnabled={ramadanModeEnabled} />}
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
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
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
