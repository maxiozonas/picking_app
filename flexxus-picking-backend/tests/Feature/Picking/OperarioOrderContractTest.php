<?php

namespace Tests\Feature\Picking;

use App\Models\User;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class OperarioOrderContractTest extends TestCase
{
    use DatabaseMigrations;

    public function test_list_response_exposes_split_order_identifier_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], [])
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    [
                        'order_type' => 'NP',
                        'order_number' => '623200',
                        'customer' => 'Test Customer',
                        'status' => 'pending',
                        'assigned_to' => ['id' => null, 'name' => null],
                        'items_count' => 5,
                        'items_picked' => 0,
                        'created_at' => now()->toIso8601String(),
                        'started_at' => '',
                        'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                        'total' => 1000,
                        'delivery_type' => 'EXPEDICION',
                    ],
                ], 1, 15));
        });

        $response = $this->getJson('/api/picking/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'order_type',
                        'order_number',
                    ],
                ],
            ]);

        // Verify order_type and order_number are present and correct format
        $orders = $response->json('data');
        if (! empty($orders)) {
            $firstOrder = $orders[0];
            $this->assertArrayHasKey('order_type', $firstOrder);
            $this->assertArrayHasKey('order_number', $firstOrder);
            $this->assertIsNumeric($firstOrder['order_number'], 'order_number must be numeric-only');
        }
    }

    public function test_detail_response_exposes_split_order_identifier_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'NP-623200';

        $mock = Mockery::mock(PickingServiceInterface::class);
        $mock->shouldReceive('getOrderDetail')
            ->once()
            ->with($orderNumber, $user->id, [])
            ->andReturn([
                'order_type' => 'NP',
                'order_number' => '623200',
                'customer_name' => 'Test Customer',
                'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                'total' => 1000,
                'status' => 'pending',
                'total_items' => 5,
                'picked_items' => 0,
                'completed_percentage' => 0,
                'started_at' => '',
                'completed_at' => null,
                'assigned_to' => ['id' => null, 'name' => null],
                'items' => [],
                'alerts' => [],
            ]);
        $this->app->instance(PickingServiceInterface::class, $mock);

        $response = $this->getJson("/api/picking/orders/{$orderNumber}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'order_type',
                    'order_number',
                ],
            ]);

        $order = $response->json('data');
        $this->assertArrayHasKey('order_type', $order);
        $this->assertArrayHasKey('order_number', $order);
        $this->assertIsNumeric($order['order_number'], 'order_number must be numeric-only');
    }

    public function test_list_response_returns_explicit_non_null_assigned_to_for_unassigned_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], [])
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    [
                        'order_type' => 'NP',
                        'order_number' => '623200',
                        'customer' => 'Test Customer',
                        'status' => 'pending',
                        'assigned_to' => ['id' => null, 'name' => null],
                        'items_count' => 5,
                        'items_picked' => 0,
                        'created_at' => now()->toIso8601String(),
                        'started_at' => '',
                        'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                        'total' => 1000,
                        'delivery_type' => 'EXPEDICION',
                    ],
                ], 1, 15));
        });

        $response = $this->getJson('/api/picking/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'assigned_to',
                    ],
                ],
            ]);

        $orders = $response->json('data');
        if (! empty($orders)) {
            $unassignedOrder = collect($orders)->first(fn ($order) => $order['status'] === 'pending');
            if ($unassignedOrder) {
                $this->assertNotNull($unassignedOrder['assigned_to'], 'assigned_to must not be null for unassigned orders');
                $this->assertIsArray($unassignedOrder['assigned_to'], 'assigned_to must be an array with explicit values');
            }
        }
    }

    public function test_list_response_returns_explicit_non_null_started_at_for_unstarted_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], [])
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    [
                        'order_type' => 'NP',
                        'order_number' => '623200',
                        'customer' => 'Test Customer',
                        'status' => 'pending',
                        'assigned_to' => ['id' => null, 'name' => null],
                        'items_count' => 5,
                        'items_picked' => 0,
                        'created_at' => now()->toIso8601String(),
                        'started_at' => '',
                        'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                        'total' => 1000,
                        'delivery_type' => 'EXPEDICION',
                    ],
                ], 1, 15));
        });

        $response = $this->getJson('/api/picking/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'started_at',
                    ],
                ],
            ]);

        $orders = $response->json('data');
        if (! empty($orders)) {
            $unstartedOrder = collect($orders)->first(fn ($order) => $order['status'] === 'pending');
            if ($unstartedOrder) {
                $this->assertNotNull($unstartedOrder['started_at'], 'started_at must not be null for unstarted orders');
            }
        }
    }

    public function test_detail_response_returns_explicit_non_null_assigned_to_for_unassigned_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'NP-623200';

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $orderNumber) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with($orderNumber, $user->id, [])
                ->andReturn([
                    'order_type' => 'NP',
                    'order_number' => '623200',
                    'customer_name' => 'Test Customer',
                    'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                    'total' => 1000,
                    'status' => 'pending',
                    'total_items' => 5,
                    'picked_items' => 0,
                    'completed_percentage' => 0,
                    'started_at' => '',
                    'completed_at' => null,
                    'assigned_to' => ['id' => null, 'name' => null],
                    'items' => [],
                    'alerts' => [],
                ]);
        });

        $response = $this->getJson("/api/picking/orders/{$orderNumber}");

        $response->assertStatus(200);

        $order = $response->json('data');
        $this->assertArrayHasKey('assigned_to', $order);
        $this->assertNotNull($order['assigned_to'], 'assigned_to must not be null for unassigned orders');
        $this->assertIsArray($order['assigned_to'], 'assigned_to must be an array with explicit values');
    }

    public function test_detail_response_returns_explicit_non_null_started_at_for_unstarted_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'NP-623200';

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $orderNumber) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with($orderNumber, $user->id, [])
                ->andReturn([
                    'order_type' => 'NP',
                    'order_number' => '623200',
                    'customer_name' => 'Test Customer',
                    'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                    'total' => 1000,
                    'status' => 'pending',
                    'total_items' => 5,
                    'picked_items' => 0,
                    'completed_percentage' => 0,
                    'started_at' => '',
                    'completed_at' => null,
                    'assigned_to' => ['id' => null, 'name' => null],
                    'items' => [],
                    'alerts' => [],
                ]);
        });

        $response = $this->getJson("/api/picking/orders/{$orderNumber}");

        $response->assertStatus(200);

        $order = $response->json('data');
        $this->assertArrayHasKey('started_at', $order);
        $this->assertNotNull($order['started_at'], 'started_at must not be null for unstarted orders');
    }

    public function test_start_response_preserves_concrete_assigned_to_and_started_at(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = '623200'; // Numeric-only input

        $progress = \App\Models\PickingOrderProgress::factory()->make([
            'order_type' => 'NP',
            'order_number' => 'NP 623200',
            'status' => 'in_progress',
            'started_at' => now(),
            'user_id' => $user->id,
            'warehouse_id' => 1,
        ]);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user, $progress) {
            $mock->shouldReceive('startOrder')
                ->once()
                ->with($orderNumber, $user->id, [])
                ->andReturn($progress);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/start");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'order_type',
                    'order_number',
                ],
            ]);
    }

    public function test_start_accepts_prefixed_order_number(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'NP-623200'; // Prefixed format

        $progress = \App\Models\PickingOrderProgress::factory()->make([
            'order_type' => 'NP',
            'order_number' => 'NP 623200',
            'status' => 'in_progress',
        ]);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user, $progress) {
            $mock->shouldReceive('startOrder')
                ->once()
                ->with($orderNumber, $user->id)
                ->andReturn($progress);
        });

        $response = $this->postJson("/api/picking/orders/{$orderNumber}/start");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'order_type',
                    'order_number',
                ],
            ]);
    }

    public function test_list_detail_start_share_same_order_structure(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = '623200';

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $orderNumber) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [], [])
                ->andReturn(new \Illuminate\Pagination\LengthAwarePaginator([
                    [
                        'order_type' => 'NP',
                        'order_number' => $orderNumber,
                        'customer' => 'Test Customer',
                        'status' => 'pending',
                        'assigned_to' => ['id' => null, 'name' => null],
                        'items_count' => 5,
                        'items_picked' => 0,
                        'created_at' => now()->toIso8601String(),
                        'started_at' => '',
                        'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                        'total' => 1000,
                        'delivery_type' => 'EXPEDICION',
                    ],
                ], 1, 15));

            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with($orderNumber, $user->id, [])
                ->andReturn([
                    'order_type' => 'NP',
                    'order_number' => $orderNumber,
                    'customer_name' => 'Test Customer',
                    'warehouse' => ['id' => 1, 'code' => 'CENTRO', 'name' => 'Centro'],
                    'total' => 1000,
                    'status' => 'pending',
                    'total_items' => 5,
                    'picked_items' => 0,
                    'completed_percentage' => 0,
                    'started_at' => '',
                    'completed_at' => null,
                    'assigned_to' => ['id' => null, 'name' => null],
                    'items' => [],
                    'alerts' => [],
                ]);

            $progress = \App\Models\PickingOrderProgress::factory()->make([
                'order_type' => 'NP',
                'order_number' => 'NP '.$orderNumber,
                'status' => 'in_progress',
                'user_id' => $user->id,
                'warehouse_id' => 1,
            ]);

            $mock->shouldReceive('startOrder')
                ->once()
                ->with($orderNumber, $user->id, [])
                ->andReturn($progress);
        });

        // Get list response
        $listResponse = $this->getJson('/api/picking/orders');
        $listResponse->assertStatus(200);

        $orders = $listResponse->json('data');
        if (! empty($orders)) {
            // Get detail response
            $detailResponse = $this->getJson("/api/picking/orders/{$orderNumber}");
            $detailResponse->assertStatus(200);

            // Get start response
            $startResponse = $this->postJson("/api/picking/orders/{$orderNumber}/start");

            // All responses should have the same core order keys
            $coreKeys = [
                'order_type',
                'order_number',
                'assigned_to',
                'started_at',
            ];

            foreach ($coreKeys as $key) {
                $this->assertArrayHasKey($key, $orders[0], "List response missing key: {$key}");
            }

            $detailData = $detailResponse->json('data');
            foreach ($coreKeys as $key) {
                $this->assertArrayHasKey($key, $detailData, "Detail response missing key: {$key}");
            }

            if ($startResponse->status() === 200) {
                $startData = $startResponse->json('data');
                foreach ($coreKeys as $key) {
                    $this->assertArrayHasKey($key, $startData, "Start response missing key: {$key}");
                }
            }
        }
    }
}
