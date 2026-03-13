<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product_code' => $this->resource['product_code'],
            'description' => $this->resource['description'] ?? '',
            'warehouse_id' => $this->resource['warehouse_id'],
            'warehouse_code' => $this->resource['warehouse_code'],
            'warehouse_name' => $this->resource['warehouse_name'],
            'stock_total' => (int) ($this->resource['stock_total'] ?? 0),
            'stock_real' => (int) ($this->resource['stock_real'] ?? 0),
            'stock_pending' => (int) ($this->resource['stock_pending'] ?? 0),
            'location' => $this->resource['location'] ?? null,
            'orders_using' => (int) ($this->resource['orders_using'] ?? 0),
        ];
    }
}
