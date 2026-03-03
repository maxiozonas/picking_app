<?php

namespace Tests\Unit\Repositories;

use App\Models\User;
use App\Models\Warehouse;
use App\Repositories\Auth\AuthRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private AuthRepository $authRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authRepository = new AuthRepository;
    }

    public function test_find_by_username_returns_user_with_relationships(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create();
        $warehouse2 = Warehouse::factory()->create();
        $user->availableWarehouses()->attach($warehouse2->id);

        $result = $this->authRepository->findByUsername($user->username);

        $this->assertNotNull($result);
        $this->assertEquals($user->id, $result->id);
        $this->assertEquals($user->username, $result->username);
        $this->assertNotNull($result->warehouse);
        $this->assertEquals($warehouse->id, $result->warehouse->id);
        $this->assertCount(1, $result->availableWarehouses);
        $this->assertTrue($result->availableWarehouses->contains($warehouse2));
    }

    public function test_find_by_username_returns_null_when_not_found(): void
    {
        $result = $this->authRepository->findByUsername('nonexistent');

        $this->assertNull($result);
    }

    public function test_update_last_login_saves_timestamp(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'last_login_at' => null,
        ]);

        $this->assertNull($user->last_login_at);

        $this->authRepository->updateLastLogin($user);

        $user->refresh();
        $this->assertNotNull($user->last_login_at);
        $this->assertLessThanOrEqual(1, now()->diffInSeconds($user->last_login_at));
    }

    public function test_set_warehouse_override_updates_warehouse_id_and_expires_at(): void
    {
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse1)->create([
            'override_expires_at' => null,
        ]);

        $expiresAt = now()->addMinutes(60);

        $this->authRepository->setWarehouseOverride($user, $warehouse2->id, $expiresAt);

        $user->refresh();
        $this->assertEquals($warehouse2->id, $user->warehouse_id);
        $this->assertNotNull($user->override_expires_at);
        $this->assertEquals(
            $expiresAt->toDateTimeString(),
            $user->override_expires_at->toDateTimeString()
        );
    }

    public function test_clear_warehouse_override_sets_expires_at_to_null(): void
    {
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->for($warehouse)->create([
            'override_expires_at' => now()->addHour(),
        ]);

        $this->assertNotNull($user->override_expires_at);

        $this->authRepository->clearWarehouseOverride($user);

        $user->refresh();
        $this->assertNull($user->override_expires_at);
    }

    public function test_get_available_warehouses_returns_active_warehouses(): void
    {
        $user = User::factory()->create();
        $activeWarehouse = Warehouse::factory()->create(['is_active' => true]);
        $inactiveWarehouse = Warehouse::factory()->create(['is_active' => false]);

        $user->availableWarehouses()->attach([$activeWarehouse->id, $inactiveWarehouse->id]);

        $result = $this->authRepository->getAvailableWarehouses($user);

        $this->assertCount(1, $result);
        $this->assertTrue($result->contains($activeWarehouse));
        $this->assertFalse($result->contains($inactiveWarehouse));
    }
}
