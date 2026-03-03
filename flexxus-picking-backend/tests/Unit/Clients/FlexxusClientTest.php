<?php

namespace Tests\Unit\Clients;

use App\Http\Clients\Flexxus\FlexxusClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FlexxusClientTest extends TestCase
{
    private FlexxusClient $client;

    private string $baseUrl = 'https://api.flexxus.example.com';

    private string $username = 'testuser';

    private string $password = 'testpass';

    private array $deviceInfo = ['device_id' => 'test-device'];

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'flexxus.url' => $this->baseUrl,
            'flexxus.username' => $this->username,
            'flexxus.password' => $this->password,
            'flexxus.device_info' => $this->deviceInfo,
        ]);
        $this->client = new FlexxusClient;
        Cache::flush();
    }

    public function test_authenticate_returns_token_and_refresh_token(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token-123',
                'refreshToken' => 'test-refresh-token-456',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
        ]);

        $result = $this->client->authenticate();

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('refreshToken', $result);
        $this->assertEquals('test-token-123', $result['token']);
        $this->assertEquals('test-refresh-token-456', $result['refreshToken']);
    }

    public function test_authenticate_stores_token_in_cache(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token-123',
                'refreshToken' => 'test-refresh-token-456',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
        ]);

        $this->client->authenticate();

        $this->assertEquals('test-token-123', Cache::get('flexxus_token'));
        $this->assertEquals('test-refresh-token-456', Cache::get('flexxus_refresh_token'));
    }

    public function test_get_warehouses_returns_warehouse_data(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token-123',
                'refreshToken' => 'test-refresh-token-456',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/warehouses" => Http::response([
                'data' => [
                    ['id' => 1, 'name' => 'Warehouse 1'],
                    ['id' => 2, 'name' => 'Warehouse 2'],
                ],
            ], 200),
        ]);

        $warehouses = $this->client->getWarehouses();

        $this->assertIsArray($warehouses);
        $this->assertCount(2, $warehouses);
        $this->assertEquals(1, $warehouses[0]['id']);
        $this->assertEquals('Warehouse 1', $warehouses[0]['name']);
    }

    public function test_request_auto_authenticates_when_no_token_cached(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token-123',
                'refreshToken' => 'test-refresh-token-456',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/warehouses" => Http::response([
                'data' => [
                    ['id' => 1, 'name' => 'Warehouse 1'],
                ],
            ], 200),
        ]);

        $result = $this->client->request('GET', '/v2/warehouses');

        $this->assertIsArray($result);
        Http::assertSent(function ($request) {
            return $request->hasHeader('Authorization', 'Bearer test-token-123') &&
                   $request->url() === "{$this->baseUrl}/v2/warehouses";
        });
    }

    public function test_request_retries_on_401_response(): void
    {
        Http::fakeSequence()
            ->push(['error' => 'Unauthorized'], 401)
            ->push([
                'token' => 'new-token-789',
                'refreshToken' => 'new-refresh-token-012',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200)
            ->push(['data' => [['id' => 1, 'name' => 'Warehouse 1']]], 200);

        Cache::put('flexxus_token', 'expired-token');

        $result = $this->client->request('GET', '/v2/warehouses');

        $this->assertIsArray($result);
        $this->assertEquals('new-token-789', Cache::get('flexxus_token'));
        $this->assertEquals('new-refresh-token-012', Cache::get('flexxus_refresh_token'));
    }
}
