<?php

namespace App\Services\Picking;

use App\Http\Clients\Flexxus\CircuitBreaker\FlexxusCircuitBreaker;
use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FlexxusProductService implements FlexxusProductServiceInterface
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

    public function getProductStock(string $productCode, Warehouse $warehouse): ?array
    {
        $scope = $this->warehouseScope($warehouse);
        $breaker = new FlexxusCircuitBreaker('stock_'.$scope);

        if ($breaker->isOpen()) {
            return Cache::get('flexxus_stock_'.$productCode.'_'.$scope);
        }

        $cacheKey = 'flexxus_stock_'.$productCode.'_'.$scope;

        return Cache::remember($cacheKey, now()->addSeconds(config('picking.stock_cache_ttl', 45)), function () use ($productCode, $warehouse, $breaker) {
            $client = $this->factory->createForWarehouse($warehouse);

            $productResponse = $this->safeRequest($client, 'GET', "/v2/products/{$productCode}", [
                'warehouse_list' => $warehouse->code,
            ]);

            if (! $productResponse) {
                $breaker->recordFailure();

                return null;
            }

            $breaker->recordSuccess();

            $product = $productResponse['data'][0] ?? null;
            if (! $product) {
                return $this->getStockByArticleIdFallback($client, $productCode, $warehouse, null);
            }

            return $this->extractStockFromProductResponse($product, $warehouse);
        });
    }

    public function getProductStockBatch(array $productCodes, Warehouse $warehouse): array
    {
        if (empty($productCodes)) {
            return [];
        }

        $scope = $this->warehouseScope($warehouse);
        $ttl = config('picking.stock_cache_ttl', 45);

        // Separate cached vs uncached
        $results = [];
        $uncached = [];

        foreach ($productCodes as $code) {
            $cacheKey = 'flexxus_stock_'.$code.'_'.$scope;
            $cached = Cache::get($cacheKey);

            if ($cached !== null) {
                $results[$code] = $cached;
            } else {
                $uncached[] = $code;
            }
        }

        if (empty($uncached)) {
            return $results;
        }

        // Fetch uncached items in parallel via Http::pool()
        $client = $this->factory->createForWarehouse($warehouse);
        $token = $client->getToken();
        $baseUrl = $client->getBaseUrl();

        $endpoints = array_map(
            fn (string $code) => "/v2/products/{$code}?warehouse_list={$warehouse->code}",
            $uncached
        );

        $responses = Http::pool(function (\Illuminate\Http\Client\Pool $pool) use ($endpoints, $token, $baseUrl) {
            return array_map(
                fn (string $endpoint) => $pool
                    ->withToken($token)
                    ->timeout(config('picking.flexxus_timeout', 15))
                    ->get("{$baseUrl}{$endpoint}"),
                $endpoints
            );
        });

        foreach ($uncached as $index => $code) {
            $response = $responses[$index] ?? null;
            $stockInfo = null;

            if ($response && ! ($response instanceof \Throwable) && $response->successful()) {
                $json = $response->json() ?? [];
                $product = $json['data'][0] ?? null;
                if ($product) {
                    $stockInfo = $this->extractStockFromProductResponse($product, $warehouse);
                }
            }

            $cacheKey = 'flexxus_stock_'.$code.'_'.$scope;
            Cache::put($cacheKey, $stockInfo, now()->addSeconds($ttl));
            $results[$code] = $stockInfo;
        }

        return $results;
    }

    /**
     * Extract stock information from product response with warehouse_list filter.
     */
    private function extractStockFromProductResponse(array $product, Warehouse $warehouse): ?array
    {
        $stockTotalDeposito = (int) ($product['STOCKTOTALDEPOSITO'] ?? 0);
        $stockRealDeposito = (int) ($product['STOCKREALDEPOSITO'] ?? 0);
        $stockPedidoDeposito = (int) ($product['STOCKPEDIDODEPOSITO'] ?? 0);

        return [
            'warehouse' => $warehouse->code,
            'total' => $stockTotalDeposito,
            'real' => $stockRealDeposito,
            'pending' => $stockPedidoDeposito,
            'location' => $product['UBICACIONPRODUCTO'] ?? null,
            'is_local' => true,
        ];
    }

    /**
     * Fallback: try to get stock by article ID if product code not found.
     */
    private function getStockByArticleIdFallback(FlexxusClient $client, string $originalProductCode, Warehouse $warehouse, ?array $previousResponse): ?array
    {
        if ($previousResponse && isset($previousResponse['data'][0]['ID_ARTICULO'])) {
            $articleId = $previousResponse['data'][0]['ID_ARTICULO'];

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

    private function safeRequest(FlexxusClient $client, string $method, string $endpoint, array $queryParams = []): ?array
    {
        try {
            return $client->request($method, $endpoint, $queryParams);
        } catch (\Throwable $e) {
            return null;
        }
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
}
