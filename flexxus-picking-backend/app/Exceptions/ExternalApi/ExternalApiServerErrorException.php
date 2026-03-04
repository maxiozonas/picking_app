<?php

namespace App\Exceptions\ExternalApi;

class ExternalApiServerErrorException extends ExternalApiException
{
    public function __construct(
        string $endpoint,
        int $flexxusStatusCode,
        array $context = []
    ) {
        $message = "Flexxus API server error ({$flexxusStatusCode}) at endpoint: {$endpoint}";

        parent::__construct(
            $message,
            $endpoint,
            $flexxusStatusCode,
            $context
        );
    }

    public function getErrorCode(): string
    {
        return 'FLEXXUS_SERVER_ERROR';
    }
}
