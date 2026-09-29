import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, YouTubeDarkTheme, YouTubeLightTheme } from '../constants/themeColors';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  themePreference: ThemePreference;
  colors: ThemeColors;
  isDark: boolean;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system'); // Default to dark as requested

  const colors = useMemo<ThemeColors>(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'light' ? YouTubeLightTheme : YouTubeDarkTheme;
    }
    return themePreference === 'light' ? YouTubeLightTheme : YouTubeDarkTheme;
  }, [themePreference, systemColorScheme]);

  const toggleTheme = () => {
    setThemePreference((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      themePreference,
      colors,
      isDark: colors.isDark,
      setThemePreference,
      toggleTheme,
    }),
    [themePreference, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
