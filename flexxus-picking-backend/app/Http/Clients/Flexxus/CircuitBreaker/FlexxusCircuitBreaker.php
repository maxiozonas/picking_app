<?php

namespace App\Http\Clients\Flexxus\CircuitBreaker;

use Illuminate\Support\Facades\Cache;

/**
 * Simple circuit breaker for Flexxus API calls.
 *
 * States:
 *  - Closed (normal): requests pass through
 *  - Open (tripped): requests short-circuit immediately
 *  - Half-open: after cooldown, one request is allowed through to test recovery
 */
class FlexxusCircuitBreaker
{
    private string $key;

    private int $threshold;

    private int $cooldownSeconds;

    public function __construct(string $scope = 'default')
    {
        $this->key = 'flexxus_circuit_'.$scope;
        $this->threshold = (int) config('picking.circuit_breaker_threshold', 5);
        $this->cooldownSeconds = (int) config('picking.circuit_breaker_cooldown', 30);
    }

    public function isOpen(): bool
    {
        $state = Cache::get($this->key);

        if ($state === null) {
            return false;
        }

        if ($state['failures'] >= $this->threshold) {
            // Check if cooldown has elapsed (half-open)
            if (now()->timestamp - $state['last_failure_at'] >= $this->cooldownSeconds) {
                return false; // Allow one request through
            }

            return true;
        }

        return false;
    }

    public function recordFailure(): void
    {
        $state = Cache::get($this->key, ['failures' => 0, 'last_failure_at' => 0]);
        $state['failures']++;
        $state['last_failure_at'] = now()->timestamp;

        Cache::put($this->key, $state, now()->addSeconds($this->cooldownSeconds * 3));
    }

    public function recordSuccess(): void
    {
        Cache::forget($this->key);
    }
}
