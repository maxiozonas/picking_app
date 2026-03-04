<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\OverPickException;
use Tests\TestCase;

class OverPickExceptionTest extends TestCase
{
    public function test_sets_http_status_to_400(): void
    {
        $exception = new OverPickException('NP-123', 'PROD-001', 15, 10);

        $this->assertEquals(400, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_over_pick(): void
    {
        $exception = new OverPickException('NP-123', 'PROD-001', 15, 10);

        $this->assertEquals('OVER_PICK', $exception->getErrorCode());
    }

    public function test_message_indicates_cannot_mark_more_than_requested(): void
    {
        $exception = new OverPickException('NP-123', 'PROD-001', 15, 10);

        $message = $exception->getMessage();

        $this->assertStringContainsString('PROD-001', $message);
        $this->assertStringContainsString('10', $message);
        $this->assertStringContainsString('No se puede marcar más', $message);
    }

    public function test_context_includes_requested_and_max_allowed_quantities(): void
    {
        $exception = new OverPickException('NP-123', 'PROD-002', 50, 20);

        $context = $exception->getContext();

        $this->assertArrayHasKey('order_number', $context);
        $this->assertArrayHasKey('item_code', $context);
        $this->assertArrayHasKey('requested_quantity', $context);
        $this->assertArrayHasKey('max_allowed', $context);

        $this->assertEquals('NP-123', $context['order_number']);
        $this->assertEquals('PROD-002', $context['item_code']);
        $this->assertEquals(50, $context['requested_quantity']);
        $this->assertEquals(20, $context['max_allowed']);
    }

    public function test_extends_base_exception(): void
    {
        $exception = new OverPickException('NP-123', 'PROD-001', 15, 10);

        $this->assertInstanceOf(\App\Exceptions\BaseException::class, $exception);
    }
}
