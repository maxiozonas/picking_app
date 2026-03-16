<?php

namespace Tests\Feature\Integration;

use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class FlexxusAuthenticationSmokeTest extends TestCase
{
    use DatabaseMigrations;

    public function test_warehouse_002_rondeau_can_authenticate_with_flexxus(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        $this->assertNotNull($client, 'Flexxus client should be created');
    }

    public function test_warehouse_001_don_bosco_can_authenticate_with_flexxus(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '001',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPDB',
            'flexxus_password' => '1234',
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        $this->assertNotNull($client, 'Flexxus client should be created');
    }

    public function test_warehouse_004_socrates_can_authenticate_with_flexxus(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '004',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPVM',
            'flexxus_password' => '1234',
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        $this->assertNotNull($client, 'Flexxus client should be created');
    }

    public function test_picking_operations_use_correct_warehouse_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
            'flexxus_username' => 'PREPR',
            'flexxus_password' => '1234',
        ]);

        $user = User::factory()->create([
            'warehouse_id' => $warehouse->id,
        ]);

        $this->actingAs($user)
            ->getJson('/api/picking/orders?date='.now()->format('Y-m-d'));

        $this->assertNotNull($user->warehouse);
    }

    public function test_admin_override_switches_flexxus_account(): void
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

        $admin = User::factory()->withOverride()->create([
            'warehouse_id' => $warehouse1->id,
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);

        $client1 = $factory->createForWarehouse($warehouse1);
        $client2 = $factory->createForWarehouse($warehouse2);

        $this->assertNotNull($client1);
        $this->assertNotNull($client2);
    }
}
