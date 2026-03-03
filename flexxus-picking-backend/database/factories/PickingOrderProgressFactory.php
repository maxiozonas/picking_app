<?php

namespace Database\Factories;

use App\Models\PickingOrderProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

class PickingOrderProgressFactory extends Factory
{
    protected $model = PickingOrderProgress::class;

    public function definition(): array
    {
        return [
            'order_number' => 'ORD-'.$this->faker->unique()->numerify('######'),
            'user_id' => \App\Models\User::factory(),
            'warehouse_id' => \App\Models\Warehouse::factory(),
            'status' => 'pending',
            'started_at' => null,
            'completed_at' => null,
            'has_stock_issues' => false,
            'issues_count' => 0,
        ];
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'started_at' => now()->subHours(2),
            'completed_at' => now(),
        ]);
    }

    public function hasIssues(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'has_issues',
            'has_stock_issues' => true,
            'issues_count' => $this->faker->numberBetween(1, 5),
        ]);
    }
}
