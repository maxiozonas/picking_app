<?php

namespace Tests\Unit\Services\Picking;

use App\Exceptions\Picking\WarehouseFlexxusCredentialsMissingException;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusClientFactory;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackwardCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_flexxus_client_factory_does_not_fall_back_to_config_when_credentials_are_null(): void
    {
        config()->set('flexxus.url', 'https://global.flexxus.example.com');
        config()->set('flexxus.username', 'GLOBALUSER');
        config()->set('flexxus.password', 'global-secret');

        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);

        $this->expectException(WarehouseFlexxusCredentialsMissingException::class);

        $factory->createForWarehouse($warehouse);
    }

    public function test_flexxus_client_factory_rejects_partially_configured_warehouse_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://warehouse.flexxus.example.com',
            'flexxus_username' => null,
            'flexxus_password' => 'secret-pass',
        ]);

        $factory = new FlexxusClientFactory;

        $this->expectException(WarehouseFlexxusCredentialsMissingException::class);

        $factory->createForWarehouse($warehouse);
    }

    public function test_warehouse_with_credentials_uses_those_instead_of_config(): void
    {
        // Arrange - Create warehouse with specific credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://warehouse.flexxus.example.com',
            'flexxus_username' => 'warehouse_user',
            'flexxus_password' => 'warehouse_password',
        ]);

        // Act - Create client for this warehouse
        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        // Assert - Client should be created successfully
        $this->assertNotNull($client);

        // The encrypted credentials are automatically decrypted when accessed
        $this->assertEquals('warehouse_user', $warehouse->flexxus_username);
        $this->assertEquals('warehouse_password', $warehouse->flexxus_password);
    }

    public function test_all_warehouses_without_credentials_fail_fast_instead_of_using_global_config(): void
    {
        config()->set('flexxus.url', 'https://global.flexxus.example.com');
        config()->set('flexxus.username', 'GLOBALUSER');
        config()->set('flexxus.password', 'global-secret');

        Warehouse::factory()->count(3)->create([
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);

        foreach (Warehouse::all() as $warehouse) {
            try {
                $factory->createForWarehouse($warehouse);
                $this->fail("Warehouse {$warehouse->code} unexpectedly used global Flexxus fallback credentials");
            } catch (WarehouseFlexxusCredentialsMissingException $exception) {
                $this->assertSame(
                    "Warehouse {$warehouse->code} does not have complete Flexxus credentials configured",
                    $exception->getMessage()
                );
            }
        }
    }
}
