import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiMode } from '../../../context/UiModeContext';

interface KidsWorldBottomBarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const KidsWorldBottomBar: React.FC<KidsWorldBottomBarProps> = ({
  activeTab = 'home',
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { toggleUiMode } = useUiMode();
  const bottomPadding = Math.max(insets.bottom, 10);
  const barHeight = 56 + bottomPadding;

  return (
    <View
      style={[
        styles.container,
        {
          height: barHeight,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {/* Tab 1: Khám Phá (Home) */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onSelectTab?.('home')}
      >
        <View style={[styles.iconWrapper, activeTab === 'home' && styles.iconActiveWrapper]}>
          <MaterialCommunityIcons
            name={activeTab === 'home' ? 'rocket' : 'rocket-outline'}
            size={22}
            color={activeTab === 'home' ? '#6366F1' : '#64748B'}
          />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
          Khám phá
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Shorts (Video Ngắn) */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onSelectTab?.('shorts')}
      >
        <View style={[styles.iconWrapper, activeTab === 'shorts' && styles.iconActiveWrapperShorts]}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={22}
            color={activeTab === 'shorts' ? '#F59E0B' : '#64748B'}
          />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'shorts' && styles.tabLabelActiveShorts]}>
          Shorts
        </Text>
      </TouchableOpacity>

      {/* Tab 3: Quick Mode Switcher */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => {
          toggleUiMode();
        }}
      >
        <View style={[styles.iconWrapper, styles.switcherWrapper]}>
          <MaterialCommunityIcons name="palette-swatch-outline" size={21} color="#4F46E5" />
        </View>
        <Text style={[styles.tabLabel, styles.switcherLabel]}>
          Đổi kiểu
        </Text>
      </TouchableOpacity>

      {/* Tab 4: Yêu thích */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => Alert.alert('Yêu thích', '⭐ Những video hay nhất đã sẵn sàng!')}
      >
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name="star-outline" size={22} color="#64748B" />
        </View>
        <Text style={styles.tabLabel}>Yêu thích</Text>
      </TouchableOpacity>

      {/* Tab 5: Bạn (Inert Avatar - Does nothing when pressed) */}
      <View style={styles.tabItem}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>K</Text>
        </View>
        <Text style={styles.tabLabel}>Bạn</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  iconActiveWrapper: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#6366F1',
  },
  iconActiveWrapperShorts: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  switcherWrapper: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '900',
  },
  tabLabelActiveShorts: {
    color: '#D97706',
    fontWeight: '900',
  },
  switcherLabel: {
    color: '#4F46E5',
    fontWeight: '800',
  },
});
