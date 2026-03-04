<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\InsufficientStockException;
use Tests\TestCase;

class InsufficientStockExceptionTest extends TestCase
{
    public function test_sets_http_status_to_400(): void
    {
        $exception = new InsufficientStockException('NP-999', 'ITEM-001', 10, 5);

        $this->assertEquals(400, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_insufficient_stock(): void
    {
        $exception = new InsufficientStockException('NP-999', 'ITEM-001', 10, 5);

        $this->assertEquals('INSUFFICIENT_STOCK', $exception->getErrorCode());
    }

    public function test_message_includes_item_and_quantities(): void
    {
        $exception = new InsufficientStockException('NP-999', 'ITEM-001', 10, 5);

        $message = $exception->getMessage();

        $this->assertStringContainsString('ITEM-001', $message);
        $this->assertStringContainsString('10', $message);
        $this->assertStringContainsString('5', $message);
    }

    public function test_context_includes_stock_breakdown(): void
    {
        $exception = new InsufficientStockException('NP-999', 'ITEM-002', 50, 20);

        $context = $exception->getContext();

        $this->assertArrayHasKey('order_number', $context);
        $this->assertArrayHasKey('item_code', $context);
        $this->assertArrayHasKey('requested_qty', $context);
        $this->assertArrayHasKey('available_qty', $context);

        $this->assertEquals('NP-999', $context['order_number']);
        $this->assertEquals('ITEM-002', $context['item_code']);
        $this->assertEquals(50, $context['requested_qty']);
        $this->assertEquals(20, $context['available_qty']);
    }
}
