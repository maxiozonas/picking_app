<?php

namespace Tests\Unit\Exceptions\ExternalApi;

use App\Exceptions\ExternalApi\ExternalApiRequestException;
use Tests\TestCase;

class ExternalApiRequestExceptionTest extends TestCase
{
    public function test_extends_external_api_exception(): void
    {
        $reflection = new \ReflectionClass(ExternalApiRequestException::class);

        $this->assertTrue(
            $reflection->isSubclassOf(\App\Exceptions\ExternalApi\ExternalApiException::class),
            'ExternalApiRequestException should extend ExternalApiException'
        );
    }

    public function test_has_http_status_502(): void
    {
        $exception = new ExternalApiRequestException(
            'https://api.flexxus.com/orders',
            404,
            'Not found',
            []
        );

        $this->assertEquals(502, $exception->getHttpStatus());
    }

    public function test_has_error_code_flexxus_request_failed(): void
    {
        $exception = new ExternalApiRequestException(
            'https://api.flexxus.com/orders',
            404,
            'Not found',
            []
        );

        $this->assertEquals('FLEXXUS_REQUEST_FAILED', $exception->getErrorCode());
    }

    public function test_message_includes_flexxus_status_and_error_message(): void
    {
        $flexxusMessage = 'Order not found in warehouse';
        $flexxusStatusCode = 404;
        $exception = new ExternalApiRequestException(
            'https://api.flexxus.com/orders',
            $flexxusStatusCode,
            $flexxusMessage,
            []
        );

        $message = $exception->getMessage();
        $this->assertStringContainsString((string) $flexxusStatusCode, $message);
        $this->assertStringContainsString($flexxusMessage, $message);
    }

    public function test_context_includes_endpoint(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiRequestException(
            $endpoint,
            404,
            'Not found',
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('endpoint', $context);
        $this->assertEquals($endpoint, $context['endpoint']);
    }

    public function test_context_includes_flexxus_status_code(): void
    {
        $flexxusStatusCode = 400;
        $exception = new ExternalApiRequestException(
            'https://api.flexxus.com/orders',
            $flexxusStatusCode,
            'Bad request',
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('flexxus_status_code', $context);
        $this->assertEquals($flexxusStatusCode, $context['flexxus_status_code']);
    }

    public function test_context_includes_response_body(): void
    {
        $flexxusMessage = 'Validation error: quantity too low';
        $exception = new ExternalApiRequestException(
            'https://api.flexxus.com/orders',
            400,
            $flexxusMessage,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('flexxus_response', $context);
        $this->assertEquals($flexxusMessage, $context['flexxus_response']);
    }

    public function test_stores_flexxus_status_code(): void
    {
        $flexxusStatusCode = 422;
        $exception = new ExternalApiRequestException(
            'https://api.flexxus.com/orders',
            $flexxusStatusCode,
            'Unprocessable entity',
            []
        );

        $this->assertEquals($flexxusStatusCode, $exception->getFlexxusStatusCode());
    }
}
