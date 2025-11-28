/**
 * Theme constants for consistent styling across the application
 * Use these constants instead of hardcoded Tailwind classes
 */

export const THEME_COLORS = {
  // Primary brand color (Orange)
  PRIMARY: {
    base: 'primary-500',
    light: 'primary-50',
    lighter: 'primary-100',
    medium: 'primary-400',
    dark: 'primary-600',
    darker: 'primary-700',
    darkest: 'primary-800',
  },
  // Secondary brand color (Pink)
  SECONDARY: {
    base: 'secondary-500',
    light: 'secondary-50',
    lighter: 'secondary-100',
    medium: 'secondary-400',
    dark: 'secondary-600',
    darker: 'secondary-700',
  },
  // Accent color (Amber/Yellow)
  ACCENT: {
    base: 'accent-500',
    light: 'accent-100',
    medium: 'accent-400',
    dark: 'accent-600',
  },
} as const;

/**
 * Common button styles using theme colors
 */
export const BUTTON_STYLES = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
} as const;

/**
 * Common text styles using theme colors
 */
export const TEXT_STYLES = {
  primary: 'text-primary-600',
  primaryLight: 'text-primary-500',
  primaryDark: 'text-primary-700',
  secondary: 'text-secondary-600',
  accent: 'text-accent-600',
  muted: 'text-gray-600',
  heading: 'text-gray-900',
} as const;

/**
 * Common background styles using theme colors
 */
export const BG_STYLES = {
  primary: 'bg-primary-500',
  primaryLight: 'bg-primary-50',
  primaryLighter: 'bg-primary-100',
  secondary: 'bg-secondary-500',
  secondaryLight: 'bg-secondary-50',
  accent: 'bg-accent-500',
  light: 'bg-gray-50',
  white: 'bg-white',
} as const;

/**
 * Common border styles using theme colors
 */
export const BORDER_STYLES = {
  primary: 'border-primary-500',
  primaryLight: 'border-primary-200',
  primaryDark: 'border-primary-600',
  secondary: 'border-secondary-500',
  light: 'border-gray-200',
  medium: 'border-gray-300',
} as const;

/**
 * Gradient backgrounds using theme colors
 */
export const GRADIENT_STYLES = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
  secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
  primaryToSecondary: 'bg-gradient-to-r from-primary-500 to-secondary-500',
  warm: 'bg-gradient-to-br from-primary-50 to-secondary-50',
  hero: 'bg-gradient-to-br from-primary-50 via-white to-secondary-50',
} as const;

/**
 * Helper function to build class names with theme colors
 */
export const themeClass = {
  button: (variant: keyof typeof BUTTON_STYLES = 'primary') => BUTTON_STYLES[variant],
  text: (variant: keyof typeof TEXT_STYLES = 'primary') => TEXT_STYLES[variant],
  bg: (variant: keyof typeof BG_STYLES = 'white') => BG_STYLES[variant],
  border: (variant: keyof typeof BORDER_STYLES = 'light') => BORDER_STYLES[variant],
  gradient: (variant: keyof typeof GRADIENT_STYLES = 'primary') => GRADIENT_STYLES[variant],
} as const;

export type ThemeColor = typeof THEME_COLORS;
export type ButtonVariant = keyof typeof BUTTON_STYLES;
export type TextVariant = keyof typeof TEXT_STYLES;
export type BgVariant = keyof typeof BG_STYLES;
export type BorderVariant = keyof typeof BORDER_STYLES;
export type GradientVariant = keyof typeof GRADIENT_STYLES;
