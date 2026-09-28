import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video } from '../../../types/models';
import { useAppTheme } from '../../../context/ThemeContext';
import { formatDuration, formatViews } from '../../../utils/formatters';

interface UpNextVideoCardProps {
  video: Video;
  onPress: (video: Video) => void;
}

export const UpNextVideoCard: React.FC<UpNextVideoCardProps> = ({ video, onPress }) => {
  const { colors } = useAppTheme();
  const simulatedViews = ((video.id * 137000) % 2500000) + 15000;
  const simulatedDaysAgo = (video.id % 28) + 1;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(video)}
    >
      {/* 16:9 Left Thumbnail with Duration Badge */}
      <View style={[styles.thumbnailWrapper, { backgroundColor: colors.border }]}>
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

      {/* Right Metadata */}
      <View style={styles.infoWrapper}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        <Text style={[styles.channelTitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {video.channelTitle || 'Kids Channel'}
        </Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          {formatViews(simulatedViews)} • {simulatedDaysAgo}d ago
        </Text>
      </View>

      <TouchableOpacity
        style={styles.moreBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialCommunityIcons name="dots-vertical" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  thumbnailWrapper: {
    width: 140,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoWrapper: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  channelTitle: {
    fontSize: 11,
    marginTop: 3,
  },
  metaText: {
    fontSize: 11,
    marginTop: 1,
  },
  moreBtn: {
    paddingTop: 2,
  },
});
