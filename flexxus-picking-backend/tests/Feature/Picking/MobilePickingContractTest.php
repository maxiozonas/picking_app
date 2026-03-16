<?php

namespace Tests\Feature\Picking;

use App\Models\PickingAlert;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MobilePickingContractTest extends TestCase
{
    use DatabaseMigrations;

    public function test_orders_index_forwards_mobile_pagination_and_search_filters(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user) {
            $mock->shouldReceive('getAvailableOrders')
                ->once()
                ->with($user->id, [
                    'search' => '623200',
                    'page' => 2,
                    'per_page' => 20,
                ], [])
                ->andReturn(new LengthAwarePaginator([], 0, 20, 2, ['path' => '/api/picking/orders']));
        });

        $response = $this->getJson('/api/picking/orders?page=2&per_page=20&search=623200');

        $response->assertOk()->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 20)
            ->assertJsonPath('meta.total', 0);
    }

    public function test_create_alert_rejects_legacy_alert_type_aliases(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/picking/orders/NP-623200/alerts', [
            'alert_type' => 'stock_issue',
            'message' => 'No hay stock suficiente',
            'severity' => 'high',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['alert_type']);
    }

    public function test_order_detail_alerts_use_normalized_mobile_contract(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'name' => 'Centro',
        ]);

        Sanctum::actingAs($user);

        $alert = PickingAlert::factory()->make([
            'order_number' => 'NP 623200',
            'warehouse_id' => $warehouse->id,
            'user_id' => $user->id,
            'alert_type' => 'insufficient_stock',
            'severity' => 'high',
            'product_code' => 'SKU-1',
            'is_resolved' => false,
            'created_at' => now(),
        ]);
        $alert->setRelation('warehouse', $warehouse);
        $alert->setRelation('reporter', $user);

        $this->mock(PickingServiceInterface::class, function ($mock) use ($user, $warehouse, $alert) {
            $mock->shouldReceive('getOrderDetail')
                ->once()
                ->with('NP-623200', $user->id, [])
                ->andReturn([
                    'order_type' => 'NP',
                    'order_number' => '623200',
                    'customer_name' => 'Acme',
                    'warehouse' => [
                        'id' => $warehouse->id,
                        'code' => $warehouse->code,
                        'name' => $warehouse->name,
                    ],
                    'total' => 1000,
                    'status' => 'in_progress',
                    'total_items' => 3,
                    'picked_items' => 1,
                    'completed_percentage' => 33.3,
                    'started_at' => now()->toIso8601String(),
                    'completed_at' => null,
                    'assigned_to' => ['id' => $user->id, 'name' => $user->name],
                    'items' => [],
                    'alerts' => collect([$alert]),
                    'events' => [],
                ]);
        });

        $response = $this->getJson('/api/picking/orders/NP-623200');

        $response->assertOk()->assertJsonPath('data.alerts.0.alert_type', 'insufficient_stock')
            ->assertJsonPath('data.alerts.0.status', 'pending')
            ->assertJsonPath('data.alerts.0.product_code', 'SKU-1')
            ->assertJsonPath('data.alerts.0.reporter.id', $user->id)
            ->assertJsonPath('data.alerts.0.warehouse.code', 'CENTRO');
    }
}
