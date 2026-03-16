<?php

namespace Tests\Feature\Api\Admin;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Mockery\MockInterface;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPendingOrdersTest extends TestCase
{
    use DatabaseMigrations;

    private User $admin;

    /** @var FlexxusClientFactoryInterface&MockInterface */
    private FlexxusClientFactoryInterface $mockFactory;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);

        $this->admin = User::factory()->admin()->create();
        $this->mockFactory = Mockery::mock(FlexxusClientFactoryInterface::class);
        $this->app->instance(FlexxusClientFactoryInterface::class, $this->mockFactory);

        Cache::flush();
    }

    public function test_pending_orders_succeeds_without_selected_warehouse(): void
    {
        $warehouseA = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);
        $warehouseB = Warehouse::factory()->create(['code' => '002', 'name' => 'Rondeau']);

        $clientA = $this->mockPendingOrdersClient([
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'Cliente A', 'TOTAL' => 1000, 'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z', 'DEPOSITO' => 'Don Bosco'],
        ], [
            ['data' => [['CODIGOTIPOENTREGA' => 1]]],
        ]);
        $clientB = $this->mockPendingOrdersClient([
            ['NUMEROCOMPROBANTE' => '623203', 'RAZONSOCIAL' => 'Cliente B', 'TOTAL' => 2000, 'FECHACOMPROBANTE' => '2026-03-09T09:00:00Z', 'DEPOSITO' => 'Rondeau'],
        ], [
            ['data' => [['CODIGOTIPOENTREGA' => 1]]],
        ]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->andReturnUsing(fn (Warehouse $warehouse) => $warehouse->is($warehouseA) ? $clientA : $clientB);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/pending-orders?status=all');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_pending_orders_still_validates_unknown_warehouse_id(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id=99999');

        $response->assertStatus(422)->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_pending_orders_only_returns_expedicion_and_explicit_date_fields(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);

        $client = $this->mockPendingOrdersClient([
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'Cliente A', 'TOTAL' => 1000, 'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z', 'DEPOSITO' => 'Don Bosco'],
            ['NUMEROCOMPROBANTE' => '623203', 'RAZONSOCIAL' => 'Cliente B', 'TOTAL' => 2000, 'FECHACOMPROBANTE' => '2026-03-09T09:00:00Z', 'DEPOSITO' => 'Don Bosco'],
        ], [
            ['data' => [['CODIGOTIPOENTREGA' => 1]]],
            ['data' => [['CODIGOTIPOENTREGA' => 2]]],
        ]);

        $this->mockFactory->shouldReceive('createForWarehouse')->andReturn($client);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$warehouse->id.'&status=all');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.delivery_type', 'EXPEDICION');
        $response->assertJsonPath('data.0.flexxus_created_at', '2026-03-09T08:00:00Z');
        $response->assertJsonPath('data.0.started_at', null);
        $response->assertJsonMissingPath('data.0.created_at');
    }

    public function test_pending_orders_excludes_orders_with_unresolved_or_unusable_delivery_metadata(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);

        $client = $this->mockPendingOrdersClient([
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'Cliente A', 'TOTAL' => 1000, 'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z', 'DEPOSITO' => 'Don Bosco'],
            ['NUMEROCOMPROBANTE' => '623203', 'RAZONSOCIAL' => 'Cliente B', 'TOTAL' => 2000, 'FECHACOMPROBANTE' => '2026-03-09T09:00:00Z', 'DEPOSITO' => 'Don Bosco'],
            ['NUMEROCOMPROBANTE' => '623204', 'RAZONSOCIAL' => 'Cliente C', 'TOTAL' => 3000, 'FECHACOMPROBANTE' => '2026-03-09T10:00:00Z', 'DEPOSITO' => 'Don Bosco'],
        ], [
            ['data' => [['CODIGOTIPOENTREGA' => 1]]],
            ['data' => []],
            ['data' => [['CODIGOTIPOENTREGA' => null]]],
        ]);

        $this->mockFactory->shouldReceive('createForWarehouse')->andReturn($client);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$warehouse->id.'&status=all');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.order_number', 'NP 623202');
        $response->assertJsonMissing(['order_number' => 'NP 623203']);
        $response->assertJsonMissing(['order_number' => 'NP 623204']);
    }

    public function test_refresh_pending_orders_allows_omitted_warehouse_id(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);

        $requestCount = 0;
        $client = Mockery::mock(FlexxusClient::class);
        $client->shouldReceive('request')
            ->andReturnUsing(function () use (&$requestCount) {
                $requestCount++;

                return ['data' => [
                    ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'Cliente A', 'TOTAL' => 1000, 'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z', 'DEPOSITO' => 'Don Bosco'],
                ]];
            });
        $client->shouldReceive('requestMany')
            ->andReturn([
                ['data' => [['CODIGOTIPOENTREGA' => 1]]],
            ]);

        $this->mockFactory->shouldReceive('createForWarehouse')->andReturn($client);

        $this->actingAs($this->admin)->getJson('/api/admin/pending-orders?status=all');
        $response = $this->actingAs($this->admin)->postJson('/api/admin/pending-orders/refresh');

        $response->assertOk();
        $this->assertSame(4, $requestCount);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @return FlexxusClient&MockInterface */
    private function mockPendingOrdersClient(array $orders, array $deliveryResponses): FlexxusClient
    {
        $client = Mockery::mock(FlexxusClient::class);
        $client->shouldReceive('request')->andReturn(['data' => $orders]);
        $client->shouldReceive('requestMany')->andReturn($deliveryResponses);

        return $client;
    }
}
