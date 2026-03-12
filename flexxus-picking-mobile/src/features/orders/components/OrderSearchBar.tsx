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
        placeholder="NP 623200 o cliente"
        returnKeyType="search"
        value={value}
      />

      <View style={styles.footerRow}>
        <Text style={styles.hint}>La busqueda se aplica al deposito asignado y reinicia la lista.</Text>
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
    borderColor: colors.border,
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
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  hint: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  clearButton: {
    borderColor: colors.border,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
})
