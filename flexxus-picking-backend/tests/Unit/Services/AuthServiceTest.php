<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\Warehouse;
use App\Repositories\Auth\AuthRepositoryInterface;
use App\Services\Auth\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $authService;

    private AuthRepositoryInterface $authRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authRepository = Mockery::mock(AuthRepositoryInterface::class);
        $this->authService = new AuthService($this->authRepository);
    }

    public function test_login_with_valid_credentials_returns_token_and_user(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'password' => Hash::make('password123'),
        ]);

        $this->authRepository
            ->shouldReceive('findByUsername')
            ->with($user->username)
            ->andReturn($user);

        $this->authRepository
            ->shouldReceive('updateLastLogin')
            ->with($user)
            ->once();

        $result = $this->authService->login($user->username, 'password123');

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertIsString($result['token']);
        $this->assertEquals($user->id, $result['user']['id']);
        $this->assertEquals($user->username, $result['user']['username']);
    }

    public function test_login_with_invalid_credentials_throws_validation_exception(): void
    {
        $this->authRepository
            ->shouldReceive('findByUsername')
            ->with('nonexistent')
            ->andReturn(null);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Credenciales inválidas');

        $this->authService->login('nonexistent', 'wrongpassword');
    }

    public function test_login_with_wrong_password_throws_validation_exception(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'password' => Hash::make('correctpassword'),
        ]);

        $this->authRepository
            ->shouldReceive('findByUsername')
            ->with($user->username)
            ->andReturn($user);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Credenciales inválidas');

        $this->authService->login($user->username, 'wrongpassword');
    }

    public function test_login_with_inactive_user_throws_validation_exception(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->inactive()->create([
            'password' => Hash::make('password123'),
        ]);

        $this->authRepository
            ->shouldReceive('findByUsername')
            ->with($user->username)
            ->andReturn($user);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Usuario inactivo. Contacte al administrador.');

        $this->authService->login($user->username, 'password123');
    }

    public function test_logout_deletes_current_token(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create();
        $token = $user->createToken('auth-token');
        $user->withAccessToken($token->accessToken);

        $this->authService->logout($user);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }

    public function test_me_returns_user_with_warehouse_context(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create();
        $warehouse2 = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse2->id);

        $result = $this->authService->me($user);

        $this->assertArrayHasKey('user', $result);
        $this->assertEquals($user->id, $result['user']['id']);
        $this->assertEquals($user->username, $result['user']['username']);
        $this->assertEquals($warehouse->id, $result['user']['warehouse_id']);
        $this->assertIsArray($result['user']['available_warehouses']->toArray());
        $this->assertCount(1, $result['user']['available_warehouses']);
    }

    public function test_override_warehouse_sets_override_expires_at(): void
    {
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse1)->create([
            'can_override_warehouse' => true,
        ]);
        $user->availableWarehouses()->attach($warehouse2->id);

        $expiresAt = now()->addMinutes(60);

        $this->authRepository
            ->shouldReceive('setWarehouseOverride')
            ->with(
                Mockery::on(function ($arg) use ($user) {
                    return $arg->id === $user->id;
                }),
                $warehouse2->id,
                Mockery::on(function ($arg) {
                    return $arg instanceof \DateTime;
                })
            )
            ->once()
            ->andReturnUsing(function () use ($user, $warehouse2, $expiresAt) {
                $user->warehouse_id = $warehouse2->id;
                $user->override_expires_at = $expiresAt;
                $user->save();
            });

        $result = $this->authService->overrideWarehouse($user, $warehouse2->id, 60);

        $this->assertArrayHasKey('id', $result);
        $this->assertArrayHasKey('override_expires_at', $result);
        $this->assertEquals($user->id, $result['id']);
        $this->assertNotNull($result['override_expires_at']);
    }

    public function test_override_warehouse_fails_if_user_cannot_override(): void
    {
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse1)->create([
            'can_override_warehouse' => false,
        ]);
        $user->availableWarehouses()->attach($warehouse2->id);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('No tienes permiso para cambiar de depósito');

        $this->authService->overrideWarehouse($user, $warehouse2->id, 60);
    }

    public function test_override_warehouse_fails_if_user_cannot_access_warehouse(): void
    {
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse1)->create([
            'can_override_warehouse' => true,
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('No tienes acceso a este depósito');

        $this->authService->overrideWarehouse($user, $warehouse2->id, 60);
    }

    public function test_clear_override_removes_override_expires_at(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'override_expires_at' => now()->addHour(),
        ]);

        $this->authRepository
            ->shouldReceive('clearWarehouseOverride')
            ->with($user)
            ->once()
            ->globally()
            ->ordered();

        $this->authService->clearOverride($user);

        $this->assertTrue(true);
    }
}
