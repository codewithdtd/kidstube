import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoComment } from '../types/models';

const STORAGE_PREFIX = '@kidstube_comments_v2_';

// Seeded cheerful and age-appropriate comments for kids
const DEFAULT_MOCK_COMMENTS: Omit<VideoComment, 'id' | 'videoId'>[] = [
  {
    authorName: 'Bé Bắp 🌽',
    avatarBgColor: '#f59e0b',
    avatarEmoji: '🌽',
    content: 'Con xem bài này 5 lần rồi mẹ ơi, hay và vui quá! 🥰',
    createdAt: '15 phút trước',
    likesCount: 38,
    isLiked: false,
    isKidUser: false,
  },
  {
    authorName: 'Bé Sóc Nhanh Nhẹn 🐿️',
    avatarBgColor: '#10b981',
    avatarEmoji: '🐿️',
    content: 'Đoạn nhảy múa dễ thương ghê luôn á 💃🎉',
    createdAt: '45 phút trước',
    likesCount: 24,
    isLiked: false,
    isKidUser: false,
  },
  {
    authorName: 'Bé Miu Miu 🐱',
    avatarBgColor: '#ec4899',
    avatarEmoji: '🐱',
    content: '1 2 3 4 5 con đếm theo được hết rồi nè! 👏',
    createdAt: '1 giờ trước',
    likesCount: 42,
    isLiked: false,
    isKidUser: false,
  },
  {
    authorName: 'Gấu Con Dễ Thương 🐻',
    avatarBgColor: '#6366f1',
    avatarEmoji: '🐻',
    content: 'Màu sắc đẹp mê li, con thích nhất chú khủng long xanh lá 🦖💚',
    createdAt: '2 giờ trước',
    likesCount: 19,
    isLiked: false,
    isKidUser: false,
  },
  {
    authorName: 'Bé Bo Đua Xe 🚗',
    avatarBgColor: '#3b82f6',
    avatarEmoji: '🚗',
    content: 'Nhạc vui nhộn quá bé vừa nghe vừa nhún nhảy theo luôn! 🎶✨',
    createdAt: '3 giờ trước',
    likesCount: 31,
    isLiked: false,
    isKidUser: false,
  },
  {
    authorName: 'Thỏ Bông Trắng 🐰',
    avatarBgColor: '#8b5cf6',
    avatarEmoji: '🐰',
    content: 'Ngày mai mẹ lại mở bài này cho con xem nữa nha! ⭐🍦',
    createdAt: 'Hôm qua',
    likesCount: 56,
    isLiked: false,
    isKidUser: false,
  },
  {
    authorName: 'Bé Nhím Xinh 🦔',
    avatarBgColor: '#f97316',
    avatarEmoji: '🦔',
    content: 'Xem xong con biết xếp đồ chơi gọn gàng rồi ạ! 🧸🎈',
    createdAt: '2 ngày trước',
    likesCount: 17,
    isLiked: false,
    isKidUser: false,
  },
];

// Helper to generate deterministic seeded comments per video
const generateSeededComments = (videoId: number | string): VideoComment[] => {
  const numId = typeof videoId === 'number' ? videoId : videoId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const count = 3 + (numId % 4); // 3 to 6 comments
  const result: VideoComment[] = [];

  for (let i = 0; i < count; i++) {
    const seedIndex = (numId + i) % DEFAULT_MOCK_COMMENTS.length;
    const base = DEFAULT_MOCK_COMMENTS[seedIndex];
    result.push({
      id: `seed_${videoId}_${i}`,
      videoId,
      ...base,
      likesCount: base.likesCount + (numId % 10),
    });
  }

  return result;
};

/**
 * Fetch all comments for a video (combines seeded comments and user's saved comments)
 */
export const getComments = async (videoId: number | string): Promise<VideoComment[]> => {
  try {
    const storedJson = await AsyncStorage.getItem(STORAGE_PREFIX + videoId);
    if (storedJson) {
      const parsed: VideoComment[] = JSON.parse(storedJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CommentService] Error reading stored comments:', err);
  }

  // Initialize with seeded comments
  const initialComments = generateSeededComments(videoId);
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + videoId, JSON.stringify(initialComments));
  } catch (err) {
    console.warn('[CommentService] Error caching initial comments:', err);
  }
  return initialComments;
};

/**
 * Add a new comment by the kid user
 */
export const addComment = async (
  videoId: number | string,
  content: string,
  authorName: string = 'Bé Cưng 🌟'
): Promise<VideoComment> => {
  const currentComments = await getComments(videoId);

  const newComment: VideoComment = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    videoId,
    authorName,
    avatarBgColor: '#ef4444',
    avatarEmoji: '👶',
    content: content.trim(),
    createdAt: 'Vừa xong',
    likesCount: 1,
    isLiked: true,
    isKidUser: true,
  };

  // Place new comment at the top for immediate positive reinforcement
  const updatedList = [newComment, ...currentComments];

  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + videoId, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('[CommentService] Error saving new comment:', err);
  }

  return newComment;
};

/**
 * Like or unlike a comment
 */
export const toggleLikeComment = async (
  videoId: number | string,
  commentId: string
): Promise<VideoComment[]> => {
  const currentComments = await getComments(videoId);

  const updatedList = currentComments.map((c) => {
    if (c.id === commentId) {
      const nextLiked = !c.isLiked;
      return {
        ...c,
        isLiked: nextLiked,
        likesCount: nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
      };
    }
    return c;
  });

  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + videoId, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('[CommentService] Error toggling like:', err);
  }

  return updatedList;
};
