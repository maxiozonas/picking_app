<?php

namespace Tests\Integration\Services;

use App\Exceptions\ExternalApi\ExternalApiAuthenticationException;
use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use App\Exceptions\ExternalApi\ExternalApiRequestException;
use App\Exceptions\ExternalApi\ExternalApiServerErrorException;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FlexxusPickingServiceExceptionsTest extends TestCase
{
    use RefreshDatabase;

    private FlexxusPickingService $service;

    private string $baseUrl = 'https://api.flexxus.example.com';

    private string $username = 'testuser';

    private string $password = 'testpass';

    private array $deviceInfo = ['device_id' => 'test-device'];

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'flexxus.url' => $this->baseUrl,
            'flexxus.username' => $this->username,
            'flexxus.password' => $this->password,
            'flexxus.device_info' => $this->deviceInfo,
        ]);
        $this->service = app(FlexxusPickingService::class);
        Cache::flush();

        // Create test warehouse
        $this->warehouse = Warehouse::factory()->create([
            'code' => 'RONDEAU',
            'flexxus_url' => $this->baseUrl,
            'flexxus_username' => $this->username,
            'flexxus_password' => $this->password,
        ]);
    }

    public function test_connection_timeout_throws_external_api_connection_exception(): void
    {
        // Simulate connection timeout using Laravel's Http facade
        Http::fake(function ($request) {
            throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
        });

        $this->expectException(ExternalApiConnectionException::class);
        $this->expectExceptionMessage('Connection or timeout error');

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_connection_refused_throws_external_api_connection_exception(): void
    {
        Http::fake(function ($request) {
            throw new \Illuminate\Http\Client\ConnectionException('cURL error 7: Failed to connect');
        });

        $this->expectException(ExternalApiConnectionException::class);
        $this->expectExceptionMessageMatches('/Connection or timeout error/');

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_auth_failure_401_throws_external_api_authentication_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response(
                ['error' => 'Invalid credentials'],
                401
            ),
        ]);

        $this->expectException(ExternalApiAuthenticationException::class);
        $this->expectExceptionCode(502); // HTTP status for our API response
        $this->expectExceptionMessage('Authentication failed with Flexxus API');

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_auth_failure_403_throws_external_api_authentication_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response(
                ['error' => 'Forbidden'],
                403
            ),
        ]);

        $this->expectException(ExternalApiAuthenticationException::class);
        $this->expectExceptionCode(502);

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_4xx_client_error_throws_external_api_request_exception(): void
    {
        // Setup: Successful auth first
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Bad Request', 'message' => 'Invalid date format'],
                400
            ),
        ]);

        $this->expectException(ExternalApiRequestException::class);
        $this->expectExceptionCode(502);
        $this->expectExceptionMessageMatches('/Flexxus API request failed.*400/');

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_404_not_found_throws_external_api_request_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Not Found'],
                404
            ),
        ]);

        $this->expectException(ExternalApiRequestException::class);
        $this->expectExceptionCode(502);

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_422_validation_error_throws_external_api_request_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Unprocessable Entity', 'message' => 'Validation failed'],
                422
            ),
        ]);

        $this->expectException(ExternalApiRequestException::class);
        $this->expectExceptionCode(502);
        $this->expectExceptionMessageMatches('/Validation failed/');

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_500_server_error_throws_external_api_server_error_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Internal Server Error'],
                500
            ),
        ]);

        $this->expectException(ExternalApiServerErrorException::class);
        $this->expectExceptionCode(502);
        $this->expectExceptionMessageMatches('/Flexxus API server error.*500/');

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_502_bad_gateway_throws_external_api_server_error_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Bad Gateway'],
                502
            ),
        ]);

        $this->expectException(ExternalApiServerErrorException::class);
        $this->expectExceptionCode(502);

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_503_service_unavailable_throws_external_api_server_error_exception(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Service Unavailable'],
                503
            ),
        ]);

        $this->expectException(ExternalApiServerErrorException::class);
        $this->expectExceptionCode(502);

        $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
    }

    public function test_connection_exception_includes_endpoint_in_context(): void
    {
        Http::fake(function ($request) {
            throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
        });

        try {
            $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
            $this->fail('Expected ExternalApiConnectionException to be thrown');
        } catch (ExternalApiConnectionException $e) {
            $this->assertNotNull($e->getEndpoint());
            $this->assertArrayHasKey('endpoint', $e->getContext());
            $this->assertArrayHasKey('previous_exception', $e->getContext());
        }
    }

    public function test_authentication_exception_includes_status_code_in_context(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response(
                ['error' => 'Unauthorized'],
                401
            ),
        ]);

        try {
            $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
            $this->fail('Expected ExternalApiAuthenticationException to be thrown');
        } catch (ExternalApiAuthenticationException $e) {
            $this->assertEquals(401, $e->getFlexxusStatusCode());
            $this->assertArrayHasKey('flexxus_status_code', $e->getContext());
        }
    }

    public function test_request_exception_includes_response_message(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Validation failed', 'details' => 'Invalid warehouse code'],
                400
            ),
        ]);

        try {
            $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
            $this->fail('Expected ExternalApiRequestException to be thrown');
        } catch (ExternalApiRequestException $e) {
            $this->assertStringContainsString('Validation failed', $e->getMessage());
            $this->assertArrayHasKey('flexxus_response', $e->getContext());
        }
    }

    public function test_server_error_exception_includes_status_code(): void
    {
        Http::fake([
            "{$this->baseUrl}/v2/auth/login" => Http::response([
                'token' => 'test-token',
                'expireIn' => time() + 3600,
                'refreshExpireIn' => time() + 86400,
            ], 200),
            "{$this->baseUrl}/v2/orders*" => Http::response(
                ['error' => 'Internal Server Error'],
                500
            ),
        ]);

        try {
            $this->service->getOrdersByDateAndWarehouse('2026-03-04', $this->warehouse);
            $this->fail('Expected ExternalApiServerErrorException to be thrown');
        } catch (ExternalApiServerErrorException $e) {
            $this->assertEquals(500, $e->getFlexxusStatusCode());
            $this->assertArrayHasKey('flexxus_status_code', $e->getContext());
        }
    }
}
