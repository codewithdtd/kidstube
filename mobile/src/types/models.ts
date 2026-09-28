/**
 * Category data model corresponding to Spring Boot CategoryResponseDTO
 */
export interface Category {
  id: number;
  name: string;
  iconUrl?: string | null;
  displayOrder: number;
}

/**
 * Video data model corresponding to Spring Boot VideoResponseDTO
 */
export interface Video {
  id: number;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  categoryId: number;
  channelTitle?: string | null;
  isActive: boolean;
}

/**
 * Screen Time Status model corresponding to Spring Boot ScreenTimeStatusDTO
 */
export interface ScreenTimeStatus {
  isAllowed: boolean;
  remainingSeconds: number;
  lockReason: 'NONE' | 'MANUAL_LOCK' | 'BEDTIME' | 'TIME_LIMIT_EXCEEDED' | string;
  bedtimeStart: string;
  bedtimeEnd: string;
  isLocked: boolean;
  dailyTimeLimitMinutes: number;
  watchedSecondsToday: number;
}

/**
 * Watch history logging request payload
 */
export interface WatchHistoryRequest {
  videoId: number;
  watchedSeconds: number;
}


