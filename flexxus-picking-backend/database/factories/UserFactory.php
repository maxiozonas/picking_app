<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'username' => $this->faker->unique()->userName,
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'warehouse_id' => Warehouse::factory(),
            'role' => 'empleado',
            'is_active' => true,
            'can_override_warehouse' => false,
        ];
    }

    protected function initialize(): static
    {
        return $this->afterCreating(function (User $user) {
            if (! $user->hasRole($user->role)) {
                $user->assignRole($user->role);
            }
        });
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withOverride(): static
    {
        return $this->state(fn (array $attributes) => [
            'can_override_warehouse' => true,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'can_override_warehouse' => true,
        ])->afterCreating(function (User $user) {
            $user->assignRole('admin');
        });
    }

    public function empleado(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'empleado',
        ])->afterCreating(function (User $user) {
            $user->assignRole('empleado');
        });
    }
}
