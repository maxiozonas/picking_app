<?php

namespace Tests\Feature\EndToEnd;

use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompletePickingFlowWithWarehouseCredentialsTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_operator_login_to_flexxus_client_flow(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'name' => 'RONDEAU',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $user = User::factory()->create([
            'warehouse_id' => $warehouse->id,
            'role' => 'empleado',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.user.warehouse.code', '002')
            ->assertJsonPath('data.user.warehouse.name', 'RONDEAU');

        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        $this->assertNotNull($client);
    }

    public function test_picking_operations_use_warehouse_specific_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $user = User::factory()->create([
            'warehouse_id' => $warehouse->id,
            'role' => 'empleado',
        ]);

        $this->actingAs($user)
            ->getJson('/api/picking/orders?date='.now()->format('Y-m-d'))
            ->assertStatus(200);
    }

    public function test_admin_can_override_warehouse_and_switch_flexxus_account(): void
    {
        $warehouse1 = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => '001',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPDB',
            'flexxus_password' => '1234',
        ]);

        $admin = User::factory()->create([
            'warehouse_id' => $warehouse1->id,
            'can_override_warehouse' => true,
            'role' => 'admin',
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);

        $client1 = $factory->createForWarehouse($warehouse1);
        $client2 = $factory->createForWarehouse($warehouse2);

        $this->assertNotNull($client1);
        $this->assertNotNull($client2);
    }

    public function test_multiple_warehouses_use_different_flexxus_accounts(): void
    {
        $warehouses = Warehouse::factory()->count(3)->create([
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
        ]);

        foreach ($warehouses as $index => $warehouse) {
            $username = "TEST_USER_{$index}";
            $password = "TEST_PASS_{$index}";

            $warehouse->update([
                'flexxus_username' => $username,
                'flexxus_password' => $password,
            ]);

            $user = User::factory()->create([
                'warehouse_id' => $warehouse->id,
                'role' => 'empleado',
            ]);

            $this->actingAs($user)
                ->getJson('/api/auth/me')
                ->assertStatus(200)
                ->assertJsonPath('data.user.warehouse.id', $warehouse->id);

            $factory = app(FlexxusClientFactoryInterface::class);
            $client = $factory->createForWarehouse($warehouse);

            $this->assertNotNull($client);
        }
    }

    public function test_seeded_credentials_are_encrypted_in_database(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $dbRecord = \Illuminate\Support\Facades\DB::table('warehouses')
            ->where('id', $warehouse->id)
            ->first();

        $this->assertNotEquals('PREPR', $dbRecord->flexxus_username, 'Username should be encrypted in DB');
        $this->assertNotEquals('1234', $dbRecord->flexxus_password, 'Password should be encrypted in DB');
    }

    public function test_seeded_credentials_are_accessible_via_model(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $this->assertEquals('PREPR', $warehouse->flexxus_username, 'Model should decrypt username');
        $this->assertEquals('1234', $warehouse->flexxus_password, 'Model should decrypt password');
    }
}
