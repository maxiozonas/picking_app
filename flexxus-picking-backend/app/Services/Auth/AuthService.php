<?php

namespace App\Services\Auth;

use App\Exceptions\AuthenticationValidationException;
use App\Exceptions\AuthorizationValidationException;
use App\Models\User;
use App\Repositories\Auth\AuthRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        private AuthRepositoryInterface $authRepository
    ) {}

    public function login(string $username, string $password): array
    {
        $user = $this->authRepository->findByUsername($username);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw AuthenticationValidationException::withMessages([
                'username' => ['Credenciales inválidas'],
            ]);
        }

        if (! $user->is_active) {
            throw AuthenticationValidationException::withMessages([
                'username' => ['Usuario inactivo. Contacte al administrador.'],
            ]);
        }

        $this->authRepository->updateLastLogin($user);

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $this->formatUserWithWarehouse($user),
        ];
    }

    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }

    public function me(User $user): array
    {
        $user->load(['warehouse', 'availableWarehouses']);

        return [
            'user' => $this->formatUserWithWarehouse($user),
        ];
    }

    public function overrideWarehouse(User $user, int $warehouseId, int $durationMinutes): array
    {
        if (! $user->can_override_warehouse) {
            throw AuthorizationValidationException::withMessages([
                'warehouse_id' => ['No tienes permiso para cambiar de depósito'],
            ]);
        }

        if (! $this->canAccessWarehouse($user, $warehouseId)) {
            throw AuthorizationValidationException::withMessages([
                'warehouse_id' => ['No tienes acceso a este depósito'],
            ]);
        }

        $expiresAt = now()->addMinutes($durationMinutes);
        $this->authRepository->setWarehouseOverride($user, $warehouseId, $expiresAt);

        $user->refresh()->load(['warehouse']);

        return $this->formatUserWithWarehouse($user);
    }

    public function clearOverride(User $user): void
    {
        $this->authRepository->clearWarehouseOverride($user);
    }

    public function canAccessWarehouse(User $user, int $warehouseId): bool
    {
        return $user->hasAccessToWarehouse($warehouseId);
    }

    private function formatUserWithWarehouse(User $user): array
    {
        $warehouse = $user->warehouse;
        $isOverride = $user->override_expires_at && $user->override_expires_at->isFuture();

        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'warehouse_id' => $user->warehouse_id,
            'warehouse' => $warehouse ? [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'is_active' => $warehouse->is_active,
                'is_override' => $isOverride,
            ] : null,
            'can_override_warehouse' => $user->can_override_warehouse,
            'override_expires_at' => $user->override_expires_at?->toISOString(),
            'available_warehouses' => $user->availableWarehouses->map(fn ($w) => [
                'id' => $w->id,
                'code' => $w->code,
                'name' => $w->name,
                'is_active' => $w->is_active,
            ]),
        ];

        return $data;
    }
}
