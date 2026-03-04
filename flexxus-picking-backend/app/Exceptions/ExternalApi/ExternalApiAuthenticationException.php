<?php

namespace App\Exceptions\ExternalApi;

class ExternalApiAuthenticationException extends ExternalApiException
{
    public function __construct(
        string $endpoint,
        int $flexxusStatusCode,
        array $context = []
    ) {
        $message = "Authentication failed with Flexxus API endpoint: {$endpoint}";

        parent::__construct(
            $message,
            $endpoint,
            $flexxusStatusCode,
            $context
        );
    }

    public function getErrorCode(): string
    {
        return 'FLEXXUS_AUTH_FAILED';
    }
}
