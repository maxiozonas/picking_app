<?php

namespace App\Services\Auth;

use App\Models\User;

interface AuthServiceInterface
{
    public function login(string $username, string $password): array;

    public function logout(User $user): void;

    public function me(User $user): array;

    public function overrideWarehouse(User $user, int $warehouseId, int $durationMinutes): array;

    public function clearOverride(User $user): void;

    public function canAccessWarehouse(User $user, int $warehouseId): bool;
}
