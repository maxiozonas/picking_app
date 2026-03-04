<?php

namespace Tests\Unit\Exceptions;

use App\Exceptions\BaseException;
use Tests\TestCase;

class BaseExceptionTest extends TestCase
{
    public function test_base_exception_is_abstract(): void
    {
        $reflection = new \ReflectionClass(BaseException::class);

        $this->assertTrue($reflection->isAbstract(), 'BaseException should be abstract');
        $this->assertTrue($reflection->isSubclassOf(\Exception::class), 'BaseException should extend \Exception');
    }

    public function test_constructor_initializes_properties(): void
    {
        $message = 'Test error message';
        $errorCode = 'TEST_ERROR';
        $httpStatus = 400;
        $context = ['key' => 'value'];

        $exception = $this->createConcreteException($message, $errorCode, $httpStatus, $context);

        $this->assertEquals($message, $exception->getMessage());
        $this->assertEquals($errorCode, $exception->getErrorCode());
        $this->assertEquals($httpStatus, $exception->getHttpStatus());
        $this->assertEquals($context, $exception->getContext());
    }

    public function test_get_error_code_returns_string(): void
    {
        $exception = $this->createConcreteException('msg', 'ERROR_CODE', 404);

        $this->assertIsString($exception->getErrorCode());
        $this->assertEquals('ERROR_CODE', $exception->getErrorCode());
    }

    public function test_get_http_status_returns_int(): void
    {
        $exception = $this->createConcreteException('msg', 'ERROR', 500);

        $this->assertIsInt($exception->getHttpStatus());
        $this->assertEquals(500, $exception->getHttpStatus());
    }

    public function test_get_context_returns_array(): void
    {
        $context = ['user_id' => 1, 'order_number' => 'NP-123'];
        $exception = $this->createConcreteException('msg', 'ERROR', 400, $context);

        $this->assertIsArray($exception->getContext());
        $this->assertEquals($context, $exception->getContext());
    }

    public function test_get_structured_data_returns_correct_structure(): void
    {
        $errorCode = 'ORDER_NOT_FOUND';
        $httpStatus = 404;
        $context = ['order_number' => 'NP-999'];

        $exception = $this->createConcreteException('msg', $errorCode, $httpStatus, $context);
        $structured = $exception->getStructuredData();

        $this->assertIsArray($structured);
        $this->assertArrayHasKey('error_code', $structured);
        $this->assertArrayHasKey('http_status', $structured);
        $this->assertArrayHasKey('context', $structured);

        $this->assertEquals($errorCode, $structured['error_code']);
        $this->assertEquals($httpStatus, $structured['http_status']);
        $this->assertEquals($context, $structured['context']);
    }

    public function test_context_defaults_to_empty_array(): void
    {
        $exception = $this->createConcreteException('msg', 'ERROR', 400);

        $this->assertIsArray($exception->getContext());
        $this->assertEmpty($exception->getContext());
    }

    public function test_context_preserves_complex_data(): void
    {
        $context = [
            'user_id' => 12,
            'warehouse_id' => 5,
            'items' => ['item1', 'item2'],
            'timestamp' => now()->toIso8601String(),
        ];

        $exception = $this->createConcreteException('msg', 'ERROR', 400, $context);

        $this->assertEquals($context, $exception->getContext());
        $this->assertEquals($context, $exception->getStructuredData()['context']);
    }

    /**
     * Create a concrete implementation of BaseException for testing
     */
    private function createConcreteException(
        string $message,
        string $errorCode,
        int $httpStatus,
        array $context = []
    ): \Exception {
        return new class($message, $errorCode, $httpStatus, $context) extends BaseException
        {
            // Concrete implementation for testing abstract class
        };
    }
}
