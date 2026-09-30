import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { UiModeProvider } from './src/context/UiModeContext';

const AppContent: React.FC = () => {
  const { colors } = useAppTheme();
  return (
    <>
      <StatusBar style={colors.statusBar} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UiModeProvider>
          <AppContent />
        </UiModeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

