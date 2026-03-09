<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;
use App\Models\Warehouse;

class WarehouseFlexxusCredentialsMissingException extends BaseException
{
    public function __construct(Warehouse $warehouse, array $context = [])
    {
        $message = "Warehouse {$warehouse->code} does not have complete Flexxus credentials configured";

        $context['warehouse_id'] = $warehouse->id;
        $context['warehouse_code'] = $warehouse->code;

        parent::__construct(
            $message,
            'WAREHOUSE_FLEXXUS_CREDENTIALS_MISSING',
            503,
            $context
        );
    }
}
