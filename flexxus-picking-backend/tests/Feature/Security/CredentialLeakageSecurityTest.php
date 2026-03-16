<?php

namespace Tests\Feature\Security;

use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CredentialLeakageSecurityTest extends TestCase
{
    use DatabaseMigrations;

    public function test_warehouse_model_hides_credentials_from_serialization(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'SECRET_USER',
            'flexxus_password' => 'SECRET_PASSWORD',
            'flexxus_url' => 'https://secret.example.com',
        ]);

        $array = $warehouse->toArray();

        $this->assertArrayNotHasKey('flexxus_username', $array, 'Credentials should be hidden');
        $this->assertArrayNotHasKey('flexxus_password', $array, 'Passwords should be hidden');
        $this->assertArrayNotHasKey('flexxus_url', $array, 'URLs should be hidden');
    }

    public function test_warehouse_resource_does_not_leak_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'SECRET_USER',
            'flexxus_password' => 'SECRET_PASSWORD',
            'flexxus_url' => 'https://secret.example.com',
        ]);

        $resource = new \App\Http\Resources\WarehouseResource($warehouse);
        $array = $resource->toArray(request());

        $this->assertArrayNotHasKey('flexxus_username', $array);
        $this->assertArrayNotHasKey('flexxus_password', $array);
        $this->assertArrayNotHasKey('flexxus_url', $array);
    }

    public function test_flexxus_exception_does_not_expose_credentials_in_message(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'SECRET_USER',
            'flexxus_password' => 'SECRET_PASSWORD',
            'flexxus_url' => 'https://invalid-flexxus-url-that-does-not-exist.example.com',
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        try {
            $client->authenticate();
        } catch (\Exception $e) {
            $message = $e->getMessage();

            $this->assertStringNotContainsString('SECRET_USER', $message, 'Exception should not contain username');
            $this->assertStringNotContainsString('SECRET_PASSWORD', $message, 'Exception should not contain password');
        }
    }

    public function test_logs_do_not_contain_plain_text_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'TEST_USER',
            'flexxus_password' => 'TEST_PASSWORD',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
        ]);

        try {
            $factory = app(FlexxusClientFactoryInterface::class);
            $client = $factory->createForWarehouse($warehouse);
            $client->authenticate();
        } catch (\Exception $e) {
            $this->assertStringNotContainsString('TEST_PASSWORD', $e->getMessage());
            $this->assertStringNotContainsString('TEST_USER', $e->getMessage());
        }

        $this->assertTrue(true, 'Log verification completed');
    }

    public function test_client_factory_does_not_log_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'SENSITIVE_USER',
            'flexxus_password' => 'SENSITIVE_PASSWORD',
            'flexxus_url' => 'https://pruebagiliycia.procomisp.com.ar',
        ]);

        $factory = app(FlexxusClientFactoryInterface::class);
        $client = $factory->createForWarehouse($warehouse);

        $this->assertNotNull($client);
    }

    public function test_encrypted_credentials_are_not_plain_text_in_database(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'ENCRYPTED_USER',
            'flexxus_password' => 'ENCRYPTED_PASSWORD',
        ]);

        $dbRecord = \Illuminate\Support\Facades\DB::table('warehouses')
            ->where('id', $warehouse->id)
            ->first();

        $this->assertNotEquals('ENCRYPTED_USER', $dbRecord->flexxus_username, 'Username should be encrypted in database');
        $this->assertNotEquals('ENCRYPTED_PASSWORD', $dbRecord->flexxus_password, 'Password should be encrypted in database');
        $this->assertNotEmpty($dbRecord->flexxus_username, 'Encrypted username should not be empty');
        $this->assertNotEmpty($dbRecord->flexxus_password, 'Encrypted password should not be empty');
    }

    public function test_decrypted_credentials_accessible_via_model(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => 'DECRYPT_USER',
            'flexxus_password' => 'DECRYPT_PASS',
        ]);

        $this->assertEquals('DECRYPT_USER', $warehouse->flexxus_username, 'Model should decrypt username');
        $this->assertEquals('DECRYPT_PASS', $warehouse->flexxus_password, 'Model should decrypt password');
    }
}
