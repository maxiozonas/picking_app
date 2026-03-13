<?php

namespace App\Services\Picking;

use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use Illuminate\Support\Facades\Cache;

class FlexxusOrderService implements FlexxusOrderServiceInterface
{
    private FlexxusClientFactoryInterface $factory;

    public function __construct(FlexxusClientFactoryInterface $factory)
    {
        $this->factory = $factory;
    }

    private function warehouseScope(Warehouse $warehouse): string
    {
        return $warehouse->id.'_'.trim($warehouse->code);
    }

    public function getOrdersByDateAndWarehouse(string $date, Warehouse $warehouse): array
    {
        $cacheKey = 'flexxus_orders_'.$date.'_'.$this->warehouseScope($warehouse);

        return Cache::remember($cacheKey, now()->addSeconds(config('picking.orders_cache_ttl', 300)), function () use ($date, $warehouse) {
            $client = $this->factory->createForWarehouse($warehouse);

            $ordersResponse = $client->request('GET', '/v2/orders', [
                'date_from' => $date,
                'date_to' => $date,
                'warehouse' => $warehouse->code,
            ]);

            $allOrders = $ordersResponse['data'] ?? [];

            $warehouseOrders = array_values(array_filter($allOrders, function ($order) use ($warehouse) {
                $depotName = trim((string) ($order['DEPOSITO'] ?? ''));
                $warehouseName = strtoupper(trim($warehouse->name));

                if (strcasecmp($depotName, $warehouseName) === 0) {
                    return true;
                }

                return strcasecmp($depotName, trim($warehouse->code)) === 0;
            }));

            if (empty($warehouseOrders)) {
                return [];
            }

            $endpoints = array_map(
                fn ($order) => '/v2/deliverydata/NP/'.($order['NUMEROCOMPROBANTE'] ?? ''),
                $warehouseOrders
            );

            $deliveryResponses = $client->requestMany($endpoints);

            $expeditionOrders = [];

            foreach ($warehouseOrders as $index => $order) {
                $orderNumber = $order['NUMEROCOMPROBANTE'] ?? null;

                if (! $orderNumber) {
                    continue;
                }

                $deliveryInfo = ($deliveryResponses[$index]['data'][0] ?? []);

                if (($deliveryInfo['CODIGOTIPOENTREGA'] ?? 0) == 1) {
                    $order['delivery_info'] = $deliveryInfo;
                    $order['delivery_type'] = 'EXPEDICION';
                    $expeditionOrders[] = $order;
                }
            }

            return array_values($expeditionOrders);
        });
    }

    public function getOrderDetail(string $orderNumber, Warehouse $warehouse): array
    {
        $cacheKey = 'flexxus_order_detail_'.$orderNumber.'_'.$this->warehouseScope($warehouse);

        return Cache::remember($cacheKey, now()->addSeconds(config('picking.order_detail_cache_ttl', 300)), function () use ($orderNumber, $warehouse) {
            $cleanNumber = str_replace(['NP ', 'NP-', 'NP'], '', $orderNumber);
            $client = $this->factory->createForWarehouse($warehouse);
            $response = $client->request('GET', "/v2/orders/NP/{$cleanNumber}");

            return $response['data'] ?? [];
        });
    }
}
