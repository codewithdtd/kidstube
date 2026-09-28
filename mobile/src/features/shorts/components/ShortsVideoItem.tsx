import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShortVideo } from '../../../types/models';
import { ShortsActionsBar } from './ShortsActionsBar';

interface ShortsVideoItemProps {
  short: ShortVideo;
  isActive: boolean;
  itemHeight: number;
  itemWidth: number;
}

export const ShortsVideoItem: React.FC<ShortsVideoItemProps> = ({
  short,
  isActive,
  itemHeight,
  itemWidth,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isKidsLocked, setIsKidsLocked] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showPlayStateIndicator, setShowPlayStateIndicator] = useState<boolean>(false);

  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const handleTogglePlay = () => {
    if (isKidsLocked) return;
    setIsPlaying((prev) => !prev);
    setShowPlayStateIndicator(true);
    setTimeout(() => setShowPlayStateIndicator(false), 800);
  };

  const handleToggleKidsLock = () => {
    const next = !isKidsLocked;
    setIsKidsLocked(next);
    if (next) {
      Alert.alert('🔒 Khóa Màn Hình Trẻ Em', 'Các cử chỉ đã được khóa để bé không chạm nhầm.');
    }
  };

  return (
    <View style={[styles.container, { width: itemWidth, height: itemHeight }]}>
      <View style={styles.playerWrapper}>
        {Platform.OS === 'web' ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${short.youtubeVideoId}?autoplay=${
              isActive && isPlaying ? 1 : 0
            }&controls=0&loop=1&playlist=${short.youtubeVideoId}&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1`}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#000000' } as any}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            title={short.title}
          />
        ) : (
          <YoutubePlayer
            height={itemHeight}
            width={itemWidth}
            play={isActive && isPlaying}
            videoId={short.youtubeVideoId}
            webViewProps={{
              allowsFullscreenVideo: false,
              androidLayerType: 'hardware',
              setSupportMultipleWindows: false,
              allowsLinkPreview: false,
              onShouldStartLoadWithRequest: (request: { url: string }) => {
                const url = request.url || '';
                return (
                  url === 'about:blank' ||
                  url.includes('youtube.com/embed') ||
                  url.includes('youtube-nocookie.com') ||
                  url.includes('lonelycpp.github.io') ||
                  url.startsWith('data:')
                );
              },
            }}
            initialPlayerParams={{
              controls: false,
              loop: true,
              modestbranding: true,
              preventFullScreen: true,
              rel: false,
              iv_load_policy: 3,
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.touchOverlay} activeOpacity={1} onPress={handleTogglePlay}>
        {showPlayStateIndicator && (
          <View style={styles.playStateBadge}>
            <MaterialCommunityIcons name={isPlaying ? 'play' : 'pause'} size={48} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.bottomInfoContainer} pointerEvents="box-none">
        <View style={styles.channelRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{short.channelTitle.charAt(0)}</Text>
          </View>
          <Text style={styles.channelName} numberOfLines={1}>{short.channelTitle}</Text>
          <TouchableOpacity
            style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]}
            activeOpacity={0.8}
            onPress={() => setIsSubscribed((p) => !p)}
          >
            <Text style={[styles.subscribeText, isSubscribed && styles.subscribedText]}>
              {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.titleText} numberOfLines={2}>{short.title}</Text>

        {short.soundTitle && (
          <View style={styles.soundRow}>
            <MaterialCommunityIcons name="music" size={14} color="#ffffff" />
            <Text style={styles.soundText} numberOfLines={1}>{short.soundTitle}</Text>
          </View>
        )}
      </View>

      <ShortsActionsBar
        short={short}
        isKidsLocked={isKidsLocked}
        onToggleKidsLock={handleToggleKidsLock}
        onShare={() => Alert.alert('KidsTube', 'Đã chia sẻ video ngắn này cùng bé! 💖')}
      />

      {isKidsLocked && (
        <View style={styles.lockedOverlay}>
          <TouchableOpacity style={styles.lockBadge} activeOpacity={0.8} onPress={handleToggleKidsLock}>
            <MaterialCommunityIcons name="lock" size={22} color="#ffffff" />
            <Text style={styles.lockBadgeText}>Chạm để mở khóa màn hình</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  playerWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playStateBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfoContainer: {
    position: 'absolute',
    left: 14,
    right: 76,
    bottom: 20,
    zIndex: 25,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  channelName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 130,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subscribeBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  subscribedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  subscribeText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '700',
  },
  subscribedText: {
    color: '#ffffff',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soundText: {
    color: '#ffffff',
    fontSize: 11,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  lockBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
