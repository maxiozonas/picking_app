<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\ResolvesWarehouseRequestContext;
use App\Http\Requests\Picking\CompleteOrderRequest;
use App\Http\Requests\Picking\CreateAlertRequest;
use App\Http\Requests\Picking\PickItemRequest;
use App\Http\Requests\Picking\ResolveAlertRequest;
use App\Http\Requests\Picking\StartOrderRequest;
use App\Http\Resources\PickingAlertResource;
use App\Http\Resources\PickingOrderCollection;
use App\Http\Resources\PickingOrderDetailResource;
use App\Http\Resources\PickingOrderResource;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PickingController extends Controller
{
    use ResolvesWarehouseRequestContext;

    public function __construct(
        private PickingServiceInterface $pickingService
    ) {}

    public function index(Request $request): PickingOrderCollection
    {
        $filters = array_filter([
            'status' => $request->input('status'),
            'search' => $request->input('search'),
            'page' => $request->integer('page') ?: null,
            'per_page' => $request->integer('per_page') ?: null,
        ], fn ($value) => $value !== null && $value !== '');
        $requestContext = $this->warehouseRequestContext($request);

        $orders = $this->pickingService->getAvailableOrders(
            $request->user()->id,
            $filters,
            $requestContext
        );

        return new PickingOrderCollection($orders);
    }

    public function show(string $orderNumber, Request $request): PickingOrderDetailResource
    {
        $requestContext = $this->warehouseRequestContext($request);

        $order = $this->pickingService->getOrderDetail(
            $orderNumber,
            $request->user()->id,
            $requestContext
        );

        return new PickingOrderDetailResource($order);
    }

    public function start(string $orderNumber, StartOrderRequest $request): PickingOrderResource
    {
        $requestContext = $this->warehouseRequestContext($request);

        $progress = $this->pickingService->startOrder(
            $orderNumber,
            $request->user()->id,
            $requestContext
        );

        return new PickingOrderResource($progress);
    }

    public function pickItem(string $orderNumber, string $productCode, PickItemRequest $request): JsonResponse
    {
        $requestContext = $this->warehouseRequestContext($request);

        $result = $this->pickingService->pickItem(
            $orderNumber,
            $productCode,
            $request->validated('quantity'),
            $request->user()->id,
            $requestContext
        );

        return response()->json([
            'data' => $result,
        ]);
    }

    public function complete(string $orderNumber, CompleteOrderRequest $request): PickingOrderResource
    {
        $requestContext = $this->warehouseRequestContext($request);

        $progress = $this->pickingService->completeOrder(
            $orderNumber,
            $request->user()->id,
            $requestContext
        );

        return new PickingOrderResource($progress);
    }

    public function createAlert(string $orderNumber, CreateAlertRequest $request): JsonResponse
    {
        $requestContext = $this->warehouseRequestContext($request);

        $data = array_merge($request->validated(), [
            'order_number' => $orderNumber,
        ]);

        $alert = $this->pickingService->createAlert($data, $request->user()->id, $requestContext);

        return (new PickingAlertResource($alert))->response()->setStatusCode(201);
    }

    public function alerts(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['status', 'severity', 'alert_type']);
        $alerts = $this->pickingService->getAlerts($filters);

        return PickingAlertResource::collection($alerts);
    }

    public function resolveAlert(int $id, ResolveAlertRequest $request): JsonResponse
    {
        $alert = $this->pickingService->resolveAlert(
            $id,
            $request->user()->id,
            $request->validated('notes', '')
        );

        return (new PickingAlertResource($alert))->response();
    }
}
