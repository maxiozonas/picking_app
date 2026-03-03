<?php

/**
 * PRUEBA DE PICKING - VERIFICAR PEDIDOS POR DEPÓSITO
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 BUSCANDO PEDIDOS POR DEPÓSITO\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);

    // Autenticación
    echo "⏳ Autenticando...\n";
    $authData = $flexxus->authenticate();
    echo "✅ Login exitoso\n\n";

    $date = now()->format('Y-m-d');
    echo "📅 Fecha de hoy: {$date}\n\n";

    // Obtener pedidos del día
    echo "⏳ Obteniendo todos los pedidos del día...\n";
    $ordersResponse = $flexxus->request('GET', '/v2/orders', [
        'date_from' => $date,
        'date_to' => $date,
    ]);

    $allOrders = $ordersResponse['data'] ?? [];
    echo '✅ '.count($allOrders)." pedidos en total\n\n";

    // Agrupar por depósito
    $byWarehouse = [];
    foreach ($allOrders as $order) {
        $depot = $order['DEPOSITO'] ?? 'UNKNOWN';
        if (!isset($byWarehouse[$depot])) {
            $byWarehouse[$depot] = [];
        }
        $byWarehouse[$depot][] = $order;
    }

    echo "📊 PEDIDOS POR DEPÓSITO:\n";
    echo str_repeat('=', 70)."\n";

    foreach ($byWarehouse as $depot => $orders) {
        echo "\n📍 {$depot}: ".count($orders)." pedidos\n";
        echo str_repeat('-', 70)."\n";

        foreach ($orders as $order) {
            // Verificar tipo de entrega
            $deliveryData = $flexxus->request('GET', "/v2/deliverydata/NP/{$order['NUMEROCOMPROBANTE']}");
            $deliveryInfo = $deliveryData['data'][0] ?? [];
            $tipoEntrega = $deliveryInfo['CODIGOTIPOENTREGA'] ?? 0;
            $isExpedicion = ($tipoEntrega == 1);

            echo "  - NP {$order['NUMEROCOMPROBANTE']} - {$order['RAZONSOCIAL']}\n";
            echo "    Entregar: ".($order['ENTREGAR'] == 0 ? 'No' : 'Sí')."\n";
            echo "    Tipo entrega: ".($isExpedicion ? 'EXPEDICION ✅' : 'Otro')."\n";
            echo "    Total: $".number_format($order['TOTAL'], 2)."\n";
        }
    }

    echo "\n".str_repeat('=', 70)."\n";
    echo "✅ PRUEBA COMPLETADA\n\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
    exit(1);
}
