/**
 * Category data model corresponding to Spring Boot CategoryResponseDTO
 */
export interface Category {
  id: number;
  name: string;
  iconUrl?: string | null;
  displayOrder: number;
  videoCount?: number;
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
  categoryName?: string;
  channelTitle?: string | null;
  isActive: boolean;
  createdAt?: string;
}

/**
 * Short video item for vertical full-screen Shorts feed
 */
export interface ShortVideo {
  id: number;
  youtubeVideoId: string;
  title: string;
  channelTitle: string;
  channelAvatarUrl?: string;
  likesCount: number;
  commentsCount: number;
  soundTitle?: string;
}


/**
 * Screen Time Status model corresponding to Spring Boot AppStatusResponse
 */
export interface ScreenTimeStatus {
  isAllowed: boolean;
  remainingSeconds: number;
  dailyLimitMinutes: number;
  todayUsedSeconds: number;
  isLocked: boolean;
  isBedtime: boolean;
  lockReason: 'NONE' | 'MANUAL_LOCK' | 'BEDTIME' | 'TIME_LIMIT_EXCEEDED' | string | null;
  message?: string | null;
}

/**
 * Watch history logging request payload
 */
export interface WatchHistoryRequest {
  videoId: number;
  watchedSeconds: number;
}

