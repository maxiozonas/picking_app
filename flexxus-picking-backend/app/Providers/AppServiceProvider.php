<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Auth\AuthRepositoryInterface::class,
            \App\Repositories\Auth\AuthRepository::class
        );

        $this->app->bind(
            \App\Services\Auth\AuthServiceInterface::class,
            \App\Services\Auth\AuthService::class
        );

        $this->app->bind(
            \App\Services\Flexxus\WarehouseServiceInterface::class,
            \App\Services\Flexxus\WarehouseService::class
        );

        $this->app->bind(
            \App\Http\Clients\Flexxus\FlexxusClientInterface::class,
            \App\Http\Clients\Flexxus\FlexxusClient::class
        );

        $this->app->bind(
            \App\Repositories\Flexxus\WarehouseRepositoryInterface::class,
            \App\Repositories\Flexxus\WarehouseRepository::class
        );

        $this->app->bind(
            \App\Services\Picking\PickingServiceInterface::class,
            \App\Services\Picking\PickingService::class
        );

        $this->app->bind(
            \App\Services\Picking\Interfaces\AlertServiceInterface::class,
            \App\Services\Picking\AlertService::class
        );

        $this->app->bind(
            \App\Services\Picking\Interfaces\StockValidationServiceInterface::class,
            \App\Services\Picking\StockValidationService::class
        );

        $this->app->bind(
            \App\Services\Picking\Interfaces\StockCacheServiceInterface::class,
            \App\Services\Picking\StockCacheService::class
        );

        $this->app->bind(
            \App\Services\Picking\Interfaces\FlexxusClientFactoryInterface::class,
            \App\Services\Picking\FlexxusClientFactory::class
        );

        $this->app->bind(
            \App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface::class,
            \App\Services\Picking\WarehouseExecutionContextResolver::class
        );

        $this->app->bind(
            \App\Services\Admin\WarehouseServiceInterface::class,
            \App\Services\Admin\WarehouseService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
