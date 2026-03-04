<?php

namespace Tests\Unit\Exceptions\ExternalApi;

use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use Tests\TestCase;

class ExternalApiConnectionExceptionTest extends TestCase
{
    public function test_extends_external_api_exception(): void
    {
        $reflection = new \ReflectionClass(ExternalApiConnectionException::class);

        $this->assertTrue(
            $reflection->isSubclassOf(\App\Exceptions\ExternalApi\ExternalApiException::class),
            'ExternalApiConnectionException should extend ExternalApiException'
        );
    }

    public function test_has_http_status_503(): void
    {
        $exception = new ExternalApiConnectionException(
            'https://api.flexxus.com/test',
            null,
            []
        );

        $this->assertEquals(503, $exception->getHttpStatus());
    }

    public function test_has_error_code_flexxus_connection_error(): void
    {
        $exception = new ExternalApiConnectionException(
            'https://api.flexxus.com/test',
            null,
            []
        );

        $this->assertEquals('FLEXXUS_CONNECTION_ERROR', $exception->getErrorCode());
    }

    public function test_message_mentions_connection_issue(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiConnectionException(
            $endpoint,
            null,
            []
        );

        $message = $exception->getMessage();
        $this->assertStringContainsString('connection', strtolower($message));
        $this->assertStringContainsString('timeout', strtolower($message));
    }

    public function test_context_includes_endpoint(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiConnectionException(
            $endpoint,
            null,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('endpoint', $context);
        $this->assertEquals($endpoint, $context['endpoint']);
    }

    public function test_accepts_previous_exception(): void
    {
        $previous = new \Exception('Network error');
        $exception = new ExternalApiConnectionException(
            'https://api.flexxus.com/test',
            $previous,
            []
        );

        $this->assertSame($previous, $exception->getPrevious());
    }

    public function test_context_includes_custom_data(): void
    {
        $customContext = ['timeout_ms' => 5000, 'attempt' => 3];
        $exception = new ExternalApiConnectionException(
            'https://api.flexxus.com/test',
            null,
            $customContext
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('timeout_ms', $context);
        $this->assertArrayHasKey('attempt', $context);
        $this->assertEquals(5000, $context['timeout_ms']);
        $this->assertEquals(3, $context['attempt']);
    }

    public function test_message_includes_endpoint(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = new ExternalApiConnectionException(
            $endpoint,
            null,
            []
        );

        $message = $exception->getMessage();
        $this->assertStringContainsString($endpoint, $message);
    }
}
