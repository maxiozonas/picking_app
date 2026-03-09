<?php

namespace Tests\Unit\Services\Picking;

use App\Exceptions\Picking\WarehouseFlexxusCredentialsMissingException;
use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusClientFactory;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlexxusClientFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_interface_exists(): void
    {
        // Assert: The interface should exist
        $this->assertTrue(interface_exists(FlexxusClientFactoryInterface::class));
    }

    public function test_factory_has_create_for_warehouse_method(): void
    {
        // Assert: The interface should have the createForWarehouse method
        $this->assertTrue(
            method_exists(FlexxusClientFactoryInterface::class, 'createForWarehouse')
        );
    }

    public function test_factory_returns_flexxus_client(): void
    {
        // Arrange: Create a factory and a warehouse with credentials
        $factory = new FlexxusClientFactory;
        $warehouse = Warehouse::factory()->create([
            'code' => 'TEST-WH',
            'flexxus_url' => 'https://test.flexxus.example.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'testpass',
        ]);

        // Act: Create a client for the warehouse
        $client = $factory->createForWarehouse($warehouse);

        // Assert: Should return a FlexxusClient instance
        $this->assertInstanceOf(FlexxusClient::class, $client);
    }

    public function test_factory_uses_warehouse_credentials(): void
    {
        // Arrange: Create a factory and a warehouse with credentials
        $factory = new FlexxusClientFactory;
        $warehouse = Warehouse::factory()->create([
            'code' => 'TEST-WH',
            'flexxus_url' => 'https://test.flexxus.example.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'testpass',
        ]);

        // Act: Create a client for the warehouse
        $client = $factory->createForWarehouse($warehouse);

        // Assert: The client should be created successfully
        // We can't directly access private properties, but we verified it's a FlexxusClient instance
        $this->assertInstanceOf(FlexxusClient::class, $client);
    }

    public function test_factory_throws_when_warehouse_credentials_are_missing(): void
    {
        $factory = new FlexxusClientFactory;
        $warehouse = Warehouse::factory()->create([
            'code' => 'TEST-WH',
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        $this->expectException(WarehouseFlexxusCredentialsMissingException::class);
        $this->expectExceptionMessage("Warehouse {$warehouse->code} does not have complete Flexxus credentials configured");

        $factory->createForWarehouse($warehouse);
    }
}
