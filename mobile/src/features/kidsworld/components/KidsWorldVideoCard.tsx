import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video } from '../../../types/models';
import { formatDuration } from '../../../utils/formatters';

interface KidsWorldVideoCardProps {
  video: Video;
  onPress: (video: Video) => void;
  onMorePress?: (video: Video) => void;
}

const MODERN_THEMES = [
  { border: '#6366F1', tagBg: '#EEF2FF', tagColor: '#4F46E5', icon: 'gamepad-variant' as const, label: 'GAMING' },
  { border: '#0284C7', tagBg: '#F0F9FF', tagColor: '#0369A1', icon: 'rocket-launch' as const, label: 'KHOA HỌC' },
  { border: '#059669', tagBg: '#ECFDF5', tagColor: '#047857', icon: 'palette' as const, label: 'SÁNG TẠO' },
  { border: '#D97706', tagBg: '#FFFBEB', tagColor: '#B45309', icon: 'lightning-bolt' as const, label: 'THỬ THÁCH' },
  { border: '#E11D48', tagBg: '#FFF1F2', tagColor: '#BE123C', icon: 'music' as const, label: 'ÂM NHẠC' },
];

export const KidsWorldVideoCard: React.FC<KidsWorldVideoCardProps> = ({
  video,
  onPress,
}) => {
  const theme = MODERN_THEMES[video.id % MODERN_THEMES.length];

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.88}
      onPress={() => onPress(video)}
    >
      {/* 16:9 Thumbnail Container */}
      <View style={styles.thumbnailWrapper}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Modern Centered Play Glass Badge */}
        <View style={styles.playCenterOverlay} pointerEvents="none">
          <View style={[styles.playGlassBtn, { borderColor: theme.border }]}>
            <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </View>

        {/* Top-Left Category Tag */}
        <View style={[styles.topTag, { backgroundColor: theme.tagBg, borderColor: theme.border }]}>
          <MaterialCommunityIcons name={theme.icon} size={12} color={theme.tagColor} />
          <Text style={[styles.tagText, { color: theme.tagColor }]}>{theme.label}</Text>
        </View>

        {/* Bottom-Right Clean Duration Badge (No Baby Candy) */}
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>{formatDuration(video.durationSeconds)}</Text>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>

        <View style={styles.channelRow}>
          <View style={[styles.channelAvatar, { backgroundColor: theme.tagBg }]}>
            <Text style={[styles.channelInitial, { color: theme.tagColor }]}>
              {video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : 'K'}
            </Text>
          </View>
          <Text style={styles.channelName} numberOfLines={1}>
            {video.channelTitle || 'Kids Creator'}
          </Text>
          <MaterialCommunityIcons name="check-decagram" size={14} color="#3B82F6" />
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>🔥 Hot</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  thumbnailWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  topTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 3.5,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoContainer: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    minHeight: 36,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  channelAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInitial: {
    fontSize: 10,
    fontWeight: '900',
  },
  channelName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  hotBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
});
