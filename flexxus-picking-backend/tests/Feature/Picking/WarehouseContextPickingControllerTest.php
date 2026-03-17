<?php

namespace Tests\Feature\Picking;

use App\Exceptions\Picking\WarehouseMismatchException;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class WarehouseContextPickingControllerTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles directly without seeder to avoid nested transactions
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'empleado']);
    }

    public function test_index_ignores_warehouse_override_query_param(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $user = User::factory()->create(['warehouse_id' => $warehouse->id]);

        Sanctum::actingAs($user);

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15, 1);

        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->with(
                $user->id,
                ['status' => 'pending'],
                Mockery::on(fn ($requestContext) => is_array($requestContext)
                    && ! isset($requestContext['override_warehouse_id']))
            )
            ->andReturn($paginator);

        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->getJson('/api/picking/orders?status=pending&warehouse_id=CENTRO');

        $response->assertStatus(200);
    }

    public function test_show_uses_authenticated_user_scope_only(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $user = User::factory()->create(['warehouse_id' => $warehouse->id]);
        $orderNumber = 'NP 12345';

        Sanctum::actingAs($user);

        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getOrderDetail')
            ->once()
            ->with(
                $orderNumber,
                $user->id,
                Mockery::on(fn ($requestContext) => is_array($requestContext)
                    && ! isset($requestContext['override_warehouse_id']))
            )
            ->andReturn([
                'order_number' => $orderNumber,
                'customer_name' => 'Cliente Demo',
                'warehouse' => [
                    'id' => $warehouse->id,
                    'code' => 'RONDEAU',
                    'name' => $warehouse->name,
                ],
                'total' => 0,
                'status' => 'pending',
                'started_at' => null,
                'completed_at' => null,
                'assigned_to' => null,
                'total_items' => 0,
                'picked_items' => 0,
                'completed_percentage' => 0,
                'items' => [],
                'alerts' => [],
            ]);

        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->getJson("/api/picking/orders/{$orderNumber}?warehouse_id=CENTRO");

        $response->assertStatus(200)
            ->assertJsonPath('data.warehouse.code', 'RONDEAU');
    }

    public function test_user_without_warehouse_gets_warehouse_mismatch_response(): void
    {
        $user = User::factory()->create(['warehouse_id' => null]);

        Sanctum::actingAs($user);

        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->with(
                $user->id,
                [],
                Mockery::on(fn ($requestContext) => is_array($requestContext)
                    && ! isset($requestContext['override_warehouse_id']))
            )
            ->andThrow(new WarehouseMismatchException('', $user->id, 0));

        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->getJson('/api/picking/orders');

        $response->assertStatus(403)
            ->assertJsonPath('error.error_code', 'WAREHOUSE_MISMATCH');
    }

    public function test_admin_with_override_header_uses_override_warehouse_in_picking(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);

        $admin = User::factory()->admin()->create([
            'warehouse_id' => $warehouse1->id,
            'can_override_warehouse' => true,
        ]);
        $admin->warehouses()->attach($warehouse2->id);
        $admin->assignRole('admin');

        Sanctum::actingAs($admin);

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15, 1);

        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->with(
                $admin->id,
                [],
                Mockery::on(function ($requestContext) use ($warehouse2) {
                    return is_array($requestContext)
                        && isset($requestContext['override_warehouse_id'])
                        && $requestContext['override_warehouse_id'] === $warehouse2->id;
                })
            )
            ->andReturn($paginator);

        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }

    public function test_non_admin_with_override_header_ignores_override_and_uses_assigned_warehouse(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);

        $empleado = User::factory()->create([
            'warehouse_id' => $warehouse1->id,
            'can_override_warehouse' => false,
        ]);
        $empleado->assignRole('empleado');

        Sanctum::actingAs($empleado);

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15, 1);

        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->with(
                $empleado->id,
                [],
                Mockery::on(function ($requestContext) use ($warehouse2) {
                    return is_array($requestContext)
                        && isset($requestContext['override_warehouse_id'])
                        && $requestContext['override_warehouse_id'] === $warehouse2->id;
                })
            )
            ->andReturn($paginator);

        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }
}
