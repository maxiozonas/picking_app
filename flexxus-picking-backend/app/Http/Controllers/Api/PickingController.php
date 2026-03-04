<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Picking\CompleteOrderRequest;
use App\Http\Requests\Picking\CreateAlertRequest;
use App\Http\Requests\Picking\PickItemRequest;
use App\Http\Requests\Picking\StartOrderRequest;
use App\Http\Resources\PickingAlertResource;
use App\Http\Resources\PickingOrderDetailResource;
use App\Http\Resources\PickingOrderResource;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PickingController extends Controller
{
    public function __construct(
        private PickingServiceInterface $pickingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search']);
        $orders = $this->pickingService->getAvailableOrders(
            auth()->id(),
            $filters
        );

        return response()->json([
            'data' => PickingOrderResource::collection($orders)->collection->toArray(request()),
        ]);
    }

    public function show(string $orderNumber): PickingOrderDetailResource
    {
        $order = $this->pickingService->getOrderDetail(
            $orderNumber,
            auth()->id()
        );

        return new PickingOrderDetailResource($order);
    }

    public function start(string $orderNumber, StartOrderRequest $request): PickingOrderResource
    {
        $progress = $this->pickingService->startOrder(
            $orderNumber,
            auth()->id()
        );

        return new PickingOrderResource($progress);
    }

    public function pickItem(string $orderNumber, string $productCode, PickItemRequest $request): JsonResponse
    {
        $result = $this->pickingService->pickItem(
            $orderNumber,
            $productCode,
            $request->validated('quantity'),
            auth()->id()
        );

        return response()->json([
            'data' => $result,
        ]);
    }

    public function complete(string $orderNumber, CompleteOrderRequest $request): PickingOrderResource
    {
        $progress = $this->pickingService->completeOrder(
            $orderNumber,
            auth()->id()
        );

        return new PickingOrderResource($progress);
    }

    public function createAlert(string $orderNumber, CreateAlertRequest $request): JsonResponse
    {
        $data = array_merge($request->validated(), [
            'order_number' => $orderNumber,
        ]);

        $alert = $this->pickingService->createAlert($data, auth()->id());

        return response()->json([
            'data' => new PickingAlertResource($alert),
        ], 201);
    }

    public function alerts(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['status', 'severity', 'alert_type']);
        $alerts = $this->pickingService->getAlerts($filters);

        return PickingAlertResource::collection($alerts);
    }

    public function resolveAlert(int $id, Request $request): JsonResponse
    {
        $request->validate(['notes' => 'nullable|string']);

        $alert = $this->pickingService->resolveAlert(
            $id,
            auth()->id(),
            $request->input('notes', '')
        );

        return response()->json([
            'data' => new PickingAlertResource($alert),
        ]);
    }
}
