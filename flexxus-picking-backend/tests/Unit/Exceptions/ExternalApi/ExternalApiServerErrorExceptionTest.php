<?php

namespace Tests\Unit\Exceptions\ExternalApi;

use App\Exceptions\ExternalApi\ExternalApiServerErrorException;
use Tests\TestCase;

class ExternalApiServerErrorExceptionTest extends TestCase
{
    public function test_extends_external_api_exception(): void
    {
        $reflection = new \ReflectionClass(ExternalApiServerErrorException::class);

        $this->assertTrue(
            $reflection->isSubclassOf(\App\Exceptions\ExternalApi\ExternalApiException::class),
            'ExternalApiServerErrorException should extend ExternalApiException'
        );
    }

    public function test_has_http_status_502(): void
    {
        $exception = new ExternalApiServerErrorException(
            'https://api.flexxus.com/orders',
            500,
            []
        );

        $this->assertEquals(502, $exception->getHttpStatus());
    }

    public function test_has_error_code_flexxus_server_error(): void
    {
        $exception = new ExternalApiServerErrorException(
            'https://api.flexxus.com/orders',
            500,
            []
        );

        $this->assertEquals('FLEXXUS_SERVER_ERROR', $exception->getErrorCode());
    }

    public function test_message_indicates_server_error(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiServerErrorException(
            $endpoint,
            500,
            []
        );

        $message = $exception->getMessage();
        $this->assertStringContainsString('server', strtolower($message));
        $this->assertStringContainsString('error', strtolower($message));
    }

    public function test_message_includes_status_code(): void
    {
        $statusCode = 502;
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiServerErrorException(
            $endpoint,
            $statusCode,
            []
        );

        $message = $exception->getMessage();
        $this->assertStringContainsString((string) $statusCode, $message);
    }

    public function test_context_includes_endpoint(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiServerErrorException(
            $endpoint,
            500,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('endpoint', $context);
        $this->assertEquals($endpoint, $context['endpoint']);
    }

    public function test_context_includes_flexxus_status_code(): void
    {
        $flexxusStatusCode = 503;
        $exception = new ExternalApiServerErrorException(
            'https://api.flexxus.com/orders',
            $flexxusStatusCode,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('flexxus_status_code', $context);
        $this->assertEquals($flexxusStatusCode, $context['flexxus_status_code']);
    }

    public function test_stores_flexxus_status_code(): void
    {
        $flexxusStatusCode = 500;
        $exception = new ExternalApiServerErrorException(
            'https://api.flexxus.com/orders',
            $flexxusStatusCode,
            []
        );

        $this->assertEquals($flexxusStatusCode, $exception->getFlexxusStatusCode());
    }
}
