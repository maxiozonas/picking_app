<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class UnauthorizedOperationException extends BaseException
{
    public function __construct(string $operation, string $reason, array $context = [])
    {
        $message = "Operation '{$operation}' forbidden: {$reason}";

        $context['operation'] = $operation;
        $context['reason'] = $reason;

        parent::__construct(
            $message,
            'FORBIDDEN',
            403,
            $context
        );
    }
}
