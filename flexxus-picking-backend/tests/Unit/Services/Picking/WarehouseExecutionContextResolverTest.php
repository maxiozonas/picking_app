<?php

namespace Tests\Unit\Services\Picking;

use App\Exceptions\Picking\WarehouseMismatchException;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\WarehouseExecutionContextResolver;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseExecutionContextResolverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_resolver_requires_user_assigned_warehouse(): void
    {
        $resolver = new WarehouseExecutionContextResolver;
        $user = User::factory()->create(['warehouse_id' => null]);

        $this->expectException(WarehouseMismatchException::class);

        $resolver->resolveForUserId($user->id, ['warehouse_code' => 'CENTRO']);
    }

    public function test_resolver_ignores_request_override_inputs(): void
    {
        $assignedWarehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        Warehouse::factory()->create(['code' => 'CENTRO']);
        $user = User::factory()->create(['warehouse_id' => $assignedWarehouse->id]);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUserId($user->id, [
            'warehouse_id' => 999,
            'warehouse_code' => 'CENTRO',
            'warehouse' => 'CENTRO',
        ]);

        $this->assertSame($assignedWarehouse->id, $context->warehouseId);
        $this->assertSame('RONDEAU', $context->warehouseCode);
        $this->assertFalse($context->isOverride);
    }

    public function test_context_carries_warehouse_and_user_identifiers(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $user = User::factory()->create(['warehouse_id' => $warehouse->id]);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUserId($user->id);

        $this->assertSame($warehouse->id, $context->warehouseId);
        $this->assertSame('RONDEAU', $context->warehouseCode);
        $this->assertSame($user->id, $context->userId);
        $this->assertNotEmpty($context->correlationToken);
    }

    public function test_admin_with_override_request_and_access_uses_override_warehouse(): void
    {
        $assignedWarehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $overrideWarehouse = Warehouse::factory()->create(['code' => 'CENTRO']);

        $admin = User::factory()->create([
            'warehouse_id' => $assignedWarehouse->id,
            'can_override_warehouse' => true,
        ]);

        $admin->assignRole('admin');
        $admin->availableWarehouses()->attach($overrideWarehouse->id);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUser($admin, [
            'override_warehouse_id' => $overrideWarehouse->id,
        ]);

        $this->assertSame($overrideWarehouse->id, $context->warehouseId);
        $this->assertSame('CENTRO', $context->warehouseCode);
        $this->assertTrue($context->isOverride);
    }

    public function test_admin_without_access_to_override_warehouse_throws_exception(): void
    {
        $assignedWarehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $overrideWarehouse = Warehouse::factory()->create(['code' => 'CENTRO']);

        $admin = User::factory()->create([
            'warehouse_id' => $assignedWarehouse->id,
            'can_override_warehouse' => true,
        ]);

        $admin->assignRole('admin');

        $resolver = new WarehouseExecutionContextResolver;

        $this->expectException(WarehouseMismatchException::class);

        $resolver->resolveForUser($admin, [
            'override_warehouse_id' => $overrideWarehouse->id,
        ]);
    }

    public function test_non_admin_ignores_override_request(): void
    {
        $assignedWarehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $overrideWarehouse = Warehouse::factory()->create(['code' => 'CENTRO']);

        $operator = User::factory()->create([
            'warehouse_id' => $assignedWarehouse->id,
            'can_override_warehouse' => false,
        ]);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUser($operator, [
            'override_warehouse_id' => $overrideWarehouse->id,
        ]);

        $this->assertSame($assignedWarehouse->id, $context->warehouseId);
        $this->assertSame('RONDEAU', $context->warehouseCode);
        $this->assertFalse($context->isOverride);
    }
}
