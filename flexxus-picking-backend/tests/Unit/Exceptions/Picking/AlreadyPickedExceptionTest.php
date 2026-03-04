<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\AlreadyPickedException;
use Tests\TestCase;

class AlreadyPickedExceptionTest extends TestCase
{
    public function test_sets_http_status_to_400(): void
    {
        $exception = new AlreadyPickedException('NP-123', 'PROD-001', 5, now());

        $this->assertEquals(400, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_already_picked(): void
    {
        $exception = new AlreadyPickedException('NP-123', 'PROD-001', 5, now());

        $this->assertEquals('ALREADY_PICKED', $exception->getErrorCode());
    }

    public function test_message_indicates_item_already_picked(): void
    {
        $exception = new AlreadyPickedException('NP-123', 'PROD-001', 5, now());

        $message = $exception->getMessage();

        $this->assertStringContainsString('El item PROD-001 ya fue pickeado', $message);
        $this->assertStringContainsString('5 unidades', $message);
    }

    public function test_context_includes_picked_quantity_and_timestamp(): void
    {
        $pickedAt = now();
        $exception = new AlreadyPickedException('NP-123', 'PROD-002', 10, $pickedAt);

        $context = $exception->getContext();

        $this->assertArrayHasKey('item_code', $context);
        $this->assertArrayHasKey('picked_quantity', $context);
        $this->assertArrayHasKey('picked_at', $context);
        $this->assertArrayHasKey('order_number', $context);

        $this->assertEquals('NP-123', $context['order_number']);
        $this->assertEquals('PROD-002', $context['item_code']);
        $this->assertEquals(10, $context['picked_quantity']);
        $this->assertEquals($pickedAt->toIso8601String(), $context['picked_at']);
    }

    public function test_extends_base_exception(): void
    {
        $exception = new AlreadyPickedException('NP-123', 'PROD-001', 5, now());

        $this->assertInstanceOf(\App\Exceptions\BaseException::class, $exception);
    }

    public function test_accepts_carbon_datetime_or_string_for_picked_at(): void
    {
        $carbonDate = now();
        $stringDate = '2026-03-04T10:30:00Z';

        $exception1 = new AlreadyPickedException('NP-123', 'PROD-001', 5, $carbonDate);
        $exception2 = new AlreadyPickedException('NP-123', 'PROD-001', 5, $stringDate);

        $context1 = $exception1->getContext();
        $context2 = $exception2->getContext();

        $this->assertArrayHasKey('picked_at', $context1);
        $this->assertArrayHasKey('picked_at', $context2);
    }
}
