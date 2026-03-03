<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingAlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id ?? null,
            'order_number' => $this->order_number ?? null,
            'alert_type' => $this->alert_type ?? null,
            'message' => $this->message ?? null,
            'severity' => $this->severity ?? null,
            'status' => $this->status ?? 'pending',
            'product_code' => $this->product_code ?? null,
            'created_at' => $this->created_at?->toISOString() ?? now()->toISOString(),
            'resolved_at' => $this->resolved_at?->toISOString(),
            'resolved_by' => $this->resolved_by ?? null,
            'resolution_notes' => $this->resolution_notes ?? null,
            'user' => $this->when($this->user, [
                'id' => $this->user?->id ?? null,
                'name' => $this->user?->name ?? null,
            ]),
        ];
    }
}
