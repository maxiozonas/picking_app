import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing, theme } from '../../theme'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'

type ButtonProps = {
  label: string
  onPress?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: ButtonVariant
  icon?: ReactNode
}
const variantStyles: Record<ButtonVariant, { backgroundColor: string; pressedBackgroundColor: string; textColor: string; borderColor: string }> = {
  primary: { backgroundColor: colors.accent, pressedBackgroundColor: colors.accentPressed, textColor: colors.white, borderColor: colors.accent },
  secondary: {
    backgroundColor: colors.surface,
    pressedBackgroundColor: colors.surfaceElevated,
    textColor: colors.text,
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: colors.transparent,
    pressedBackgroundColor: colors.surface,
    textColor: colors.textMuted,
    borderColor: colors.transparent,
  },
  danger: { backgroundColor: colors.danger, pressedBackgroundColor: '#D63B3B', textColor: colors.white, borderColor: colors.danger },
  outline: {
    backgroundColor: colors.surfaceInset,
    pressedBackgroundColor: colors.accentSoft,
    textColor: colors.accent,
    borderColor: colors.accent,
  },
}

export function Button({ label, onPress, loading, disabled, variant = 'primary', icon }: ButtonProps) {
  const palette = variantStyles[variant]

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? theme.shadows.accent : styles.flatShadow,
        {
          backgroundColor: pressed && !disabled ? palette.pressedBackgroundColor : palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.45 : 1,
          transform: pressed && !disabled ? [{ scale: 0.985 }] : [{ scale: 1 }],
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={palette.textColor} /> : icon}
        <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  flatShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
})
