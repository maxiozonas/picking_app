import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { colors, spacing, theme } from '../../theme'

export function LoadingBlock({ label = 'Sincronizando operacion...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  label: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
