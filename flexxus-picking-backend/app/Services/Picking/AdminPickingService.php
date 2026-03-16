<?php

namespace App\Services\Picking;

use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdminPickingService implements AdminPickingServiceInterface
{
    private const CACHE_TTL_SECONDS = 120; // 2 minutes

    public function __construct(
        private FlexxusClientFactoryInterface $clientFactory
    ) {}

    public function getPendingOrders(array $filters = []): LengthAwarePaginator
    {
        if (empty($filters['warehouse_id'])) {
            throw new \InvalidArgumentException('warehouse_id is required');
        }

        $warehouses = $this->resolveWarehouses($filters);
        $date = $filters['date_from'] ?? now()->format('Y-m-d');

        $allOrders = collect();
        foreach ($warehouses as $warehouse) {
            $cacheKey = $this->buildCacheKey($date, $warehouse);

            $flexxusOrders = Cache::remember($cacheKey, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)), function () use ($date, $warehouse) {
                return $this->fetchFlexxusOrders($date, $warehouse);
            });

            $allOrders = $allOrders->merge(
                $this->buildOrdersForWarehouse(collect($flexxusOrders), $warehouse)
            );
        }

        return $this->paginateOrders($allOrders, $filters);
    }

    public function refreshPendingOrders(array $filters = []): LengthAwarePaginator
    {
        if (empty($filters['warehouse_id'])) {
            throw new \InvalidArgumentException('warehouse_id is required');
        }

        $warehouses = $this->resolveWarehouses($filters);
        $date = $filters['date_from'] ?? now()->format('Y-m-d');

        $allOrders = collect();
        foreach ($warehouses as $warehouse) {
            $cacheKey = $this->buildCacheKey($date, $warehouse);
            Cache::forget($cacheKey);

            $flexxusOrders = $this->fetchFlexxusOrders($date, $warehouse);
            Cache::put($cacheKey, $flexxusOrders, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)));

            $allOrders = $allOrders->merge(
                $this->buildOrdersForWarehouse(collect($flexxusOrders), $warehouse)
            );
        }

        return $this->paginateOrders($allOrders, $filters);
    }

    public function getPendingCounts(array $filters = []): array
    {
        // TODO: Implement in next phase
        return [
            'total' => 0,
            'by_warehouse' => [],
        ];
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Return a single warehouse (from warehouse_id filter) or all active warehouses.
     *
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

    /**
     * Fetch raw orders for one warehouse from Flexxus, filtered by DEPOSITO field.
     * Returns [] on any failure so that one warehouse outage does not break the others.
     */
    private function fetchFlexxusOrders(string $date, Warehouse $warehouse): array
    {
        try {
            $client = $this->clientFactory->createForWarehouse($warehouse);

            $response = $client->request('GET', '/v2/orders', [
                'date_from' => $date,
                'date_to' => $date,
                'warehouse' => $warehouse->code,
            ]);

            $allOrders = $response['data'] ?? [];

            // Filter by DEPOSITO to ensure each warehouse only shows its own orders.
            // Flexxus may return all orders regardless of the warehouse param.
            return array_values(array_filter($allOrders, function ($order) use ($warehouse) {
                $deposito = trim((string) ($order['DEPOSITO'] ?? ''));

                // Match against warehouse name (case-insensitive) or code
                return strcasecmp($deposito, trim($warehouse->name)) === 0
                    || strcasecmp($deposito, trim($warehouse->code)) === 0;
            }));
        } catch (\Throwable $e) {
            Log::warning('AdminPickingService: failed to fetch orders from Flexxus', [
                'warehouse' => $warehouse->code,
                'date' => $date,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Fetch the full detail of a single order from Flexxus, trying all active warehouses.
     * Returns null if no warehouse can provide the order.
     */
    public function getPendingOrderDetail(string $orderNumber): ?array
    {
        $normalized = OrderNumberParser::normalize($orderNumber);
        $numericOnly = OrderNumberParser::extractNumeric($normalized);

        $warehouses = Warehouse::where('is_active', true)->get();

        foreach ($warehouses as $warehouse) {
            try {
                $client = $this->clientFactory->createForWarehouse($warehouse);
                $response = $client->request('GET', "/v2/orders/NP/{$numericOnly}");
                $data = $response['data'] ?? null;

                if (empty($data)) {
                    continue;
                }

                // Map Flexxus response to the same shape as AdminOrderItemResource
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
                    'order_number' => $normalized,
                    'customer' => $data['RAZONSOCIAL'] ?? null,
                    'status' => 'pending',
                    'warehouse' => [
                        'id' => $warehouse->id,
                        'code' => $warehouse->code,
                        'name' => $warehouse->name,
                    ],
                    'assigned_to' => null,
                    'total_items' => count($items),
                    'picked_items' => 0,
                    'completed_percentage' => 0.0,
                    'started_at' => null,
                    'completed_at' => null,
                    'created_at' => $data['FECHACOMPROBANTE'] ?? null,
                    'items' => $items,
                    'alerts' => [],
                ];
            } catch (\Throwable $e) {
                Log::warning('AdminPickingService: failed to fetch order detail from Flexxus', [
                    'order_number' => $normalized,
                    'warehouse' => $warehouse->code,
                    'error' => $e->getMessage(),
                ]);

                continue;
            }
        }

        return null;
    }

    /**
     * Merge a collection of raw Flexxus orders with local picking progress for a warehouse.
     */
    private function buildOrdersForWarehouse(
        \Illuminate\Support\Collection $flexxusOrders,
        Warehouse $warehouse
    ): \Illuminate\Support\Collection {
        $orderNumbers = $flexxusOrders->map(fn ($o) => 'NP '.($o['NUMEROCOMPROBANTE'] ?? ''));
        $orderNumbersNormalized = $orderNumbers->map(fn ($o) => OrderNumberParser::normalize($o));

        $localProgress = PickingOrderProgress::whereIn('order_number', $orderNumbersNormalized)
            ->where('warehouse_id', $warehouse->id)
            ->with('user')
            ->get()
            ->keyBy('order_number');

        return $this->mergeWithLocalProgress($flexxusOrders, $localProgress, $warehouse);
    }

    private function mergeWithLocalProgress(
        \Illuminate\Support\Collection $flexxusOrders,
        \Illuminate\Support\Collection $localProgress,
        Warehouse $warehouse
    ): \Illuminate\Support\Collection {
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
                'created_at' => $flexxusOrder['FECHACOMPROBANTE'] ?? now()->toIso8601String(),
                'delivery_type' => 'EXPEDICION',
                'items_count' => 0,
                'status' => $progress ? $progress->status : 'pending',
                'started_at' => $progress?->started_at?->toIso8601String(),
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

    /**
     * Apply status / search filters then paginate.
     */
    private function paginateOrders(\Illuminate\Support\Collection $orders, array $filters): LengthAwarePaginator
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

    private function applyFilters(\Illuminate\Support\Collection $orders, array $filters): \Illuminate\Support\Collection
    {
        // Status filter — no status param (or 'all') means show everything
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $orders = $orders->filter(fn ($o) => $o['status'] === $filters['status']);
        }

        // Search filter — matches order_number or customer name
        if (! empty($filters['search'])) {
            $searchTerm = strtolower($filters['search']);
            $orders = $orders->filter(function ($o) use ($searchTerm) {
                return str_contains(strtolower($o['order_number']), $searchTerm)
                    || str_contains(strtolower($o['customer'] ?? ''), $searchTerm);
            });
        }

        return $orders;
    }

    /**
     * Get unique product codes from pending Flexxus orders.
     * Fetches order details for each pending order and extracts DETALLE items.
     */
    public function getPendingOrderItems(array $filters = []): \Illuminate\Support\Collection
    {
        $warehouses = $this->resolveWarehouses($filters);
        $date = $filters['date_from'] ?? now()->format('Y-m-d');

        $allItems = collect();

        foreach ($warehouses as $warehouse) {
            $cacheKey = $this->buildCacheKey($date, $warehouse);

            $flexxusOrders = Cache::remember($cacheKey, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)), function () use ($date, $warehouse) {
                return $this->fetchFlexxusOrders($date, $warehouse);
            });

            foreach ($flexxusOrders as $order) {
                $orderNumber = $order['NUMEROCOMPROBANTE'] ?? null;
                if (! $orderNumber) {
                    continue;
                }

                try {
                    $client = $this->clientFactory->createForWarehouse($warehouse);
                    $detailCacheKey = "flexxus_order_detail_pending_{$orderNumber}_".$this->warehouseScope($warehouse);

                    $detail = Cache::remember($detailCacheKey, now()->addSeconds(config('picking.admin_orders_cache_ttl', self::CACHE_TTL_SECONDS)), function () use ($client, $orderNumber) {
                        $response = $client->request('GET', "/v2/orders/NP/{$orderNumber}");

                        return $response['data'] ?? null;
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

        // Return unique product codes with their descriptions
        return $allItems->unique('product_code')->values();
    }
}
