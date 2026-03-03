<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_requires_username(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_login_requires_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'testuser',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_login_password_must_be_at_least_6_characters(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'testuser',
            'password' => '12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_override_warehouse_requires_warehouse_id(): void
    {
        $user = User::factory()->withOverride()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'duration' => 60,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_override_warehouse_warehouse_id_must_exist(): void
    {
        $user = User::factory()->withOverride()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => 999,
            'duration' => 60,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_override_warehouse_duration_must_be_integer(): void
    {
        $user = User::factory()->withOverride()->create();
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $warehouse->id,
            'duration' => 'not-an-integer',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['duration']);
    }

    public function test_override_warehouse_duration_min_is_15(): void
    {
        $user = User::factory()->withOverride()->create();
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $warehouse->id,
            'duration' => 10,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['duration']);
    }

    public function test_override_warehouse_duration_max_is_480(): void
    {
        $user = User::factory()->withOverride()->create();
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $warehouse->id,
            'duration' => 500,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['duration']);
    }

    public function test_override_warehouse_accepts_minimum_duration(): void
    {
        $user = User::factory()->withOverride()->create();
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $warehouse->id,
            'duration' => 15,
        ]);

        $response->assertStatus(200);
    }

    public function test_override_warehouse_accepts_maximum_duration(): void
    {
        $user = User::factory()->withOverride()->create();
        $warehouse = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse->id);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/override-warehouse', [
            'warehouse_id' => $warehouse->id,
            'duration' => 480,
        ]);

        $response->assertStatus(200);
    }

    public function test_login_accepts_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('validpass'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'validpass',
        ]);

        $response->assertStatus(200);
    }
}
