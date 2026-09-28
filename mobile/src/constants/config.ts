import { Platform } from 'react-native';

/**
 * Backend API Configuration
 * Supports environment override via EXPO_PUBLIC_API_URL or defaults to localhost/Android emulator bridge.
 */
const getDefaultApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emulator uses 10.0.2.2 to access host machine localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

export const Config = {
  API_BASE_URL: getDefaultApiUrl(),
  REQUEST_TIMEOUT_MS: 10000,
} as const;
