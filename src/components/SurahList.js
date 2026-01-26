import { FlashList } from '@shopify/flash-list';
import { Search, X } from 'lucide-react-native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { isTablet, TABLET_MAX_WIDTH } from '../utils/responsive';
import { COLORS } from '../utils/theme';

import { SURAH_NAMES } from '../data/surahNames';
import { SURAH_MEANINGS } from '../utils/surahData';

const SurahItem = memo(({ item, onPress, t, i18n, ramadanModeEnabled }) => {
    // Get language code (e.g. 'tr-TR' -> 'tr')
    const lang = (i18n.language || 'en').split('-')[0];
    const localizedMeaning = SURAH_MEANINGS[item.number]?.[lang] || item.englishNameTranslation;
    const localizedName = SURAH_NAMES[item.number]?.[lang] || item.englishName;

    return (
        <TouchableOpacity
            style={[styles.itemContainer, isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }, ramadanModeEnabled && { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.08)' }]}
            onPress={() => onPress(item)}
        >
            <View style={[styles.numberBadge, ramadanModeEnabled && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                <Text style={[styles.numberText, ramadanModeEnabled && { color: '#FFD700' }]}>{item.number}</Text>
            </View>
            {lang !== 'ar' && (
                <View style={styles.info}>
                    <Text style={[styles.englishName, ramadanModeEnabled && { color: '#FFF' }]}>{localizedName}</Text>
                    <Text style={[styles.translationName, ramadanModeEnabled && { color: 'rgba(255, 255, 255, 0.6)' }]}>{localizedMeaning}</Text>
                </View>
            )}
            <View style={[styles.arabicContainer, lang === 'ar' && { flex: 1, alignItems: 'flex-start', marginLeft: 0 }]}>
                <Text style={[styles.arabicName, ramadanModeEnabled && { color: '#FFD700' }]}>{item.name}</Text>
                <Text style={[styles.verseCount, ramadanModeEnabled && { color: 'rgba(255, 255, 255, 0.4)' }]}>{item.numberOfAyahs} {t('quran.verses')}</Text>
            </View>
        </TouchableOpacity>
    )
});

const SurahList = React.memo(({ data, onSurahPress, ramadanModeEnabled }) => {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const lang = (i18n.language || 'en').split('-')[0];

    // Filter surahs based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;

        const query = searchQuery.toLowerCase().trim();
        const queryNum = parseInt(query, 10);

        return data.filter(item => {
            // Search by number
            if (!isNaN(queryNum) && item.number === queryNum) return true;

            // Search by Arabic name
            if (item.name && item.name.includes(query)) return true;

            // Search by English name
            if (item.englishName && item.englishName.toLowerCase().includes(query)) return true;

            // Search by localized name
            const localizedName = SURAH_NAMES[item.number]?.[lang];
            if (localizedName && localizedName.toLowerCase().includes(query)) return true;

            // Search by meaning
            const meaning = SURAH_MEANINGS[item.number]?.[lang] || item.englishNameTranslation;
            if (meaning && meaning.toLowerCase().includes(query)) return true;

            return false;
        });
    }, [data, searchQuery, lang]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputWrapper, isTablet && { width: TABLET_MAX_WIDTH, alignSelf: 'center' }]}>
                    <Search size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('quran.search_placeholder')}
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        autoCorrect={false}
                        clearButtonMode="never"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <X size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlashList
                data={filteredData}
                renderItem={({ item }) => <SurahItem item={item} onPress={onSurahPress} t={t} i18n={i18n} ramadanModeEnabled={ramadanModeEnabled} />}
                estimatedItemSize={80}
                contentContainerStyle={styles.listContent}
                keyExtractor={item => item.number.toString()}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('quran.no_results')}</Text>
                    </View>
                }
            />
        </View>
    );
});

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 12,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
        paddingVertical: 8,
    },
    clearButton: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
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
    numberBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 77, 64, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    numberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    info: {
        flex: 1,
    },
    englishName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    translationName: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    arabicContainer: {
        alignItems: 'flex-end',
    },
    arabicName: {
        fontSize: 20,
        color: COLORS.primaryDark,
        fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif',
    },
    verseCount: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});

export default SurahList;
