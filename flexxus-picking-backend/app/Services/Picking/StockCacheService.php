<?php

namespace App\Services\Picking;

use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

/**
 * Stock Cache Service
 *
 * Implements aggressive caching strategy for Flexxus stock data.
 * Uses PickingStockValidation models as cache entries with 60s TTL.
 */
class StockCacheService implements StockCacheServiceInterface
{
    private const CACHE_TTL_SECONDS = 45;

    private FlexxusPickingService $flexxusService;

    public function __construct(FlexxusPickingService $flexxusService)
    {
        $this->flexxusService = $flexxusService;
    }

    /**
     * {@inheritdoc}
     */
    public function prefetchStockForOrder(PickingOrderProgress $order): EloquentCollection
    {
        $validations = new EloquentCollection;

        // Get all items for the order
        $items = PickingItemProgress::where('picking_order_progress_id', $order->id)
            ->get();

        foreach ($items as $item) {
            // Fetch stock from Flexxus
            $stockInfo = $this->flexxusService->getProductStock(
                $item->item_code,
                $order->warehouse
            );

            $availableQty = $stockInfo['total'] ?? 0;

            // Create validation record as cache entry
            $validation = PickingStockValidation::create([
                'order_number' => $order->order_number,
                'item_code' => $item->item_code,
                'validation_type' => 'prefetch',
                'requested_qty' => 0, // Not applicable for prefetch
                'available_qty' => $availableQty,
                'validation_result' => 'passed',
                'error_code' => null,
                'stock_snapshot' => [
                    'flexxus_available' => $availableQty,
                    'warehouse' => $order->warehouse->code,
                    'is_local' => $stockInfo['is_local'] ?? false,
                ],
                'context' => null,
                'validated_at' => now(),
                'user_id' => $order->user_id,
                'warehouse_id' => $order->warehouse_id,
            ]);

            $validations->push($validation);
        }

        return $validations;
    }

    /**
     * {@inheritdoc}
     */
    public function getCachedStock(string $orderNumber, string $itemCode): ?PickingStockValidation
    {
        $validation = PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', $itemCode)
            ->where('validation_type', 'prefetch')
            ->orderBy('validated_at', 'desc')
            ->first();

        // Check if validation exists and is within TTL
        if ($validation === null) {
            return null;
        }

        // Check if expired
        if ($validation->validated_at->lt(now()->subSeconds(self::CACHE_TTL_SECONDS))) {
            return null;
        }

        return $validation;
    }
}
