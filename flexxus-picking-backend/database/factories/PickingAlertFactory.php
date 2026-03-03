<?php

namespace Database\Factories;

use App\Models\PickingAlert;
use Illuminate\Database\Eloquent\Factories\Factory;

class PickingAlertFactory extends Factory
{
    protected $model = PickingAlert::class;

    public function definition(): array
    {
        return [
            'order_number' => 'ORD-'.$this->faker->numerify('######'),
            'warehouse_id' => \App\Models\Warehouse::factory(),
            'user_id' => \App\Models\User::factory(),
            'alert_type' => $this->faker->randomElement(['insufficient_stock', 'product_missing', 'order_issue']),
            'product_code' => $this->faker->optional()->regexify('[A-Z]{3}[0-9]{4}'),
            'message' => $this->faker->sentence(),
            'severity' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'is_resolved' => false,
            'resolved_at' => null,
            'resolved_by' => null,
        ];
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_resolved' => true,
            'resolved_at' => now(),
            'resolved_by' => \App\Models\User::factory(),
        ]);
    }

    public function highSeverity(): static
    {
        return $this->state(fn (array $attributes) => [
            'severity' => 'high',
        ]);
    }
}
