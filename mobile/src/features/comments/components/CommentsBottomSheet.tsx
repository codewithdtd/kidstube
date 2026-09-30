import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../context/ThemeContext';
import { VideoComment } from '../../../types/models';
import { getComments, addComment, toggleLikeComment } from '../../../services/commentService';

interface CommentsBottomSheetProps {
  visible: boolean;
  videoId: number | string;
  videoTitle?: string;
  onClose: () => void;
  onCommentsCountChange?: (count: number) => void;
}

const QUICK_STICKERS = [
  { emoji: '💖', label: 'Yêu thích' },
  { emoji: '🦖', label: 'Khủng long' },
  { emoji: '👏', label: 'Hay quá' },
  { emoji: '🎉', label: 'Siêu đỉnh' },
  { emoji: '🍦', label: 'Thích mê' },
  { emoji: '🎶', label: 'Hát theo' },
  { emoji: '⭐', label: '10 điểm' },
  { emoji: '🎈', label: 'Vui vẻ' },
];

export const CommentsBottomSheet: React.FC<CommentsBottomSheetProps> = ({
  visible,
  videoId,
  videoTitle,
  onClose,
  onCommentsCountChange,
}) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && videoId) {
      setLoading(true);
      getComments(videoId)
        .then((data) => {
          setComments(data);
          onCommentsCountChange?.(data.length);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, videoId]);

  const handleSendComment = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await addComment(videoId, text, 'Bé Cưng 🌟');
      const updated = [created, ...comments];
      setComments(updated);
      setInputText('');
      onCommentsCountChange?.(updated.length);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (err) {
      console.warn('[CommentsSheet] Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStickerPress = (emoji: string, label: string) => {
    if (!inputText.trim()) {
      handleSendComment(`${emoji} ${label}!`);
    } else {
      setInputText((prev) => `${prev} ${emoji}`);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const updated = await toggleLikeComment(videoId, commentId);
      setComments(updated);
    } catch (err) {
      console.warn('[CommentsSheet] Error toggling like:', err);
    }
  };

  const renderCommentItem = ({ item }: { item: VideoComment }) => (
    <View style={[styles.commentRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.avatarCircle, { backgroundColor: item.avatarBgColor }]}>
        <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
      </View>
      <View style={styles.commentContentArea}>
        <View style={styles.commentHeaderRow}>
          <Text style={[styles.authorName, { color: colors.textPrimary }]}>{item.authorName}</Text>
          {item.isKidUser && (
            <View style={styles.kidBadge}>
              <Text style={styles.kidBadgeText}>Bé ✨</Text>
            </View>
          )}
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>{item.createdAt}</Text>
        </View>
        <Text style={[styles.commentText, { color: colors.textPrimary }]}>{item.content}</Text>
        <View style={styles.commentFooterRow}>
          <TouchableOpacity style={styles.likeBtn} activeOpacity={0.7} onPress={() => handleLike(item.id)}>
            <MaterialCommunityIcons
              name={item.isLiked ? 'thumb-up' : 'thumb-up-outline'}
              size={16}
              color={item.isLiked ? colors.youtubeRed : colors.textSecondary}
            />
            <Text style={[styles.likeCountText, { color: item.isLiked ? colors.youtubeRed : colors.textSecondary }]}>
              {item.likesCount > 0 ? item.likesCount : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.sheetContainer, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View style={styles.dragIndicatorWrapper}>
            <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
          </View>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Bình luận</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.chipInactiveBg }]}>
                <Text style={[styles.countText, { color: colors.textPrimary }]}>{comments.length}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.stickersBarWrapper}>
            <Text style={[styles.stickersLabel, { color: colors.textSecondary }]}>Chọn nhanh hình dán cho bé:</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={QUICK_STICKERS}
              keyExtractor={(item) => item.emoji}
              contentContainerStyle={styles.stickersList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stickerChip, { backgroundColor: colors.chipInactiveBg }]}
                  activeOpacity={0.7}
                  onPress={() => handleQuickStickerPress(item.emoji, item.label)}
                >
                  <Text style={styles.stickerEmoji}>{item.emoji}</Text>
                  <Text style={[styles.stickerLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.youtubeRed} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải bình luận...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderCommentItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator
            />
          )}

          <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
            <View style={[styles.userAvatar, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.userAvatarEmoji}>👶</Text>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.chipInactiveBg, color: colors.textPrimary }]}
              placeholder="Bé viết bình luận hoặc chọn hình dán nhé..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              maxLength={200}
              returnKeyType="send"
              onSubmitEditing={() => handleSendComment()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, inputText.trim().length > 0 ? styles.sendBtnActive : styles.sendBtnDisabled]}
              activeOpacity={0.8}
              disabled={inputText.trim().length === 0 || isSubmitting}
              onPress={() => handleSendComment()}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={inputText.trim().length > 0 ? '#ffffff' : '#94a3b8'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dragIndicatorWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  stickersBarWrapper: {
    paddingVertical: 8,
  },
  stickersLabel: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  stickersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  stickerEmoji: {
    fontSize: 16,
  },
  stickerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  commentRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  commentContentArea: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  kidBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  kidBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  commentFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarEmoji: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#0284c7',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
});

