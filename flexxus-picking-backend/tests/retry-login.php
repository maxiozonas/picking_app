<?php

/**
 * Script de reintento automático para login de Flexxus
 * Reintenta el login cada 30 segundos hasta obtener una licencia
 */
$config = [
    'flexxus' => [
        'base_url' => 'https://pruebagiliycia.procomisp.com.ar',
        'username' => 'CARLOSR',
        'password' => 'W250',
        'deviceinfo' => [
            'model' => '0',
            'platform' => '0',
            'uuid' => '4953457348957348957348975',
            'version' => '0',
            'manufacturer' => '0',
        ],
    ],
];

echo "🔄 REINTENTO AUTOMÁTICO DE LOGIN A FLEXXUS\n";
echo str_repeat('=', 70)."\n";
echo "Usuario: {$config['flexxus']['username']}\n";
echo "Reintentando cada 30 segundos...\n";
echo "Presiona Ctrl+C para detener\n\n";

$attempt = 0;
$maxAttempts = 20; // Máximo 20 intentos (10 minutos)

while ($attempt < $maxAttempts) {
    $attempt++;

    echo date('H:i:s')." - Intento {$attempt}/{$maxAttempts}... ";

    try {
        $url = $config['flexxus']['base_url'].'/v2/auth/login';

        $payload = [
            'username' => $config['flexxus']['username'],
            'password' => $config['flexxus']['password'],
            'deviceinfo' => json_encode($config['flexxus']['deviceinfo']),
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($httpCode === 200 && isset($data['token'])) {
            echo "✅ ¡ÉXITO!\n\n";
            echo 'Token obtenido: '.substr($data['token'], 0, 50)."...\n";

            if (isset($data['user'])) {
                echo "Usuario: {$data['user']['username']}\n";
                echo "Depósito: {$data['user']['warehouse_name']} ({$data['user']['warehouse_id']})\n";
            }

            echo "\n🎉 ¡Licencia obtenida! Ahora puedes ejecutar la prueba completa:\n";
            echo "   php tests/test-picking-flow.php\n\n";

            // Guardar el token para uso futuro
            file_put_contents(__DIR__.'/flexxus_token.txt', $data['token']);
            echo "Token guardado en: flexxus-picking-backend/tests/flexxus_token.txt\n";

            exit(0);
        } elseif (isset($data['message']) && $data['message'] === 'Sin licencias disponibles') {
            echo "⏳ Sin licencias disponibles (esperando 30s...)\n";
        } else {
            echo '⚠️  Error inesperado: '.($data['message'] ?? 'Unknown')."\n";
        }

    } catch (Exception $e) {
        echo '❌ Error: '.$e->getMessage()."\n";
    }

    if ($attempt < $maxAttempts) {
        sleep(30);
    }
}

echo "\n❌ No se pudo obtener una licencia después de {$maxAttempts} intentos\n";
echo "Recomendaciones:\n";
echo "1. Verificar si hay sesiones activas en el panel de Flexxus\n";
echo "2. Contactar a soporte de Flexxus/Procom\n";
echo "3. Esperar un momento y ejecutar este script nuevamente\n";

exit(1);
