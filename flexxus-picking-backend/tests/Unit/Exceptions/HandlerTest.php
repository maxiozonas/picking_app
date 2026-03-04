<?php

namespace Tests\Unit\Exceptions;

use App\Exceptions\BaseException;
use App\Exceptions\ExternalApi\ExternalApiAuthenticationException;
use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use App\Exceptions\ExternalApi\ExternalApiRequestException;
use App\Exceptions\ExternalApi\ExternalApiServerErrorException;
use App\Exceptions\Picking\InsufficientStockException;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\UnauthorizedOperationException;
use App\Exceptions\Picking\WarehouseMismatchException;
use Tests\TestCase;

class HandlerTest extends TestCase
{
    public function test_all_custom_exceptions_have_correct_http_status_codes(): void
    {
        $exceptions = [
            new OrderNotFoundException('NP-999'),
            new InvalidOrderStateException('NP-123', 'completed', 'start'),
            new WarehouseMismatchException('NP-123', 1, 2),
            new InsufficientStockException('NP-123', 'ITEM-001', 10, 5),
            new UnauthorizedOperationException('modify', 'forbidden'),
            new ExternalApiConnectionException('https://api.flexxus.com/test'),
            new ExternalApiAuthenticationException('https://api.flexxus.com/auth', 401),
            new ExternalApiRequestException('https://api.flexxus.com/orders', 404, 'Not found'),
            new ExternalApiServerErrorException('https://api.flexxus.com/orders', 500),
        ];

        $expectedStatuses = [
            404, // OrderNotFoundException
            400, // InvalidOrderStateException
            403, // WarehouseMismatchException
            400, // InsufficientStockException
            403, // UnauthorizedOperationException
            503, // ExternalApiConnectionException
            502, // ExternalApiAuthenticationException
            502, // ExternalApiRequestException
            502, // ExternalApiServerErrorException
        ];

        foreach ($exceptions as $index => $exception) {
            $this->assertEquals(
                $expectedStatuses[$index],
                $exception->getHttpStatus(),
                get_class($exception).' should have HTTP status '.$expectedStatuses[$index]
            );
        }
    }

    public function test_all_custom_exceptions_have_error_codes(): void
    {
        $testCases = [
            ['exception' => new OrderNotFoundException('NP-999'), 'code' => 'ORDER_NOT_FOUND'],
            ['exception' => new InvalidOrderStateException('NP-123', 'completed', 'start'), 'code' => 'INVALID_ORDER_STATE'],
            ['exception' => new WarehouseMismatchException('NP-123', 1, 2), 'code' => 'WAREHOUSE_MISMATCH'],
            ['exception' => new InsufficientStockException('NP-123', 'ITEM-001', 10, 5), 'code' => 'INSUFFICIENT_STOCK'],
            ['exception' => new UnauthorizedOperationException('modify', 'forbidden'), 'code' => 'FORBIDDEN'],
            ['exception' => new ExternalApiConnectionException('https://api.flexxus.com/test'), 'code' => 'FLEXXUS_CONNECTION_ERROR'],
            ['exception' => new ExternalApiAuthenticationException('https://api.flexxus.com/auth', 401), 'code' => 'FLEXXUS_AUTH_FAILED'],
            ['exception' => new ExternalApiRequestException('https://api.flexxus.com/orders', 404, 'Not found'), 'code' => 'FLEXXUS_REQUEST_FAILED'],
            ['exception' => new ExternalApiServerErrorException('https://api.flexxus.com/orders', 500), 'code' => 'FLEXXUS_SERVER_ERROR'],
        ];

        foreach ($testCases as $testCase) {
            $this->assertEquals(
                $testCase['code'],
                $testCase['exception']->getErrorCode(),
                get_class($testCase['exception']).' should have error code '.$testCase['code']
            );
        }
    }

    public function test_all_custom_exceptions_extend_base_exception(): void
    {
        $exceptions = [
            OrderNotFoundException::class,
            InvalidOrderStateException::class,
            WarehouseMismatchException::class,
            InsufficientStockException::class,
            UnauthorizedOperationException::class,
            ExternalApiConnectionException::class,
            ExternalApiAuthenticationException::class,
            ExternalApiRequestException::class,
            ExternalApiServerErrorException::class,
        ];

        foreach ($exceptions as $exceptionClass) {
            $this->assertTrue(
                is_subclass_of($exceptionClass, BaseException::class),
                "{$exceptionClass} should extend BaseException"
            );
        }
    }

    public function test_all_custom_exceptions_have_structured_data(): void
    {
        $exceptions = [
            new OrderNotFoundException('NP-999'),
            new ExternalApiConnectionException('https://api.flexxus.com/test'),
            new ExternalApiRequestException('https://api.flexxus.com/orders', 404, 'Not found'),
        ];

        foreach ($exceptions as $exception) {
            $structured = $exception->getStructuredData();

            $this->assertIsArray($structured);
            $this->assertArrayHasKey('error_code', $structured);
            $this->assertArrayHasKey('http_status', $structured);
            $this->assertArrayHasKey('context', $structured);
        }
    }

    public function test_external_api_exceptions_include_endpoint_and_status(): void
    {
        $endpoint = 'https://api.flexxus.com/test';
        $statusCode = 500;

        $exception = new ExternalApiServerErrorException($endpoint, $statusCode);
        $structured = $exception->getStructuredData();

        $this->assertEquals($endpoint, $structured['endpoint']);
        $this->assertEquals($statusCode, $structured['flexxus_status_code']);
    }
}
