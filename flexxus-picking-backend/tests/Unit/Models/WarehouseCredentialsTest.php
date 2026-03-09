<?php

namespace Tests\Unit\Models;

use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseCredentialsTest extends TestCase
{
    use RefreshDatabase;

    public function test_warehouse_casts_flexxus_credentials_as_encrypted(): void
    {
        // Arrange: Create a warehouse with credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://api.flexxus.example.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'secretpassword',
        ]);

        // Act: Retrieve the warehouse
        $retrieved = Warehouse::find($warehouse->id);

        // Assert: Credentials should be decrypted automatically
        $this->assertEquals('https://api.flexxus.example.com', $retrieved->flexxus_url);
        $this->assertEquals('testuser', $retrieved->flexxus_username);
        $this->assertEquals('secretpassword', $retrieved->flexxus_password);
    }

    public function test_warehouse_credentials_are_encrypted_in_database(): void
    {
        // Arrange: Create a warehouse with credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://api.flexxus.example.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'secretpassword',
        ]);

        // Act: Get raw data directly from database (bypassing model's casts)
        $rawData = \DB::table('warehouses')->where('id', $warehouse->id)->first();

        // Assert: Raw database values should be encrypted (not plaintext)
        $this->assertNotEquals('https://api.flexxus.example.com', $rawData->flexxus_url);
        $this->assertNotEquals('testuser', $rawData->flexxus_username);
        $this->assertNotEquals('secretpassword', $rawData->flexxus_password);

        // Encrypted data should be longer than plaintext (due to base64 encoding + HMAC)
        $this->assertGreaterThan(strlen('https://api.flexxus.example.com'), strlen($rawData->flexxus_url));
        $this->assertGreaterThan(strlen('testuser'), strlen($rawData->flexxus_username));
        $this->assertGreaterThan(strlen('secretpassword'), strlen($rawData->flexxus_password));
    }

    public function test_warehouse_credentials_can_be_null(): void
    {
        // Arrange: Create a warehouse without credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        // Assert: Null values should remain null
        $this->assertNull($warehouse->flexxus_url);
        $this->assertNull($warehouse->flexxus_username);
        $this->assertNull($warehouse->flexxus_password);
    }

    public function test_warehouse_credentials_can_be_updated(): void
    {
        // Arrange: Create a warehouse with credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://api.flexxus.example.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'secretpassword',
        ]);

        // Act: Update credentials
        $warehouse->update([
            'flexxus_url' => 'https://new-api.flexxus.example.com',
            'flexxus_username' => 'newuser',
            'flexxus_password' => 'newpassword',
        ]);

        // Assert: New credentials should be properly encrypted/decrypted
        $retrieved = Warehouse::find($warehouse->id);
        $this->assertEquals('https://new-api.flexxus.example.com', $retrieved->flexxus_url);
        $this->assertEquals('newuser', $retrieved->flexxus_username);
        $this->assertEquals('newpassword', $retrieved->flexxus_password);
    }
}
