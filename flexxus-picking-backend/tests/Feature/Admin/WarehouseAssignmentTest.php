<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WarehouseAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_assign_warehouse_to_user(): void
    {
        $admin = User::factory()->create();
        $user = User::factory()->create(['role' => 'empleado']);
        $warehouse = Warehouse::factory()->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/users/{$user->id}/warehouses/{$warehouse->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Warehouse assigned successfully',
                'data' => [
                    'user_id' => $user->id,
                    'warehouse_id' => $warehouse->id,
                    'warehouse' => [
                        'id' => $warehouse->id,
                        'code' => $warehouse->code,
                        'name' => $warehouse->name,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'warehouse_id' => $warehouse->id,
        ]);
    }

    public function test_admin_can_remove_warehouse_from_user(): void
    {
        $admin = User::factory()->create();
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = User::factory()->create(['role' => 'empleado', 'warehouse_id' => $warehouse1->id]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'warehouse_id' => $warehouse1->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/users/{$user->id}/warehouses/{$warehouse1->id}");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot remove primary warehouse. Assign a new warehouse first.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'warehouse_id' => $warehouse1->id,
        ]);
    }

    public function test_admin_can_get_user_warehouses(): void
    {
        $admin = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->create(['role' => 'empleado', 'warehouse_id' => $warehouse->id]);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/admin/users/{$user->id}/warehouses");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'warehouse' => [
                        'id',
                        'code',
                        'name',
                        'client',
                        'branch',
                        'is_active',
                    ],
                ],
            ])
            ->assertJson([
                'data' => [
                    'warehouse' => [
                        'id' => $warehouse->id,
                        'code' => $warehouse->code,
                        'name' => $warehouse->name,
                    ],
                ],
            ]);
    }
}
