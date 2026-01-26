import { Platform, StyleSheet } from 'react-native';

export const COLORS = {
    // Swiss-Islamic Light Palette (Sufi Green)
    backgroundStart: '#E8F5E9', // Light pleasant green (User requested)
    backgroundEnd: '#F4FBF6',   // Softest mint-white

    // Core Identity
    matteBlack: '#121212',      // Deep Swiss Black
    matteGreen: '#2E594A',      // Matte Emerald (Primary)
    matteGold: '#C5A035',       // Antique Gold (Slightly muted)
    softGray: '#F7F9F8',        // Surface color matching green tint 

    // Text
    textPrimary: '#121212',     // Soft Black (High Contrast)
    textSecondary: '#6C6C70',   // Swiss Gray
    textLight: '#FFFFFF',       // For text on dark backgrounds

    // Functional
    primary: '#2E594A',         // Matte Green
    primaryDark: '#1B3A32',     // Darker Matte Green
    accent: '#D4AF37',          // Matte Gold
    accentLight: '#E5D38D',     // Lighter Gold

    // UI Elements
    cardBg: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(0, 0, 0, 0.08)',
    shadow: '#000000',

    // Status
    success: '#2E594A',
    warning: '#D97706',
    error: '#C0392B',
};

// Swiss-Islamic Typography System
// Swiss: Heavy, tight, grid-based.
// Islamic: Elegant, serif, spacious.
export const FONTS = {
    hero: {
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1.5,
        color: COLORS.matteGreen,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    h1: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
        color: COLORS.textPrimary,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: -0.5,
        color: COLORS.textPrimary,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0,
        color: COLORS.textPrimary,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 24,
        color: COLORS.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Clean modern look
    },
    caption: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: COLORS.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    number: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Swiss Technical
        fontWeight: '500',
    }
};

export const COMMON_STYLES = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundStart,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 0, // Sharp corners (Swiss) or minimal radius
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.matteGreen,
        fontFamily: Platform.OS === 'ios' ? 'Optima' : 'serif',
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    }
});
