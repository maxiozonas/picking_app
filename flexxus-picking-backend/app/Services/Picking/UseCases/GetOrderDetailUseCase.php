<?php

namespace App\Services\Picking\UseCases;

use App\Exceptions\Picking\OrderNotFoundException;
use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\FlexxusDataFormatter;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;

final class GetOrderDetailUseCase
{
    public function __construct(
        private readonly FlexxusOrderServiceInterface $orderService,
        private readonly FlexxusProductServiceInterface $productService,
        private readonly FlexxusDataFormatter $formatter,
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver
    ) {}

    public function execute(string $orderNumber, int $userId, PickingRequestContext $requestContext): array
    {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
        $warehouse = Warehouse::findOrFail($context->warehouseId);

        $parsed = OrderNumberParser::parse($orderNumber);
        $canonicalOrderNumber = $parsed['canonical_key'];

        $flexxusOrder = $this->orderService->getOrderDetail($canonicalOrderNumber, $warehouse);

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
            $stockInfo = $this->productService->getProductStock($productCode, $warehouse);
            $itemProgress = $itemsProgress->get($productCode);

            $formattedItem = $this->formatter->formatOrderItem($item, $stockInfo);

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
}
