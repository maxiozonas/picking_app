<?php

namespace App\Services\Picking;

use App\Models\PickingAlert;
use App\Models\PickingOrderProgress;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class PickingService implements PickingServiceInterface
{
    private FlexxusPickingService $flexxusService;

    public function __construct(FlexxusPickingService $flexxusService)
    {
        $this->flexxusService = $flexxusService;
    }

    public function getAvailableOrders(int $userId, array $filters = []): LengthAwarePaginator
    {
        $user = User::with('warehouse')->findOrFail($userId);
        $warehouse = $user->warehouse;

        if (! $warehouse) {
            throw new \Exception('User does not have a warehouse assigned');
        }

        $today = now()->format('Y-m-d');

        $flexxusOrders = $this->flexxusService->getOrdersByDateAndWarehouse(
            $today,
            $warehouse->name
        );

        $orderNumbers = array_map(fn ($o) => 'NP '.$o['NUMEROCOMPROBANTE'], $flexxusOrders);
        $localProgress = PickingOrderProgress::whereIn('order_number', $orderNumbers)
            ->with('user')
            ->get()
            ->keyBy('order_number');

        $mergedOrders = collect($flexxusOrders)->map(function ($flexxusOrder) use ($localProgress, $warehouse) {
            $orderNumber = 'NP '.($flexxusOrder['NUMEROCOMPROBANTE'] ?? '');
            $progress = $localProgress->get($orderNumber);

            return [
                'order_number' => $orderNumber,
                'customer' => $flexxusOrder['RAZONSOCIAL'] ?? 'Unknown',
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

        if (isset($filters['status'])) {
            if ($filters['status'] === 'all') {
            } else {
                $mergedOrders = $mergedOrders->filter(fn ($o) => $o['status'] === $filters['status']);
            }
        } else {
            $mergedOrders = $mergedOrders->filter(fn ($o) => in_array($o['status'], ['pending', 'in_progress'])
            );
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;
        $total = $mergedOrders->count();
        $pagedOrders = $mergedOrders->forPage($page, $perPage)->values();

        return new LengthAwarePaginator($pagedOrders, $total, $perPage, $page, ['path' => request()->path()]);
    }

    public function getOrderDetail(string $orderNumber, int $userId): array
    {
        $user = User::with('warehouse')->findOrFail($userId);
        $warehouse = $user->warehouse;

        $flexxusOrder = $this->flexxusService->getOrderDetail($orderNumber);

        if (! $flexxusOrder) {
            throw new \Exception("Order {$orderNumber} not found in Flexxus");
        }

        $progress = PickingOrderProgress::where('order_number', $orderNumber)->first();
        $itemsProgress = $progress ? $progress->items->keyBy('product_code') : collect();

        $items = [];
        $flexxusItems = $flexxusOrder['DETALLE'] ?? [];

        foreach ($flexxusItems as $item) {
            $productCode = $item['CODIGOPARTICULAR'] ?? '';
            $stockInfo = $this->flexxusService->getProductStock($productCode, $warehouse->name);
            $itemProgress = $itemsProgress->get($productCode);

            $formattedItem = $this->flexxusService->formatOrderItem($item, $stockInfo);

            if ($itemProgress) {
                $formattedItem['quantity_picked'] = $itemProgress->quantity_picked;
                $formattedItem['status'] = $itemProgress->status;
            } else {
                $formattedItem['quantity_picked'] = 0;
                $formattedItem['status'] = 'pending';
            }

            $items[] = $formattedItem;
        }

        $alerts = $progress ? $progress->alerts->map(fn ($a) => [
            'id' => $a->id,
            'type' => $a->alert_type,
            'message' => $a->message,
            'severity' => $a->severity,
        ])->toArray() : [];

        return [
            'order_number' => $orderNumber,
            'customer' => $flexxusOrder['RAZONSOCIAL'] ?? 'Unknown',
            'warehouse' => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
            ],
            'total' => (float) ($flexxusOrder['TOTAL'] ?? 0),
            'status' => $progress ? $progress->status : 'pending',
            'started_at' => $progress?->started_at?->toIso8601String(),
            'completed_at' => $progress?->completed_at?->toIso8601String(),
            'assigned_to' => $progress ? [
                'id' => $progress->user->id,
                'name' => $progress->user->name,
            ] : null,
            'items' => $items,
            'alerts' => $alerts,
        ];
    }

    public function startOrder(string $orderNumber, int $userId): PickingOrderProgress
    {
        $user = User::with('warehouse')->findOrFail($userId);
        $warehouse = $user->warehouse;

        $flexxusOrders = $this->flexxusService->getOrdersByDateAndWarehouse(
            now()->format('Y-m-d'),
            $warehouse->name
        );

        $exists = collect($flexxusOrders)->contains(function ($o) use ($orderNumber) {
            return 'NP '.$o['NUMEROCOMPROBANTE'] === $orderNumber;
        });

        if (! $exists) {
            throw new \Exception("Order {$orderNumber} not found or not accessible");
        }

        $progress = PickingOrderProgress::create([
            'order_number' => $orderNumber,
            'user_id' => $userId,
            'warehouse_id' => $warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $flexxusOrder = $this->flexxusService->getOrderDetail($orderNumber);
        $flexxusItems = $flexxusOrder['DETALLE'] ?? [];

        foreach ($flexxusItems as $item) {
            $progress->items()->create([
                'product_code' => $item['CODIGOPARTICULAR'] ?? '',
                'quantity_required' => (int) ($item['PENDIENTE'] ?? $item['CANTIDAD'] ?? 0),
                'quantity_picked' => 0,
                'status' => 'pending',
            ]);
        }

        return $progress->load('items');
    }

    public function pickItem(string $orderNumber, string $productCode, int $quantity, int $userId): array
    {
        $progress = PickingOrderProgress::where('order_number', $orderNumber)->first();

        if (! $progress) {
            throw new \Exception("Order {$orderNumber} not found");
        }

        if ($progress->user_id !== $userId) {
            throw new \Exception("You don't have permission to modify this order");
        }

        $item = $progress->items()->where('product_code', $productCode)->first();

        if (! $item) {
            throw new \Exception("Item {$productCode} not found in order");
        }

        $newQuantity = $item->quantity_picked + $quantity;

        if ($newQuantity > $item->quantity_required) {
            throw new \Exception('Cannot pick more than required quantity');
        }

        $item->quantity_picked = $newQuantity;

        if ($item->quantity_picked >= $item->quantity_required) {
            $item->status = 'completed';
            $item->completed_at = now();
        } else {
            $item->status = 'in_progress';
        }

        $item->save();

        $result = [
            'product_code' => $item->product_code,
            'quantity_required' => $item->quantity_required,
            'quantity_picked' => $item->quantity_picked,
            'status' => $item->status,
            'remaining' => $item->quantity_remaining,
        ];

        if ($item->status === 'completed') {
            $result['message'] = 'Item completado';
        }

        $allItems = $progress->items()->get();
        $allCompleted = $allItems->every(fn ($i) => $i->status === 'completed');

        if ($allCompleted) {
            $result['order_ready_to_complete'] = true;
            $result['message'] = '¡Todos los items completados! Puedes completar el pedido.';
        }

        return $result;
    }

    public function completeOrder(string $orderNumber, int $userId): PickingOrderProgress
    {
        $progress = PickingOrderProgress::where('order_number', $orderNumber)->first();

        if (! $progress) {
            throw new \Exception("Order {$orderNumber} not found");
        }

        if ($progress->user_id !== $userId) {
            throw new \Exception("You don't have permission to modify this order");
        }

        $incompleteItems = $progress->items()->where('status', '!=', 'completed')->get();

        if ($incompleteItems->count() > 0) {
            $missingItems = $incompleteItems->map(fn ($i) => [
                'product_code' => $i->product_code,
                'pending' => $i->quantity_remaining,
            ])->toArray();

            throw new \Exception('Cannot complete order with incomplete items. Missing: ' . implode(', ', array_column($missingItems, 'product_code')));
        }

        $progress->status = 'completed';
        $progress->completed_at = now();
        $progress->save();

        return $progress->fresh();
    }

    public function createAlert(array $data, int $userId): PickingAlert
    {
        $user = User::findOrFail($userId);

        $alert = PickingAlert::create([
            'order_number' => $data['order_number'],
            'warehouse_id' => $user->warehouse_id,
            'user_id' => $userId,
            'alert_type' => $data['alert_type'],
            'product_code' => $data['product_code'] ?? null,
            'message' => $data['message'],
            'severity' => $data['severity'] ?? 'medium',
        ]);

        $progress = PickingOrderProgress::where('order_number', $data['order_number'])->first();

        if ($progress) {
            $progress->has_stock_issues = true;
            $progress->issues_count++;
            $progress->save();
        }

        return $alert;
    }

    public function getAlerts(array $filters = []): LengthAwarePaginator
    {
        $query = PickingAlert::with(['warehouse', 'reporter']);

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['resolved'])) {
            $query->where('is_resolved', filter_var($filters['resolved'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function resolveAlert(int $alertId, int $resolverId, string $notes): PickingAlert
    {
        $alert = PickingAlert::findOrFail($alertId);

        $alert->is_resolved = true;
        $alert->resolved_at = now();
        $alert->resolved_by = $resolverId;
        $alert->save();

        return $alert->load(['warehouse', 'reporter', 'resolver']);
    }
}
