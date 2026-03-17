<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Services\Picking\DTO\PickingRequestContext;
use Illuminate\Http\Request;

trait ResolvesWarehouseRequestContext
{
    protected function warehouseRequestContext(Request $request): array
    {
        $requestContext = PickingRequestContext::fromRequest($request)->toArray();
        $user = $request->user();

        return array_filter([
            'warehouse_id' => $user?->warehouse_id,
            'user_id' => $user?->id,
            'override_warehouse_id' => $requestContext['override_warehouse_id'] ?? null,
        ], fn ($value) => $value !== null);
    }
}
