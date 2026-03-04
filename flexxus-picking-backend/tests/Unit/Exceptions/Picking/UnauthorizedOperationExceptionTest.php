<?php

namespace Tests\Unit\Exceptions\Picking;

use App\Exceptions\Picking\UnauthorizedOperationException;
use Tests\TestCase;

class UnauthorizedOperationExceptionTest extends TestCase
{
    public function test_sets_http_status_to_403(): void
    {
        $exception = new UnauthorizedOperationException('modify_order', 'not_owner');

        $this->assertEquals(403, $exception->getHttpStatus());
    }

    public function test_sets_error_code_to_forbidden(): void
    {
        $exception = new UnauthorizedOperationException('modify_order', 'not_owner');

        $this->assertEquals('FORBIDDEN', $exception->getErrorCode());
    }

    public function test_message_includes_operation_and_reason(): void
    {
        $exception = new UnauthorizedOperationException('delete_order', 'missing_permission');

        $message = $exception->getMessage();

        $this->assertStringContainsString('delete_order', $message);
        $this->assertStringContainsString('missing_permission', $message);
    }

    public function test_context_includes_operation_details(): void
    {
        $exception = new UnauthorizedOperationException('start_picking', 'order_assigned_to_other_user');

        $context = $exception->getContext();

        $this->assertArrayHasKey('operation', $context);
        $this->assertArrayHasKey('reason', $context);

        $this->assertEquals('start_picking', $context['operation']);
        $this->assertEquals('order_assigned_to_other_user', $context['reason']);
    }

    public function test_context_can_include_additional_data(): void
    {
        $exception = new UnauthorizedOperationException(
            'modify_order',
            'not_owner',
            ['user_id' => 5, 'order_user_id' => 10]
        );

        $context = $exception->getContext();

        $this->assertEquals('modify_order', $context['operation']);
        $this->assertEquals('not_owner', $context['reason']);
        $this->assertEquals(5, $context['user_id']);
        $this->assertEquals(10, $context['order_user_id']);
    }
}
