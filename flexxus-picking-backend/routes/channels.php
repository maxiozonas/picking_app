<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| These channels are used for real-time WebSocket communication via Laravel
| Reverb. Authorization ensures users can only subscribe to channels they
| should have access to based on warehouse isolation rules.
|
| Channel types:
|   - private-warehouse.{warehouseId}: All users with access to a specific warehouse
|   - private-user.{userId}: User's personal channel (own user ID only)
|   - private-order.{orderNumber}: Order-specific channel (assigned operario or admin)
|
*/

// Warehouse channel — any authenticated user with access to the warehouse
Broadcast::channel('private-warehouse.{warehouseId}', function (User $user, int $warehouseId): bool {
    return $user->hasAccessToWarehouse($warehouseId);
});

// User channel — only the owner of the channel
Broadcast::channel('private-user.{userId}', function (User $user, int $userId): bool {
    return $user->id === $userId;
});

// Order channel — assigned operario or any admin with warehouse access
Broadcast::channel('private-order.{orderNumber}', function (User $user, string $orderNumber): bool {
    $progress = \App\Models\PickingOrderProgress::where('order_number', $orderNumber)->first();

    if (! $progress) {
        return false;
    }

    return $user->hasAccessToWarehouse($progress->warehouse_id)
        && ($progress->user_id === $user->id || $user->hasRole('admin'));
});
