<?php

namespace App\Services\Broadcasting;

use Illuminate\Contracts\Broadcasting\Broadcaster;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

/**
 * Service wrapper around Laravel's Broadcast facade for easier testing and mocking.
 *
 * This service abstracts the broadcasting layer, allowing UseCases to dispatch
 * broadcast events without coupling to the underlying broadcaster implementation.
 */
final class BroadcastingService
{
    /**
     * Dispatch a broadcast event to all subscribed channels.
     *
     * @param ShouldBroadcast $event The event to broadcast
     * @return void
     */
    public function dispatch(ShouldBroadcast $event): void
    {
        event($event);
    }
}
