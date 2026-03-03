<?php

namespace App\Repositories\Auth;

use App\Models\User;

interface AuthRepositoryInterface
{
    public function findByUsername(string $username): ?User;

    public function updateLastLogin(User $user): void;

    public function setWarehouseOverride(User $user, int $warehouseId, \DateTime $expiresAt): void;

    public function clearWarehouseOverride(User $user): void;

    public function getAvailableWarehouses(User $user): \Illuminate\Support\Collection;
}
