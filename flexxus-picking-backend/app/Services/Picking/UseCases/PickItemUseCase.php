<?php

namespace App\Services\Picking\UseCases;

use App\Exceptions\Picking\InsufficientStockException;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\UnauthorizedOperationException;
use App\Models\PickingOrderEvent;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;
use Illuminate\Support\Facades\DB;

final class PickItemUseCase
{
    public function __construct(
        private readonly StockValidationServiceInterface $stockValidationService,
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver
    ) {}

    public function execute(
        string $orderNumber,
        string $productCode,
        int $quantity,
        int $userId,
        PickingRequestContext $requestContext
    ): array {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
        $user = User::findOrFail($context->userId);

        $canonicalOrderNumber = OrderNumberParser::normalize($orderNumber);

        $this->stockValidationService->validateStockForPick(
            $canonicalOrderNumber,
            $productCode,
            $quantity,
            $user
        );

        $shouldManageTransaction = DB::transactionLevel() === 0;

        $callback = function () use ($canonicalOrderNumber, $productCode, $quantity, $userId, $context, $orderNumber) {
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
                throw new InsufficientStockException(
                    $orderNumber,
                    $productCode,
                    $quantity,
                    $item->quantity_required - $item->quantity_picked,
                    [
                        'current_picked' => $item->quantity_picked,
                        'requested' => $quantity,
                        'required' => $item->quantity_required,
                    ]
                );
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
                $result['message'] = 'Todos los items completados. Puedes completar el pedido.';
            }

            return $result;
        };

        if ($shouldManageTransaction) {
            return DB::transaction($callback);
        }

        return $callback();
    }
}
