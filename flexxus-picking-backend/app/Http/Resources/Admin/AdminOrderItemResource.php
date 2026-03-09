<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $item = $this->resource;

        return [
            'id' => $item->id,
            'product_code' => $item->product_code,
            'description' => $item->description,
            'quantity' => $item->quantity,
            'picked_quantity' => $item->picked_quantity,
            'lot' => $item->lot,
            'location' => $item->location,
            'status' => $item->status,
        ];
    }
}
