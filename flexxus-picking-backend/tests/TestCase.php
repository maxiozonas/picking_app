<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Mockery;

abstract class TestCase extends BaseTestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Generate a standard requestContext array for tests
     *
     * @param int|null $warehouseId Warehouse ID (defaults to 1)
     * @param int|null $userId User ID (defaults to 1)
     * @return array Array with warehouse_id and user_id keys
     */
    protected function getRequestContext(int $warehouseId = null, int $userId = null): array
    {
        return [
            'warehouse_id' => $warehouseId ?? 1,
            'user_id' => $userId ?? 1,
        ];
    }
}
