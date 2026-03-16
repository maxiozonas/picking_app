<?php

namespace Tests\Unit\Seeders;

use App\Models\Warehouse;
use Database\Seeders\FlexxusCredentialsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlexxusCredentialsSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_credentials_for_warehouse_002_rondeau(): void
    {
        Warehouse::create([
            'code' => '002',
            'name' => 'RONDEAU',
            'is_active' => true,
        ]);

        $seeder = new FlexxusCredentialsSeeder;
        $seeder->run();

        $warehouse = Warehouse::where('code', '002')->first();

        $this->assertNotEmpty($warehouse->flexxus_username, 'Warehouse 002 must have flexxus_username');
        $this->assertNotEmpty($warehouse->flexxus_password, 'Warehouse 002 must have flexxus_password');
        $this->assertNotEmpty($warehouse->flexxus_url, 'Warehouse 002 must have flexxus_url');

        $this->assertEquals('PREPR', $warehouse->flexxus_username, 'Warehouse 002 username must be PREPR');
    }

    public function test_it_seeds_credentials_for_warehouse_001_don_bosco(): void
    {
        Warehouse::create([
            'code' => '001',
            'name' => 'DON BOSCO',
            'is_active' => true,
        ]);

        $seeder = new FlexxusCredentialsSeeder;
        $seeder->run();

        $warehouse = Warehouse::where('code', '001')->first();

        $this->assertEquals('PREPDB', $warehouse->flexxus_username, 'Warehouse 001 username must be PREPDB');
        $this->assertNotEmpty($warehouse->flexxus_password);
    }

    public function test_it_seeds_credentials_for_warehouse_004_socrates(): void
    {
        Warehouse::create([
            'code' => '004',
            'name' => 'SOCRATES',
            'is_active' => true,
        ]);

        $seeder = new FlexxusCredentialsSeeder;
        $seeder->run();

        $warehouse = Warehouse::where('code', '004')->first();

        $this->assertEquals('PREPVM', $warehouse->flexxus_username, 'Warehouse 004 username must be PREPVM');
        $this->assertNotEmpty($warehouse->flexxus_password);
    }

    public function test_it_does_not_overwrite_existing_credentials(): void
    {
        Warehouse::create([
            'code' => '002',
            'name' => 'RONDEAU',
            'flexxus_username' => 'EXISTING_USER',
            'flexxus_password' => 'existing_password',
            'flexxus_url' => 'https://existing.example.com',
            'is_active' => true,
        ]);

        $seeder = new FlexxusCredentialsSeeder;
        $seeder->run();

        $warehouse = Warehouse::where('code', '002')->first();

        $this->assertEquals('EXISTING_USER', $warehouse->flexxus_username, 'Existing credentials should not be overwritten');
        $this->assertEquals('existing_password', $warehouse->flexxus_password);
    }

    public function test_it_fails_gracefully_if_warehouse_not_found(): void
    {
        $this->assertNull(Warehouse::where('code', '999')->first());

        $seeder = new FlexxusCredentialsSeeder;

        $seeder->run();

        $this->assertTrue(true, 'Seeder should not throw exception for missing warehouse');
    }
}
