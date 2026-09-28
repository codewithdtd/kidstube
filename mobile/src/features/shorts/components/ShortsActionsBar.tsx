import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShortVideo } from '../../../types/models';

interface ShortsActionsBarProps {
  short: ShortVideo;
  isKidsLocked: boolean;
  onToggleKidsLock: () => void;
  onShare?: () => void;
}

export const ShortsActionsBar: React.FC<ShortsActionsBarProps> = ({
  short,
  isKidsLocked,
  onToggleKidsLock,
  onShare,
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isDisliked, setIsDisliked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(short.likesCount);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      if (isDisliked) setIsDisliked(false);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'Tr';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'N';
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* 1. Like Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={handleLike}
      >
        <View style={[styles.iconCircle, isLiked && styles.likedCircle]}>
          <MaterialCommunityIcons
            name={isLiked ? 'thumb-up' : 'thumb-up-outline'}
            size={26}
            color={isLiked ? '#ef4444' : '#ffffff'}
          />
        </View>
        <Text style={styles.actionLabel}>{formatCount(likeCount)}</Text>
      </TouchableOpacity>

      {/* 2. Dislike Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={handleDislike}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={isDisliked ? 'thumb-down' : 'thumb-down-outline'}
            size={26}
            color={isDisliked ? '#94a3b8' : '#ffffff'}
          />
        </View>
        <Text style={styles.actionLabel}>Không thích</Text>
      </TouchableOpacity>

      {/* 3. Kids Touch Lock Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={onToggleKidsLock}
      >
        <View style={[styles.iconCircle, isKidsLocked && styles.lockedCircle]}>
          <MaterialCommunityIcons
            name={isKidsLocked ? 'lock' : 'lock-open-variant-outline'}
            size={26}
            color={isKidsLocked ? '#f59e0b' : '#ffffff'}
          />
        </View>
        <Text style={styles.actionLabel}>{isKidsLocked ? 'Đã khóa' : 'Khóa chạm'}</Text>
      </TouchableOpacity>

      {/* 4. Share Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        onPress={onShare}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="share-variant" size={26} color="#ffffff" />
        </View>
        <Text style={styles.actionLabel}>Chia sẻ</Text>
      </TouchableOpacity>

      {/* 5. Music Disc Avatar */}
      <View style={styles.discContainer}>
        <View style={styles.discOuter}>
          <MaterialCommunityIcons name="music-note" size={18} color="#ffffff" />
        </View>
      </View>
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
  lockedCircle: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discContainer: {
    marginTop: 6,
  },
  discOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
});
