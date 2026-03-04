<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\BaseException;
use App\Exceptions\Picking\OrderNotFoundException;
use Tests\TestCase;

class OrderNotFoundExceptionTest extends TestCase
{
    public function test_extends_base_exception(): void
    {
        $exception = new OrderNotFoundException('NP-999');

        $this->assertInstanceOf(BaseException::class, $exception);
    }

    public function test_sets_http_status_to_404(): void
    {
        $exception = new OrderNotFoundException('NP-999');

        $this->assertEquals(404, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_order_not_found(): void
    {
        $exception = new OrderNotFoundException('NP-999');

        $this->assertEquals('ORDER_NOT_FOUND', $exception->getErrorCode());
    }

    public function test_message_includes_order_number(): void
    {
        $exception = new OrderNotFoundException('NP-999');

        $this->assertStringContainsString('NP-999', $exception->getMessage());
    }

    public function test_context_includes_order_number(): void
    {
        $orderNumber = 'NP-12345';
        $exception = new OrderNotFoundException($orderNumber);

        $this->assertArrayHasKey('order_number', $exception->getContext());
        $this->assertEquals($orderNumber, $exception->getContext()['order_number']);
    }

    public function test_accepts_additional_context(): void
    {
        $exception = new OrderNotFoundException('NP-999', ['warehouse_id' => 5]);

        $this->assertEquals('NP-999', $exception->getContext()['order_number']);
        $this->assertEquals(5, $exception->getContext()['warehouse_id']);
    }
}
