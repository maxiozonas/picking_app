<?php

namespace Tests\Unit\Services\Picking;

use App\Exceptions\Picking\AlreadyPickedException;
use App\Exceptions\Picking\OverPickException;
use App\Exceptions\Picking\PhysicalStockInsufficientException;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\AlertServiceInterface;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

// Alias Log facade for shorter syntax

class StockValidationServiceTest extends TestCase
{
    use RefreshDatabase;

    private StockValidationServiceInterface $validationService;

    private User $user;

    private Warehouse $warehouse;

    private PickingOrderProgress $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->validationService = $this->app->make(StockValidationServiceInterface::class);
        $this->user = User::factory()->create();
        $this->warehouse = Warehouse::factory()->create();

        $this->order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_validate_stock_prevents_over_pick(): void
    {
        // Arrange
        $itemCode = 'PROD-001';
        $requestedQty = 5;
        $orderQty = 10;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => $orderQty,
            'quantity_picked' => 8, // Already picked 8
        ]);

        // Act & Assert
        $this->expectException(OverPickException::class);
        $this->expectExceptionMessage('No se puede marcar más de');

        $this->validationService->validateStockForPick(
            $this->order->order_number,
            $itemCode,
            $requestedQty,
            $this->user
        );
    }

    public function test_validate_stock_prevents_repick_already_completed(): void
    {
        // Arrange
        $itemCode = 'PROD-002';
        $requestedQty = 1;
        $orderQty = 10;

        $item = PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => $orderQty,
            'quantity_picked' => $orderQty, // Already fully picked
            'completed_at' => now(),
        ]);

        // Act & Assert
        $this->expectException(AlreadyPickedException::class);
        $this->expectExceptionMessage('ya fue pickeado');

        $this->validationService->validateStockForPick(
            $this->order->order_number,
            $itemCode,
            $requestedQty,
            $this->user
        );
    }

    public function test_validate_stock_checks_flexxus_stock_when_needed(): void
    {
        // Arrange
        $itemCode = 'PROD-003';
        $requestedQty = 5;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => 10,
            'quantity_picked' => 0,
        ]);

        // Mock FlexxusPickingService to return insufficient stock (3 available, 5 requested)
        $mockFlexxus = $this->createMock(\App\Services\Picking\FlexxusPickingService::class);
        $mockAlert = $this->createMock(AlertServiceInterface::class);

        $mockFlexxus->method('getProductStock')
            ->with($itemCode, $this->callback(fn ($wh) => $wh instanceof \App\Models\Warehouse && $wh->id === $this->warehouse->id))
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 3, // Only 3 available
                'is_local' => true,
            ]);

        // Re-create the validation service with the mocked dependencies
        $this->validationService = new \App\Services\Picking\StockValidationService($mockFlexxus, $mockAlert);

        // Act & Assert - should throw PhysicalStockInsufficientException
        $this->expectException(PhysicalStockInsufficientException::class);
        $this->expectExceptionMessage('Stock físico insuficiente');

        $this->validationService->validateStockForPick(
            $this->order->order_number,
            $itemCode,
            $requestedQty,
            $this->user
        );
    }

    public function test_validate_stock_creates_validation_record(): void
    {
        // Arrange
        $itemCode = 'PROD-004';
        $requestedQty = 3;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => 10,
            'quantity_picked' => 0,
        ]);

        // Mock FlexxusPickingService to return sufficient stock
        $this->instance(
            \App\Services\Picking\FlexxusPickingService::class,
            $mockFlexxus = $this->createMock(\App\Services\Picking\FlexxusPickingService::class)
        );

        $mockFlexxus->method('getProductStock')
            ->with($itemCode, $this->callback(fn ($wh) => $wh instanceof \App\Models\Warehouse && $wh->id === $this->warehouse->id))
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 50, // Sufficient stock
                'is_local' => true,
            ]);

        // Re-create the validation service with the mocked dependency
        $this->validationService = new \App\Services\Picking\StockValidationService($mockFlexxus, $this->createMock(AlertServiceInterface::class));

        // Act
        $validation = $this->validationService->validateStockForPick(
            $this->order->order_number,
            $itemCode,
            $requestedQty,
            $this->user
        );

        // Assert
        $this->assertInstanceOf(PickingStockValidation::class, $validation);
        $this->assertEquals($this->order->order_number, $validation->order_number);
        $this->assertEquals($itemCode, $validation->item_code);
        $this->assertEquals('passed', $validation->validation_result);
        $this->assertEquals($requestedQty, $validation->requested_qty);
        $this->assertNotNull($validation->validated_at);
    }

    public function test_get_latest_validation_returns_most_recent(): void
    {
        // Arrange
        $itemCode = 'PROD-005';

        PickingStockValidation::factory()->create([
            'order_number' => $this->order->order_number,
            'item_code' => $itemCode,
            'validated_at' => now()->subMinutes(10),
        ]);

        $latest = PickingStockValidation::factory()->create([
            'order_number' => $this->order->order_number,
            'item_code' => $itemCode,
            'validated_at' => now(),
        ]);

        // Act
        $validation = $this->validationService->getLatestValidation(
            $this->order->order_number,
            $itemCode
        );

        // Assert
        $this->assertNotNull($validation);
        $this->assertEquals($latest->id, $validation->id);
    }

    public function test_is_validation_valid_checks_ttl(): void
    {
        // Arrange
        $validation = PickingStockValidation::factory()->create([
            'validated_at' => now()->subSeconds(30), // Within default TTL (60s)
        ]);

        // Act
        $isValid = $this->validationService->isValidationValid($validation);

        // Assert
        $this->assertTrue($isValid);
    }

    public function test_is_validation_invalid_when_expired(): void
    {
        // Arrange
        $validation = PickingStockValidation::factory()->create([
            'validated_at' => now()->subMinutes(2), // Beyond default TTL (60s)
        ]);

        // Act
        $isValid = $this->validationService->isValidationValid($validation);

        // Assert
        $this->assertFalse($isValid);
    }

    // ==================== INTEGRATION TESTS (Task 4.8) ====================

    public function test_physical_stock_insufficient_creates_alert(): void
    {
        // Arrange
        $itemCode = 'PROD-003';
        $requestedQty = 5;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => 10,
            'quantity_picked' => 0,
        ]);

        // Mock FlexxusPickingService to return insufficient stock
        $mockFlexxus = $this->createMock(\App\Services\Picking\FlexxusPickingService::class);

        $mockFlexxus->method('getProductStock')
            ->with($itemCode, $this->callback(fn ($wh) => $wh instanceof \App\Models\Warehouse && $wh->id === $this->warehouse->id))
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 3, // Only 3 available
                'is_local' => true,
            ]);

        // Get real AlertService from container for integration test
        $realAlertService = $this->app->make(AlertServiceInterface::class);

        // Re-create the validation service with the mocked Flexxus but real AlertService
        $this->validationService = new \App\Services\Picking\StockValidationService($mockFlexxus, $realAlertService);

        // Act & Assert
        $this->expectException(PhysicalStockInsufficientException::class);

        try {
            $this->validationService->validateStockForPick(
                $this->order->order_number,
                $itemCode,
                $requestedQty,
                $this->user
            );
        } catch (PhysicalStockInsufficientException $e) {
            // Assert that an alert was created
            $this->assertDatabaseHas('picking_alerts', [
                'order_number' => $this->order->order_number,
                'alert_type' => 'insufficient_stock',
                'product_code' => $itemCode,
                'severity' => 'high',
            ]);
            throw $e; // Re-throw to satisfy the exception expectation
        }
    }

    public function test_over_pick_attempt_creates_critical_alert(): void
    {
        // Arrange
        $itemCode = 'PROD-001';
        $requestedQty = 5;
        $orderQty = 10;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => $orderQty,
            'quantity_picked' => 8, // Already picked 8
        ]);

        // Act & Assert
        $this->expectException(OverPickException::class);

        try {
            $this->validationService->validateStockForPick(
                $this->order->order_number,
                $itemCode,
                $requestedQty,
                $this->user
            );
        } catch (OverPickException $e) {
            // Assert that a critical alert was created
            $this->assertDatabaseHas('picking_alerts', [
                'order_number' => $this->order->order_number,
                'alert_type' => 'insufficient_stock',
                'product_code' => $itemCode,
                'severity' => 'critical',
            ]);
            throw $e;
        }
    }

    public function test_successful_validation_does_not_create_alert(): void
    {
        // Arrange
        $itemCode = 'PROD-004';
        $requestedQty = 3;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => 10,
            'quantity_picked' => 0,
        ]);

        // Mock FlexxusPickingService to return sufficient stock
        $mockFlexxus = $this->createMock(\App\Services\Picking\FlexxusPickingService::class);

        $mockFlexxus->method('getProductStock')
            ->with($itemCode, $this->callback(fn ($wh) => $wh instanceof \App\Models\Warehouse && $wh->id === $this->warehouse->id))
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 50, // Sufficient stock
                'is_local' => true,
            ]);

        // Get real AlertService from container for integration test
        $realAlertService = $this->app->make(AlertServiceInterface::class);

        // Re-create the validation service with the mocked Flexxus but real AlertService
        $this->validationService = new \App\Services\Picking\StockValidationService($mockFlexxus, $realAlertService);

        // Act
        $validation = $this->validationService->validateStockForPick(
            $this->order->order_number,
            $itemCode,
            $requestedQty,
            $this->user
        );

        // Assert
        $this->assertInstanceOf(PickingStockValidation::class, $validation);
        $this->assertDatabaseMissing('picking_alerts', [
            'order_number' => $this->order->order_number,
            'product_code' => $itemCode,
        ]);
    }

    // ==================== LOGGING TESTS (Task 4.9) ====================

    public function test_logging_configured_for_validations(): void
    {
        // Test that the logging channel exists
        $this->assertArrayHasKey('picking_validations', config('logging.channels'));
        $this->assertEquals('daily', config('logging.channels.picking_validations.driver'));
    }

    public function test_validation_does_not_throw_exception_with_logging(): void
    {
        // This test verifies that logging doesn't break the validation flow
        // Arrange
        $itemCode = 'PROD-007';
        $requestedQty = 3;

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'product_code' => $itemCode,
            'quantity_requested' => 10,
            'quantity_picked' => 0,
        ]);

        $mockFlexxus = $this->createMock(\App\Services\Picking\FlexxusPickingService::class);
        $mockFlexxus->method('getProductStock')
            ->with(
                $itemCode,
                $this->callback(function ($warehouse) {
                    return $warehouse instanceof \App\Models\Warehouse
                        && $warehouse->id === $this->warehouse->id;
                })
            )
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 3, // Only 3 available
                'is_local' => true,
            ]);

        $mockAlert = $this->createMock(AlertServiceInterface::class);
        $this->validationService = new \App\Services\Picking\StockValidationService($mockFlexxus, $mockAlert);

        // Act - should not throw exception
        $validation = $this->validationService->validateStockForPick(
            $this->order->order_number,
            $itemCode,
            $requestedQty,
            $this->user
        );

        // Assert
        $this->assertInstanceOf(PickingStockValidation::class, $validation);
        $this->assertEquals('passed', $validation->validation_result);
    }
}
