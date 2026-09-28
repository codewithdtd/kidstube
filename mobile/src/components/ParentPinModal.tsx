import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme, ThemePreference } from '../context/ThemeContext';
import { toggleParentLock } from '../services/apiClient';

interface ParentPinModalProps {
  visible: boolean;
  onClose: () => void;
  onTriggerEmergencyLock?: () => void;
  onUnlockSuccess?: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  visible,
  onClose,
  onTriggerEmergencyLock,
  onUnlockSuccess,
}) => {
  const { colors, themePreference, setThemePreference } = useAppTheme();
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerifyPin = async () => {
    if (pin === '1234' || pin === '0000') {
      if (onUnlockSuccess) {
        await toggleParentLock(false);
        handleClose();
        onUnlockSuccess();
        return;
      }
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Mã PIN không đúng (Mặc định: 1234)');
    }
  };

  const handleClose = () => {
    setPin('');
    setIsUnlocked(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="shield-lock" size={24} color={colors.youtubeRed} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isUnlocked ? 'Cài Đặt Phụ Huynh' : 'Xác Thực Phụ Huynh'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!isUnlocked ? (
            <View style={styles.body}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Nhập mã PIN 4 chữ số (Mặc định: 1234):
              </Text>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    color: colors.textPrimary,
                    borderColor: errorMsg ? colors.youtubeRed : colors.border,
                    backgroundColor: colors.modalSurface,
                  },
                ]}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textSecondary}
                value={pin}
                onChangeText={(text) => {
                  setPin(text);
                  setErrorMsg('');
                }}
              />
              {!!errorMsg && <Text style={[styles.error, { color: colors.youtubeRed }]}>{errorMsg}</Text>}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.youtubeRed }]}
                onPress={handleVerifyPin}
              >
                <Text style={styles.actionBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.body}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Chế độ Theme YouTube:
              </Text>
              <View style={styles.themeRow}>
                {(['dark', 'light', 'system'] as ThemePreference[]).map((mode) => {
                  const active = themePreference === mode;
                  const label = mode === 'dark' ? 'Tối' : mode === 'light' ? 'Sáng' : 'Tự động';
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setThemePreference(mode)}
                      style={[
                        styles.themeOption,
                        {
                          backgroundColor: active ? colors.textPrimary : colors.modalSurface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.themeOptionText,
                          { color: active ? colors.background : colors.textPrimary },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: colors.youtubeRed }]}
                onPress={async () => {
                  await toggleParentLock(true);
                  handleClose();
                  onTriggerEmergencyLock?.();
                }}
              >
                <MaterialCommunityIcons name="lock-clock" size={18} color={colors.youtubeRed} />
                <Text style={[styles.outlineBtnText, { color: colors.youtubeRed }]}>
                  Thử khóa hết giờ xem
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: colors.border }]}
                onPress={() => {
                  Alert.alert(
                    'Cổng Web Phụ Huynh',
                    'Mở trình duyệt:\nhttp://localhost:8080/parent để quản lý kho video.'
                  );
                }}
              >
                <MaterialCommunityIcons name="web" size={18} color={colors.textPrimary} />
                <Text style={[styles.outlineBtnText, { color: colors.textPrimary }]}>
                  Cổng Web Phụ Huynh
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  closeBtn: { padding: 4 },
  body: { gap: 12 },
  subtitle: { fontSize: 13 },
  pinInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: '700',
  },
  error: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  actionBtn: {
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  themeOptionText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 4 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  outlineBtnText: { fontSize: 13, fontWeight: '600' },
});
