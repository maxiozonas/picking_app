<?php

namespace Tests\Unit\Console\Commands;

use App\Services\Flexxus\WarehouseServiceInterface;
use Mockery;
use Tests\TestCase;

class SyncWarehousesCommandTest extends TestCase
{
    public function test_sync_warehouses_calls_service_and_outputs_success(): void
    {
        $warehouseService = Mockery::mock(WarehouseServiceInterface::class);
        $warehouseService
            ->shouldReceive('syncFromFlexxus')
            ->once()
            ->andReturnTrue();

        $this->app->instance(WarehouseServiceInterface::class, $warehouseService);

        $this->artisan('flexxus:sync-warehouses')
            ->assertExitCode(0)
            ->expectsOutput('Warehouses synced successfully.');
    }

    public function test_sync_warehouses_handles_exception_and_outputs_error(): void
    {
        $warehouseService = Mockery::mock(WarehouseServiceInterface::class);
        $warehouseService
            ->shouldReceive('syncFromFlexxus')
            ->once()
            ->andThrow(new \Exception('Connection failed'));

        $this->app->instance(WarehouseServiceInterface::class, $warehouseService);

        $this->artisan('flexxus:sync-warehouses')
            ->assertExitCode(1)
            ->expectsOutput('Failed to sync warehouses: Connection failed');
    }
}
