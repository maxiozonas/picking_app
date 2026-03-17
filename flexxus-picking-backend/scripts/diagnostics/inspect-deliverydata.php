<?php

/**
 * Script para inspeccionar la respuesta de deliverydata
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Clients\Flexxus\FlexxusClient;

try {
    $flexxus = app(FlexxusClient::class);
    $flexxus->authenticate();

    // Probar con NP 623136 que es de RONDEAU
    echo "📋 Inspeccionando deliverydata de NP 623136:\n";
    echo str_repeat('=', 70)."\n\n";

    $response = $flexxus->request('GET', '/v2/deliverydata/NP/623136');

    echo "Respuesta completa:\n";
    print_r($response);

} catch (\Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
    echo 'Trace: '.$e->getTraceAsString()."\n";
}
