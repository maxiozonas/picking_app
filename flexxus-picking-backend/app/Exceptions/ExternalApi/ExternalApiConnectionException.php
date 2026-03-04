<?php

namespace App\Exceptions\ExternalApi;

class ExternalApiConnectionException extends ExternalApiException
{
    public function __construct(
        string $endpoint,
        ?\Throwable $previous = null,
        array $context = []
    ) {
        $message = "Connection or timeout error while connecting to Flexxus API endpoint: {$endpoint}";

        if ($previous !== null) {
            $context['previous_exception'] = $previous->getMessage();
        }

        // Call parent constructor with all parameters
        parent::__construct(
            $message,
            $endpoint,
            null,
            $context
        );

        // Manually set the previous exception using reflection
        // This is necessary because our custom constructor chain doesn't pass $previous through
        if ($previous !== null) {
            $previousProperty = (new \ReflectionClass(\Exception::class))->getProperty('previous');
            $previousProperty->setAccessible(true);
            $previousProperty->setValue($this, $previous);
        }
    }

    public function getErrorCode(): string
    {
        return 'FLEXXUS_CONNECTION_ERROR';
    }

    public function getHttpStatus(): int
    {
        return 503;
    }
}
