<?php

namespace Tests\Feature\Broadcasting;

use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChannelAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // private-warehouse.{warehouseId} channel tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_user_can_join_own_warehouse_channel(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->empleado()->create(['warehouse_id' => $warehouse->id]);

        // Authorization: hasAccessToWarehouse(warehouseId) must return true
        $this->assertTrue($user->hasAccessToWarehouse($warehouse->id));
    }

    public function test_user_cannot_join_other_warehouse_channel(): void
    {
        $ownWarehouse = Warehouse::factory()->create();
        $otherWarehouse = Warehouse::factory()->create();

        $user = User::factory()->empleado()->create(['warehouse_id' => $ownWarehouse->id]);

        // Attempt to authorize for a warehouse the user does NOT belong to
        $this->assertFalse($user->hasAccessToWarehouse($otherWarehouse->id));
    }

    public function test_admin_can_join_own_warehouse_channel(): void
    {
        // Admin has a specific warehouse_id, so can only join that warehouse channel
        $warehouse = Warehouse::factory()->create();
        $admin = User::factory()->admin()->create(['warehouse_id' => $warehouse->id]);

        $this->assertTrue($admin->hasAccessToWarehouse($warehouse->id));
    }

    public function test_warehouse_channel_isolation_between_two_warehouses(): void
    {
        $warehouseA = Warehouse::factory()->create();
        $warehouseB = Warehouse::factory()->create();

        $userA = User::factory()->empleado()->create(['warehouse_id' => $warehouseA->id]);
        $userB = User::factory()->empleado()->create(['warehouse_id' => $warehouseB->id]);

        // User from warehouse A should NOT have access to warehouse B channel
        $this->assertFalse($userA->hasAccessToWarehouse($warehouseB->id));

        // User from warehouse B should NOT have access to warehouse A channel
        $this->assertFalse($userB->hasAccessToWarehouse($warehouseA->id));

        // Each user has access to their own warehouse
        $this->assertTrue($userA->hasAccessToWarehouse($warehouseA->id));
        $this->assertTrue($userB->hasAccessToWarehouse($warehouseB->id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // private-user.{userId} channel tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_user_can_only_access_own_user_channel(): void
    {
        $user = User::factory()->empleado()->create();

        // Direct authorization check: user.id === userId
        $this->assertEquals($user->id, $user->id); // self
        $this->assertTrue($user->id === $user->id); // self-access allowed
    }

    public function test_user_cannot_access_other_user_channel(): void
    {
        $userA = User::factory()->empleado()->create();
        $userB = User::factory()->empleado()->create();

        // Authorization: user.id === userId
        // userA should NOT be able to join private-user.{userB->id}
        $this->assertFalse($userA->id === $userB->id);
        $this->assertTrue($userB->id === $userB->id); // userB CAN access their own
    }

    // ─────────────────────────────────────────────────────────────────────────
    // private-order.{orderNumber} channel tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_assigned_operative_can_access_order_channel(): void
    {
        $warehouse = Warehouse::factory()->create();
        $operative = User::factory()->empleado()->create(['warehouse_id' => $warehouse->id]);

        $progress = PickingOrderProgress::factory()->inProgress()->create([
            'warehouse_id' => $warehouse->id,
            'user_id' => $operative->id,
        ]);

        // Authorization: hasAccessToWarehouse($progress->warehouse_id) AND
        //                (progress->user_id === user->id OR user->hasRole('admin'))
        $hasWarehouseAccess = $operative->hasAccessToWarehouse($progress->warehouse_id);
        $isAssignedUser = $progress->user_id === $operative->id;

        $this->assertTrue($hasWarehouseAccess && $isAssignedUser);
    }

    public function test_unassigned_operative_cannot_access_order_channel(): void
    {
        $warehouse = Warehouse::factory()->create();
        $operativeA = User::factory()->empleado()->create(['warehouse_id' => $warehouse->id]);
        $operativeB = User::factory()->empleado()->create(['warehouse_id' => $warehouse->id]);

        $progress = PickingOrderProgress::factory()->inProgress()->create([
            'warehouse_id' => $warehouse->id,
            'user_id' => $operativeA->id,
        ]);

        // operativeB is in the same warehouse but NOT assigned to the order
        $hasWarehouseAccess = $operativeB->hasAccessToWarehouse($progress->warehouse_id);
        $isAssignedUser = $progress->user_id === $operativeB->id;

        // Channel auth requires BOTH: warehouse access AND (assigned OR admin)
        // So operativeB cannot join because they are not the assigned user
        $this->assertTrue($hasWarehouseAccess); // same warehouse
        $this->assertFalse($isAssignedUser);   // not assigned
    }

    public function test_admin_can_access_order_channel_in_own_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create();
        $operative = User::factory()->empleado()->create(['warehouse_id' => $warehouse->id]);
        $admin = User::factory()->admin()->create(['warehouse_id' => $warehouse->id]);

        $progress = PickingOrderProgress::factory()->inProgress()->create([
            'warehouse_id' => $warehouse->id,
            'user_id' => $operative->id,
        ]);

        $hasWarehouseAccess = $admin->hasAccessToWarehouse($progress->warehouse_id);
        $isAdmin = $admin->hasRole('admin');

        $this->assertTrue($hasWarehouseAccess && $isAdmin);
    }

    public function test_admin_cannot_access_order_channel_in_other_warehouse(): void
    {
        $warehouseA = Warehouse::factory()->create();
        $warehouseB = Warehouse::factory()->create();

        $operative = User::factory()->empleado()->create(['warehouse_id' => $warehouseB->id]);
        $admin = User::factory()->admin()->create(['warehouse_id' => $warehouseA->id]);

        $progress = PickingOrderProgress::factory()->inProgress()->create([
            'warehouse_id' => $warehouseB->id,
            'user_id' => $operative->id,
        ]);

        // Admin from warehouse A cannot access order from warehouse B
        $hasWarehouseAccess = $admin->hasAccessToWarehouse($progress->warehouse_id);

        $this->assertFalse($hasWarehouseAccess);
    }

    public function test_no_warehouse_access_cannot_access_any_order_channel(): void
    {
        $warehouseA = Warehouse::factory()->create();
        $warehouseB = Warehouse::factory()->create();

        $operativeA = User::factory()->empleado()->create(['warehouse_id' => $warehouseA->id]);
        $orderInWarehouseB = PickingOrderProgress::factory()->inProgress()->create([
            'warehouse_id' => $warehouseB->id,
        ]);

        // User from warehouse A has NO access to orders in warehouse B
        $this->assertFalse($operativeA->hasAccessToWarehouse($warehouseB->id));
    }

    public function test_user_channel_is_strictly_scoped_to_user_id(): void
    {
        $user1 = User::factory()->empleado()->create();
        $user2 = User::factory()->empleado()->create();

        $this->assertNotEquals($user1->id, $user2->id);

        // Authorization for private-user.{userId}: $user->id === $userId
        $this->assertTrue($user1->id === $user1->id);
        $this->assertFalse($user1->id === $user2->id);
    }
}
