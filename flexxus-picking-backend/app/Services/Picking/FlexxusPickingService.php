<?php

namespace App\Services\Picking;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Support\Facades\Cache;

class FlexxusPickingService
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

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($date, $warehouse) {
            // Use warehouse-specific client for multi-account support
            $client = $this->factory->createForWarehouse($warehouse);

            $ordersResponse = $client->request('GET', '/v2/orders', [
                'date_from' => $date,
                'date_to' => $date,
                'warehouse' => $warehouse->code,
            ]);

            $allOrders = $ordersResponse['data'] ?? [];

            $warehouseOrders = array_filter($allOrders, function ($order) use ($warehouse) {
                $depotName = trim((string) ($order['DEPOSITO'] ?? ''));
                $warehouseName = strtoupper(trim($warehouse->name));

                // Try exact match first
                if (strcasecmp($depotName, $warehouseName) === 0) {
                    return true;
                }

                // Fallback to code match for backward compatibility
                return strcasecmp($depotName, trim($warehouse->code)) === 0;
            });

            $expeditionOrders = [];

            foreach ($warehouseOrders as $order) {
                $orderNumber = $order['NUMEROCOMPROBANTE'] ?? null;

                if (! $orderNumber) {
                    continue;
                }

                $deliveryData = $client->request('GET', "/v2/deliverydata/NP/{$orderNumber}");
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

    public function getOrderDetail(string $orderNumber, Warehouse $warehouse): array
    {
        $cacheKey = 'flexxus_order_detail_'.$orderNumber.'_'.$this->warehouseScope($warehouse);

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($orderNumber, $warehouse) {
            // Remove any NP prefix variant: "NP ", "NP-", or "NP"
            $cleanNumber = str_replace(['NP ', 'NP-', 'NP'], '', $orderNumber);
            $client = $this->factory->createForWarehouse($warehouse);
            $response = $client->request('GET', "/v2/orders/NP/{$cleanNumber}");

            return $response['data'] ?? [];
        });
    }

    public function getProductStock(string $productCode, Warehouse $warehouse): ?array
    {
        $cacheKey = 'flexxus_stock_'.$productCode.'_'.$this->warehouseScope($warehouse);

        return Cache::remember($cacheKey, now()->addSeconds(45), function () use ($productCode, $warehouse) {
            // Use factory to create warehouse-specific client
            $client = $this->factory->createForWarehouse($warehouse);

            // Use optimized endpoint: /v2/products/{id}?warehouse_list=002
            // This directly returns stock filtered by warehouse
            $productResponse = $this->safeRequest($client, 'GET', "/v2/products/{$productCode}", [
                'warehouse_list' => $warehouse->code,
            ]);

            if (! $productResponse) {
                return null;
            }

            $product = $productResponse['data'][0] ?? null;
            if (! $product) {
                // Try with article ID as fallback
                return $this->getStockByArticleIdFallback($client, $productCode, $warehouse, null);
            }

            // Extract stock from the optimized endpoint response
            // STOCKTOTALDEPOSITO is the stock available in this specific warehouse
            return $this->extractStockFromProductResponse($product, $warehouse);
        });
    }

    /**
     * Extract stock information from product response with warehouse_list filter
     * This is the optimized path using /v2/products/{id}?warehouse_list=002
     */
    private function extractStockFromProductResponse(array $product, Warehouse $warehouse): ?array
    {
        $stockTotalDeposito = (int) ($product['STOCKTOTALDEPOSITO'] ?? 0);
        $stockRealDeposito = (int) ($product['STOCKREALDEPOSITO'] ?? 0);
        $stockPedidoDeposito = (int) ($product['STOCKPEDIDODEPOSITO'] ?? 0);

        return [
            'warehouse' => $warehouse->code,
            'total' => $stockTotalDeposito,  // Stock disponible para venta
            'real' => $stockRealDeposito,      // Stock físico real
            'pending' => $stockPedidoDeposito,  // Stock pendiente de recibir
            'location' => $product['UBICACIONPRODUCTO'] ?? null,
            'is_local' => true, // When using warehouse_list, we're querying specific warehouse
        ];
    }

    /**
     * Fallback: try to get stock by article ID if product code not found
     */
    private function getStockByArticleIdFallback(FlexxusClient $client, string $originalProductCode, Warehouse $warehouse, ?array $previousResponse): ?array
    {
        // If we have a previous response, try to get article ID from it
        if ($previousResponse && isset($previousResponse['data'][0]['ID_ARTICULO'])) {
            $articleId = $previousResponse['data'][0]['ID_ARTICULO'];
            
            // Only try if article ID is different from original code
            if ((string) $articleId !== $originalProductCode) {
                $productResponse = $this->safeRequest($client, 'GET', "/v2/products/{$articleId}", [
                    'warehouse_list' => $warehouse->code,
                ]);
                if ($productResponse && isset($productResponse['data'][0])) {
                    return $this->extractStockFromProductResponse($productResponse['data'][0], $warehouse);
                }
            }
        }
        return null;
    }

    private function getStockFromProductsStockEndpoint(FlexxusClient $client, string $productIdentifier, Warehouse $warehouse): ?array
    {
        $stockResponse = $this->safeRequest($client, 'GET', "/v2/products/{$productIdentifier}/stock");
        if (! $stockResponse) {
            return null;
        }

        $stockRows = $stockResponse['Product_Stock']
            ?? $stockResponse['data']
            ?? [];

        return $this->findStockForWarehouse($stockRows, $warehouse);
    }

    private function safeRequest(FlexxusClient $client, string $method, string $endpoint, array $queryParams = []): ?array
    {
        try {
            return $client->request($method, $endpoint, $queryParams);
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function extractStockArrayFromProductResponse(array $productResponse): array
    {
        if (isset($productResponse['STOCKTOTALDEPOSITO']) && is_array($productResponse['STOCKTOTALDEPOSITO'])) {
            return $productResponse['STOCKTOTALDEPOSITO'];
        }

        $firstProduct = $productResponse['data'][0] ?? null;

        if (is_array($firstProduct) && isset($firstProduct['STOCKTOTALDEPOSITO']) && is_array($firstProduct['STOCKTOTALDEPOSITO'])) {
            return $firstProduct['STOCKTOTALDEPOSITO'];
        }

        return [];
    }

    private function findStockForWarehouse(array $stockArray, Warehouse $warehouse): ?array
    {
        foreach ($stockArray as $stock) {
            if (! is_array($stock)) {
                continue;
            }

            $stockWarehouse = trim((string) ($stock['DEPOSITO'] ?? ''));
            if ($stockWarehouse === '' || strcasecmp($stockWarehouse, trim($warehouse->code)) !== 0) {
                continue;
            }

            $location = $stock['UBICACION']
                ?? $stock['UBICACIONDEPOSITO']
                ?? $stock['UBICACIONPRODUCTO']
                ?? null;

            return [
                'warehouse' => $stockWarehouse,
                'lot' => $stock['LOTE'] ?? null,
                'total' => (int) ($stock['STOCKTOTAL'] ?? 0),
                'is_local' => ($stock['ESDEPOSITOLOCAL'] ?? 0) == 1,
                'location' => $location,
            ];
        }

        return null;
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
        $fallbackLocation = isset($stockInfo['warehouse'])
            ? 'Deposito '.$stockInfo['warehouse']
            : null;

        return [
            'product_code' => $item['CODIGOPARTICULAR'] ?? '',
            'description' => $item['DESCRIPCION'] ?? '',
            'quantity_required' => $quantity,
            'lot' => $item['LOTE'] ?? 'SINLOTE',
            'location' => $stockInfo['location'] ?? $fallbackLocation,
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
