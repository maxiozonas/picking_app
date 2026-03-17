<?php

namespace App\Services\Picking\UseCases;

use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;

final class GetStockForItemUseCase
{
    public function __construct(
        private readonly FlexxusProductServiceInterface $productService,
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver
    ) {}

    public function execute(
        string $orderNumber,
        string $productCode,
        int $userId,
        PickingRequestContext $requestContext
    ): ?array {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
        $warehouse = Warehouse::findOrFail($context->warehouseId);
        try {
            $canonicalOrderNumber = OrderNumberParser::normalize($orderNumber);
        } catch (\InvalidArgumentException) {
            $canonicalOrderNumber = $orderNumber;
        }

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

        $stockInfo = $this->productService->getProductStock($productCode, $warehouse);

        if ($stockInfo === null) {
            throw new ExternalApiConnectionException("/v2/products/{$productCode}", null, [
                'order_number' => $canonicalOrderNumber,
                'warehouse_id' => $warehouse->id,
                'warehouse_code' => $warehouse->code,
                'product_code' => $productCode,
                'source' => 'get_stock_for_item',
            ]);
        }

        return [
            'item_code' => $productCode,
            'available_quantity' => (int) ($stockInfo['total'] ?? 0),
            'location' => $stockInfo['location'] ?? null,
            'last_updated' => now()->toIso8601String(),
            'warehouse_id' => $warehouse->id,
            'warehouse_code' => $warehouse->code,
            'warehouse_name' => $warehouse->name,
        ];
    }
}
