<?php

namespace Tests\Feature\Api\Admin;

use App\Models\PickingAlert;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminOrdersTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $regularUser;

    private User $employee;

    private Warehouse $warehouse1;

    private Warehouse $warehouse2;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles for Spatie
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);

        $this->warehouse1 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $this->warehouse2 = Warehouse::factory()->create(['code' => 'NORTE']);

        $this->admin = User::factory()->admin()->create();

        $this->regularUser = User::factory()
            ->empleado()
            ->state(['warehouse_id' => $this->warehouse1->id])
            ->create();

        $this->employee = User::factory()
            ->empleado()
            ->create();
    }

    public function test_admin_can_get_all_orders(): void
    {
        // Arrange
        $anotherUser1 = User::factory()->empleado()->create();
        $anotherUser2 = User::factory()->empleado()->create();

        PickingOrderProgress::factory()->count(5)->create([
            'warehouse_id' => $this->warehouse1->id,
            'user_id' => $anotherUser1->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse2->id,
            'user_id' => $this->employee->id,
            'status' => 'in_progress',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders?per_page=50');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'order_number',
                        'customer',
                        'status',
                        'warehouse',
                        'assigned_to',
                        'items_count',
                        'items_picked',
                        'started_at',
                        'completed_at',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);

        $data = $response->json('data');
        $this->assertCount(8, $data);

        // Find an order with the employee assigned
        $orderWithEmployee = collect($data)->first(fn ($order) => $order['assigned_to']['id'] === $this->employee->id);
        $this->assertNotNull($orderWithEmployee);
    }

    public function test_admin_can_filter_orders_by_warehouse(): void
    {
        // Arrange
        PickingOrderProgress::factory()->count(5)->create([
            'warehouse_id' => $this->warehouse1->id,
        ]);

        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse2->id,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders?warehouse_id='.$this->warehouse1->id);

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(5, $data);
        foreach ($data as $order) {
            $this->assertEquals($this->warehouse1->id, $order['warehouse']['id']);
        }
    }

    public function test_admin_can_filter_orders_by_status(): void
    {
        // Arrange
        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'in_progress',
        ]);

        PickingOrderProgress::factory()->count(2)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'completed',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders?status=in_progress');

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(3, $data);
        foreach ($data as $order) {
            $this->assertEquals('in_progress', $order['status']);
        }
    }

    public function test_admin_can_search_orders_by_number(): void
    {
        // Arrange
        PickingOrderProgress::factory()->create([
            'warehouse_id' => $this->warehouse1->id,
            'order_number' => 'NP-1001',
        ]);

        PickingOrderProgress::factory()->create([
            'warehouse_id' => $this->warehouse1->id,
            'order_number' => 'NP-1002',
        ]);

        PickingOrderProgress::factory()->create([
            'warehouse_id' => $this->warehouse1->id,
            'order_number' => 'NP-2050',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders?search=1001');

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('NP-1001', $data[0]['order_number']);
    }

    public function test_admin_can_get_order_detail(): void
    {
        // Arrange
        $order = PickingOrderProgress::factory()->create([
            'warehouse_id' => $this->warehouse1->id,
            'user_id' => $this->employee->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->count(3)->create([
            'picking_order_progress_id' => $order->id,
            'status' => 'completed',
        ]);

        PickingItemProgress::factory()->count(2)->create([
            'picking_order_progress_id' => $order->id,
            'status' => 'pending',
        ]);

        PickingAlert::factory()->create([
            'order_number' => $order->order_number,
            'warehouse_id' => $this->warehouse1->id,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders/'.$order->order_number);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'order_number',
                    'customer',
                    'status',
                    'warehouse',
                    'assigned_to',
                    'total_items',
                    'picked_items',
                    'completed_percentage',
                    'started_at',
                    'completed_at',
                    'items' => [
                        '*' => [
                            'id',
                            'product_code',
                            'description',
                            'quantity',
                            'picked_quantity',
                            'status',
                        ],
                    ],
                    'alerts' => [
                        '*' => [
                            'id',
                            'severity',
                            'alert_type',
                            'message',
                            'status',
                        ],
                    ],
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals($order->order_number, $data['order_number']);
        $this->assertEquals($this->employee->id, $data['assigned_to']['id']);
        $this->assertCount(5, $data['items']);
        $this->assertEquals(3, $data['picked_items']);
        $this->assertEquals(60.0, $data['completed_percentage']);
        $this->assertCount(1, $data['alerts']);
    }

    public function test_admin_can_filter_orders_by_date_range(): void
    {
        // Arrange
        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse1->id,
            'created_at' => now()->subDays(5),
        ]);

        PickingOrderProgress::factory()->count(2)->create([
            'warehouse_id' => $this->warehouse1->id,
            'created_at' => now(),
        ]);

        // Act - get orders from last 3 days
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/orders?date_from='.now()->subDays(3)->format('Y-m-d'));

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_regular_user_cannot_access_admin_orders(): void
    {
        // Act
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/admin/orders');

        // Assert
        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_admin_orders(): void
    {
        // Act
        $response = $this->getJson('/api/admin/orders');

        // Assert
        $response->assertStatus(401);
    }
}
