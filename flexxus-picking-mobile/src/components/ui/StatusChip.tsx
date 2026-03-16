import { StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing, theme } from '../../theme'

type StatusTone = 'neutral' | 'pending' | 'progress' | 'success' | 'warning' | 'danger'

const toneMap: Record<StatusTone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: colors.surfaceStrong, color: colors.textSoft },
  pending: { backgroundColor: colors.surfaceElevated, color: colors.text },
  progress: { backgroundColor: colors.infoSoft, color: colors.info },
  success: { backgroundColor: colors.successSoft, color: colors.success },
  warning: { backgroundColor: colors.warningSoft, color: colors.warning },
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
    paddingVertical: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
