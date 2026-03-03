<?php

namespace App\Repositories\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AuthRepository implements AuthRepositoryInterface
{
    public function findByUsername(string $username): ?User
    {
        return User::with(['warehouse', 'availableWarehouses'])
            ->where('username', $username)
            ->first();
    }

    public function updateLastLogin(User $user): void
    {
        $user->update(['last_login_at' => now()]);
    }

    public function setWarehouseOverride(User $user, int $warehouseId, \DateTime $expiresAt): void
    {
        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'warehouse_id' => $warehouseId,
                'override_expires_at' => $expiresAt,
            ]);
    }

    public function clearWarehouseOverride(User $user): void
    {
        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'override_expires_at' => null,
            ]);
    }

    public function getAvailableWarehouses(User $user): \Illuminate\Support\Collection
    {
        return $user->availableWarehouses()->active()->get();
    }
}
