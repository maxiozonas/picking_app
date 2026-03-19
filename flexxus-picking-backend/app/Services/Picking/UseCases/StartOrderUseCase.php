<?php

namespace App\Services\Picking\UseCases;

use App\Events\Broadcasting\OrderStartedBroadcastEvent;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Models\PickingOrderEvent;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Broadcasting\BroadcastingService;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;

final class StartOrderUseCase
{
    public function __construct(
        private readonly FlexxusOrderServiceInterface $orderService,
        private readonly StockCacheServiceInterface $stockCacheService,
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver,
        private readonly BroadcastingService $broadcaster
    ) {}

    public function execute(string $orderNumber, int $userId, PickingRequestContext $requestContext): PickingOrderProgress
    {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
        $warehouse = Warehouse::findOrFail($context->warehouseId);

        $parsed = OrderNumberParser::parse($orderNumber);
        $canonicalOrderNumber = $parsed['canonical_key'];

        $flexxusOrders = $this->orderService->getOrdersByDateAndWarehouse(
            now()->format('Y-m-d'),
            $warehouse
        );

        $exists = collect($flexxusOrders)->contains(function ($o) use ($canonicalOrderNumber) {
            return 'NP '.($o['NUMEROCOMPROBANTE'] ?? '') === $canonicalOrderNumber;
        });

        if (! $exists) {
            throw new OrderNotFoundException($orderNumber, ['source' => 'Flexxus', 'accessible' => false]);
        }

        $existingProgress = PickingOrderProgress::where('order_number', $canonicalOrderNumber)
            ->where('warehouse_id', $context->warehouseId)
            ->first();
        if ($existingProgress) {
            throw new InvalidOrderStateException(
                $orderNumber,
                $existingProgress->status,
                'start',
                ['existing_user_id' => $existingProgress->user_id]
            );
        }

        $progress = PickingOrderProgress::create([
            'order_type' => $parsed['order_type'],
            'order_number' => $canonicalOrderNumber,
            'user_id' => $context->userId,
            'warehouse_id' => $context->warehouseId,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $flexxusOrder = $this->orderService->getOrderDetail($canonicalOrderNumber, $warehouse);
        $flexxusItems = $flexxusOrder['DETALLE'] ?? [];

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
                'location' => null,
                'lot' => $item['LOTE'] ?? null,
                'quantity_required' => $quantityRequired,
                'quantity_requested' => $quantityRequired,
                'quantity_picked' => 0,
                'status' => 'pending',
            ]);
        }

        $this->stockCacheService->prefetchStockForOrder($progress);

        PickingOrderEvent::create([
            'order_number' => $canonicalOrderNumber,
            'warehouse_id' => $context->warehouseId,
            'user_id' => $context->userId,
            'event_type' => 'order_started',
            'message' => 'Pedido iniciado',
        ]);

        $user = User::findOrFail($context->userId);

        $this->broadcaster->dispatch(new OrderStartedBroadcastEvent(
            orderNumber: $canonicalOrderNumber,
            warehouseId: $context->warehouseId,
            userId: $context->userId,
            userName: $user->name,
            message: 'Pedido iniciado',
        ));

        return $progress->load('items');
    }
}
