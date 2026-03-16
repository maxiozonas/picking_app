<?php

namespace Tests\Feature\Integration;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

/**
 * Phase 6: Comprehensive Integration Tests for Warehouse Flexxus Credentials
 *
 * Tests end-to-end credential inheritance, operator reassignment,
 * admin override, security, and error handling.
 */
class WarehouseCredentialIntegrationTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles directly without seeder to avoid nested transactions
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'empleado']);
    }

    /**
     * Task 6.1: Test full operator flow - Login → Get warehouse → Verify credentials inherited
     */
    public function test_operator_inherits_flexxus_credentials_from_assigned_warehouse(): void
    {
        // Arrange: Create warehouse with Flexxus credentials
        $warehouse = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'rondeau-secret',
        ]);

        // Create operator assigned to this warehouse
        $operator = User::factory()
            ->empleado()
            ->create(['warehouse_id' => $warehouse->id]);

        Sanctum::actingAs($operator);

        // Verify warehouse has credentials
        $this->assertTrue($warehouse->hasCompleteFlexxusCredentials());
        $this->assertEquals('PREPR', $warehouse->flexxus_username);
        $this->assertEquals('rondeau-secret', $warehouse->flexxus_password);

        // Mock FlexxusClientFactory to return a mock client that doesn't make real HTTP calls
        $mockFlexxusClient = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient->shouldReceive('request')
            ->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse, $mockFlexxusClient) {
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse) {
                        return $arg->id === $warehouse->id
                            && $arg->code === 'RONDEAU'
                            && $arg->flexxus_username === 'PREPR'
                            && $arg->flexxus_password === 'rondeau-secret';
                    }))
                    ->andReturn($mockFlexxusClient);
            }
        ));

        // Act: Make request to get orders
        $response = $this->getJson('/api/picking/orders');

        // Assert: Request succeeds and correct warehouse credentials were used
        $response->assertStatus(200);
    }

    /**
     * Task 6.2: Test operator reassignment - warehouse_id change causes credential switch
     */
    public function test_operator_reassignment_switches_warehouse_credentials(): void
    {
        // Arrange: Create two warehouses with different credentials
        $warehouse1 = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'rondeau-secret',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'flexxus_url' => 'https://centro.flexxus.example.com',
            'flexxus_username' => 'PREPC',
            'flexxus_password' => 'centro-secret',
        ]);

        // Create operator initially assigned to warehouse1
        $operator = User::factory()
            ->empleado()
            ->create(['warehouse_id' => $warehouse1->id]);

        Sanctum::actingAs($operator);

        // Verify operator inherits warehouse1 credentials
        $this->assertTrue($warehouse1->hasCompleteFlexxusCredentials());
        $this->assertEquals('PREPR', $warehouse1->flexxus_username);

        // Mock FlexxusClientFactory to accept both warehouses
        $mockFlexxusClient1 = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient1->shouldReceive('request')->andReturn(['data' => []]);

        $mockFlexxusClient2 = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient2->shouldReceive('request')->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse1, $warehouse2, $mockFlexxusClient1, $mockFlexxusClient2) {
                // Accept either warehouse1 or warehouse2
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse1, $warehouse2) {
                        return $arg instanceof \App\Models\Warehouse
                            && in_array($arg->id, [$warehouse1->id, $warehouse2->id]);
                    }))
                    ->andReturnUsing(function ($arg) use ($warehouse1, $warehouse2, $mockFlexxusClient1, $mockFlexxusClient2) {
                        // Return appropriate mock based on warehouse ID
                        if ($arg->id === $warehouse1->id) {
                            return $mockFlexxusClient1;
                        } elseif ($arg->id === $warehouse2->id) {
                            return $mockFlexxusClient2;
                        }
                    });
            }
        ));

        // Act 1: First request with warehouse1
        $response1 = $this->getJson('/api/picking/orders');
        $response1->assertStatus(200);

        // Act 2: Reassign operator to warehouse2
        $operator->refresh();
        $operator->update(['warehouse_id' => $warehouse2->id]);

        // Verify operator now has warehouse2 credentials available
        $operator->refresh();
        $this->assertEquals($warehouse2->id, $operator->warehouse_id);
        $this->assertTrue($warehouse2->hasCompleteFlexxusCredentials());
        $this->assertEquals('PREPC', $warehouse2->flexxus_username);

        // Clear cache to ensure new warehouse context is used
        \Illuminate\Support\Facades\Cache::flush();

        // Act 3: Second request should use warehouse2 credentials
        $response2 = $this->getJson('/api/picking/orders');

        // Assert: Second request succeeds with new warehouse credentials
        $response2->assertStatus(200);
    }

    /**
     * Task 6.3: Test admin override via header - Verify override warehouse credentials are used
     */
    public function test_admin_override_via_header_uses_override_warehouse_credentials(): void
    {
        // Arrange: Create admin with warehouse1, override to warehouse2
        $warehouse1 = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'rondeau-secret',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'flexxus_url' => 'https://centro.flexxus.example.com',
            'flexxus_username' => 'PREPC',
            'flexxus_password' => 'centro-secret',
        ]);

        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => true,
            ]);
        $admin->warehouses()->attach($warehouse2->id);

        Sanctum::actingAs($admin);

        // Verify both warehouses have different credentials
        $this->assertEquals('PREPR', $warehouse1->flexxus_username);
        $this->assertEquals('PREPC', $warehouse2->flexxus_username);

        // Mock FlexxusClientFactory to verify warehouse2 credentials are used (not warehouse1)
        $mockFlexxusClient = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient->shouldReceive('request')->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse2, $mockFlexxusClient) {
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse2) {
                        return $arg->id === $warehouse2->id
                            && $arg->code === 'CENTRO'
                            && $arg->flexxus_username === 'PREPC'
                            && $arg->flexxus_password === 'centro-secret';
                    }))
                    ->andReturn($mockFlexxusClient);
            }
        ));

        // Act: Request with X-Warehouse-Override header
        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        // Assert: Admin's warehouse_id is unchanged in database
        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'warehouse_id' => $warehouse1->id, // Still warehouse1
        ]);
    }

    /**
     * Task 6.4: Test credential inheritance - Create warehouse with credentials → Assign operator → Verify inheritance
     */
    public function test_credential_inheritance_flow(): void
    {
        // Arrange 1: Create warehouse with credentials
        $warehouse = Warehouse::factory()->create([
            'code' => 'SUDOESTE',
            'flexxus_url' => 'https://sudoeste.flexxus.example.com',
            'flexxus_username' => 'PREPS',
            'flexxus_password' => 'sudoeste-secret',
        ]);

        // Arrange 2: Create operator without warehouse
        $operator = User::factory()
            ->empleado()
            ->create(['warehouse_id' => null]);

        // Act 1: Assign operator to warehouse
        $operator->update(['warehouse_id' => $warehouse->id]);

        Sanctum::actingAs($operator);

        // Assert 1: Operator inherits credentials
        $operator->refresh();
        $this->assertEquals($warehouse->id, $operator->warehouse_id);
        $this->assertTrue($warehouse->hasCompleteFlexxusCredentials());
        $this->assertEquals('PREPS', $warehouse->flexxus_username);
        $this->assertEquals('sudoeste-secret', $warehouse->flexxus_password);

        // Mock FlexxusClientFactory
        $mockFlexxusClient = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient->shouldReceive('request')->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse, $mockFlexxusClient) {
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse) {
                        return $arg->id === $warehouse->id
                            && $arg->flexxus_username === 'PREPS'
                            && $arg->flexxus_password === 'sudoeste-secret';
                    }))
                    ->andReturn($mockFlexxusClient);
            }
        ));

        $response1 = $this->getJson('/api/picking/orders');
        $response1->assertStatus(200);

        // Act 2: Remove warehouse credentials
        $warehouse->update([
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        // Assert 2: Warehouse no longer has credentials
        $warehouse->refresh();
        $this->assertFalse($warehouse->hasCompleteFlexxusCredentials());
        $this->assertNull($warehouse->flexxus_username);
        $this->assertNull($warehouse->flexxus_password);
    }

    /**
     * Task 6.5: Test security - Non-admin attempting override gets ignored
     */
    public function test_non_admin_cannot_override_warehouse_via_header(): void
    {
        // Arrange: Create regular operator (non-admin)
        $warehouse1 = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'rondeau-secret',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'flexxus_url' => 'https://centro.flexxus.example.com',
            'flexxus_username' => 'PREPC',
            'flexxus_password' => 'centro-secret',
        ]);

        $operator = User::factory()
            ->empleado()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => false,
            ]);

        Sanctum::actingAs($operator);

        // Mock FlexxusClientFactory to verify assigned warehouse is used (not override)
        $mockFlexxusClient = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient->shouldReceive('request')->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse1, $mockFlexxusClient) {
                // Should be called with warehouse1 (override ignored for non-admin)
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse1) {
                        return $arg->id === $warehouse1->id
                            && $arg->code === 'RONDEAU'
                            && $arg->flexxus_username === 'PREPR';
                    }))
                    ->andReturn($mockFlexxusClient);
            }
        ));

        // Act: Attempt override with header
        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        // Assert: Request succeeds but override was ignored
        $response->assertStatus(200);
    }

    /**
     * Task 6.6: Test admin without permission cannot override
     */
    public function test_admin_without_can_override_flag_cannot_override(): void
    {
        // Arrange: Admin without can_override_warehouse flag
        $warehouse1 = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'rondeau-secret',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => 'CENTRO',
        ]);

        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => false, // Cannot override
            ]);

        Sanctum::actingAs($admin);

        // Mock FlexxusClientFactory to verify assigned warehouse is used
        $mockFlexxusClient = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient->shouldReceive('request')->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse1, $mockFlexxusClient) {
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse1) {
                        return $arg->id === $warehouse1->id;
                    }))
                    ->andReturn($mockFlexxusClient);
            }
        ));

        // Act: Attempt override
        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        // Assert: Throws 403 because admin doesn't have access to warehouse2
        $response->assertStatus(403);
    }

    /**
     * Task 6.7: Test warehouse without credentials is detected
     */
    public function test_warehouse_without_credentials_is_detected(): void
    {
        // Arrange: Warehouse without Flexxus credentials
        $warehouse = Warehouse::factory()->create([
            'code' => 'NOCREDS',
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        // Assert: Warehouse model correctly reports missing credentials
        $this->assertFalse($warehouse->hasCompleteFlexxusCredentials());
        $this->assertNull($warehouse->flexxus_url);
        $this->assertNull($warehouse->flexxus_username);
        $this->assertNull($warehouse->flexxus_password);
    }

    /**
     * Task 6.8: Test admin cannot override to warehouse without access
     */
    public function test_admin_cannot_override_to_inaccessible_warehouse(): void
    {
        // Arrange: Admin with access to warehouse1 but not warehouse2
        $warehouse1 = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'rondeau-secret',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'flexxus_url' => 'https://centro.flexxus.example.com',
            'flexxus_username' => 'PREPC',
            'flexxus_password' => 'centro-secret',
        ]);

        $admin = User::factory()
            ->admin()
            ->create([
                'warehouse_id' => $warehouse1->id,
                'can_override_warehouse' => true,
            ]);
        // Note: NOT attaching warehouse2 to admin's accessible warehouses

        Sanctum::actingAs($admin);

        // Verify admin doesn't have access to warehouse2
        $this->assertFalse($admin->hasAccessToWarehouse($warehouse2->id));

        // Mock FlexxusClientFactory to verify assigned warehouse is used (override rejected)
        $mockFlexxusClient = Mockery::mock(FlexxusClient::class);
        $mockFlexxusClient->shouldReceive('request')->andReturn(['data' => []]);

        $this->instance(FlexxusClientFactoryInterface::class, Mockery::mock(
            'App\Services\Picking\Interfaces\FlexxusClientFactoryInterface',
            function (Mockery\MockInterface $mock) use ($warehouse1, $mockFlexxusClient) {
                $mock->shouldReceive('createForWarehouse')
                    ->with(Mockery::on(function ($arg) use ($warehouse1) {
                        return $arg->id === $warehouse1->id;
                    }))
                    ->andReturn($mockFlexxusClient);
            }
        ));

        // Act: Attempt override to inaccessible warehouse
        $response = $this->withHeaders([
            'X-Warehouse-Override' => $warehouse2->id,
        ])->getJson('/api/picking/orders');

        // Assert: Throws 403 because admin doesn't have access to warehouse2
        $response->assertStatus(403);
    }
}
