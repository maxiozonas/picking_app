import { FlashList } from '@shopify/flash-list'
import { useCallback, useMemo, useState } from 'react'
import { RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { LoadingBlock } from '../../components/ui/LoadingBlock'
import { Screen } from '../../components/ui/Screen'
import { StatusChip } from '../../components/ui/StatusChip'
import { OrderCard } from '../../features/orders/components/OrderCard'
import { OrderSearchBar } from '../../features/orders/components/OrderSearchBar'
import { useDebouncedValue, useInfinitePendingOrders } from '../../features/orders/hooks'
import type { PendingOrder } from '../../features/orders/types'
import { formatWarehouseLabel } from '../../lib/utils/format'
import type { OperatorStackParamList } from '../../navigation/types'
import { useAuthStore } from '../../stores/auth-store'
import { colors, radius, spacing, theme } from '../../theme'

export function PendingOrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OperatorStackParamList, 'PendingOrders'>>()
  const user = useAuthStore((state) => state.user)
  const [searchDraft, setSearchDraft] = useState('')
  const debouncedSearch = useDebouncedValue(searchDraft.trim())

  const ordersQuery = useInfinitePendingOrders(debouncedSearch)
  const orders = useMemo(() => {
    const seen = new Set<string>()

    return (ordersQuery.data?.pages ?? []).flatMap((page) =>
      page.data.filter((order) => {
        const key = `${order.orderType}-${order.orderNumber}`

        if (seen.has(key)) {
          return false
        }

        seen.add(key)
        return true
      }),
    )
  }, [ordersQuery.data])

  const totalResults = ordersQuery.data?.pages[0]?.meta.total ?? orders.length
  const resultsLabel = debouncedSearch
    ? `${totalResults} resultado${totalResults === 1 ? '' : 's'}`
    : `${totalResults} pedido${totalResults === 1 ? '' : 's'} activos`
  const isRefreshing = ordersQuery.isRefetching && !ordersQuery.isFetchingNextPage
  const isSearching = searchDraft.trim() !== debouncedSearch || (ordersQuery.isFetching && orders.length > 0)

  const openOrder = useCallback(
    (order: PendingOrder) => {
      navigation.navigate('OrderDetail', { orderNumber: `${order.orderType}-${order.orderNumber}` })
    },
    [navigation],
  )

  const renderOrder = useCallback(
    ({ item }: { item: PendingOrder }) => <OrderCard order={item} onPress={openOrder} />,
    [openOrder],
  )

  const keyExtractor = useCallback((item: PendingOrder) => `${item.orderType}-${item.orderNumber}`, [])

  const handleLoadMore = useCallback(() => {
    if (!ordersQuery.hasNextPage || ordersQuery.isFetchingNextPage || ordersQuery.isPending) {
      return
    }

    void ordersQuery.fetchNextPage()
  }, [ordersQuery])

  const header = (
    <View style={styles.listHeader}>
      <View style={styles.banner}>
        <View style={styles.bannerRow}>
          <StatusChip label="Deposito activo" tone="progress" />
          <Text style={styles.bannerCode}>{user?.warehouse?.code ?? '---'}</Text>
        </View>
        <Text style={styles.bannerTitle}>{formatWarehouseLabel(user?.warehouse)}</Text>
        <Text style={styles.bannerText}>Los pedidos visibles ya llegan filtrados por tu contexto operativo. Arrastra para refrescar o busca por numero y cliente.</Text>
      </View>

      <OrderSearchBar
        isSearching={isSearching}
        onChange={setSearchDraft}
        resultsLabel={resultsLabel}
        value={searchDraft}
      />
    </View>
  )

  if (ordersQuery.isPending && orders.length === 0) {
    return (
      <Screen
        eyebrow="Deposito asignado"
        title={formatWarehouseLabel(user?.warehouse)}
        subtitle="Sincronizamos el tablero operativo antes de liberar el listado activo."
      >
        {header}
        <LoadingBlock label="Buscando pedidos pendientes..." />
      </Screen>
    )
  }

  if (ordersQuery.isError && orders.length === 0) {
    return (
      <Screen
        eyebrow="Deposito asignado"
        title={formatWarehouseLabel(user?.warehouse)}
        subtitle="No pudimos cargar la cola operativa del deposito."
      >
        {header}
        <ErrorState
          actionLabel="Reintentar"
          message={ordersQuery.error.message}
          onAction={() => {
            void ordersQuery.refetch()
          }}
          title="La lista quedo fuera de alcance"
        />
      </Screen>
    )
  }

  return (
    <Screen
      eyebrow="Deposito asignado"
      title={formatWarehouseLabel(user?.warehouse)}
      subtitle="Pedidos pendientes e iniciados listos para entrar al detalle desde una sola mano."
    >
      <FlashList
        contentContainerStyle={styles.listContent}
        data={orders}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyState
            title={debouncedSearch ? 'Sin coincidencias en este deposito' : 'No hay pedidos activos'}
            message={debouncedSearch ? 'Proba otro numero de pedido o nombre de cliente. La lista sigue lista para refrescar.' : 'Cuando entren pedidos pendientes o en curso apareceran aca sin cambiar de pantalla.'}
          />
        }
        ListFooterComponent={
          ordersQuery.isFetchingNextPage ? <LoadingBlock label="Cargando mas pedidos..." /> : <View style={styles.footerSpacer} />
        }
        ListHeaderComponent={header}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshControl={<RefreshControl onRefresh={() => void ordersQuery.refetch()} refreshing={isRefreshing} tintColor={colors.accent} />}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </Screen>
  )
}

function ItemSeparator() {
  return <View style={styles.separator} />
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  listHeader: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  banner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  bannerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  bannerCode: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
  },
  bannerTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xxl,
  },
  bannerText: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
  separator: {
    height: spacing.md,
  },
  footerSpacer: {
    height: spacing.sm,
  },
})
