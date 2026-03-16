<?php

namespace Tests\Feature\Api\Admin;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Mockery;
use Mockery\MockInterface;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminOrdersTest extends TestCase
{
    use DatabaseMigrations;

    private User $admin;

    private Warehouse $warehouse;

    /** @var FlexxusClientFactoryInterface&MockInterface */
    private FlexxusClientFactoryInterface $mockFactory;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);

        $this->warehouse = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);
        $this->admin = User::factory()->admin()->create();

        $this->mockFactory = Mockery::mock(FlexxusClientFactoryInterface::class);
        $this->app->instance(FlexxusClientFactoryInterface::class, $this->mockFactory);
    }

    public function test_started_order_detail_keeps_flexxus_created_at_separate_from_local_lifecycle(): void
    {
        $employee = User::factory()->empleado()->create();

        $order = PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623202',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $employee->id,
            'status' => 'in_progress',
            'customer' => 'Cliente A',
            'started_at' => '2026-03-09 09:00:00',
            'completed_at' => null,
        ]);

        $client = Mockery::mock(FlexxusClient::class);
        $client->shouldReceive('request')
            ->andReturnUsing(function (string $method, string $path) {
                if (str_contains($path, '/v2/deliverydata/NP/623202')) {
                    return ['data' => [['CODIGOTIPOENTREGA' => 1]]];
                }

                return [
                    'data' => [
                        'RAZONSOCIAL' => 'Cliente A',
                        'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z',
                        'DETALLE' => [],
                    ],
                ];
            });

        $this->mockFactory->shouldReceive('createForWarehouse')->andReturn($client);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/orders/'.$order->order_number);

        $response->assertOk();
        $response->assertJsonPath('data.delivery_type', 'EXPEDICION');
        $response->assertJsonPath('data.flexxus_created_at', '2026-03-09T08:00:00Z');
        $response->assertJsonPath('data.started_at', '2026-03-09T09:00:00+00:00');
        $response->assertJsonMissingPath('data.created_at');
    }

    public function test_pending_order_list_and_detail_keep_delivery_metadata_consistent(): void
    {
        $employee = User::factory()->empleado()->create();

        $order = PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623202',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $employee->id,
            'status' => 'in_progress',
            'customer' => 'Cliente A',
            'started_at' => '2026-03-09 09:00:00',
            'completed_at' => null,
        ]);

        $client = Mockery::mock(FlexxusClient::class);
        $client->shouldReceive('request')
            ->andReturnUsing(function (string $method, string $path) {
                if ($path === '/v2/orders') {
                    return [
                        'data' => [
                            [
                                'NUMEROCOMPROBANTE' => '623202',
                                'RAZONSOCIAL' => 'Cliente A',
                                'TOTAL' => 1000,
                                'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z',
                                'DEPOSITO' => 'Don Bosco',
                            ],
                        ],
                    ];
                }

                if ($path === '/v2/deliverydata/NP/623202') {
                    return ['data' => [['CODIGOTIPOENTREGA' => 1]]];
                }

                return [
                    'data' => [
                        'RAZONSOCIAL' => 'Cliente A',
                        'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z',
                        'DETALLE' => [],
                    ],
                ];
            });
        $client->shouldReceive('requestMany')
            ->andReturn([
                ['data' => [['CODIGOTIPOENTREGA' => 1]]],
            ]);

        $this->mockFactory->shouldReceive('createForWarehouse')->andReturn($client);

        $listResponse = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&status=all');
        $detailResponse = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders/'.$order->order_number);

        $listResponse->assertOk()->assertJsonCount(1, 'data');
        $detailResponse->assertOk();

        $listOrder = $listResponse->json('data.0');
        $detailOrder = $detailResponse->json('data');

        $this->assertSame($listOrder['order_number'], $detailOrder['order_number']);
        $this->assertSame($listOrder['delivery_type'], $detailOrder['delivery_type']);
        $this->assertSame($listOrder['flexxus_created_at'], $detailOrder['flexxus_created_at']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
