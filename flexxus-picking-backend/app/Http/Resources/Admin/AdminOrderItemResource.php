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
            'description' => $item->description ?? '',
            'quantity' => $item->quantity_required ?? $item->quantity_requested ?? 0,
            'picked_quantity' => $item->quantity_picked ?? 0,
            'lot' => $item->lot ?? null,
            'location' => $item->location ?? null,
            'status' => $item->status,
        ];
    }
}
