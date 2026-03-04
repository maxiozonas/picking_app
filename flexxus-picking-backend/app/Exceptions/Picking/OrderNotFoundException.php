<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class OrderNotFoundException extends BaseException
{
    public function __construct(string $orderNumber, array $context = [])
    {
        $message = "Order {$orderNumber} not found";

        $context['order_number'] = $orderNumber;

        parent::__construct(
            $message,
            'ORDER_NOT_FOUND',
            404,
            $context
        );
    }
}
