import { Platform, NativeModules } from 'react-native';
import { Video, Category, ScreenTimeStatus } from '../types/models';
import { MOCK_VIDEOS, FALLBACK_CATEGORIES } from '../features/feed/data/mockVideos';

/**
 * Dynamic Base URL resolution:
 * 1. Expo Go on real device: Extracts the computer LAN IP from Metro bundler's scriptURL (e.g. 192.168.2.103:8081).
 * 2. Android Emulator: 10.0.2.2 (default loopback to PC host).
 * 3. Fallback: Host computer Wi-Fi LAN IP (192.168.2.103:8080) or localhost for web.
 */
const getApiBaseUrl = (): string => {
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
      if (match && match[1]) {
        const host = match[1];
        if (host !== 'localhost' && host !== '127.0.0.1') {
          return `http://${host}:8080`;
        }
      }
    }
  } catch (e) {
    console.warn('[API] Could not detect Metro scriptURL, falling back to LAN IP:', e);
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  // Fallback to computer LAN IP on local Wi-Fi for Expo Go physical devices
  return 'http://192.168.2.103:8080';
};

export const API_BASE_URL = getApiBaseUrl();
console.log(`[KidsTube API] Active Base URL -> ${API_BASE_URL}`);

const REQUEST_TIMEOUT_MS = 3500;

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch video feed for kid (optionally filtered by category)
 */
export async function fetchVideos(categoryId?: number): Promise<Video[]> {
  try {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/videos${query}`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data: Video[] = await res.json();
    return data;
  } catch (error) {
    console.warn('[API] Could not fetch videos from backend, using fallback data:', error);
    if (categoryId) {
      return MOCK_VIDEOS.filter((v) => v.categoryId === categoryId);
    }
    return MOCK_VIDEOS;
  }
}

/**
 * Fetch active video categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/categories`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data: Category[] = await res.json();
    return data;
  } catch (error) {
    console.warn('[API] Could not fetch categories from backend, using fallback data:', error);
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Fetch screen-time and lock permission status
 */
export async function fetchAppStatus(): Promise<ScreenTimeStatus> {
  const defaultStatus: ScreenTimeStatus = {
    isAllowed: true,
    remainingSeconds: 2700, // 45 minutes default
    dailyLimitMinutes: 45,
    todayUsedSeconds: 0,
    isLocked: false,
    isBedtime: false,
    lockReason: null,
    message: null,
  };

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/status`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data: ScreenTimeStatus = await res.json();
    return data;
  } catch (error) {
    console.warn('[API] Could not fetch status from backend, using default offline status:', error);
    return defaultStatus;
  }
}

/**
 * Report watch time duration to backend
 */
export async function recordWatchHistory(videoId: number, watchedSeconds: number): Promise<boolean> {
  if (watchedSeconds <= 0) return true;

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/history`, {
      method: 'POST',
      body: JSON.stringify({ videoId, watchedSeconds }),
    });
    return res.ok;
  } catch (error) {
    console.warn('[API] Failed to record watch history:', error);
    return false;
  }
}

/**
 * Toggle instant lock from Parent controls
 */
export async function toggleParentLock(isLocked: boolean): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/parent/settings/lock?isLocked=${isLocked}`, {
      method: 'PATCH',
    });
    return res.ok;
  } catch (error) {
    console.warn('[API] Failed to toggle lock:', error);
    return false;
  }
}
