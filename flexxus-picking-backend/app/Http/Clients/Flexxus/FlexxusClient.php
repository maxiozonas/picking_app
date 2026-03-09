<?php

namespace App\Http\Clients\Flexxus;

use App\Exceptions\ExternalApi\ExternalApiAuthenticationException;
use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use App\Exceptions\ExternalApi\ExternalApiRequestException;
use App\Exceptions\ExternalApi\ExternalApiServerErrorException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FlexxusClient implements FlexxusClientInterface
{
    private string $baseUrl;

    private string $username;

    private string $password;

    private array $deviceInfo;

    private ?string $cacheKeySuffix;

    public function __construct(
        ?string $baseUrl = null,
        ?string $username = null,
        ?string $password = null,
        ?array $deviceInfo = null,
        ?string $cacheKeySuffix = null
    ) {
        // Use provided parameters or fall back to config (backward compatibility)
        $this->baseUrl = $baseUrl ?? config('flexxus.url');
        $this->username = $username ?? config('flexxus.username');
        $this->password = $password ?? config('flexxus.password');
        $this->deviceInfo = $deviceInfo ?? config('flexxus.device_info');
        $this->cacheKeySuffix = $cacheKeySuffix;
    }

    /**
     * Get cache key suffix for token scoping.
     * Returns empty string for backward compatibility when using config credentials.
     */
    private function getCacheKeySuffix(): string
    {
        if ($this->cacheKeySuffix) {
            return $this->cacheKeySuffix;
        }

        // If using config-based credentials (backward compatibility), use empty suffix
        // This keeps the old cache key names: 'flexxus_token' and 'flexxus_refresh_token'
        if ($this->baseUrl === config('flexxus.url') &&
            $this->username === config('flexxus.username')) {
            return '';
        }

        // Otherwise, generate suffix from base URL for warehouse-specific clients
        return substr(md5($this->baseUrl), 0, 8);
    }

    /**
     * Get the full cache key for tokens.
     */
    private function getTokenCacheKey(): string
    {
        $suffix = $this->getCacheKeySuffix();

        return $suffix ? "flexxus_token_{$suffix}" : 'flexxus_token';
    }

    /**
     * Get the full cache key for refresh tokens.
     */
    private function getRefreshTokenCacheKey(): string
    {
        $suffix = $this->getCacheKeySuffix();

        return $suffix ? "flexxus_refresh_token_{$suffix}" : 'flexxus_refresh_token';
    }

    public function authenticate(): array
    {
        $payload = [
            'username' => $this->username,
            'password' => $this->password,
            'deviceinfo' => json_encode($this->deviceInfo),
        ];

        $endpoint = "{$this->baseUrl}/v2/auth/login";

        try {
            $response = Http::timeout(30)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($endpoint, $payload);
        } catch (ConnectionException $e) {
            throw new ExternalApiConnectionException(
                $endpoint,
                $e
            );
        }

        if (! $response->successful()) {
            $statusCode = $response->status();

            if ($statusCode === 401 || $statusCode === 403) {
                throw new ExternalApiAuthenticationException(
                    $endpoint,
                    $statusCode,
                    ['response_body' => $response->body()]
                );
            }

            // Other error responses (4xx, 5xx)
            throw new ExternalApiRequestException(
                $endpoint,
                $statusCode,
                $response->body(),
                ['response_body' => $response->body()]
            );
        }

        $data = $response->json();

        if (! $data || ! isset($data['token'])) {
            throw new ExternalApiRequestException(
                $endpoint,
                200,
                'Invalid authentication response from Flexxus',
                ['response_body' => $response->body()]
            );
        }

        // expireIn and refreshExpireIn are Unix timestamps, convert to seconds from now
        $tokenExpireIn = ($data['expireIn'] ?? time() + 3600) - time();
        $refreshExpireIn = ($data['refreshExpireIn'] ?? time() + 86400) - time();

        // Ensure positive values (in case token already expired)
        $tokenExpireIn = max(60, $tokenExpireIn);
        $refreshExpireIn = max(60, $refreshExpireIn);

        // Use warehouse-scoped cache keys
        Cache::put($this->getTokenCacheKey(), $data['token'], now()->addSeconds($tokenExpireIn));
        Cache::put($this->getRefreshTokenCacheKey(), $data['refreshToken'] ?? null, now()->addSeconds($refreshExpireIn));

        return $data;
    }

    public function getWarehouses(): array
    {
        $response = $this->request('GET', '/v2/warehouses');

        return $response['data'] ?? $response;
    }

    public function request(string $method, string $endpoint, array $data = []): array
    {
        $fullUrl = "{$this->baseUrl}{$endpoint}";

        try {
            $token = Cache::get($this->getTokenCacheKey());

            if (! $token) {
                $this->authenticate();
                $token = Cache::get($this->getTokenCacheKey());
            }

            $response = Http::timeout(30)->withToken($token)->{$method}($fullUrl, $data);

            if ($response->status() === 401) {
                $this->authenticate();
                $token = Cache::get($this->getTokenCacheKey());
                $response = Http::timeout(30)->withToken($token)->{$method}($fullUrl, $data);
            }

            if (! $response->successful()) {
                $this->throwExceptionForFailedResponse($response, $fullUrl);
            }

            return $response->json() ?? [];
        } catch (ConnectionException $e) {
            throw new ExternalApiConnectionException(
                $fullUrl,
                $e
            );
        }
    }

    private function throwExceptionForFailedResponse($response, string $endpoint): void
    {
        $statusCode = $response->status();
        $responseBody = $response->body();
        $responseData = $response->json() ?? [];
        // Prefer descriptive 'message' field over 'error' field for better error messages
        $errorMessage = $responseData['message'] ?? $responseData['error'] ?? $responseBody;

        // 401/403 authentication errors (after retry)
        if ($statusCode === 401 || $statusCode === 403) {
            throw new ExternalApiAuthenticationException(
                $endpoint,
                $statusCode,
                [
                    'response_body' => $responseBody,
                    'error_message' => $errorMessage,
                ]
            );
        }

        // 5xx server errors
        if ($statusCode >= 500 && $statusCode <= 599) {
            throw new ExternalApiServerErrorException(
                $endpoint,
                $statusCode,
                [
                    'response_body' => $responseBody,
                    'error_message' => $errorMessage,
                ]
            );
        }

        // 4xx client errors (400, 404, 422, etc.)
        throw new ExternalApiRequestException(
            $endpoint,
            $statusCode,
            $errorMessage,
            [
                'response_body' => $responseBody,
                'error_details' => $responseData,
            ]
        );
    }
}
