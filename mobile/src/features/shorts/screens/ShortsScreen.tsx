import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
  ViewToken,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShortsScreenProps } from '../../../types/navigation';
import { ShortVideo } from '../../../types/models';
import { MOCK_SHORTS } from '../data/mockShorts';
import { ShortsVideoItem } from '../components/ShortsVideoItem';
import { YouTubeBottomBar } from '../../../components/YouTubeBottomBar';
import { KidsWorldBottomBar } from '../../kidsworld/components/KidsWorldBottomBar';
import { useUiMode } from '../../../context/UiModeContext';
import { fetchAppStatus, fetchShorts, recordWatchHistory } from '../../../services/apiClient';
import { CommentsBottomSheet } from '../../comments/components/CommentsBottomSheet';

export const ShortsScreen: React.FC<ShortsScreenProps> = ({ navigation }) => {
  const { isKidsWorld } = useUiMode();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const bottomBarHeight = 52 + Math.max(insets.bottom, 10);
  const itemHeight = Math.max(windowHeight - bottomBarHeight, 500);

  // On wide screens (Desktop Web), constrain to vertical 9:16 phone ratio centered; on mobile use 100% width
  const isDesktop = windowWidth > 500;
  const contentWidth = isDesktop
    ? Math.min(windowWidth, Math.round((itemHeight * 9) / 16), 480)
    : windowWidth;

  const [shorts, setShorts] = useState<ShortVideo[]>(MOCK_SHORTS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentsCountMap, setCommentsCountMap] = useState<Record<string | number, number>>({});

  // Global sound state across Shorts feed (Default: false -> Auto Unmute Sound Enabled)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [soundToast, setSoundToast] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<ShortVideo>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchedSecondsRef = useRef<number>(0);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setSoundToast(!next ? '🔊 Tự động phát âm thanh' : '🔇 Đã tắt âm thanh');
      setTimeout(() => {
        setSoundToast(null);
      }, 1500);
      return next;
    });
  }, []);

  const handleScrollToNext = () => {
    if (activeIndex < shorts.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }
  };

  const handleScrollToPrev = () => {
    if (activeIndex > 0) {
      const prev = activeIndex - 1;
      setActiveIndex(prev);
      flatListRef.current?.scrollToIndex({ index: prev, animated: true });
    }
  };

  // Load real shorts feed from backend
  useEffect(() => {
    let isMounted = true;
    fetchShorts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setShorts(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
  }, [navigation]);

  // Periodic heartbeat reporting watched duration for Shorts
  useEffect(() => {
    timerRef.current = setInterval(() => {
      watchedSecondsRef.current += 1;
      const currentShort = shorts[activeIndex] || shorts[0];
      if (!currentShort) return;

      if (watchedSecondsRef.current >= 30) {
        recordWatchHistory(currentShort.id, watchedSecondsRef.current);
        watchedSecondsRef.current = 0;
      }

      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (watchedSecondsRef.current > 0) {
            recordWatchHistory(currentShort.id, watchedSecondsRef.current);
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, shorts, navigation]);

  // Track active visible Short item
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const handleScrollSync = (offsetY: number) => {
    const newIndex = Math.round(offsetY / itemHeight);
    if (newIndex >= 0 && newIndex < shorts.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const remainingMinutes = Math.floor(remainingSeconds / 60);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Floating Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <View style={styles.topLeftRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shorts</Text>
        </View>
        <View style={styles.topRightActions}>
          {/* Sound Mode Toggle Chip */}
          <TouchableOpacity
            style={[styles.soundToggleChip, !isMuted ? styles.soundToggleActive : styles.soundToggleMuted]}
            activeOpacity={0.7}
            onPress={handleToggleMute}
          >
            <MaterialCommunityIcons
              name={!isMuted ? 'volume-high' : 'volume-off'}
              size={16}
              color={!isMuted ? '#22c55e' : '#f59e0b'}
            />
            <Text style={styles.soundToggleText}>{!isMuted ? 'Âm thanh: BẬT' : 'Tắt tiếng'}</Text>
          </TouchableOpacity>

          <View style={styles.screenTimeChip}>
            <MaterialCommunityIcons name="timer-outline" size={14} color="#ef4444" />
            <Text style={styles.screenTimeText}>Còn {remainingMinutes}p</Text>
          </View>
          <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="magnify" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sound Mode Toast Feedback */}
      {soundToast && (
        <View style={styles.soundToastContainer} pointerEvents="none">
          <View style={styles.soundToastBadge}>
            <Text style={styles.soundToastText}>{soundToast}</Text>
          </View>
        </View>
      )}

      {/* Vertical Paging Shorts List */}
      <FlatList
        ref={flatListRef}
        data={shorts}
        keyExtractor={(item) => item.id.toString() + '_' + item.youtubeVideoId}
        pagingEnabled
        style={styles.flatList}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isDesktop ? styles.desktopCenterList : undefined}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        onMomentumScrollEnd={(e) => handleScrollSync(e.nativeEvent.contentOffset.y)}
        onScroll={(e) => {
          if (Platform.OS === 'web') {
            handleScrollSync(e.nativeEvent.contentOffset.y);
          }
        }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <ShortsVideoItem
            short={item}
            isActive={index === activeIndex}
            itemHeight={itemHeight}
            itemWidth={contentWidth}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            commentsCount={commentsCountMap[item.id] || item.commentsCount || 12}
            onOpenComments={() => setIsCommentsOpen(true)}
          />
        )}
      />

      {/* Floating Quick Navigation Chevrons */}
      <View style={styles.navControls} pointerEvents="box-none">
        {activeIndex > 0 && (
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.8}
            onPress={handleScrollToPrev}
          >
            <MaterialCommunityIcons name="chevron-up" size={26} color="#ffffff" />
          </TouchableOpacity>
        )}
        {activeIndex < shorts.length - 1 && (
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.8}
            onPress={handleScrollToNext}
          >
            <MaterialCommunityIcons name="chevron-down" size={26} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      {isKidsWorld ? (
        <KidsWorldBottomBar
          activeTab="shorts"
          onSelectTab={(tab) => {
            if (tab === 'home') {
              navigation.navigate('Home');
            }
          }}
        />
      ) : (
        <YouTubeBottomBar
          activeTab="shorts"
          onSelectTab={(tab) => {
            if (tab === 'home') {
              navigation.navigate('Home');
            }
          }}
        />
      )}

      {/* Interactive Kids Comments Bottom Sheet for Shorts */}
      {shorts[activeIndex] && (
        <CommentsBottomSheet
          visible={isCommentsOpen}
          videoId={shorts[activeIndex].id}
          videoTitle={shorts[activeIndex].title}
          onClose={() => setIsCommentsOpen(false)}
          onCommentsCountChange={(count) => {
            const currentId = shorts[activeIndex].id;
            setCommentsCountMap((prev) => ({
              ...prev,
              [currentId]: count,
            }));
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatList: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
  },
  soundToggleActive: {
    borderColor: 'rgba(34, 197, 94, 0.45)',
    backgroundColor: 'rgba(20, 83, 45, 0.65)',
  },
  soundToggleMuted: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(120, 53, 15, 0.65)',
  },
  soundToggleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  soundToastContainer: {
    position: 'absolute',
    top: 85,
    alignSelf: 'center',
    zIndex: 60,
  },
  soundToastBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  soundToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  screenTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  screenTimeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navControls: {
    position: 'absolute',
    left: 14,
    top: '42%',
    zIndex: 35,
    gap: 12,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  desktopCenterList: {
    alignItems: 'center',
  },
});

