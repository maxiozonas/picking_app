<?php

/**
 * PRUEBA DE PICKING CON INFO DE STOCK POR PRODUCTO
 * Incluye stock disponible en cada depósito para cada producto
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🚀 PRUEBA DE PICKING CON INFORMACIÓN DE STOCK\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);

    // PASO 1: Autenticación
    echo "⏳ PASO 1: Autenticando con Flexxus...\n";
    $authData = $flexxus->authenticate();
    echo "✅ Login exitoso\n\n";

    // PASO 2: Obtener lista de depósitos
    echo "⏳ PASO 2: Obteniendo lista de depósitos...\n";
    $warehousesResponse = $flexxus->request('GET', '/v2/warehouses');
    $warehouses = $warehousesResponse['data'] ?? [];
    echo '✅ '.count($warehouses)." depósitos encontrados\n\n";

    // PASO 3: Obtener pedidos del día
    echo "⏳ PASO 3: Obteniendo pedidos del día 2026-03-02...\n";
    $ordersResponse = $flexxus->request('GET', '/v2/orders', [
        'date_from' => '2026-03-03',
        'date_to' => '2026-03-03',
    ]);

    $allOrders = $ordersResponse['data'] ?? [];
    echo '✅ Se encontraron '.count($allOrders)." pedidos en total\n\n";

    // PASO 4: Filtrar por RONDEAU
    echo "⏳ PASO 4: Filtrando por depósito RONDEAU...\n";
    $warehouseOrders = array_filter($allOrders, function ($order) {
        return $order['DEPOSITO'] === 'RONDEAU' && $order['ENTREGAR'] == 0;
    });
    $warehouseOrders = array_values($warehouseOrders);
    echo '✅ '.count($warehouseOrders)." pedidos de RONDEAU\n\n";

    // PASO 5: Filtrar por EXPEDICION
    echo "⏳ PASO 5: Filtrando por EXPEDICION...\n";
    $expeditionOrders = [];

    foreach ($warehouseOrders as $order) {
        $deliveryData = $flexxus->request('GET', "/v2/deliverydata/NP/{$order['NUMEROCOMPROBANTE']}");
        $deliveryInfo = $deliveryData['data'][0] ?? [];

        if (($deliveryInfo['CODIGOTIPOENTREGA'] ?? 0) == 1) {
            $order['delivery_info'] = $deliveryInfo;
            $expeditionOrders[] = $order;
        }
    }

    echo '✅ '.count($expeditionOrders)." pedidos de EXPEDICION\n\n";

    // PASO 6: Mostrar detalles con stock
    if (count($expeditionOrders) > 0) {
        echo "\n".str_repeat('=', 70)."\n";
        echo "📋 LISTA DE PICKING - EXPEDICION CON STOCK\n";
        echo str_repeat('=', 70)."\n\n";

        foreach ($expeditionOrders as $index => $order) {
            $orderDetail = $flexxus->request('GET', "/v2/orders/NP/{$order['NUMEROCOMPROBANTE']}");
            $detail = $orderDetail['data'] ?? [];

            // Buscar información del depósito
            $warehouseInfo = null;
            foreach ($warehouses as $wh) {
                if ($wh['DESCRIPCION'] === $order['DEPOSITO']) {
                    $warehouseInfo = $wh;
                    break;
                }
            }

            echo '📦 PEDIDO #'.($index + 1)."\n";
            echo str_repeat('-', 70)."\n";
            echo "Número: NP {$order['NUMEROCOMPROBANTE']}\n";
            echo "Cliente: {$order['RAZONSOCIAL']}\n";
            echo 'Fecha: '.date('d/m/Y', strtotime($order['FECHACOMPROBANTE']))."\n";
            echo 'Total: $'.number_format($order['TOTAL'], 2)."\n";
            echo "Tipo: EXPEDICION (Retiro en sucursal)\n\n";

            // Información del Depósito
            echo "📍 INFORMACIÓN DEL DEPÓSITO:\n";
            echo str_repeat('-', 70)."\n";
            echo '  Código: '.($warehouseInfo['CODIGODEPOSITO'] ?? 'N/A')."\n";
            echo '  Nombre: '.($warehouseInfo['DESCRIPCION'] ?? 'N/A')."\n";
            echo '  Dirección: '.($warehouseInfo['UBICACION'] ?? 'No especificada')."\n";
            echo '  Sucursal: '.($warehouseInfo['SUCURSAL'] ?? 'N/A')."\n\n";

            echo "📦 ITEMS A PREPARAR:\n";
            echo str_repeat('-', 70)."\n";

            foreach ($detail['DETALLE'] ?? [] as $item) {
                // ⭐ NUEVO: Obtener stock del producto
                $stockInfo = null;
                try {
                    $stockResponse = $flexxus->request('GET', "/v2/products/{$item['CODIGOPARTICULAR']}/stock");
                    $stockArray = $stockResponse['Product_Stock'] ?? [];

                    // Buscar stock en el depósito del pedido
                    foreach ($stockArray as $stock) {
                        if ($stock['DEPOSITO'] === $order['DEPOSITO']) {
                            $stockInfo = $stock;
                            break;
                        }
                    }
                } catch (\Exception $e) {
                    $stockInfo = null;
                }

                echo "\n  ➤ ".strtoupper($item['DESCRIPCION'])."\n";
                echo "     ┌─ Información del Producto:\n";
                echo "     │  Código: {$item['CODIGOPARTICULAR']}\n";
                echo '     │  Lote pedido: '.($item['LOTE'] ?? 'Sin lote')."\n";

                if ($stockInfo) {
                    echo '     │  Lote en stock: '.($stockInfo['LOTE'] ?? 'N/A')."\n";
                    echo "     │  Stock disponible: {$stockInfo['STOCKTOTAL']} unidades\n";
                    echo '     │  Depósito local: '.($stockInfo['ESDEPOSITOLOCAL'] ? 'Sí' : 'No')."\n";
                } else {
                    echo "     │  ⚠️  Stock no disponible en este depósito\n";
                }

                echo "     ├─ Cantidades del Pedido:\n";
                echo "     │  Solicitada: {$item['CANTIDAD']}\n";
                echo "     │  Pendiente: {$item['PENDIENTE']}\n";
                echo "     │  Remitido: {$item['CANTIDADREMITIDA']}\n";

                if ($stockInfo && $item['PENDIENTE'] > $stockInfo['STOCKTOTAL']) {
                    echo '     │  ⚠️  STOCK INSUFICIENTE (faltan '.($item['PENDIENTE'] - $stockInfo['STOCKTOTAL'])." unidades)\n";
                }

                echo "     ├─ Precios:\n";
                echo '     │  Unit.: $'.number_format($item['PRECIOUNITARIO'], 2)."\n";
                echo '     │  Total: $'.number_format($item['PRECIOTOTAL'], 2)."\n";
                echo "     └─ Ubicación: Depósito {$order['DEPOSITO']}\n";
            }

            echo "\n".str_repeat('=', 70)."\n\n";
        }

        // Resumen
        $totalItems = 0;
        $totalAmount = 0;

        foreach ($expeditionOrders as $order) {
            $orderDetail = $flexxus->request('GET', "/v2/orders/NP/{$order['NUMEROCOMPROBANTE']}");
            $totalItems += count($orderDetail['data']['DETALLE'] ?? []);
            $totalAmount += $order['TOTAL'];
        }

        echo "📊 RESUMEN:\n";
        echo str_repeat('=', 70)."\n";
        echo 'Total de pedidos: '.count($expeditionOrders)."\n";
        echo "Total de items: {$totalItems}\n";
        echo 'Monto total: $'.number_format($totalAmount, 2)."\n";
        echo "Depósito: RONDEAU\n";
        echo "Tipo: EXPEDICION\n";
        echo "✅ Incluye información de stock por producto\n";
        echo str_repeat('=', 70)."\n";

        echo "\n✅ PRUEBA COMPLETADA CON ÉXITO\n";
        echo "ℹ️  Cada item muestra:\n";
        echo "   - Depósito donde retirar\n";
        echo "   - Lote del producto\n";
        echo "   - Stock disponible en ese depósito\n";
        echo "   - Alerta de stock insuficiente (si aplica)\n\n";

    } else {
        echo "⚠️  No se encontraron pedidos de EXPEDICION para RONDEAU\n";
    }

} catch (\Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
    exit(1);
}
