<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;
use Carbon\CarbonInterface;
use DateTimeInterface;

class AlreadyPickedException extends BaseException
{
    public function __construct(
        string $orderNumber,
        string $itemCode,
        int $pickedQuantity,
        CarbonInterface|DateTimeInterface|string $pickedAt,
        array $context = []
    ) {
        // Convert to ISO 8601 string if it's a Carbon/DateTime object
        if ($pickedAt instanceof CarbonInterface || $pickedAt instanceof DateTimeInterface) {
            $pickedAt = $pickedAt->toIso8601String();
        }

        $message = "El item {$itemCode} ya fue pickeado ({$pickedQuantity} unidades)";

        $context['order_number'] = $orderNumber;
        $context['item_code'] = $itemCode;
        $context['picked_quantity'] = $pickedQuantity;
        $context['picked_at'] = $pickedAt;

        parent::__construct(
            $message,
            'ALREADY_PICKED',
            400,
            $context
        );
    }
}
