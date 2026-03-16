<?php

namespace Tests\Feature\Picking;

use App\Models\PickingAlert;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class PickingControllerTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->app->bind(PickingServiceInterface::class, function () {
            return Mockery::mock(PickingServiceInterface::class);
        });
    }

    public function test_can_list_picking_orders(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], $requestContext)
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15));
        });

        $response = $this->getJson('/api/picking/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    public function test_can_show_order_detail(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user, $requestContext) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with($orderNumber, $user->id, $requestContext)
                ->andReturn([
                    'order_number' => $orderNumber,
                    'customer_name' => 'Test Customer',
                    'items' => [],
                ]);
        });

        $response = $this->getJson("/api/picking/orders/{$orderNumber}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'order_number' => $orderNumber,
                    'customer_name' => 'Test Customer',
                ],
            ]);
    }

    public function test_can_start_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user, $requestContext) {
            $progress = PickingOrderProgress::factory()->make([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('startOrder')
                ->once()
                ->with($orderNumber, $user->id, $requestContext)
                ->andReturn($progress);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/start");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'order_number' => $orderNumber,
                ],
            ]);
    }

    public function test_can_pick_item(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $productCode = 'PROD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $productCode, $user, $requestContext) {
            $mock->shouldReceive('pickItem')
                ->once()
                ->with($orderNumber, $productCode, 5, $user->id, $requestContext)
                ->andReturn([
                    'picked_quantity' => 5,
                    'remaining_quantity' => 0,
                    'is_completed' => true,
                ]);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/items/{$productCode}/pick", [
            'quantity' => 5,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'picked_quantity' => 5,
                    'remaining_quantity' => 0,
                    'is_completed' => true,
                ],
            ]);
    }

    public function test_pick_item_validates_quantity(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/picking/orders/ORD-001/items/PROD-001/pick', [
            'quantity' => -1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_pick_item_response_includes_validation_info(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $productCode = 'PROD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $productCode, $user, $requestContext) {
            $mock->shouldReceive('pickItem')
                ->once()
                ->with($orderNumber, $productCode, 5, $user->id, $requestContext)
                ->andReturn([
                    'product_code' => $productCode,
                    'quantity_required' => 10,
                    'quantity_picked' => 5,
                    'status' => 'in_progress',
                    'remaining' => 5,
                    'stock_validation' => [
                        'validated' => true,
                        'available_qty' => 15,
                        'validated_at' => now()->toIso8601String(),
                    ],
                ]);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/items/{$productCode}/pick", [
            'quantity' => 5,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'product_code' => $productCode,
                    'stock_validation' => [
                        'validated' => true,
                        'available_qty' => 15,
                    ],
                ],
            ]);
    }

    public function test_pick_item_response_includes_stock_after_pick(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $productCode = 'PROD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $productCode, $user, $requestContext) {
            $mock->shouldReceive('pickItem')
                ->once()
                ->with($orderNumber, $productCode, 5, $user->id, $requestContext)
                ->andReturn([
                    'product_code' => $productCode,
                    'quantity_required' => 10,
                    'quantity_picked' => 5,
                    'status' => 'in_progress',
                    'remaining' => 5,
                    'stock_after_pick' => 45,
                    'stock_validation' => [
                        'validated' => true,
                        'available_qty' => 50,
                        'validated_at' => now()->toIso8601String(),
                    ],
                ]);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/items/{$productCode}/pick", [
            'quantity' => 5,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'product_code' => $productCode,
                    'stock_after_pick' => 45,
                    'stock_validation' => [
                        'validated' => true,
                        'available_qty' => 50,
                    ],
                ],
            ]);
    }

    public function test_can_complete_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user, $requestContext) {
            $progress = PickingOrderProgress::factory()->completed()->make([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('completeOrder')
                ->once()
                ->with($orderNumber, $user->id, $requestContext)
                ->andReturn($progress);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/complete", [
            'all_items_completed' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'order_number' => $orderNumber,
                    'status' => 'completed',
                ],
            ]);
    }

    public function test_can_create_alert(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $alert = PickingAlert::factory()->make([
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('createAlert')
                ->once()
                ->with(\Mockery::type('array'), $user->id, $requestContext)
                ->andReturn($alert);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/alerts", [
            'alert_type' => 'stock_issue',
            'message' => 'Product not found',
            'severity' => 'high',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'alert_type',
                    'message',
                    'severity',
                ],
            ]);
    }

    public function test_create_alert_validates_required_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/picking/orders/ORD-001/alerts', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['alert_type', 'message', 'severity']);
    }

    public function test_can_list_alerts(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->mock(PickingServiceInterface::class, function ($mock) {
            $mock->shouldReceive('getAlerts')
                ->once()
                ->with([])
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15));
        });

        $response = $this->getJson('/api/picking/alerts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_can_resolve_alert(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $alertId = 1;

        $this->mock(PickingServiceInterface::class, function ($mock) use ($alertId, $user) {
            $alert = PickingAlert::factory()->make([
                'id' => $alertId,
                'status' => 'resolved',
                'resolved_by' => $user->id,
                'resolved_at' => now(),
            ]);
            $mock->shouldReceive('resolveAlert')
                ->once()
                ->with($alertId, $user->id, 'Issue resolved')
                ->andReturn($alert);
        });

        $response = $this->patchJson("/api/picking/alerts/{$alertId}/resolve", [
            'notes' => 'Issue resolved',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $alertId,
                    'status' => 'resolved',
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_picking_endpoints(): void
    {
        $response = $this->getJson('/api/picking/orders');
        $response->assertStatus(401);
    }

    public function test_list_detail_start_share_same_contract_envelope(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        // List response envelope
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], $requestContext)
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    [
                        'order_number' => 'NP 623200',
                        'customer' => 'Test Customer',
                        'status' => 'pending',
                    ],
                ], 1, 15, 1, ['path' => request()->path()]));
        });

        $listResponse = $this->getJson('/api/picking/orders');
        $listResponse->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);

        // Detail response envelope
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with('NP-623200', $user->id, $requestContext)
                ->andReturn([
                    'order_number' => 'NP 623200',
                    'customer_name' => 'Test Customer',
                ]);
        });

        $detailResponse = $this->getJson('/api/picking/orders/NP-623200');
        $detailResponse->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);

        // Start response envelope
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $progress = PickingOrderProgress::factory()->make([
                'order_number' => 'NP 623200',
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('startOrder')
                ->once()
                ->with('NP-623200', $user->id, $requestContext)
                ->andReturn($progress);
        });

        $startResponse = $this->postJson('/api/picking/orders/NP-623200/start');
        $startResponse->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
    }

    public function test_list_detail_start_share_core_order_keys(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        $coreKeys = [
            'order_number',
            'status',
            'assigned_to',
            'started_at',
        ];

        // List response has core keys
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $coreKeys, $requestContext) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], $requestContext)
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    array_merge([
                        'order_number' => 'NP 623200',
                        'customer' => 'Test Customer',
                        'status' => 'pending',
                        'assigned_to' => ['id' => null, 'name' => 'Not assigned'],
                        'started_at' => null,
                    ], array_fill_keys($coreKeys, null)),
                ], 1, 15, 1, ['path' => request()->path()]));
        });

        $listResponse = $this->getJson('/api/picking/orders');
        $listData = $listResponse->json('data.0');
        foreach ($coreKeys as $key) {
            $this->assertArrayHasKey($key, $listData, "List response missing key: {$key}");
        }

        // Detail response has core keys
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $coreKeys, $requestContext) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with('NP-623200', $user->id, $requestContext)
                ->andReturn(array_merge([
                    'order_number' => 'NP 623200',
                    'customer_name' => 'Test Customer',
                    'status' => 'pending',
                    'assigned_to' => ['id' => null, 'name' => 'Not assigned'],
                    'started_at' => null,
                ], array_fill_keys($coreKeys, null)));
        });

        $detailResponse = $this->getJson('/api/picking/orders/NP-623200');
        $detailData = $detailResponse->json('data');
        foreach ($coreKeys as $key) {
            $this->assertArrayHasKey($key, $detailData, "Detail response missing key: {$key}");
        }

        // Start response has core keys
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $progress = PickingOrderProgress::factory()->make([
                'order_number' => 'NP 623200',
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
            $mock->shouldReceive('startOrder')
                ->once()
                ->with('NP-623200', $user->id, $requestContext)
                ->andReturn($progress);
        });

        $startResponse = $this->postJson('/api/picking/orders/NP-623200/start');
        $startData = $startResponse->json('data');
        foreach ($coreKeys as $key) {
            $this->assertArrayHasKey($key, $startData, "Start response missing key: {$key}");
        }
    }

    public function test_list_detail_start_have_consistent_schema_for_order_identifier(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $requestContext = ['warehouse_id' => $user->warehouse_id, 'user_id' => $user->id];

        // All responses should have order_type and order_number
        $identifierKeys = ['order_type', 'order_number'];

        // List response
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], $requestContext)
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    [
                        'order_type' => 'NP',
                        'order_number' => '623200',
                        'customer' => 'Test Customer',
                    ],
                ], 1, 15, 1, ['path' => request()->path()]));
        });

        $listResponse = $this->getJson('/api/picking/orders');
        $listData = $listResponse->json('data.0');
        foreach ($identifierKeys as $key) {
            $this->assertArrayHasKey($key, $listData, "List response missing identifier key: {$key}");
        }

        // Detail response
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with('NP-623200', $user->id, $requestContext)
                ->andReturn([
                    'order_type' => 'NP',
                    'order_number' => '623200',
                    'customer_name' => 'Test Customer',
                ]);
        });

        $detailResponse = $this->getJson('/api/picking/orders/NP-623200');
        $detailData = $detailResponse->json('data');
        foreach ($identifierKeys as $key) {
            $this->assertArrayHasKey($key, $detailData, "Detail response missing identifier key: {$key}");
        }

        // Start response
        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $requestContext) {
            $progress = PickingOrderProgress::factory()->make([
                'order_number' => 'NP 623200',
                'user_id' => $user->id,
            ]);
            $progress->order_type = 'NP';
            $progress->order_number = '623200';

            $mock->shouldReceive('startOrder')
                ->once()
                ->with('NP-623200', $user->id, $requestContext)
                ->andReturn($progress);
        });

        $startResponse = $this->postJson('/api/picking/orders/NP-623200/start');
        $startData = $startResponse->json('data');
        foreach ($identifierKeys as $key) {
            $this->assertArrayHasKey($key, $startData, "Start response missing identifier key: {$key}");
        }
    }
}
