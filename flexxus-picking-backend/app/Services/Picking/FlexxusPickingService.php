<?php

namespace App\Services\Picking;

use App\Http\Clients\Flexxus\FlexxusClient;
use Illuminate\Support\Facades\Cache;

class FlexxusPickingService
{
    private FlexxusClient $flexxus;

    public function __construct(FlexxusClient $flexxus)
    {
        $this->flexxus = $flexxus;
    }

    public function getOrdersByDateAndWarehouse(string $date, string $warehouseCode): array
    {
        $cacheKey = "flexxus_orders_{$date}_{$warehouseCode}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($date, $warehouseCode) {
            $ordersResponse = $this->flexxus->request('GET', '/v2/orders', [
                'date_from' => $date,
                'date_to' => $date,
            ]);

            $allOrders = $ordersResponse['data'] ?? [];

            $warehouseOrders = array_filter($allOrders, function ($order) use ($warehouseCode) {
                return ($order['DEPOSITO'] ?? '') === $warehouseCode;
            });

            $expeditionOrders = [];

            foreach ($warehouseOrders as $order) {
                $orderNumber = $order['NUMEROCOMPROBANTE'] ?? null;

                if (! $orderNumber) {
                    continue;
                }

                $deliveryData = $this->flexxus->request('GET', "/v2/deliverydata/NP/{$orderNumber}");
                $deliveryInfo = $deliveryData['data'][0] ?? [];

                if (($deliveryInfo['CODIGOTIPOENTREGA'] ?? 0) == 1) {
                    $order['delivery_info'] = $deliveryInfo;
                    $order['delivery_type'] = 'EXPEDICION';
                    $expeditionOrders[] = $order;
                }
            }

            return array_values($expeditionOrders);
        });
    }

    public function getOrderDetail(string $orderNumber): array
    {
        $cacheKey = "flexxus_order_detail_{$orderNumber}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($orderNumber) {
            $cleanNumber = str_replace('NP ', '', $orderNumber);
            $response = $this->flexxus->request('GET', "/v2/orders/NP/{$cleanNumber}");

            return $response['data'] ?? [];
        });
    }

    public function getProductStock(string $productCode, string $warehouseCode): ?array
    {
        $cacheKey = "flexxus_stock_{$productCode}_{$warehouseCode}";

        return Cache::remember($cacheKey, now()->addSeconds(45), function () use ($productCode, $warehouseCode) {
            $response = $this->flexxus->request('GET', "/v2/products/{$productCode}/stock");
            $stockArray = $response['Product_Stock'] ?? [];

            foreach ($stockArray as $stock) {
                if (($stock['DEPOSITO'] ?? '') === $warehouseCode) {
                    return [
                        'warehouse' => $stock['DEPOSITO'],
                        'lot' => $stock['LOTE'] ?? null,
                        'total' => (int) ($stock['STOCKTOTAL'] ?? 0),
                        'is_local' => ($stock['ESDEPOSITOLOCAL'] ?? 0) == 1,
                    ];
                }
            }

            return null;
        });
    }

    public function formatOrderForList(array $flexxusOrder): array
    {
        return [
            'order_number' => 'NP '.($flexxusOrder['NUMEROCOMPROBANTE'] ?? ''),
            'customer' => $flexxusOrder['RAZONSOCIAL'] ?? 'Unknown',
            'total' => (float) ($flexxusOrder['TOTAL'] ?? 0),
            'created_at' => $flexxusOrder['FECHACOMPROBANTE'] ?? now()->toIso8601String(),
            'delivery_type' => $flexxusOrder['delivery_type'] ?? 'UNKNOWN',
            'raw_data' => $flexxusOrder,
        ];
    }

    public function formatOrderItem(array $item, ?array $stockInfo): array
    {
        $quantity = (int) ($item['PENDIENTE'] ?? $item['CANTIDAD'] ?? 0);

        return [
            'product_code' => $item['CODIGOPARTICULAR'] ?? '',
            'description' => $item['DESCRIPCION'] ?? '',
            'quantity_required' => $quantity,
            'lot' => $item['LOTE'] ?? 'SINLOTE',
            'stock_info' => $stockInfo ? [
                'available' => $stockInfo['total'],
                'is_local' => $stockInfo['is_local'],
                'is_sufficient' => $stockInfo['total'] >= $quantity,
                'shortage' => max(0, $quantity - $stockInfo['total']),
            ] : null,
            'raw_data' => $item,
        ];
    }
}
