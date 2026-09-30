import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreenProps } from '../../../types/navigation';
import { Video, Category } from '../../../types/models';
import { useAppTheme } from '../../../context/ThemeContext';
import { useUiMode } from '../../../context/UiModeContext';
import { YouTubeHeader } from '../../../components/YouTubeHeader';
import { YouTubeBottomBar } from '../../../components/YouTubeBottomBar';
import { YouTubeVideoCard } from '../components/YouTubeVideoCard';
import { KidsWorldHeader } from '../../kidsworld/components/KidsWorldHeader';
import { KidsWorldVideoCard } from '../../kidsworld/components/KidsWorldVideoCard';
import { KidsWorldBottomBar } from '../../kidsworld/components/KidsWorldBottomBar';
import { ParentPinModal } from '../../../components/ParentPinModal';
import { fetchVideos, fetchCategories, fetchAppStatus } from '../../../services/apiClient';
import { shuffleArray } from '../../../utils/shuffle';

const KIDS_CATEGORY_ICONS: Record<number, string> = {
  0: '⚡',
  1: '🎮',
  2: '🎵',
  3: '🚀',
  4: '🐾',
  5: '🎨',
};

const KIDS_CATEGORY_COLORS = [
  { bg: '#EEF2FF', activeBg: '#6366F1', text: '#4338CA' },
  { bg: '#F0F9FF', activeBg: '#0284C7', text: '#0369A1' },
  { bg: '#ECFDF5', activeBg: '#059669', text: '#047857' },
  { bg: '#FFFBEB', activeBg: '#D97706', text: '#B45309' },
  { bg: '#FFF1F2', activeBg: '#E11D48', text: '#BE123C' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { colors } = useAppTheme();
  const { isKidsWorld } = useUiMode();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState<boolean>(false);

  const flatListRef = useRef<FlatList<Video>>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const [cats, status] = await Promise.all([fetchCategories(), fetchAppStatus()]);
      setCategories(cats);
      if (!status.isAllowed || status.isLocked || status.isBedtime) {
        navigation.navigate('ScreenLock', {
          reason: status.message || 'Đã đến giờ nghỉ ngơi rồi bé ơi! 🌙',
        });
      }
    } catch (e) {
      console.warn('Failed to load initial data:', e);
    }
  }, [navigation]);

  const loadVideos = useCallback(async (catId: number) => {
    try {
      const data = await fetchVideos(catId === 0 ? undefined : catId);
      // Auto-shuffle video list on load to keep feed fresh for kids
      setVideos(shuffleArray(data));
    } catch (e) {
      console.warn('Failed to load videos:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleShuffleHome = useCallback(() => {
    setVideos((prevVideos) => shuffleArray(prevVideos));
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // When navigated back to Home via bottom bar or with refresh request
  const refreshTimestamp = route.params?.refreshTimestamp;
  useEffect(() => {
    if (refreshTimestamp) {
      handleShuffleHome();
    }
  }, [refreshTimestamp, handleShuffleHome]);

  const handleSelectTab = (tab: string) => {
    if (tab === 'shorts') {
      navigation.navigate('Shorts', { refreshTimestamp: Date.now() });
    } else if (tab === 'home') {
      if (selectedCategory !== 0) {
        setSelectedCategory(0);
      } else {
        handleShuffleHome();
      }
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setIsLoading(true);
    loadVideos(selectedCategory);
  }, [selectedCategory, loadVideos]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadInitialData(), loadVideos(selectedCategory)]);
  };

  const handleVideoPress = (video: Video) => {
    navigation.navigate('Player', { video });
  };

  const currentBgColor = isKidsWorld ? '#F8FAFC' : colors.background;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBgColor }]} edges={['top', 'left', 'right']}>
      {/* Dynamic Header based on active UI Mode */}
      {isKidsWorld ? (
        <KidsWorldHeader
          onSearchPress={() => Alert.alert('Tìm kiếm', 'Bé muốn xem video gì nào?')}
          onParentPinPress={() => setIsPinModalVisible(true)}
        />
      ) : (
        <YouTubeHeader
          onSearchPress={() => Alert.alert('Tìm kiếm', 'Tìm kiếm video thiếu nhi an toàn')}
          onParentPinPress={() => setIsPinModalVisible(true)}
        />
      )}

      {/* Category Selection Bar */}
      {isKidsWorld ? (
        <View style={styles.kidsCategoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kidsCategoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.kidsCatPill,
                {
                  backgroundColor: selectedCategory === 0 ? '#6366F1' : '#EEF2FF',
                  borderColor: '#6366F1',
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(0)}
            >
              <Text style={styles.kidsCatEmoji}>⚡</Text>
              <Text
                style={[
                  styles.kidsCatText,
                  { color: selectedCategory === 0 ? '#FFFFFF' : '#4338CA' },
                ]}
              >
                Tất Cả
              </Text>
            </TouchableOpacity>

            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              const colorTheme = KIDS_CATEGORY_COLORS[(idx + 1) % KIDS_CATEGORY_COLORS.length];
              const icon = KIDS_CATEGORY_ICONS[cat.id] || KIDS_CATEGORY_ICONS[(idx % 5) + 1] || '🎈';

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.kidsCatPill,
                    {
                      backgroundColor: isActive ? colorTheme.activeBg : colorTheme.bg,
                      borderColor: colorTheme.activeBg,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.kidsCatEmoji}>{icon}</Text>
                  <Text
                    style={[
                      styles.kidsCatText,
                      { color: isActive ? '#FFFFFF' : colorTheme.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.chipsContainer, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: colors.chipInactiveBg }]}
              onPress={() => Alert.alert('Khám phá', 'Khám phá video được duyệt dành cho bé')}
            >
              <MaterialCommunityIcons name="compass-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.chipDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: selectedCategory === 0 ? colors.chipActiveBg : colors.chipInactiveBg },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(0)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: selectedCategory === 0 ? colors.chipActiveText : colors.chipInactiveText,
                    fontWeight: selectedCategory === 0 ? '700' : '500',
                  },
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    { backgroundColor: isActive ? colors.chipActiveBg : colors.chipInactiveBg },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isActive ? colors.chipActiveText : colors.chipInactiveText,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Video Grid or Loading State */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={isKidsWorld ? '#F59E0B' : colors.youtubeRed} />
          <Text style={[styles.loadingText, { color: isKidsWorld ? '#B45309' : colors.textSecondary }]}>
            {isKidsWorld ? 'Đang tải thế giới video kỳ diệu cho bé...' : 'Đang tải video cho bé...'}
          </Text>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name={isKidsWorld ? 'star-shooting-outline' : 'video-vintage'}
            size={54}
            color={isKidsWorld ? '#F59E0B' : colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: isKidsWorld ? '#1E293B' : colors.textPrimary }]}>
            Chưa có video trong danh mục này
          </Text>
          <Text style={[styles.emptySubtitle, { color: isKidsWorld ? '#64748B' : colors.textSecondary }]}>
            Ba mẹ hãy mở Cổng Quản Lý để nạp thêm video hay cho bé nhé!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={videos}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={isKidsWorld ? '#F59E0B' : colors.youtubeRed}
              colors={[isKidsWorld ? '#F59E0B' : colors.youtubeRed]}
            />
          }
          renderItem={({ item }) =>
            isKidsWorld ? (
              <KidsWorldVideoCard
                video={item}
                onPress={handleVideoPress}
              />
            ) : (
              <YouTubeVideoCard
                video={item}
                onPress={handleVideoPress}
                onMorePress={(video) => Alert.alert('KidsTube', video.title)}
              />
            )
          }
        />
      )}

      {/* Dynamic Bottom Bar based on UI Mode */}
      {isKidsWorld ? (
        <KidsWorldBottomBar
          activeTab="home"
          onSelectTab={handleSelectTab}
        />
      ) : (
        <YouTubeBottomBar
          activeTab="home"
          onSelectTab={handleSelectTab}
        />
      )}

      {/* Parent PIN Modal */}
      <ParentPinModal
        visible={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  chipsContainer: { paddingVertical: 8 },
  chipsScroll: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  exploreBtn: {
    width: 36,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipDivider: { width: 1, height: 20, marginHorizontal: 2 },
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: { fontSize: 13 },

  // Kids Wonderland Playful Categories
  kidsCategoriesContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFDF5',
  },
  kidsCategoriesScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  kidsCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  kidsCatEmoji: {
    fontSize: 14,
  },
  kidsCatText: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  listContent: { paddingTop: 4, paddingBottom: 8 },
  columnWrapper: { paddingHorizontal: 6, justifyContent: 'space-between' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

