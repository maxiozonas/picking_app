<?php

namespace Tests\Unit\Services;

use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\Interfaces\AlertServiceInterface;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\PickingService;
use App\Services\Picking\StockValidationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

class PickingStockValidationTest extends TestCase
{
    use RefreshDatabase;

    private PickingService $pickingService;

    private FlexxusPickingService $flexxusService;

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();

        $this->flexxusService = Mockery::mock(FlexxusPickingService::class);

        // Mock Flexxus stock to return valid values
        $this->flexxusService->shouldReceive('getProductStock')
            ->andReturn(['total' => 100]);

        $alertService = $this->app->make(AlertServiceInterface::class);
        $stockCacheService = $this->app->make(StockCacheServiceInterface::class);
        $warehouseContextResolver = $this->app->make(WarehouseExecutionContextResolverInterface::class);

        $stockValidationService = new StockValidationService($this->flexxusService, $alertService);

        $this->pickingService = new PickingService(
            $this->flexxusService,
            $stockValidationService,
            $stockCacheService,
            $warehouseContextResolver
        );

        $this->warehouse = Warehouse::factory()->create(['code' => 'WH01', 'name' => 'WH01']);
        $this->user = User::factory()->create(['warehouse_id' => $this->warehouse->id]);
    }

    public function test_validation_record_created_when_pick_succeeds()
    {
        $orderNumber = 'NP 12345';

        $order = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'item_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        // Clear any existing validation records
        PickingStockValidation::where('order_number', $orderNumber)->delete();

        // Pick the item
        $this->pickingService->pickItem($orderNumber, 'PROD1', 3, $this->user->id);

        // Assert validation record was created
        $validation = PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', 'PROD1')
            ->first();

        $this->assertNotNull($validation, 'Validation record should be created');
        $this->assertEquals('physical_stock', $validation->validation_type);
        $this->assertEquals(3, $validation->requested_qty);
        $this->assertEquals('passed', $validation->validation_result);
        $this->assertNull($validation->error_code);
        $this->assertEquals($this->user->id, $validation->user_id);
        $this->assertEquals($this->warehouse->id, $validation->warehouse_id);
    }

    public function test_validation_record_includes_stock_snapshot()
    {
        $orderNumber = 'NP 12345';

        $order = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'item_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_requested' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        // Pick the item
        $this->pickingService->pickItem($orderNumber, 'PROD1', 3, $this->user->id);

        // Get the validation record
        $validation = PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', 'PROD1')
            ->first();

        $this->assertNotNull($validation);
        $this->assertIsArray($validation->stock_snapshot);
        $this->assertArrayHasKey('local_picked', $validation->stock_snapshot);
        $this->assertArrayHasKey('local_requested', $validation->stock_snapshot);
        $this->assertArrayHasKey('flexxus_available', $validation->stock_snapshot);

        $this->assertEquals(5, $validation->stock_snapshot['local_picked']);
        $this->assertEquals(10, $validation->stock_snapshot['local_requested']);
        $this->assertEquals(100, $validation->stock_snapshot['flexxus_available']);
    }

    public function test_validation_records_accumulate_for_multiple_picks()
    {
        $orderNumber = 'NP 12345';

        $order = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'item_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 0,
            'status' => 'pending',
        ]);

        // First pick
        $this->pickingService->pickItem($orderNumber, 'PROD1', 3, $this->user->id);

        // Second pick
        $this->pickingService->pickItem($orderNumber, 'PROD1', 2, $this->user->id);

        // Assert multiple validation records were created
        $validations = PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', 'PROD1')
            ->get();

        $this->assertCount(2, $validations, 'Should create a validation record for each pick');

        // Check first validation
        $firstValidation = $validations->first();
        $this->assertEquals(3, $firstValidation->requested_qty);
        $this->assertEquals(0, $firstValidation->stock_snapshot['local_picked']);

        // Check second validation
        $secondValidation = $validations->last();
        $this->assertEquals(2, $secondValidation->requested_qty);
        $this->assertEquals(3, $secondValidation->stock_snapshot['local_picked']);
    }

    public function test_validation_record_has_timestamp()
    {
        $orderNumber = 'NP 12345';

        $order = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'item_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 0,
            'status' => 'pending',
        ]);

        // Pick the item
        $this->pickingService->pickItem($orderNumber, 'PROD1', 5, $this->user->id);

        // Get the validation record
        $validation = PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', 'PROD1')
            ->first();

        $this->assertNotNull($validation->validated_at);
        $this->assertGreaterThanOrEqual(now()->subSeconds(5), $validation->validated_at);
        $this->assertLessThanOrEqual(now()->addSeconds(5), $validation->validated_at);
    }

    public function test_validation_result_field_set_correctly()
    {
        $orderNumber = 'NP 12345';

        $order = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'item_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 0,
            'status' => 'pending',
        ]);

        // Pick the item
        $this->pickingService->pickItem($orderNumber, 'PROD1', 5, $this->user->id);

        // Get the validation record
        $validation = PickingStockValidation::where('order_number', $orderNumber)
            ->where('item_code', 'PROD1')
            ->first();

        $this->assertEquals('passed', $validation->validation_result);
        $this->assertNull($validation->error_code);
    }
}
