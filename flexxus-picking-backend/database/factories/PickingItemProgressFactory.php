<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PickingItemProgressFactory extends Factory
{
    protected $model = \App\Models\PickingItemProgress::class;

    public function definition(): array
    {
        $order = \App\Models\PickingOrderProgress::factory()->create();

        return [
            'order_number' => $order->order_number,
            'product_code' => 'PROD-'.$this->faker->unique()->numerify('######'),
            'quantity_required' => $this->faker->numberBetween(1, 50),
            'quantity_picked' => 0,
            'status' => 'pending',
            'issue_type' => null,
            'issue_notes' => null,
            'completed_at' => null,
        ];
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'quantity_picked' => $this->faker->numberBetween(1, $attributes['quantity_required'] - 1),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'quantity_picked' => $attributes['quantity_required'],
            'completed_at' => now(),
        ]);
    }
}
