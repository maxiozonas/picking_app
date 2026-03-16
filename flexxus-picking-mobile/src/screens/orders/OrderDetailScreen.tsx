import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { LoadingBlock } from '../../components/ui/LoadingBlock'
import { Screen } from '../../components/ui/Screen'
import { StatusChip } from '../../components/ui/StatusChip'
import { AlertComposerSheet } from '../../features/alerts/components/AlertComposerSheet'
import { useCreateAlertMutation } from '../../features/alerts/hooks'
import type { AlertSeverity, AlertType } from '../../features/alerts/types'
import { OrderProgressHeader } from '../../features/orders/components/OrderProgressHeader'
import { PickItemCard } from '../../features/picking/components/PickItemCard'
import {
  useCompleteOrderMutation,
  useOrderDetail,
  useOrderStockValidations,
  usePickItemMutation,
  useStartOrderMutation,
} from '../../features/picking/hooks'
import type { PickItem } from '../../features/picking/types'
import { ApiError } from '../../lib/api/errors'
import { formatDateTime, formatOrderCode } from '../../lib/utils/format'
import type { OperatorStackParamList } from '../../navigation/types'
import { colors, radius, spacing, theme } from '../../theme'

type FeedbackState = {
  tone: 'success' | 'danger' | 'warning'
  title: string
  message: string
} | null

function getAlertSeverityTone(severity: AlertSeverity, status: 'pending' | 'resolved') {
  if (status === 'resolved') {
    return 'success' as const
  }

  switch (severity) {
    case 'critical':
      return 'danger' as const
    case 'high':
      return 'warning' as const
    case 'medium':
      return 'progress' as const
    case 'low':
    default:
      return 'neutral' as const
  }
}

function getAlertSeverityLabel(severity: AlertSeverity) {
  switch (severity) {
    case 'low':
      return 'Baja'
    case 'medium':
      return 'Media'
    case 'high':
      return 'Alta'
    case 'critical':
      return 'Critica'
  }
}

function getAlertTypeLabel(alertType: AlertType) {
  switch (alertType) {
    case 'insufficient_stock':
      return 'Stock insuficiente'
    case 'product_missing':
      return 'Producto faltante'
    case 'order_issue':
    default:
      return 'Problema general'
  }
}

export function OrderDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OperatorStackParamList, 'OrderDetail'>>()
  const route = useRoute<RouteProp<OperatorStackParamList, 'OrderDetail'>>()
  const { orderNumber } = route.params
  const detailQuery = useOrderDetail(orderNumber)
  const validationsQuery = useOrderStockValidations(orderNumber, detailQuery.isSuccess)
  const startMutation = useStartOrderMutation(orderNumber)
  const pickMutation = usePickItemMutation(orderNumber)
  const completeMutation = useCompleteOrderMutation(orderNumber)
  const createAlertMutation = useCreateAlertMutation(orderNumber)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [activeItemCode, setActiveItemCode] = useState<string | null>(null)
  const [composerVisible, setComposerVisible] = useState(false)
  const [composerProductCode, setComposerProductCode] = useState<string | null>(null)

  const validationsByItem = useMemo(() => {
    return new Map((validationsQuery.data ?? []).map((validation) => [validation.productCode, validation]))
  }, [validationsQuery.data])

  const detail = detailQuery.data
  const readyToComplete = detail?.items.every((item) => item.status === 'completed') ?? false
  const unresolvedAlerts = detail?.alerts.filter((alert) => alert.status !== 'resolved').length ?? 0

  const handleRetry = () => {
    setFeedback(null)
    void detailQuery.refetch()
    void validationsQuery.refetch()
  }

  const handleStart = () => {
    setFeedback(null)
    startMutation.mutate(undefined, {
      onSuccess: () => {
        setFeedback({
          tone: 'success',
          title: 'Pedido tomado',
          message: 'El pedido ya quedo en curso y listo para confirmar picks item por item.',
        })
      },
      onError: (error) => {
        setFeedback({
          tone: 'warning',
          title: 'No pudimos iniciar el pedido',
          message: error.message,
        })
      },
    })
  }

  const handlePick = (item: PickItem, quantity: number) => {
    setFeedback(null)
    setActiveItemCode(item.productCode)

    pickMutation.mutate(
      { productCode: item.productCode, quantity },
      {
        onSuccess: (result) => {
          setFeedback({
            tone: result.orderReadyToComplete ? 'success' : 'warning',
            title: result.orderReadyToComplete ? 'Pedido listo para cerrar' : 'Pick registrado',
            message:
              result.message ||
              `${item.productCode} quedo en ${result.quantityPicked}/${result.quantityRequired} unidades.`,
          })
        },
        onError: (error) => {
          setFeedback({
            tone: 'danger',
            title: `No pudimos confirmar ${item.productCode}`,
            message: error.message,
          })
        },
        onSettled: () => {
          setActiveItemCode(null)
          void validationsQuery.refetch()
        },
      },
    )
  }

  const handleComplete = () => {
    setFeedback(null)
    completeMutation.mutate(undefined, {
      onSuccess: () => {
        setFeedback({
          tone: 'success',
          title: 'Pedido completado',
          message: 'El backend confirmo el cierre. Volve a la cola para seguir con el siguiente pedido.',
        })
      },
      onError: (error) => {
        setFeedback({
          tone: 'danger',
          title: 'El pedido sigue abierto',
          message: error.message,
        })
      },
    })
  }

  const openAlertComposer = (productCode?: string | null) => {
    setComposerProductCode(productCode ?? null)
    setComposerVisible(true)
  }

  const closeAlertComposer = () => {
    if (createAlertMutation.isPending) {
      return
    }

    setComposerVisible(false)
    setComposerProductCode(null)
    createAlertMutation.reset()
  }

  const handleCreateAlert = (input: {
    alertType: AlertType
    severity: AlertSeverity
    message: string
    productCode?: string | null
  }) => {
    createAlertMutation.mutate(input, {
      onSuccess: (alert) => {
        setFeedback({
          tone: 'warning',
          title: 'Alerta enviada',
          message: alert.productCode
            ? `Avisamos al equipo admin sobre ${alert.productCode}. La alerta ya aparece en este pedido.`
            : 'Avisamos al equipo admin y la alerta ya quedo visible en el pedido.',
        })
        closeAlertComposer()
      },
    })
  }

  if (detailQuery.isPending) {
    return (
      <Screen
        eyebrow="Pedido"
        title={formatOrderCode(undefined, orderNumber)}
      >
        <LoadingBlock label="Cargando detalle del pedido..." />
      </Screen>
    )
  }

  if (detailQuery.isError || !detail) {
    return (
      <Screen
        eyebrow="Pedido"
        title={formatOrderCode(undefined, orderNumber)}
      >
        <ErrorState actionLabel="Reintentar" message={detailQuery.error?.message ?? 'No pudimos abrir el pedido.'} onAction={handleRetry} title="El detalle quedo fuera de alcance" />
        <Button label="Volver a pedidos" onPress={() => navigation.goBack()} variant="ghost" />
      </Screen>
    )
  }

  const footer = (
    <View style={styles.footerActions}>
      {detail.status === 'pending' ? (
        <Button label="Iniciar pedido" loading={startMutation.isPending} onPress={handleStart} />
      ) : null}

      {detail.status !== 'completed' ? (
        <Button
          disabled={!readyToComplete || completeMutation.isPending}
          label={readyToComplete ? 'Completar pedido' : 'Completa todos los items primero'}
          loading={completeMutation.isPending}
          onPress={handleComplete}
          variant={readyToComplete ? 'primary' : 'secondary'}
        />
      ) : (
        <Button disabled label="Pedido cerrado" variant="secondary" />
      )}
    </View>
  )

  return (
    <Screen
      eyebrow="Picking activo"
      footer={footer}
      scrollable
      title={formatOrderCode(detail.orderType, detail.orderNumber)}
    >
      <View style={styles.content}>
        <OrderProgressHeader detail={detail} />

        {feedback ? (
          <View style={[styles.feedbackCard, feedback.tone === 'success' ? styles.feedbackSuccess : null, feedback.tone === 'danger' ? styles.feedbackDanger : null]}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>{feedback.title}</Text>
              <StatusChip label={feedback.tone === 'success' ? 'Listo' : feedback.tone === 'danger' ? 'Revisar' : 'Atencion'} tone={feedback.tone} />
            </View>
            <Text style={styles.feedbackMessage}>{feedback.message}</Text>
          </View>
        ) : null}

        <View style={styles.controlRow}>
          <Button label="Actualizar" onPress={handleRetry} variant="secondary" />
          <Button label="Reportar alerta" onPress={() => openAlertComposer()} variant="secondary" />
          <Button label="Volver" onPress={() => navigation.goBack()} variant="ghost" />
        </View>

        <View style={styles.alertBanner}>
          <View style={styles.alertBannerCopy}>
            <Text style={styles.alertBannerTitle}>Incidencias del pedido</Text>
            <Text style={styles.alertBannerText}>{unresolvedAlerts > 0 ? 'Requiere seguimiento' : 'Sin bloqueos activos'}</Text>
          </View>
          <StatusChip label={unresolvedAlerts > 0 ? `${unresolvedAlerts} abierta${unresolvedAlerts === 1 ? '' : 's'}` : 'Sin alertas'} tone={unresolvedAlerts > 0 ? 'warning' : 'success'} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items a pickear</Text>
            <Text style={styles.sectionMeta}>{detail.items.length} posiciones</Text>
          </View>
          {detail.items.length === 0 ? (
            <EmptyState title="Sin items cargados" message="No hay posiciones disponibles." />
          ) : (
            detail.items.map((item) => (
              <PickItemCard
                key={item.productCode}
                disabled={detail.status === 'pending' || detail.status === 'completed'}
                isMutating={pickMutation.isPending && activeItemCode === item.productCode}
                item={item}
                onPick={handlePick}
                onReportAlert={(currentItem) => openAlertComposer(currentItem.productCode)}
                orderNumber={orderNumber}
                validation={validationsByItem.get(item.productCode) ?? null}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertas informadas</Text>
            <Text style={styles.sectionMeta}>{detail.alerts.length}</Text>
          </View>
          {detail.alerts.length === 0 ? (
            <EmptyState title="Sin alertas reportadas" message="No hay incidencias cargadas." />
          ) : (
            detail.alerts.map((alert) => (
              <View key={alert.id} style={styles.timelineCard}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{alert.message}</Text>
                  <StatusChip label={getAlertSeverityLabel(alert.severity)} tone={getAlertSeverityTone(alert.severity, alert.status)} />
                </View>
                <Text style={styles.timelineMeta}>Tipo: {getAlertTypeLabel(alert.alertType)} {alert.productCode ? `| Producto: ${alert.productCode}` : ''}</Text>
                <Text style={styles.timelineMeta}>Creada {formatDateTime(alert.createdAt)} {alert.reporter?.name ? `por ${alert.reporter.name}` : ''}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            <Text style={styles.sectionMeta}>{detail.events.length}</Text>
          </View>
          {detail.events.length === 0 ? (
            <EmptyState title="Todavia sin eventos" message="Sin actividad registrada." />
          ) : (
            detail.events.map((event) => (
              <View key={event.id} style={styles.timelineCard}>
                <Text style={styles.timelineTitle}>{event.message || event.eventType}</Text>
                <Text style={styles.timelineMeta}>Evento: {event.eventType}</Text>
                <Text style={styles.timelineMeta}>Momento: {formatDateTime(event.createdAt)}</Text>
                {event.user?.name ? <Text style={styles.timelineMeta}>Actor: {event.user.name}</Text> : null}
              </View>
            ))
          )}
        </View>
      </View>

      <AlertComposerSheet
        availableProductCodes={detail.items.map((item) => item.productCode)}
        errorMessage={createAlertMutation.error?.message ?? null}
        fieldErrors={createAlertMutation.error instanceof ApiError ? createAlertMutation.error.fields : undefined}
        isSubmitting={createAlertMutation.isPending}
        onClose={closeAlertComposer}
        onSubmit={handleCreateAlert}
        orderNumber={orderNumber}
        selectedProductCode={composerProductCode}
        visible={composerVisible}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  feedbackSuccess: {
    borderColor: colors.success,
  },
  feedbackDanger: {
    borderColor: colors.danger,
  },
  feedbackHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  feedbackTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
  },
  feedbackMessage: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  controlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  alertBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  alertBannerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  alertBannerTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xl,
  },
  alertBannerText: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xxl,
  },
  sectionMeta: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  timelineHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  timelineTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
  },
  timelineMeta: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  footerActions: {
    gap: spacing.sm,
  },
})
