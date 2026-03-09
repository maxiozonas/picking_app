<?php

namespace Tests\Unit\Services\Admin;

use App\Models\Warehouse;
use App\Services\Admin\WarehouseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseServiceTest extends TestCase
{
    use RefreshDatabase;

    private WarehouseService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new WarehouseService;
    }

    public function test_get_credential_status_returns_redacted_data(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://test.flexxus.com',
            'flexxus_username' => 'testuser',
            'flexxus_password' => 'testpass',
        ]);

        $status = $this->service->getCredentialStatus($warehouse);

        $this->assertEquals($warehouse->id, $status['id']);
        $this->assertEquals($warehouse->code, $status['code']);
        $this->assertEquals($warehouse->name, $status['name']);
        $this->assertTrue($status['has_flexxus_credentials']);
        $this->assertArrayNotHasKey('flexxus_url', $status);
        $this->assertArrayNotHasKey('flexxus_username', $status);
        $this->assertArrayNotHasKey('flexxus_password', $status);
    }

    public function test_get_credential_status_for_warehouse_without_credentials(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        $status = $this->service->getCredentialStatus($warehouse);

        $this->assertFalse($status['has_flexxus_credentials']);
    }

    public function test_update_flexxus_credentials_stores_encrypted_values(): void
    {
        $warehouse = Warehouse::factory()->create();

        $this->service->updateFlexxusCredentials($warehouse, [
            'flexxus_url' => 'https://updated.flexxus.com',
            'flexxus_username' => 'newuser',
            'flexxus_password' => 'newpass',
        ]);

        $warehouse->refresh();

        $this->assertEquals('https://updated.flexxus.com', $warehouse->flexxus_url);
        $this->assertEquals('newuser', $warehouse->flexxus_username);
        $this->assertEquals('newpass', $warehouse->flexxus_password);
        $this->assertTrue($warehouse->hasCompleteFlexxusCredentials());
    }

    public function test_clear_flexxus_credentials_removes_all_data(): void
    {
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://old.flexxus.com',
            'flexxus_username' => 'olduser',
            'flexxus_password' => 'oldpass',
        ]);

        $this->service->clearFlexxusCredentials($warehouse);

        $warehouse->refresh();

        $this->assertNull($warehouse->flexxus_url);
        $this->assertNull($warehouse->flexxus_username);
        $this->assertNull($warehouse->flexxus_password);
        $this->assertFalse($warehouse->hasCompleteFlexxusCredentials());
    }
}
