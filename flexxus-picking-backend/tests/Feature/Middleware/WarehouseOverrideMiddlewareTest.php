<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\PickingServiceInterface;
use App\Services\Picking\WarehouseExecutionContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class WarehouseOverrideMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create roles directly without seeder to avoid nested transactions
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'empleado']);
    }

    public function test_middleware_extracts_override_warehouse_id_from_header(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => true,
            ]);
        $admin->warehouses()->attach($warehouse2->id);

        Sanctum::actingAs($admin);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse2->id,
            warehouseCode: 'CENTRO',
            userId: $admin->id,
            isOverride: true,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($admin->id, Mockery::on(function ($requestContext) use ($warehouse2) {
                return is_array($requestContext)
                    && isset($requestContext['override_warehouse_id'])
                    && $requestContext['override_warehouse_id'] === $warehouse2->id;
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }

    public function test_middleware_extracts_override_warehouse_id_from_query_param(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => true,
            ]);
        $admin->warehouses()->attach($warehouse2->id);

        Sanctum::actingAs($admin);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse2->id,
            warehouseCode: 'CENTRO',
            userId: $admin->id,
            isOverride: true,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($admin->id, Mockery::on(function ($requestContext) use ($warehouse2) {
                return is_array($requestContext)
                    && isset($requestContext['override_warehouse_id'])
                    && $requestContext['override_warehouse_id'] === $warehouse2->id;
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->getJson("/api/picking/orders?override_warehouse_id={$warehouse2->id}");

        $response->assertStatus(200);
    }

    public function test_non_admin_with_override_in_request_gets_assigned_warehouse(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $user = User::factory()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => false,
            ]);

        Sanctum::actingAs($user);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse1->id,
            warehouseCode: 'RONDEAU',
            userId: $user->id,
            isOverride: false,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($user->id, Mockery::on(function ($requestContext) use ($warehouse2) {
                return is_array($requestContext)
                    && isset($requestContext['override_warehouse_id'])
                    && $requestContext['override_warehouse_id'] === $warehouse2->id;
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }

    public function test_admin_without_can_override_flag_gets_assigned_warehouse(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => false,
            ]);

        Sanctum::actingAs($admin);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse1->id,
            warehouseCode: 'RONDEAU',
            userId: $admin->id,
            isOverride: false,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($admin->id, Mockery::on(function ($requestContext) use ($warehouse2) {
                return is_array($requestContext)
                    && isset($requestContext['override_warehouse_id'])
                    && $requestContext['override_warehouse_id'] === $warehouse2->id;
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }

    public function test_admin_cannot_override_to_inaccessible_warehouse(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $warehouse3 = Warehouse::factory()->create(['code' => 'SUDOESTE']);
        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => true,
            ]);
        $admin->warehouses()->attach($warehouse2->id);

        Sanctum::actingAs($admin);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse1->id,
            warehouseCode: 'RONDEAU',
            userId: $admin->id,
            isOverride: false,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($admin->id, Mockery::on(function ($requestContext) use ($warehouse3) {
                return is_array($requestContext)
                    && isset($requestContext['override_warehouse_id'])
                    && $requestContext['override_warehouse_id'] === $warehouse3->id;
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse3->id,
        ])->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }

    public function test_middleware_prioritizes_header_over_query_param(): void
    {
        $warehouse1 = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $warehouse3 = Warehouse::factory()->create(['code' => 'SUDOESTE']);
        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => true,
            ]);
        $admin->warehouses()->attach([$warehouse2->id, $warehouse3->id]);

        Sanctum::actingAs($admin);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse2->id,
            warehouseCode: 'CENTRO',
            userId: $admin->id,
            isOverride: true,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($admin->id, Mockery::on(function ($requestContext) use ($warehouse2) {
                return is_array($requestContext)
                    && isset($requestContext['override_warehouse_id'])
                    && $requestContext['override_warehouse_id'] === $warehouse2->id;
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson("/api/picking/orders?override_warehouse_id={$warehouse3->id}");

        $response->assertStatus(200);
    }

    public function test_no_override_provided_uses_assigned_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse->id,
                'can_override_warehouse' => true,
            ]);

        Sanctum::actingAs($admin);

        $expectedContext = new WarehouseExecutionContext(
            warehouseId: $warehouse->id,
            warehouseCode: 'RONDEAU',
            userId: $admin->id,
            isOverride: false,
            correlationToken: Mockery::type('string')
        );

        $resolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);
        $resolver->shouldReceive('resolveForUserId')
            ->once()
            ->with($admin->id, Mockery::on(function ($requestContext) {
                return is_array($requestContext)
                    && ! isset($requestContext['override_warehouse_id']);
            }))
            ->andReturn($expectedContext);
        $this->app->instance(WarehouseExecutionContextResolverInterface::class, $resolver);

        $paginator = new LengthAwarePaginator([], 0, 15, 1);
        $service = Mockery::mock(PickingServiceInterface::class);
        $service->shouldReceive('getAvailableOrders')
            ->once()
            ->andReturn($paginator);
        $this->app->instance(PickingServiceInterface::class, $service);

        $response = $this->getJson('/api/picking/orders');

        $response->assertStatus(200);
    }
}
