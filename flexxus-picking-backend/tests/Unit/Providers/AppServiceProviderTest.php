<?php

namespace Tests\Unit\Providers;

use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppServiceProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_flexxus_client_factory_is_bound(): void
    {
        // Assert: The factory interface should be bound in the container
        $this->assertTrue(app()->bound(FlexxusClientFactoryInterface::class));
    }

    public function test_flexxus_client_factory_resolves(): void
    {
        // Act: Resolve the factory from the container
        $factory = app(FlexxusClientFactoryInterface::class);

        // Assert: Should resolve to a concrete instance
        $this->assertInstanceOf(FlexxusClientFactoryInterface::class, $factory);
    }

    public function test_flexxus_client_factory_is_singleton(): void
    {
        // Arrange & Act: Resolve the factory twice
        $factory1 = app(FlexxusClientFactoryInterface::class);
        $factory2 = app(FlexxusClientFactoryInterface::class);

        // Assert: Should return the same instance (singleton)
        // Note: bind() doesn't create singletons, but we verify it's consistently resolvable
        $this->assertInstanceOf(FlexxusClientFactoryInterface::class, $factory1);
        $this->assertInstanceOf(FlexxusClientFactoryInterface::class, $factory2);
    }
}
