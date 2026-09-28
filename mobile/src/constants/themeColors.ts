export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  iconColor: string;
  youtubeRed: string;
  chipActiveBg: string;
  chipActiveText: string;
  chipInactiveBg: string;
  chipInactiveText: string;
  chipBorder: string;
  bottomNavBg: string;
  bottomNavBorder: string;
  bottomNavActive: string;
  bottomNavInactive: string;
  badgeBg: string;
  badgeText: string;
  modalBg: string;
  modalSurface: string;
  statusBar: 'light' | 'dark';
}

export const YouTubeDarkTheme: ThemeColors = {
  isDark: true,
  background: '#0f0f0f',
  surface: '#0f0f0f',
  cardBg: '#0f0f0f',
  border: '#272727',
  textPrimary: '#f1f1f1',
  textSecondary: '#aaaaaa',
  iconColor: '#ffffff',
  youtubeRed: '#ff0000',
  chipActiveBg: '#ffffff',
  chipActiveText: '#0f0f0f',
  chipInactiveBg: '#272727',
  chipInactiveText: '#f1f1f1',
  chipBorder: '#383838',
  bottomNavBg: '#0f0f0f',
  bottomNavBorder: '#272727',
  bottomNavActive: '#ffffff',
  bottomNavInactive: '#aaaaaa',
  badgeBg: 'rgba(0, 0, 0, 0.8)',
  badgeText: '#ffffff',
  modalBg: '#212121',
  modalSurface: '#2a2a2a',
  statusBar: 'light',
};

export const YouTubeLightTheme: ThemeColors = {
  isDark: false,
  background: '#ffffff',
  surface: '#ffffff',
  cardBg: '#ffffff',
  border: '#e5e5e5',
  textPrimary: '#0f0f0f',
  textSecondary: '#606060',
  iconColor: '#0f0f0f',
  youtubeRed: '#ff0000',
  chipActiveBg: '#0f0f0f',
  chipActiveText: '#ffffff',
  chipInactiveBg: '#f2f2f2',
  chipInactiveText: '#0f0f0f',
  chipBorder: '#e5e5e5',
  bottomNavBg: '#ffffff',
  bottomNavBorder: '#e5e5e5',
  bottomNavActive: '#0f0f0f',
  bottomNavInactive: '#606060',
  badgeBg: 'rgba(0, 0, 0, 0.8)',
  badgeText: '#ffffff',
  modalBg: '#ffffff',
  modalSurface: '#f5f5f5',
  statusBar: 'dark',
};
