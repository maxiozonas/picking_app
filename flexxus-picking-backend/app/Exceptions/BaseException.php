<?php

namespace App\Exceptions;

use Exception;

abstract class BaseException extends Exception
{
    protected string $errorCode;

    protected int $httpStatus;

    protected array $context = [];

    public function __construct(
        string $message,
        string $errorCode,
        int $httpStatus,
        array $context = []
    ) {
        // Pass httpStatus as the exception code to parent Exception
        parent::__construct($message, $httpStatus);

        $this->errorCode = $errorCode;
        $this->httpStatus = $httpStatus;
        $this->context = $context;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }

    public function getContext(): array
    {
        return $this->context;
    }

    public function getStructuredData(): array
    {
        return [
            'error_code' => $this->errorCode,
            'http_status' => $this->httpStatus,
            'context' => $this->context,
        ];
    }
}
