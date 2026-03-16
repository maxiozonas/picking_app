<?php

namespace App\Services\Picking;

use App\Http\Resources\Admin\AdminOrderItemResource;
use App\Http\Resources\PickingAlertResource;
use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdminPickingService implements AdminPickingServiceInterface
{
    private const CACHE_TTL_SECONDS = 120; // 2 minutes

    public function __construct(
        private FlexxusOrderServiceInterface $orderService
    ) {}

    public function getPendingOrders(array $filters = []): LengthAwarePaginator
    {
        $warehouses = $this->resolveWarehouses($filters);
        $date = $filters['date_from'] ?? now()->format('Y-m-d');

        $allOrders = collect();
        foreach ($warehouses as $warehouse) {
            $cacheKey = $this->buildCacheKey($date, $warehouse);

            $flexxusOrders = Cache::remember($cacheKey, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)), function () use ($date, $warehouse) {
                return $this->orderService->getOrdersByDateAndWarehouse($date, $warehouse);
            });

            $allOrders = $allOrders->merge(
                $this->buildOrdersForWarehouse(collect($flexxusOrders), $warehouse)
            );
        }

        return $this->paginateOrders($allOrders, $filters);
    }

    public function refreshPendingOrders(array $filters = []): LengthAwarePaginator
    {
        $warehouses = $this->resolveWarehouses($filters);
        $date = $filters['date_from'] ?? now()->format('Y-m-d');

        $allOrders = collect();
        foreach ($warehouses as $warehouse) {
            $cacheKey = $this->buildCacheKey($date, $warehouse);
            Cache::forget($cacheKey);

            $flexxusOrders = $this->orderService->getOrdersByDateAndWarehouse($date, $warehouse, true);
            Cache::put($cacheKey, $flexxusOrders, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)));

            $allOrders = $allOrders->merge(
                $this->buildOrdersForWarehouse(collect($flexxusOrders), $warehouse)
            );
        }

        return $this->paginateOrders($allOrders, $filters);
    }

    public function getPendingCounts(array $filters = []): array
    {
        return [
            'total' => 0,
            'by_warehouse' => [],
        ];
    }

    public function getPendingOrderDetail(string $orderNumber): ?array
    {
        return $this->getOrderDetailData($orderNumber);
    }

    public function getOrderDetailData(string $orderNumber, ?PickingOrderProgress $progress = null): ?array
    {
        $normalized = OrderNumberParser::normalize($orderNumber);
        $warehouses = $progress?->warehouse
            ? collect([$progress->warehouse])
            : Warehouse::where('is_active', true)->get();

        foreach ($warehouses as $warehouse) {
            try {
                $detail = $this->orderService->getOrderDetail($normalized, $warehouse);
                if (empty($detail)) {
                    continue;
                }

                $metadata = $this->orderService->getOrderDeliveryMetadata($normalized, $warehouse) ?? [];

                if ($progress) {
                    return $this->buildProgressDetail($progress, $warehouse, $detail, $metadata);
                }

                return $this->buildFlexxusDetail($normalized, $warehouse, $detail, $metadata);
            } catch (\Throwable $e) {
                Log::warning('AdminPickingService: failed to fetch order detail from Flexxus', [
                    'order_number' => $normalized,
                    'warehouse' => $warehouse->code,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($progress) {
            return $this->buildProgressDetail($progress, $progress->warehouse, [], []);
        }

        return null;
    }

    /**
     * @return Warehouse[]
     */
    private function resolveWarehouses(array $filters): array
    {
        if (! empty($filters['warehouse_id'])) {
            return [Warehouse::findOrFail($filters['warehouse_id'])];
        }

        return Warehouse::where('is_active', true)->get()->all();
    }

    private function buildCacheKey(string $date, Warehouse $warehouse): string
    {
        $scope = $this->warehouseScope($warehouse);

        return "flexxus_orders_pending_{$date}_{$scope}";
    }

    private function warehouseScope(Warehouse $warehouse): string
    {
        return $warehouse->id.'_'.trim($warehouse->code);
    }

    private function buildOrdersForWarehouse(Collection $flexxusOrders, Warehouse $warehouse): Collection
    {
        $orderNumbers = $flexxusOrders->map(fn ($o) => 'NP '.($o['NUMEROCOMPROBANTE'] ?? ''));
        $orderNumbersNormalized = $orderNumbers->map(fn ($o) => OrderNumberParser::normalize($o));

        $localProgress = PickingOrderProgress::whereIn('order_number', $orderNumbersNormalized)
            ->where('warehouse_id', $warehouse->id)
            ->with('user')
            ->get()
            ->keyBy('order_number');

        return $this->mergeWithLocalProgress($flexxusOrders, $localProgress, $warehouse);
    }

    private function mergeWithLocalProgress(Collection $flexxusOrders, Collection $localProgress, Warehouse $warehouse): Collection
    {
        return $flexxusOrders->map(function ($flexxusOrder) use ($localProgress, $warehouse) {
            $rawOrderNumber = 'NP '.($flexxusOrder['NUMEROCOMPROBANTE'] ?? '');
            $orderNumber = OrderNumberParser::normalize($rawOrderNumber);
            $parsed = OrderNumberParser::parse($rawOrderNumber);
            $progress = $localProgress->get($orderNumber);

            return [
                'order_type' => $parsed['order_type'],
                'order_number' => $parsed['canonical_key'],
                'customer' => $flexxusOrder['RAZONSOCIAL'] ?? null,
                'warehouse' => [
                    'id' => $warehouse->id,
                    'code' => $warehouse->code,
                    'name' => $warehouse->name,
                ],
                'total' => (float) ($flexxusOrder['TOTAL'] ?? 0),
                'delivery_type' => $flexxusOrder['delivery_type'] ?? null,
                'flexxus_created_at' => $flexxusOrder['FECHACOMPROBANTE'] ?? null,
                'items_count' => 0,
                'status' => $progress ? $progress->status : 'pending',
                'started_at' => $progress?->started_at?->toIso8601String(),
                'completed_at' => $progress?->completed_at?->toIso8601String(),
                'assigned_to' => $progress && $progress->user
                    ? [
                        'id' => $progress->user->id,
                        'name' => $progress->user->name,
                    ]
                    : null,
                'items_picked' => $progress
                    ? $progress->items()->where('status', 'completed')->count()
                    : 0,
            ];
        });
    }

    private function paginateOrders(Collection $orders, array $filters): LengthAwarePaginator
    {
        $filtered = $this->applyFilters($orders, $filters);

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;
        $total = $filtered->count();
        $pagedOrders = $filtered->forPage($page, $perPage)->values();

        return new LengthAwarePaginator($pagedOrders, $total, $perPage, $page, [
            'path' => request()->path(),
        ]);
    }

    private function applyFilters(Collection $orders, array $filters): Collection
    {
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $orders = $orders->filter(fn ($o) => $o['status'] === $filters['status']);
        }

        if (! empty($filters['search'])) {
            $searchTerm = strtolower($filters['search']);
            $orders = $orders->filter(function ($o) use ($searchTerm) {
                return str_contains(strtolower($o['order_number']), $searchTerm)
                    || str_contains(strtolower($o['customer'] ?? ''), $searchTerm);
            });
        }

        return $orders;
    }

    public function getPendingOrderItems(array $filters = []): Collection
    {
        $warehouses = $this->resolveWarehouses($filters);
        $date = $filters['date_from'] ?? now()->format('Y-m-d');

        $allItems = collect();

        foreach ($warehouses as $warehouse) {
            $cacheKey = $this->buildCacheKey($date, $warehouse);

            $flexxusOrders = Cache::remember($cacheKey, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)), function () use ($date, $warehouse) {
                return $this->orderService->getOrdersByDateAndWarehouse($date, $warehouse);
            });

            foreach ($flexxusOrders as $order) {
                $orderNumber = $order['NUMEROCOMPROBANTE'] ?? null;
                if (! $orderNumber) {
                    continue;
                }

                try {
                    $detailCacheKey = "flexxus_order_detail_pending_{$orderNumber}_".$this->warehouseScope($warehouse);

                    $detail = Cache::remember($detailCacheKey, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)), function () use ($orderNumber, $warehouse) {
                        return $this->orderService->getOrderDetail('NP '.$orderNumber, $warehouse);
                    });

                    if (! $detail || empty($detail['DETALLE'])) {
                        continue;
                    }

                    foreach ($detail['DETALLE'] as $line) {
                        $productCode = $line['CODIGOPARTICULAR'] ?? '';
                        if ($productCode !== '') {
                            $allItems->push([
                                'product_code' => $productCode,
                                'description' => $line['DESCRIPCION'] ?? '',
                                'warehouse_id' => $warehouse->id,
                            ]);
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning('AdminPickingService: failed to fetch order detail for inventory', [
                        'order_number' => $orderNumber,
                        'warehouse' => $warehouse->code,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return $allItems->unique('product_code')->values();
    }

    private function buildFlexxusDetail(string $normalized, Warehouse $warehouse, array $data, array $metadata): array
    {
        $items = array_values(array_map(function ($line, $idx) {
            return [
                'id' => $idx + 1,
                'product_code' => $line['CODIGOPARTICULAR'] ?? '',
                'description' => $line['DESCRIPCION'] ?? '',
                'quantity' => (int) ($line['PENDIENTE'] ?? $line['CANTIDAD'] ?? 0),
                'picked_quantity' => 0,
                'lot' => $line['LOTE'] ?? null,
                'location' => null,
                'status' => 'pending',
            ];
        }, $data['DETALLE'] ?? [], array_keys($data['DETALLE'] ?? [])));

        return [
            'id' => null,
            'order_number' => $normalized,
            'customer' => $data['RAZONSOCIAL'] ?? null,
            'status' => 'pending',
            'warehouse' => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
            ],
            'assigned_to' => null,
            'delivery_type' => $metadata['delivery_type'] ?? null,
            'flexxus_created_at' => $data['FECHACOMPROBANTE'] ?? null,
            'total_items' => count($items),
            'picked_items' => 0,
            'completed_percentage' => 0.0,
            'started_at' => null,
            'completed_at' => null,
            'items' => $items,
            'alerts' => [],
            'events' => [],
        ];
    }

    private function buildProgressDetail(PickingOrderProgress $progress, ?Warehouse $warehouse, array $data, array $metadata): array
    {
        return [
            'id' => $progress->id,
            'order_number' => $progress->order_number,
            'customer' => $progress->customer ?? ($data['RAZONSOCIAL'] ?? null),
            'status' => $progress->status,
            'warehouse' => [
                'id' => $warehouse?->id,
                'code' => $warehouse?->code,
                'name' => $warehouse?->name,
            ],
            'assigned_to' => $progress->user
                ? [
                    'id' => $progress->user->id,
                    'name' => $progress->user->name,
                ]
                : null,
            'delivery_type' => $metadata['delivery_type'] ?? null,
            'flexxus_created_at' => $data['FECHACOMPROBANTE'] ?? null,
            'total_items' => $progress->items_count ?? $progress->items->count(),
            'picked_items' => $progress->items->where('status', 'completed')->count(),
            'completed_percentage' => $progress->completed_percentage,
            'started_at' => $progress->started_at?->toIso8601String(),
            'completed_at' => $progress->completed_at?->toIso8601String(),
            'items' => AdminOrderItemResource::collection($progress->items ?? collect())->resolve(),
            'alerts' => PickingAlertResource::collection($progress->alerts ?? collect())->resolve(),
            'events' => ($progress->events ?? collect())->map(fn ($e) => [
                'id' => $e->id,
                'event_type' => $e->event_type,
                'product_code' => $e->product_code,
                'quantity' => $e->quantity,
                'message' => $e->message,
                'user' => $e->relationLoaded('user')
                    ? ['id' => $e->user?->id, 'name' => $e->user?->name]
                    : null,
                'created_at' => $e->created_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }
}
