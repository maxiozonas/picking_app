<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class PhysicalStockInsufficientException extends BaseException
{
    public function __construct(
        string $orderNumber,
        string $itemCode,
        int $requestedQty,
        int $availableQty,
        array $context = []
    ) {
        $message = "Stock físico insuficiente: hay {$availableQty}, se solicitaron {$requestedQty}";

        $context['order_number'] = $orderNumber;
        $context['item_code'] = $itemCode;
        $context['requested_quantity'] = $requestedQty;
        $context['available_quantity'] = $availableQty;

        parent::__construct(
            $message,
            'PHYSICAL_STOCK_INSUFFICIENT',
            400,
            $context
        );
    }
}
