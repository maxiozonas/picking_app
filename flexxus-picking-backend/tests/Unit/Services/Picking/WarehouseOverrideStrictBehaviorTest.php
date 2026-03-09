<?php

namespace Tests\Unit\Services\Picking;

use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\WarehouseExecutionContext;
use App\Services\Picking\WarehouseExecutionContextResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WarehouseOverrideStrictBehaviorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'empleado']);
    }

    public function test_employee_warehouse_context_resolver_uses_warehouse_id(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'WH1']);

        $employee = User::factory()->empleado()->create([
            'warehouse_id' => $warehouse->id,
        ]);

        $resolver = new WarehouseExecutionContextResolver;

        $context = $resolver->resolveForUser($employee);

        $this->assertInstanceOf(WarehouseExecutionContext::class, $context);
        $this->assertEquals($warehouse->id, $context->warehouseId);
        $this->assertEquals($warehouse->code, $context->warehouseCode);
        $this->assertEquals($employee->id, $context->userId);
        $this->assertFalse($context->isOverride);
    }

    public function test_employee_without_warehouse_throws_exception(): void
    {
        $employee = User::factory()->empleado()->create([
            'warehouse_id' => null,
        ]);

        $resolver = new WarehouseExecutionContextResolver;

        $this->expectException(\App\Exceptions\Picking\WarehouseMismatchException::class);

        $resolver->resolveForUser($employee);
    }

    public function test_admin_warehouse_context_resolver_respects_override(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'WH1']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'WH2']);

        $admin = User::factory()->admin()->create([
            'warehouse_id' => $warehouse2->id,
            'override_expires_at' => now()->addMinutes(60),
        ]);

        $admin->availableWarehouses()->attach($warehouse2->id);

        $resolver = new WarehouseExecutionContextResolver;

        $context = $resolver->resolveForUser($admin);

        $this->assertEquals($warehouse2->id, $context->warehouseId, 'Admin should use override warehouse');
        $this->assertEquals($warehouse2->code, $context->warehouseCode);
        $this->assertTrue($context->isOverride);
    }

    public function test_admin_without_override_uses_current_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'WH1']);

        $admin = User::factory()->admin()->create([
            'warehouse_id' => $warehouse->id,
            'override_expires_at' => null,
        ]);

        $resolver = new WarehouseExecutionContextResolver;

        $context = $resolver->resolveForUser($admin);

        $this->assertEquals($warehouse->id, $context->warehouseId);
        $this->assertFalse($context->isOverride);
    }

    public function test_employee_cannot_use_override_to_access_different_warehouse_in_picking(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'WH1']);

        $employee = User::factory()->empleado()->create([
            'warehouse_id' => $warehouse->id,
            'can_override_warehouse' => false,
        ]);

        Sanctum::actingAs($employee);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUser($employee);

        $this->assertEquals($warehouse->id, $context->warehouseId);
    }

    public function test_resolver_detects_active_override_for_admin(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'WH1']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'WH2']);

        $admin = User::factory()->admin()->create([
            'warehouse_id' => $warehouse2->id,
            'override_expires_at' => now()->addMinutes(60),
        ]);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUser($admin);

        $this->assertTrue($context->isOverride);
    }

    public function test_resolver_ignores_expired_override_for_admin(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'WH1']);

        $admin = User::factory()->admin()->create([
            'warehouse_id' => $warehouse->id,
            'override_expires_at' => now()->subMinutes(10),
        ]);

        $resolver = new WarehouseExecutionContextResolver;
        $context = $resolver->resolveForUser($admin);

        $this->assertEquals($warehouse->id, $context->warehouseId);
        $this->assertFalse($context->isOverride);
    }
}
