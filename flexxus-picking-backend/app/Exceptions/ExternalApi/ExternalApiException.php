<?php

namespace App\Exceptions\ExternalApi;

use App\Exceptions\BaseException;

abstract class ExternalApiException extends BaseException
{
    protected ?string $endpoint = null;

    protected ?int $flexxusStatusCode = null;

    public function __construct(
        string $message,
        ?string $endpoint = null,
        ?int $flexxusStatusCode = null,
        array $context = []
    ) {
        $this->endpoint = $endpoint;
        $this->flexxusStatusCode = $flexxusStatusCode;

        if ($endpoint !== null) {
            $context['endpoint'] = $endpoint;
        }

        if ($flexxusStatusCode !== null) {
            $context['flexxus_status_code'] = $flexxusStatusCode;
        }

        parent::__construct(
            $message,
            'FLEXXUS_API_ERROR',
            502,
            $context
        );
    }

    public function getEndpoint(): ?string
    {
        return $this->endpoint;
    }

    public function getFlexxusStatusCode(): ?int
    {
        return $this->flexxusStatusCode;
    }

    public function getStructuredData(): array
    {
        $data = parent::getStructuredData();

        $data['endpoint'] = $this->endpoint;
        $data['flexxus_status_code'] = $this->flexxusStatusCode;

        return $data;
    }
}
