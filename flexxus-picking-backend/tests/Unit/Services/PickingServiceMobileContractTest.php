<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusDataFormatter;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\PickingService;
use App\Services\Picking\WarehouseExecutionContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PickingServiceMobileContractTest extends TestCase
{
    use RefreshDatabase;

    private PickingService $service;

    private $orderService;

    private $productService;

    private $formatter;

    private $warehouseContextResolver;

    private User $user;

    private Warehouse $warehouse;

    private array $requestContext;

    protected function setUp(): void
    {
        parent::setUp();

        $this->orderService = Mockery::mock(FlexxusOrderServiceInterface::class);
        $this->productService = Mockery::mock(FlexxusProductServiceInterface::class);
        $this->formatter = Mockery::mock(FlexxusDataFormatter::class);
        $stockValidationService = Mockery::mock(StockValidationServiceInterface::class);
        $stockCacheService = Mockery::mock(StockCacheServiceInterface::class);
        $this->warehouseContextResolver = Mockery::mock(WarehouseExecutionContextResolverInterface::class);

        $this->service = new PickingService(
            $this->orderService,
            $this->productService,
            $this->formatter,
            $stockValidationService,
            $stockCacheService,
            $this->warehouseContextResolver,
        );

        $this->warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'name' => 'Centro',
        ]);

        $this->user = User::factory()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);

        $this->requestContext = $this->getRequestContext($this->warehouse->id, $this->user->id);

        $context = new WarehouseExecutionContext(
            $this->warehouse->id,
            $this->warehouse->code,
            $this->user->id,
        );

        $this->warehouseContextResolver
            ->shouldReceive('resolveForUserId')
            ->with($this->user->id, Mockery::any())
            ->andReturn($context);
    }

    public function test_available_orders_applies_search_within_warehouse_scope(): void
    {
        $today = now()->format('Y-m-d');

        $this->orderService
            ->shouldReceive('getOrdersByDateAndWarehouse')
            ->once()
            ->with($today, Mockery::type(Warehouse::class))
            ->andReturn([
                [
                    'NUMEROCOMPROBANTE' => '623200',
                    'RAZONSOCIAL' => 'Ferreteria Acme',
                    'TOTAL' => 1000,
                    'FECHACOMPROBANTE' => $today,
                ],
                [
                    'NUMEROCOMPROBANTE' => '623201',
                    'RAZONSOCIAL' => 'Logistica Sur',
                    'TOTAL' => 2000,
                    'FECHACOMPROBANTE' => $today,
                ],
            ]);

        $byCustomer = $this->service->getAvailableOrders($this->user->id, ['search' => 'acme'], $this->requestContext);
        $byOrderNumber = $this->service->getAvailableOrders($this->user->id, ['search' => '3201'], $this->requestContext);

        $this->assertCount(1, $byCustomer->items());
        $this->assertSame('623200', $byCustomer->items()[0]['order_number']);
        $this->assertCount(1, $byOrderNumber->items());
        $this->assertSame('623201', $byOrderNumber->items()[0]['order_number']);
    }

    public function test_available_orders_uses_stable_mobile_pagination_defaults(): void
    {
        $today = now()->format('Y-m-d');

        $orders = [];
        for ($index = 1; $index <= 25; $index++) {
            $orders[] = [
                'NUMEROCOMPROBANTE' => (string) (700000 + $index),
                'RAZONSOCIAL' => 'Cliente '.$index,
                'TOTAL' => 100 * $index,
                'FECHACOMPROBANTE' => $today,
            ];
        }

        $this->orderService
            ->shouldReceive('getOrdersByDateAndWarehouse')
            ->once()
            ->with($today, Mockery::type(Warehouse::class))
            ->andReturn($orders);

        $defaultPage = $this->service->getAvailableOrders($this->user->id, [], $this->requestContext);
        $secondPage = $this->service->getAvailableOrders($this->user->id, [
            'page' => 2,
            'per_page' => 10,
            'status' => 'all',
        ], $this->requestContext);

        $this->assertSame(20, $defaultPage->perPage());
        $this->assertSame(25, $defaultPage->total());
        $this->assertCount(20, $defaultPage->items());
        $this->assertSame(2, $secondPage->currentPage());
        $this->assertCount(10, $secondPage->items());
        $this->assertSame('700011', $secondPage->items()[0]['order_number']);
    }
}
