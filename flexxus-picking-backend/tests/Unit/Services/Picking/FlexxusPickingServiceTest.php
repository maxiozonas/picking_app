<?php

namespace Tests\Unit\Services\Picking;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Services\Picking\FlexxusPickingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class FlexxusPickingServiceTest extends TestCase
{
    use RefreshDatabase;

    private FlexxusPickingService $flexxusService;

    private FlexxusClient $mockFlexxusClient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockFlexxusClient = $this->createMock(FlexxusClient::class);
        $this->flexxusService = new FlexxusPickingService($this->mockFlexxusClient);
    }

    public function test_get_product_stock_cache_ttl_is_45_seconds(): void
    {
        // Arrange
        $productCode = 'PROD-001';
        $warehouseCode = 'WH-01';
        $callCount = 0;

        $this->mockFlexxusClient->method('request')
            ->with('GET', "/v2/products/{$productCode}/stock")
            ->willReturnCallback(function () use (&$callCount) {
                $callCount++;

                return [
                    'Product_Stock' => [
                        [
                            'DEPOSITO' => 'WH-01',
                            'LOTE' => 'LOT-123',
                            'STOCKTOTAL' => 100,
                            'ESDEPOSITOLOCAL' => 1,
                        ],
                    ],
                ];
            });

        // Act - First call hits the API
        $result1 = $this->flexxusService->getProductStock($productCode, $warehouseCode);

        // Act - Second call uses cache (within 45s)
        $result2 = $this->flexxusService->getProductStock($productCode, $warehouseCode);

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
        $warehouseCode = 'WH-01';
        $callCount = 0;

        $this->mockFlexxusClient->method('request')
            ->with('GET', "/v2/products/{$productCode}/stock")
            ->willReturnCallback(function () use (&$callCount) {
                $callCount++;

                return [
                    'Product_Stock' => [
                        [
                            'DEPOSITO' => 'WH-01',
                            'LOTE' => 'LOT-456',
                            'STOCKTOTAL' => 50,
                            'ESDEPOSITOLOCAL' => 1,
                        ],
                    ],
                ];
            });

        // Act - First call
        $result1 = $this->flexxusService->getProductStock($productCode, $warehouseCode);

        // Simulate time passing (46 seconds)
        $this->travel(46)->seconds();

        // Act - Second call should hit the API again (cache expired)
        $result2 = $this->flexxusService->getProductStock($productCode, $warehouseCode);

        // Assert
        $this->assertNotNull($result1);
        $this->assertEquals(50, $result1['total']);
        $this->assertEquals($result2['total'], $result1['total']);
        $this->assertEquals(2, $callCount, 'API should be called twice (cache expired after 45s)');
    }
}
