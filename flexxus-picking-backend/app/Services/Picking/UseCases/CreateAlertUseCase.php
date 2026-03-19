<?php

namespace App\Services\Picking\UseCases;

use App\Events\Broadcasting\StockAlertBroadcastEvent;
use App\Models\PickingAlert;
use App\Models\PickingOrderProgress;
use App\Services\Broadcasting\BroadcastingService;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;

final class CreateAlertUseCase
{
    public function __construct(
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver,
        private readonly BroadcastingService $broadcaster
    ) {}

    public function execute(array $data, int $userId, PickingRequestContext $requestContext): PickingAlert
    {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
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

        $this->broadcaster->dispatch(new StockAlertBroadcastEvent(
            alertType: $data['alert_type'],
            message: $data['message'],
            warehouseId: $context->warehouseId,
            userId: $context->userId,
            severity: $data['severity'] ?? 'medium',
            productCode: $data['product_code'] ?? null,
            orderNumber: $canonicalOrderNumber,
        ));

        return $alert->load(['warehouse', 'reporter']);
    }
}
