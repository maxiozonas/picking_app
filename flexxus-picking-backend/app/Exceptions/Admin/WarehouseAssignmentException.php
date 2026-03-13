<?php

namespace App\Exceptions\Admin;

use App\Exceptions\BaseException;

class WarehouseAssignmentException extends BaseException
{
    public function __construct(string $message, array $context = [])
    {
        parent::__construct(
            $message,
            'WAREHOUSE_ASSIGNMENT_ERROR',
            422,
            $context
        );
    }
}
