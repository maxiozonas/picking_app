import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

import { Button } from '../../../components/ui/Button'
import { StatusChip } from '../../../components/ui/StatusChip'
import { colors, radius, spacing, theme } from '../../../theme'
import { useItemStock } from '../hooks'
import type { PickItem, StockValidation } from '../types'
import { StockValidationPanel } from './StockValidationPanel'

type PickItemCardProps = {
  item: PickItem
  orderNumber: string
  validation?: StockValidation | null
  onPick: (item: PickItem, quantity: number) => void
  onReportAlert?: (item: PickItem) => void
  isMutating?: boolean
  disabled?: boolean
}

function getStatusMeta(status: PickItem['status']) {
  switch (status) {
    case 'completed':
      return { label: 'Completo', tone: 'success' as const }
    case 'in_progress':
      return { label: 'En curso', tone: 'progress' as const }
    case 'pending':
    default:
      return { label: 'Pendiente', tone: 'pending' as const }
  }
}

export function PickItemCard({ item, orderNumber, validation, onPick, onReportAlert, isMutating, disabled }: PickItemCardProps) {
  const [stockVisible, setStockVisible] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const statusMeta = getStatusMeta(item.status)
  const remaining = Math.max(item.quantityRequired - item.quantityPicked, 0)
  const stockQuery = useItemStock(orderNumber, item.productCode, stockVisible)

  const presets = useMemo(() => {
    const candidates = [1, 2, 5, remaining]
    return Array.from(new Set(candidates.filter((value) => value > 0 && value <= remaining))).slice(0, 4)
  }, [remaining])

  return (
    <View style={[styles.card, item.status === 'completed' ? styles.cardCompleted : null]}>
      <View style={styles.topRow}>
        <View style={styles.identityBlock}>
          <Text style={styles.kicker}>SKU</Text>
          <Text style={styles.productCode}>{item.productCode}</Text>
          <Text style={styles.description}>{item.description || 'Descripcion sin detalle'}</Text>
        </View>
        <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
      </View>

      <View style={styles.progressStrip}>
        <Text style={styles.progressValue}>{item.quantityPicked}/{item.quantityRequired}</Text>
        <Text style={styles.progressHint}>{remaining > 0 ? `${remaining} pendientes` : 'Completo'}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Ubicacion: {item.location || item.stockInfo?.location || 'Sin posicion'}</Text>
        <Text style={styles.meta}>Lote: {item.lot || 'Sin lote'}</Text>
      </View>

      {stockVisible && stockQuery.isError ? (
        <View style={styles.stockErrorBanner}>
          <Text style={styles.stockErrorText}>No se pudo obtener el stock. Intentalo de nuevo.</Text>
        </View>
      ) : null}
      {stockVisible && !stockQuery.isError ? (
        <StockValidationPanel stockInfo={stockQuery.data ?? item.stockInfo} validation={validation} />
      ) : null}

      <View style={styles.actionsBlock}>
        <View style={styles.presetRow}>
          {presets.map((preset) => (
            <Pressable
              key={preset}
              disabled={disabled || item.status === 'completed'}
              onPress={() => setQuantity(preset)}
              style={({ pressed }) => [
                styles.presetButton,
                quantity === preset ? styles.presetButtonSelected : null,
                pressed ? styles.presetButtonPressed : null,
              ]}
            >
              <Text style={[styles.presetLabel, quantity === preset ? styles.presetLabelSelected : null]}>{preset}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setStockVisible((current) => !current)} style={({ pressed }) => [styles.linkButton, pressed ? styles.linkButtonPressed : null]}>
            {stockQuery.isFetching && stockVisible ? <ActivityIndicator color={colors.text} size="small" /> : <Text style={styles.linkButtonLabel}>{stockVisible ? 'Ocultar stock' : 'Ver stock'}</Text>}
          </Pressable>
          {onReportAlert ? (
            <Pressable onPress={() => onReportAlert(item)} style={({ pressed }) => [styles.linkButton, styles.alertButton, pressed ? styles.linkButtonPressed : null]}>
              <Text style={[styles.linkButtonLabel, styles.alertButtonLabel]}>Alerta item</Text>
            </Pressable>
          ) : null}
        </View>

        <Button
          disabled={disabled || item.status === 'completed' || remaining === 0}
          label={item.status === 'completed' ? 'Item completo' : `Confirmar x${quantity}`}
          loading={isMutating}
          onPress={() => onPick(item, Math.min(quantity, remaining))}
        />
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
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardCompleted: {
    borderColor: colors.success,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  identityBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  kicker: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  productCode: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
  },
  description: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
  },
  progressStrip: {
    backgroundColor: colors.surfaceInset,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  progressValue: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xxl,
  },
  progressHint: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
  metaRow: {
    gap: spacing.xs,
  },
  meta: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
  actionsBlock: {
    gap: spacing.sm,
  },
  presetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetButton: {
    backgroundColor: colors.surfaceInset,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    minWidth: 46,
    paddingHorizontal: spacing.md,
  },
  presetButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  presetButtonPressed: {
    opacity: 0.82,
  },
  presetLabel: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
  },
  presetLabelSelected: {
    color: colors.white,
  },
  linkButton: {
    backgroundColor: colors.surfaceInset,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  linkButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  linkButtonLabel: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'uppercase',
  },
  alertButton: {
    borderColor: colors.accent,
  },
  alertButtonLabel: {
    color: colors.accent,
  },
  stockErrorBanner: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  stockErrorText: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
})
