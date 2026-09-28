import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';

export interface KidsButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const KidsButton: React.FC<KidsButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return Colors.border;
    switch (variant) {
      case 'secondary':
        return Colors.secondary;
      case 'success':
        return Colors.success;
      case 'danger':
        return Colors.danger;
      case 'primary':
      default:
        return Colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: getBackgroundColor() },
          pressed && styles.pressed,
          disabled && styles.disabled,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <View style={styles.content}>
          {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: Theme.touchTargetMin,
    minWidth: Theme.touchTargetMin,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: Theme.spacing.sm,
  },
  text: {
    color: '#ffffff',
    fontSize: Theme.typography.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidth: {
    width: '100%',
  },
});
