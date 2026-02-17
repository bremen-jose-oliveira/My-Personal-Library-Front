// Modern Design System for My Personal Library

export const colors = {
  // Primary Colors - Modern gradient-friendly palette
  primary: {
    50: '#fff5f2',
    100: '#ffe8e0',
    200: '#ffd5c6',
    300: '#ffb89f',
    400: '#ff9166',
    500: '#ff6b35',  // Main primary color
    600: '#f04e1a',
    700: '#d93d0e',
    800: '#b3340f',
    900: '#932f10',
  },
  
  // Secondary Colors - Complementary modern palette
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#b9e6fe',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Semantic Colors
  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
  },
  
  warning: {
    light: '#fde047',
    main: '#eab308',
    dark: '#ca8a04',
  },
  
  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#dc2626',
  },
  
  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
  },
  
  // Background & Surface
  background: {
    default: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    dark: '#1a1a1a',
  },
  
  // Text Colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    inverse: '#ffffff',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const gradients = {
  primary: ['#ff6b35', '#f04e1a'],
  secondary: ['#0ea5e9', '#0284c7'],
  sunset: ['#ff6b35', '#ff9166', '#ffb89f'],
  ocean: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
  dark: ['#262626', '#171717', '#000000'],
  light: ['#ffffff', '#fafafa', '#f5f5f5'],
};

export const layout = {
  maxWidth: 1200,
  containerPadding: spacing.md,
  cardPadding: spacing.lg,
};

export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Export default theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  gradients,
  layout,
  animation,
};

export default theme;
