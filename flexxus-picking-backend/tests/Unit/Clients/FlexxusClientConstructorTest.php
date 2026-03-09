<?php

namespace Tests\Unit\Clients;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FlexxusClientConstructorTest extends TestCase
{
    use RefreshDatabase;

    public function test_flexxus_client_accepts_credentials_via_constructor(): void
    {
        // Arrange: Create credentials
        $baseUrl = 'https://api.flexxus.example.com';
        $username = 'testuser';
        $password = 'testpass';
        $deviceInfo = ['device_id' => 'test-device'];

        // Act: Create client with credentials
        $client = new FlexxusClient($baseUrl, $username, $password, $deviceInfo);

        // Assert: Client should be created successfully
        $this->assertInstanceOf(FlexxusClient::class, $client);
    }

    public function test_flexxus_client_uses_warehouse_credentials(): void
    {
        // Arrange: Create warehouse with credentials DIFFERENT from config
        $warehouse = Warehouse::factory()->create([
            'flexxus_url' => 'https://warehouse1.flexxus.example.com',
            'flexxus_username' => 'warehouse1_user',
            'flexxus_password' => 'warehouse1_pass',
        ]);

        // Override config to have DIFFERENT credentials
        config([
            'flexxus.url' => 'https://config-flexxus.example.com',
            'flexxus.username' => 'config_user',
            'flexxus.password' => 'config_pass',
        ]);

        // Act: Mock HTTP response ONLY for warehouse URL (not config URL)
        Http::fake([
            'https://warehouse1.flexxus.example.com/v2/auth/login' => Http::response([
                'token' => 'warehouse1-token',
                'refreshToken' => 'refresh1',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
        ]);

        $deviceInfo = ['device_id' => 'test-device'];
        $client = new FlexxusClient(
            $warehouse->flexxus_url,
            $warehouse->flexxus_username,
            $warehouse->flexxus_password,
            $deviceInfo
        );

        $result = $client->authenticate();

        // Assert: Should authenticate with warehouse credentials (not config)
        $this->assertEquals('warehouse1-token', $result['token']);

        // Verify the request was made to the warehouse URL (not config URL)
        Http::assertSent(function ($request) {
            return $request->url() === 'https://warehouse1.flexxus.example.com/v2/auth/login';
        });
    }

    public function test_flexxus_client_uses_scoped_token_cache_keys(): void
    {
        // Arrange: Create two warehouses with different credentials
        $warehouse1 = Warehouse::factory()->create([
            'code' => 'WH1',
            'flexxus_url' => 'https://wh1.flexxus.example.com',
            'flexxus_username' => 'wh1_user',
            'flexxus_password' => 'wh1_pass',
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => 'WH2',
            'flexxus_url' => 'https://wh2.flexxus.example.com',
            'flexxus_username' => 'wh2_user',
            'flexxus_password' => 'wh2_pass',
        ]);

        // Act: Mock HTTP responses
        Http::fake([
            'https://wh1.flexxus.example.com/v2/auth/login' => Http::response([
                'token' => 'wh1-token',
                'refreshToken' => 'wh1-refresh',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            'https://wh2.flexxus.example.com/v2/auth/login' => Http::response([
                'token' => 'wh2-token',
                'refreshToken' => 'wh2-refresh',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
        ]);

        $deviceInfo = ['device_id' => 'test-device'];

        // Create clients for both warehouses with cache suffix
        $client1 = new FlexxusClient(
            $warehouse1->flexxus_url,
            $warehouse1->flexxus_username,
            $warehouse1->flexxus_password,
            $deviceInfo,
            'wh1'  // Cache suffix for warehouse 1
        );

        $client2 = new FlexxusClient(
            $warehouse2->flexxus_url,
            $warehouse2->flexxus_username,
            $warehouse2->flexxus_password,
            $deviceInfo,
            'wh2'  // Cache suffix for warehouse 2
        );

        // Authenticate both
        $result1 = $client1->authenticate();
        $result2 = $client2->authenticate();

        // Assert: Each warehouse should have its own token in cache
        // Cache keys should be scoped by warehouse code or URL
        $this->assertEquals('wh1-token', $result1['token']);
        $this->assertEquals('wh2-token', $result2['token']);

        // Verify tokens are stored in scoped cache keys
        $this->assertNotNull(Cache::get('flexxus_token_wh1'));
        $this->assertNotNull(Cache::get('flexxus_token_wh2'));
    }
}
