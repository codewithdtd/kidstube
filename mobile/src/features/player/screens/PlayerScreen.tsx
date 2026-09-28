import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlayerScreenProps } from '../../../types/navigation';
import { Video } from '../../../types/models';
import { useAppTheme } from '../../../context/ThemeContext';
import { YouTubeVideoPlayer } from '../components/YouTubeVideoPlayer';
import { UpNextVideoCard } from '../components/UpNextVideoCard';
import { MOCK_VIDEOS } from '../../feed/data/mockVideos';
import { formatViews } from '../../../utils/formatters';
import { fetchAppStatus, recordWatchHistory, fetchVideos } from '../../../services/apiClient';

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ navigation, route }) => {
  const { colors, isDark } = useAppTheme();
  const [currentVideo, setCurrentVideo] = useState<Video>(route.params.video);
  const [upNextList, setUpNextList] = useState<Video[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isKidsLocked, setIsKidsLocked] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(34200);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState<boolean>(false);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchedSecondsRef = useRef<number>(0);

  // Sync screen time limit from backend on mount
  useEffect(() => {
    fetchAppStatus().then((status) => {
      if (!status.isAllowed || status.isLocked || status.isBedtime) {
        navigation.replace('ScreenLock', {
          reason: status.message || 'Đã đến giờ nghỉ ngơi rồi bé ơi! 🌙',
        });
        return;
      }
      setRemainingSeconds(status.remainingSeconds);
    });

    fetchVideos().then((vids) => {
      if (vids && vids.length > 0) {
        setUpNextList(vids);
      }
    });
  }, [navigation]);

  // Periodic heartbeat reporting watched duration
  useEffect(() => {
    if (isPlaying && !isKidsLocked) {
      timerRef.current = setInterval(() => {
        watchedSecondsRef.current += 1;

        // Auto-report heartbeat every 30 seconds
        if (watchedSecondsRef.current >= 30) {
          recordWatchHistory(currentVideo.id, watchedSecondsRef.current);
          watchedSecondsRef.current = 0;
        }

        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            if (watchedSecondsRef.current > 0) {
              recordWatchHistory(currentVideo.id, watchedSecondsRef.current);
              watchedSecondsRef.current = 0;
            }
            navigation.replace('ScreenLock', {
              reason: 'Đã hết thời gian xem hôm nay rồi bé ơi! Hãy để mắt nghỉ ngơi nhé 🌙',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isKidsLocked, navigation, currentVideo.id]);

  // Flush remaining watched duration on unmount
  useEffect(() => {
    const activeVideoId = currentVideo.id;
    return () => {
      if (watchedSecondsRef.current > 0) {
        recordWatchHistory(activeVideoId, watchedSecondsRef.current);
        watchedSecondsRef.current = 0;
      }
    };
  }, [currentVideo.id]);

  const upNextVideos = useMemo(() => {
    // Prefer backend videos; fallback to mock videos to guarantee there are always safe approved options
    const backendCandidates = upNextList.filter((v) => v.youtubeVideoId !== currentVideo.youtubeVideoId);
    if (backendCandidates.length > 0) {
      return backendCandidates;
    }
    return MOCK_VIDEOS.filter((v) => v.youtubeVideoId !== currentVideo.youtubeVideoId);
  }, [upNextList, currentVideo.youtubeVideoId]);

  const handleSelectNextVideo = (video: Video) => {
    if (watchedSecondsRef.current > 0) {
      recordWatchHistory(currentVideo.id, watchedSecondsRef.current);
      watchedSecondsRef.current = 0;
    }
    setCurrentVideo(video);
    setIsEnded(false);
    setIsPlaying(true);
    setIsLiked(false);
  };

  const handleReplay = () => {
    setIsEnded(false);
    setIsPlaying(true);
  };

  const handleBackPress = () => {
    if (watchedSecondsRef.current > 0) {
      recordWatchHistory(currentVideo.id, watchedSecondsRef.current);
      watchedSecondsRef.current = 0;
    }
    navigation.goBack();
  };

  const handleToggleKidsLock = () => {
    const nextState = !isKidsLocked;
    setIsKidsLocked(nextState);
    if (nextState) {
      Alert.alert(
        '🔒 Đã bật Khóa Màn Hình Trẻ Em',
        'Các phím đã được khóa để bé không chạm nhầm. Chạm biểu tượng khóa để mở lại.'
      );
    }
  };


  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const remainingMinutes = Math.floor(remainingSeconds / 60);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialCommunityIcons name="chevron-down" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.screenTimeChip, { backgroundColor: colors.chipInactiveBg }]}>
          <MaterialCommunityIcons name="timer-outline" size={14} color={colors.youtubeRed} />
          <Text style={[styles.screenTimeText, { color: colors.textPrimary }]}>Còn {remainingMinutes} phút</Text>
        </View>
        <TouchableOpacity style={[styles.kidsLockBtn, isKidsLocked && styles.kidsLockBtnActive]} onPress={handleToggleKidsLock}>
          <MaterialCommunityIcons name={isKidsLocked ? 'lock' : 'lock-open-outline'} size={18} color={isKidsLocked ? '#fff' : colors.textPrimary} />
          <Text style={[styles.kidsLockText, { color: isKidsLocked ? '#fff' : colors.textPrimary }]}>{isKidsLocked ? 'Đã khóa' : 'Khóa chạm'}</Text>
        </TouchableOpacity>
      </View>
      <YouTubeVideoPlayer
        videoId={currentVideo.youtubeVideoId}
        playing={isPlaying}
        onStateChange={(state) => {
          if (state === 'ended') {
            if (upNextVideos.length > 0) {
              handleSelectNextVideo(upNextVideos[0]);
            } else {
              setIsPlaying(false);
              setIsEnded(true);
            }
          } else if (state === 'playing') {
            setIsPlaying(true);
            setIsEnded(false);
          } else if (state === 'paused') {
            setIsPlaying(false);
          }
        }}
        isKidsLocked={isKidsLocked}
        onToggleKidsLock={handleToggleKidsLock}
        isEnded={isEnded}
        onReplay={handleReplay}
      />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setIsTitleExpanded(!isTitleExpanded)} style={styles.titleSection}>
          <Text style={[styles.videoTitle, { color: colors.textPrimary }]} numberOfLines={isTitleExpanded ? undefined : 2}>
            {currentVideo.title}
          </Text>
          <Text style={[styles.videoViews, { color: colors.textSecondary }]}>
            {formatViews(currentVideo.id * 142000 + 45000)} • Được ba mẹ phê duyệt an toàn
          </Text>
        </TouchableOpacity>

        <View style={[styles.channelRow, { borderBottomColor: colors.border }]}>
          <View style={styles.channelLeft}>
            <View style={[styles.channelAvatar, { backgroundColor: colors.youtubeRed }]}>
              <Text style={styles.channelAvatarLetter}>{(currentVideo.channelTitle || 'K')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, { color: colors.textPrimary }]} numberOfLines={1}>
                {currentVideo.channelTitle || 'Kênh Thiếu Nhi An Toàn'}
              </Text>
              <Text style={[styles.channelSubs, { color: colors.textSecondary }]}>1.42M người đăng ký</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.subscribeBtn, isSubscribed ? { backgroundColor: colors.chipInactiveBg } : { backgroundColor: colors.textPrimary }]}
            onPress={() => setIsSubscribed(!isSubscribed)}
          >
            <Text style={[styles.subscribeBtnText, isSubscribed ? { color: colors.textPrimary } : { color: colors.background }]}>
              {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRow}>
          <View style={[styles.actionPillGroup, { backgroundColor: colors.chipInactiveBg }]}>
            <TouchableOpacity style={styles.actionSubBtn} onPress={handleLike}>
              <MaterialCommunityIcons name={isLiked ? 'thumb-up' : 'thumb-up-outline'} size={18} color={isLiked ? colors.youtubeRed : colors.textPrimary} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>{formatViews(likeCount)}</Text>
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.actionSubBtn} onPress={() => Alert.alert('KidsTube', 'Cảm ơn phản hồi của bé!')}>
              <MaterialCommunityIcons name="thumb-down-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ link an toàn cho gia đình.')}>
            <MaterialCommunityIcons name="share-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={() => Alert.alert('Tải xuống', 'Video đã có sẵn trong bộ nhớ đệm an toàn.')}>
            <MaterialCommunityIcons name="download-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Tải xuống</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={() => Alert.alert('Lưu', 'Đã lưu vào danh sách yêu thích của bé.')}>
            <MaterialCommunityIcons name="playlist-plus" size={18} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Lưu</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.upNextHeader}>
          <Text style={[styles.upNextTitle, { color: colors.textPrimary }]}>Video tiếp theo</Text>
          <View style={[styles.autoplayBadge, { backgroundColor: colors.chipInactiveBg }]}>
            <Text style={[styles.autoplayText, { color: colors.textSecondary }]}>Tự động phát</Text>
            <MaterialCommunityIcons name="toggle-switch" size={24} color={colors.youtubeRed} />
          </View>
        </View>

        {upNextVideos.map((video) => (
          <UpNextVideoCard key={video.id} video={video} onPress={handleSelectNextVideo} />
        ))}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { padding: 4 },
  screenTimeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, gap: 5 },
  screenTimeText: { fontSize: 12, fontWeight: '600' },
  kidsLockBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(128,128,128,0.3)', gap: 4 },
  kidsLockBtnActive: { backgroundColor: '#cc0000', borderColor: '#cc0000' },
  kidsLockText: { fontSize: 12, fontWeight: '700' },
  scrollContent: { flex: 1 },
  scrollInner: { paddingBottom: 28 },
  titleSection: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  videoTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  videoViews: { fontSize: 12, marginTop: 4 },
  channelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  channelLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  channelAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  channelAvatarLetter: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  channelInfo: { marginLeft: 10, flex: 1 },
  channelName: { fontSize: 14, fontWeight: '700' },
  channelSubs: { fontSize: 11, marginTop: 2 },
  subscribeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  subscribeBtnText: { fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  actionPillGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6 },
  actionSubBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  actionDivider: { width: 1, height: 18, marginHorizontal: 4 },
  actionPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  actionText: { fontSize: 12, fontWeight: '600' },
  upNextHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6 },
  upNextTitle: { fontSize: 15, fontWeight: '700' },
  autoplayBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 14, gap: 4 },
  autoplayText: { fontSize: 11, fontWeight: '600' },

});
