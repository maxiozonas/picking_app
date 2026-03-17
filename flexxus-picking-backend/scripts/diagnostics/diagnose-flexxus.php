<?php

/**
 * SCRIPT DE DIAGNÓSTICO PARA FLEXXUS API
 *
 * Este script ayuda a identificar problemas de conexión
 */
$config = [
    'flexxus' => [
        'base_url' => 'https://pruebagiliycia.procomisp.com.ar',
        'username' => 'CARLOSR',
        'password' => 'W250',
    ],
];

echo "🔍 DIAGNÓSTICO DE CONEXIÓN A FLEXXUS\n";
echo str_repeat('=', 70)."\n\n";

// TEST 1: Verificar resolución DNS
echo "TEST 1: Resolución DNS\n";
echo str_repeat('-', 70)."\n";
$host = parse_url($config['flexxus']['base_url'], PHP_URL_HOST);
echo "Host: {$host}\n";
$ip = gethostbyname($host);
if ($ip !== $host) {
    echo "✅ DNS resuelve a: {$ip}\n\n";
} else {
    echo "❌ No se puede resolver el host\n\n";
    exit(1);
}

// TEST 2: Verificar conectividad
echo "TEST 2: Conectividad HTTP\n";
echo str_repeat('-', 70)."\n";
$ch = curl_init($config['flexxus']['base_url']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "URL: {$config['flexxus']['base_url']}\n";
echo "HTTP Code: {$httpCode}\n";
if ($httpCode > 0) {
    echo "✅ Servidor accesible\n\n";
} else {
    echo "❌ No se puede conectar al servidor\n\n";
    exit(1);
}

// TEST 3: Probar diferentes endpoints
echo "TEST 3: Endpoints disponibles\n";
echo str_repeat('-', 70)."\n";

$endpoints = [
    '/v2/auth/login',
    '/auth/login',
    '/api/v2/auth/login',
    '/api/auth/login',
];

foreach ($endpoints as $endpoint) {
    $url = $config['flexxus']['base_url'].$endpoint;
    echo "\nProbando: {$url}\n";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    // JSON simple
    $data = json_encode(['username' => 'test', 'password' => 'test']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "  HTTP {$httpCode}: ";

    if ($httpCode === 200) {
        echo "✅ RESPUESTA VÁLIDA\n";
    } elseif ($httpCode === 404) {
        echo "⚠️  No existe (404)\n";
    } elseif ($httpCode === 500) {
        // Mostrar primeros 200 chars del error
        $shortResponse = substr(strip_tags($response), 0, 200);
        echo "❌ Error del servidor (500)\n";
        echo "  Detalle: {$shortResponse}...\n";
    } else {
        $shortResponse = substr(strip_tags($response), 0, 100);
        echo "⚠️  Inesperado\n";
        echo "  Respuesta: {$shortResponse}...\n";
    }
}

echo "\n\n";

// TEST 4: Probar diferentes formatos de JSON
echo "TEST 4: Formatos de JSON\n";
echo str_repeat('-', 70)."\n";

$loginUrl = $config['flexxus']['base_url'].'/v2/auth/login';

$testCases = [
    'JSON simple' => json_encode([
        'username' => $config['flexxus']['username'],
        'password' => $config['flexxus']['password'],
    ]),
    'JSON con deviceinfo string' => json_encode([
        'username' => $config['flexxus']['username'],
        'password' => $config['flexxus']['password'],
        'deviceinfo' => 'test',
    ]),
    'JSON con deviceinfo objeto vacío' => json_encode([
        'username' => $config['flexxus']['username'],
        'password' => $config['flexxus']['password'],
        'deviceinfo' => new stdClass,
    ]),
    'JSON completo' => json_encode([
        'username' => $config['flexxus']['username'],
        'password' => $config['flexxus']['password'],
        'deviceinfo' => [
            'model' => '0',
            'platform' => '0',
            'uuid' => '4953457348957348957348975',
            'version' => '0',
            'manufacturer' => '0',
        ],
    ]),
];

foreach ($testCases as $name => $jsonData) {
    echo "\nProbando: {$name}\n";
    echo 'JSON: '.substr($jsonData, 0, 100)."...\n";

    $ch = curl_init($loginUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP {$httpCode}: ";

    if ($httpCode === 200) {
        $resp = json_decode($response, true);
        if ($resp && isset($resp['token'])) {
            echo "✅ LOGIN EXITOSO\n";
            echo 'Token: '.substr($resp['token'], 0, 50)."...\n";
            echo "\n🎉 Este formato funciona!\n";
            exit(0);
        } else {
            echo "⚠️  Respuesta sin token\n";
        }
    } else {
        $shortResponse = substr(strip_tags($response), 0, 150);
        echo "❌ Error\n";
        echo "Detalle: {$shortResponse}...\n";
    }
}

echo "\n\n";
echo "TEST 5: Verificando si hay documentación disponible\n";
echo str_repeat('-', 70)."\n";

$docsUrls = [
    '/swagger-ui',
    '/api-docs',
    '/documentation',
    '/v2/docs',
];

foreach ($docsUrls as $docPath) {
    $url = $config['flexxus']['base_url'].$docPath;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && strlen($response) > 100) {
        echo "✅ Documentación encontrada: {$url}\n";
    }
}

echo "\n";
echo str_repeat('=', 70)."\n";
echo "Fin del diagnóstico\n";
