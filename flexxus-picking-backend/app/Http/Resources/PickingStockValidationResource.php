<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PickingStockValidationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'item_code' => $this->item_code,
            'requested_qty' => $this->requested_qty,
            'available_qty' => $this->available_qty,
            'validation_result' => $this->validation_result,
            'validated_at' => $this->validated_at?->toIso8601String(),
            'error_code' => $this->error_code,
        ];
    }
}
