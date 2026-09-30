import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShortVideo } from '../../../types/models';

interface ShortsActionsBarProps {
  short: ShortVideo;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  commentsCount?: number;
  onOpenComments: () => void;
  onShare?: () => void;
}

export const ShortsActionsBar: React.FC<ShortsActionsBarProps> = ({
  short,
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  commentsCount,
  onOpenComments,
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(short.likesCount);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* 1. Play / Pause Control Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={onTogglePlay}
      >
        <View style={[styles.iconCircle, !isPlaying && styles.pausedCircle]}>
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            color="#ffffff"
          />
        </View>
        <Text style={styles.actionLabel}>{isPlaying ? 'Tạm dừng' : 'Phát'}</Text>
      </TouchableOpacity>

      {/* 2. Mute / Unmute Audio Toggle */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={onToggleMute}
      >
        <View style={[styles.iconCircle, isMuted && styles.mutedCircle]}>
          <MaterialCommunityIcons
            name={isMuted ? 'volume-off' : 'volume-high'}
            size={24}
            color={isMuted ? '#f59e0b' : '#ffffff'}
          />
        </View>
        <Text style={styles.actionLabel}>{isMuted ? 'Bật tiếng' : 'Tắt tiếng'}</Text>
      </TouchableOpacity>

      {/* 3. Kid Heart Reaction (Thả Tim - Replaces boring thumbs up) */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={handleLike}
      >
        <View style={[styles.iconCircle, isLiked && styles.likedCircle]}>
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={isLiked ? '#ef4444' : '#ffffff'}
          />
        </View>
        <Text style={[styles.actionLabel, isLiked && styles.likedLabel]}>
          {formatCount(likeCount)}
        </Text>
      </TouchableOpacity>

      {/* 4. Interactive Comments Sheet */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={onOpenComments}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="comment-text-multiple-outline"
            size={24}
            color="#ffffff"
          />
        </View>
        <Text style={styles.actionLabel}>
          {formatCount(commentsCount || short.commentsCount || 12)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    alignItems: 'center',
    gap: 16,
    zIndex: 30,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  likedCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  pausedCircle: {
    backgroundColor: '#ef4444',
  },
  mutedCircle: {
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
  },

  actionLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  likedLabel: {
    color: '#f87171',
    fontWeight: '800',
  },
});
