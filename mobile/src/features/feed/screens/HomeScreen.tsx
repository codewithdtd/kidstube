import React, { useState, useEffect, useCallback } from 'react';
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
import { YouTubeHeader } from '../../../components/YouTubeHeader';
import { YouTubeBottomBar } from '../../../components/YouTubeBottomBar';
import { YouTubeVideoCard } from '../components/YouTubeVideoCard';
import { ParentPinModal } from '../../../components/ParentPinModal';
import { fetchVideos, fetchCategories, fetchAppStatus } from '../../../services/apiClient';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState<boolean>(false);

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
      setVideos(data);
    } catch (e) {
      console.warn('Failed to load videos:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

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


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <YouTubeHeader
        onSearchPress={() => Alert.alert('Tìm kiếm', 'Tìm kiếm video thiếu nhi an toàn')}
        onParentPinPress={() => setIsParentModalOpen(true)}
      />

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

          {/* "All" Category Chip */}
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

          {/* Dynamic Categories from Backend */}
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

      {/* Video Grid or Loading State */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.youtubeRed} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải video cho bé...
          </Text>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="video-vintage" size={54} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Chưa có video trong danh mục này
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Ba mẹ hãy mở Cổng Quản Lý để nạp thêm video hay cho bé nhé!
          </Text>
        </View>
      ) : (
        <FlatList
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
              tintColor={colors.youtubeRed}
              colors={[colors.youtubeRed]}
            />
          }
          renderItem={({ item }) => (
            <YouTubeVideoCard
              video={item}
              onPress={handleVideoPress}
              onMorePress={(video) => Alert.alert('KidsTube', video.title)}
            />
          )}
        />
      )}

      <YouTubeBottomBar
        activeTab="home"
        onOpenParentGate={() => setIsParentModalOpen(true)}
      />

      <ParentPinModal
        visible={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        onTriggerEmergencyLock={() => {
          navigation.navigate('ScreenLock', {
            reason: 'Phụ huynh đã bật chế độ khóa màn hình khẩn cấp! 🌙',
          });
        }}
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

