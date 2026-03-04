<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class WarehouseMismatchException extends BaseException
{
    public function __construct(string $orderNumber, int $userWarehouseId, int $orderWarehouseId, array $context = [])
    {
        $message = "Order {$orderNumber} warehouse mismatch: user warehouse {$userWarehouseId} vs order warehouse {$orderWarehouseId}";

        $context['order_number'] = $orderNumber;
        $context['user_warehouse_id'] = $userWarehouseId;
        $context['order_warehouse_id'] = $orderWarehouseId;

        parent::__construct(
            $message,
            'WAREHOUSE_MISMATCH',
            403,
            $context
        );
    }
}
