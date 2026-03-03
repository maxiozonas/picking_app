<?php

namespace App\Http\Clients\Flexxus;

interface FlexxusClientInterface
{
    public function authenticate(): array;

    public function getWarehouses(): array;

    public function request(string $method, string $endpoint, array $data = []): array;
}
