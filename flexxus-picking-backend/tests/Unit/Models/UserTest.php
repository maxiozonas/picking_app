<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_warehouse_relationship(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create();

        $this->assertInstanceOf(Warehouse::class, $user->warehouse);
        $this->assertEquals($warehouse->id, $user->warehouse->id);
    }

    public function test_user_has_available_warehouses_relationship(): void
    {
        $user = User::factory()->create();
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();

        $user->availableWarehouses()->attach([$warehouse1->id, $warehouse2->id]);

        $this->assertCount(2, $user->availableWarehouses);
        $this->assertTrue($user->availableWarehouses->contains($warehouse1));
        $this->assertTrue($user->availableWarehouses->contains($warehouse2));
    }

    public function test_user_has_access_to_own_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create();

        $this->assertTrue($user->hasAccessToWarehouse($warehouse->id));
    }

    public function test_user_with_override_can_access_other_warehouses(): void
    {
        $user = User::factory()->withOverride()->create();
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        $this->assertTrue($user->hasAccessToWarehouse($warehouse->id));
    }

    public function test_user_without_override_cannot_access_other_warehouses(): void
    {
        $user = User::factory()->create(['warehouse_id' => Warehouse::factory()]);
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        $this->assertFalse($user->hasAccessToWarehouse($warehouse->id));
    }

    public function test_get_current_warehouse_id_returns_warehouse_when_no_override(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'override_expires_at' => null,
        ]);

        $this->assertEquals($warehouse->id, $user->current_warehouse_id);
    }

    public function test_get_current_warehouse_id_returns_override_when_active(): void
    {
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse1)->create([
            'can_override_warehouse' => true,
            'override_expires_at' => now()->addHour(),
        ]);

        $user->warehouse_id = $warehouse2->id;

        $this->assertEquals($warehouse2->id, $user->current_warehouse_id);
    }

    public function test_get_current_warehouse_id_returns_warehouse_when_override_expired(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'can_override_warehouse' => true,
            'override_expires_at' => now()->subHour(),
        ]);

        $this->assertEquals($warehouse->id, $user->current_warehouse_id);
    }

    public function test_scope_active_filters_only_active_users(): void
    {
        $activeUser = User::factory()->create();
        $inactiveUser = User::factory()->inactive()->create();

        $activeUsers = User::active()->get();

        $this->assertCount(1, $activeUsers);
        $this->assertTrue($activeUsers->contains($activeUser));
        $this->assertFalse($activeUsers->contains($inactiveUser));
    }
}
