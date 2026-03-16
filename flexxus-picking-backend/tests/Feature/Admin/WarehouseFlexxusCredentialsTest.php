<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WarehouseFlexxusCredentialsTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles directly without seeder to avoid nested transactions
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'empleado']);
    }

    public function test_admin_can_store_warehouse_flexxus_credentials_without_secret_readback(): void
    {
        $admin = User::factory()->admin()->create();
        $warehouse = Warehouse::factory()->create();

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/warehouses/{$warehouse->id}/flexxus-credentials", [
            'flexxus_url' => 'https://rondeau.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'secret-pass',
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'message' => 'Warehouse Flexxus credentials updated successfully',
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'has_flexxus_credentials' => true,
            ])
            ->assertJsonMissing(['flexxus_url' => 'https://rondeau.flexxus.example.com'])
            ->assertJsonMissing(['flexxus_username' => 'PREPR'])
            ->assertJsonMissing(['flexxus_password' => 'secret-pass']);

        $warehouse->refresh();

        $this->assertSame('PREPR', $warehouse->flexxus_username);
        $this->assertSame('secret-pass', $warehouse->flexxus_password);
        $this->assertNotSame(
            'secret-pass',
            DB::table('warehouses')->whereKey($warehouse->id)->value('flexxus_password')
        );
    }

    public function test_admin_can_rotate_existing_warehouse_flexxus_credentials_without_secret_readback(): void
    {
        $admin = User::factory()->admin()->create();
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://old.flexxus.example.com',
            'flexxus_username' => 'OLDUSER',
            'flexxus_password' => 'old-secret',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/warehouses/{$warehouse->id}/flexxus-credentials", [
            'flexxus_url' => 'https://new.flexxus.example.com',
            'flexxus_username' => 'PREPDB',
            'flexxus_password' => 'new-secret',
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $warehouse->id,
                'has_flexxus_credentials' => true,
            ])
            ->assertJsonMissing(['flexxus_username' => 'PREPDB'])
            ->assertJsonMissing(['flexxus_password' => 'new-secret']);

        $warehouse->refresh();

        $this->assertSame('https://new.flexxus.example.com', $warehouse->flexxus_url);
        $this->assertSame('PREPDB', $warehouse->flexxus_username);
        $this->assertSame('new-secret', $warehouse->flexxus_password);
    }

    public function test_admin_can_clear_warehouse_flexxus_credentials(): void
    {
        $admin = User::factory()->admin()->create();
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://vm.flexxus.example.com',
            'flexxus_username' => 'PREPVM',
            'flexxus_password' => 'vm-secret',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/warehouses/{$warehouse->id}/flexxus-credentials");

        $response->assertOk()
            ->assertJsonFragment([
                'message' => 'Warehouse Flexxus credentials cleared successfully',
                'id' => $warehouse->id,
                'has_flexxus_credentials' => false,
            ])
            ->assertJsonMissing(['flexxus_username' => 'PREPVM'])
            ->assertJsonMissing(['flexxus_password' => 'vm-secret']);

        $this->assertDatabaseHas('warehouses', [
            'id' => $warehouse->id,
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);
    }

    public function test_non_admin_cannot_manage_warehouse_flexxus_credentials(): void
    {
        $employee = User::factory()->empleado()->create();
        $warehouse = Warehouse::factory()->create();

        Sanctum::actingAs($employee);

        $putResponse = $this->putJson("/api/admin/warehouses/{$warehouse->id}/flexxus-credentials", [
            'flexxus_url' => 'https://blocked.flexxus.example.com',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => 'blocked-secret',
        ]);
        $deleteResponse = $this->deleteJson("/api/admin/warehouses/{$warehouse->id}/flexxus-credentials");

        $putResponse->assertForbidden();
        $deleteResponse->assertForbidden();

        $this->assertDatabaseHas('warehouses', [
            'id' => $warehouse->id,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);
    }
}
