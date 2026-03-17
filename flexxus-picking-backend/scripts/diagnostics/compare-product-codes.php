<?php

/**
 * Script para comparar códigos de productos
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 COMPARANDO CÓDIGOS DE PRODUCTOS\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    // Obtener detalle del pedido
    echo "📦 DETALLE COMPLETO DEL PEDIDO NP 623136:\n";
    echo str_repeat('-', 70)."\n";

    $orderDetail = $flexxus->request('GET', '/v2/orders/NP/623136');

    foreach ($orderDetail['data']['DETALLE'] as $index => $item) {
        echo "\nITEM #".($index + 1).":\n";
        echo str_repeat('>', 70)."\n";

        foreach ($item as $key => $value) {
            if (is_scalar($value)) {
                echo "{$key}: {$value}\n";
            } elseif (is_array($value)) {
                echo "{$key}: [array]\n";
            } else {
                echo "{$key}: {$value}\n";
            }
        }

        // Intentar buscar stock con diferentes campos
        echo "\n🔍 Buscando stock...\n";

        $fieldsToTry = [
            'CODIGOPARTICULAR',
            'ID_ARTICULO', // si existe
            'LOTE',
        ];

        foreach ($fieldsToTry as $field) {
            if (isset($item[$field])) {
                $code = $item[$field];
                echo "  Probando con {$field} = {$code}...\n";

                try {
                    $stock = $flexxus->request('GET', "/v2/products/{$code}/stock");
                    $stockCount = isset($stock['Product_Stock']) ? count($stock['Product_Stock']) : 0;

                    if ($stockCount > 0) {
                        echo "    ✅ ENCONTRADO: {$stockCount} registros\n";
                        foreach ($stock['Product_Stock'] as $s) {
                            $dep = $s['DEPOSITO'] ?? 'N/A';
                            $st = $s['STOCKTOTAL'] ?? 0;
                            $lot = $s['LOTE'] ?? 'N/A';
                            echo "       - {$dep}: {$st} (Lote: {$lot})\n";
                        }
                    } else {
                        echo "    ❌ Sin stock (0 registros)\n";
                    }
                } catch (\Exception $e) {
                    echo '    ⚠️  Error: '.substr($e->getMessage(), 0, 50)."...\n";
                }
            }
        }

        echo "\n";
    }

    // Ver si hay algún campo que no estamos viendo
    echo "\n".str_repeat('=', 70)."\n";
    echo "📊 CAMPOS DISPONIBLES EN EL ITEMS DEL PEDIDO:\n";
    echo str_repeat('=', 70)."\n";

    if (isset($orderDetail['data']['DETALLE'][0])) {
        $firstItem = $orderDetail['data']['DETALLE'][0];
        echo "Campos encontrados:\n";
        foreach (array_keys($firstItem) as $key) {
            echo "  - {$key}\n";
        }
    }

} catch (\Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
}
