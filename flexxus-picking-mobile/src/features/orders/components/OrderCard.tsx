import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { StatusChip } from '../../../components/ui/StatusChip'
import { formatOrderCode, formatPendingProgress, formatWarehouseLabel } from '../../../lib/utils/format'
import { colors, radius, spacing, theme } from '../../../theme'
import type { PendingOrder } from '../types'

type OrderCardProps = {
  order: PendingOrder
  onPress: (order: PendingOrder) => void
}

function getStatusMeta(status: PendingOrder['status']) {
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

function OrderCardComponent({ order, onPress }: OrderCardProps) {
  const statusMeta = getStatusMeta(order.status)

  return (
    <Pressable onPress={() => onPress(order)} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.topRow}>
        <View style={styles.identityBlock}>
          <Text style={styles.orderCode}>{formatOrderCode(order.orderType, order.orderNumber)}</Text>
          <Text numberOfLines={1} style={styles.customer}>
            {order.customer || 'Cliente no informado'}
          </Text>
        </View>
        <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
      </View>

      <View style={styles.progressBand}>
        <Text style={styles.progressLabel}>{formatPendingProgress(order.itemsPicked, order.itemsCount)}</Text>
        <Text style={styles.progressHint}>{order.assignedTo.name ? `Tomado por ${order.assignedTo.name}` : 'Disponible para iniciar'}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.metaLabel}>{formatWarehouseLabel(order.warehouse)}</Text>
        <Text style={styles.metaLabel}>{order.startedAt ? 'Retomar pedido' : 'Abrir detalle'}</Text>
      </View>
    </Pressable>
  )
}

export const OrderCard = memo(OrderCardComponent)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
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
  orderCode: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.xxl,
  },
  customer: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
  },
  progressBand: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressLabel: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
  },
  progressHint: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: colors.textSoft,
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
})
