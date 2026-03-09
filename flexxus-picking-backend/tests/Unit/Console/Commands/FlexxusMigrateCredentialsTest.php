<?php

namespace Tests\Unit\Console\Commands;

use App\Models\Warehouse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class FlexxusMigrateCredentialsTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear warehouses first
        Warehouse::query()->delete();

        // Set up .env config values for testing
        Config::set('flexxus.url', 'https://test.flexxus.com');
        Config::set('flexxus.username', 'test_flexxus_user');
        Config::set('flexxus.password', 'test_flexxus_password');
    }

    public function test_command_exists_and_is_executable(): void
    {
        // Arrange
        Warehouse::factory()->create([
            'code' => 'TEST001',
            'name' => 'Test Warehouse',
            'is_active' => true,
        ]);

        // Act
        $exitCode = Artisan::call('flexxus:migrate-credentials', ['--dry-run' => true]);

        // Assert
        $this->assertEquals(0, $exitCode);
        $output = Artisan::output();
        $this->assertStringContainsString('Flexxus Credentials Migration', $output);
    }

    public function test_dry_run_shows_changes_without_modifying_database(): void
    {
        // Arrange
        Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'name' => 'Depósito RONDEAU',
            'is_active' => true,
        ]);

        // Act
        Artisan::call('flexxus:migrate-credentials', ['--dry-run' => true]);
        $output = Artisan::output();

        // Assert
        $this->assertStringContainsString('DRY RUN MODE', $output);
        $this->assertStringContainsString('RONDEAU', $output);
        $this->assertStringContainsString('INSERT', $output);

        // Verify database was NOT modified
        $warehouse = Warehouse::where('code', 'RONDEAU')->first();
        $this->assertNull($warehouse->flexxus_username);
        $this->assertNull($warehouse->flexxus_password);
    }

    public function test_migration_updates_warehouses_with_credentials(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'name' => 'Depósito RONDEAU',
            'is_active' => true,
        ]);

        // Act - Run without confirmation (simulate 'yes' answer)
        $this->artisan('flexxus:migrate-credentials')
            ->expectsConfirmation('Do you want to migrate these credentials?', 'yes')
            ->assertExitCode(0);

        // Assert - Verify database was updated
        $warehouse->refresh();
        $this->assertEquals('test_flexxus_user', $warehouse->flexxus_username);

        // Verify password was stored (encrypted by model cast)
        $this->assertNotEmpty($warehouse->flexxus_password);
    }

    public function test_command_warns_when_no_warehouses_found(): void
    {
        // Arrange - Delete all warehouses
        Warehouse::query()->delete();

        // Act
        $exitCode = Artisan::call('flexxus:migrate-credentials', ['--dry-run' => true]);
        $output = Artisan::output();

        // Assert
        $this->assertEquals(1, $exitCode);
        $this->assertStringContainsString('No warehouses found', $output);
    }

    public function test_command_requires_credentials(): void
    {
        // Arrange - Clear config (but keep URL as it's checked first)
        Config::set('flexxus.url', '');

        Warehouse::factory()->create([
            'code' => 'TEST001',
            'name' => 'Test Warehouse',
            'is_active' => true,
        ]);

        // Act
        $exitCode = Artisan::call('flexxus:migrate-credentials', ['--dry-run' => true]);
        $output = Artisan::output();

        // Assert - Command should fail due to missing credentials
        $this->assertEquals(1, $exitCode);
        $this->assertStringContainsString('credentials not found', $output);
    }

    public function test_migration_skips_warehouses_with_existing_credentials(): void
    {
        // Arrange - Create warehouse with existing credentials
        Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'name' => 'Depósito RONDEAU',
            'is_active' => true,
            'flexxus_url' => 'https://existing.flexxus.com',
            'flexxus_username' => 'existing_user',
            'flexxus_password' => 'existing_password',
        ]);

        // Create another warehouse without credentials
        Warehouse::factory()->create([
            'code' => 'NEW_WH',
            'name' => 'New Warehouse',
            'is_active' => true,
        ]);

        // Act
        $this->artisan('flexxus:migrate-credentials')
            ->expectsConfirmation('Do you want to migrate these credentials?', 'yes')
            ->assertExitCode(0);

        // Assert
        $warehouseWithCreds = Warehouse::where('code', 'RONDEAU')->first();
        $this->assertEquals('https://existing.flexxus.com', $warehouseWithCreds->flexxus_url);
        $this->assertEquals('existing_user', $warehouseWithCreds->flexxus_username);

        // New warehouse should get credentials
        $warehouseWithoutCreds = Warehouse::where('code', 'NEW_WH')->first();
        $this->assertEquals('https://test.flexxus.com', $warehouseWithoutCreds->flexxus_url);
    }

    public function test_specific_warehouse_migration(): void
    {
        // Arrange
        Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'name' => 'Depósito RONDEAU',
            'is_active' => true,
        ]);
        Warehouse::factory()->create([
            'code' => 'OTHER',
            'name' => 'Other Warehouse',
            'is_active' => true,
        ]);

        // Act - Migrate only RONDEAU
        $this->artisan('flexxus:migrate-credentials', ['--warehouse' => 'RONDEAU'])
            ->expectsConfirmation('Do you want to migrate these credentials?', 'yes')
            ->assertExitCode(0);

        // Assert
        $rondeau = Warehouse::where('code', 'RONDEAU')->first();
        $this->assertEquals('test_flexxus_user', $rondeau->flexxus_username);

        // Other warehouse should NOT have credentials
        $other = Warehouse::where('code', 'OTHER')->first();
        $this->assertNull($other->flexxus_url);
    }
}
