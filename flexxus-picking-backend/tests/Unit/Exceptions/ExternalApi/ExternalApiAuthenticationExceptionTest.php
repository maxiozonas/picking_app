<?php

namespace Tests\Unit\Exceptions\ExternalApi;

use App\Exceptions\ExternalApi\ExternalApiAuthenticationException;
use Tests\TestCase;

class ExternalApiAuthenticationExceptionTest extends TestCase
{
    public function test_extends_external_api_exception(): void
    {
        $reflection = new \ReflectionClass(ExternalApiAuthenticationException::class);

        $this->assertTrue(
            $reflection->isSubclassOf(\App\Exceptions\ExternalApi\ExternalApiException::class),
            'ExternalApiAuthenticationException should extend ExternalApiException'
        );
    }

    public function test_has_http_status_502(): void
    {
        $exception = new ExternalApiAuthenticationException(
            'https://api.flexxus.com/auth',
            401,
            []
        );

        $this->assertEquals(502, $exception->getHttpStatus());
    }

    public function test_has_error_code_flexxus_auth_failed(): void
    {
        $exception = new ExternalApiAuthenticationException(
            'https://api.flexxus.com/auth',
            401,
            []
        );

        $this->assertEquals('FLEXXUS_AUTH_FAILED', $exception->getErrorCode());
    }

    public function test_message_indicates_authentication_failure(): void
    {
        $endpoint = 'https://api.flexxus.com/auth';
        $exception = new ExternalApiAuthenticationException(
            $endpoint,
            401,
            []
        );

        $message = $exception->getMessage();
        $this->assertStringContainsString('authentication', strtolower($message));
        $this->assertStringContainsString('failed', strtolower($message));
    }

    public function test_context_includes_endpoint(): void
    {
        $endpoint = 'https://api.flexxus.com/auth';
        $exception = new ExternalApiAuthenticationException(
            $endpoint,
            401,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('endpoint', $context);
        $this->assertEquals($endpoint, $context['endpoint']);
    }

    public function test_context_includes_flexxus_status_code(): void
    {
        $flexxusStatusCode = 403;
        $exception = new ExternalApiAuthenticationException(
            'https://api.flexxus.com/auth',
            $flexxusStatusCode,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('flexxus_status_code', $context);
        $this->assertEquals($flexxusStatusCode, $context['flexxus_status_code']);
    }

    public function test_stores_flexxus_status_code(): void
    {
        $flexxusStatusCode = 403;
        $exception = new ExternalApiAuthenticationException(
            'https://api.flexxus.com/auth',
            $flexxusStatusCode,
            []
        );

        $this->assertEquals($flexxusStatusCode, $exception->getFlexxusStatusCode());
    }
}
