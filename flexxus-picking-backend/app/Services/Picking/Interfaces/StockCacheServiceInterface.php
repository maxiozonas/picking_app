<?php

namespace App\Services\Picking\Interfaces;

use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use Illuminate\Database\Eloquent\Collection;

/**
 * Stock Cache Service Interface
 *
 * Defines contract for caching Flexxus stock data using PickingStockValidation models.
 * Implements aggressive caching strategy with 45s TTL to reduce API calls.
 */
interface StockCacheServiceInterface
{
    /**
     * Pre-fetch and cache stock for all items in an order
     *
     * Creates PickingStockValidation records with type 'prefetch' for all items.
     * These records serve as cached stock data that can be reused within the TTL.
     *
     * @param  PickingOrderProgress  $order  Order to cache stock for
     * @return Collection<PickingStockValidation> Validation records for all items
     */
    public function prefetchStockForOrder(PickingOrderProgress $order): Collection;

    /**
     * Get cached stock validation if still fresh
     *
     * Retrieves the most recent prefetch validation record for the given item
     * if it exists and is within the TTL (60 seconds).
     *
     * @param  string  $orderNumber  Order number
     * @param  string  $itemCode  Item code
     * @return PickingStockValidation|null Cached validation or null if expired/not found
     */
    public function getCachedStock(string $orderNumber, string $itemCode): ?PickingStockValidation;
}
