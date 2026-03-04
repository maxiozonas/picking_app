<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\PhysicalStockInsufficientException;
use Tests\TestCase;

class PhysicalStockInsufficientExceptionTest extends TestCase
{
    public function test_sets_http_status_to_400(): void
    {
        $exception = new PhysicalStockInsufficientException('NP-123', 'PROD-001', 10, 5);

        $this->assertEquals(400, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_physical_stock_insufficient(): void
    {
        $exception = new PhysicalStockInsufficientException('NP-123', 'PROD-001', 10, 5);

        $this->assertEquals('PHYSICAL_STOCK_INSUFFICIENT', $exception->getErrorCode());
    }

    public function test_message_indicates_physical_stock_insufficient(): void
    {
        $exception = new PhysicalStockInsufficientException('NP-123', 'PROD-001', 10, 5);

        $message = $exception->getMessage();

        $this->assertStringContainsString('Stock físico insuficiente', $message);
        $this->assertStringContainsString('hay 5', $message);
        $this->assertStringContainsString('se solicitaron 10', $message);
        // Item code is in context, not in message (per spec)
    }

    public function test_context_includes_requested_and_available_quantities(): void
    {
        $exception = new PhysicalStockInsufficientException('NP-123', 'PROD-002', 50, 20);

        $context = $exception->getContext();

        $this->assertArrayHasKey('item_code', $context);
        $this->assertArrayHasKey('requested_quantity', $context);
        $this->assertArrayHasKey('available_quantity', $context);
        $this->assertArrayHasKey('order_number', $context);

        $this->assertEquals('NP-123', $context['order_number']);
        $this->assertEquals('PROD-002', $context['item_code']);
        $this->assertEquals(50, $context['requested_quantity']);
        $this->assertEquals(20, $context['available_quantity']);
    }

    public function test_extends_base_exception(): void
    {
        $exception = new PhysicalStockInsufficientException('NP-123', 'PROD-001', 10, 5);

        $this->assertInstanceOf(\App\Exceptions\BaseException::class, $exception);
    }

    public function test_accepts_optional_context_parameters(): void
    {
        $exception = new PhysicalStockInsufficientException(
            'NP-123',
            'PROD-001',
            10,
            5,
            ['warehouse_id' => 5, 'location' => 'A-12-03']
        );

        $context = $exception->getContext();

        $this->assertArrayHasKey('warehouse_id', $context);
        $this->assertEquals(5, $context['warehouse_id']);
        $this->assertArrayHasKey('location', $context);
        $this->assertEquals('A-12-03', $context['location']);
    }
}
