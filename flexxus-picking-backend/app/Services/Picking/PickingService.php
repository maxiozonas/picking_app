<?php

namespace App\Services\Picking;

use App\Exceptions\Picking\InsufficientStockException;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\UnauthorizedOperationException;
use App\Models\PickingAlert;
use App\Models\PickingOrderEvent;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PickingService implements PickingServiceInterface
{
    private FlexxusPickingService $flexxusService;

    private StockValidationServiceInterface $stockValidationService;

    private StockCacheServiceInterface $stockCacheService;

    private WarehouseExecutionContextResolverInterface $warehouseContextResolver;

    public function __construct(
        FlexxusPickingService $flexxusService,
        StockValidationServiceInterface $stockValidationService,
        StockCacheServiceInterface $stockCacheService,
        WarehouseExecutionContextResolverInterface $warehouseContextResolver
    ) {
        $this->flexxusService = $flexxusService;
        $this->stockValidationService = $stockValidationService;
        $this->stockCacheService = $stockCacheService;
        $this->warehouseContextResolver = $warehouseContextResolver;
    }

    private function resolveWarehouseContext(int $userId, array $requestContext = []): WarehouseExecutionContext
    {
        return $this->warehouseContextResolver->resolveForUserId($userId, $requestContext);
    }

    private function resolveWarehouseModel(WarehouseExecutionContext $context): Warehouse
    {
        return Warehouse::findOrFail($context->warehouseId);
    }

    public function getAvailableOrders(int $userId, array $filters = [], array $requestContext = []): LengthAwarePaginator
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $warehouse = $this->resolveWarehouseModel($context);

        $today = now()->format('Y-m-d');

        $flexxusOrders = $this->flexxusService->getOrdersByDateAndWarehouse(
            $today,
            $warehouse
        );

        $orderNumbers = array_map(fn ($o) => OrderNumberParser::normalize('NP '.$o['NUMEROCOMPROBANTE']), $flexxusOrders);
        $localProgress = PickingOrderProgress::whereIn('order_number', $orderNumbers)
            ->where('warehouse_id', $context->warehouseId)
            ->with('user')
            ->get()
            ->keyBy('order_number');

        $mergedOrders = collect($flexxusOrders)->map(function ($flexxusOrder) use ($localProgress, $warehouse) {
            $rawOrderNumber = 'NP '.($flexxusOrder['NUMEROCOMPROBANTE'] ?? '');
            $orderNumber = OrderNumberParser::normalize($rawOrderNumber);
            $parsed = OrderNumberParser::parse($rawOrderNumber);
            $progress = $localProgress->get($orderNumber);

            return [
                'order_type' => $parsed['order_type'],
                'order_number' => $parsed['order_number'],
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
                'started_at' => $progress?->started_at?->toIso8601String() ?? '',
                'assigned_to' => $progress && $progress->user
                    ? [
                        'id' => $progress->user->id,
                        'name' => $progress->user->name,
                    ]
                    : [
                        'id' => null,
                        'name' => null,
                    ],
                'items_picked' => $progress
                    ? $progress->items()->where('status', 'completed')->count()
                    : 0,
            ];
        });

        $search = trim((string) ($filters['search'] ?? ''));
        if ($search !== '') {
            $searchNumber = preg_replace('/\D+/', '', $search) ?? '';

            $mergedOrders = $mergedOrders->filter(function (array $order) use ($search, $searchNumber) {
                $customer = mb_strtolower((string) ($order['customer'] ?? ''));
                $normalizedSearch = mb_strtolower($search);
                $orderNumber = (string) ($order['order_number'] ?? '');

                if ($searchNumber !== '' && str_contains($orderNumber, $searchNumber)) {
                    return true;
                }

                return str_contains($customer, $normalizedSearch);
            })->values();
        }

        if (isset($filters['status'])) {
            if ($filters['status'] === 'all') {
            } else {
                $mergedOrders = $mergedOrders->filter(fn ($o) => $o['status'] === $filters['status']);
            }
        } else {
            $mergedOrders = $mergedOrders->filter(fn ($o) => in_array($o['status'], ['pending', 'in_progress'])
            );
        }

        $perPage = max(1, min((int) ($filters['per_page'] ?? 20), 100));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $total = $mergedOrders->count();
        $pagedOrders = $mergedOrders->forPage($page, $perPage)->values();

        return new LengthAwarePaginator($pagedOrders, $total, $perPage, $page, ['path' => request()->path()]);
    }

    public function getOrderDetail(string $orderNumber, int $userId, array $requestContext = []): array
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $warehouse = $this->resolveWarehouseModel($context);

        $parsed = OrderNumberParser::parse($orderNumber);
        $canonicalOrderNumber = $parsed['canonical_key'];

        $flexxusOrder = $this->flexxusService->getOrderDetail($canonicalOrderNumber, $warehouse);

        if (! $flexxusOrder) {
            throw new OrderNotFoundException($orderNumber, ['source' => 'Flexxus']);
        }

        $progress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
            ->where('warehouse_id', $context->warehouseId)
            ->first();
        $itemsProgress = $progress ? $progress->items->keyBy('product_code') : collect();

        $items = [];
        $flexxusItems = $flexxusOrder['DETALLE'] ?? [];

        foreach ($flexxusItems as $item) {
            $productCode = $item['CODIGOPARTICULAR'] ?? '';
            $stockInfo = $this->flexxusService->getProductStock($productCode, $warehouse);
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

        $alerts = $progress
            ? $progress->alerts()
                ->where('warehouse_id', $context->warehouseId)
                ->with(['warehouse', 'reporter'])
                ->latest('created_at')
                ->get()
            : collect();

        $events = $progress ? $progress->events()
            ->where('warehouse_id', $context->warehouseId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'event_type' => $e->event_type,
                'product_code' => $e->product_code,
                'quantity' => $e->quantity,
                'message' => $e->message,
                'user' => $e->user_id ? ['id' => $e->user->id, 'name' => $e->user->name] : null,
                'created_at' => $e->created_at->toIso8601String(),
            ])->toArray() : [];

        $totalItems = count($items);
        $pickedItems = collect($items)->filter(fn ($i) => $i['status'] === 'completed')->count();
        $completedPercentage = $totalItems > 0 ? round(($pickedItems / $totalItems) * 100, 2) : 0;

        return [
            'order_type' => $parsed['order_type'],
            'order_number' => $parsed['order_number'],
            'customer_name' => $flexxusOrder['RAZONSOCIAL'] ?? 'Unknown',
            'warehouse' => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
            ],
            'total' => (float) ($flexxusOrder['TOTAL'] ?? 0),
            'status' => $progress ? $progress->status : 'pending',
            'started_at' => $progress?->started_at?->toIso8601String() ?? '',
            'completed_at' => $progress?->completed_at?->toIso8601String(),
            'assigned_to' => $progress ? [
                'id' => $progress->user->id,
                'name' => $progress->user->name,
            ] : [
                'id' => null,
                'name' => null,
            ],
            'total_items' => $totalItems,
            'picked_items' => $pickedItems,
            'completed_percentage' => $completedPercentage,
            'items' => $items,
            'alerts' => $alerts,
            'events' => $events,
        ];
    }

    public function startOrder(string $orderNumber, int $userId, array $requestContext = []): PickingOrderProgress
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $warehouse = $this->resolveWarehouseModel($context);

        $parsed = OrderNumberParser::parse($orderNumber);
        $canonicalOrderNumber = $parsed['canonical_key'];

        $flexxusOrders = $this->flexxusService->getOrdersByDateAndWarehouse(
            now()->format('Y-m-d'),
            $warehouse
        );

        $exists = collect($flexxusOrders)->contains(function ($o) use ($canonicalOrderNumber) {
            return 'NP '.$o['NUMEROCOMPROBANTE'] === $canonicalOrderNumber;
        });

        if (! $exists) {
            throw new OrderNotFoundException($orderNumber, ['source' => 'Flexxus', 'accessible' => false]);
        }

        $existingProgress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
            ->where('warehouse_id', $context->warehouseId)
            ->first();
        if ($existingProgress) {
            throw new InvalidOrderStateException($orderNumber, $existingProgress->status, 'start', ['existing_user_id' => $existingProgress->user_id]);
        }

        $progress = PickingOrderProgress::create([
            'order_type' => $parsed['order_type'],
            'order_number' => $canonicalOrderNumber,
            'user_id' => $context->userId,
            'warehouse_id' => $context->warehouseId,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $flexxusOrder = $this->flexxusService->getOrderDetail($canonicalOrderNumber, $warehouse);
        $flexxusItems = $flexxusOrder['DETALLE'] ?? [];

        // Persist customer name from Flexxus so admin can see it even without querying Flexxus
        $customer = $flexxusOrder['RAZONSOCIAL'] ?? null;
        if ($customer) {
            $progress->update(['customer' => $customer]);
        }

        foreach ($flexxusItems as $item) {
            $quantityRequired = (int) ($item['PENDIENTE'] ?? $item['CANTIDAD'] ?? 0);
            $productCode = $item['CODIGOPARTICULAR'] ?? '';

            $progress->items()->create([
                'order_number' => $canonicalOrderNumber,
                'product_code' => $productCode,
                'item_code' => $productCode,
                'description' => $item['DESCRIPCION'] ?? null,
                'location' => null, // populated later via stock prefetch
                'lot' => $item['LOTE'] ?? null,
                'quantity_required' => $quantityRequired,
                'quantity_requested' => $quantityRequired,
                'quantity_picked' => 0,
                'status' => 'pending',
            ]);
        }

        // Pre-fetch stock for all items in the order
        $this->stockCacheService->prefetchStockForOrder($progress);

        PickingOrderEvent::create([
            'order_number' => $canonicalOrderNumber,
            'warehouse_id' => $context->warehouseId,
            'user_id' => $context->userId,
            'event_type' => 'order_started',
            'message' => 'Pedido iniciado',
        ]);

        return $progress->load('items');
    }

    public function pickItem(string $orderNumber, string $productCode, int $quantity, int $userId, array $requestContext = []): array
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $user = User::findOrFail($context->userId);

        $canonicalOrderNumber = OrderNumberParser::normalize($orderNumber);

        // Phase 5: Validate stock OUTSIDE transaction (Flexxus call - avoid holding locks)
        $this->stockValidationService->validateStockForPick(
            $canonicalOrderNumber,
            $productCode,
            $quantity,
            $user
        );

        // Phase 5: Wrap DB updates in transaction for atomicity
        return DB::transaction(function () use ($canonicalOrderNumber, $productCode, $quantity, $userId, $context, $orderNumber) {
            $progress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
                ->where('warehouse_id', $context->warehouseId)
                ->lockForUpdate()
                ->first();

            if (! $progress) {
                throw new OrderNotFoundException($orderNumber, ['source' => 'local database']);
            }

            if ($progress->user_id !== $userId) {
                throw new UnauthorizedOperationException('pick items', 'Order belongs to a different user', [
                    'order_number' => $orderNumber,
                    'current_user_id' => $userId,
                    'owner_user_id' => $progress->user_id,
                ]);
            }

            if ($progress->status === 'completed') {
                throw new InvalidOrderStateException($orderNumber, $progress->status, 'pick items', [
                    'reason' => 'Cannot pick items from a completed order',
                ]);
            }

            $item = $progress->items()->where('product_code', $productCode)->first();

            if (! $item) {
                throw new OrderNotFoundException($productCode, [
                    'order_number' => $orderNumber,
                    'source' => 'local database',
                    'type' => 'item',
                ]);
            }

            $newQuantity = $item->quantity_picked + $quantity;

            if ($newQuantity > $item->quantity_required) {
                throw new InsufficientStockException($orderNumber, $productCode, $quantity, $item->quantity_required - $item->quantity_picked, [
                    'current_picked' => $item->quantity_picked,
                    'requested' => $quantity,
                    'required' => $item->quantity_required,
                ]);
            }

            $item->quantity_picked = $newQuantity;

            if ($item->quantity_picked >= $item->quantity_required) {
                $item->status = 'completed';
                $item->completed_at = now();
            } else {
                $item->status = 'in_progress';
            }

            $item->save();

            $eventType = $item->status === 'completed' ? 'item_completed' : 'item_picked';
            $eventMessage = $item->status === 'completed'
                ? "Item {$productCode} completado ({$item->quantity_picked}/{$item->quantity_required} unidades)"
                : "Pickeadas {$quantity} unidades de {$productCode} ({$item->quantity_picked}/{$item->quantity_required})";

            PickingOrderEvent::create([
                'order_number' => $canonicalOrderNumber,
                'warehouse_id' => $context->warehouseId,
                'user_id' => $userId,
                'event_type' => $eventType,
                'product_code' => $productCode,
                'quantity' => $quantity,
                'message' => $eventMessage,
            ]);

            $latestValidation = $this->stockValidationService->getLatestValidation($orderNumber, $productCode);

            $stockAfterPick = null;
            if ($latestValidation && $latestValidation->validation_result === 'passed') {
                $stockAfterPick = $latestValidation->available_qty - $item->quantity_picked;
            }

            $result = [
                'product_code' => $item->product_code,
                'quantity_required' => $item->quantity_required,
                'quantity_picked' => $item->quantity_picked,
                'status' => $item->status,
                'remaining' => $item->quantity_remaining,
                'stock_after_pick' => $stockAfterPick,
                'stock_validation' => $latestValidation ? [
                    'validated' => $latestValidation->validation_result === 'passed',
                    'available_qty' => $latestValidation->available_qty,
                    'validated_at' => $latestValidation->validated_at->toIso8601String(),
                    'error_code' => $latestValidation->error_code,
                ] : null,
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
        });
    }

    public function completeOrder(string $orderNumber, int $userId, array $requestContext = []): PickingOrderProgress
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $canonicalOrderNumber = OrderNumberParser::normalize($orderNumber);

        // Phase 5: Wrap DB updates in transaction for atomicity
        return DB::transaction(function () use ($canonicalOrderNumber, $userId, $context, $orderNumber) {
            $progress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
                ->where('warehouse_id', $context->warehouseId)
                ->lockForUpdate()
                ->first();

            if (! $progress) {
                throw new OrderNotFoundException($orderNumber, ['source' => 'local database']);
            }

            if ($progress->user_id !== $userId) {
                throw new UnauthorizedOperationException('complete order', 'Order belongs to a different user', [
                    'order_number' => $orderNumber,
                    'current_user_id' => $userId,
                    'owner_user_id' => $progress->user_id,
                ]);
            }

            if ($progress->status === 'completed') {
                throw new InvalidOrderStateException($orderNumber, $progress->status, 'complete', [
                    'reason' => 'Order is already completed',
                ]);
            }

            $incompleteItems = $progress->items()->where('status', '!=', 'completed')->get();

            if ($incompleteItems->count() > 0) {
                $missingItems = $incompleteItems->map(fn ($i) => [
                    'product_code' => $i->product_code,
                    'pending' => $i->quantity_remaining,
                ])->toArray();

                throw new InvalidOrderStateException($orderNumber, $progress->status, 'complete', [
                    'reason' => 'Cannot complete order with incomplete items',
                    'missing_items' => $missingItems,
                ]);
            }

            $progress->status = 'completed';
            $progress->completed_at = now();
            $progress->save();

            PickingOrderEvent::create([
                'order_number' => $canonicalOrderNumber,
                'warehouse_id' => $context->warehouseId,
                'user_id' => $userId,
                'event_type' => 'order_completed',
                'message' => 'Pedido completado',
            ]);

            return $progress->fresh();
        });
    }

    public function createAlert(array $data, int $userId, array $requestContext = []): PickingAlert
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $user = User::findOrFail($context->userId);

        $canonicalOrderNumber = OrderNumberParser::normalize($data['order_number']);

        $alert = PickingAlert::create([
            'order_number' => $canonicalOrderNumber,
            'warehouse_id' => $context->warehouseId,
            'user_id' => $context->userId,
            'alert_type' => $data['alert_type'],
            'product_code' => $data['product_code'] ?? null,
            'message' => $data['message'],
            'severity' => $data['severity'] ?? 'medium',
        ]);

        $progress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
            ->where('warehouse_id', $context->warehouseId)
            ->first();

        if ($progress) {
            $progress->has_stock_issues = true;
            $progress->issues_count++;
            $progress->save();
        }

        return $alert->load(['warehouse', 'reporter']);
    }

    public function getAlerts(array $filters = []): LengthAwarePaginator
    {
        $query = PickingAlert::with(['warehouse', 'reporter']);

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['status'])) {
            $isResolved = $filters['status'] === 'resolved';
            $query->where('is_resolved', $isResolved);
        }

        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (isset($filters['alert_type'])) {
            $query->where('alert_type', $filters['alert_type']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function resolveAlert(int $alertId, int $resolverId, string $notes, array $requestContext = []): PickingAlert
    {
        $alert = PickingAlert::findOrFail($alertId);

        $alert->is_resolved = true;
        $alert->resolved_at = now();
        $alert->resolved_by = $resolverId;
        $alert->resolution_notes = $notes ?: null;
        $alert->save();

        return $alert->load(['warehouse', 'reporter', 'resolver']);
    }

    public function getStockForItem(string $orderNumber, string $productCode, int $userId, array $requestContext = []): ?array
    {
        $context = $this->resolveWarehouseContext($userId, $requestContext);
        $warehouse = $this->resolveWarehouseModel($context);

        $canonicalOrderNumber = OrderNumberParser::normalize($orderNumber);

        $progress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
            ->where('warehouse_id', $context->warehouseId)
            ->first();

        if (! $progress) {
            return null;
        }

        $item = $progress->items()->where('product_code', $productCode)->first();

        if (! $item) {
            return null;
        }

        $stockInfo = $this->flexxusService->getProductStock($productCode, $warehouse);

        return [
            'item_code'          => $productCode,
            'available_quantity' => $stockInfo['available_quantity'] ?? 0,
            'location'           => $stockInfo['location'] ?? null,
            'last_updated'       => now()->toIso8601String(),
            'warehouse_id'       => $warehouse->id,
            'warehouse_code'     => $warehouse->code,
            'warehouse_name'     => $warehouse->name,
        ];
    }
}
