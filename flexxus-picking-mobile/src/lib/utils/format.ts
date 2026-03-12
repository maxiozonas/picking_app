export function formatWarehouseLabel(warehouse?: { code?: string | null; name?: string | null } | null): string {
  if (!warehouse) {
    return 'Deposito sin asignar'
  }

  if (warehouse.code && warehouse.name) {
    return `${warehouse.code} - ${warehouse.name}`
  }

  return warehouse.name ?? warehouse.code ?? 'Deposito sin asignar'
}

export function formatOrderCode(orderType?: string | null, orderNumber?: string | null): string {
  if (!orderNumber) {
    return '--'
  }

  return orderType ? `${orderType} ${orderNumber}` : orderNumber
}

export function formatPercentage(value?: number | null): string {
  const safe = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return `${Math.round(safe)}%`
}

export function formatPendingProgress(itemsPicked = 0, itemsCount = 0): string {
  if (itemsCount <= 0) {
    return 'Sin items informados'
  }

  return `${itemsPicked}/${itemsCount} items completos`
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Sin registro'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}
