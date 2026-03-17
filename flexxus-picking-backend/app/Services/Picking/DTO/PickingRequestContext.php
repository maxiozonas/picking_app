<?php

namespace App\Services\Picking\DTO;

use Illuminate\Http\Request;

final readonly class PickingRequestContext
{
    public function __construct(
        public ?int $overrideWarehouseId = null
    ) {}

    public static function fromArray(array $context): self
    {
        $overrideWarehouseId = $context['override_warehouse_id'] ?? null;

        if ($overrideWarehouseId === null || $overrideWarehouseId === '') {
            return new self;
        }

        return new self((int) $overrideWarehouseId);
    }

    public static function fromRequest(Request $request): self
    {
        return self::fromArray([
            'override_warehouse_id' => $request->attributes->get('override_warehouse_id'),
        ]);
    }

    public function toArray(): array
    {
        return array_filter([
            'override_warehouse_id' => $this->overrideWarehouseId,
        ], fn ($value) => $value !== null);
    }
}
