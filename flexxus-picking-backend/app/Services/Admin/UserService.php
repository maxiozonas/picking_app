<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService implements UserServiceInterface
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = User::query()
            ->with(['warehouse', 'warehouses']);

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        return $query->paginate(15);
    }

    public function findById(int $id): ?User
    {
        return User::with(['warehouse', 'warehouses'])->find($id);
    }

    public function create(array $data): User
    {
        $warehouseId = ($data['role'] ?? 'empleado') === 'empleado'
            ? ($data['warehouse_id'] ?? null)
            : null;

        $user = User::create([
            'username' => $data['username'],
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'] ?? 'empleado',
            'warehouse_id' => $warehouseId,
            'is_active' => $data['is_active'] ?? true,
            'can_override_warehouse' => false,
        ]);

        $user->assignRole($data['role'] ?? 'empleado');

        return $user;
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $user->fill(array_filter($data, fn ($key) => $key !== 'password', ARRAY_FILTER_USE_KEY));

        if (isset($data['role']) && $data['role'] === 'admin') {
            $user->warehouse_id = null;
        }

        if (isset($data['password'])) {
            $user->password = $data['password'];
        }

        if (isset($data['role'])) {
            $user->syncRoles($data['role']);
        }

        $user->save();

        return $user->fresh(['warehouse', 'warehouses']);
    }

    public function delete(int $id): void
    {
        $user = User::findOrFail($id);
        $user->delete();
    }

    public function assignWarehouse(int $userId, int $warehouseId): void
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        if ($user->role !== 'empleado') {
            throw new \Exception('Only employees can have warehouses assigned');
        }

        $user->warehouse_id = $warehouse->id;
        $user->save();
    }

    public function removeWarehouse(int $userId, int $warehouseId): void
    {
        $user = User::findOrFail($userId);

        if ($user->role !== 'empleado') {
            throw new \Exception('Only employees can have warehouses modified');
        }

        if ($user->warehouse_id === $warehouseId) {
            throw new \Exception('Cannot remove primary warehouse. Assign a new warehouse first.');
        }
    }
}
