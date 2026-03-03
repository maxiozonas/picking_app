<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseTest extends TestCase
{
    use RefreshDatabase;

    public function test_warehouse_has_users_relationship(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $warehouse->users()->attach([$user1->id, $user2->id]);

        $this->assertCount(2, $warehouse->users);
        $this->assertTrue($warehouse->users->contains($user1));
        $this->assertTrue($warehouse->users->contains($user2));
    }

    public function test_warehouse_fillable_fields(): void
    {
        $warehouse = Warehouse::factory()->make([
            'code' => 'TEST-01',
            'name' => 'Test Warehouse',
            'flexxus_id' => '12345',
            'is_active' => true,
        ]);

        $this->assertEquals('TEST-01', $warehouse->code);
        $this->assertEquals('Test Warehouse', $warehouse->name);
        $this->assertEquals('12345', $warehouse->flexxus_id);
        $this->assertTrue($warehouse->is_active);
    }

    public function test_warehouse_casts_is_active_to_boolean(): void
    {
        $warehouse = Warehouse::factory()->create(['is_active' => 1]);

        $this->assertIsBool($warehouse->is_active);
        $this->assertTrue($warehouse->is_active);
    }

    public function test_scope_active_filters_only_active_warehouses(): void
    {
        $activeWarehouse = Warehouse::factory()->create();
        $inactiveWarehouse = Warehouse::factory()->inactive()->create();

        $activeWarehouses = Warehouse::active()->get();

        $this->assertCount(1, $activeWarehouses);
        $this->assertTrue($activeWarehouses->contains($activeWarehouse));
        $this->assertFalse($activeWarehouses->contains($inactiveWarehouse));
    }
}
