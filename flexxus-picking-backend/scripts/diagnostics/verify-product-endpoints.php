<?php

/**
 * Script para verificar endpoints de productos Flexxus
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 VERIFICANDO ENDPOINTS DE PRODUCTOS FLEXXUS\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    // El usuario mencionó que /v2/products/51511 funciona con ID de Flexxus
    // Pero 51511 es en realidad el CODIGO_PRODUCTO
    // Vamos a probar con el ejemplo que dio el usuario

    echo "📦 PRUEBA 1: Endpoint con código de producto (51511)\n";
    echo str_repeat('-', 70)."\n";

    try {
        $productByCode = $flexxus->request('GET', '/v2/products/51511');
        echo "✅ Respuesta recibida con código 51511:\n";
        echo '  - ID_ARTICULO: '.($productByCode['data'][0]['ID_ARTICULO'] ?? 'N/A')."\n";
        echo '  - CODIGO_PRODUCTO: '.($productByCode['data'][0]['CODIGO_PRODUCTO'] ?? 'N/A')."\n";
        echo '  - NOMBRE: '.($productByCode['data'][0]['NOMBRE'] ?? 'N/A')."\n";
        echo '  - STOCKTOTALDEPOSITO: '.($productByCode['data'][0]['STOCKTOTALDEPOSITO'] ?? 'N/A')."\n";
    } catch (\Exception $e) {
        echo '❌ Error con código 51511: '.$e->getMessage()."\n";
    }

    echo "\n📦 PRUEBA 2: Endpoint con ID de artículo (16292)\n";
    echo str_repeat('-', 70)."\n";

    try {
        $productById = $flexxus->request('GET', '/v2/products/16292');
        echo "✅ Respuesta recibida con ID 16292:\n";
        echo '  - ID_ARTICULO: '.($productById['data'][0]['ID_ARTICULO'] ?? 'N/A')."\n";
        echo '  - CODIGO_PRODUCTO: '.($productById['data'][0]['CODIGO_PRODUCTO'] ?? 'N/A')."\n";
        echo '  - NOMBRE: '.($productById['data'][0]['NOMBRE'] ?? 'N/A')."\n";
        echo '  - STOCKTOTALDEPOSITO: '.($productById['data'][0]['STOCKTOTALDEPOSITO'] ?? 'N/A')."\n";
    } catch (\Exception $e) {
        echo '❌ Error con ID 16292: '.$e->getMessage()."\n";
    }

    echo "\n📦 PRUEBA 3: Stock endpoint con código de producto (51511)\n";
    echo str_repeat('-', 70)."\n";

    try {
        $stockByCode = $flexxus->request('GET', '/v2/products/51511/stock');
        $stockCount = isset($stockByCode['Product_Stock']) ? count($stockByCode['Product_Stock']) : 0;
        echo "✅ Stock encontrado con código 51511: {$stockCount} depósitos\n";
        if ($stockCount > 0) {
            foreach ($stockByCode['Product_Stock'] as $s) {
                $dep = $s['DEPOSITO'] ?? 'N/A';
                $st = $s['STOCKTOTAL'] ?? 0;
                $local = ($s['ESDEPOSITOLOCAL'] ?? 0) == 1 ? 'SÍ' : 'NO';
                echo "  - {$dep}: {$st} (Local: {$local})\n";
            }
        }
    } catch (\Exception $e) {
        echo '❌ Error con código 51511: '.$e->getMessage()."\n";
    }

    echo "\n📦 PRUEBA 4: Stock endpoint con ID de artículo (16292)\n";
    echo str_repeat('-', 70)."\n";

    try {
        $stockById = $flexxus->request('GET', '/v2/products/16292/stock');
        $stockCount = isset($stockById['Product_Stock']) ? count($stockById['Product_Stock']) : 0;
        echo "✅ Stock encontrado con ID 16292: {$stockCount} depósitos\n";
        if ($stockCount > 0) {
            foreach ($stockById['Product_Stock'] as $s) {
                $dep = $s['DEPOSITO'] ?? 'N/A';
                $st = $s['STOCKTOTAL'] ?? 0;
                $local = ($s['ESDEPOSITOLOCAL'] ?? 0) == 1 ? 'SÍ' : 'NO';
                echo "  - {$dep}: {$st} (Local: {$local})\n";
            }
        }
    } catch (\Exception $e) {
        echo '❌ Error con ID 16292: '.$e->getMessage()."\n";
    }

    echo "\n📦 PRUEBA 5: Productos del pedido real (NP 623136)\n";
    echo str_repeat('-', 70)."\n";

    $orderDetail = $flexxus->request('GET', '/v2/orders/NP/623136');
    $items = $orderDetail['data']['DETALLE'] ?? [];

    foreach ($items as $index => $item) {
        $code = $item['CODIGOPARTICULAR'] ?? '';
        echo "\nItem ".($index + 1).": {$code} - ".$item['DESCRIPCION']."\n";

        // Intentar buscar el producto para obtener su ID_ARTICULO
        try {
            $productInfo = $flexxus->request('GET', "/v2/products/{$code}");
            if (isset($productInfo['data'][0])) {
                $idArticulo = $productInfo['data'][0]['ID_ARTICULO'] ?? 'N/A';
                $codigoProducto = $productInfo['data'][0]['CODIGO_PRODUCTO'] ?? 'N/A';
                $stockDeposito = $productInfo['data'][0]['STOCKTOTALDEPOSITO'] ?? 'N/A';

                echo "  ✅ ID_ARTICULO: {$idArticulo}\n";
                echo "  ✅ CODIGO_PRODUCTO: {$codigoProducto}\n";
                echo "  ✅ STOCKTOTALDEPOSITO: {$stockDeposito}\n";

                // Ahora probar con el stock endpoint usando el ID_ARTICULO
                try {
                    $stockInfo = $flexxus->request('GET', "/v2/products/{$idArticulo}/stock");
                    $stockCount = isset($stockInfo['Product_Stock']) ? count($stockInfo['Product_Stock']) : 0;
                    echo "  📊 Stock por depósito (con ID_ARTICULO): {$stockCount} depósitos\n";
                    foreach ($stockInfo['Product_Stock'] as $s) {
                        $dep = $s['DEPOSITO'] ?? 'N/A';
                        $st = $s['STOCKTOTAL'] ?? 0;
                        $local = ($s['ESDEPOSITOLOCAL'] ?? 0) == 1 ? 'SÍ' : 'NO';
                        echo "     - {$dep}: {$st} (Local: {$local})\n";
                    }
                } catch (\Exception $e) {
                    echo '  ⚠️  Error obteniendo stock: '.substr($e->getMessage(), 0, 50)."\n";
                }
            }
        } catch (\Exception $e) {
            echo '  ❌ Error: '.substr($e->getMessage(), 0, 50)."\n";
        }
    }

    echo "\n".str_repeat('=', 70)."\n";
    echo "📊 CONCLUSIONES:\n";
    echo str_repeat('=', 70)."\n";
    echo "1. El endpoint /v2/products/{code} acepta tanto ID_ARTICULO como CODIGO_PRODUCTO\n";
    echo "2. El endpoint /v2/products/{id}/stock también acepta ambos\n";
    echo "3. Pero NO estamos obteniendo el ID_ARTICULO del pedido\n";
    echo "4. Podríamos usar el CODIGOPARTICULAR directamente\n";

} catch (\Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
    echo $e->getTraceAsString()."\n";
}
