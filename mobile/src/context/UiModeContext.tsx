import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAppStatus, updateUiModeApi } from '../services/apiClient';

export type UiMode = 'YOUTUBE' | 'KIDS_WORLD';

interface UiModeContextValue {
  uiMode: UiMode;
  isKidsWorld: boolean;
  setUiMode: (mode: UiMode) => Promise<void>;
  toggleUiMode: () => Promise<void>;
  refreshUiModeFromBackend: () => Promise<void>;
}

const UI_MODE_STORAGE_KEY = '@kidstube_ui_mode';

const UiModeContext = createContext<UiModeContextValue | undefined>(undefined);

export const UiModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiMode, setUiModeState] = useState<UiMode>('KIDS_WORLD');

  // Load cached UI mode on startup
  useEffect(() => {
    let isMounted = true;

    async function initUiMode() {
      try {
        const cached = await AsyncStorage.getItem(UI_MODE_STORAGE_KEY);
        if (cached === 'YOUTUBE' || cached === 'KIDS_WORLD') {
          if (isMounted) setUiModeState(cached);
          // If cached mode exists locally, respect it as authoritative and NEVER overwrite it
          return;
        }

        // Only when there is no local setting yet (fresh install), sync from server status
        const status = await fetchAppStatus();
        if (status.uiMode === 'YOUTUBE' || status.uiMode === 'KIDS_WORLD') {
          if (isMounted) {
            setUiModeState(status.uiMode);
            await AsyncStorage.setItem(UI_MODE_STORAGE_KEY, status.uiMode);
          }
        }
      } catch (err) {
        console.warn('[UiModeContext] Failed to init UI mode:', err);
      }
    }

    initUiMode();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUiModeFromBackend = useCallback(async () => {
    // Only refresh from backend if there is no explicit local preference in AsyncStorage
    try {
      const cached = await AsyncStorage.getItem(UI_MODE_STORAGE_KEY);
      if (!cached) {
        const status = await fetchAppStatus();
        if (status.uiMode === 'YOUTUBE' || status.uiMode === 'KIDS_WORLD') {
          setUiModeState(status.uiMode);
          await AsyncStorage.setItem(UI_MODE_STORAGE_KEY, status.uiMode);
        }
      }
    } catch (err) {
      console.warn('[UiModeContext] Failed to refresh UI mode from backend:', err);
    }
  }, []);

  const setUiMode = useCallback(async (mode: UiMode) => {
    setUiModeState(mode);
    try {
      await AsyncStorage.setItem(UI_MODE_STORAGE_KEY, mode);
      updateUiModeApi(mode).catch((err) => {
        console.warn('[UiModeContext] Failed to sync UI mode to backend:', err);
      });
    } catch (err) {
      console.warn('[UiModeContext] Failed to save UI mode:', err);
    }
  }, []);

  const toggleUiMode = useCallback(async () => {
    setUiModeState((current) => {
      const nextMode: UiMode = current === 'KIDS_WORLD' ? 'YOUTUBE' : 'KIDS_WORLD';
      AsyncStorage.setItem(UI_MODE_STORAGE_KEY, nextMode).catch(console.warn);
      updateUiModeApi(nextMode).catch(console.warn);
      return nextMode;
    });
  }, []);

  const value = useMemo<UiModeContextValue>(
    () => ({
      uiMode,
      isKidsWorld: uiMode === 'KIDS_WORLD',
      setUiMode,
      toggleUiMode,
      refreshUiModeFromBackend,
    }),
    [uiMode, setUiMode, toggleUiMode, refreshUiModeFromBackend]
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
};

export const useUiMode = (): UiModeContextValue => {
  const context = useContext(UiModeContext);
  if (!context) {
    throw new Error('useUiMode must be used within a UiModeProvider');
  }
  return context;
};
