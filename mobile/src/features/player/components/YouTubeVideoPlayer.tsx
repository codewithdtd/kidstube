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
  isEnded?: boolean;
  onReplay?: () => void;
}

export const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  videoId,
  playing,
  onStateChange,
  isKidsLocked,
  onToggleKidsLock,
  isEnded = false,
  onReplay,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const playerHeight = Math.floor((windowWidth * 9) / 16);

  return (
    <View style={[styles.container, { width: windowWidth, height: playerHeight }]}>
      {Platform.OS === 'web' ? (
        // Web Platform: Embed safe YouTube No-Cookie iframe with strict sandbox
        <View style={styles.webContainer}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            } as any}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            title="KidsTube YouTube Player"
          />
        </View>
      ) : (
        // Native iOS & Android: Standard react-native-youtube-iframe with strict navigation boundary
        <YoutubePlayer
          height={playerHeight}
          width={windowWidth}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          webViewProps={{
            allowsFullscreenVideo: true,
            androidLayerType: 'hardware',
            setSupportMultipleWindows: false,
            allowsLinkPreview: false,
            javaScriptCanOpenWindowsAutomatically: false,
            onShouldStartLoadWithRequest: (request: { url: string }) => {
              const url = request.url || '';
              // Allow internal player scripts, embed frame, and local data
              if (
                url === 'about:blank' ||
                url.includes('youtube.com/embed') ||
                url.includes('youtube-nocookie.com') ||
                url.includes('lonelycpp.github.io') ||
                url.startsWith('data:')
              ) {
                return true;
              }
              // STRICTLY BLOCK ALL external links (youtube.com/watch, channels, intent schemes, ads)
              console.log('[KidsTube Player] Blocked attempt to navigate out to:', url);
              return false;
            },
          }}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            preventFullScreen: false,
            rel: false,
            iv_load_policy: 3,
            showClosedCaptions: false,
          }}
        />
      )}

      {/* Video Ended Safe Overlay */}
      {isEnded && (
        <View style={styles.endedOverlay}>
          <MaterialCommunityIcons name="party-popper" size={40} color="#f59e0b" />
          <Text style={styles.endedTitle}>Bé đã xem xong rồi! 🎉</Text>
          <Text style={styles.endedSubtitle}>Bé muốn xem lại video này hay chọn video khác ở bên dưới nhé!</Text>
          {onReplay && (
            <TouchableOpacity
              style={styles.replayBtn}
              activeOpacity={0.8}
              onPress={onReplay}
            >
              <MaterialCommunityIcons name="replay" size={20} color="#ffffff" />
              <Text style={styles.replayBtnText}>Xem lại từ đầu</Text>
            </TouchableOpacity>
          )}
        </View>
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
  endedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 90,
  },
  endedTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  endedSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  replayBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
