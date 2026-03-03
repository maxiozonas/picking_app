<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'warehouse_id',
        'role',
        'is_active',
        'can_override_warehouse',
        'override_expires_at',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'string',
            'is_active' => 'boolean',
            'can_override_warehouse' => 'boolean',
            'override_expires_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function availableWarehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'user_warehouse')
            ->withTimestamps();
    }

    public function warehouses(): BelongsToMany
    {
        return $this->availableWarehouses();
    }

    public function getCurrentWarehouseIdAttribute(): int
    {
        if ($this->override_expires_at && $this->override_expires_at->isFuture()) {
            return $this->getAttributes()['warehouse_id'] ?? $this->warehouse_id;
        }

        return $this->warehouse_id;
    }

    public function hasAccessToWarehouse(int $warehouseId): bool
    {
        if ($this->warehouse_id === $warehouseId) {
            return true;
        }

        if ($this->can_override_warehouse) {
            return $this->availableWarehouses()
                ->where('warehouses.id', $warehouseId)
                ->exists();
        }

        return false;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
