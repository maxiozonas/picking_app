<?php

namespace Tests\Feature\Api\Admin;

use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use DatabaseMigrations;

    private User $admin;

    private User $regularUser;

    private Warehouse $warehouse1;

    private Warehouse $warehouse2;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles for Spatie
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);

        $this->admin = User::factory()->admin()->create();

        $this->regularUser = User::factory()->empleado()->create();

        $this->warehouse1 = Warehouse::factory()->create(['code' => 'CENTRO']);
        $this->warehouse2 = Warehouse::factory()->create(['code' => 'NORTE']);
    }

    public function test_admin_can_get_dashboard_statistics(): void
    {
        // Arrange
        PickingOrderProgress::factory()->count(5)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'in_progress',
        ]);

        PickingOrderProgress::factory()->count(2)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'completed',
        ]);

        PickingOrderProgress::factory()->count(4)->create([
            'warehouse_id' => $this->warehouse2->id,
            'status' => 'pending',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/stats');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_orders',
                    'in_progress_count',
                    'completed_count',
                    'by_warehouse' => [
                        '*' => [
                            'warehouse_id',
                            'warehouse_code',
                            'warehouse_name',
                            'total_orders',
                            'in_progress_count',
                            'completed_count',
                        ],
                    ],
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(14, $data['total_orders']);
        $this->assertEquals(3, $data['in_progress_count']);
        $this->assertEquals(2, $data['completed_count']);
        $this->assertCount(2, $data['by_warehouse']);
    }

    public function test_admin_can_filter_stats_by_warehouse(): void
    {
        // Arrange
        PickingOrderProgress::factory()->count(5)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse2->id,
            'status' => 'in_progress',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/stats?warehouse_id='.$this->warehouse1->id);

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(5, $data['total_orders']);
        $this->assertCount(1, $data['by_warehouse']);
        $this->assertEquals($this->warehouse1->id, $data['by_warehouse'][0]['warehouse_id']);
    }

    public function test_admin_can_filter_stats_by_date_range(): void
    {
        // Arrange
        PickingOrderProgress::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'completed',
            'created_at' => now()->subDays(2),
        ]);

        PickingOrderProgress::factory()->count(2)->create([
            'warehouse_id' => $this->warehouse1->id,
            'status' => 'in_progress',
            'created_at' => now(),
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/stats?date_from='.now()->subDay()->format('Y-m-d'));

        // Assert
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(2, $data['total_orders']);
        $this->assertEquals(2, $data['in_progress_count']);
        $this->assertEquals(0, $data['completed_count']);
    }

    public function test_regular_user_cannot_access_dashboard_stats(): void
    {
        // Act
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/admin/stats');

        // Assert
        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_dashboard_stats(): void
    {
        // Act
        $response = $this->getJson('/api/admin/stats');

        // Assert
        $response->assertStatus(401);
    }
}
