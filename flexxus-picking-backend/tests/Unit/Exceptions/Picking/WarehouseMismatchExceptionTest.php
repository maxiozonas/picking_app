<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\WarehouseMismatchException;
use Tests\TestCase;

class WarehouseMismatchExceptionTest extends TestCase
{
    public function test_sets_http_status_to_403(): void
    {
        $exception = new WarehouseMismatchException('NP-999', 1, 5);

        $this->assertEquals(403, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_warehouse_mismatch(): void
    {
        $exception = new WarehouseMismatchException('NP-999', 1, 5);

        $this->assertEquals('WAREHOUSE_MISMATCH', $exception->getErrorCode());
    }

    public function test_message_includes_warehouse_ids(): void
    {
        $exception = new WarehouseMismatchException('NP-999', 1, 5);

        $message = $exception->getMessage();

        $this->assertStringContainsString('1', $message);
        $this->assertStringContainsString('5', $message);
    }

    public function test_context_includes_warehouse_comparison(): void
    {
        $exception = new WarehouseMismatchException('NP-999', 10, 20);

        $context = $exception->getContext();

        $this->assertArrayHasKey('order_number', $context);
        $this->assertArrayHasKey('user_warehouse_id', $context);
        $this->assertArrayHasKey('order_warehouse_id', $context);

        $this->assertEquals('NP-999', $context['order_number']);
        $this->assertEquals(10, $context['user_warehouse_id']);
        $this->assertEquals(20, $context['order_warehouse_id']);
    }
}
