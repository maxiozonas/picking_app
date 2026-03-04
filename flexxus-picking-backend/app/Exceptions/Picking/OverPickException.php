<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class OverPickException extends BaseException
{
    public function __construct(string $orderNumber, string $itemCode, int $requestedQty, int $maxAllowed, array $context = [])
    {
        $message = "No se puede marcar más de {$maxAllowed} unidades para {$itemCode}";

        $context['order_number'] = $orderNumber;
        $context['item_code'] = $itemCode;
        $context['requested_quantity'] = $requestedQty;
        $context['max_allowed'] = $maxAllowed;

        parent::__construct(
            $message,
            'OVER_PICK',
            400,
            $context
        );
    }
}
