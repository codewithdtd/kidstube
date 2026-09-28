import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreenProps } from '../../../types/navigation';
import { Video } from '../../../types/models';
import { useAppTheme } from '../../../context/ThemeContext';
import { YouTubeHeader } from '../../../components/YouTubeHeader';
import { YouTubeBottomBar } from '../../../components/YouTubeBottomBar';
import { YouTubeVideoCard } from '../components/YouTubeVideoCard';
import { ParentPinModal } from '../../../components/ParentPinModal';
import { CATEGORIES, MOCK_VIDEOS } from '../data/mockVideos';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState<boolean>(false);

  const filteredVideos =
    selectedCategory === 0
      ? MOCK_VIDEOS
      : MOCK_VIDEOS.filter((v) => v.categoryId === selectedCategory);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
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

          {CATEGORIES.map((cat) => {
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
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredVideos}
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
            onMorePress={(video) => Alert.alert('Tùy chọn', video.title)}
          />
        )}
      />

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
});
