<?php

/**
 * DEBUG - Verificar estructura de pedidos de Flexxus
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 DEBUG - ESTRUCTURA DE PEDIDOS FLEXXUS\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    $date = now()->format('Y-m-d');
    echo "📅 Fecha: {$date}\n\n";

    $ordersResponse = $flexxus->request('GET', '/v2/orders', [
        'date_from' => $date,
        'date_to' => $date,
    ]);

    $allOrders = $ordersResponse['data'] ?? [];
    echo '📦 Total pedidos: '.count($allOrders)."\n\n";

    if (count($allOrders) > 0) {
        $order = $allOrders[0];

        echo "🔍 CAMPOS DEL PRIMER PEDIDO:\n";
        echo str_repeat('-', 70)."\n";
        foreach (array_keys($order) as $key) {
            $value = is_string($order[$key]) ? $order[$key] : json_encode($order[$key]);
            $value = strlen($value) > 50 ? substr($value, 0, 50).'...' : $value;
            echo "  {$key}: {$value}\n";
        }

        echo "\n🔍 CAMPO DEPOSITO:\n";
        echo str_repeat('-', 70)."\n";
        echo '  DEPOSITO: '.($order['DEPOSITO'] ?? 'NOT SET')."\n";

        echo "\n🔍 COMPARACION CON WAREHOUSE 2:\n";
        echo str_repeat('-', 70)."\n";
        $warehouse = \App\Models\Warehouse::find(2);
        echo "  Warehouse code: {$warehouse->code}\n";
        echo "  Warehouse name: {$warehouse->name}\n";
        echo '  Order DEPOSITO == code? '.(($order['DEPOSITO'] == $warehouse->code) ? 'YES' : 'NO')."\n";
        echo '  Order DEPOSITO == name? '.(($order['DEPOSITO'] == $warehouse->name) ? 'YES' : 'NO')."\n";
    }

    echo "\n✅ DEBUG COMPLETADO\n\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
    exit(1);
}
