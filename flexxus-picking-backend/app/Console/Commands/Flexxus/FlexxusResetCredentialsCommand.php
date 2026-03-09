<?php

namespace App\Console\Commands\Flexxus;

use App\Models\Warehouse;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FlexxusResetCredentialsCommand extends Command
{
    protected $signature = 'flexxus:reset-credentials
                            {--warehouse= : Reset credentials for a specific warehouse code}
                            {--all : Reset credentials for all warehouses}';

    protected $description = 'Reset Flexxus credentials from database to use .env fallback';

    public function handle(): int
    {
        $this->info('Flexxus Credentials Reset');
        $this->line('This command clears database credentials to use .env fallback.');
        $this->newLine();

        // Get warehouses to reset
        $warehouses = $this->getWarehousesToReset();

        if ($warehouses->isEmpty()) {
            $this->warn('No warehouses found with credentials to reset.');

            return Command::SUCCESS;
        }

        $this->info("Found {$warehouses->count()} warehouse(s) with credentials:");
        $this->newLine();

        // Display current state
        $headers = ['Code', 'Name', 'Current URL', 'Current Username'];
        $rows = $warehouses->map(function (Warehouse $warehouse) {
            return [
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'current_url' => $warehouse->flexxus_url ?? '(none)',
                'current_username' => $warehouse->flexxus_username ?? '(none)',
            ];
        })->toArray();

        $this->table($headers, $rows);
        $this->newLine();

        // Confirm reset
        if (! $this->confirm('Do you want to clear these credentials?', true)) {
            $this->info('Reset cancelled.');

            return Command::SUCCESS;
        }

        // Perform reset
        return $this->resetCredentials($warehouses);
    }

    private function getWarehousesToReset()
    {
        // Must specify either --warehouse or --all
        $warehouseCode = $this->option('warehouse');
        $all = $this->option('all');

        if (! $warehouseCode && ! $all) {
            $this->error('Please specify either --warehouse=<code> or --all');
            $this->line('Examples:');
            $this->line('  php artisan flexxus:reset-credentials --warehouse=DEP01');
            $this->line('  php artisan flexxus:reset-credentials --all');

            return collect();
        }

        if ($warehouseCode) {
            $warehouse = Warehouse::where('code', $warehouseCode)->first();

            if (! $warehouse) {
                $this->error("Warehouse with code '{$warehouseCode}' not found.");

                return collect();
            }

            return collect([$warehouse]);
        }

        // Get all warehouses with credentials
        return Warehouse::whereNotNull('flexxus_url')
            ->whereNotNull('flexxus_username')
            ->get();
    }

    private function resetCredentials($warehouses): int
    {
        $resetCount = 0;

        DB::beginTransaction();

        try {
            foreach ($warehouses as $warehouse) {
                $warehouse->flexxus_url = null;
                $warehouse->flexxus_username = null;
                $warehouse->flexxus_password = null;
                $warehouse->save();

                $this->info("Reset credentials for warehouse: {$warehouse->code}");
                $resetCount++;
            }

            DB::commit();

            $this->newLine();
            $this->info('Reset complete!');
            $this->line("  - Reset: {$resetCount} warehouse(s)");
            $this->line('');
            $this->info('These warehouses will now use .env credentials as fallback.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();

            $this->error("Reset failed: {$e->getMessage()}");

            return Command::FAILURE;
        }
    }
}
