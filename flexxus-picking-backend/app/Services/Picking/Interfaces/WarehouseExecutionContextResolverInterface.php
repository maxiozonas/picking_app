<?php

namespace App\Services\Picking\Interfaces;

use App\Models\User;
use App\Services\Picking\WarehouseExecutionContext;

interface WarehouseExecutionContextResolverInterface
{
    public function resolveForUser(User $user, array $requestContext = []): WarehouseExecutionContext;

    public function resolveForUserId(int $userId, array $requestContext = []): WarehouseExecutionContext;
}
