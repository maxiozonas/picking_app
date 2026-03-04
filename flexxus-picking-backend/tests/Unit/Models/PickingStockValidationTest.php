<?php

namespace Tests\Unit\Models;

use App\Models\PickingStockValidation;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickingStockValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_model_has_correct_fillable_attributes(): void
    {
        $validation = new PickingStockValidation;

        $expectedFillable = [
            'order_number',
            'item_code',
            'validation_type',
            'requested_qty',
            'available_qty',
            'validation_result',
            'error_code',
            'stock_snapshot',
            'context',
            'validated_at',
            'user_id',
            'warehouse_id',
        ];

        $this->assertEquals($expectedFillable, $validation->getFillable());
    }

    public function test_validation_type_enum_values(): void
    {
        $validTypes = ['over_pick', 'physical_stock', 'already_picked'];

        foreach ($validTypes as $type) {
            $validation = PickingStockValidation::factory()->create([
                'validation_type' => $type,
            ]);

            $this->assertEquals($type, $validation->validation_type);
        }
    }

    public function test_validation_result_enum_values(): void
    {
        $validResults = ['passed', 'failed'];

        foreach ($validResults as $result) {
            $validation = PickingStockValidation::factory()->create([
                'validation_result' => $result,
            ]);

            $this->assertEquals($result, $validation->validation_result);
        }
    }

    public function test_casts_json_fields(): void
    {
        $stockSnapshot = ['physical' => 50, 'cached' => false, 'location' => 'A-12-03'];
        $context = ['source' => 'flexxus_api', 'response_time_ms' => 150];

        $validation = PickingStockValidation::factory()->create([
            'stock_snapshot' => $stockSnapshot,
            'context' => $context,
        ]);

        $this->assertIsArray($validation->stock_snapshot);
        $this->assertEquals($stockSnapshot, $validation->stock_snapshot);
        $this->assertIsArray($validation->context);
        $this->assertEquals($context, $validation->context);
    }

    public function test_casts_validated_at_to_datetime(): void
    {
        $validation = PickingStockValidation::factory()->create([
            'validated_at' => '2026-03-04 10:30:00',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $validation->validated_at);
        $this->assertEquals('2026-03-04 10:30:00', $validation->validated_at->format('Y-m-d H:i:s'));
    }

    public function test_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $validation = PickingStockValidation::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $validation->user);
        $this->assertEquals($user->id, $validation->user->id);
    }

    public function test_belongs_to_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create();
        $validation = PickingStockValidation::factory()->create([
            'warehouse_id' => $warehouse->id,
        ]);

        $this->assertInstanceOf(Warehouse::class, $validation->warehouse);
        $this->assertEquals($warehouse->id, $validation->warehouse->id);
    }

    public function test_scope_successful(): void
    {
        PickingStockValidation::factory()->create(['validation_result' => 'passed']);
        PickingStockValidation::factory()->create(['validation_result' => 'failed']);
        PickingStockValidation::factory()->create(['validation_result' => 'passed']);

        $successful = PickingStockValidation::successful()->get();

        $this->assertCount(2, $successful);
        $successful->each(function ($validation) {
            $this->assertEquals('passed', $validation->validation_result);
        });
    }

    public function test_scope_failed(): void
    {
        PickingStockValidation::factory()->create(['validation_result' => 'passed']);
        PickingStockValidation::factory()->create(['validation_result' => 'failed']);
        PickingStockValidation::factory()->create(['validation_result' => 'failed']);

        $failed = PickingStockValidation::failed()->get();

        $this->assertCount(2, $failed);
        $failed->each(function ($validation) {
            $this->assertEquals('failed', $validation->validation_result);
        });
    }

    public function test_scope_for_order(): void
    {
        PickingStockValidation::factory()->create(['order_number' => 'NP-100']);
        PickingStockValidation::factory()->create(['order_number' => 'NP-123']);
        PickingStockValidation::factory()->create(['order_number' => 'NP-123']);

        $validations = PickingStockValidation::forOrder('NP-123')->get();

        $this->assertCount(2, $validations);
        $validations->each(function ($validation) {
            $this->assertEquals('NP-123', $validation->order_number);
        });
    }

    public function test_scope_for_item(): void
    {
        PickingStockValidation::factory()->create(['item_code' => 'PROD-001']);
        PickingStockValidation::factory()->create(['item_code' => 'PROD-002']);
        PickingStockValidation::factory()->create(['item_code' => 'PROD-002']);

        $validations = PickingStockValidation::forItem('PROD-002')->get();

        $this->assertCount(2, $validations);
        $validations->each(function ($validation) {
            $this->assertEquals('PROD-002', $validation->item_code);
        });
    }
}
