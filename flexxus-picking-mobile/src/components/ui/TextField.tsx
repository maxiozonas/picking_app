import { forwardRef } from 'react'
import type { TextInputProps } from 'react-native'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { colors, radius, spacing, theme } from '../../theme'

type Props = TextInputProps & {
  label: string
  error?: string | null
  helperText?: string | null
}

export const TextField = forwardRef<TextInput, Props>(function TextField({ label, error, helperText, multiline, style, ...props }, ref) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline ? styles.inputMultiline : null, style]}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {helperText && !error ? <Text style={styles.helper}>{helperText}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 54,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
    paddingHorizontal: spacing.md,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  helper: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },
  error: {
    color: colors.danger,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
})
