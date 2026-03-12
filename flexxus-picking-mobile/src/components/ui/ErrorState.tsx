import { StyleSheet, Text, View } from 'react-native'

import { Button } from './Button'
import { colors, radius, spacing, theme } from '../../theme'

export function ErrorState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
  },
  message: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
})
