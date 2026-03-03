<?php

namespace Tests\Unit\Repositories;

use App\Models\Warehouse;
use App\Repositories\Flexxus\WarehouseRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private WarehouseRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new WarehouseRepository;
    }

    public function test_sync_from_flexxus_creates_new_warehouses(): void
    {
        $flexxusData = [
            [
                'CODIGODEPOSITO' => 'WH001',
                'DESCRIPCION' => 'Main Warehouse',
                'CLIENTE' => 'Client A',
                'SUCURSAL' => 'Branch 1',
                'DEPOSITOVISIBLE' => '1',
            ],
            [
                'CODIGODEPOSITO' => 'WH002',
                'DESCRIPCION' => 'Secondary Warehouse',
                'CLIENTE' => 'Client B',
                'SUCURSAL' => 'Branch 2',
                'DEPOSITOVISIBLE' => '0',
            ],
        ];

        $this->repository->syncFromFlexxus($flexxusData);

        $this->assertDatabaseCount('warehouses', 2);

        $warehouse1 = Warehouse::where('code', 'WH001')->first();
        $this->assertNotNull($warehouse1);
        $this->assertEquals('Main Warehouse', $warehouse1->name);
        $this->assertEquals('Client A', $warehouse1->client);
        $this->assertEquals('Branch 1', $warehouse1->branch);
        $this->assertTrue($warehouse1->is_active);

        $warehouse2 = Warehouse::where('code', 'WH002')->first();
        $this->assertNotNull($warehouse2);
        $this->assertEquals('Secondary Warehouse', $warehouse2->name);
        $this->assertEquals('Client B', $warehouse2->client);
        $this->assertEquals('Branch 2', $warehouse2->branch);
        $this->assertFalse($warehouse2->is_active);
    }

    public function test_sync_from_flexxus_updates_existing_warehouses(): void
    {
        $existingWarehouse = Warehouse::factory()->create([
            'code' => 'WH001',
            'name' => 'Old Name',
            'client' => 'Old Client',
            'branch' => 'Old Branch',
            'is_active' => false,
        ]);

        $flexxusData = [
            [
                'CODIGODEPOSITO' => 'WH001',
                'DESCRIPCION' => 'Updated Name',
                'CLIENTE' => 'Updated Client',
                'SUCURSAL' => 'Updated Branch',
                'DEPOSITOVISIBLE' => '1',
            ],
        ];

        $this->repository->syncFromFlexxus($flexxusData);

        $this->assertDatabaseCount('warehouses', 1);

        $warehouse = Warehouse::where('code', 'WH001')->first();
        $this->assertEquals($existingWarehouse->id, $warehouse->id);
        $this->assertEquals('Updated Name', $warehouse->name);
        $this->assertEquals('Updated Client', $warehouse->client);
        $this->assertEquals('Updated Branch', $warehouse->branch);
        $this->assertTrue($warehouse->is_active);
    }

    public function test_get_active_returns_only_active_warehouses(): void
    {
        Warehouse::factory()->create(['code' => 'WH001', 'is_active' => true]);
        Warehouse::factory()->create(['code' => 'WH002', 'is_active' => false]);
        Warehouse::factory()->create(['code' => 'WH003', 'is_active' => true]);

        $result = $this->repository->getActive();

        $this->assertCount(2, $result);
        $this->assertTrue($result->contains('code', 'WH001'));
        $this->assertFalse($result->contains('code', 'WH002'));
        $this->assertTrue($result->contains('code', 'WH003'));
    }

    public function test_find_by_code_returns_warehouse(): void
    {
        Warehouse::factory()->create(['code' => 'WH001']);
        Warehouse::factory()->create(['code' => 'WH002']);

        $result = $this->repository->findByCode('WH001');

        $this->assertNotNull($result);
        $this->assertEquals('WH001', $result->code);
    }

    public function test_find_by_code_returns_null_when_not_found(): void
    {
        $result = $this->repository->findByCode('NONEXISTENT');

        $this->assertNull($result);
    }

    public function test_all_returns_all_warehouses(): void
    {
        Warehouse::factory()->create(['code' => 'WH001']);
        Warehouse::factory()->create(['code' => 'WH002']);
        Warehouse::factory()->create(['code' => 'WH003']);

        $result = $this->repository->all();

        $this->assertCount(3, $result);
        $this->assertTrue($result->contains('code', 'WH001'));
        $this->assertTrue($result->contains('code', 'WH002'));
        $this->assertTrue($result->contains('code', 'WH003'));
    }
}
