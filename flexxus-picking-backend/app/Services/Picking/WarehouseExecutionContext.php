<?php

namespace App\Services\Picking;

final class WarehouseExecutionContext
{
    public function __construct(
        public readonly int $warehouseId,
        public readonly string $warehouseCode,
        public readonly int $userId,
        public readonly bool $isOverride = false,
        public readonly string $correlationToken = ''
    ) {}
}
