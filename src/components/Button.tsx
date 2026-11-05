import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  fullWidth = true,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.outlineBtn, fullWidth && styles.fullWidth, isDisabled && styles.disabled]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.teal} />
        ) : (
          <>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={styles.outlineBtnText}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  const colors: [string, string] =
    variant === 'danger' ? [...Colors.gradientDanger] : [...Colors.gradientPrimary];
  // gradientPrimary is now blue→cyan — prominent and vibrant

  return (
    <TouchableOpacity
      style={[fullWidth && styles.fullWidth, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBtn}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.textInverse} />
        ) : (
          <>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={styles.gradientBtnText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    // Visible button shadow
    shadowColor: '#1769E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientBtnText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.blue,
    backgroundColor: Colors.blueLight,
    gap: Spacing.sm,
  },
  outlineBtnText: {
    color: Colors.blue,
    fontSize: 15,
    fontWeight: '700',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
