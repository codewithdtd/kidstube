import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, Text, TouchableOpacity } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface YouTubeVideoPlayerProps {
  videoId: string;
  playing: boolean;
  onStateChange?: (state: string) => void;
  isKidsLocked: boolean;
  onToggleKidsLock: () => void;
}

export const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  videoId,
  playing,
  onStateChange,
  isKidsLocked,
  onToggleKidsLock,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const playerHeight = Math.floor((windowWidth * 9) / 16);

  return (
    <View style={[styles.container, { width: windowWidth, height: playerHeight }]}>
      {Platform.OS === 'web' ? (
        // Web Platform: Embed safe YouTube No-Cookie iframe
        <View style={styles.webContainer}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            } as any}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="KidsTube YouTube Player"
          />
        </View>
      ) : (
        // Native iOS & Android: Standard react-native-youtube-iframe
        <YoutubePlayer
          height={playerHeight}
          width={windowWidth}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          webViewProps={{
            allowsFullscreenVideo: true,
            androidLayerType: 'hardware',
          }}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            preventFullScreen: false,
            rel: false,
          }}
        />
      )}

      {/* Kids Touch Lock Overlay */}
      {isKidsLocked && (
        <View style={styles.lockedOverlay}>
          <TouchableOpacity
            style={styles.lockBadge}
            activeOpacity={0.8}
            onPress={onToggleKidsLock}
          >
            <MaterialCommunityIcons name="lock" size={20} color="#ffffff" />
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
  webContainer: {
    width: '100%',
    height: '100%',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  lockBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
