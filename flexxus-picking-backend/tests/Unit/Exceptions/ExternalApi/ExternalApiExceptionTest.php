<?php

namespace Tests\Unit\Exceptions\ExternalApi;

use App\Exceptions\ExternalApi\ExternalApiException;
use Tests\TestCase;

class ExternalApiExceptionTest extends TestCase
{
    public function test_external_api_exception_is_abstract(): void
    {
        $reflection = new \ReflectionClass(ExternalApiException::class);

        $this->assertTrue(
            $reflection->isAbstract(),
            'ExternalApiException should be abstract'
        );
    }

    public function test_external_api_exception_extends_base_exception(): void
    {
        $reflection = new \ReflectionClass(ExternalApiException::class);

        $this->assertTrue(
            $reflection->isSubclassOf(\App\Exceptions\BaseException::class),
            'ExternalApiException should extend BaseException'
        );
    }

    public function test_concrete_external_api_exception_has_default_http_status_502(): void
    {
        $exception = $this->createConcreteException(
            'Test error',
            'https://api.flexxus.com/test',
            null,
            []
        );

        $this->assertEquals(502, $exception->getHttpStatus());
    }

    public function test_concrete_exception_stores_endpoint(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = $this->createConcreteException(
            'Test error',
            $endpoint,
            null,
            []
        );

        $this->assertEquals($endpoint, $exception->getEndpoint());
    }

    public function test_concrete_exception_stores_flexxus_status_code(): void
    {
        $flexxusStatusCode = 500;
        $exception = $this->createConcreteException(
            'Test error',
            'https://api.flexxus.com/test',
            $flexxusStatusCode,
            []
        );

        $this->assertEquals($flexxusStatusCode, $exception->getFlexxusStatusCode());
    }

    public function test_concrete_exception_includes_flexxus_details_in_structured_data(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $flexxusStatusCode = 500;
        $exception = $this->createConcreteException(
            'Test error',
            $endpoint,
            $flexxusStatusCode,
            ['custom' => 'context']
        );

        $structured = $exception->getStructuredData();

        $this->assertArrayHasKey('endpoint', $structured);
        $this->assertArrayHasKey('flexxus_status_code', $structured);
        $this->assertEquals($endpoint, $structured['endpoint']);
        $this->assertEquals($flexxusStatusCode, $structured['flexxus_status_code']);
    }

    public function test_concrete_exception_includes_endpoint_in_context(): void
    {
        $endpoint = 'https://api.flexxus.com/orders';
        $exception = $this->createConcreteException(
            'Test error',
            $endpoint,
            500,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('endpoint', $context);
        $this->assertEquals($endpoint, $context['endpoint']);
    }

    public function test_concrete_exception_includes_flexxus_status_in_context(): void
    {
        $flexxusStatusCode = 403;
        $exception = $this->createConcreteException(
            'Test error',
            'https://api.flexxus.com/test',
            $flexxusStatusCode,
            []
        );

        $context = $exception->getContext();
        $this->assertArrayHasKey('flexxus_status_code', $context);
        $this->assertEquals($flexxusStatusCode, $context['flexxus_status_code']);
    }

    /**
     * Create a concrete implementation of ExternalApiException for testing
     */
    private function createConcreteException(
        string $message,
        ?string $endpoint,
        ?int $flexxusStatusCode,
        array $context = []
    ): \Exception {
        return new class($message, $endpoint, $flexxusStatusCode, $context) extends ExternalApiException
        {
            // Concrete implementation for testing abstract class
        };
    }
}
