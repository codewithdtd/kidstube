import React, { useState, useEffect, useRef, useMemo } from 'react';
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

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ navigation, route }) => {
  const { colors, isDark } = useAppTheme();
  const [currentVideo, setCurrentVideo] = useState<Video>(route.params.video);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isKidsLocked, setIsKidsLocked] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(34200);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState<boolean>(false);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && !isKidsLocked) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
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
  }, [isPlaying, isKidsLocked, navigation]);

  const upNextVideos = useMemo(() => {
    return MOCK_VIDEOS.filter((v) => v.id !== currentVideo.id);
  }, [currentVideo.id]);

  const handleSelectNextVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setIsLiked(false);
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
          if (state === 'ended' && upNextVideos.length > 0) handleSelectNextVideo(upNextVideos[0]);
          else if (state === 'playing') setIsPlaying(true);
          else if (state === 'paused') setIsPlaying(false);
        }}
        isKidsLocked={isKidsLocked}
        onToggleKidsLock={handleToggleKidsLock}
      />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setIsTitleExpanded(!isTitleExpanded)} style={styles.titleSection}>
          <Text style={[styles.videoTitle, { color: colors.textPrimary }]} numberOfLines={isTitleExpanded ? undefined : 2}>
            {currentVideo.title}
          </Text>
          <MaterialCommunityIcons name={isTitleExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>3.4M lượt xem • 2 tuần trước</Text>
          <View style={[styles.safeTag, { backgroundColor: colors.chipInactiveBg }]}>
            <MaterialCommunityIcons name="shield-check" size={13} color="#22c55e" />
            <Text style={[styles.safeTagText, { color: '#22c55e' }]}>Đã duyệt an toàn</Text>
          </View>
        </View>
        <View style={[styles.channelRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.channelAvatar, { backgroundColor: colors.chipActiveBg }]}>
            <MaterialCommunityIcons name="youtube" size={20} color="#fff" />
          </View>
          <View style={styles.channelInfo}>
            <Text style={[styles.channelTitle, { color: colors.textPrimary }]}>{currentVideo.channelTitle || 'KidsTube Official'}</Text>
            <Text style={[styles.subscriberCount, { color: colors.textSecondary }]}>1.25M người đăng ký</Text>
          </View>
          <TouchableOpacity
            style={[styles.subscribeBtn, { backgroundColor: isSubscribed ? colors.chipInactiveBg : colors.chipActiveBg }]}
            onPress={() => setIsSubscribed(!isSubscribed)}
            activeOpacity={0.8}
          >
            <Text style={[styles.subscribeText, { color: isSubscribed ? colors.chipInactiveText : colors.chipActiveText }]}>
              {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsBar}>
          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={handleLike} activeOpacity={0.7}>
            <MaterialCommunityIcons name={isLiked ? 'thumb-up' : 'thumb-up-outline'} size={18} color={isLiked ? colors.youtubeRed : colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>{formatViews(likeCount)}</Text>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <MaterialCommunityIcons name="thumb-down-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={() => Alert.alert('Chia sẻ', 'Tính năng đang phát triển')} activeOpacity={0.7}>
            <MaterialCommunityIcons name="share-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Chia sẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={() => Alert.alert('Tải xuống', 'Đã lưu vào danh sách xem offline!')} activeOpacity={0.7}>
            <MaterialCommunityIcons name="download-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Tải xuống</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionPill, { backgroundColor: colors.chipInactiveBg }]} onPress={() => Alert.alert('Lưu', 'Đã lưu vào danh sách yêu thích của bé!')} activeOpacity={0.7}>
            <MaterialCommunityIcons name="playlist-plus" size={18} color={colors.textPrimary} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Lưu</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.upNextSection}>
          <Text style={[styles.upNextSectionTitle, { color: colors.textPrimary }]}>Video tiếp theo cho bé</Text>
          {upNextVideos.map((video) => (
            <UpNextVideoCard key={video.id} video={video} onPress={handleSelectNextVideo} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  screenTimeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  screenTimeText: { fontSize: 12, fontWeight: '700' },
  kidsLockBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(100, 116, 139, 0.15)' },
  kidsLockBtnActive: { backgroundColor: '#ef4444' },
  kidsLockText: { fontSize: 12, fontWeight: '700' },
  scrollContent: { flex: 1 },
  scrollInner: { paddingBottom: 24 },
  titleSection: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 12 },
  videoTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 4, gap: 8 },
  metaText: { fontSize: 12 },
  safeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  safeTagText: { fontSize: 11, fontWeight: '600' },
  channelRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  channelAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  channelInfo: { flex: 1 },
  channelTitle: { fontSize: 14, fontWeight: '700' },
  subscriberCount: { fontSize: 11 },
  subscribeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  subscribeText: { fontSize: 13, fontWeight: '700' },
  actionsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  actionPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  actionDivider: { width: 1, height: 16, marginHorizontal: 2 },
  actionText: { fontSize: 12, fontWeight: '600' },
  upNextSection: { paddingHorizontal: 12, marginTop: 8 },
  upNextSectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
});


