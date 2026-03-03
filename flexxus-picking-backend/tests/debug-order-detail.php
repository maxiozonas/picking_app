<?php

/**
 * DEBUG - Verificar getOrderDetail de Flexxus
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 DEBUG - GET ORDER DETAIL\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    $orderNumber = 'NP 623139';
    echo "📦 Order Number: {$orderNumber}\n\n";

    // Limpiar el número de orden (quitar "NP ")
    $cleanNumber = str_replace('NP ', '', $orderNumber);
    echo "🔍 Clean Number: {$cleanNumber}\n\n";

    echo "⏳ Haciendo request a: /v2/orders/NP/{$cleanNumber}\n";
    $response = $flexxus->request('GET', "/v2/orders/NP/{$cleanNumber}");

    echo "✅ Respuesta recibida\n\n";
    echo "📋 ESTRUCTURA DE LA RESPUESTA:\n";
    echo str_repeat('-', 70)."\n";

    if (isset($response['data'])) {
        $data = $response['data'];
        echo "Keys en data: ".implode(', ', array_keys($data))."\n\n";

        if (isset($data['DETALLE'])) {
            echo "Items en DETALLE: ".count($data['DETALLE'])."\n";
            foreach ($data['DETALLE'] as $i => $item) {
                echo "  Item ".($i+1).": ".($item['DESCRIPCION'] ?? 'N/A')."\n";
            }
        } else {
            echo "⚠️  No hay DETALLE en la respuesta\n";
            echo "Contenido completo:\n";
            print_r($data);
        }
    } else {
        echo "⚠️  No hay 'data' en la respuesta\n";
        print_r($response);
    }

    echo "\n✅ DEBUG COMPLETADO\n\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
    exit(1);
}
