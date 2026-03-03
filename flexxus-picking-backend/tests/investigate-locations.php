<?php

/**
 * Script para investigar ubicaciones de productos en Flexxus
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 INVESTIGANDO UBICACIONES DE PRODUCTOS\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    // Códigos de producto de la prueba anterior
    $productCodes = ['08918', '54212', '51511'];

    foreach ($productCodes as $code) {
        echo "📦 PRODUCTO: {$code}\n";
        echo str_repeat('-', 70)."\n";

        // Método 1: GET /v2/stock (filtrado por producto)
        echo "Método 1: /v2/stock\n";
        try {
            $stockResponse = $flexxus->request('GET', '/v2/stock');
            $allStock = $stockResponse['data'] ?? [];

            // Buscar el producto
            $productStock = null;
            foreach ($allStock as $stock) {
                if ($stock['CODIGO_PRODUCTO'] === $code) {
                    $productStock = $stock;
                    break;
                }
            }

            if ($productStock) {
                echo "  Encontrado:\n";
                foreach ($productStock as $key => $value) {
                    echo "    {$key}: {$value}\n";
                }
            } else {
                echo "  No encontrado en stock general\n";
            }
        } catch (\Exception $e) {
            echo '  Error: '.$e->getMessage()."\n";
        }

        // Método 2: GET /v2/products/{id}/stock
        echo "\nMétodo 2: /v2/products/{$code}/stock\n";
        try {
            $productStockResponse = $flexxus->request('GET', "/v2/products/{$code}/stock");

            echo "  Respuesta completa:\n";
            print_r($productStockResponse);
        } catch (\Exception $e) {
            echo '  Error: '.$e->getMessage()."\n";
        }

        // Método 3: Buscar en items del pedido (si tenemos info)
        echo "\nMétodo 3: Buscar en detalle de pedido\n";
        try {
            $orderDetail = $flexxus->request('GET', '/v2/orders/NP/623136');

            foreach ($orderDetail['data']['DETALLE'] ?? [] as $item) {
                if ($item['CODIGOPARTICULAR'] === $code) {
                    echo "  Encontrado en pedido NP 623136:\n";
                    foreach ($item as $key => $value) {
                        if (! is_array($value)) {
                            echo "    {$key}: {$value}\n";
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            echo '  Error: '.$e->getMessage()."\n";
        }

        echo "\n".str_repeat('=', 70)."\n\n";
    }

    // CONCLUSIÓN
    echo "📊 CONCLUSIÓN\n";
    echo str_repeat('=', 70)."\n\n";

    echo "Basado en la investigación:\n\n";

    echo "1. Endpoint /v2/stock:\n";
    echo "   - Campos: ID_ARTICULO, CODIGO_PRODUCTO, TALLE, STOCKREAL, etc.\n";
    echo "   - ❌ NO incluye ubicación física (pasillo, estantería, posición)\n\n";

    echo "2. Endpoint /v2/products/{id}/stock:\n";
    echo "   - Campos: DEPOSITO, LOTE, STOCKTOTAL\n";
    echo "   - ❌ NO incluye ubicación física detallada\n\n";

    echo "3. Endpoint /v2/orders/NP/{id}:\n";
    echo "   - Items del pedido con: CODIGOPARTICULAR, DESCRIPCION, LOTE\n";
    echo "   - ❌ NO incluye ubicación física\n\n";

    echo "✅ POSIBLES SOLUCIONES:\n\n";

    echo "Opción 1: Ubicación por DEPÓSITO solamente\n";
    echo "  - Mostrar el nombre del depósito (ej: 'RONDEAU')\n";
    echo "  - Es la información que SÍ tenemos disponible\n\n";

    echo "Opción 2: Sistema de ubicaciones externo\n";
    echo "  - Crear tabla propia de ubicaciones\n";
    echo "  - Mapear producto → ubicación manualmente\n";
    echo "  - Requiere mantenimiento manual\n\n";

    echo "Opción 3: Consultar a Flexxus/Procom\n";
    echo "  - Preguntar si existe algún endpoint no documentado\n";
    echo "  - O si hay algún módulo adicional de ubicaciones\n\n";

} catch (\Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
}
