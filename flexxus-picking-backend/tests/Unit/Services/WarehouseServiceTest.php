<?php

namespace Tests\Unit\Services;

use App\Http\Clients\Flexxus\FlexxusClientInterface;
use App\Repositories\Flexxus\WarehouseRepositoryInterface;
use App\Services\Flexxus\WarehouseService;
use Illuminate\Support\Collection;
use Mockery;
use Tests\TestCase;

class WarehouseServiceTest extends TestCase
{
    private WarehouseService $warehouseService;

    private FlexxusClientInterface $flexxusClient;

    private WarehouseRepositoryInterface $warehouseRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->flexxusClient = Mockery::mock(FlexxusClientInterface::class);
        $this->warehouseRepository = Mockery::mock(WarehouseRepositoryInterface::class);
        $this->warehouseService = new WarehouseService($this->flexxusClient, $this->warehouseRepository);
    }

    public function test_sync_from_flexxus_fetches_from_api_and_persists(): void
    {
        $warehousesData = [
            ['code' => 'WH01', 'name' => 'Warehouse 1', 'is_active' => true],
            ['code' => 'WH02', 'name' => 'Warehouse 2', 'is_active' => false],
        ];

        $this->flexxusClient
            ->shouldReceive('getWarehouses')
            ->once()
            ->andReturn($warehousesData);

        $this->warehouseRepository
            ->shouldReceive('syncFromFlexxus')
            ->with($warehousesData)
            ->once();

        $result = $this->warehouseService->syncFromFlexxus();

        $this->assertTrue($result);
    }

    public function test_get_active_returns_from_repository(): void
    {
        $warehouses = Collection::make([
            (object) ['id' => 1, 'code' => 'WH01', 'name' => 'Warehouse 1'],
            (object) ['id' => 2, 'code' => 'WH02', 'name' => 'Warehouse 2'],
        ]);

        $this->warehouseRepository
            ->shouldReceive('getActive')
            ->once()
            ->andReturn($warehouses);

        $result = $this->warehouseService->getActive();

        $this->assertCount(2, $result);
        $this->assertEquals('WH01', $result->first()->code);
    }

    public function test_all_returns_from_repository(): void
    {
        $warehouses = Collection::make([
            (object) ['id' => 1, 'code' => 'WH01', 'name' => 'Warehouse 1', 'is_active' => true],
            (object) ['id' => 2, 'code' => 'WH02', 'name' => 'Warehouse 2', 'is_active' => false],
        ]);

        $this->warehouseRepository
            ->shouldReceive('all')
            ->once()
            ->andReturn($warehouses);

        $result = $this->warehouseService->all();

        $this->assertCount(2, $result);
        $this->assertEquals('WH01', $result->first()->code);
    }
}
