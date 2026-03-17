<?php

/**
 * PRUEBA DE PICKING USANDO FLEXXUS CLIENT
 * Utiliza el FlexxusClient existente que ya funciona
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🚀 PRUEBA DE PICKING CON FLEXXUS CLIENT\n";
echo str_repeat('=', 70)."\n\n";

try {
    // Crear instancia del client que ya funciona
    $flexxus = app(FlexxusClient::class);

    // PASO 1: Autenticación (usando el client existente)
    echo "⏳ PASO 1: Autenticando con Flexxus...\n";
    $authData = $flexxus->authenticate();
    echo "✅ Login exitoso\n";
    echo '   Token: '.substr($authData['token'], 0, 50)."...\n\n";

    // PASO 2: Obtener pedidos del día
    echo "⏳ PASO 2: Obteniendo pedidos del día 2026-03-02...\n";
    $ordersResponse = $flexxus->request('GET', '/v2/orders', [
        'date_from' => '2026-03-02',
        'date_to' => '2026-03-02',
    ]);

    $allOrders = $ordersResponse['data'] ?? [];
    echo '✅ Se encontraron '.count($allOrders)." pedidos en total\n\n";

    // Mostrar todos los pedidos
    echo "📊 Todos los pedidos del día:\n";
    foreach ($allOrders as $order) {
        $status = $order['ENTREGAR'] == 0 ? 'Pendiente' : 'Entregado';
        echo "   - NP {$order['NUMEROCOMPROBANTE']}: {$order['DEPOSITO']} - {$order['RAZONSOCIAL']} [{$status}]\n";
    }
    echo "\n";

    // PASO 3: Filtrar por RONDEAU
    echo "⏳ PASO 3: Filtrando por depósito RONDEAU...\n";
    $warehouseOrders = array_filter($allOrders, function ($order) {
        return $order['DEPOSITO'] === 'RONDEAU' && $order['ENTREGAR'] == 0;
    });
    $warehouseOrders = array_values($warehouseOrders);
    echo '✅ '.count($warehouseOrders)." pedidos de RONDEAU\n\n";

    // PASO 4: Filtrar por EXPEDICION
    echo "⏳ PASO 4: Filtrando por EXPEDICION...\n";
    $expeditionOrders = [];

    foreach ($warehouseOrders as $order) {
        $deliveryData = $flexxus->request('GET', "/v2/deliverydata/NP/{$order['NUMEROCOMPROBANTE']}");

        // La respuesta viene en [0], hay que acceder correctamente
        $deliveryInfo = $deliveryData['data'][0] ?? [];

        if (($deliveryInfo['CODIGOTIPOENTREGA'] ?? 0) == 1) {
            $order['delivery_info'] = $deliveryInfo;
            $expeditionOrders[] = $order;
        }
    }

    echo '✅ '.count($expeditionOrders)." pedidos de EXPEDICION\n\n";

    // PASO 5: Mostrar detalles
    if (count($expeditionOrders) > 0) {
        echo "\n".str_repeat('=', 70)."\n";
        echo "📋 LISTA DE PICKING - EXPEDICION\n";
        echo str_repeat('=', 70)."\n\n";

        foreach ($expeditionOrders as $index => $order) {
            $orderDetail = $flexxus->request('GET', "/v2/orders/NP/{$order['NUMEROCOMPROBANTE']}");
            $detail = $orderDetail['data'] ?? [];

            echo '📦 PEDIDO #'.($index + 1)."\n";
            echo str_repeat('-', 70)."\n";
            echo "Número: NP {$order['NUMEROCOMPROBANTE']}\n";
            echo "Cliente: {$order['RAZONSOCIAL']}\n";
            echo 'Fecha: '.date('d/m/Y', strtotime($order['FECHACOMPROBANTE']))."\n";
            echo "Depósito: {$order['DEPOSITO']}\n";
            echo 'Total: $'.number_format($order['TOTAL'], 2)."\n";
            echo "Tipo Entrega: EXPEDICION (Retiro en sucursal)\n\n";

            echo "📦 ITEMS A PREPARAR:\n";
            echo str_repeat('-', 70)."\n";

            foreach ($detail['DETALLE'] ?? [] as $item) {
                echo "\n  ➤ {$item['DESCRIPCION']}\n";
                echo "     Cód: {$item['CODIGOPARTICULAR']}\n";
                echo "     Cantidad: {$item['CANTIDAD']}\n";
                echo "     Pendiente: {$item['PENDIENTE']}\n";
                echo "     Remitido: {$item['CANTIDADREMITIDA']}\n";
                echo '     Precio Unit.: $'.number_format($item['PRECIOUNITARIO'], 2)."\n";
                echo '     Subtotal: $'.number_format($item['PRECIOTOTAL'], 2)."\n";
            }

            echo "\n".str_repeat('=', 70)."\n\n";
        }

        // Resumen
        $totalItems = 0;
        $totalAmount = 0;

        foreach ($expeditionOrders as $order) {
            $orderDetail = $flexxus->request('GET', "/v2/orders/NP/{$order['NUMEROCOMPROBANTE']}");
            $totalItems += count($orderDetail['data']['DETALLE']);
            $totalAmount += $order['TOTAL'];
        }

        echo "📊 RESUMEN:\n";
        echo str_repeat('=', 70)."\n";
        echo 'Total de pedidos: '.count($expeditionOrders)."\n";
        echo "Total de items: {$totalItems}\n";
        echo 'Monto total: $'.number_format($totalAmount, 2)."\n";
        echo str_repeat('=', 70)."\n";

        echo "\n✅ PRUEBA COMPLETADA CON ÉXITO\n";
        echo '   Se encontraron '.count($expeditionOrders)." pedidos de picking para RONDEAU\n";
        echo "   Fecha: 2026-03-02\n";
        echo "   Tipo: EXPEDICION (retiro en sucursal)\n\n";

    } else {
        echo "⚠️  No se encontraron pedidos de EXPEDICION para RONDEAU\n";
        echo "   en la fecha 2026-03-02\n\n";
    }

} catch (\Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
    echo "\nStack trace:\n".$e->getTraceAsString()."\n";
    exit(1);
}
