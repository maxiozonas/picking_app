<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

/**
 * @deprecated Use OverPickException for over-pick validation or PhysicalStockInsufficientException for Flexxus stock validation.
 *             This exception is kept for backward compatibility and will be removed in a future version.
 */
class InsufficientStockException extends BaseException
{
    public function __construct(string $orderNumber, string $itemCode, int $requestedQty, int $availableQty, array $context = [])
    {
        $message = "Insufficient stock for item {$itemCode}: requested {$requestedQty}, available {$availableQty}";

        $context['order_number'] = $orderNumber;
        $context['item_code'] = $itemCode;
        $context['requested_qty'] = $requestedQty;
        $context['available_qty'] = $availableQty;

        parent::__construct(
            $message,
            'INSUFFICIENT_STOCK',
            400,
            $context
        );
    }
}
