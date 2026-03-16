<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CredentialExposureTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles directly without seeder to avoid nested transactions
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'empleado']);
    }

    public function test_warehouse_collection_hides_credentials(): void
    {
        // Arrange - Create multiple warehouses with credentials
        Warehouse::factory()->create([
            'code' => '001',
            'flexxus_username' => 'user1',
            'flexxus_password' => 'pass1',
        ]);

        Warehouse::factory()->create([
            'code' => '002',
            'flexxus_username' => 'user2',
            'flexxus_password' => 'pass2',
        ]);

        // Act - Get all warehouses
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/warehouses');

        // Assert - No credentials should be exposed
        $response->assertStatus(200);
        $response->assertJsonMissing(['flexxus_url']);
        $response->assertJsonMissing(['flexxus_username']);
        $response->assertJsonMissing(['flexxus_password']);
    }

    public function test_user_warehouse_assignment_hides_credentials(): void
    {
        // Arrange - Create warehouse with credentials
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_username' => 'api',
            'flexxus_password' => '7171',
        ]);

        $employee = User::factory()->create(['role' => 'empleado']);

        // Act - Assign warehouse to user
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/users/{$employee->id}/warehouses/{$warehouse->id}");

        // Assert - Response should not include credentials
        $response->assertStatus(200);
        $response->assertJsonMissing(['flexxus_url']);
        $response->assertJsonMissing(['flexxus_username']);
        $response->assertJsonMissing(['flexxus_password']);

        // Only basic warehouse info should be present
        $response->assertJsonFragment([
            'id' => $warehouse->id,
            'code' => '002',
        ]);
    }

    public function test_get_user_warehouse_hides_credentials(): void
    {
        // Arrange - Create employee with warehouse that has credentials
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_username' => 'api',
            'flexxus_password' => '7171',
        ]);

        $employee = User::factory()->create([
            'role' => 'empleado',
            'warehouse_id' => $warehouse->id,
        ]);

        // Act - Get user warehouse
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/admin/users/{$employee->id}/warehouses");

        // Assert - Credentials should not be exposed
        $response->assertStatus(200);
        $response->assertJsonMissing(['flexxus_url']);
        $response->assertJsonMissing(['flexxus_username']);
        $response->assertJsonMissing(['flexxus_password']);

        // But basic info should be present
        $response->assertJsonFragment([
            'id' => $warehouse->id,
            'code' => '002',
        ]);
    }

    public function test_encrypted_credentials_not_accessible_via_array(): void
    {
        // Arrange - Create warehouse with credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'api',
            'flexxus_password' => '7171',
        ]);

        // Act - Convert warehouse to array
        $warehouseArray = $warehouse->toArray();

        // Assert - Model serialization should hide credentials by default
        $this->assertArrayNotHasKey('flexxus_url', $warehouseArray);
        $this->assertArrayNotHasKey('flexxus_username', $warehouseArray);
        $this->assertArrayNotHasKey('flexxus_password', $warehouseArray);
    }

    public function test_warehouse_collection_exposes_credential_status_without_exposing_secrets(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://db.flexxus.example.com',
            'flexxus_username' => 'PREPDB',
            'flexxus_password' => 'secret-pass',
        ]);

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/warehouses');

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $warehouse->id,
                'has_flexxus_credentials' => true,
            ])
            ->assertJsonMissing(['flexxus_url' => 'https://db.flexxus.example.com'])
            ->assertJsonMissing(['flexxus_username' => 'PREPDB'])
            ->assertJsonMissing(['flexxus_password' => 'secret-pass']);
    }
}
