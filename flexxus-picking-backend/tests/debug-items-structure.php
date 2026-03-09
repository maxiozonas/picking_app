<?php

/**
 * DEBUG - Verificar estructura de items de Flexxus
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

echo "🔍 DEBUG - ESTRUCTURA DE ITEMS\n";
echo str_repeat('=', 70)."\n\n";

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    $cleanNumber = '623139';
    $response = $flexxus->request('GET', "/v2/orders/NP/{$cleanNumber}");

    $items = $response['data']['DETALLE'] ?? [];

    echo '📦 Total items: '.count($items)."\n\n";

    foreach ($items as $i => $item) {
        echo '📦 ITEM '.($i + 1).":\n";
        echo str_repeat('-', 70)."\n";

        foreach ($item as $key => $value) {
            if (is_string($value) && strlen($value) > 50) {
                $value = substr($value, 0, 50).'...';
            }
            if (! is_array($value)) {
                echo "  {$key}: {$value}\n";
            }
        }
        echo "\n";
    }

    echo "✅ DEBUG COMPLETADO\n\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: ".$e->getMessage()."\n";
    echo 'Archivo: '.$e->getFile().':'.$e->getLine()."\n";
    exit(1);
}
