import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video } from '../../../types/models';
import { useAppTheme } from '../../../context/ThemeContext';
import { formatDuration, formatViews } from '../../../utils/formatters';

interface YouTubeVideoCardProps {
  video: Video;
  onPress: (video: Video) => void;
  onMorePress?: (video: Video) => void;
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({
  video,
  onPress,
  onMorePress,
}) => {
  const { colors } = useAppTheme();

  // Deterministic mock views/days based on video.id for authentic YouTube appearance
  const simulatedViews = ((video.id * 137000) % 2500000) + 15000;
  const simulatedDaysAgo = (video.id % 28) + 1;

  const initialLetter = (video.channelTitle || video.title || 'K').charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.88}
      onPress={() => onPress(video)}
    >
      {/* 16:9 Thumbnail with Duration Badge */}
      <View style={[styles.thumbnailContainer, { backgroundColor: colors.border }]}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={[styles.durationBadge, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.durationText, { color: colors.badgeText }]}>
            {formatDuration(video.durationSeconds)}
          </Text>
        </View>
      </View>

      {/* Meta Information Container */}
      <View style={styles.detailsContainer}>
        {/* Title and 3-dots Menu */}
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {video.title}
          </Text>
          <TouchableOpacity
            style={styles.moreBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onMorePress?.(video)}
          >
            <MaterialCommunityIcons name="dots-vertical" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Channel Row: Mini Avatar + Name • Views • Time */}
        <View style={styles.channelRow}>
          <View style={[styles.channelAvatar, { backgroundColor: colors.youtubeRed }]}>
            <Text style={styles.channelAvatarText}>{initialLetter}</Text>
          </View>
          <Text
            style={[styles.metaText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {(video.channelTitle || 'Kids Channel')} • {formatViews(simulatedViews)} • {simulatedDaysAgo}d ago
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  durationText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailsContainer: {
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16.5,
    paddingRight: 4,
  },
  moreBtn: {
    paddingTop: 1,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  channelAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelAvatarText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  metaText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '400',
  },
});
