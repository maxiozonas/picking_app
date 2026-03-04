<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingStockValidation>
 */
class PickingStockValidationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $validationType = fake()->randomElement(['over_pick', 'physical_stock', 'already_picked']);
        $validationResult = fake()->randomElement(['passed', 'failed']);

        return [
            'order_number' => 'NP-'.fake()->numberBetween(100, 999),
            'item_code' => 'PROD-'.fake()->numberBetween(1, 999),
            'validation_type' => $validationType,
            'requested_qty' => fake()->numberBetween(1, 100),
            'available_qty' => fake()->numberBetween(0, 100),
            'validation_result' => $validationResult,
            'error_code' => $validationResult === 'failed' ? fake()->randomElement([
                'OVER_PICK',
                'PHYSICAL_STOCK_INSUFFICIENT',
                'ALREADY_PICKED',
            ]) : null,
            'stock_snapshot' => [
                'physical' => fake()->numberBetween(0, 100),
                'cached' => fake()->boolean(),
                'location' => fake()->optional()->regexify('[A-Z]-\d{2}-\d{2}'),
                'timestamp' => now()->toIso8601String(),
            ],
            'context' => [
                'source' => fake()->randomElement(['flexxus_api', 'cache']),
                'response_time_ms' => fake()->numberBetween(50, 500),
            ],
            'validated_at' => now(),
            'user_id' => \App\Models\User::factory(),
            'warehouse_id' => \App\Models\Warehouse::factory(),
        ];
    }
}
