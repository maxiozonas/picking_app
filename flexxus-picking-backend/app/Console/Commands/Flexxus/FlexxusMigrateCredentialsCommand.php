<?php

namespace App\Console\Commands\Flexxus;

use App\Models\Warehouse;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FlexxusMigrateCredentialsCommand extends Command
{
    protected $signature = 'flexxus:migrate-credentials
                            {--dry-run : Preview changes without applying them}
                            {--warehouse= : Migrate credentials for a specific warehouse code}';

    protected $description = 'Migrate Flexxus credentials from .env to warehouse database records';

    public function handle(): int
    {
        $this->info('Flexxus Credentials Migration');
        $this->line('This command migrates credentials from .env to warehouse records.');
        $this->newLine();

        // Get credentials from .env (via config)
        $configUrl = config('flexxus.url');
        $configUsername = config('flexxus.username');
        $configPassword = config('flexxus.password');

        if (! $configUrl || ! $configUsername || ! $configPassword) {
            $this->error('Flexxus credentials not found in .env configuration.');
            $this->line('Please ensure FLEXXUS_URL, FLEXXUS_USERNAME, and FLEXXUS_PASSWORD are set.');

            return Command::FAILURE;
        }

        $this->info('Found credentials in .env:');
        $this->line("  URL: {$configUrl}");
        $this->line("  Username: {$configUsername}");
        $this->line('  Password: [HIDDEN]');
        $this->newLine();

        // Get warehouses to migrate
        $warehouses = $this->getWarehousesToMigrate();

        if ($warehouses->isEmpty()) {
            $this->warn('No warehouses found to migrate credentials.');
            $this->line('Run "php artisan flexxus:sync-warehouses" first to sync warehouses from Flexxus.');

            return Command::FAILURE;
        }

        $this->info("Found {$warehouses->count()} warehouse(s) to process:");
        $this->newLine();

        // Display current state and proposed changes
        $headers = ['Code', 'Name', 'Current URL', 'Current Username', 'Action'];
        $rows = $warehouses->map(function (Warehouse $warehouse) {
            $currentUrl = $warehouse->flexxus_url ?? '(none)';
            $currentUsername = $warehouse->flexxus_username ?? '(none)';
            $action = $warehouse->flexxus_url ? 'UPDATE' : 'INSERT';

            return [
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'current_url' => $currentUrl,
                'current_username' => $currentUsername,
                'action' => $action,
            ];
        })->toArray();

        $this->table($headers, $rows);
        $this->newLine();

        // Dry run mode
        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No changes will be made.');
            $this->line('Use without --dry-run to apply changes.');

            return Command::SUCCESS;
        }

        // Confirm migration
        if (! $this->confirm('Do you want to migrate these credentials?', true)) {
            $this->info('Migration cancelled.');

            return Command::SUCCESS;
        }

        // Perform migration
        return $this->migrateCredentials($warehouses, $configUrl, $configUsername, $configPassword);
    }

    private function getWarehousesToMigrate()
    {
        $warehouseCode = $this->option('warehouse');

        if ($warehouseCode) {
            $warehouse = Warehouse::where('code', $warehouseCode)->first();

            if (! $warehouse) {
                $this->error("Warehouse with code '{$warehouseCode}' not found.");

                return collect();
            }

            return collect([$warehouse]);
        }

        // Get all active warehouses that could use these credentials
        // In multi-account mode, we assign .env credentials to all warehouses
        // Each warehouse can later have its own credentials
        return Warehouse::active()->get();
    }

    private function migrateCredentials($warehouses, string $configUrl, string $configUsername, string $configPassword): int
    {
        $successCount = 0;
        $skipCount = 0;

        DB::beginTransaction();

        try {
            foreach ($warehouses as $warehouse) {
                // Check if warehouse already has credentials
                if ($warehouse->flexxus_url && $warehouse->flexxus_username) {
                    $this->line("Skipping {$warehouse->code} - already has credentials.");
                    $skipCount++;

                    continue;
                }

                // Update warehouse with credentials from .env
                $warehouse->flexxus_url = $configUrl;
                $warehouse->flexxus_username = $configUsername;
                $warehouse->flexxus_password = $configPassword;
                $warehouse->save();

                $this->info("Migrated credentials for warehouse: {$warehouse->code}");
                $successCount++;
            }

            DB::commit();

            $this->newLine();
            $this->info('Migration complete!');
            $this->line("  - Updated: {$successCount} warehouse(s)");
            $this->line("  - Skipped: {$skipCount} warehouse(s) (already had credentials)");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();

            $this->error("Migration failed: {$e->getMessage()}");

            return Command::FAILURE;
        }
    }
}
