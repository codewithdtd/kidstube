import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

interface YouTubeHeaderProps {
  onSearchPress?: () => void;
  onParentPinPress?: () => void;
}

export const YouTubeHeader: React.FC<YouTubeHeaderProps> = ({
  onSearchPress,
  onParentPinPress,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* YouTube Logo + Wordmark */}
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

      {/* Right Icons: Cast, Notification (9+), Search */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('Truyền thiết bị', 'Tính năng phát lên TV đã sẵn sàng!')}
        >
          <MaterialCommunityIcons name="cast" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('Thông báo', 'Bé không có thông báo mới!')}
        >
          <View>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
            <View style={[styles.badge, { backgroundColor: colors.youtubeRed }]}>
              <Text style={styles.badgeText}>9+</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onSearchPress || (() => Alert.alert('Tìm kiếm', 'Tìm kiếm các video an toàn được duyệt'))}
        >
          <MaterialCommunityIcons name="magnify" size={23} color={colors.textPrimary} />
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
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.9,
    fontFamily: 'System',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 7,
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
