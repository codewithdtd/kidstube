/**
 * Kids UX Ergonomics & Layout Constants
 * In compliance with senior guidelines: touch targets must be at least 48dp for little fingers.
 */
export const Theme = {
  touchTargetMin: 48,
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    kidTitle: 24,
    heading: 18,
    body: 15,
    caption: 12,
    badge: 11,
  },
} as const;
