<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->resource;

        return [
            'product_code' => $data['product_code'] ?? '',
            'product_name' => $data['description'] ?? '',
            'quantity_required' => $data['quantity_required'] ?? 0,
            'quantity_picked' => $data['quantity_picked'] ?? 0,
            'lot' => $data['lot'] ?? 'SINLOTE',
            'status' => $data['status'] ?? 'pending',
            'stock_info' => $data['stock_info'] ?? null,
        ];
    }
}
