<?php

namespace App\Exceptions\ExternalApi;

class ExternalApiRequestException extends ExternalApiException
{
    protected ?string $flexxusMessage = null;

    public function __construct(
        string $endpoint,
        int $flexxusStatusCode,
        string $flexxusMessage,
        array $context = []
    ) {
        $this->flexxusMessage = $flexxusMessage;

        $message = "Flexxus API request failed ({$flexxusStatusCode}): {$flexxusMessage}";

        $context['flexxus_response'] = $flexxusMessage;

        parent::__construct(
            $message,
            $endpoint,
            $flexxusStatusCode,
            $context
        );
    }

    public function getErrorCode(): string
    {
        return 'FLEXXUS_REQUEST_FAILED';
    }
}
