<?php

namespace App\Http\Clients\Flexxus;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FlexxusClient implements FlexxusClientInterface
{
    private string $baseUrl;

    private string $username;

    private string $password;

    private array $deviceInfo;

    public function __construct()
    {
        $this->baseUrl = config('flexxus.url');
        $this->username = config('flexxus.username');
        $this->password = config('flexxus.password');
        $this->deviceInfo = config('flexxus.device_info');
    }

    public function authenticate(): array
    {
        $payload = [
            'username' => $this->username,
            'password' => $this->password,
            'deviceinfo' => json_encode($this->deviceInfo),
        ];

        $response = Http::timeout(30)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/v2/auth/login", $payload);

        if (! $response->successful()) {
            throw new \RuntimeException('Flexxus authentication failed: '.$response->body());
        }

        $data = $response->json();

        if (! $data || ! isset($data['token'])) {
            throw new \RuntimeException('Invalid authentication response from Flexxus: '.$response->body());
        }

        // expireIn and refreshExpireIn are Unix timestamps, convert to seconds from now
        $tokenExpireIn = ($data['expireIn'] ?? time() + 3600) - time();
        $refreshExpireIn = ($data['refreshExpireIn'] ?? time() + 86400) - time();

        // Ensure positive values (in case token already expired)
        $tokenExpireIn = max(60, $tokenExpireIn);
        $refreshExpireIn = max(60, $refreshExpireIn);

        Cache::put('flexxus_token', $data['token'], now()->addSeconds($tokenExpireIn));
        Cache::put('flexxus_refresh_token', $data['refreshToken'] ?? null, now()->addSeconds($refreshExpireIn));

        return $data;
    }

    public function getWarehouses(): array
    {
        $response = $this->request('GET', '/v2/warehouses');

        return $response['data'] ?? $response;
    }

    public function request(string $method, string $endpoint, array $data = []): array
    {
        $token = Cache::get('flexxus_token');

        if (! $token) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
        }

        $response = Http::timeout(30)->withToken($token)->{$method}("{$this->baseUrl}{$endpoint}", $data);

        if ($response->status() === 401) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
            $response = Http::timeout(30)->withToken($token)->{$method}("{$this->baseUrl}{$endpoint}", $data);
        }

        if (! $response->successful()) {
            throw new \RuntimeException('Flexxus request failed: '.$response->body());
        }

        return $response->json() ?? [];
    }
}
