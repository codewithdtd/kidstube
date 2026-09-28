import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLockProps } from '../../../types/navigation';
import { ParentPinModal } from '../../../components/ParentPinModal';

export const ScreenLockModal: React.FC<ScreenLockProps> = ({ route, navigation }) => {
  const reason = route.params?.reason || 'Đến giờ ngủ rồi bé yêu ơi! Hãy để mắt nghỉ ngơi nhé! 🌙';
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="weather-night" size={68} color="#f59e0b" />
        </View>

        <Text style={styles.title}>Đến Giờ Nghỉ Ngơi!</Text>
        <Text style={styles.reasonText}>{reason}</Text>

        <View style={styles.sleepTipsBox}>
          <Text style={styles.sleepTipsTitle}>💡 Lời khuyên cho bé:</Text>
          <Text style={styles.sleepTipsText}>
            • Uống một cốc nước ấm hoặc sữa nóng{'\n'}
            • Nghe ba mẹ đọc truyện cổ tích{'\n'}
            • Hít thở sâu và ngủ một giấc thật ngon
          </Text>
        </View>

        {/* Stealth Parent Unlock Trigger */}
        <TouchableOpacity
          style={styles.parentUnlockBtn}
          onPress={() => setIsPinModalOpen(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="shield-key-outline" size={18} color="#64748b" />
          <Text style={styles.parentUnlockText}>Cổng Phụ Huynh (Nhập PIN để mở)</Text>
        </TouchableOpacity>
      </View>

      <ParentPinModal
        visible={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 380,
    width: '100%',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  sleepTipsBox: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sleepTipsTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  sleepTipsText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
  },
  parentUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  parentUnlockText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});

