import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useUiMode } from '../context/UiModeContext';

interface YouTubeHeaderProps {
  onSearchPress?: () => void;
  onParentPinPress?: () => void;
}

export const YouTubeHeader: React.FC<YouTubeHeaderProps> = ({
  onSearchPress,
  onParentPinPress,
}) => {
  const { colors } = useAppTheme();
  const { toggleUiMode } = useUiMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* YouTube Logo + Wordmark */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.logoRow}
          activeOpacity={0.8}
          onLongPress={onParentPinPress}
        >
          <View style={[styles.youtubePill, { backgroundColor: colors.youtubeRed }]}>
            <View style={styles.playTriangle} />
          </View>
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>YouTube</Text>
        </TouchableOpacity>

        {/* Instant Mode Switcher: Switch to KidsZone */}
        <TouchableOpacity
          style={styles.switchModeBtn}
          activeOpacity={0.8}
          onPress={() => {
            toggleUiMode();
          }}
        >
          <Text style={styles.switchIcon}>🚀</Text>
          <Text style={styles.switchText}>KidsZone</Text>
        </TouchableOpacity>
      </View>

      {/* Right Icons: Cast, Notification (9+), Search */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('Truyền thiết bị', 'Tính năng phát lên TV đã sẵn sàng!')}
        >
          <MaterialCommunityIcons name="cast" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('Thông báo', 'Bé không có thông báo mới!')}
        >
          <View>
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textPrimary} />
            <View style={[styles.badge, { backgroundColor: colors.youtubeRed }]}>
              <Text style={styles.badgeText}>9+</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onSearchPress || (() => Alert.alert('Tìm kiếm', 'Tìm kiếm các video an toàn được duyệt'))}
        >
          <MaterialCommunityIcons name="magnify" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  youtubePill: {
    width: 29,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#F472B6',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  switchIcon: {
    fontSize: 11,
  },
  switchText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DB2777',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -7,
    minWidth: 16,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

