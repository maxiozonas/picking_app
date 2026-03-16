<?php

namespace Tests\Unit\Services\Admin;

use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\AdminPickingService;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use PHPUnit\Framework\MockObject\MockObject;
use Tests\TestCase;

class AdminPickingServiceTest extends TestCase
{
    use RefreshDatabase;

    private AdminPickingService $service;

    /** @var FlexxusOrderServiceInterface&MockObject */
    private FlexxusOrderServiceInterface $orderService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->orderService = $this->createMock(FlexxusOrderServiceInterface::class);
        $this->service = new AdminPickingService($this->orderService);
        Cache::flush();
    }

    public function test_get_pending_orders_allows_omitted_warehouse_id(): void
    {
        $warehouseA = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);
        $warehouseB = Warehouse::factory()->create(['code' => '002', 'name' => 'Rondeau']);
        $today = now()->format('Y-m-d');

        $this->orderService->expects($this->exactly(2))
            ->method('getOrdersByDateAndWarehouse')
            ->willReturnCallback(function (string $date, Warehouse $warehouse) use ($warehouseA, $warehouseB, $today) {
                $this->assertSame($today, $date);

                return match ($warehouse->id) {
                    $warehouseA->id => [[
                        'NUMEROCOMPROBANTE' => '623202',
                        'RAZONSOCIAL' => 'Cliente A',
                        'TOTAL' => 1000,
                        'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z',
                        'delivery_type' => 'EXPEDICION',
                    ]],
                    $warehouseB->id => [[
                        'NUMEROCOMPROBANTE' => '623203',
                        'RAZONSOCIAL' => 'Cliente B',
                        'TOTAL' => 2000,
                        'FECHACOMPROBANTE' => '2026-03-09T09:00:00Z',
                        'delivery_type' => 'EXPEDICION',
                    ]],
                    default => [],
                };
            });

        $result = $this->service->getPendingOrders(['status' => 'all']);

        $this->assertCount(2, $result->items());
    }

    public function test_get_pending_orders_preserves_flexxus_creation_date_and_local_lifecycle(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);
        $user = User::factory()->create();

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623202',
            'warehouse_id' => $warehouse->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
            'started_at' => now()->subHour(),
            'completed_at' => null,
        ]);

        $this->orderService->expects($this->once())
            ->method('getOrdersByDateAndWarehouse')
            ->willReturnCallback(function (string $date, Warehouse $resolvedWarehouse, bool $forceRefresh) use ($warehouse) {
                $this->assertSame(now()->format('Y-m-d'), $date);
                $this->assertFalse($forceRefresh);
                $this->assertSame($warehouse->id, $resolvedWarehouse->id);

                return [[
                    'NUMEROCOMPROBANTE' => '623202',
                    'RAZONSOCIAL' => 'Cliente A',
                    'TOTAL' => 1000,
                    'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z',
                    'delivery_type' => 'EXPEDICION',
                ]];
            });

        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'status' => 'all',
        ]);

        $order = $result->items()[0];

        $this->assertSame('EXPEDICION', $order['delivery_type']);
        $this->assertSame('2026-03-09T08:00:00Z', $order['flexxus_created_at']);
        $this->assertSame($progress->started_at?->toIso8601String(), $order['started_at']);
        $this->assertNull($order['completed_at']);
        $this->assertSame($user->id, $order['assigned_to']['id']);
    }

    public function test_refresh_pending_orders_forces_fresh_expedition_lookup(): void
    {
        $warehouse = Warehouse::factory()->create();

        $this->orderService->expects($this->once())
            ->method('getOrdersByDateAndWarehouse')
            ->willReturnCallback(function (string $date, Warehouse $resolvedWarehouse, bool $forceRefresh) use ($warehouse) {
                $this->assertSame(now()->format('Y-m-d'), $date);
                $this->assertTrue($forceRefresh);
                $this->assertSame($warehouse->id, $resolvedWarehouse->id);

                return [];
            });

        $this->service->refreshPendingOrders(['warehouse_id' => $warehouse->id]);
    }

    public function test_get_order_detail_data_merges_local_progress_with_flexxus_metadata(): void
    {
        $warehouse = Warehouse::factory()->create(['code' => '001', 'name' => 'Don Bosco']);
        $user = User::factory()->create();

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623202',
            'warehouse_id' => $warehouse->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
            'customer' => 'Cliente A',
            'started_at' => now()->subHour(),
        ]);
        $progress->load(['user', 'warehouse', 'items', 'alerts', 'events']);

        $this->orderService->expects($this->once())
            ->method('getOrderDetail')
            ->willReturnCallback(function (string $orderNumber, Warehouse $resolvedWarehouse) use ($warehouse) {
                $this->assertSame('NP 623202', $orderNumber);
                $this->assertSame($warehouse->id, $resolvedWarehouse->id);

                return [
                    'RAZONSOCIAL' => 'Cliente A',
                    'FECHACOMPROBANTE' => '2026-03-09T08:00:00Z',
                    'DETALLE' => [],
                ];
            });

        $this->orderService->expects($this->once())
            ->method('getOrderDeliveryMetadata')
            ->willReturnCallback(function (string $orderNumber, Warehouse $resolvedWarehouse) use ($warehouse) {
                $this->assertSame('NP 623202', $orderNumber);
                $this->assertSame($warehouse->id, $resolvedWarehouse->id);

                return ['delivery_type' => 'EXPEDICION'];
            });

        $detail = $this->service->getOrderDetailData('NP 623202', $progress);

        $this->assertSame('EXPEDICION', $detail['delivery_type']);
        $this->assertSame('2026-03-09T08:00:00Z', $detail['flexxus_created_at']);
        $this->assertSame($progress->started_at?->toIso8601String(), $detail['started_at']);
    }
}
