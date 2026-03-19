import { useEffect } from 'react'
import { usePendingOrders } from './use-pending-orders'
import { useWarehouseChannel } from './use-websocket'
import type { UsePendingOrdersParams } from './use-pending-orders'

/**
 * Live version of usePendingOrders with real-time WebSocket updates.
 *
 * This hook combines the data fetching from `usePendingOrders` with real-time
 * WebSocket subscriptions via `useWarehouseChannel`. When orders are started,
 * completed, or updated on the server, the query cache is automatically
 * invalidated and the data refetches.
 *
 * @param params - Same parameters as usePendingOrders
 * @returns Object containing:
 *   - All return values from usePendingOrders (data, isLoading, error, etc.)
 *   - WebSocket connection state (isConnected, lastEvent)
 *
 * @example
 * ```tsx
 * function PendingOrdersList() {
 *   const { data, isLoading, isConnected } = usePendingOrdersLive({
 *     status: 'pending',
 *     page: 1
 *   })
 *
 *   return (
 *     <div>
 *       <div className="flex items-center gap-2">
 *         <h2>Pending Orders</h2>
 *         {isConnected && <span className="badge badge-success">Live</span>}
 *       </div>
 *       {isLoading ? <Spinner /> : <OrderList orders={data?.data} />}
 *     </div>
 *   )
 * }
 * ```
 *
 * @remarks
 * - **Auto-refetch:** Orders automatically refresh when WebSocket events arrive
 * - **Connection indicator:** Returns `isConnected` for UI status display
 * - **Event tracking:** Returns `lastEvent` for debugging or custom notifications
 * - **Fallback:** If warehouseId is null, behaves like regular usePendingOrders
 */
export function usePendingOrdersLive(params: UsePendingOrdersParams = {}) {
  // Get the warehouse ID from params to subscribe to the correct channel
  // Note: warehouseId comes from useWarehouseFilterStore inside usePendingOrders
  // We need to access it to pass to useWarehouseChannel

  // Import and use the store
  const { useWarehouseFilterStore } = require('@/contexts/WarehouseFilterContext')
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  // Subscribe to WebSocket events for this warehouse
  const websocketState = useWarehouseChannel(selectedWarehouseId)

  // Fetch orders via HTTP (will auto-refetch when WebSocket events invalidate cache)
  const queryResult = usePendingOrders(params)

  return {
    ...queryResult,
    isConnected: websocketState.isConnected,
    lastEvent: websocketState.lastEvent,
  }
}
