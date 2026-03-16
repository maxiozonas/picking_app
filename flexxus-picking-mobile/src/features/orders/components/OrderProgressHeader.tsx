import { StyleSheet, Text, View } from 'react-native'

import { StatusChip } from '../../../components/ui/StatusChip'
import { formatCurrency, formatDateTime, formatOrderCode, formatPercentage, formatWarehouseLabel } from '../../../lib/utils/format'
import { colors, radius, spacing, theme } from '../../../theme'
import type { OrderDetail } from '../../picking/types'

function getStatusMeta(status: OrderDetail['status']) {
  switch (status) {
    case 'in_progress':
      return { label: 'En curso', tone: 'progress' as const }
    case 'completed':
      return { label: 'Completado', tone: 'success' as const }
    case 'has_issues':
      return { label: 'Con alertas', tone: 'warning' as const }
    case 'cancelled':
      return { label: 'Cancelado', tone: 'danger' as const }
    case 'pending':
    default:
      return { label: 'Pendiente', tone: 'pending' as const }
  }
}

export function OrderProgressHeader({ detail }: { detail: OrderDetail }) {
  const statusMeta = getStatusMeta(detail.status)

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identityBlock}>
          <Text style={styles.kicker}>{formatWarehouseLabel(detail.warehouse)}</Text>
          <Text style={styles.orderCode}>{formatOrderCode(detail.orderType, detail.orderNumber)}</Text>
          <Text numberOfLines={2} style={styles.customer}>
            {detail.customerName || 'Cliente no informado'}
          </Text>
        </View>
        <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressPanel}>
          <Text style={styles.progressValue}>{formatPercentage(detail.completedPercentage)}</Text>
          <Text style={styles.progressLabel}>{detail.pickedItems}/{detail.totalItems} items</Text>
        </View>
        <View style={styles.totalPanel}>
          <Text style={styles.totalKicker}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(detail.total)}</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaCell}>
          <Text style={styles.metaKicker}>Asignado</Text>
          <Text style={styles.metaValue}>{detail.assignedTo.name || 'Sin tomar'}</Text>
        </View>
        <View style={styles.metaCell}>
          <Text style={styles.metaKicker}>Iniciado</Text>
          <Text style={styles.metaValue}>{formatDateTime(detail.startedAt)}</Text>
        </View>
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
    ...theme.shadows.card,
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
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  orderCode: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.display,
  },
  customer: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressPanel: {
    backgroundColor: colors.surfaceInset,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
    flex: 1,
  },
  progressValue: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.display,
  },
  progressLabel: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
  },
  totalPanel: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minWidth: 108,
    padding: spacing.md,
  },
  totalKicker: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  totalValue: {
    color: colors.white,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaCell: {
    backgroundColor: colors.surfaceInset,
    borderRadius: radius.md,
    gap: spacing.xs,
    minWidth: '48%',
    padding: spacing.md,
  },
  metaKicker: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
  },
})
