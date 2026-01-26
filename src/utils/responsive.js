import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Detect if device is tablet/iPad based on width and pixel density
// Typical standard: width >= 768 is iPad/Tablet
export const isTablet = width >= 768;

/**
 * Responsive Value Helper
 * Returns `tabletValue` if on tablet, otherwise `mobileValue`.
 */
export const responsiveValue = (mobileValue, tabletValue) => {
    return isTablet ? tabletValue : mobileValue;
};

/**
 * Max Container Width for Tablet
 * Prevents content from stretching too wide on iPad (e.g., max 600px width for lists)
 */
export const TABLET_MAX_WIDTH = 600;

/**
 * Dynamic Width Calculation
 * If on tablet, returns a constrained width or percentage.
 * If on mobile, usually returns '100%' or similar.
 */
export const getContainerStyle = () => {
    if (!isTablet) return { width: '100%' };

    return {
        width: '100%',
        maxWidth: TABLET_MAX_WIDTH,
        alignSelf: 'center',
    };
};

// Calculate number of columns for grids based on screen width
export const getGridColumns = (itemMinWidth = 100) => {
    const screenWidth = isTablet ? Math.min(width, TABLET_MAX_WIDTH + 200) : width - 32; // padding consideration
    return Math.floor(screenWidth / itemMinWidth);
};
