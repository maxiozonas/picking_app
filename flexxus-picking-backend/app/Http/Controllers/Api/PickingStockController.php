<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\ResolvesWarehouseRequestContext;
use App\Http\Requests\Picking\GetStockForItemRequest;
use App\Http\Resources\PickingStockResource;
use App\Http\Resources\PickingStockValidationResource;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PickingStockController extends Controller
{
    use ResolvesWarehouseRequestContext;

    public function __construct(
        private PickingServiceInterface $pickingService,
        private StockValidationServiceInterface $stockValidationService
    ) {}

    public function getStockForItem(string $orderNumber, string $productCode, GetStockForItemRequest $request): JsonResponse
    {
        $requestContext = $this->warehouseRequestContext($request);

        $stock = $this->pickingService->getStockForItem(
            $orderNumber,
            $productCode,
            $request->user()->id,
            $requestContext
        );

        if (! $stock) {
            return response()->json([
                'error' => [
                    'message' => "Item {$productCode} not found in order {$orderNumber}",
                ],
            ], 404);
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
