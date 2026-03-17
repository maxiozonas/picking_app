<?php

namespace App\Services\Picking;

use App\Models\FlexxusOrderSnapshot;
use App\Models\FlexxusSyncState;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FlexxusOrderSnapshotService
{
    public function __construct(
        private readonly FlexxusOrderServiceInterface $orderService
    ) {}

    public function syncForWarehouse(Warehouse $warehouse, string $date, bool $forceRefresh = false): Collection
    {
        $lock = Cache::lock($this->lockKey($warehouse, $date), 120);

        if (! $lock->get()) {
            return $this->getSnapshotsForWarehouse($warehouse, $date);
        }

        try {
            $this->markSyncAttempt($warehouse, $date);

            $orders = $forceRefresh
                ? $this->orderService->getOrdersByDateAndWarehouse($date, $warehouse, true)
                : $this->orderService->getOrdersByDateAndWarehouse($date, $warehouse);
            $rows = collect($orders)
                ->map(fn (array $order) => $this->buildSnapshotRow($warehouse, $date, $order))
                ->filter(fn (array $row) => $row['order_number'] !== null)
                ->values();

            DB::transaction(function () use ($warehouse, $date, $rows) {
                $baseQuery = FlexxusOrderSnapshot::query()
                    ->where('warehouse_id', $warehouse->id)
                    ->whereDate('snapshot_date', $date);

                $orderNumbers = $rows->pluck('order_number')->all();

                if (empty($orderNumbers)) {
                    $baseQuery->delete();
                } else {
                    $baseQuery->whereNotIn('order_number', $orderNumbers)->delete();

                    FlexxusOrderSnapshot::upsert(
                        $rows->all(),
                        ['warehouse_id', 'snapshot_date', 'order_number'],
                        [
                            'order_type',
                            'customer',
                            'total',
                            'delivery_type',
                            'flexxus_created_at',
                            'payload',
                            'synced_at',
                            'updated_at',
                        ]
                    );
                }
            });

            $this->markSyncSuccess($warehouse, $date);
        } catch (\Throwable $e) {
            $this->markSyncError($warehouse, $date, $e);
            throw $e;
        } finally {
            $lock->release();
        }

        return $this->getSnapshotsForWarehouse($warehouse, $date);
    }

    public function syncActiveWarehouses(?string $date = null, bool $forceRefresh = false): void
    {
        $targetDate = $date ?? now()->format('Y-m-d');
        $warehouses = Warehouse::query()->where('is_active', true)->get();

        foreach ($warehouses as $warehouse) {
            try {
                $this->syncForWarehouse($warehouse, $targetDate, $forceRefresh);
            } catch (\Throwable $e) {
                Log::warning('FlexxusOrderSnapshotService: sync failed for warehouse', [
                    'warehouse_id' => $warehouse->id,
                    'warehouse_code' => $warehouse->code,
                    'date' => $targetDate,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function getSnapshotsForWarehouse(Warehouse $warehouse, string $date): Collection
    {
        return FlexxusOrderSnapshot::query()
            ->where('warehouse_id', $warehouse->id)
            ->whereDate('snapshot_date', $date)
            ->orderBy('id')
            ->get();
    }

    public function ensureSnapshotsForWarehouse(Warehouse $warehouse, string $date): Collection
    {
        $snapshots = $this->getSnapshotsForWarehouse($warehouse, $date);

        if ($snapshots->isNotEmpty()) {
            return $snapshots;
        }

        $state = $this->latestStateForWarehouse($warehouse);
        if ($state && $state->snapshot_date?->toDateString() === $date && $state->status === 'fresh') {
            return collect();
        }

        return $this->syncForWarehouse($warehouse, $date, false);
    }

    public function latestStateForWarehouse(Warehouse $warehouse): ?FlexxusSyncState
    {
        return FlexxusSyncState::query()
            ->where('warehouse_id', $warehouse->id)
            ->latest('updated_at')
            ->first();
    }

    private function lockKey(Warehouse $warehouse, string $date): string
    {
        return "flexxus:sync:orders:{$warehouse->id}:{$date}";
    }

    private function buildSnapshotRow(Warehouse $warehouse, string $date, array $order): array
    {
        $rawOrderNumber = trim((string) ($order['NUMEROCOMPROBANTE'] ?? ''));
        $normalized = $rawOrderNumber === '' ? null : OrderNumberParser::normalize('NP '.$rawOrderNumber);

        return [
            'warehouse_id' => $warehouse->id,
            'snapshot_date' => $date,
            'order_number' => $normalized,
            'order_type' => 'NP',
            'customer' => $order['RAZONSOCIAL'] ?? null,
            'total' => (float) ($order['TOTAL'] ?? 0),
            'delivery_type' => $order['delivery_type'] ?? null,
            'flexxus_created_at' => $this->parseFlexxusCreatedAt($order['FECHACOMPROBANTE'] ?? null),
            'payload' => json_encode($order, JSON_UNESCAPED_UNICODE),
            'synced_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function parseFlexxusCreatedAt(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateTimeString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function markSyncAttempt(Warehouse $warehouse, string $date): void
    {
        FlexxusSyncState::query()->updateOrCreate(
            ['warehouse_id' => $warehouse->id],
            [
                'snapshot_date' => $date,
                'status' => 'syncing',
                'last_attempt_at' => now(),
                'last_error' => null,
            ]
        );
    }

    private function markSyncSuccess(Warehouse $warehouse, string $date): void
    {
        FlexxusSyncState::query()->updateOrCreate(
            ['warehouse_id' => $warehouse->id],
            [
                'snapshot_date' => $date,
                'status' => 'fresh',
                'last_success_at' => now(),
                'last_error' => null,
            ]
        );
    }

    private function markSyncError(Warehouse $warehouse, string $date, \Throwable $e): void
    {
        FlexxusSyncState::query()->updateOrCreate(
            ['warehouse_id' => $warehouse->id],
            [
                'snapshot_date' => $date,
                'status' => 'error',
                'last_error' => $e->getMessage(),
            ]
        );
    }
}
