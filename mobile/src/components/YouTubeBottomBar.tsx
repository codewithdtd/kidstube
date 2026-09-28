import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

interface YouTubeBottomBarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenParentGate?: () => void;
}

export const YouTubeBottomBar: React.FC<YouTubeBottomBarProps> = ({
  activeTab = 'home',
  onSelectTab,
  onOpenParentGate,
}) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  const barHeight = 52 + bottomPadding;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bottomNavBg,
          borderTopColor: colors.bottomNavBorder,
          height: barHeight,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {/* Tab 1: Home */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onSelectTab?.('home')}
      >
        <MaterialCommunityIcons
          name={activeTab === 'home' ? 'home' : 'home-outline'}
          size={25}
          color={activeTab === 'home' ? colors.bottomNavActive : colors.bottomNavInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'home' ? colors.bottomNavActive : colors.bottomNavInactive },
          ]}
        >
          Trang chủ
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Shorts */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onSelectTab?.('shorts')}
      >
        <MaterialCommunityIcons
          name={activeTab === 'shorts' ? 'play-box-multiple' : 'play-box-multiple-outline'}
          size={24}
          color={activeTab === 'shorts' ? colors.bottomNavActive : colors.bottomNavInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'shorts' ? colors.bottomNavActive : colors.bottomNavInactive },
          ]}
        >
          Shorts
        </Text>
      </TouchableOpacity>

      {/* Tab 3: (+) Create/Upload (Inert - Does nothing) */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onOpenParentGate?.()}
      >
        <View style={[styles.createBtn, { borderColor: colors.textPrimary }]}>
          <MaterialCommunityIcons name="plus" size={24} color={colors.textPrimary} />
        </View>
      </TouchableOpacity>

      {/* Tab 4: Subscriptions */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onSelectTab?.('subscriptions')}
      >
        <MaterialCommunityIcons
          name="youtube-subscription"
          size={24}
          color={colors.bottomNavInactive}
        />
        <Text style={[styles.tabLabel, { color: colors.bottomNavInactive }]}>Đăng ký</Text>
      </TouchableOpacity>

      {/* Tab 5: You (Inert - Does nothing) */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => onOpenParentGate?.()}
      >
        <View style={[styles.avatarCircle, { backgroundColor: colors.youtubeRed }]}>
          <Text style={styles.avatarText}>K</Text>
        </View>
        <Text style={[styles.tabLabel, { color: colors.bottomNavInactive }]}>Bạn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  createBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
