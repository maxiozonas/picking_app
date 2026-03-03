<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WarehouseOverrideTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_with_override_permission_can_switch_warehouse(): void
    {
        $user = User::factory()->withOverride()->create();
        $newWarehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($newWarehouse->id);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $newWarehouse->id,
            'duration' => 60,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'warehouse' => [
                        'id' => $newWarehouse->id,
                    ],
                ],
            ]);

        $this->assertNotNull($user->fresh()->override_expires_at);
    }

    public function test_user_without_override_permission_cannot_switch_warehouse(): void
    {
        $user = User::factory()->create([
            'can_override_warehouse' => false,
        ]);
        $newWarehouse = Warehouse::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $newWarehouse->id,
            'duration' => 60,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'No tienes permiso para cambiar de depósito',
            ]);
    }

    public function test_user_cannot_switch_to_unavailable_warehouse(): void
    {
        $user = User::factory()->withOverride()->create();
        $unavailableWarehouse = Warehouse::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $unavailableWarehouse->id,
            'duration' => 60,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'No tienes acceso a este depósito',
            ]);
    }

    public function test_override_sets_expiry_time(): void
    {
        $user = User::factory()->withOverride()->create();
        $newWarehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($newWarehouse->id);

        Sanctum::actingAs($user);

        $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $newWarehouse->id,
            'duration' => 60,
        ]);

        $user->refresh();

        $this->assertNotNull($user->override_expires_at);
        $this->assertGreaterThan(now(), $user->override_expires_at);
    }

    public function test_override_expires_after_specified_duration(): void
    {
        $user = User::factory()->withOverride()->create();
        $newWarehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($newWarehouse->id);

        Sanctum::actingAs($user);

        $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $newWarehouse->id,
            'duration' => 30,
        ]);

        $user->refresh();

        $expectedExpiry = now()->addMinutes(30);
        $diff = $user->override_expires_at->diffInSeconds($expectedExpiry);

        $this->assertLessThan(5, $diff);
    }

    public function test_clear_override_removes_override(): void
    {
        $user = User::factory()->withOverride()->create();
        $newWarehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($newWarehouse->id);

        Sanctum::actingAs($user);

        $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $newWarehouse->id,
            'duration' => 60,
        ]);

        $this->assertNotNull($user->fresh()->override_expires_at);

        $this->postJson('/api/auth/clear-override')
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Override de depósito eliminado',
            ]);

        $this->assertNull($user->fresh()->override_expires_at);
    }

    public function test_me_returns_override_warehouse_when_active(): void
    {
        $user = User::factory()->withOverride()->create();
        $newWarehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($newWarehouse->id);

        Sanctum::actingAs($user);

        $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $newWarehouse->id,
            'duration' => 60,
        ]);

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'user' => [
                        'warehouse' => [
                            'id' => $newWarehouse->id,
                        ],
                    ],
                ],
            ]);
    }

    public function test_user_without_cannot_override_returns_current_warehouse(): void
    {
        $user = User::factory()->create([
            'can_override_warehouse' => false,
        ]);

        Sanctum::actingAs($user);

        $currentWarehouseId = $user->warehouse_id;

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'user' => [
                        'warehouse' => [
                            'id' => $currentWarehouseId,
                        ],
                    ],
                ],
            ]);
    }
}
