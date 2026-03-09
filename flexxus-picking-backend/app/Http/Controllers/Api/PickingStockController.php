<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\Picking\OrderNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Picking\GetStockForItemRequest;
use App\Http\Resources\PickingStockResource;
use App\Http\Resources\PickingStockValidationResource;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PickingStockController extends Controller
{
    public function __construct(
        private PickingServiceInterface $pickingService,
        private StockValidationServiceInterface $stockValidationService
    ) {}

    public function getStockForItem(string $orderNumber, string $productCode, GetStockForItemRequest $request): JsonResponse
    {
        $requestContext = array_filter([
            'override_warehouse_id' => $request->attributes->get('override_warehouse_id'),
        ], fn ($value) => $value !== null);

        $stock = $this->pickingService->getStockForItem(
            $orderNumber,
            $productCode,
            auth()->id(),
            $requestContext
        );

        if (! $stock) {
            throw new OrderNotFoundException($productCode, [
                'order_number' => $orderNumber,
                'type'         => 'item',
            ]);
        }

        return response()->json([
            'data' => new PickingStockResource($stock),
        ]);
    }

    public function getValidationStatus(string $orderNumber): AnonymousResourceCollection
    {
        $validations = $this->stockValidationService->getOrderValidations($orderNumber);

        return PickingStockValidationResource::collection($validations);
    }
}
