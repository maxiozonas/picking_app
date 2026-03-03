<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlexxusPickingServiceTest extends TestCase
{
    use RefreshDatabase;

    private FlexxusPickingService $service;

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(FlexxusPickingService::class);
        $this->warehouse = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $this->user = User::factory()->for($this->warehouse)->create();
    }

    public function test_get_orders_from_flexxus_filters_by_date(): void
    {
        $this->markTestIncomplete('Need to mock FlexxusClient');
    }

    public function test_get_orders_filters_by_warehouse_code(): void
    {
        $this->markTestIncomplete('Need to mock FlexxusClient');
    }

    public function test_get_orders_filters_by_expedicion_type(): void
    {
        $this->markTestIncomplete('Need to mock FlexxusClient');
    }

    public function test_get_order_detail_includes_stock_info(): void
    {
        $this->markTestIncomplete('Need to mock FlexxusClient');
    }
}
