<?php

namespace App\Services\Picking\UseCases;

use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use App\Services\Picking\DTO\AvailableOrdersFilters;
use App\Services\Picking\DTO\PickingRequestContext;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\OrderNumberParser;
use Illuminate\Pagination\LengthAwarePaginator;

final class ListAvailableOrdersUseCase
{
    public function __construct(
        private readonly FlexxusOrderServiceInterface $orderService,
        private readonly WarehouseExecutionContextResolverInterface $warehouseContextResolver
    ) {}

    public function execute(
        int $userId,
        AvailableOrdersFilters $filters,
        PickingRequestContext $requestContext
    ): LengthAwarePaginator {
        $context = $this->warehouseContextResolver->resolveForUserId($userId, $requestContext->toArray());
        $warehouse = Warehouse::findOrFail($context->warehouseId);

        $today = now()->format('Y-m-d');

        $flexxusOrders = $this->orderService->getOrdersByDateAndWarehouse(
            $today,
            $warehouse
        );

        $orderNumbers = array_map(
            fn ($o) => OrderNumberParser::normalize('NP '.($o['NUMEROCOMPROBANTE'] ?? '')),
            $flexxusOrders
        );

        $localProgress = PickingOrderProgress::whereIn('order_number', $orderNumbers)
            ->where('warehouse_id', $context->warehouseId)
            ->with('user')
            ->get()
            ->keyBy('order_number');

        $mergedOrders = collect($flexxusOrders)->map(function ($flexxusOrder) use ($localProgress, $warehouse) {
            $rawOrderNumber = 'NP '.($flexxusOrder['NUMEROCOMPROBANTE'] ?? '');
            $orderNumber = OrderNumberParser::normalize($rawOrderNumber);
            $parsed = OrderNumberParser::parse($rawOrderNumber);
            $progress = $localProgress->get($orderNumber);

            return [
                'order_type' => $parsed['order_type'],
                'order_number' => $parsed['order_number'],
                'customer' => $flexxusOrder['RAZONSOCIAL'] ?? 'Unknown',
                'warehouse' => [
                    'id' => $warehouse->id,
                    'code' => $warehouse->code,
                    'name' => $warehouse->name,
                ],
                'total' => (float) ($flexxusOrder['TOTAL'] ?? 0),
                'created_at' => $flexxusOrder['FECHACOMPROBANTE'] ?? now()->toIso8601String(),
                'delivery_type' => 'EXPEDICION',
                'items_count' => 0,
                'status' => $progress ? $progress->status : 'pending',
                'started_at' => $progress?->started_at?->toIso8601String() ?? '',
                'assigned_to' => $progress && $progress->user
                    ? [
                        'id' => $progress->user->id,
                        'name' => $progress->user->name,
                    ]
                    : [
                        'id' => null,
                        'name' => null,
                    ],
                'items_picked' => $progress
                    ? $progress->items()->where('status', 'completed')->count()
                    : 0,
            ];
        });

        if ($filters->search !== null) {
            $searchNumber = preg_replace('/\D+/', '', $filters->search) ?? '';
            $normalizedSearch = mb_strtolower($filters->search);

            $mergedOrders = $mergedOrders->filter(function (array $order) use ($searchNumber, $normalizedSearch) {
                $customer = mb_strtolower((string) ($order['customer'] ?? ''));
                $orderNumber = (string) ($order['order_number'] ?? '');

                if ($searchNumber !== '' && str_contains($orderNumber, $searchNumber)) {
                    return true;
                }

                return str_contains($customer, $normalizedSearch);
            })->values();
        }

        if ($filters->status !== null) {
            if ($filters->status !== 'all') {
                $mergedOrders = $mergedOrders->filter(fn ($o) => $o['status'] === $filters->status);
            }
        } else {
            $mergedOrders = $mergedOrders->filter(fn ($o) => in_array($o['status'], ['pending', 'in_progress']));
        }

        $total = $mergedOrders->count();
        $pagedOrders = $mergedOrders->forPage($filters->page, $filters->perPage)->values();

        return new LengthAwarePaginator(
            $pagedOrders,
            $total,
            $filters->perPage,
            $filters->page,
            ['path' => request()->path()]
        );
    }
}
