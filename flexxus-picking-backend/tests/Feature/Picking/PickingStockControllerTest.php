<?php

namespace Tests\Feature\Picking;

use App\Models\PickingOrderProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PickingStockControllerTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_can_get_stock_for_item(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';
        $productCode = 'PROD-001';

        $warehouseId = $user->warehouse_id;

        // Create a picking order progress record with user's warehouse
        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $user->id,
            'warehouse_id' => $warehouseId,
        ]);

        // Create an item progress record
        $progress->items()->create([
            'order_number' => $orderNumber,
            'product_code' => $productCode,
            'quantity_required' => 10,
            'quantity_picked' => 0,
            'status' => 'pending',
        ]);

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

        $response = $this->getJson('/api/picking/orders/ORD-001/stock/NONEXISTENT');

        $response->assertStatus(404)
            ->assertJson([
                'error' => [
                    'message' => 'Item NONEXISTENT not found in order ORD-001',
                ],
            ]);
    }

    public function test_can_get_validation_status_for_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $orderNumber = 'ORD-001';

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
