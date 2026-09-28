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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShortsScreenProps } from '../../../types/navigation';
import { MOCK_SHORTS } from '../data/mockShorts';
import { ShortsVideoItem } from '../components/ShortsVideoItem';
import { YouTubeBottomBar } from '../../../components/YouTubeBottomBar';
import { fetchAppStatus, recordWatchHistory } from '../../../services/apiClient';

export const ShortsScreen: React.FC<ShortsScreenProps> = ({ navigation }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const bottomBarHeight = 52 + Math.max(insets.bottom, 10);
  const itemHeight = windowHeight - bottomBarHeight;

  const [activeIndex, setActiveIndex] = useState<number>(0);
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
  }, [navigation]);

  // Periodic heartbeat reporting watched duration for Shorts
  useEffect(() => {
    timerRef.current = setInterval(() => {
      watchedSecondsRef.current += 1;
      const currentShort = MOCK_SHORTS[activeIndex] || MOCK_SHORTS[0];

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
  }, [activeIndex, navigation]);

  // Track active visible Short item
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const remainingMinutes = Math.floor(remainingSeconds / 60);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Floating Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <Text style={styles.headerTitle}>Shorts</Text>
        <View style={styles.topRightActions}>
          <View style={styles.screenTimeChip}>
            <MaterialCommunityIcons name="timer-outline" size={14} color="#ef4444" />
            <Text style={styles.screenTimeText}>Còn {remainingMinutes}p</Text>
          </View>
          <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="magnify" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Vertical Paging Shorts List */}
      <FlatList
        data={MOCK_SHORTS}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <ShortsVideoItem
            short={item}
            isActive={index === activeIndex}
            itemHeight={itemHeight}
            itemWidth={windowWidth}
          />
        )}
      />

      {/* Bottom Navigation Bar */}
      <YouTubeBottomBar
        activeTab="shorts"
        onSelectTab={(tab) => {
          if (tab === 'home') {
            navigation.navigate('Home');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    gap: 12,
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
});

