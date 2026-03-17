<?php

namespace App\Services\Picking\UseCases;

use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\UnauthorizedOperationException;
use App\Models\PickingOrderEvent;
use App\Models\PickingOrderProgress;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;
use Illuminate\Support\Facades\DB;

final class CompleteOrderUseCase
{
    public function __construct(
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver
    ) {}

    public function execute(string $orderNumber, int $userId, PickingRequestContext $requestContext): PickingOrderProgress
    {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
        $canonicalOrderNumber = OrderNumberParser::normalize($orderNumber);
        $shouldManageTransaction = DB::transactionLevel() === 0;

        $callback = function () use ($canonicalOrderNumber, $userId, $context, $orderNumber) {
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
        };

        if ($shouldManageTransaction) {
            return DB::transaction($callback);
        }

        return $callback();
    }
}
