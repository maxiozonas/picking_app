<?php

namespace Tests\Feature\Picking;

use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use App\Models\User;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class PickingStockControllerTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->bind(PickingServiceInterface::class, function () {
            return Mockery::mock(PickingServiceInterface::class);
        });
    }

    public function test_can_get_stock_for_item(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $productCode = 'PROD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $productCode, $user, $requestContext) {
            $mock->shouldReceive('getStockForItem')
                ->once()
                ->with($orderNumber, $productCode, $user->id, $requestContext)
                ->andReturn([
                    'item_code' => $productCode,
                    'available_quantity' => 12,
                    'location' => 'A1',
                    'last_updated' => now()->toIso8601String(),
                    'warehouse_id' => $user->warehouse_id,
                    'warehouse_code' => 'WH',
                    'warehouse_name' => 'Warehouse',
                ]);
        });

        $response = $this->getJson("/api/picking/orders/{$orderNumber}/stock/{$productCode}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'item_code',
                    'available_quantity',
                    'location',
                    'last_updated',
                ],
            ]);
    }

    public function test_get_stock_for_item_returns_404_when_item_not_found(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getStockForItem')
                ->once()
                ->with('ORD-001', 'NONEXISTENT', $user->id, $requestContext)
                ->andReturn(null);
        });

        $response = $this->getJson('/api/picking/orders/ORD-001/stock/NONEXISTENT');

        $response->assertStatus(404)
            ->assertJson([
                'error' => [
                    'message' => 'Item NONEXISTENT not found in order ORD-001',
            ],
        ]);
    }

    public function test_get_stock_for_item_returns_503_when_flexxus_provider_fails(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getStockForItem')
                ->once()
                ->with('ORD-001', 'PROD-001', $user->id, $requestContext)
                ->andThrow(new ExternalApiConnectionException('/v2/products/PROD-001'));
        });

        $response = $this->getJson('/api/picking/orders/ORD-001/stock/PROD-001');

        $response->assertStatus(503)
            ->assertJsonPath('error.error_code', 'FLEXXUS_CONNECTION_ERROR');
    }

    public function test_can_get_validation_status_for_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $this->mock(StockValidationServiceInterface::class, function ($mock) use ($orderNumber) {
            $mock->shouldReceive('getOrderValidations')
                ->once()
                ->with($orderNumber)
                ->andReturn(new EloquentCollection([
                    (object) [
                        'id' => 1,
                        'item_code' => 'PROD-001',
                        'requested_qty' => 3,
                        'available_qty' => 5,
                        'validation_result' => 'valid',
                        'validated_at' => now(),
                        'error_code' => null,
                    ],
                ]));
        });

        $response = $this->getJson("/api/picking/orders/{$orderNumber}/stock-validations");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'item_code',
                        'requested_qty',
                        'available_qty',
                        'validation_result',
                        'validated_at',
                    ],
                ],
            ]);
    }

    public function test_get_validation_status_returns_empty_array_when_no_validations(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->mock(StockValidationServiceInterface::class, function ($mock) {
            $mock->shouldReceive('getOrderValidations')
                ->once()
                ->with('ORD-999')
                ->andReturn(new EloquentCollection());
        });

        $response = $this->getJson('/api/picking/orders/ORD-999/stock-validations');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_stock_endpoints(): void
    {
        $response = $this->getJson('/api/picking/orders/ORD-001/stock/PROD-001');
        $response->assertStatus(401);

        $response = $this->getJson('/api/picking/orders/ORD-001/stock-validations');
        $response->assertStatus(401);
    }
}
