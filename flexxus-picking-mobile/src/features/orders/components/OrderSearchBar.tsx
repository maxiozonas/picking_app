import { Pressable, StyleSheet, Text, View } from 'react-native'

import { TextField } from '../../../components/ui/TextField'
import { colors, radius, spacing, theme } from '../../../theme'

type OrderSearchBarProps = {
  value: string
  onChange: (value: string) => void
  resultsLabel: string
  isSearching?: boolean
}

export function OrderSearchBar({ value, onChange, resultsLabel, isSearching }: OrderSearchBarProps) {
  const hasValue = value.trim().length > 0

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>Buscar trabajo</Text>
        <Text style={styles.meta}>{isSearching ? 'Actualizando...' : resultsLabel}</Text>
      </View>

      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        label="Pedido o cliente"
        onChangeText={onChange}
        placeholder="Buscar pedido"
        returnKeyType="search"
        value={value}
      />

      <View style={styles.footerRow}>
        <View style={styles.divider} />
        {hasValue ? (
          <Pressable onPress={() => onChange('')} style={({ pressed }) => [styles.clearButton, pressed ? styles.clearButtonPressed : null]}>
            <Text style={styles.clearButtonLabel}>Limpiar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  kicker: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  meta: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(130, 136, 153, 0.12)',
  },
  clearButton: {
    backgroundColor: colors.surfaceInset,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  clearButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  clearButtonLabel: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
