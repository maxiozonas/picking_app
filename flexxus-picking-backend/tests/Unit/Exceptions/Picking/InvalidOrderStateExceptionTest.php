<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\InvalidOrderStateException;
use Tests\TestCase;

class InvalidOrderStateExceptionTest extends TestCase
{
    public function test_sets_http_status_to_400(): void
    {
        $exception = new InvalidOrderStateException('NP-999', 'completed', 'pick_item');

        $this->assertEquals(400, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_invalid_order_state(): void
    {
        $exception = new InvalidOrderStateException('NP-999', 'completed', 'pick_item');

        $this->assertEquals('INVALID_ORDER_STATE', $exception->getErrorCode());
    }

    public function test_message_includes_state_and_action(): void
    {
        $exception = new InvalidOrderStateException('NP-999', 'completed', 'pick_item');

        $this->assertStringContainsString('completed', $exception->getMessage());
        $this->assertStringContainsString('pick_item', $exception->getMessage());
    }

    public function test_context_includes_transition_details(): void
    {
        $exception = new InvalidOrderStateException('NP-999', 'in_progress', 'complete');

        $context = $exception->getContext();

        $this->assertArrayHasKey('order_number', $context);
        $this->assertArrayHasKey('current_state', $context);
        $this->assertArrayHasKey('attempted_action', $context);

        $this->assertEquals('NP-999', $context['order_number']);
        $this->assertEquals('in_progress', $context['current_state']);
        $this->assertEquals('complete', $context['attempted_action']);
    }
}
