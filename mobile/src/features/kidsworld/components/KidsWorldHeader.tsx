import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUiMode } from '../../../context/UiModeContext';

interface KidsWorldHeaderProps {
  onSearchPress?: () => void;
  onParentPinPress?: () => void;
}

export const KidsWorldHeader: React.FC<KidsWorldHeaderProps> = ({
  onSearchPress,
  onParentPinPress,
}) => {
  const { toggleUiMode } = useUiMode();

  return (
    <View style={styles.container}>
      {/* Brand & Logo (Long press opens Parent Gate) */}
      <TouchableOpacity
        style={styles.brandRow}
        activeOpacity={0.8}
        onLongPress={onParentPinPress}
      >
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFFFFF" />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>KidsZone</Text>
            <View style={styles.proPill}>
              <Text style={styles.proPillText}>6-7+</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Thế giới khám phá & khoa học</Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {/* Instant Mode Switcher: Switch to YouTube */}
        <TouchableOpacity
          style={styles.switchModeBtn}
          activeOpacity={0.8}
          onPress={() => {
            toggleUiMode();
          }}
        >
          <MaterialCommunityIcons name="youtube" size={16} color="#DC2626" />
          <Text style={styles.switchText}>YouTube</Text>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.circleIconBtn}
          activeOpacity={0.7}
          onPress={onSearchPress || (() => Alert.alert('Tìm kiếm', 'Bé muốn khám phá video nào?'))}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  proPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  proPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
  },
  brandSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  circleIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
