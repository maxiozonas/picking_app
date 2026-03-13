<?php

namespace App\Services\Picking;

use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
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

    private FlexxusProductServiceInterface $productService;

    public function __construct(FlexxusProductServiceInterface $productService)
    {
        $this->productService = $productService;
    }

    /**
     * {@inheritdoc}
     *
     * Uses batch stock fetch via Http::pool() for parallel Flexxus calls.
     */
    public function prefetchStockForOrder(PickingOrderProgress $order): EloquentCollection
    {
        $validations = new EloquentCollection;

        $items = PickingItemProgress::where('picking_order_progress_id', $order->id)->get();

        if ($items->isEmpty()) {
            return $validations;
        }

        $productCodes = $items->pluck('item_code')->unique()->values()->all();

        // Batch fetch all stock in parallel
        $batchStock = $this->productService->getProductStockBatch($productCodes, $order->warehouse);

        foreach ($items as $item) {
            $stockInfo = $batchStock[$item->item_code] ?? null;
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
        if ($validation->validated_at->lt(now()->subSeconds(config('picking.stock_cache_ttl', self::CACHE_TTL_SECONDS)))) {
            return null;
        }

        return $validation;
    }
}
