<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingAlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $reporter = $this->resource->relationLoaded('reporter') ? $this->reporter : null;
        $warehouse = $this->resource->relationLoaded('warehouse') ? $this->warehouse : null;

        return [
            'id' => $this->id ?? null,
            'order_number' => $this->order_number ?? null,
            'alert_type' => $this->alert_type ?? null,
            'message' => $this->message ?? null,
            'severity' => $this->severity ?? null,
            'status' => ($this->is_resolved ?? false) ? 'resolved' : 'pending',
            'product_code' => $this->product_code ?? null,
            'created_at' => $this->created_at?->toIso8601String(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'resolved_by' => $this->resolved_by ?? null,
            'resolution_notes' => $this->resolution_notes ?? null,
            'reporter' => $this->when($reporter !== null, [
                'id' => $reporter?->id ?? null,
                'name' => $reporter?->name ?? null,
            ]),
            'warehouse' => $this->when($warehouse !== null, [
                'id' => $warehouse?->id ?? null,
                'code' => $warehouse?->code ?? null,
                'name' => $warehouse?->name ?? null,
            ]),
        ];
    }
}
