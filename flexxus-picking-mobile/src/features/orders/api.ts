import { apiClient } from '../../lib/api/client'
import type { OrderWarehouseSummary, OrdersPagination, PendingOrder, PendingOrdersQueryParams, PendingOrdersResponse, PendingOrdersTransport } from './types'

export function mapWarehouse(warehouse: PendingOrdersTransport['data'][number]['warehouse']): OrderWarehouseSummary | null {
  if (!warehouse) {
    return null
  }

  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
  }
}

export function mapPendingOrder(order: PendingOrdersTransport['data'][number]): PendingOrder {
  return {
    orderType: order.order_type,
    orderNumber: order.order_number,
    customer: order.customer,
    status: order.status,
    assignedTo: {
      id: order.assigned_to?.id ?? null,
      name: order.assigned_to?.name ?? null,
    },
    itemsCount: order.items_count,
    itemsPicked: order.items_picked,
    createdAt: order.created_at,
    startedAt: order.started_at,
    warehouse: mapWarehouse(order.warehouse),
    total: order.total,
    deliveryType: order.delivery_type,
  }
}

function mapPagination(meta: PendingOrdersTransport['meta']): OrdersPagination {
  return {
    currentPage: meta.current_page,
    lastPage: meta.last_page,
    perPage: meta.per_page,
    total: meta.total,
  }
}

export async function getPendingOrders(params: PendingOrdersQueryParams): Promise<PendingOrdersResponse> {
  const response = await apiClient.get<PendingOrdersTransport>('/picking/orders', {
    params: {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      force_refresh: params.forceRefresh ? 1 : undefined,
    },
  })

  return {
    data: response.data.data.map(mapPendingOrder),
    meta: mapPagination(response.data.meta),
  }
}

export async function refreshPendingOrdersSnapshot(params: Omit<PendingOrdersQueryParams, 'forceRefresh'>): Promise<void> {
  await apiClient.post('/picking/orders/refresh', {
    page: params.page,
    per_page: params.perPage,
    search: params.search || undefined,
  })
}
