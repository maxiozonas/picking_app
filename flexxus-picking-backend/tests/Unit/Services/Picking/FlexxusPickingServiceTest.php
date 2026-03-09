<?php

namespace Tests\Unit\Services\Picking;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class FlexxusPickingServiceTest extends TestCase
{
    use RefreshDatabase;

    private FlexxusPickingService $flexxusService;

    private FlexxusClientFactoryInterface $mockFactory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockFactory = $this->createMock(FlexxusClientFactoryInterface::class);
        $this->flexxusService = new FlexxusPickingService($this->mockFactory);
    }

    public function test_get_product_stock_cache_ttl_is_45_seconds(): void
    {
        // Arrange
        $productCode = 'PROD-001';
        $warehouse = Warehouse::factory()->create(['code' => 'WH-01']);
        $callCount = 0;

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        $mockWarehouseClient->method('request')
            ->willReturnCallback(function (string $method, string $endpoint) use (&$callCount, $productCode) {
                $callCount++;
                // Code uses the optimized /v2/products/{code}?warehouse_list=... endpoint
                return [
                    'data' => [[
                        'STOCKTOTALDEPOSITO' => 100,
                        'STOCKREALDEPOSITO'  => 80,
                        'STOCKPEDIDODEPOSITO' => 10,
                    ]],
                ];
            });

        $this->mockFactory->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        // Act - First call hits the API
        $result1 = $this->flexxusService->getProductStock($productCode, $warehouse);

        // Act - Second call uses cache (within 45s)
        $result2 = $this->flexxusService->getProductStock($productCode, $warehouse);

        // Assert
        $this->assertNotNull($result1);
        $this->assertEquals(100, $result1['total']);
        $this->assertEquals($result1, $result2);
        $this->assertEquals(1, $callCount, 'API should be called only once (second call uses cache)');
    }

    public function test_get_product_stock_cache_expires_after_45_seconds(): void
    {
        // Arrange
        $productCode = 'PROD-002';
        $warehouse = Warehouse::factory()->create(['code' => 'WH-01']);
        $callCount = 0;

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        $mockWarehouseClient->method('request')
            ->willReturnCallback(function (string $method, string $endpoint) use (&$callCount, $productCode) {
                $callCount++;
                // Code uses the optimized /v2/products/{code}?warehouse_list=... endpoint
                return [
                    'data' => [[
                        'STOCKTOTALDEPOSITO' => 50,
                        'STOCKREALDEPOSITO'  => 40,
                        'STOCKPEDIDODEPOSITO' => 5,
                    ]],
                ];
            });

        $this->mockFactory->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        // Act - First call
        $result1 = $this->flexxusService->getProductStock($productCode, $warehouse);

        // Simulate time passing (46 seconds)
        $this->travel(46)->seconds();

        // Act - Second call should hit the API again (cache expired)
        $result2 = $this->flexxusService->getProductStock($productCode, $warehouse);

        // Assert
        $this->assertNotNull($result1);
        $this->assertEquals(50, $result1['total']);
        $this->assertEquals($result2['total'], $result1['total']);
        $this->assertEquals(2, $callCount, 'API should be called twice (cache expired after 45s)');
    }

    public function test_factory_is_injected_and_available(): void
    {
        // Assert
        $this->assertInstanceOf(FlexxusPickingService::class, $this->flexxusService);
    }

    public function test_get_product_stock_uses_warehouse_specific_client(): void
    {
        // Arrange
        $productCode = 'PROD-003';
        $warehouse = Warehouse::factory()->create([
            'code' => 'WH-TEST',
            'flexxus_url' => 'https://test.flexxus.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'testpass',
        ]);

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        $mockWarehouseClient->expects($this->once())
            ->method('request')
            ->with('GET', "/v2/products/{$productCode}")
            ->willReturn([
                'data' => [[
                    'STOCKTOTALDEPOSITO'  => 75,
                    'STOCKREALDEPOSITO'   => 70,
                    'STOCKPEDIDODEPOSITO' => 0,
                    'UBICACIONPRODUCTO'   => null,
                ]],
            ]);

        $this->mockFactory->expects($this->once())
            ->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        // Act
        $result = $this->flexxusService->getProductStock($productCode, $warehouse);

        // Assert
        $this->assertNotNull($result);
        $this->assertEquals(75, $result['total']);
        $this->assertEquals('WH-TEST', $result['warehouse']);
    }

    public function test_get_product_stock_falls_back_to_product_detail_stock_array_shape(): void
    {
        $productCode = '51511';
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        // Optimized endpoint returns scalar STOCKTOTALDEPOSITO (filtered by warehouse_list)
        $mockWarehouseClient->method('request')
            ->willReturnCallback(function (string $method, string $endpoint) use ($productCode) {
                if ($method === 'GET' && $endpoint === "/v2/products/{$productCode}") {
                    return [
                        'data' => [[
                            'ID_ARTICULO'        => 16292,
                            'STOCKTOTALDEPOSITO'  => 33,
                            'STOCKREALDEPOSITO'   => 30,
                            'STOCKPEDIDODEPOSITO' => 0,
                            'UBICACIONPRODUCTO'   => 'A-01-02',
                        ]],
                    ];
                }

                $this->fail("Unexpected endpoint called: {$method} {$endpoint}");
            });

        $this->mockFactory->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        $result = $this->flexxusService->getProductStock($productCode, $warehouse);

        $this->assertNotNull($result);
        $this->assertSame(33, $result['total']);
        $this->assertSame('A-01-02', $result['location']);
        $this->assertSame('RONDEAU', $result['warehouse']);
    }

    public function test_get_product_stock_uses_article_id_when_code_lookup_has_no_stock(): void
    {
        $productCode = '111612';
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        // When optimized endpoint returns 0 stock, result should reflect that
        $mockWarehouseClient->method('request')
            ->willReturnCallback(function (string $method, string $endpoint) use ($productCode) {
                if ($method === 'GET' && $endpoint === "/v2/products/{$productCode}") {
                    return [
                        'data' => [[
                            'ID_ARTICULO'        => 70001,
                            'STOCKTOTALDEPOSITO'  => 9,
                            'STOCKREALDEPOSITO'   => 9,
                            'STOCKPEDIDODEPOSITO' => 0,
                            'UBICACIONPRODUCTO'   => null,
                        ]],
                    ];
                }

                $this->fail("Unexpected endpoint called: {$method} {$endpoint}");
            });

        $this->mockFactory->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        $result = $this->flexxusService->getProductStock($productCode, $warehouse);

        $this->assertNotNull($result);
        $this->assertSame(9, $result['total']);
        $this->assertSame('RONDEAU', $result['warehouse']);
        $this->assertNull($result['location']);
    }

    public function test_get_order_detail_uses_warehouse_scoped_client(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $orderNumber = 'NP 12345';

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        $mockWarehouseClient->expects($this->once())
            ->method('request')
            ->with('GET', '/v2/orders/NP/12345')
            ->willReturn([
                'data' => [
                    'NUMEROCOMPROBANTE' => '12345',
                ],
            ]);

        $this->mockFactory->expects($this->once())
            ->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        $result = $this->flexxusService->getOrderDetail($orderNumber, $warehouse);

        $this->assertSame('12345', $result['NUMEROCOMPROBANTE']);
    }

    public function test_get_orders_by_date_passes_warehouse_filter_and_defensively_filters_response(): void
    {
        Cache::flush();

        $warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $orderNumber = '12345';

        $mockWarehouseClient = $this->createMock(FlexxusClient::class);
        $mockWarehouseClient->method('request')
            ->willReturnCallback(function (string $method, string $endpoint, array $data = []) use ($warehouse) {
                if ($method === 'GET' && $endpoint === '/v2/orders') {
                    $this->assertSame([
                        'date_from' => '2026-03-06',
                        'date_to' => '2026-03-06',
                        'warehouse' => $warehouse->code,
                    ], $data);

                    return [
                        'data' => [
                            [
                                'NUMEROCOMPROBANTE' => '12345',
                                'DEPOSITO' => 'RONDEAU',
                                'RAZONSOCIAL' => 'Cliente correcto',
                            ],
                            [
                                'NUMEROCOMPROBANTE' => '99999',
                                'DEPOSITO' => 'CENTRO',
                                'RAZONSOCIAL' => 'Cliente filtrado',
                            ],
                        ],
                    ];
                }

                $this->fail("Unexpected request() call: {$method} {$endpoint}");
            });

        // Delivery data is now fetched concurrently via requestMany
        // Only the RONDEAU order passes warehouse filter, so only one endpoint is sent
        $mockWarehouseClient->method('requestMany')
            ->willReturnCallback(function (array $endpoints) use ($orderNumber) {
                return array_map(function (string $endpoint) use ($orderNumber) {
                    if ($endpoint === "/v2/deliverydata/NP/{$orderNumber}") {
                        return ['data' => [['CODIGOTIPOENTREGA' => 1]]];
                    }

                    return [];
                }, $endpoints);
            });

        $this->mockFactory->expects($this->once())
            ->method('createForWarehouse')
            ->with($warehouse)
            ->willReturn($mockWarehouseClient);

        $result = $this->flexxusService->getOrdersByDateAndWarehouse('2026-03-06', $warehouse);

        $this->assertCount(1, $result);
        $this->assertSame($orderNumber, $result[0]['NUMEROCOMPROBANTE']);
        $this->assertSame('RONDEAU', $result[0]['DEPOSITO']);
        $this->assertSame('EXPEDICION', $result[0]['delivery_type']);
    }

    public function test_get_order_detail_cache_is_scoped_by_warehouse(): void
    {
        Cache::flush();

        $warehouseA = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouseB = Warehouse::factory()->create(['code' => 'CENTRO']);
        $orderNumber = 'NP 12345';

        $mockWarehouseClientA = $this->createMock(FlexxusClient::class);
        $mockWarehouseClientA->expects($this->once())
            ->method('request')
            ->with('GET', '/v2/orders/NP/12345')
            ->willReturn([
                'data' => [
                    'DEPOSITO' => 'RONDEAU',
                ],
            ]);

        $mockWarehouseClientB = $this->createMock(FlexxusClient::class);
        $mockWarehouseClientB->expects($this->once())
            ->method('request')
            ->with('GET', '/v2/orders/NP/12345')
            ->willReturn([
                'data' => [
                    'DEPOSITO' => 'CENTRO',
                ],
            ]);

        $this->mockFactory->expects($this->exactly(2))
            ->method('createForWarehouse')
            ->willReturnCallback(function (Warehouse $warehouse) use ($warehouseA, $mockWarehouseClientA, $mockWarehouseClientB) {
                if ($warehouse->is($warehouseA)) {
                    return $mockWarehouseClientA;
                }

                return $mockWarehouseClientB;
            });

        $resultA = $this->flexxusService->getOrderDetail($orderNumber, $warehouseA);
        $resultB = $this->flexxusService->getOrderDetail($orderNumber, $warehouseB);

        $this->assertSame('RONDEAU', $resultA['DEPOSITO']);
        $this->assertSame('CENTRO', $resultB['DEPOSITO']);
    }
}
