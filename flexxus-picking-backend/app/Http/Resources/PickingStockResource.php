<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PickingStockResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'item_code' => $this->resource['item_code'] ?? null,
            'available_quantity' => $this->resource['available_quantity'] ?? 0,
            'location' => $this->resource['location'] ?? null,
            'last_updated' => $this->resource['last_updated'] ?? null,
        ];
    }
}
