<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class InvalidOrderStateException extends BaseException
{
    public function __construct(string $orderNumber, string $currentState, string $attemptedAction, array $context = [])
    {
        $message = "Cannot {$attemptedAction} order {$orderNumber} in state '{$currentState}'";

        $context['order_number'] = $orderNumber;
        $context['current_state'] = $currentState;
        $context['attempted_action'] = $attemptedAction;

        parent::__construct(
            $message,
            'INVALID_ORDER_STATE',
            400,
            $context
        );
    }
}
