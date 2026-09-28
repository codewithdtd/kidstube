/**
 * Formats duration in seconds into standard YouTube timestamp string (e.g. 24:31 or 1:05:42)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

/**
 * Formats view count into compact notation (e.g. 1.9M views, 231K views)
 */
export function formatViews(views: number): string {
  if (!views || views < 0) return '0 views';

  if (views >= 1_000_000) {
    const num = (views / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${num}M views`;
  }
  if (views >= 1_000) {
    const num = (views / 1_000).toFixed(0);
    return `${num}K views`;
  }
  return `${views} views`;
}

/**
 * Formats relative time elapsed (e.g. '8 days ago', '2 months ago')
 */
export function formatTimeAgo(dateInput?: string | Date | null): string {
  if (!dateInput) return 'vừa xong';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInMs = Math.max(0, now.getTime() - date.getTime());
  const diffInSecs = Math.floor(diffInMs / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffInSecs < minute) return 'vừa xong';
  if (diffInSecs < hour) return `${Math.floor(diffInSecs / minute)} phút trước`;
  if (diffInSecs < day) return `${Math.floor(diffInSecs / hour)} giờ trước`;
  if (diffInSecs < month) return `${Math.floor(diffInSecs / day)} ngày trước`;
  if (diffInSecs < year) return `${Math.floor(diffInSecs / month)} tháng trước`;
  return `${Math.floor(diffInSecs / year)} năm trước`;
}
