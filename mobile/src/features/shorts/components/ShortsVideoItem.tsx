import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShortVideo } from '../../../types/models';
import { ShortsActionsBar } from './ShortsActionsBar';

interface ShortsVideoItemProps {
  short: ShortVideo;
  isActive: boolean;
  itemHeight: number;
  itemWidth: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  commentsCount?: number;
  onOpenComments?: () => void;
}

export const ShortsVideoItem: React.FC<ShortsVideoItemProps> = ({
  short,
  isActive,
  itemHeight,
  itemWidth,
  isMuted: isMutedProp,
  onToggleMute: onToggleMuteProp,
  commentsCount,
  onOpenComments,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  // Default to false (auto unmute sound enabled) if prop is omitted
  const [internalMuted, setInternalMuted] = useState<boolean>(false);
  const isMuted = isMutedProp !== undefined ? isMutedProp : internalMuted;
  const [showPlayStateIndicator, setShowPlayStateIndicator] = useState<boolean>(false);

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  // Send player commands to YouTube Embed (Web & Native)
  const sendPlayerCommand = (command: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute') => {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: [],
          }),
          '*'
        );
        if (command === 'unMute') {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'setVolume',
              args: [100],
            }),
            '*'
          );
        }
      } catch (err) {
        console.warn('[Shorts Web] postMessage error:', err);
      }
    } else {
      const jsCode = `
        (function() {
          try {
            if (window.player && typeof window.player.${command} === 'function') {
              if ('${command}' === 'pauseVideo') { window.userPaused = true; }
              if ('${command}' === 'playVideo') { window.userPaused = false; }
              window.player.${command}();
              if ('${command}' === 'unMute' && typeof window.player.setVolume === 'function') {
                window.player.setVolume(100);
              }
            } else {
              var iframe = document.getElementById('yt-player');
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify({
                  event: 'command',
                  func: '${command}',
                  args: []
                }), '*');
                if ('${command}' === 'unMute') {
                  iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'setVolume',
                    args: [100]
                  }), '*');
                }
              }
            }
          } catch(e) {}
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  };

  // Sync play state and mute mode when item becomes active
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      sendPlayerCommand('playVideo');
      if (isMuted) {
        sendPlayerCommand('mute');
      } else {
        sendPlayerCommand('unMute');
      }
    } else {
      setIsPlaying(false);
      sendPlayerCommand('pauseVideo');
    }
  }, [isActive, isMuted]);

  // React to dynamic sound toggle from parent/user
  useEffect(() => {
    if (isActive) {
      sendPlayerCommand(isMuted ? 'mute' : 'unMute');
    }
  }, [isMuted, isActive]);

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    sendPlayerCommand(nextState ? 'playVideo' : 'pauseVideo');
    setShowPlayStateIndicator(true);
    setTimeout(() => setShowPlayStateIndicator(false), 800);
  };

  const handleToggleMute = () => {
    if (onToggleMuteProp) {
      onToggleMuteProp();
    } else {
      const nextMuted = !internalMuted;
      setInternalMuted(nextMuted);
      sendPlayerCommand(nextMuted ? 'mute' : 'unMute');
    }
  };

  // HTML shell using official YouTube IFrame API in full-screen vertical layout (100% height, no 16:9 box)
  const nativeHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        background-color: #000000;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #player {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      iframe {
        width: 100% !important;
        height: 100% !important;
        border: none;
      }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      var player;
      var userPaused = false;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          width: '100%',
          height: '100%',
          videoId: '${short.youtubeVideoId}',
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1,
            mute: ${isMuted ? 1 : 0},
            controls: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            loop: 1,
            playlist: '${short.youtubeVideoId}',
            fs: 0
          },
          events: {
            onReady: function(e) {
              try {
                if (${!isMuted}) {
                  e.target.unMute();
                  if (typeof e.target.setVolume === 'function') e.target.setVolume(100);
                } else {
                  e.target.mute();
                }
              } catch(err) {}
              e.target.playVideo();
            },
            onStateChange: function(e) {
              // If video paused unexpectedly during initial autoplay without user gesture, resume smoothly
              if (e.data === 2 && !userPaused) {
                try {
                  e.target.mute();
                  e.target.playVideo();
                } catch(err) {}
              }
            }
          }
        });
        window.player = player;
      }

      window.addEventListener('message', function(event) { handleMsg(event.data); });
      document.addEventListener('message', function(event) { handleMsg(event.data); });

      function handleMsg(raw) {
        try {
          var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!window.player) return;
          if (msg.func === 'playVideo') {
            userPaused = false;
            window.player.playVideo();
          }
          if (msg.func === 'pauseVideo') {
            userPaused = true;
            window.player.pauseVideo();
          }
          if (msg.func === 'mute') window.player.mute();
          if (msg.func === 'unMute') {
            window.player.unMute();
            if (typeof window.player.setVolume === 'function') {
              window.player.setVolume(100);
            }
          }
        } catch(e) {}
      }
    </script>
  </body>
</html>`;

  return (
    <View style={[styles.container, { width: itemWidth, height: itemHeight }]}>
      <View style={styles.playerWrapper}>
        {!isActive ? (
          // Lightweight thumbnail window: Saves ~100MB RAM per item, prevents Android OOM crashes!
          <View style={styles.thumbnailWrapper}>
            <Image
              source={{ uri: short.thumbnailUrl || `https://i.ytimg.com/vi/${short.youtubeVideoId}/hqdefault.jpg` }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.thumbnailOverlay} />
            <View style={styles.idlePlayBadge}>
              <MaterialCommunityIcons name="play-circle" size={60} color="rgba(255, 255, 255, 0.75)" />
            </View>
          </View>
        ) : Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            key={short.youtubeVideoId}
            src={`https://www.youtube-nocookie.com/embed/${short.youtubeVideoId}?autoplay=1&mute=${
              isMuted ? 1 : 0
            }&controls=0&playsinline=1&loop=1&playlist=${short.youtubeVideoId}&rel=0&modestbranding=1&enablejsapi=1`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#000000',
              display: 'block',
            } as any}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            title={short.title}
          />
        ) : (
          <WebView
            ref={webViewRef}
            key={short.youtubeVideoId}
            originWhitelist={['*']}
            source={{
              html: nativeHtml,
              baseUrl: 'https://lonelycpp.github.io/react-native-youtube-iframe/iframe_v2.html',
            }}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={false}
            androidLayerType="hardware"
            mixedContentMode="always"
          />
        )}
      </View>

      {/* Floating Unmute Banner for 1-touch sound activation */}
      {isMuted && isActive && (
        <TouchableOpacity
          style={styles.unmuteBanner}
          activeOpacity={0.8}
          onPress={handleToggleMute}
        >
          <MaterialCommunityIcons name="volume-off" size={18} color="#ffffff" />
          <Text style={styles.unmuteBannerText}>Đang tắt tiếng • Chạm để Bật Âm Thanh 🔊</Text>
        </TouchableOpacity>
      )}

      {showPlayStateIndicator && (
        <View style={styles.playStateOverlay} pointerEvents="none">
          <View style={styles.playStateBadge}>
            <MaterialCommunityIcons name={isPlaying ? 'play' : 'pause'} size={48} color="#ffffff" />
          </View>
        </View>
      )}

      <View style={styles.bottomInfoContainer} pointerEvents="box-none">
        <View style={styles.channelRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{short.channelTitle.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.channelName} numberOfLines={1}>{short.channelTitle}</Text>
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={13} color="#38bdf8" />
            <Text style={styles.verifiedText}>An toàn</Text>
          </View>
        </View>

        <Text style={styles.titleText} numberOfLines={2}>{short.title}</Text>
      </View>

      <ShortsActionsBar
        short={short}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        commentsCount={commentsCount}
        onOpenComments={onOpenComments || (() => {})}
        onShare={() => Alert.alert('KidsTube', 'Đã chia sẻ video ngắn này cùng bé! 💖')}
      />
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  idlePlayBadge: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  unmuteBanner: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    zIndex: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  unmuteBannerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  playStateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  verifiedText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
