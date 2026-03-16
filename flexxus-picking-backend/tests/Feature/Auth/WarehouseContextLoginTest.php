<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Phase 4 Task 4.3: Verify AuthController returns warehouse in login response
 *
 * This test ensures that the login endpoint returns the user's warehouse
 * relationship so the frontend can display warehouse context.
 */
class WarehouseContextLoginTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'empleado']);
    }

    public function test_login_returns_user_with_warehouse_relationship(): void
    {
        // Arrange: Create user with warehouse
        $warehouse = Warehouse::factory()->create([
            'code' => 'WAREHOUSE01',
            'name' => 'Main Warehouse',
        ]);

        $user = User::factory()->create([
            'warehouse_id' => $warehouse->id,
            'password' => bcrypt('password123'),
        ]);

        // Act: Login
        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password123',
        ]);

        // Assert: Response includes warehouse data
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token' => [
                        'abilities',
                        'name',
                        'token',
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
            ])
            ->assertJson([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'warehouse' => [
                            'id' => $warehouse->id,
                            'code' => $warehouse->code,
                            'name' => $warehouse->name,
                        ],
                    ],
                ],
            ]);
    }

    public function test_login_returns_available_warehouses_for_multi_warehouse_users(): void
    {
        // Arrange: Create admin user with multiple warehouses
        $warehouse1 = Warehouse::factory()->create(['code' => 'WAREHOUSE01']);
        $warehouse2 = Warehouse::factory()->create(['code' => 'WAREHOUSE02']);
        $warehouse3 = Warehouse::factory()->create(['code' => 'WAREHOUSE03']);

        $user = User::factory()->admin()->create([
            'password' => bcrypt('password123'),
        ]);

        // Attach all warehouses to user
        $user->warehouses()->attach([$warehouse1->id, $warehouse2->id, $warehouse3->id]);
        $user->warehouse_id = $warehouse1->id; // Set primary
        $user->save();

        // Act: Login
        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password123',
        ]);

        // Assert: Response includes all available warehouses
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => [
                        'available_warehouses' => [
                            '*' => [
                                'id',
                                'code',
                                'name',
                            ],
                        ],
                    ],
                ],
            ])
            ->assertJsonPath('data.user.available_warehouses', function ($warehouses) use ($warehouse1, $warehouse2, $warehouse3) {
                return count($warehouses) === 3
                    && collect($warehouses)->pluck('id')->sort()->values()->all() === [
                        $warehouse1->id,
                        $warehouse2->id,
                        $warehouse3->id,
                    ];
            });
    }

    public function test_login_for_user_without_warehouse(): void
    {
        // Arrange: Create user without warehouse
        $user = User::factory()->create([
            'warehouse_id' => null,
            'password' => bcrypt('password123'),
        ]);

        // Act: Login
        $response = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password123',
        ]);

        // Assert: Login succeeds but warehouse is null
        $response->assertStatus(200)
            ->assertJsonPath('data.user.warehouse', null);
    }

    public function test_me_endpoint_returns_warehouse_context(): void
    {
        // Arrange: Create user with warehouse
        $warehouse = Warehouse::factory()->create([
            'code' => 'WAREHOUSE01',
        ]);

        $user = User::factory()->create([
            'warehouse_id' => $warehouse->id,
        ]);

        // Act: Get authenticated user info
        Sanctum::actingAs($user);
        $response = $this->getJson('/api/auth/me');

        // Assert: Response includes warehouse
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => [
                        'warehouse',
                    ],
                ],
            ])
            ->assertJson([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'warehouse' => [
                            'id' => $warehouse->id,
                            'code' => $warehouse->code,
                        ],
                    ],
                ],
            ]);
    }
}
