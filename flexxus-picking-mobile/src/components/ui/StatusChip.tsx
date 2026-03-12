import { StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing, theme } from '../../theme'

type StatusTone = 'neutral' | 'pending' | 'progress' | 'success' | 'warning' | 'danger'

const toneMap: Record<StatusTone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: colors.surfaceStrong, color: colors.textSoft },
  pending: { backgroundColor: colors.surfaceStrong, color: colors.text },
  progress: { backgroundColor: colors.info, color: colors.bg },
  success: { backgroundColor: colors.success, color: colors.bg },
  warning: { backgroundColor: colors.warning, color: colors.bg },
  danger: { backgroundColor: colors.danger, color: colors.white },
}

export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  const palette = toneMap[tone]

  return (
    <View style={[styles.chip, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
})
