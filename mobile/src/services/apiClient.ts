import { Platform, NativeModules } from 'react-native';
import { Video, Category, ScreenTimeStatus, ShortVideo } from '../types/models';
import { MOCK_VIDEOS, FALLBACK_CATEGORIES } from '../features/feed/data/mockVideos';
import { MOCK_SHORTS } from '../features/shorts/data/mockShorts';

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
 * Helper to convert backend Video entities to ShortVideo format for the mobile feed
 */
const mapVideosToShorts = (videos: Video[]): ShortVideo[] => {
  return videos.map((v) => ({
    id: v.id,
    youtubeVideoId: v.youtubeVideoId,
    title: v.title,
    channelTitle: v.channelTitle || 'KidsTube Creator',
    channelAvatarUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kXJp0=s176-c-k-c0x00ffffff-no-rj',
    likesCount: 1200 + (v.id * 137) % 5000,
    commentsCount: 30 + (v.id * 23) % 200,
    soundTitle: 'Âm thanh gốc - ' + (v.channelTitle || 'KidsTube'),
  }));
};

/**
 * Fetch shorts video feed for kid (vertical short-form content).
 * Resilient multi-tier strategy:
 * 1. Queries `/api/v1/videos/shorts` (dedicated Shorts endpoint).
 * 2. If endpoint fails or returns empty, queries `/api/v1/videos` and filters for Shorts (#shorts, duration <= 90s, or all active DB videos).
 * 3. Falls back to verified MOCK_SHORTS only if backend is completely unreachable.
 */
export async function fetchShorts(): Promise<ShortVideo[]> {
  // Strategy 1: Dedicated /api/v1/videos/shorts
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/videos/shorts`);
    if (res.ok) {
      const data: Video[] = await res.json();
      if (data && data.length > 0) {
        console.log(`[API] Loaded ${data.length} shorts from /api/v1/videos/shorts`);
        return mapVideosToShorts(data);
      }
    }
  } catch (e) {
    console.warn('[API] /api/v1/videos/shorts unavailable, falling back to general video feed:', e);
  }

  // Strategy 2: Fallback to general DB videos /api/v1/videos
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/videos`);
    if (res.ok) {
      const allVideos: Video[] = await res.json();
      if (allVideos && allVideos.length > 0) {
        // Filter videos with #shorts in title, or short duration (<= 90s)
        const detectedShorts = allVideos.filter(
          (v) =>
            v.title.toLowerCase().includes('short') ||
            (v.durationSeconds && v.durationSeconds > 0 && v.durationSeconds <= 90)
        );
        const candidates = detectedShorts.length > 0 ? detectedShorts : allVideos;
        console.log(`[API] Loaded ${candidates.length} DB videos for Shorts feed`);
        return mapVideosToShorts(candidates);
      }
    }
  } catch (e) {
    console.warn('[API] Could not fetch general videos for shorts fallback:', e);
  }

  // Strategy 3: Verified safe mock shorts
  console.log('[API] Using verified fallback MOCK_SHORTS');
  return MOCK_SHORTS;
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
