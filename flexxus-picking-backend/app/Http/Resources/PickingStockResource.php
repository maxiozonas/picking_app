<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PickingStockResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'item_code'          => $this->resource['item_code'] ?? null,
            'available_quantity' => $this->resource['available_quantity'] ?? 0,
            'location'           => $this->resource['location'] ?? null,
            'last_updated'       => $this->resource['last_updated'] ?? null,
            'warehouse'          => isset($this->resource['warehouse_id']) ? [
                'id'   => $this->resource['warehouse_id'],
                'code' => $this->resource['warehouse_code'] ?? null,
                'name' => $this->resource['warehouse_name'] ?? null,
            ] : null,
        ];
    }
}
