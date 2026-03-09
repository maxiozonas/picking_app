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

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles directly without seeder to avoid nested transactions
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'empleado']);
    }

    protected function createAdminUser(): User
    {
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    protected function createEmpleadoUser(): User
    {
        $empleado = User::factory()->create(['role' => 'empleado', 'warehouse_id' => null]);
        $empleado->assignRole('empleado');

        return $empleado;
    }

    public function test_admin_can_assign_warehouse_to_user(): void
    {
        $admin = $this->createAdminUser();
        $user = $this->createEmpleadoUser();
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

    public function test_admin_reassignment_updates_effective_employee_warehouse_context(): void
    {
        $admin = $this->createAdminUser();
        $oldWarehouse = Warehouse::factory()->create();
        $newWarehouse = Warehouse::factory()->create();
        $user = User::factory()->create([
            'role' => 'empleado',
            'warehouse_id' => $oldWarehouse->id,
            'override_expires_at' => now()->addHour(),
        ]);
        $user->assignRole('empleado');

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/users/{$user->id}/warehouses/{$newWarehouse->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.warehouse_id', $newWarehouse->id);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'warehouse_id' => $newWarehouse->id,
            'override_expires_at' => null,
        ]);
    }

    public function test_admin_can_remove_warehouse_from_user(): void
    {
        $admin = $this->createAdminUser();
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = $this->createEmpleadoUser();
        $user->warehouse_id = $warehouse1->id;
        $user->save();

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
        $admin = $this->createAdminUser();
        $warehouse = Warehouse::factory()->create();
        $user = $this->createEmpleadoUser();
        $user->warehouse_id = $warehouse->id;
        $user->save();

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

    public function test_non_admin_cannot_assign_warehouse_and_state_remains_unchanged(): void
    {
        $employee = $this->createEmpleadoUser();
        $targetUser = $this->createEmpleadoUser();
        $warehouse = Warehouse::factory()->create();

        Sanctum::actingAs($employee);

        $response = $this->postJson("/api/admin/users/{$targetUser->id}/warehouses/{$warehouse->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'warehouse_id' => null,
        ]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $employee = $this->createEmpleadoUser();
        $targetUser = $this->createEmpleadoUser();
        $warehouse = Warehouse::factory()->create();

        Sanctum::actingAs($employee);

        $this->getJson('/api/admin/warehouses')->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
        $this->getJson("/api/admin/users/{$targetUser->id}/warehouses")->assertForbidden();
        $this->deleteJson("/api/admin/users/{$targetUser->id}/warehouses/{$warehouse->id}")->assertForbidden();
    }
}
