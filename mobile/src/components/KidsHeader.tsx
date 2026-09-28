import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';

export interface KidsHeaderProps {
  remainingMinutes?: number;
  appName?: string;
}

export const KidsHeader: React.FC<KidsHeaderProps> = ({
  remainingMinutes = 45,
  appName = 'KidsTube',
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Brand & Logo */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="youtube-tv" size={26} color="#ffffff" />
        </View>
        <Text style={styles.brandText}>{appName}</Text>
      </View>

      {/* Screen Time Remaining Indicator */}
      <View style={styles.timerBadge}>
        <MaterialCommunityIcons
          name="clock-time-four-outline"
          size={18}
          color={Colors.primary}
        />
        <Text style={styles.timerText}>{remainingMinutes} phút</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  brandText: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
  },
  timerText: {
    marginLeft: 6,
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
