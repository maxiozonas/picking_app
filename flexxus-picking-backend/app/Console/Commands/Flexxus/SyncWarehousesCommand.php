<?php

namespace App\Console\Commands\Flexxus;

use App\Services\Flexxus\WarehouseServiceInterface;
use Illuminate\Console\Command;

class SyncWarehousesCommand extends Command
{
    protected $signature = 'flexxus:sync-warehouses';

    protected $description = 'Sync warehouses from Flexxus API';

    private WarehouseServiceInterface $warehouseService;

    public function __construct(WarehouseServiceInterface $warehouseService)
    {
        parent::__construct();
        $this->warehouseService = $warehouseService;
    }

    public function handle(): int
    {
        try {
            $this->warehouseService->syncFromFlexxus();
            $this->info('Warehouses synced successfully.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to sync warehouses: {$e->getMessage()}");

            return Command::FAILURE;
        }
    }
}
