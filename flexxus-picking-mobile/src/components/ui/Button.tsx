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

/**
 * Button Component
 *
 * A versatile button component with multiple variants for different UI contexts.
 * All variants support loading state, disabled state, and optional icon.
 *
 * @example
 * ```tsx
 * <Button label="Primary Action" onPress={handleAction} variant="primary" />
 * <Button label="Secondary" onPress={handleSecondary} variant="secondary" />
 * <Button label="Outline" onPress={handleOutline} variant="outline" />
 * ```
 *
 * ## Variants
 *
 * ### `primary` (default)
 * - Use for: Main actions, primary call-to-action
 * - Style: Solid accent background, white text
 * - Example: "Ingresar al picking", "Start Picking"
 *
 * ### `secondary`
 * - Use for: Alternative actions, complementary options
 * - Style: Surface elevated background, border, regular text
 * - Example: "Cancel", "Go Back"
 *
 * ### `ghost`
 * - Use for: Low-emphasis actions, tertiary options
 * - Style: Transparent background, muted text
 * - Example: "Skip", "Dismiss"
 *
 * ### `danger`
 * - Use for: Destructive actions, irreversible operations
 * - Style: Red background, white text
 * - Example: "Delete", "Remove", "Cancel Order"
 *
 * ### `outline`
 * - Use for: Secondary actions that need visual emphasis but less than primary
 * - Style: Transparent background, accent border and text, soft pressed state
 * - Example: "View Details", "View Order", "Reintentar"
 * - Note: New variant added for desktop parity
 *
 * ## Link Variant Consideration
 *
 * After evaluating LoginScreen and PendingOrdersScreen for tertiary text-only actions,
 * the decision was made NOT to implement a `link` variant. Native apps typically use
 * `Text` with `onPress` for inline actions rather than button-like link components.
 * No current use case in the app requires a link variant. If future needs arise,
 * consider using `<Text onPress={...} style={{color: colors.accent}}>...</Text>` instead.
 *
 * ## Touch Targets
 *
 * All buttons meet minimum touch target size requirements:
 * - Minimum height: 54px (exceeds iOS 44px and Android 48px guidelines)
 * - Border radius: 10px (theme.radius.md) from Phase 4 design token alignment
 *
 * ## Accessibility
 *
 * - Disabled state reduces opacity to 0.5
 * - Loading state shows ActivityIndicator with appropriate color
 * - Press state provides immediate visual feedback
 */

const variantStyles: Record<ButtonVariant, { backgroundColor: string; pressedBackgroundColor: string; textColor: string; borderColor: string }> = {
  primary: { backgroundColor: colors.accent, pressedBackgroundColor: colors.accentPressed, textColor: colors.white, borderColor: colors.accent },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    pressedBackgroundColor: colors.surfaceStrong,
    textColor: colors.text,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: colors.transparent,
    pressedBackgroundColor: colors.surfaceElevated,
    textColor: colors.textMuted,
    borderColor: colors.transparent,
  },
  danger: { backgroundColor: colors.danger, pressedBackgroundColor: '#D63B3B', textColor: colors.white, borderColor: colors.danger },
  outline: {
    backgroundColor: colors.transparent,
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
        {
          backgroundColor: pressed && !disabled ? palette.pressedBackgroundColor : palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.5 : 1,
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
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
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
    letterSpacing: 0.3,
  },
})
