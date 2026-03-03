<?php

namespace Tests\Feature\Picking;

use App\Models\PickingAlert;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class PickingControllerTest extends TestCase
{
    use RefreshDatabase;

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

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [])
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

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with($orderNumber, $user->id)
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

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user) {
            $progress = PickingOrderProgress::factory()->make([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('startOrder')
                ->once()
                ->with($orderNumber, $user->id)
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

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $productCode, $user) {
            $mock->shouldReceive('pickItem')
                ->once()
                ->with($orderNumber, $productCode, 5, $user->id)
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

    public function test_can_complete_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';

        $this->mock(PickingServiceInterface::class, function ($mock) use ($orderNumber, $user) {
            $progress = PickingOrderProgress::factory()->completed()->make([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('completeOrder')
                ->once()
                ->with($orderNumber, $user->id)
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

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user) {
            $alert = PickingAlert::factory()->make([
                'user_id' => $user->id,
            ]);
            $mock->shouldReceive('createAlert')
                ->once()
                ->with(\Mockery::type('array'), $user->id)
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
}
