<?php

namespace App\Services\Picking;

use App\Models\PickingAlert;
use App\Models\PickingOrderProgress;
use App\Services\Picking\DTO\AvailableOrdersFilters;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\UseCases\CompleteOrderUseCase;
use App\Services\Picking\UseCases\CreateAlertUseCase;
use App\Services\Picking\UseCases\GetAlertsUseCase;
use App\Services\Picking\UseCases\GetOrderDetailUseCase;
use App\Services\Picking\UseCases\GetStockForItemUseCase;
use App\Services\Picking\UseCases\ListAvailableOrdersUseCase;
use App\Services\Picking\UseCases\PickItemUseCase;
use App\Services\Picking\UseCases\ResolveAlertUseCase;
use App\Services\Picking\UseCases\StartOrderUseCase;
use App\Services\Broadcasting\BroadcastingService;
use Illuminate\Pagination\LengthAwarePaginator;

class PickingService implements PickingServiceInterface
{
    private ListAvailableOrdersUseCase $listAvailableOrdersUseCase;

    private GetOrderDetailUseCase $getOrderDetailUseCase;

    private StartOrderUseCase $startOrderUseCase;

    private PickItemUseCase $pickItemUseCase;

    private CompleteOrderUseCase $completeOrderUseCase;

    private CreateAlertUseCase $createAlertUseCase;

    private GetAlertsUseCase $getAlertsUseCase;

    private ResolveAlertUseCase $resolveAlertUseCase;

    private GetStockForItemUseCase $getStockForItemUseCase;

    public function __construct(
        FlexxusOrderServiceInterface $orderService,
        FlexxusProductServiceInterface $productService,
        FlexxusDataFormatter $formatter,
        StockValidationServiceInterface $stockValidationService,
        StockCacheServiceInterface $stockCacheService,
        WarehouseExecutionContextResolverInterface $warehouseContextResolver,
        BroadcastingService $broadcaster,
        ?FlexxusOrderSnapshotService $snapshotService = null
    ) {
        $snapshotService ??= new FlexxusOrderSnapshotService($orderService);

        $this->listAvailableOrdersUseCase = new ListAvailableOrdersUseCase(
            $snapshotService,
            $warehouseContextResolver
        );
        $this->getOrderDetailUseCase = new GetOrderDetailUseCase(
            $orderService,
            $productService,
            $formatter,
            $warehouseContextResolver
        );
        $this->startOrderUseCase = new StartOrderUseCase(
            $orderService,
            $stockCacheService,
            $warehouseContextResolver,
            $broadcaster
        );
        $this->pickItemUseCase = new PickItemUseCase(
            $stockValidationService,
            $warehouseContextResolver,
            $broadcaster
        );
        $this->completeOrderUseCase = new CompleteOrderUseCase($warehouseContextResolver, $broadcaster);
        $this->createAlertUseCase = new CreateAlertUseCase($warehouseContextResolver, $broadcaster);
        $this->getAlertsUseCase = new GetAlertsUseCase;
        $this->resolveAlertUseCase = new ResolveAlertUseCase;
        $this->getStockForItemUseCase = new GetStockForItemUseCase(
            $productService,
            $warehouseContextResolver
        );
    }

    public function getAvailableOrders(int $userId, array $filters = [], array $requestContext = []): LengthAwarePaginator
    {
        return $this->listAvailableOrdersUseCase->execute(
            $userId,
            AvailableOrdersFilters::fromArray($filters),
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function getOrderDetail(string $orderNumber, int $userId, array $requestContext = []): array
    {
        return $this->getOrderDetailUseCase->execute(
            $orderNumber,
            $userId,
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function startOrder(string $orderNumber, int $userId, array $requestContext = []): PickingOrderProgress
    {
        return $this->startOrderUseCase->execute(
            $orderNumber,
            $userId,
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function pickItem(string $orderNumber, string $productCode, int $quantity, int $userId, array $requestContext = []): array
    {
        return $this->pickItemUseCase->execute(
            $orderNumber,
            $productCode,
            $quantity,
            $userId,
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function completeOrder(string $orderNumber, int $userId, array $requestContext = []): PickingOrderProgress
    {
        return $this->completeOrderUseCase->execute(
            $orderNumber,
            $userId,
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function createAlert(array $data, int $userId, array $requestContext = []): PickingAlert
    {
        return $this->createAlertUseCase->execute(
            $data,
            $userId,
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function getAlerts(array $filters = []): LengthAwarePaginator
    {
        return $this->getAlertsUseCase->execute($filters);
    }

    public function resolveAlert(int $alertId, int $resolverId, string $notes, array $requestContext = []): PickingAlert
    {
        return $this->resolveAlertUseCase->execute(
            $alertId,
            $resolverId,
            $notes,
            PickingRequestContext::fromArray($requestContext)
        );
    }

    public function getStockForItem(string $orderNumber, string $productCode, int $userId, array $requestContext = []): ?array
    {
        return $this->getStockForItemUseCase->execute(
            $orderNumber,
            $productCode,
            $userId,
            PickingRequestContext::fromArray($requestContext)
        );
    }
}
