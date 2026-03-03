<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('validpassword'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'validpassword',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'username',
                        'name',
                        'warehouse',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => get_class($user),
        ]);
    }

    public function test_login_fails_with_invalid_username(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'nonexistent',
            'password' => 'password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Credenciales inválidas',
            ]);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('correctpassword'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Credenciales inválidas',
            ]);
    }

    public function test_login_fails_with_inactive_user(): void
    {
        $user = User::factory()->inactive()->create([
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Usuario inactivo. Contacte al administrador.',
            ]);
    }

    public function test_login_response_has_correct_structure(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token' => [
                        'abilities',
                        'name',
                        'expires_at',
                    ],
                    'user' => [
                        'id',
                        'username',
                        'name',
                        'email',
                        'warehouse' => [
                            'id',
                            'code',
                            'name',
                        ],
                        'available_warehouses',
                    ],
                ],
            ]);
    }

    public function test_login_rate_limits_after_5_attempts(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('correctpassword'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'username' => $user->username,
                'password' => 'wrongpassword',
            ])->assertStatus(401);
        }

        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429);
    }

    public function test_login_updates_last_login_at(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
            'last_login_at' => null,
        ]);

        $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }
}
