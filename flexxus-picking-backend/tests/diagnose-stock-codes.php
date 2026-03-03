<?php

/**
 * Script para diagnosticar por qué no aparece el stock
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 DIAGNÓSTICO DE STOCK POR PRODUCTO\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    // Códigos de producto de los pedidos
    $orderProductCodes = ['08918', '54212', '51511'];

    // Código que el usuario dijo que funciona
    $testCode = '04535';

    echo "📦 PRODUCTO DE PRUEBA (del usuario):\n";
    echo str_repeat('-', 70)."\n";
    echo "Código: {$testCode}\n\n";

    $stockResponse = $flexxus->request('GET', "/v2/products/{$testCode}/stock");
    echo "Respuesta completa:\n";
    print_r($stockResponse);
    echo "\n\n";

    echo str_repeat('=', 70)."\n\n";

    echo "📦 PRODUCTOS DE LOS PEDIDOS:\n";
    echo str_repeat('=', 70)."\n\n";

    foreach ($orderProductCodes as $code) {
        echo "Código: {$code}\n";
        echo str_repeat('-', 70)."\n";

        try {
            $stockResponse = $flexxus->request('GET', "/v2/products/{$code}/stock");

            if (isset($stockResponse['Product_Stock']) && is_array($stockResponse['Product_Stock'])) {
                echo '✅ Encontrado: '.count($stockResponse['Product_Stock'])." registros de stock\n\n";

                foreach ($stockResponse['Product_Stock'] as $stock) {
                    echo "  Depósito: {$stock['DEPOSITO']}\n";
                    echo "  Lote: {$stock['LOTE']}\n";
                    echo "  Stock: {$stock['STOCKTOTAL']}\n";
                    echo '  Es local: '.($stock['ESDEPOSITOLOCAL'] ? 'Sí' : 'No')."\n";
                    echo "\n";
                }
            } else {
                echo "❌ No encontrado o vacío\n";
                echo 'Respuesta: ';
                print_r($stockResponse);
            }
        } catch (\Exception $e) {
            echo '❌ Error: '.$e->getMessage()."\n";
        }

        echo "\n".str_repeat('-', 70)."\n\n";
    }

    // PROBAR CON UNA BÚSQUEDA MÁS AMPLIA
    echo "\n".str_repeat('=', 70)."\n";
    echo "🔍 BÚSQUEDA EN STOCK GENERAL:\n";
    echo str_repeat('=', 70)."\n\n";

    echo "Obteniendo primeros 20 registros de stock general...\n";

    try {
        $generalStock = $flexxus->request('GET', '/v2/stock');
        $allStock = $generalStock['data'] ?? [];

        echo 'Total de registros: '.count($allStock)."\n\n";

        // Mostrar primeros 20
        $sample = array_slice($allStock, 0, 20);

        foreach ($sample as $stock) {
            echo "Cód: {$stock['CODIGO_PRODUCTO']} - Stock: {$stock['STOCKREAL']}\n";
        }

        // Buscar nuestros códigos
        echo "\n".str_repeat('-', 70)."\n";
        echo "\n🔍 Buscando códigos {$testCode}, ".implode(', ', $orderProductCodes)." en stock general...\n\n";

        foreach ($allStock as $stock) {
            if (in_array($stock['CODIGO_PRODUCTO'], array_merge([$testCode], $orderProductCodes))) {
                echo "✅ ENCONTRADO: {$stock['CODIGO_PRODUCTO']}\n";
                echo "   Stock real: {$stock['STOCKREAL']}\n";
                echo "   Origen: {$stock['ORIGEN']}\n\n";
            }
        }

    } catch (\Exception $e) {
        echo '❌ Error al obtener stock general: '.$e->getMessage()."\n";
    }

} catch (\Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
}
