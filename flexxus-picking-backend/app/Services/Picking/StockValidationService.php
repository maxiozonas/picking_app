<?php

namespace App\Services\Picking;

use App\Exceptions\Picking\AlreadyPickedException;
use App\Exceptions\Picking\OverPickException;
use App\Exceptions\Picking\PhysicalStockInsufficientException;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Models\User;
use App\Services\Picking\Interfaces\AlertServiceInterface;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Stock Validation Service
 *
 * Implements real-time stock validation during picking operations.
 * Validates against local order state and Flexxus physical stock.
 */
class StockValidationService implements StockValidationServiceInterface
{
    private const DEFAULT_VALIDATION_TTL_SECONDS = 60;

    private FlexxusPickingService $flexxusService;

    private AlertServiceInterface $alertService;

    public function __construct(
        FlexxusPickingService $flexxusService,
        AlertServiceInterface $alertService
    ) {
        $this->flexxusService = $flexxusService;
        $this->alertService = $alertService;
    }

    /**
     * {@inheritdoc}
     */
    public function validateStockForPick(string $orderNumber, string $itemCode, int $requestedQty, User $user): PickingStockValidation
    {
        // Step 1: Load order and item progress
        $order = PickingOrderProgress::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $item = PickingItemProgress::where('picking_order_progress_id', $order->id)
            ->where('product_code', $itemCode)
            ->firstOrFail();

        // Step 2: Check if already fully picked (before over-pick check)
        if ($item->is_completed) {
            throw new AlreadyPickedException(
                $orderNumber,
                $itemCode,
                $item->quantity_picked,
                $item->completed_at,
                [
                    'user_id' => $user->id,
                    'warehouse_id' => $order->warehouse_id,
                ]
            );
        }

        // Step 3: Check for over-pick (local validation)
        $requestedTotal = $item->quantity_requested ?? $item->quantity_required;
        $remainingQty = $requestedTotal - $item->quantity_picked;

        if ($requestedQty > $remainingQty) {
            // Log validation failure
            Log::channel('picking_validations')->error('validation_failed', [
                'order_number' => $orderNumber,
                'item_code' => $itemCode,
                'requested_qty' => $requestedQty,
                'remaining_qty' => $remainingQty,
                'error_type' => 'over_pick_attempt',
                'user_id' => $user->id,
                'warehouse_id' => $order->warehouse_id,
            ]);

            // Create alert before throwing exception
            $this->alertService->createValidationAlert(
                $orderNumber,
                $itemCode,
                'over_pick_attempt',
                [
                    'warehouse_id' => $order->warehouse_id,
                    'requested' => $requestedQty,
                    'remaining' => $remainingQty,
                    'current_picked' => $item->quantity_picked,
                ],
                $user->id
            );

            throw new OverPickException(
                $orderNumber,
                $itemCode,
                $requestedQty,
                $remainingQty,
                [
                    'user_id' => $user->id,
                    'warehouse_id' => $order->warehouse_id,
                    'current_picked' => $item->quantity_picked,
                    'requested_total' => $requestedTotal,
                    'remaining' => $remainingQty,
                ]
            );
        }

        // Step 4: Check Flexxus stock
        $flexxusStock = $this->getFlexxusStock($itemCode, $order->warehouse);
        if ($flexxusStock < $requestedQty) {
            // Log validation failure
            Log::channel('picking_validations')->error('validation_failed', [
                'order_number' => $orderNumber,
                'item_code' => $itemCode,
                'requested_qty' => $requestedQty,
                'available_qty' => $flexxusStock,
                'error_type' => 'physical_stock_insufficient',
                'user_id' => $user->id,
                'warehouse_id' => $order->warehouse_id,
            ]);

            // Create alert before throwing exception
            $this->alertService->createValidationAlert(
                $orderNumber,
                $itemCode,
                'stock_insufficient',
                [
                    'warehouse_id' => $order->warehouse_id,
                    'requested' => $requestedQty,
                    'available' => $flexxusStock,
                ],
                $user->id
            );

            throw new PhysicalStockInsufficientException(
                $orderNumber,
                $itemCode,
                $requestedQty,
                $flexxusStock,
                [
                    'user_id' => $user->id,
                    'warehouse_id' => $order->warehouse_id,
                ]
            );
        }

        // Step 5: Create and return validation record
        $validation = PickingStockValidation::create([
            'order_number' => $orderNumber,
            'item_code' => $itemCode,
            'validation_type' => 'physical_stock',
            'requested_qty' => $requestedQty,
            'available_qty' => $flexxusStock,
            'validation_result' => 'passed',
            'error_code' => null,
            'stock_snapshot' => [
                'local_picked' => $item->quantity_picked,
                'local_requested' => $item->quantity_requested,
                'flexxus_available' => $flexxusStock,
            ],
            'validated_at' => now(),
            'user_id' => $user->id,
            'warehouse_id' => $order->warehouse_id,
        ]);

        // Log validation success
        Log::channel('picking_validations')->info('validation_success', [
            'order_number' => $orderNumber,
            'item_code' => $itemCode,
            'requested_qty' => $requestedQty,
            'available_qty' => $flexxusStock,
            'result' => 'passed',
            'validation_id' => $validation->id,
            'user_id' => $user->id,
            'warehouse_id' => $order->warehouse_id,
        ]);

        return $validation;

        return PickingStockValidation::create([
            'order_number' => $orderNumber,
            'item_code' => $itemCode,
            'validation_type' => 'physical_stock',
            'requested_qty' => $requestedQty,
            'available_qty' => $flexxusStock,
            'validation_result' => 'passed',
            'error_code' => null,
            'stock_snapshot' => [
                'local_picked' => $item->quantity_picked,
                'local_requested' => $item->quantity_requested,
                'flexxus_available' => $flexxusStock,
            ],
            'validated_at' => now(),
            'user_id' => $user->id,
            'warehouse_id' => $order->warehouse_id,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function prefetchStockForOrder(PickingOrderProgress $order): Collection
    {
        // TODO: Implement pre-fetch in Phase 3 (Performance)
        return collect();
    }

    /**
     * {@inheritdoc}
     */
    public function getLatestValidation(string $orderNumber, string $itemCode): ?PickingStockValidation
    {
        return PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', $itemCode)
            ->orderBy('validated_at', 'desc')
            ->first();
    }

    /**
     * {@inheritdoc}
     */
    public function isValidationValid(PickingStockValidation $validation): bool
    {
        $ttl = config('picking.stock_validation_ttl', self::DEFAULT_VALIDATION_TTL_SECONDS);

        return $validation->validated_at->gt(now()->subSeconds($ttl));
    }

    /**
     * Get Flexxus stock for an item
     *
     * @param  string  $itemCode  Item code
     * @param  \App\Models\Warehouse  $warehouse  Warehouse model
     * @return int Available stock quantity
     */
    private function getFlexxusStock(string $itemCode, \App\Models\Warehouse $warehouse): int
    {
        $stockInfo = $this->flexxusService->getProductStock($itemCode, $warehouse);

        if ($stockInfo === null) {
            // If no stock info found, assume 0 available
            return 0;
        }

        return $stockInfo['total'] ?? 0;
    }

    /**
     * {@inheritdoc}
     */
    public function getOrderValidations(string $orderNumber): Collection
    {
        return PickingStockValidation::where('order_number', $orderNumber)
            ->orderBy('validated_at', 'desc')
            ->get();
    }
}
