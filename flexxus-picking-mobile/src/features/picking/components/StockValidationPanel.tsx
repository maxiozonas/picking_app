import { StyleSheet, Text, View } from 'react-native'

import { StatusChip } from '../../../components/ui/StatusChip'
import { formatDateTime } from '../../../lib/utils/format'
import { colors, radius, spacing, theme } from '../../../theme'
import type { ItemStockInfo, StockValidation } from '../types'

type StockValidationPanelProps = {
  stockInfo?: ItemStockInfo | null
  validation?: StockValidation | null
}

export function StockValidationPanel({ stockInfo, validation }: StockValidationPanelProps) {
  const hasStock = Boolean(stockInfo)
  const hasValidation = Boolean(validation)

  if (!hasStock && !hasValidation) {
    return null
  }

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Stock</Text>
        {validation ? (
          <StatusChip label={validation.validated ? 'Validado' : 'Bloqueado'} tone={validation.validated ? 'success' : 'danger'} />
        ) : null}
      </View>

      {stockInfo ? (
        <View style={styles.block}>
          <Text style={styles.kicker}>Disponible</Text>
          <Text style={styles.value}>Disponible: {stockInfo.availableQuantity}</Text>
          <Text style={styles.meta}>Ubicacion: {stockInfo.location || 'Sin ubicacion informada'}</Text>
          {stockInfo.warehouseName ? (
            <Text style={styles.meta}>Deposito: {stockInfo.warehouseName}</Text>
          ) : null}
          <Text style={styles.meta}>Actualizado: {formatDateTime(stockInfo.lastUpdated)}</Text>
        </View>
      ) : null}

      {validation ? (
        <View style={[styles.block, validation.validated ? styles.validationOk : styles.validationError]}>
          <Text style={styles.kicker}>Validacion</Text>
          <Text style={styles.value}>{validation.validated ? 'Validado para continuar' : 'Bloqueado'}</Text>
          <Text style={styles.meta}>Solicitado: {validation.requestedQty} | Disponible: {validation.availableQty}</Text>
          <Text style={styles.meta}>Momento: {formatDateTime(validation.validatedAt)}</Text>
          {validation.errorCode ? <Text style={styles.meta}>Codigo: {validation.errorCode}</Text> : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surfaceInset,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
  },
  block: {
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  validationOk: {
    backgroundColor: colors.successSoft,
  },
  validationError: {
    backgroundColor: colors.dangerSoft,
  },
  kicker: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
  },
  meta: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
})
